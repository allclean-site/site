// Post-build: professional web typography for the static HTML (both locales).
// Runs LAST in the build pipeline (after apply-overrides + translate-ro, so their
// exact-string matching is never confused by the non-breaking spaces added here).
//
// Rules applied to text nodes only (script/style/code/pre/textarea skipped):
//  1. Non-breaking space AFTER short function words (prepositions/conjunctions/particles),
//     so a line never ends with «в», «и», «на», «de», «și»… — RU list on RU pages,
//     RO list under /ro/**.
//  2. Non-breaking space BEFORE an em dash (« — » → « — » with nbsp before), the
//     standard Russian rule — тире не отрывается от предыдущего слова.
//  3. Number + unit glued together (100 м², 45 MDL, 4.8 %, 2 часа…).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const DIST = '.vercel/output/static';
const NBSP = ' ';

// Short function words that must never hang at the end of a line (glued FORWARD, to the
// word they govern). Particles are NOT here — per Kovodstvo/Kontur they attach BACKWARD.
const RU_WORDS = ['и', 'а', 'но', 'да', 'в', 'во', 'не', 'ни', 'на', 'у', 'к', 'ко', 'с', 'со', 'о', 'об', 'обо', 'от', 'ото', 'до', 'по', 'из', 'изо', 'за', 'над', 'под', 'при', 'про', 'для', 'без', 'то', 'что', 'как', 'все', 'мы', 'вы', 'он', 'её', 'его', 'их', 'это'];
const RO_WORDS = ['a', 'ai', 'al', 'ale', 'cu', 'ce', 'cel', 'cea', 'cei', 'de', 'din', 'e', 'în', 'la', 'le', 'nu', 'ne', 'o', 'un', 'pe', 'sa', 'să', 'se', 'și', 'si', 'sau', 'sub', 'mai', 'va', 'vă', 'voi', 'spre', 'prin', 'dar', 'iar', 'fără', 'către', 'este', 'sunt'];
// Particles attach to the PREVIOUS word: «тот же», «Проверяете ли», «хотелось бы».
const RU_PARTICLES = ['же', 'ж', 'ли', 'ль', 'бы', 'б', 'уж'];

const UNITS = '(?:м²|м2|кв\\.?\\s?м|MDL|лей|лея|леев|lei|%|мин|час(?:а|ов)?|ore|oră|min)';

function makeRules(words, opts = {}) {
  // after an opening boundary (start/space/bracket/quote), a listed word, then a plain space
  const alt = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  // Glue only when the NEXT word is reasonably short (≤9 chars): gluing «И» to
  // «СПОКОЙНОМУ» creates an unbreakable run wider than a phone screen in display
  // headings, and a long word starting its own line looks fine anyway.
  const re = new RegExp(`(^|[\\s(«„"'>\\u00A0])(${alt}) (?=\\S{1,9}(?:\\s|$))`, 'gi');
  const partRe = opts.particles
    ? new RegExp(`(\\S) (${opts.particles.join('|')})(?=[\\s.,!?…»)]|$)`, 'gi')
    : null;
  return (s) => {
    let out = s;
    // ---- quotes: «ёлочки» in Russian, „lower-upper” in Romanian (never English curly/straight)
    if (opts.quotes === 'ru') out = out.replace(/[“"]/g, (m, off) => (m === '“' ? '«' : /\S/.test(out[off - 1] || '') ? '»' : '«')).replace(/”/g, '»');
    else if (opts.quotes === 'ro') out = out.replace(/[“"]/g, (m, off) => (m === '“' ? '„' : /\S/.test(out[off - 1] || '') ? '”' : '„')).replace(/”/g, '”');
    // ---- decimal comma (RU/RO standard): 4.8 → 4,8 — digits on both sides only,
    //      so domains (999.md) and version-ish tokens are untouched
    out = out.replace(/(\d)\.(\d)/g, '$1,$2');
    // ---- a spaced hyphen used as a dash → proper em dash glued to the previous word
    out = out.replace(/(\S) - (?=\S)/g, `$1${NBSP}— `);
    // ---- forward glue: prepositions/conjunctions stick to the next word
    // run twice so chains collapse too («и в о доме» → all glued)
    for (let i = 0; i < 2; i++) out = out.replace(re, (_, pre, w) => `${pre}${w}${NBSP}`);
    // ---- backward glue: particles stick to the previous word
    if (partRe) out = out.replace(partRe, (_, prev, w) => `${prev}${NBSP}${w}`);
    // em dash keeps its left neighbour
    out = out.replace(/ —/g, `${NBSP}—`);
    // number + unit
    out = out.replace(new RegExp(`(\\d) (${UNITS})`, 'g'), `$1${NBSP}$2`);
    return out;
  };
}
const fixRu = makeRules(RU_WORDS, { particles: RU_PARTICLES, quotes: 'ru' });
const fixRo = makeRules(RO_WORDS, { quotes: 'ro' });

const SKIP = new Set(['script', 'style', 'noscript', 'code', 'pre', 'textarea', 'svg']);

function walk($, node, fix, stats) {
  for (const child of node.childNodes || []) {
    if (child.type === 'text') {
      const v = child.data;
      if (v && /\S \S/.test(v)) {
        const nv = fix(v);
        if (nv !== v) { child.data = nv; stats.n++; }
      }
    } else if (child.type === 'tag' && !SKIP.has(child.name)) {
      walk($, child, fix, stats);
    }
  }
}

async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(f)));
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}

async function main() {
  let list = [];
  try { list = await files(DIST); } catch { console.log('[typography] no dist, skipping'); return; }
  let pages = 0, repl = 0;
  for (const file of list) {
    const isRo = /[\\/]ro([\\/]|$)/.test(file.replace(DIST, ''));
    const html = await readFile(file, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });
    const stats = { n: 0 };
    walk($, $('body')[0], isRo ? fixRo : fixRu, stats);
    if (stats.n) { await writeFile(file, $.html()); pages++; repl += stats.n; }
  }
  console.log(`[typography] ${repl} node(s) fixed on ${pages} page(s)`);
}

main();
