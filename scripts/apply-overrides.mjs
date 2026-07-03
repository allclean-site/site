// Post-build: bake visual-editor overrides into the prerendered static HTML so edits are
// server-rendered and indexable. Runs after `astro build` (see package.json build script).
// Reads page_overrides from Supabase (public read); never fails the build on error.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const SUPABASE_URL = 'https://hbdjboimxqwkzxntidzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HovRZnqMhQiTiM8WC-wjBA_lbTH533G';
// Vercel's adapter copies the final deployed static HTML into .vercel/output/static
// (same flat per-route shape the old Cloudflare `dist/` had) — that's what actually
// ships, so it's what this script must mutate.
const DIST = '.vercel/output/static';
const PROJECT = 'allclean';

// `${DIST}/index.html` -> '/', `${DIST}/about/index.html` -> '/about', `${DIST}/ro/pricing/index.html` -> '/ro/pricing'
function pathFor(file) {
  let p = file.replace(/\\/g, '/').replace(new RegExp(`^${DIST}`), '').replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return p === '' ? '/' : p;
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(f)));
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}

// nbsp-insensitive compare: the typography pass bakes non-breaking spaces into the HTML,
// and editor-saved strings may carry them too — matching must ignore the difference.
const normSpace = (s) => (s || '').replace(/ /g, ' ').trim();

function applyPayload($, p) {
  // plain text leaves
  (p.texts || []).forEach((c) => {
    if (!c.old || c.old === c.new) return;
    const want = normSpace(c.old);
    $('h1,h2,h3,h4,h5,h6,p,a,span,div,li,button,strong,em,blockquote').each((_, el) => {
      const $el = $(el);
      if ($el.children().length === 0 && normSpace($el.text()) === want) $el.text(c.new);
    });
  });
  (p.textsel || []).forEach((c) => { if (c.selector && c.html != null) try { $(c.selector).first().html(c.html); } catch {} });
  (p.links || []).forEach((c) => { if (c.selector) try { $(c.selector).first().attr('href', c.href || ''); } catch {} });
  (p.images || []).forEach((c) => {
    if (!c.url || !c.slot) return;
    try { $(c.slot).first().attr('src', c.url).removeAttr('srcset').removeAttr('sizes'); } catch {}
  });
  (p.backgrounds || []).forEach((c) => {
    if (!c.url || !c.selector) return;
    try {
      const bg = c.css ? c.css.replace('__URL__', c.url) : `url("${c.url}")`;
      const el = $(c.selector).first();
      el.attr('style', (el.attr('style') || '') + `;background-image:${bg};background-size:cover;background-position:center;`);
    } catch {}
  });
  // styles overrides → baked into a <style> block (base rules + @media mobile) appended last in <head>.
  // Inline !important can never be overridden by a media query, so per-breakpoint requires CSS rules.
  {
    const styles = (p.styles || []).filter((c) => c && c.selector && c.styles && Object.keys(c.styles).length);
    if (styles.length) {
      // Dimension props from the BASE bucket were tuned on a desktop viewport; fixed px widths
      // break the template's responsive layout on phones. Bake them desktop-only — mobile keeps
      // the template flow unless explicitly edited in the mobile breakpoint (mq:'m').
      const DIM = new Set(['width', 'max-width', 'grid-template-columns', 'font-size', 'line-height']);
      const rule = (c, keys) => `${c.selector}{${keys.map((k) => `${k}:${c.styles[k]} !important`).join(';')}}`;
      const baseGlobal = [], baseDesk = [];
      styles.filter((c) => c.mq !== 'm').forEach((c) => {
        const keys = Object.keys(c.styles);
        const dim = keys.filter((k) => DIM.has(k));
        const rest = keys.filter((k) => !DIM.has(k));
        if (rest.length) baseGlobal.push(rule(c, rest));
        if (dim.length) baseDesk.push(rule(c, dim));
      });
      const mob = styles.filter((c) => c.mq === 'm').map((c) => rule(c, Object.keys(c.styles))).join('\n');
      let css = baseGlobal.join('\n');
      if (baseDesk.length) css += `\n@media (min-width:768px){\n${baseDesk.join('\n')}\n}`;
      if (mob) css += `\n@media (max-width:767px){\n${mob}\n}`;
      if (css.trim()) { try { $('head').append(`<style id="lg-overrides">\n${css}\n</style>`); } catch {} }
    }
  }
  // Hero media (.video_hero-home etc): either a looping video OR a static photo, keyed by the
  // same selector + a mode flag. Mirrors editor.js's setHeroImage/setHeroVideo exactly, so the
  // editor preview and the published bake never diverge.
  (p.videos || []).forEach((c) => {
    if (!c.selector) return;
    try {
      const cont = $(c.selector).first();
      if (!cont.length) return;
      if (c.mode === 'image' && c.image) {
        cont.find('video').remove();
        cont.find('img[data-lg-hero-img]').remove();
        cont.append(
          `<img data-lg-hero-img="1" src="${c.image}" alt="" style="position:absolute;inset:-100%;margin:auto;width:100%;height:100%;object-fit:cover;z-index:-100"/>`
        );
        cont.removeAttr('data-video-urls');
        cont.removeAttr('data-poster-url');
        return;
      }
      if (!c.mp4) return;
      cont.find('img[data-lg-hero-img]').remove();
      const urls = [c.mp4, c.webm].filter(Boolean).join(',');
      if (urls) cont.attr('data-video-urls', urls);
      if (c.poster) cont.attr('data-poster-url', c.poster);
      let vid = cont.find('video').first();
      if (!vid.length) {
        cont.append('<video autoplay="" loop="" muted="" playsinline="" preload="auto" data-object-fit="cover"></video>');
        vid = cont.find('video').first();
      }
      vid.find('source').remove();
      if (c.mp4) vid.append(`<source src="${c.mp4}" data-wf-ignore="true"/>`);
      if (c.webm) vid.append(`<source src="${c.webm}" data-wf-ignore="true"/>`);
      if (c.poster) vid.attr('poster', c.poster);
    } catch {}
  });
  // Hide (don't physically remove) — mirrors the editor exactly. Physically removing elements shifts the
  // :nth-of-type index of later siblings, which corrupts other nth-of-type selectors (further `removed`
  // entries AND the runtime style rules), making the published page diverge from the editor.
  (p.removed || []).forEach((sel) => { try { $(sel).each((_, el) => { const $el = $(el); $el.attr('style', ($el.attr('style') || '') + ';display:none !important;'); }); } catch {} });
  // block-level (Tilda-style editor): add / reorder / hide whole sections of the main wrapper
  const hasBlocks = (p.added && p.added.length) || (p.blocks && ((p.blocks.order && p.blocks.order.length) || (p.blocks.hidden && p.blocks.hidden.length)));
  if (hasBlocks) {
    try {
      const main = $('main.main-wrapper').first();
      if (main.length) {
        // 1) append user-added blocks (each html is a <section data-lgadd="ID">…)
        (p.added || []).forEach((a) => { if (a && a.html && !main.children('section[data-lgadd="' + a.id + '"]').length) main.append(a.html); });
        // 2) assign stable lgid to ORIGINAL (non-added) sections by current order
        let i = 0; main.children('section').each((_, el) => { if (!$(el).attr('data-lgadd')) $(el).attr('data-lgid', String(i++)); });
        const sel = (id) => id && id.indexOf('add:') === 0 ? 'section[data-lgadd="' + id.slice(4) + '"]' : 'section[data-lgid="' + id + '"]';
        // 3) hide
        (p.blocks && p.blocks.hidden || []).forEach((id) => { const s = main.children(sel(id)); if (s.length) s.attr('style', (s.attr('style') || '') + ';display:none !important;'); });
        // 4) reorder (re-append in saved order)
        (p.blocks && p.blocks.order || []).forEach((id) => { const s = main.children(sel(id)); if (s.length) main.append(s); });
      }
    } catch {}
  }
}

