// Post-build: bake visual-editor overrides into the prerendered static HTML so edits are
// server-rendered and indexable. Runs after `astro build` (see package.json build script).
// Reads page_overrides from Supabase (public read); never fails the build on error.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const SUPABASE_URL = 'https://hbdjboimxqwkzxntidzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HovRZnqMhQiTiM8WC-wjBA_lbTH533G';
const DIST = 'dist';
const PROJECT = 'allclean';

// dist/index.html -> '/', dist/about/index.html -> '/about', dist/ro/pricing/index.html -> '/ro/pricing'
function pathFor(file) {
  let p = file.replace(/\\/g, '/').replace(/^dist/, '').replace(/\/index\.html$/, '').replace(/\.html$/, '');
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

function applyPayload($, p) {
  // plain text leaves
  (p.texts || []).forEach((c) => {
    if (!c.old || c.old === c.new) return;
    $('h1,h2,h3,h4,h5,h6,p,a,span,div,li,button,strong,em,blockquote').each((_, el) => {
      const $el = $(el);
      if ($el.children().length === 0 && $el.text().trim() === c.old) $el.text(c.new);
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
  (p.styles || []).forEach((c) => {
    if (!c.selector || !c.styles) return;
    try {
      $(c.selector).each((_, el) => {
        const $el = $(el);
        let st = $el.attr('style') || '';
        for (const k of Object.keys(c.styles)) st += `;${k}:${c.styles[k]} !important;`;
        $el.attr('style', st);
      });
    } catch {}
  });
  (p.videos || []).forEach((c) => {
    if (!c.selector || !c.mp4) return;
    try {
      const cont = $(c.selector).first();
      if (!cont.length) return;
      const urls = [c.mp4, c.webm].filter(Boolean).join(',');
      if (urls) cont.attr('data-video-urls', urls);
      if (c.poster) cont.attr('data-poster-url', c.poster);
      const vid = cont.find('video').first();
      if (vid.length) {
        vid.find('source').remove();
        if (c.mp4) vid.append(`<source src="${c.mp4}" data-wf-ignore="true"/>`);
        if (c.webm) vid.append(`<source src="${c.webm}" data-wf-ignore="true"/>`);
        if (c.poster) vid.attr('poster', c.poster);
      }
    } catch {}
  });
  (p.removed || []).forEach((sel) => { try { $(sel).remove(); } catch {} });
  // block-level: reorder / hide whole sections of the main wrapper (Tilda-style editor)
  if (p.blocks && ((p.blocks.order && p.blocks.order.length) || (p.blocks.hidden && p.blocks.hidden.length))) {
    try {
      const main = $('main.main-wrapper').first();
      if (main.length) {
        main.children('section').each((i, el) => $(el).attr('data-lgid', String(i)));
        (p.blocks.hidden || []).forEach((id) => {
          const s = main.children('section[data-lgid="' + id + '"]');
          if (s.length) s.attr('style', (s.attr('style') || '') + ';display:none !important;');
        });
        (p.blocks.order || []).forEach((id) => {
          const s = main.children('section[data-lgid="' + id + '"]');
          if (s.length) main.append(s); // re-append in saved order
        });
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
  try { files = await walk(DIST); } catch { console.log('[apply-overrides] no dist'); return; }
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
