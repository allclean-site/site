export interface FaqItem {
  q: string;
  a: string;
}

// Kept in sync by hand with the visible Q&A text in src/components/FaqContent.astro
// (shared, untranslated markup — RO wording here mirrors scripts/translate-ro.mjs).
// Google ignores/penalizes FAQPage markup that doesn't match visible page text verbatim,
// so any edit to FaqContent.astro's questions/answers must be mirrored here too.
export const faqRu: FaqItem[] = [
  {
    q: 'Что входит в стандартную уборку?',
    a: 'Стандартная уборка включает кухню, санузел, жилые комнаты, полы, удаление пыли и вынос мусора. Этого достаточно, чтобы поддерживать дом в чистоте.',
  },
  {
    q: 'Сколько стоит уборка?',
    a: 'Цена зависит от площади и частоты уборки. Для еженедельных, раз в две недели и ежемесячных планов действуют автоматические скидки.',
  },
  {
    q: 'Сколько длится уборка?',
    a: 'Обычно уборка занимает 2–3 часа в зависимости от площади и состояния. Генеральная уборка — дольше.',
  },
  {
    q: 'Проверяете ли вы клинеров?',
    a: 'Да. Каждый клинер проходит проверку, собеседование и отбор по нашим стандартам качества.',
  },
  {
    q: 'Используете ли вы эко-средства?',
    a: 'Да — все наши средства нетоксичны и безопасны для детей и животных.',
  },
  {
    q: 'Нужно ли давать чаевые?',
    a: 'Чаевые необязательны, но всегда приятны. Вы можете оставить их наличными или картой после уборки.',
  },
  {
    q: 'Можно ли заказывать одного и того же клинера?',
    a: 'Да — при регулярных уборках мы по возможности закрепляем за вами одного клинера.',
  },
  {
    q: 'Нужно ли предоставлять свой инвентарь?',
    a: 'Нет. Клинер приезжает со всем инвентарём и эко-средствами.',
  },
  {
    q: 'Можно ли попросить конкретные средства (например, без запаха)?',
    a: 'Да — просто укажите это в комментарии при бронировании, и мы учтём пожелание.',
  },
  {
    q: 'Моете ли вы внутри духовки, холодильника и шкафов?',
    a: 'Это входит в генеральную уборку. Можно добавить при оформлении заказа.',
  },
  {
    q: 'Моете ли вы окна?',
    a: 'Да — мойка окон изнутри доступна как дополнительная услуга.',
  },
  {
    q: 'Справитесь ли вы с шерстью животных?',
    a: 'Конечно. Наш инвентарь и пылесосы рассчитаны именно на это.',
  },
  {
    q: 'Вы передвигаете мебель?',
    a: 'Мы передвигаем лёгкие предметы, но не тяжёлую мебель — из соображений безопасности.',
  },
  {
    q: 'Моете ли вы посуду и стираете ли бельё?',
    a: 'Лёгкое мытьё посуды включено. Стирка не включена, если не добавлена как дополнительная услуга.',
  },
  {
    q: 'Убираете ли вы после ремонта или строительства?',
    a: 'Да — наша уборка после ремонта включает удаление пыли, чистку поверхностей и полов после работы строителей.',
  },
  {
    q: 'Можно ли заказать разовую уборку?',
    a: 'Да — доступны разовая, регулярная и генеральная уборка.',
  },
  {
    q: 'За сколько нужно бронировать уборку?',
    a: 'Рекомендуем бронировать за 2–3 дня. Иногда есть свободные слоты и на тот же день.',
  },
  {
    q: 'Что делать, если нужно отменить или перенести уборку?',
    a: 'Вы можете перенести или отменить запись бесплатно не позднее чем за 24 часа до визита.',
  },
  {
    q: 'Что если клинер опаздывает?',
    a: 'Если клинер задерживается, мы сразу же вас предупредим и при необходимости скорректируем время.',
  },
  {
    q: 'Что если меня не устроит качество уборки?',
    a: 'Свяжитесь с нами в течение 24 часов — бесплатно отправим клинера повторно, без лишних вопросов.',
  },
  {
    q: 'Нужно ли быть дома во время уборки?',
    a: 'Нет — главное, чтобы у нас был доступ в квартиру. Многие клиенты оставляют ключи консьержу.',
  },
  {
    q: 'Как оплатить уборку?',
    a: 'Оплата происходит безопасно онлайн при бронировании. Наличные не нужны.',
  },
  {
    q: 'Есть ли скидки на регулярную уборку?',
    a: 'Да — при еженедельном, раз в две недели и ежемесячном графике действует автоматическая скидка на каждую уборку.',
  },
];

