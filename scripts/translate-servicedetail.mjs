import { readFileSync, writeFileSync } from 'node:fs';
const p = new URL('../src/components/ServiceDetailContent.astro', import.meta.url);
let s = readFileSync(p, 'utf8');
function rx(en) {
  let q = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/['’‘]/g, "['’‘]").replace(/[—–-]/g, '[—–-]').replace(/\s+/g, '\\s+');
  return new RegExp(q, 'g');
}
const map = [
  ['A clean window changes the entire atmosphere of your home.', 'Чистые окна меняют атмосферу всего дома.'],
  ['Inside glass cleaning', 'Мойка стёкол изнутри'],
  ['Reachable outside glass cleaning', 'Мойка стёкол снаружи в зоне доступа'],
  ['Removing smudges, streaks, pollen, dust, pet nose marks', 'Удаляем разводы, подтёки, пыльцу, пыль и следы'],
  ['Final lint-free polish', 'Финальная полировка без разводов и ворса'],
  ['Full Track Deep-Clean', 'Глубокая чистка рам и направляющих'],
  ['Screens Cleaning', 'Чистка москитных сеток'],
  ['Balcony / Terrace Glass Panels', 'Остекление балконов и террас'],
  ['For apartments with outdoor space that gets hit by wind, rain, or pigeons.', 'Для квартир с балконом или террасой, где стёкла страдают от ветра, дождя и пыли.'],
  ['French Windows / Multi-Pane Windows', 'Панорамные и многостворчатые окна'],
  ['Move-Out Shine', 'Блеск при переезде'],
  ['Perfect for landlords, inspections, and getting that deposit back.', 'Идеально для собственников, проверок и возврата залога.'],
  ['Recurring? Even easier', 'Регулярно? Ещё проще'],
  ['Why New Yorkers choose us', 'Почему выбирают нас'],
  ['Can I book a one-time cleaning?', 'Можно ли заказать разовую уборку?'],
  ['How far in advance should I book?', 'За сколько времени лучше записываться?'],
  ['What if I need to cancel or reschedule?', 'Что если нужно отменить или перенести?'],
  ['Our doors open at 8:00 AM, and we welcome arrivals until 9:00 AM. We start the day calmly, so there’s no rush — we know mornings can be a little chaotic.', 'Запишитесь онлайн за минуту или позвоните нам — подберём удобную дату и время. Нужно перенести или отменить? Просто предупредите заранее, это бесплатно.'],
  ['Don’t wait until your place gets overwhelming.', 'Не ждите, пока дома накопится беспорядок.'],
  ['Cleaners available this week.', 'Есть свободные мастера на этой неделе.'],
  ['Book cleaning', 'Записаться'],
  ['This section exists to help the page rank better on Google for NYC apartment cleaning, home cleaning checklists, and room-by-room cleaning tips — while still giving readers useful, honest guidance.', 'Здесь мы делимся честными и полезными советами по уборке квартир и домов в Кишинёве — чек-листами и рекомендациями по комнатам.'],
];
let hits = 0;
for (const [en, ru] of map) s = s.replace(rx(en), () => { hits++; return ru; });
writeFileSync(p, s);
console.log(`done — ${hits} replacements`);
