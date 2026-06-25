import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = new URL('../src/components/', import.meta.url);
// Order matters: more specific first.
const reps = [
  ['hi@sparkles.byq', 'info@allclean.md'],
  ['123 East 77th Street', 'ул. Месаджер, 7'],
  ['New York, NY 10075', 'Кишинёв, MD-2069'],
  ['Sparkles NYC', 'All Clean'],
  ['(212) 555-0198', '+373 79 955 044'],
  ['Sparkles', 'All Clean'],
];

let total = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.astro'))) {
  const p = new URL(file, dir);
  let s = readFileSync(p, 'utf8');
  let n = 0;
  for (const [from, to] of reps) {
    const before = s;
    s = s.split(from).join(to);
    n += (before.length !== s.length) ? 1 : 0;
  }
  if (n) { writeFileSync(p, s); total++; console.log(`${file}: updated`); }
}
console.log(`done — ${total} files changed`);
