import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dir = new URL('../src/components/', import.meta.url);
function rx(en) {
  let p = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/['’‘]/g, "['’‘]").replace(/[—–-]/g, '[—–-]').replace(/\s+/g, '\\s+');
  return new RegExp(p, 'g');
}
const map = [
  ['New York, NY 10075', 'Кишинёв, MD-2069'],   // wrapped footer address
  ['NYC Licensed &amp; Insured', 'Лицензия и страховка'],
  ['NYC Licensed & Insured', 'Лицензия и страховка'],
];
let total = 0, hits = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.astro'))) {
  const p = new URL(file, dir);
  let s = readFileSync(p, 'utf8');
  const before = s;
  for (const [en, ru] of map) s = s.replace(rx(en), () => { hits++; return ru; });
  if (s !== before) { writeFileSync(p, s); total++; }
}
console.log(`done — ${total} files, ${hits} replacements`);
