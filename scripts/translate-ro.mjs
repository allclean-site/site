// Post-build: translate remaining Russian (Cyrillic) leaf text on /ro pages → Romanian.
// Runs after apply-overrides. Only touches DIST/ro/**. Matches by whitespace-normalized leaf text.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

// Vercel's adapter copies the final deployed static HTML into .vercel/output/static
// (same flat per-route shape the old Cloudflare `dist/` had) — that's what actually
// ships, so it's what this script must mutate.
const DIST = '.vercel/output/static';

const norm = (s) => s.replace(/\s+/g, ' ').trim();

// RU (normalized) -> RO
const MAP = {
  'Выберите подходящую услугу и планируйте свои дела, не думая о чистоте.': 'Alegeți serviciul potrivit și planificați-vă timpul fără să vă gândiți la curățenie.',
  'Мойка окон и фасадов': 'Spălarea geamurilor și fațadelor',
  'Уборка квартир и домов': 'Curățenie apartamente și case',
  'Генеральная уборка': 'Curățenie generală',
  'Уборка после ремонта': 'Curățenie după renovare',
  'Чистка ковров и ковролина': 'Curățare covoare și mochetă',
  'Чистка мягкой мебели': 'Curățare mobilă tapițată',
  'Записаться': 'Programează',
  'Телефон': 'Telefon',
  'Отзыв в Google': 'Recenzie pe Google',
  'Запишитесь на уборку': 'Programați o curățenie',
  'Уборка офисов и помещений': 'Curățenie birouri și spații',
  '4 свободных слота на этой неделе': '4 locuri libere săptămâna aceasta',
  'Успейте записаться': 'Programați-vă acum',
  'услуги': 'servicii',
  'Лицензия и страховка': 'Licență și asigurare',
  'Адрес': 'Adresă',
  'Уборка офисов': 'Curățenie birouri',
  'Реставрация полов': 'Restaurare pardoseli',
  'Смотреть цены': 'Vezi prețurile',
  'Полное соответствие местным требованиям.': 'Conformitate deplină cu cerințele locale.',
  '1200+ постоянных клиентов': '1200+ clienți permanenți',
  'По всему Кишинёву и пригородам.': 'În tot Chișinăul și suburbiile.',
  'Лучший сервис 2025': 'Cel mai bun serviciu 2025',
  'Доверие клиентов и партнёров': 'Încrederea clienților și partenerilor',
  'ГОТОВЫ К ЧИСТОМУ И СПОКОЙНОМУ ДОМУ?': 'GATA PENTRU O CASĂ CURATĂ ȘI LINIȘTITĂ?',
  'Закажите клинеров, которые действительно приезжают, заботятся и оставляют дом идеально чистым.': 'Comandați curățători care chiar vin, au grijă și lasă casa impecabil de curată.',
  'О нас': 'Despre noi',
  '4.9 в Google': '4.9 pe Google',
  '4.8 на Facebook': '4.8 pe Facebook',
  'Rated 4.8 на Facebook': '4.8 pe Facebook',
  'Написать': 'Scrie',
  'Прозрачные цены': 'Prețuri transparente',
  'Записаться на уборку': 'Programează o curățenie',
  'ЧЕМ МЫ ОТЛИЧАЕМСЯ': 'CE NE DEOSEBEȘTE',
  'СЕРВИС ДЛЯ ЗАНЯТЫХ ЖИТЕЛЕЙ КИШИНЁВА': 'SERVICIU PENTRU LOCUITORII OCUPAȚI DIN CHIȘINĂU',
  'Никаких скрытых платежей. Вы видите цену до начала работы.': 'Fără plăți ascunse. Vedeți prețul înainte de începerea lucrului.',
  'Каждый клинер проверен, с подтверждённой репутацией и застрахован.': 'Fiecare curățător este verificat, cu reputație confirmată și asigurat.',
  'Натуральные средства': 'Soluții naturale',
  'Экологичны и безопасны для детей и животных.': 'Ecologice și sigure pentru copii și animale.',
  'Полная экипировка': 'Echipament complet',
  'Полная экипировка team': 'Echipament complet',
  'Привозим все средства и инвентарь — вам не нужно ничего готовить.': 'Aducem toate soluțiile și inventarul — nu trebuie să pregătiți nimic.',
  'КАК МЫ РАБОТАЕМ': 'CUM LUCRĂM',
  'Показываем, как проходит уборка, шаг за шагом — просто, быстро и удобно для вас.': 'Vă arătăm cum decurge curățenia, pas cu pas — simplu, rapid și comod pentru dvs.',
  'Выберите дату и время меньше чем за 60 секунд.': 'Alegeți data și ora în mai puțin de 60 de secunde.',
  'Приезжаем со всем необходимым': 'Venim cu tot ce este necesar',
  'Клинер привозит весь инвентарь и эко-средства.': 'Curățătorul aduce tot inventarul și soluțiile ecologice.',
  'Наслаждайтесь чистым домом': 'Bucurați-vă de o casă curată',
  'Всё убрано и разложено по местам — именно так, как вы хотите.': 'Totul curat și aranjat la locul lui — exact așa cum doriți.',
  'Регулярно? Ещё проще': 'Regulat? Și mai simplu',
  'Закрепляем за вами одного клинера.': 'Vă alocăm același curățător.',
  'Наша команда': 'Echipa noastră',
  'Наши клинеры проверены, обучены и застрахованы. Вы всегда знаете, кто придёт к вам домой.': 'Curățătorii noștri sunt verificați, instruiți și asigurați. Știți mereu cine vine la dvs. acasă.',
  'Подробнее': 'Detalii',
  '1 комната': '1 cameră',
  '2 комнаты': '2 camere',
  '3 комнаты': '3 camere',
  'Уборка одной комнаты, кухни, коридора и санузла.': 'Curățenia unei camere, bucătăriei, holului și băii.',
  'Уборка двух комнат, кухни, коридора и санузла.': 'Curățenia a două camere, bucătăriei, holului și băii.',
  'Уборка трёх комнат, кухни, коридора и санузла.': 'Curățenia a trei camere, bucătăriei, holului și băii.',
  'Вопросы': 'Întrebări',
  'ОТВЕТЫ НА ВАШИ ВОПРОСЫ': 'RĂSPUNSURI LA ÎNTREBĂRILE DVS.',
  'Что входит в стандартную уборку?': 'Ce include curățenia standard?',
  'Стандартная уборка включает кухню, санузел, жилые комнаты, полы, удаление пыли и вынос мусора. Этого достаточно, чтобы поддерживать дом в чистоте.': 'Curățenia standard include bucătăria, baia, camerele de zi, pardoselile, ștergerea prafului și evacuarea gunoiului. Este suficient pentru a menține casa curată.',
  'Сколько стоит уборка?': 'Cât costă curățenia?',
  'Цена зависит от площади и частоты уборки. Для еженедельных, раз в две недели и ежемесячных планов действуют автоматические скидки.': 'Prețul depinde de suprafață și frecvența curățeniei. Pentru planurile săptămânale, la două săptămâni și lunare se aplică reduceri automate.',
  'Обычно уборка занимает 2–3 часа в зависимости от площади и состояния. Генеральная уборка — дольше.': 'De obicei curățenia durează 2–3 ore, în funcție de suprafață și stare. Curățenia generală durează mai mult.',
  'Проверяете ли вы клинеров?': 'Verificați curățătorii?',
  'Да. Каждый клинер проходит проверку, собеседование и отбор по нашим стандартам качества.': 'Da. Fiecare curățător trece prin verificare, interviu și selecție conform standardelor noastre de calitate.',
  'Используете ли вы эко-средства?': 'Folosiți soluții ecologice?',
  'Да — все наши средства нетоксичны и безопасны для детей и животных.': 'Da — toate soluțiile noastre sunt netoxice și sigure pentru copii și animale.',
  'Можно ли заказывать одного и того же клинера?': 'Pot solicita același curățător?',
  'Да — при регулярных уборках мы по возможности закрепляем за вами одного клинера.': 'Da — la curățeniile regulate vă alocăm, pe cât posibil, același curățător.',
  'Мария Войку': 'Maria Voicu',
  'Мария В.': 'Maria V.',
  'Вариант 1': 'Varianta 1',
  'Вариант 2': 'Varianta 2',
  'Вариант 3': 'Varianta 3',
  'КИШИНЁВЕ': 'CHIȘINĂU',
  'ЧОКАНЕ': 'CIOCANA',
  'БОТАНИКЕ': 'BOTANICA',
  'РЫШКАНОВКЕ': 'RÂȘCANI',
  'УБОРКА': 'CURĂȚENIE',
  'ДЛЯ': 'PENTRU',
  'ЗАНЯТЫХ': 'OAMENI',
  'ЛЮДЕЙ': 'OCUPAȚI',
  'В': 'DIN',
  '“Я мама двоих детей, и дома быстро становится беспорядок. Пробовала разные службы — делали по минимуму. С All Clean всё иначе: наконец-то не нужно ничего перепроверять.”': '„Sunt mamă a doi copii, iar acasă devine repede dezordine. Am încercat diferite firme — făceau minimul. Cu All Clean e altfel: în sfârșit nu trebuie să verific nimic.”',
  '“Возвращаться домой после их уборки — отдельное удовольствие. В квартире будто становится легче дышать и просторнее.”': '„Să mă întorc acasă după curățenia lor e o plăcere aparte. În apartament parcă se respiră mai ușor și pare mai spațios.”',
  '“Прихожу домой после уборки — как будто заехала в новую квартиру. Чисто, свежо и всё на своих местах.”': '„Vin acasă după curățenie — parcă m-am mutat într-un apartament nou. Curat, proaspăt și totul la locul lui.”',
  '“Именно то, что было нужно после сумасшедшей недели.”': '„Exact ce aveam nevoie după o săptămână nebună.”',
  '“Быстро, вежливо и невероятно тщательно.”': '„Rapid, politicos și incredibil de meticulos.”',
  '“Честно, сомневалась, что найду нормальный клининг в Кишинёве — раньше все либо спешили, либо халтурили. Эта команда удивила: всё аккуратно, по полочкам, даже маленькую квартиру преобразили.”': '„Sincer, mă îndoiam că găsesc o firmă bună de curățenie în Chișinău — înainte toți ori se grăbeau, ori făceau de mântuială. Echipa m-a surprins: totul ordonat, chiar și un apartament mic l-au transformat.”',
  '“Моя квартира никогда не выглядела такой ухоженной.”': '„Apartamentul meu nu a arătat niciodată atât de îngrijit.”',
  '“Справились с пылью после ремонта как профессионалы — ни пылинки в углах.”': '„S-au descurcat cu praful după renovare ca profesioniștii — niciun fir de praf în colțuri.”',
  '“Используют натуральные средства — это важно при моей аллергии. Дома пахнет чистотой, а не химией.”': '„Folosesc soluții naturale — important pentru alergia mea. Acasă miroase a curat, nu a chimicale.”',
  'Выберите, как часто убирать ваш дом — цена пересчитается автоматически.': 'Alegeți cât de des să facem curățenie — prețul se recalculează automat.',
  'Показать ещё': 'Afișează mai mult',
  'ЧИСТЫЙ ДОМ. СПОКОЙСТВИЕ. УБОРКА В КИШИНЁВЕ ОТ ЛЮДЕЙ, КОТОРЫМ НЕ ВСЁ РАВНО.': 'CASĂ CURATĂ. LINIȘTE. CURĂȚENIE ÎN CHIȘINĂU DE LA OAMENI CĂRORA LE PASĂ.',
  'Мы — команда уборки для занятых жителей Кишинёва: тех, кто совмещает работу, семью, питомцев, дедлайны и всё остальное.': 'Suntem o echipă de curățenie pentru locuitorii ocupați din Chișinău: cei care jonglează cu munca, familia, animalele, termenele limită și toate celelalte.',
  'Мы не огромная франшиза.': 'Nu suntem o franciză uriașă.',
  'Мы — обученная, проверенная и дружная команда.': 'Suntem o echipă instruită, verificată și prietenoasă.',
  'Чем мы отличаемся': 'Ce ne deosebește',
  'Полное соответствие местным требованиям — потому что доверие начинается с честной работы.': 'Conformitate deplină cu cerințele locale — pentru că încrederea începe cu munca cinstită.',
  'Реальные постоянные клиенты': 'Clienți permanenți reali',
  'Вдумчивая уборка, а не впопыхах': 'Curățenie atentă, nu în grabă',
  'Мы учим клинеров не спешить, быть аккуратными и замечать, что действительно нужно дому.': 'Ne învățăm curățătorii să nu se grăbească, să fie atenți și să observe ce are cu adevărat nevoie casa.',
  'Эко-средства': 'Soluții ecologice',
  'Безопасны для животных, детей, растений и людей. Дом должен пахнуть чистотой, а не химией.': 'Sigure pentru animale, copii, plante și oameni. Casa trebuie să miroasă a curat, nu a chimicale.',
  'Команда': 'Echipa',
  'ОДИН И ТОТ ЖЕ КЛИНЕР КАЖДЫЙ РАЗ': 'ACELAȘI CURĂȚĂTOR DE FIECARE DATĂ',
  'Старший клинер': 'Curățător principal',
  'Закажите проверенного клинера, который действительно приезжает, заботится и оставляет дом свежим.': 'Comandați un curățător verificat care chiar vine, are grijă și lasă casa proaspătă.',
  'Запишитесь онлайн за 60 секунд': 'Programați-vă online în 60 de secunde',
  'Для тех, кто любит мгновенную запись.': 'Pentru cei care preferă programarea instant.',
  'Имя': 'Nume',
  'Тип услуги': 'Tipul serviciului',
  'Уборка квартиры': 'Curățenie apartament',
  'Количество комнат': 'Numărul de camere',
  'Комментарий': 'Comentariu',
  'Мы подтверждаем каждую заявку по телефону или в сообщении. Никаких скрытых платежей.': 'Confirmăm fiecare cerere prin telefon sau mesaj. Fără plăți ascunse.',
  'Отправить заявку': 'Trimite cererea',
  'Спасибо! Ваша заявка принята.': 'Mulțumim! Cererea dvs. a fost primită.',
  'Упс! Не удалось отправить форму.': 'Ups! Formularul nu a putut fi trimis.',
  'Удобнее позвонить?': 'Preferați să sunați?',
  'Позвонить': 'Sunați',
  'Почему это важно': 'De ce contează',
  'ЧИСТЫЙ ДОМ НАЧИНАЕТСЯ С ЛЮДЕЙ': 'O CASĂ CURATĂ ÎNCEPE CU OAMENII',
  'Клинеры в Кишинёве, которым можно доверять': 'Curățători de încredere în Chișinău',
  'Каждый клинер проверен и застрахован.': 'Fiecare curățător este verificat și asigurat.',
  'Вы видите цену до начала работы. Без сюрпризов.': 'Vedeți prețul înainte de începerea lucrului. Fără surprize.',
  'Средства включены': 'Soluții incluse',
  'Привозим всё необходимое — экологично и безопасно для питомцев.': 'Aducem tot ce e necesar — ecologic și sigur pentru animale.',
  'Ответы на частые вопросы о ценах, услугах и записи.': 'Răspunsuri la întrebări frecvente despre prețuri, servicii și programare.',
  'Общие': 'Generale',
  'Нужно ли давать чаевые?': 'Trebuie să las bacșiș?',
  'Нужно ли предоставлять свой инвентарь?': 'Trebuie să furnizez propriul inventar?',
  'Нет. Клинер приезжает со всем инвентарём и эко-средствами.': 'Nu. Curățătorul vine cu tot inventarul și soluțiile ecologice.',
  'Моете ли вы внутри духовки, холодильника и шкафов?': 'Spălați în interiorul cuptorului, frigiderului și dulapurilor?',
  'Это входит в генеральную уборку. Можно добавить при оформлении заказа.': 'Aceasta este inclusă în curățenia generală. Se poate adăuga la plasarea comenzii.',
  'Моете ли вы окна?': 'Spălați geamurile?',
  'Да — мойка окон изнутри доступна как дополнительная услуга.': 'Da — spălarea geamurilor la interior este disponibilă ca serviciu suplimentar.',
  'Справитесь ли вы с шерстью животных?': 'Faceți față părului de animale?',
  'Конечно. Наш инвентарь и пылесосы рассчитаны именно на это.': 'Desigur. Inventarul și aspiratoarele noastre sunt concepute exact pentru asta.',
  'Клининговая компания в Кишинёве': 'Companie de curățenie în Chișinău',
  'Что мы убираем': 'Ce curățăm',
  'Все услуги': 'Toate serviciile',
  'Отзывы': 'Recenzii',
  'НАМ ДОВЕРЯЮТ · РЕЙТИНГ 4.9/5': 'AVEM ÎNCREDEREA CLIENȚILOR · RATING 4.9/5',
  'Все отзывы': 'Toate recenziile',
  'Цены': 'Prețuri',
  'ПРОСТЫЕ ЦЕНЫ ДЛЯ КАЖДОГО ДОМА': 'PREȚURI SIMPLE PENTRU FIECARE CASĂ',
  'Еженедельно': 'Săptămânal',
  'Раз в 2 недели': 'La 2 săptămâni',
  'Раз в месяц': 'Lunar',
  'Разово': 'O singură dată',
  'Оценка 4.9/5 в Google': 'Rating 4.9/5 pe Google',
  'Услуги': 'Servicii',
  'УСЛУГИ УБОРКИ ДЛЯ ДОМА И БИЗНЕСА В КИШИНЁВЕ': 'SERVICII DE CURĂȚENIE PENTRU CASĂ ȘI BUSINESS ÎN CHIȘINĂU',
  'Надёжная уборка сверху донизу для повседневной жизни. Кухня, санузел, комнаты — всё включено.': 'Curățenie de încredere, de sus până jos, pentru viața de zi cu zi. Bucătărie, baie, camere — totul inclus.',
  'Убираем строительную пыль из каждого угла, чтобы дом действительно ощущался новым.': 'Îndepărtăm praful de construcție din fiecare colț, ca locuința să se simtă cu adevărat nouă.',
  'Тщательная уборка пустых квартир — идеально перед сдачей ключей или заездом в новое жильё.': 'Curățenie minuțioasă a apartamentelor goale — ideală înainte de predarea cheilor sau mutarea în locuința nouă.',
  'Уборка для аренды посуточно: свежее бельё, вынос мусора, пополнение базовых принадлежностей и готовность к гостям.': 'Curățenie pentru închiriere în regim zilnic: lenjerie proaspătă, evacuarea gunoiului, completarea consumabilelor de bază și pregătire pentru oaspeți.',
  'Для небольших офисов, студий и коворкингов. Столы, кухни, санузлы и общие зоны — чисто и готово к рабочей неделе.': 'Pentru birouri mici, studiouri și coworking-uri. Birouri, bucătării, băi și zone comune — curate și gata pentru săptămâna de lucru.',
  'Кишинёв': 'Chișinău',
  'ул. Месаджер, 7': 'str. Mesager 7',
  'Кишинёв, MD-2069': 'Chișinău, MD-2069',
  'Сколько длится уборка?': 'Cât durează curățenia?',
};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(f)));
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}