export const faqRo: FaqItem[] = [
  {
    q: 'Ce include curățenia standard?',
    a: 'Curățenia standard include bucătăria, baia, camerele de locuit, podelele, ștergerea prafului și evacuarea gunoiului. Este suficient pentru a menține locuința curată.',
  },
  {
    q: 'Cât costă curățenia?',
    a: 'Prețul depinde de suprafață și frecvența curățeniei. Pentru planurile săptămânale, la două săptămâni și lunare se aplică reduceri automate.',
  },
  {
    q: 'Cât durează curățenia?',
    a: 'De obicei curățenia durează 2–3 ore, în funcție de suprafață și stare. Curățenia generală durează mai mult.',
  },
  {
    q: 'Verificați curățătorii?',
    a: 'Da. Fiecare curățător trece printr-o verificare, interviu și selecție conform standardelor noastre de calitate.',
  },
  {
    q: 'Folosiți soluții ecologice?',
    a: 'Da — toate soluțiile noastre sunt netoxice și sigure pentru copii și animale.',
  },
  {
    q: 'Trebuie să las bacșiș?',
    a: 'Bacșișul nu este obligatoriu, dar este mereu apreciat. Îl puteți lăsa în numerar sau cu cardul după curățenie.',
  },
  {
    q: 'Pot solicita același curățător?',
    a: 'Da — la curățeniile recurente, încercăm pe cât posibil să vă alocăm același curățător.',
  },
  {
    q: 'Trebuie să furnizez propriul inventar?',
    a: 'Nu. Curățătorul vine cu tot inventarul și soluțiile ecologice.',
  },
  {
    q: 'Pot cere produse specifice (de exemplu, fără miros)?',
    a: 'Da — menționați acest lucru în comentariul de la rezervare și vom ține cont de preferință.',
  },
  {
    q: 'Spălați în interiorul cuptorului, frigiderului și dulapurilor?',
    a: 'Aceasta este inclusă în curățenia generală. Se poate adăuga la plasarea comenzii.',
  },
  {
    q: 'Spălați geamurile?',
    a: 'Da — spălarea geamurilor la interior este disponibilă ca serviciu suplimentar.',
  },
  {
    q: 'Faceți față părului de animale?',
    a: 'Desigur. Inventarul și aspiratoarele noastre sunt concepute exact pentru asta.',
  },
  {
    q: 'Mutați mobila?',
    a: 'Mutăm obiectele ușoare, dar nu mobila grea — din motive de siguranță.',
  },
  {
    q: 'Spălați vasele sau faceți spălătorie?',
    a: 'Spălarea ușoară a vaselor este inclusă. Spălătoria nu este inclusă decât dacă este adăugată ca serviciu suplimentar.',
  },
  {
    q: 'Faceți curățenie după renovare sau construcție?',
    a: 'Da — curățenia noastră post-renovare include îndepărtarea prafului, curățarea suprafețelor și a podelelor după plecarea constructorilor.',
  },
  {
    q: 'Pot comanda o curățenie unică?',
    a: 'Da — sunt disponibile curățenia unică, recurentă și generală.',
  },
  {
    q: 'Cu cât timp înainte trebuie să rezerv curățenia?',
    a: 'Recomandăm rezervarea cu 2–3 zile înainte. Uneori sunt disponibile sloturi chiar în aceeași zi.',
  },
  {
    q: 'Ce fac dacă trebuie să anulez sau să reprogramez curățenia?',
    a: 'Puteți reprograma sau anula gratuit cu cel puțin 24 de ore înainte de vizită.',
  },
  {
    q: 'Ce se întâmplă dacă curățătorul întârzie?',
    a: 'Dacă un curățător întârzie, vă anunțăm imediat și ajustăm ora dacă este necesar.',
  },
  {
    q: 'Ce fac dacă nu sunt mulțumit de calitatea curățeniei?',
    a: 'Contactați-ne în 24 de ore — trimitem gratuit un curățător din nou, fără întrebări.',
  },
  {
    q: 'Trebuie să fiu acasă în timpul curățeniei?',
    a: 'Nu — important este să avem acces în apartament. Mulți clienți lasă cheile la portar.',
  },
  {
    q: 'Cum plătesc curățenia?',
    a: 'Plata se face în siguranță online la rezervare. Nu este nevoie de numerar.',
  },
  {
    q: 'Există reduceri pentru curățenia recurentă?',
    a: 'Da — pentru programul săptămânal, la două săptămâni sau lunar se aplică automat o reducere la fiecare curățenie.',
  },
];

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}
