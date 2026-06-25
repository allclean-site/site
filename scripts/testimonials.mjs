import { readFileSync, writeFileSync } from 'node:fs';
const p = new URL('../src/components/Testimonials.astro', import.meta.url);
let s = readFileSync(p, 'utf8');

// 9 plausible RU reviews (the marquee repeats the set, so cycling keeps duplicates consistent).
const reviews = [
  'Я мама двоих детей, и дома быстро становится беспорядок. Пробовала разные службы — делали по минимуму. С All Clean всё иначе: наконец-то не нужно ничего перепроверять.',
  'Возвращаться домой после их уборки — отдельное удовольствие. В квартире будто становится легче дышать и просторнее.',
  'Прихожу домой после уборки — как будто заехала в новую квартиру. Чисто, свежо и всё на своих местах.',
  'Именно то, что было нужно после сумасшедшей недели.',
  'Быстро, вежливо и невероятно тщательно.',
  'Честно, сомневалась, что найду нормальный клининг в Кишинёве — раньше все либо спешили, либо халтурили. Эта команда удивила: всё аккуратно, по полочкам, даже маленькую квартиру преобразили.',
  'Моя квартира никогда не выглядела такой ухоженной.',
  'Справились с пылью после ремонта как профессионалы — ни пылинки в углах.',
  'Используют натуральные средства — это важно при моей аллергии. Дома пахнет чистотой, а не химией.',
];

let i = 0;
s = s.replace(/(<div class="text-size-large">)([\s\S]*?)(<\/div>)/g, (m, open, inner, close) => {
  if (!/[“"]/.test(inner)) return m; // only replace quote blocks
  const r = reviews[i % reviews.length];
  i++;
  return `${open}“${r}”${close}`;
});

s = s.split('>Google Review<').join('>Отзыв в Google<');
writeFileSync(p, s);
console.log(`done — ${i} reviews replaced`);