// Collect every text node under `node`, recursing through element children
// (not just pure-text leaves) so text broken up by inline tags like <br/> is caught too.
function collectTextNodes($, node, out) {
  $(node)
    .contents()
    .each((_, child) => {
      if (child.type === 'text') {
        out.push(child);
      } else if (child.type === 'tag' && child.tagName !== 'script' && child.tagName !== 'style') {
        collectTextNodes($, child, out);
      }
    });
}

async function main() {
  let files = [];
  console.log(`[translate-ro] DIST=${DIST}`);
  try { files = await walk(`${DIST}/ro`); } catch { console.log(`[translate-ro] no ${DIST}/ro`); return; }
  let pages = 0, total = 0;
  const missed = new Set();
  for (const file of files) {
    try {
      const html = await readFile(file, 'utf8');
      const $ = cheerio.load(html, { decodeEntities: false });
      let n = 0;
      const textNodes = [];
      collectTextNodes($, 'body', textNodes);
      for (const node of textNodes) {
        const raw = node.data;
        if (!raw || !/[А-Яа-яЁё]/.test(raw)) continue;
        const key = norm(raw);
        if (MAP[key]) {
          const lead = raw.match(/^\s*/)[0];
          const trail = raw.match(/\s*$/)[0];
          node.data = lead + MAP[key] + trail;
          n++;
        } else missed.add(key);
      }
      if (n) { await writeFile(file, $.html()); pages++; total += n; }
    } catch (e) { console.log('[translate-ro] failed', file, e.message); }
  }
  console.log(`[translate-ro] ${total} replacements on ${pages} page(s)`);
  if (missed.size) {
    console.log(`[translate-ro] ${missed.size} untranslated string(s) remain (first 20):`);
    [...missed].slice(0, 20).forEach((s) => console.log('   · ' + s.slice(0, 80)));
  }
}
main();
