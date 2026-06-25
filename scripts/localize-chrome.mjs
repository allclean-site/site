import { readFileSync, writeFileSync } from 'node:fs';

const FM = `---
interface Props { lang?: 'ru' | 'ro' }
const { lang = 'ru' } = Astro.props;
const base = lang === 'ro' ? '/ro' : '';
const tt = (ru: string, ro: string) => (lang === 'ro' ? ro : ru);
---
`;

// [englishInnerText, ru, ro] — wrapped as >text<
const labels = [
  ['Services', 'Услуги', 'Servicii'],
  ['About', 'О нас', 'Despre noi'],
  ['Pricing', 'Цены', 'Prețuri'],
  ['Blog', 'Блог', 'Blog'],
  ['FAQ', 'Вопросы', 'Întrebări'],
  ['Book cleaning', 'Записаться', 'Programează'],
  ['Explore all services', 'Все услуги', 'Toate serviciile'],
  ['Pages', 'Страницы', 'Pagini'],
];

for (const name of ['Header', 'Footer']) {
  const p = new URL(`../src/components/${name}.astro`, import.meta.url);
  let s = readFileSync(p, 'utf8');
  // 1) swap frontmatter for a lang-aware one
  s = s.replace(/^---\n[\s\S]*?\n---\n/, FM);
  // 2) make internal links locale-aware (href="/x" -> href={base + "/x"})
  s = s.replace(/href="(\/[^"]*)"/g, 'href={base + "$1"}');
  // 3) translate primary chrome labels
  for (const [en, ru, ro] of labels) {
    s = s.split(`>${en}<`).join(`>{tt(${JSON.stringify(ru)}, ${JSON.stringify(ro)})}<`);
  }
  writeFileSync(p, s);
  console.log(`${name}.astro: localized`);
}
