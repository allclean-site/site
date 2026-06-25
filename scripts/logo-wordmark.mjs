import { readFileSync, writeFileSync } from 'node:fs';

const p = new URL('../src/components/Header.astro', import.meta.url);
let s = readFileSync(p, 'utf8');

// Recreated "all clean" wordmark (bold lowercase navy + spaced tagline),
// matching the supplied logo image.
const logo =
  '<span class="nav-logo" aria-label="All Clean" ' +
  'style="display:inline-flex;flex-direction:column;justify-content:center;line-height:.92;' +
  "color:#0c2959;font-family:Arial,'Helvetica Neue',sans-serif;white-space:nowrap\">" +
  '<span style="font-weight:800;font-size:1.7rem;letter-spacing:-.01em">all clean</span>' +
  '<span style="font-size:.44rem;letter-spacing:.2em;font-weight:700;margin-top:.18rem">PROFESSIONAL CLEANING COMPANY</span>' +
  '</span>';

// Replace whichever wordmark is currently present.
const re = /<span class="nav-logo"[\s\S]*?All(&nbsp;| )Clean<\/span>|<span class="nav-logo" aria-label="All Clean"[\s\S]*?PROFESSIONAL CLEANING COMPANY<\/span><\/span>/;
if (re.test(s)) {
  s = s.replace(re, logo);
  writeFileSync(p, s);
  console.log('logo wordmark updated');
} else {
  console.log('no existing wordmark found');
}