async function main() {
  let rows = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/page_overrides?select=page_path,payload&project=eq.${PROJECT}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (r.ok) rows = await r.json();
  } catch (e) {
    console.log('[apply-overrides] could not fetch overrides, skipping:', e.message);
    return;
  }
  if (!rows.length) { console.log('[apply-overrides] no overrides'); return; }
  const byPath = new Map(rows.map((r) => [r.page_path, r.payload || {}]));

  let files = [];
  console.log(`[apply-overrides] DIST=${DIST}`);
  try { files = await walk(DIST); } catch { console.log(`[apply-overrides] no ${DIST}`); return; }
  let touched = 0;
  for (const file of files) {
    const path = pathFor(file);
    let payload = byPath.get(path);
    // Mirror language-neutral VIDEO overrides from the RU counterpart onto /ro pages,
    // so a hero video set on /services/X (RU) also shows on /ro/services/X.
    if (path === '/ro' || path.startsWith('/ro/')) {
      const ruPath = path.replace(/^\/ro/, '') || '/';
      const ru = byPath.get(ruPath);
      if (ru && Array.isArray(ru.videos) && ru.videos.length) {
        payload = { ...(payload || {}), videos: [ ...((payload && payload.videos) || []), ...ru.videos ] };
      }
    }
    if (!payload) continue;
    try {
      const html = await readFile(file, 'utf8');
      const $ = cheerio.load(html, { decodeEntities: false });
      applyPayload($, payload);
      await writeFile(file, $.html());
      touched++;
      console.log(`[apply-overrides] ${path}`);
    } catch (e) {
      console.log(`[apply-overrides] failed ${path}:`, e.message);
    }
  }
  console.log(`[apply-overrides] done — ${touched} page(s) updated`);
}

main();
