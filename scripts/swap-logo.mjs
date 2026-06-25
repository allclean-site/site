import { readFileSync, writeFileSync } from 'node:fs';

const p = new URL('../src/components/Header.astro', import.meta.url);
let s = readFileSync(p, 'utf8');

const wordmark =
  '<span class="nav-logo" style="display:inline-flex;align-items:center;gap:.35rem;font-weight:800;font-size:1.45rem;letter-spacing:-.02em;color:#0c2959;white-space:nowrap">' +
  '<span style="color:#537fdd">✦</span> All&nbsp;Clean</span>';

// Replace the multi-line Sparkles logo <img ... class="nav-logo" ... /> with a text wordmark.
const re = /<img[^>]*sparkles-logo\.svg[\s\S]*?class="nav-logo"[\s\S]*?\/>/;
if (re.test(s)) {
  s = s.replace(re, wordmark);
  writeFileSync(p, s);
  console.log('Header logo -> "All Clean" wordmark');
} else {
  console.log('logo img pattern NOT found');
}
