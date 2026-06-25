import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = new URL('../src/components/', import.meta.url);

// Map the 7 template service slots -> real All Clean categories (RU).
const map = [
  ['Office &amp; Studio Cleaning', 'Уборка офисов и помещений'],
  ['Office & Studio Cleaning', 'Уборка офисов и помещений'],
  ['Move-in / Move-out Cleaning', 'Чистка ковров и ковролина'],
  ['Short-term Rental Cleaning', 'Чистка мягкой мебели'],
  ['Post-Reno Cleaning', 'Уборка после ремонта'],
  ['Window Cleaning', 'Мойка окон и фасадов'],
  ['Deep Cleaning', 'Генеральная уборка'],
  ['Home Cleaning', 'Уборка квартир и домов'],
  // section labels / headings
  ['Licensed NYC cleaning service', 'Клининговая компания в Кишинёве'],
  ['CLEANING SERVICES BUILT FOR NYC HOMES', 'УСЛУГИ УБОРКИ ДЛЯ ДОМА И БИЗНЕСА В КИШИНЁВЕ'],
  ['Choose the service that fits your space, schedule, and lifestyle.', 'Выберите услугу под ваше пространство, график и задачи.'],
  ["These are our most popular cleaning options. If your home needs something extra, we've got you covered.", 'Самые популярные услуги уборки. Нужно что-то особенное — подберём решение под вас.'],
  ['These are our most popular cleaning options. If your home needs something extra, we’ve got you covered.', 'Самые популярные услуги уборки. Нужно что-то особенное — подберём решение под вас.'],
  ['Explore all services', 'Все услуги'],
  ['EXPLORE ALL SERVICES', 'ВСЕ УСЛУГИ'],
];

// Skip blog placeholders (their prose handled separately).
const skip = new Set(['BlogContent.astro', 'BlogPostContent.astro']);
let total = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.astro'))) {
  if (skip.has(file)) continue;
  const p = new URL(file, dir);
  let s = readFileSync(p, 'utf8');
  const before = s;
  for (const [from, to] of map) s = s.split(from).join(to);
  if (s !== before) { writeFileSync(p, s); total++; console.log(`${file}: services text updated`); }
}
console.log(`done — ${total} files`);
