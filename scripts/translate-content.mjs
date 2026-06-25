import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = new URL('../src/components/', import.meta.url);

// Build a whitespace/quote/dash-flexible regex from an English phrase,
// so it matches even when prettier wrapped it across lines.
function rx(en) {
  let p = en
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/['’‘]/g, "['’‘]")
    .replace(/[—–-]/g, '[—–-]')
    .replace(/\s+/g, '\\s+');
  return new RegExp(p, 'g');
}

const map = [
  // Banner (Header)
  ['4 available slots this week', '4 свободных слота на этой неделе'],
  ['Book before they’re gone', 'Успейте записаться'],
  // Hero ratings + support tiles
  ['4.9 on Gondle', '4.9 в Google'],
  ['4.8 on Yalr', '4.8 на Facebook'],
  // Features
  ['Clear, upfront pricing', 'Прозрачные цены'],
  ['No hidden fees. You see the price before we start.', 'Никаких скрытых платежей. Вы видите цену до начала работы.'],
  ['Every cleaner is vetted, background-checked and insured.', 'Каждый клинер проверен, с подтверждённой репутацией и застрахован.'],
  ['Natural products', 'Натуральные средства'],
  ['Eco-friendly and safe for children and pets.', 'Экологичны и безопасны для детей и животных.'],
  ['Fully equipped', 'Полная экипировка'],
  ['We bring all supplies and tools — you don’t need to prepare anything.', 'Привозим все средства и инвентарь — вам не нужно ничего готовить.'],
  // HowItWorks
  ['See exactly how your cleaning is handled, step by step — simple, quick, and built to make your life easier.', 'Показываем, как проходит уборка, шаг за шагом — просто, быстро и удобно для вас.'],
  ['Pick your date and time in less than 60 seconds.', 'Выберите дату и время меньше чем за 60 секунд.'],
  ['We arrive fully equipped', 'Приезжаем со всем необходимым'],
  ['Your cleaner brings all tools and eco-friendly products.', 'Клинер привозит весь инвентарь и эко-средства.'],
  ['Enjoy your refreshed home', 'Наслаждайтесь чистым домом'],
  ['Everything cleaned, reset and put in place — exactly how you want it.', 'Всё убрано и разложено по местам — именно так, как вы хотите.'],
  ['Book your cleaning', 'Запишитесь на уборку'],
  // AboutSection
  ['Our cleaners are fully vetted, trained and insured. You’ll always know who’s coming to your home.', 'Наши клинеры проверены, обучены и застрахованы. Вы всегда знаете, кто придёт к вам домой.'],
  // CtaSection
  ['Book trusted cleaners who actually show up, care, and leave your place feeling fresh.', 'Закажите клинеров, которые действительно приезжают, заботятся и оставляют дом идеально чистым.'],
  // FeaturesBottom
  ['Top Rated 2025', 'Лучший сервис 2025'],
  ['1,200+ recurring clients', '1200+ постоянных клиентов'],
  ['Across Manhattan, Brooklyn & Queens', 'По всему Кишинёву и пригородам'],
  ['Across Manhattan, Brooklyn &amp; Queens', 'По всему Кишинёву и пригородам'],
  ['Recognized by Cleaners NYC Awards', 'Доверие клиентов и партнёров'],
  ['Fully compliant with local regulations.', 'Полное соответствие местным требованиям.'],
  // FAQ (home + page share wording)
  ['What’s included in a standard cleaning?', 'Что входит в стандартную уборку?'],
  ['A standard cleaning covers your kitchen, bathroom, living areas, floors, dusting, and trash removal. It’s designed to keep your home fresh and tidy.', 'Стандартная уборка включает кухню, санузел, жилые комнаты, полы, удаление пыли и вынос мусора. Этого достаточно, чтобы поддерживать дом в чистоте.'],
  ['How much does a cleaning cost?', 'Сколько стоит уборка?'],
  ['Pricing depends on your home size and how often you want us to clean. Weekly, bi-weekly, and monthly plans include automatic discounts.', 'Цена зависит от площади и частоты уборки. Для еженедельных, раз в две недели и ежемесячных планов действуют автоматические скидки.'],
  ['Most cleanings take 2–3 hours depending on the home size and condition. Deep cleanings take longer.', 'Обычно уборка занимает 2–3 часа в зависимости от площади и состояния. Генеральная уборка — дольше.'],
  ['Are cleaners background-checked?', 'Проверяете ли вы клинеров?'],
  ['Yes. Every cleaner is background-checked, interviewed, and vetted to meet NYC regulations.', 'Да. Каждый клинер проходит проверку, собеседование и отбор по нашим стандартам качества.'],
  ['Do you use eco-friendly products?', 'Используете ли вы эко-средства?'],
  ['Yes — everything we bring is non-toxic and safe for kids and pets.', 'Да — все наши средства нетоксичны и безопасны для детей и животных.'],
  ['Can I request the same cleaner every time?', 'Можно ли заказывать одного и того же клинера?'],
  ['Yes — if you book recurring cleanings we’ll assign the same cleaner whenever possible.', 'Да — при регулярных уборках мы по возможности закрепляем за вами одного клинера.'],
  // Testimonials labels
  ['Show all reviews', 'Все отзывы'],
];

const skip = new Set(['BlogContent.astro', 'BlogPostContent.astro']);
let total = 0, hits = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.astro'))) {
  if (skip.has(file)) continue;
  const p = new URL(file, dir);
  let s = readFileSync(p, 'utf8');
  const before = s;
  for (const [en, ru] of map) {
    s = s.replace(rx(en), () => { hits++; return ru; });
  }
  if (s !== before) { writeFileSync(p, s); total++; }
}
console.log(`done — ${total} files, ${hits} replacements`);
