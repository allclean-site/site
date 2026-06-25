import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dir = new URL('../src/components/', import.meta.url);
function rx(en) {
  let p = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/['’‘]/g, "['’‘]").replace(/[—–-]/g, '[—–-]').replace(/\s+/g, '\\s+');
  return new RegExp(p, 'g');
}
const map = [
  // FAQ page
  ['Find answers to the most common questions about pricing, cleaning services, and bookings.', 'Ответы на частые вопросы о ценах, услугах и записи.'],
  ['ANSWERS TO YOUR QUESTIONS', 'ОТВЕТЫ НА ВАШИ ВОПРОСЫ'],
  ['How long does a cleaning take?', 'Сколько длится уборка?'],
  ['Is tipping required?', 'Нужно ли давать чаевые?'],
  ['Do I need to provide any supplies?', 'Нужно ли предоставлять свой инвентарь?'],
  ['No. Your cleaner arrives fully equipped with all tools and eco-friendly products.', 'Нет. Клинер приезжает со всем инвентарём и эко-средствами.'],
  ['Do you clean inside the oven, fridge, or cabinets?', 'Моете ли вы внутри духовки, холодильника и шкафов?'],
  ['These are part of our deep cleaning service. You can add them during checkout.', 'Это входит в генеральную уборку. Можно добавить при оформлении заказа.'],
  ['Do you clean windows?', 'Моете ли вы окна?'],
  ['Yes — interior window cleaning is available as an add-on.', 'Да — мойка окон изнутри доступна как дополнительная услуга.'],
  ['Can you handle pet hair?', 'Справитесь ли вы с шерстью животных?'],
  ['Absolutely. Our tools and vacuums are designed exactly for that.', 'Конечно. Наш инвентарь и пылесосы рассчитаны именно на это.'],
  // About page
  ['CLEAN HOMES. CLEAR MINDS. NYC CLEANING DONE BY HUMANS WHO CARE.', 'ЧИСТЫЙ ДОМ. СПОКОЙСТВИЕ. УБОРКА В КИШИНЁВЕ ОТ ЛЮДЕЙ, КОТОРЫМ НЕ ВСЁ РАВНО.'],
  ['We’re the cleaning team built for busy New Yorkers — the people juggling work, family, pets, elevators, walk-ups, deadlines, and everything in between.', 'Мы — команда уборки для занятых жителей Кишинёва: тех, кто совмещает работу, семью, питомцев, дедлайны и всё остальное.'],
  ['We’re not a huge franchise.', 'Мы не огромная франшиза.'],
  ['We’re a trained, vetted, friendly team.', 'Мы — обученная, проверенная и дружная команда.'],
  ['Fully compliant with local regulations — because trust begins with doing things right.', 'Полное соответствие местным требованиям — потому что доверие начинается с честной работы.'],
  ['Real, recurring clients', 'Реальные постоянные клиенты'],
  ['Thoughtful cleaning, not rushed cleaning', 'Вдумчивая уборка, а не впопыхах'],
  ['We train our cleaners to slow down, be careful, and actually notice what a home needs.', 'Мы учим клинеров не спешить, быть аккуратными и замечать, что действительно нужно дому.'],
  ['Eco-friendly products', 'Эко-средства'],
  ['Safe for pets, kids, plants, and people. Your home should smell clean, not chemically.', 'Безопасны для животных, детей, растений и людей. Дом должен пахнуть чистотой, а не химией.'],
  // Book page
  ['Book a trusted, background-checked cleaner who actually shows up, cares, and leaves your home feeling fresh.', 'Закажите проверенного клинера, который действительно приезжает, заботится и оставляет дом свежим.'],
  ['Book online in 60 seconds', 'Запишитесь онлайн за 60 секунд'],
  ['For people who prefer instant booking.', 'Для тех, кто любит мгновенную запись.'],
  ['Service type', 'Тип услуги'],
  ['Number of bedrooms', 'Количество комнат'],
  ['We confirm every request by phone or text. No hidden fees — ever.', 'Мы подтверждаем каждую заявку по телефону или в сообщении. Никаких скрытых платежей.'],
  ['Submit Booking Request', 'Отправить заявку'],
  ['Oops! Something went wrong while submitting the form.', 'Упс! Не удалось отправить форму.'],
  ['Prefer to talk?', 'Удобнее позвонить?'],
  ['NYC cleaners you can trust', 'Клинеры в Кишинёве, которым можно доверять'],
  ['Every cleaner is vetted, background-checked, and insured.', 'Каждый клинер проверен и застрахован.'],
  ['See your price before we start. No surprises.', 'Вы видите цену до начала работы. Без сюрпризов.'],
  ['We bring everything — eco-friendly and pet-safe.', 'Привозим всё необходимое — экологично и безопасно для питомцев.'],
  ['Maria Kowalski', 'Мария Войку'],
  // Services page card descriptions
  ['A reliable top-to-bottom clean for everyday living. Kitchens, bathrooms, bedrooms — all covered.', 'Надёжная уборка сверху донизу для повседневной жизни. Кухня, санузел, комнаты — всё включено.'],
  ['We remove construction dust from every corner so your home actually feels new, not just finished.', 'Убираем строительную пыль из каждого угла, чтобы дом действительно ощущался новым.'],
  ['Deep, landlord-approved cleaning for empty apartments — perfect before handing over keys or moving into a fresh space.', 'Тщательная уборка пустых квартир — идеально перед сдачей ключей или заездом в новое жильё.'],
  ['Turnover-ready cleaning for Airbnb hosts: fresh linens, trash removal, restocking basics, and guest-ready presentation.', 'Уборка для аренды посуточно: свежее бельё, вынос мусора, пополнение базовых принадлежностей и готовность к гостям.'],
  ['For small NYC offices, creative studios, and co-working spaces. Desks, kitchens, bathrooms, and common areas — spotless and ready for the week.', 'Для небольших офисов, студий и коворкингов. Столы, кухни, санузлы и общие зоны — чисто и готово к рабочей неделе.'],
];
const skip = new Set(['BlogContent.astro', 'BlogPostContent.astro']);
let total = 0, hits = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.astro'))) {
  if (skip.has(file)) continue;
  const p = new URL(file, dir);
  let s = readFileSync(p, 'utf8');
  const before = s;
  for (const [en, ru] of map) s = s.replace(rx(en), () => { hits++; return ru; });
  if (s !== before) { writeFileSync(p, s); total++; }
}
console.log(`done — ${total} files, ${hits} replacements`);
