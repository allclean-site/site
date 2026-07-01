// Per-service landing content (RU + RO). page slug === calculator slug.
// Used by src/pages/services/[slug].astro + ro/services/[slug].astro + ServiceLanding.astro.
// SEO/GEO/AEO: meta titles/descriptions with city, FAQ for answer-engines, Service schema,
// relevant reviews. Source copy adapted from allclean.md service pages.

export interface ServiceFaq { q: string; a: string }
export interface ServiceHero { words: string[]; cities: string[] }
export interface ServiceLocale {
  metaTitle: string;
  metaDescription: string;
  schemaName: string;
  schemaDescription: string;
  serviceType: string;
  hero: ServiceHero;
  faq: ServiceFaq[];
  testimonials: string[];
}
export interface Service {
  slug: string;
  calcSlug: string;
  ru: ServiceLocale;
  ro: ServiceLocale;
}

const CITIES_RU = ['КИШИНЁВЕ', 'ЧОКАНЕ', 'БОТАНИКЕ', 'РЫШКАНОВКЕ', 'КИШИНЁВЕ'];
const CITIES_RO = ['CHIȘINĂU', 'CIOCANA', 'BOTANICA', 'RÂȘCANI', 'CHIȘINĂU'];
const q = (s: string) => '“' + s + '”';

export const SERVICES: Service[] = [
  // ── 1. Уборка квартир и домов (apartments) ───────────────────────────────
  {
    slug: 'home-cleaning',
    calcSlug: 'apartments',
    ru: {
      metaTitle: 'Уборка квартир и домов в Кишинёве — цена и онлайн-расчёт | All Clean',
      metaDescription:
        'Профессиональная уборка квартир и домов в Кишинёве: поддерживающая, генеральная и после ремонта. Рассчитайте стоимость онлайн за минуту. Проверенные клинеры, эко-средства, прозрачные цены.',
      schemaName: 'Уборка квартир и домов в Кишинёве',
      schemaDescription:
        'Профессиональная уборка квартир и домов в Кишинёве: поддерживающая (3–5 ч) и генеральная (до 7 ч). Проверенные клинеры, безопасные эко-средства, прозрачный онлайн-расчёт.',
      serviceType: 'House cleaning',
      hero: { words: ['УБОРКА', 'КВАРТИР', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Что входит в уборку квартиры?', a: 'Поддерживающая уборка (3–5 часов) включает мытьё и пылесос полов, протирание всех доступных поверхностей от пыли, удаление паутины, лёгкую уборку кухни и санузла. Генеральная уборка (до 7 часов) добавляет протирание люстр и светильников, мойку окон, интенсивную уборку кухни и санузлов.' },
        { q: 'Сколько стоит уборка квартиры в Кишинёве?', a: 'Цена зависит от типа уборки, площади и набора дополнительных услуг. Рассчитайте предварительную стоимость в калькуляторе выше за минуту — точную сумму менеджер подтвердит при оформлении заявки.' },
        { q: 'Вы проверяете клинеров?', a: 'Да. Каждый клинер проходит собеседование, проверку и отбор по нашим стандартам качества. Все сотрудники застрахованы.' },
        { q: 'Какие средства вы используете?', a: 'Мы работаем профессиональным оборудованием и экологичными средствами безопасных европейских брендов — без резкого запаха, безопасными для детей и животных.' },
        { q: 'Можно ли заказать одного и того же клинера?', a: 'Да. При регулярных уборках мы по возможности закрепляем за вами одного клинера, который уже знает ваши пожелания.' },
      ],
      testimonials: [
        q('Я мама двоих детей, и дома быстро становится беспорядок. С All Clean наконец-то не нужно ничего перепроверять — всё сделано на совесть.'),
        q('Возвращаться домой после их уборки — отдельное удовольствие. В квартире будто становится легче дышать и просторнее.'),
        q('Прихожу домой после уборки — как будто заехала в новую квартиру. Чисто, свежо и всё на своих местах.'),
        q('Используют натуральные средства — это важно при моей аллергии. Дома пахнет чистотой, а не химией.'),
        q('Честно, сомневалась, что найду нормальный клининг в Кишинёве. Эта команда удивила: всё аккуратно, по полочкам.'),
        q('Быстро, вежливо и невероятно тщательно. Рекомендую всем занятым людям.'),
      ],
    },
    ro: {
      metaTitle: 'Curățenie apartamente și case în Chișinău — preț și calcul online | All Clean',
      metaDescription:
        'Curățenie profesională a apartamentelor și caselor în Chișinău: de întreținere, generală și după renovare. Calculează prețul online într-un minut. Personal verificat, soluții ecologice, prețuri transparente.',
      schemaName: 'Curățenie apartamente și case în Chișinău',
      schemaDescription:
        'Curățenie profesională a apartamentelor și caselor în Chișinău: de întreținere (3–5 h) și generală (până la 7 h). Personal verificat, soluții ecologice sigure, calcul online transparent.',
      serviceType: 'House cleaning',
      hero: { words: ['CURĂȚENIE', 'APARTAMENTE', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce include curățenia apartamentului?', a: 'Curățenia de întreținere (3–5 ore) include spălarea și aspirarea pardoselilor, ștergerea de praf a tuturor suprafețelor accesibile, îndepărtarea pânzelor de păianjen, curățenia ușoară a bucătăriei și a băii. Curățenia generală (până la 7 ore) adaugă ștergerea candelabrelor, spălarea geamurilor și curățenia intensivă a bucătăriei și a băilor.' },
        { q: 'Cât costă curățenia unui apartament în Chișinău?', a: 'Prețul depinde de tipul curățeniei, suprafață și serviciile suplimentare. Calculează costul aproximativ în calculatorul de mai sus într-un minut — suma exactă va fi confirmată de manager.' },
        { q: 'Verificați personalul de curățenie?', a: 'Da. Fiecare angajat trece prin interviu, verificare și selecție conform standardelor noastre de calitate. Tot personalul este asigurat.' },
        { q: 'Ce soluții folosiți?', a: 'Lucrăm cu echipament profesional și soluții ecologice de la branduri europene sigure — fără miros puternic, sigure pentru copii și animale.' },
        { q: 'Pot solicita același angajat?', a: 'Da. La curățeniile regulate vă alocăm, pe cât posibil, același angajat care vă cunoaște deja preferințele.' },
      ],
      testimonials: [
        q('Sunt mamă a doi copii și acasă devine repede dezordine. Cu All Clean în sfârșit nu mai trebuie să verific nimic — totul e făcut conștiincios.'),
        q('Să mă întorc acasă după curățenia lor e o plăcere aparte. În apartament parcă se respiră mai ușor.'),
        q('Vin acasă după curățenie — parcă m-am mutat într-un apartament nou. Curat, proaspăt și totul la locul lui.'),
        q('Folosesc soluții naturale — important pentru alergia mea. Acasă miroase a curat, nu a chimicale.'),
        q('Sincer, mă îndoiam că găsesc o firmă bună de curățenie în Chișinău. Echipa m-a surprins: totul ordonat.'),
        q('Rapid, politicos și incredibil de meticulos. Recomand tuturor oamenilor ocupați.'),
      ],
    },
  },

  // ── 2. Уборка офисов (office) ────────────────────────────────────────────
  {
    slug: 'office',
    calcSlug: 'office',
    ru: {
      metaTitle: 'Уборка офисов в Кишинёве — цена и онлайн-расчёт | All Clean',
      metaDescription:
        'Профессиональная уборка офисов в Кишинёве: ежедневное обслуживание, генеральная и уборка после ремонта. Рассчитайте стоимость онлайн за минуту и закажите. Бесплатный осмотр, эко-средства.',
      schemaName: 'Уборка офисов в Кишинёве',
      schemaDescription:
        'Профессиональная уборка офисов и коммерческих помещений в Кишинёве: от ежедневного обслуживания до генеральной уборки и уборки после ремонта. Прозрачный онлайн-расчёт и бесплатный осмотр.',
      serviceType: 'Office cleaning',
      hero: { words: ['УБОРКА', 'ОФИСОВ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Что входит в уборку офиса?', a: 'Ежедневная уборка офиса включает мойку и пылесос полов, протирание столов, оргтехники и поверхностей до 2 м, чистку зеркал и стекла, чистку и дезинфекцию санузлов, вынос мусора и пополнение расходников — туалетной бумаги, мыла, полотенец и освежителя.' },
        { q: 'Как часто нужно убирать офис?', a: 'От разовой генеральной уборки до ежедневного обслуживания всего здания. При регулярном графике — еженедельно, два раза в неделю или ежедневно — действует скидка: чем чаще уборка, тем ниже цена за выезд.' },
        { q: 'Сколько стоит уборка офиса в Кишинёве?', a: 'Цена зависит от площади, типа уборки и частоты. Рассчитайте предварительную стоимость в калькуляторе выше за минуту — точную цену менеджер подтвердит после бесплатного осмотра помещения.' },
        { q: 'Вы убираете после рабочего дня?', a: 'Да. Мы подстраиваемся под график компании и можем убирать рано утром или вечером, чтобы не мешать сотрудникам и рабочим процессам.' },
        { q: 'Какие средства вы используете?', a: 'Мы работаем профессиональным оборудованием и сертифицированными эко-средствами европейских брендов, безопасными для сотрудников и посетителей офиса.' },
      ],
      testimonials: [
        q('Заказываем уборку офиса дважды в неделю. Сотрудники приходят в чистое помещение, претензий ни разу не было.'),
        q('Перешли на обслуживание у All Clean после смены подрядчика — разница заметна сразу, особенно в санузлах и кухне-зоне.'),
        q('Убирают вечером, после ухода сотрудников. Утром офис идеально чистый и пахнет свежестью.'),
        q('Прозрачная цена и аккуратные люди. Расходники всегда вовремя пополнены — мелочь, а приятно.'),
        q('Делали генеральную уборку офиса после ремонта — окна, полы, пыль везде. Сделали быстро и тщательно.'),
      ],
    },
    ro: {
      metaTitle: 'Curățenie birouri Chișinău — preț și calcul online | All Clean',
      metaDescription:
        'Curățenie profesională a birourilor în Chișinău: întreținere zilnică, curățenie generală și după renovare. Calculează prețul online într-un minut și comandă. Evaluare gratuită, soluții ecologice.',
      schemaName: 'Curățenie birouri în Chișinău',
      schemaDescription:
        'Curățenie profesională a birourilor și spațiilor comerciale în Chișinău: de la întreținere zilnică la curățenie generală și după renovare. Calcul online transparent și evaluare gratuită la fața locului.',
      serviceType: 'Office cleaning',
      hero: { words: ['CURĂȚENIE', 'BIROURI', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce include curățenia biroului?', a: 'Curățenia zilnică a biroului include aspirarea și spălarea pardoselilor, ștergerea birourilor, a echipamentelor și a suprafețelor până la 2 m, curățarea oglinzilor și a sticlei, curățarea și dezinfecția grupurilor sanitare, evacuarea gunoiului și completarea consumabilelor — hârtie igienică, săpun, prosoape și odorizant.' },
        { q: 'Cât de des trebuie făcută curățenia în birou?', a: 'De la o curățenie generală unică până la întreținerea zilnică a întregii clădiri. Pentru un program regulat — săptămânal, de două ori pe săptămână sau zilnic — se aplică reducere: cu cât mai des, cu atât prețul per vizită este mai mic.' },
        { q: 'Cât costă curățenia unui birou în Chișinău?', a: 'Prețul depinde de suprafață, tipul curățeniei și frecvență. Calculează costul aproximativ în calculatorul de mai sus — prețul exact va fi confirmat de manager după evaluarea gratuită a spațiului.' },
        { q: 'Faceți curățenie după programul de lucru?', a: 'Da. Ne adaptăm la programul companiei și putem face curățenie dimineața devreme sau seara, ca să nu deranjăm angajații.' },
        { q: 'Ce soluții folosiți?', a: 'Lucrăm cu echipament profesional și soluții ecologice certificate de la branduri europene, sigure pentru angajați și vizitatori.' },
      ],
      testimonials: [
        q('Comandăm curățenia biroului de două ori pe săptămână. Angajații vin într-un spațiu curat, nicio reclamație.'),
        q('Am trecut la All Clean după ce am schimbat furnizorul — diferența se vede imediat, mai ales la băi și bucătărie.'),
        q('Fac curățenie seara, după plecarea angajaților. Dimineața biroul e impecabil și miroase a proaspăt.'),
        q('Preț transparent și oameni atenți. Consumabilele sunt mereu completate la timp.'),
        q('Au făcut curățenia generală a biroului după renovare — geamuri, pardoseli, praf peste tot. Rapid și meticulos.'),
      ],
    },
  },

  // ── 3. Уборка после ремонта (post-construction) ──────────────────────────
  {
    slug: 'post-construction',
    calcSlug: 'post-construction',
    ru: {
      metaTitle: 'Уборка после ремонта и строительства в Кишинёве — цена | All Clean',
      metaDescription:
        'Уборка после ремонта и строительства в Кишинёве: вынос строймусора, мойка окон, удаление пыли и наклеек, дезинфекция сантехники. Рассчитайте стоимость онлайн. Профессиональное оборудование.',
      schemaName: 'Уборка после ремонта в Кишинёве',
      schemaDescription:
        'Профессиональная уборка после ремонта и строительства в Кишинёве: сбор строймусора и пыли, мойка окон внутри и снаружи, удаление наклеек и защитной плёнки, дезинфекция плитки и сантехники.',
      serviceType: 'Post-construction cleaning',
      hero: { words: ['УБОРКА', 'ПОСЛЕ', 'РЕМОНТА', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Что входит в уборку после ремонта?', a: 'Сбор строительного мусора и пыли, удаление наклеек с окон, мойка окон внутри и снаружи, снятие защитной плёнки с рам, обеспыливание стен, чистка розеток и выключателей, протирание дверей и рам, дезинфекция плитки и сантехники, чистка радиаторов и плинтусов, специальная мойка полов.' },
        { q: 'Сколько стоит уборка после ремонта?', a: 'Стоимость зависит от площади, наличия мебели и объёма загрязнений. Ориентировочно: до 40 м² — от 3700 лей, до 60 м² — от 4700 лей, до 90 м² — от 5700 лей; для офисов — от 35 лей/м². Точную цену рассчитайте в калькуляторе выше.' },
        { q: 'Почему окна после ремонта дороже?', a: 'После строительных работ окна сильно загрязнены цементом, краской и наклейками, требуют больше времени и специальных средств — поэтому мойка окон после ремонта стоит дороже обычной.' },
        { q: 'Вы вывозите строительный мусор?', a: 'Да, мы можем организовать сбор и вынос строительного мусора. Объём указывается в калькуляторе и уточняется при осмотре.' },
        { q: 'Когда лучше заказывать уборку?', a: 'После завершения всех пыльных работ и установки сантехники. Мы приезжаем с профессиональным оборудованием и безопасными средствами и быстро готовим помещение к заселению.' },
      ],
      testimonials: [
        q('После ремонта квартиры была уверена, что неделю буду отмывать сама. All Clean справились за день — ни пылинки в углах.'),
        q('Сняли все наклейки и плёнку с окон, отмыли цемент с плитки. Помещение сдали как новое.'),
        q('Заказывали уборку офиса после ремонта. Вынесли мусор, отмыли окна и полы — заехали сразу.'),
        q('Думал, пыль после шлифовки стен не отмыть. Ребята обеспылили всё, даже за радиаторами.'),
        q('Профессионалы. Приехали со своим оборудованием и химией, работали быстро и аккуратно.'),
      ],
    },
    ro: {
      metaTitle: 'Curățenie după renovare și construcție în Chișinău — preț | All Clean',
      metaDescription:
        'Curățenie după renovare și construcție în Chișinău: evacuarea deșeurilor, spălarea geamurilor, îndepărtarea prafului și a autocolantelor, dezinfecția instalațiilor sanitare. Calculează prețul online.',
      schemaName: 'Curățenie după renovare în Chișinău',
      schemaDescription:
        'Curățenie profesională după renovare și construcție în Chișinău: colectarea deșeurilor și a prafului, spălarea geamurilor interior și exterior, îndepărtarea autocolantelor și a foliei de protecție, dezinfecția gresiei și a instalațiilor sanitare.',
      serviceType: 'Post-construction cleaning',
      hero: { words: ['CURĂȚENIE', 'DUPĂ', 'RENOVARE', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce include curățenia după renovare?', a: 'Colectarea deșeurilor de construcție și a prafului, îndepărtarea autocolantelor de pe geamuri, spălarea geamurilor interior și exterior, îndepărtarea foliei de protecție de pe rame, desprăfuirea pereților, curățarea prizelor și întrerupătoarelor, ștergerea ușilor și a ramelor, dezinfecția gresiei și a sanitarelor, curățarea caloriferelor și a plintelor, spălarea specială a pardoselilor.' },
        { q: 'Cât costă curățenia după renovare?', a: 'Prețul depinde de suprafață, prezența mobilei și gradul de murdărie. Orientativ: până la 40 m² — de la 3700 lei, până la 60 m² — de la 4700 lei, până la 90 m² — de la 5700 lei; pentru birouri — de la 35 lei/m². Calculează prețul exact în calculatorul de mai sus.' },
        { q: 'De ce geamurile după renovare costă mai mult?', a: 'După lucrările de construcție geamurile sunt puternic murdărite cu ciment, vopsea și autocolante, necesitând mai mult timp și soluții speciale — de aceea spălarea lor costă mai mult decât cea obișnuită.' },
        { q: 'Evacuați deșeurile de construcție?', a: 'Da, putem organiza colectarea și evacuarea deșeurilor de construcție. Volumul se indică în calculator și se precizează la evaluare.' },
        { q: 'Când e mai bine să comand curățenia?', a: 'După finalizarea tuturor lucrărilor cu praf și montarea sanitarelor. Venim cu echipament profesional și soluții sigure și pregătim rapid spațiul pentru locuit.' },
      ],
      testimonials: [
        q('După renovarea apartamentului eram sigură că voi spăla o săptămână singură. All Clean au reușit într-o zi — niciun fir de praf.'),
        q('Au îndepărtat toate autocolantele și folia de pe geamuri, au curățat cimentul de pe gresie. Impecabil.'),
        q('Am comandat curățenia biroului după renovare. Au evacuat deșeurile, au spălat geamurile și pardoselile.'),
        q('Credeam că praful după șlefuirea pereților nu se curăță. Băieții au desprăfuit tot, chiar și după calorifere.'),
        q('Profesioniști. Au venit cu echipamentul și soluțiile lor, au lucrat rapid și ordonat.'),
      ],
    },
  },

  // ── 4. Мойка окон и фасадов (windows) ────────────────────────────────────
  {
    slug: 'windows',
    calcSlug: 'windows',
    ru: {
      metaTitle: 'Мойка окон, фасадов и витрин в Кишинёве — цена | All Clean',
      metaDescription:
        'Профессиональная мойка окон, фасадов и витрин в Кишинёве. Стандартные, полупанорамные и панорамные окна, стеклянные фасады. Рассчитайте стоимость онлайн. Бесплатный выезд и оценка.',
      schemaName: 'Мойка окон и фасадов в Кишинёве',
      schemaDescription:
        'Профессиональная мойка окон, фасадов и витрин в Кишинёве: окна любого типа внутри и снаружи, стеклянные и Etalbond фасады. Бесплатный выезд и оценка, скидки на большие площади.',
      serviceType: 'Window cleaning',
      hero: { words: ['МОЙКА', 'ОКОН', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Сколько стоит мойка окон в Кишинёве?', a: 'Мойка окон внутри — от 40 лей/м², снаружи — от 45 лей/м², витражи — от 40 лей/м², стеклянные фасады — от 35 лей/м². В калькуляторе выше можно рассчитать цену по типу и количеству окон.' },
        { q: 'Вы моете окна снаружи на высоте?', a: 'Да. Для верхних этажей и фасадов используем специальное оборудование, при необходимости — автовышку. Доступ и высота учитываются в расчёте стоимости.' },
        { q: 'Моете ли вы стеклянные фасады и витрины?', a: 'Да, мы моем стеклянные фасады, витрины магазинов и фасады Etalbond — для бизнеса важен аккуратный внешний вид, и мы поддерживаем его регулярно.' },
        { q: 'Нужен ли выезд для оценки?', a: 'Наша команда бесплатно выезжает на локацию и оценивает объём работ. Для больших площадей и регулярного обслуживания действуют скидки.' },
        { q: 'Какими средствами вы моете окна?', a: 'Профессиональными неразводными составами и инструментом, которые не оставляют разводов и безопасны для рам и уплотнителей.' },
      ],
      testimonials: [
        q('Панорамные окна в квартире — моя головная боль. После All Clean стекло прозрачное, без единого развода.'),
        q('Моют витрины нашего магазина каждую неделю. Выглядит всегда опрятно, покупателям приятно заходить.'),
        q('Отмыли окна после ремонта — были в краске и наклейках. Сделали идеально и быстро.'),
        q('Приехали, оценили бесплатно, назвали честную цену. Фасад офиса теперь блестит.'),
        q('Высокие окна сами не помыть. Ребята приехали с оборудованием и справились за пару часов.'),
      ],
    },
    ro: {
      metaTitle: 'Spălare geamuri, fațade și vitrine în Chișinău — preț | All Clean',
      metaDescription:
        'Spălare profesională a geamurilor, fațadelor și vitrinelor în Chișinău. Geamuri standard, semipanoramice și panoramice, fațade din sticlă. Calculează prețul online. Deplasare și evaluare gratuită.',
      schemaName: 'Spălare geamuri și fațade în Chișinău',
      schemaDescription:
        'Spălare profesională a geamurilor, fațadelor și vitrinelor în Chișinău: geamuri de orice tip interior și exterior, fațade din sticlă și Etalbond. Deplasare și evaluare gratuită, reduceri pentru suprafețe mari.',
      serviceType: 'Window cleaning',
      hero: { words: ['SPĂLARE', 'GEAMURI', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Cât costă spălarea geamurilor în Chișinău?', a: 'Spălarea geamurilor la interior — de la 40 lei/m², exterior — de la 45 lei/m², vitralii — de la 40 lei/m², fațade din sticlă — de la 35 lei/m². În calculatorul de mai sus poți calcula prețul după tip și număr de geamuri.' },
        { q: 'Spălați geamuri la înălțime, la exterior?', a: 'Da. Pentru etajele superioare și fațade folosim echipament special, la nevoie — nacelă. Accesul și înălțimea sunt incluse în calcul.' },
        { q: 'Spălați fațade din sticlă și vitrine?', a: 'Da, spălăm fațade din sticlă, vitrine de magazin și fațade Etalbond — pentru business aspectul îngrijit contează, iar noi îl menținem regulat.' },
        { q: 'Este nevoie de o evaluare la fața locului?', a: 'Echipa noastră se deplasează gratuit la locație și evaluează volumul lucrărilor. Pentru suprafețe mari și întreținere regulată se aplică reduceri.' },
        { q: 'Cu ce soluții spălați geamurile?', a: 'Cu soluții profesionale fără urme și unelte care nu lasă dâre și sunt sigure pentru rame și garnituri.' },
      ],
      testimonials: [
        q('Geamurile panoramice din apartament erau o problemă. După All Clean sticla e perfect curată, fără nicio dâră.'),
        q('Spală vitrinele magazinului nostru în fiecare săptămână. Arată mereu îngrijit, clienților le place.'),
        q('Au spălat geamurile după renovare — erau în vopsea și autocolante. Impecabil și rapid.'),
        q('Au venit, au evaluat gratuit, au spus un preț corect. Fațada biroului acum strălucește.'),
        q('Geamurile înalte nu le speli singur. Băieții au venit cu echipament și au reușit în câteva ore.'),
      ],
    },
  },

  // ── 5. Чистка ковров и ковролина (carpet) ────────────────────────────────
  {
    slug: 'carpet',
    calcSlug: 'carpet',
    ru: {
      metaTitle: 'Чистка ковров и ковролина в Кишинёве — цена | All Clean',
      metaDescription:
        'Профессиональная чистка ковров и ковролина в Кишинёве. Деликатная механическая чистка, удаление пятен и запахов, антибактериальная обработка. Рассчитайте стоимость онлайн.',
      schemaName: 'Чистка ковров и ковролина в Кишинёве',
      schemaDescription:
        'Профессиональная чистка ковров и ковролина в Кишинёве: деликатная механическая чистка с освежающим раствором, удаление пятен и запахов, ароматизация. Чистка на месте или с вывозом.',
      serviceType: 'Carpet cleaning',
      hero: { words: ['ЧИСТКА', 'КОВРОВ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Сколько стоит чистка ковра в Кишинёве?', a: 'Чистка ковролина — от 45 лей/м², ковров — от 55 лей/м². На большие объёмы и абонемент действуют скидки. Рассчитайте стоимость по площади и типу покрытия в калькуляторе выше.' },
        { q: 'Как проходит чистка ковра?', a: 'Сначала наносим специальный освежающий раствор, затем обрабатываем покрытие оборудованием со щёткой или текстильным падом, собираем раствор вместе с грязью и проводим ароматизацию.' },
        { q: 'Вы чистите ковролин на месте?', a: 'Да, ковролин и большие ковры мы чистим прямо у вас. Небольшие ковры по желанию можем забрать, почистить и вернуть.' },
        { q: 'Удаляете ли вы пятна и запахи?', a: 'Да. Для сильных загрязнений и запахов используем специальные средства и антибактериальную обработку — это особенно важно для здоровья семьи и аллергиков.' },
        { q: 'Безопасна ли химия для детей и животных?', a: 'Да, мы работаем экологичными средствами безопасных европейских брендов, безопасными для детей и питомцев после высыхания.' },
      ],
      testimonials: [
        q('Светлый ковёр в гостиной казался безнадёжным. Вернули ему цвет и убрали запах — как новый.'),
        q('Почистили ковролин во всей квартире, не вынося из дома. Высох за вечер, пятен не осталось.'),
        q('У ребёнка аллергия, чистим ковры регулярно. After All Clean дышится заметно легче.'),
        q('Забрали ковёр, почистили и вернули в срок. Запах ушёл полностью.'),
        q('Профессиональное оборудование и аккуратная работа. Рекомендую.'),
      ],
    },
    ro: {
      metaTitle: 'Curățare covoare și mochetă în Chișinău — preț | All Clean',
      metaDescription:
        'Curățare profesională a covoarelor și mochetei în Chișinău. Curățare mecanică delicată, îndepărtarea petelor și mirosurilor, tratament antibacterian. Calculează prețul online.',
      schemaName: 'Curățare covoare și mochetă în Chișinău',
      schemaDescription:
        'Curățare profesională a covoarelor și mochetei în Chișinău: curățare mecanică delicată cu soluție de împrospătare, îndepărtarea petelor și a mirosurilor, odorizare. La fața locului sau cu ridicare.',
      serviceType: 'Carpet cleaning',
      hero: { words: ['CURĂȚARE', 'COVOARE', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Cât costă curățarea unui covor în Chișinău?', a: 'Curățarea mochetei — de la 45 lei/m², a covoarelor — de la 55 lei/m². Pentru volume mari și abonament se aplică reduceri. Calculează prețul după suprafață și tip în calculatorul de mai sus.' },
        { q: 'Cum se desfășoară curățarea covorului?', a: 'Mai întâi aplicăm o soluție specială de împrospătare, apoi prelucrăm suprafața cu echipament cu perie sau pad textil, colectăm soluția împreună cu murdăria și facem odorizarea.' },
        { q: 'Curățați mocheta la fața locului?', a: 'Da, mocheta și covoarele mari le curățăm direct la dvs. Covoarele mici, la cerere, le putem ridica, curăța și returna.' },
        { q: 'Îndepărtați petele și mirosurile?', a: 'Da. Pentru murdărie puternică și mirosuri folosim soluții speciale și tratament antibacterian — important pentru sănătatea familiei și a alergicilor.' },
        { q: 'Sunt sigure soluțiile pentru copii și animale?', a: 'Da, lucrăm cu soluții ecologice de la branduri europene sigure, inofensive pentru copii și animale după uscare.' },
      ],
      testimonials: [
        q('Covorul deschis la culoare din living părea fără speranță. I-au redat culoarea și au eliminat mirosul.'),
        q('Au curățat mocheta din tot apartamentul, fără s-o scoată din casă. S-a uscat într-o seară.'),
        q('Copilul are alergie, curățăm covoarele regulat. După All Clean se respiră vizibil mai ușor.'),
        q('Au ridicat covorul, l-au curățat și l-au returnat la timp. Mirosul a dispărut complet.'),
        q('Echipament profesional și muncă îngrijită. Recomand.'),
      ],
    },
  },

  // ── 6. Чистка мягкой мебели (upholstery) ─────────────────────────────────
  {
    slug: 'upholstery',
    calcSlug: 'upholstery',
    ru: {
      metaTitle: 'Химчистка мягкой мебели в Кишинёве — диваны, матрасы | All Clean',
      metaDescription:
        'Химчистка мягкой мебели в Кишинёве: диваны, кресла, матрасы, стулья. Удаление пятен и запахов, отдельные методы для текстиля и кожи. Рассчитайте стоимость онлайн за минуту.',
      schemaName: 'Химчистка мягкой мебели в Кишинёве',
      schemaDescription:
        'Профессиональная химчистка мягкой мебели в Кишинёве: диваны, кресла, матрасы и стулья. Отдельные методы для текстиля и кожи, удаление пятен и запахов, безопасно для здоровья семьи.',
      serviceType: 'Upholstery cleaning',
      hero: { words: ['ЧИСТКА', 'МЕБЕЛИ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Сколько стоит химчистка дивана в Кишинёве?', a: 'Стоимость зависит от предмета и материала (текстиль или кожа) — ориентировочно от 50 до 450 лей за предмет. Соберите свой заказ в калькуляторе выше: диваны, кресла, стулья, матрасы.' },
        { q: 'Чистите ли вы матрасы?', a: 'Да. Чистка матрасов и диванов — одно из наших любимых направлений: для здоровья семьи важна регулярная и правильная очистка от пыли, клещей и пятен.' },
        { q: 'Чем отличается чистка текстиля и кожи?', a: 'Для текстильной и кожаной обивки мы используем разные методы и средства, чтобы бережно очистить и сохранить материал. Тип обивки учитывается при расчёте.' },
        { q: 'Сколько сохнет мебель после чистки?', a: 'Обычно мягкая мебель высыхает за несколько часов. Мы используем оборудование, которое не переувлажняет наполнитель.' },
        { q: 'Удаляете ли вы запахи и пятна?', a: 'Да, для сильных пятен и запахов применяем специальные средства. Чистка возвращает свежесть и убирает аллергены.' },
      ],
      testimonials: [
        q('Диван после кота и детей выглядел печально. Почистили — цвет вернулся, запах ушёл полностью.'),
        q('Заказала чистку матраса — спать стало приятнее, и пыли явно меньше. Аллергия беспокоит реже.'),
        q('Угловой диван почистили прямо дома за пару часов. Высох к вечеру, пятен нет.'),
        q('Кожаные кресла обработали аккуратно, материал как новый. Видно, что знают, что делают.'),
        q('Быстро, чисто, без лишней влаги. Очень довольна результатом.'),
      ],
    },
    ro: {
      metaTitle: 'Curățare mobilă tapițată în Chișinău — canapele, saltele | All Clean',
      metaDescription:
        'Curățare chimică a mobilei tapițate în Chișinău: canapele, fotolii, saltele, scaune. Îndepărtarea petelor și mirosurilor, metode separate pentru textil și piele. Calculează prețul online.',
      schemaName: 'Curățare mobilă tapițată în Chișinău',
      schemaDescription:
        'Curățare chimică profesională a mobilei tapițate în Chișinău: canapele, fotolii, saltele și scaune. Metode separate pentru textil și piele, îndepărtarea petelor și a mirosurilor, sigur pentru familie.',
      serviceType: 'Upholstery cleaning',
      hero: { words: ['CURĂȚARE', 'MOBILĂ', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Cât costă curățarea unei canapele în Chișinău?', a: 'Prețul depinde de obiect și material (textil sau piele) — orientativ de la 50 la 450 lei per obiect. Compune comanda în calculatorul de mai sus: canapele, fotolii, scaune, saltele.' },
        { q: 'Curățați saltele?', a: 'Da. Curățarea saltelelor și a canapelelor este una dintre direcțiile noastre preferate: pentru sănătatea familiei contează curățarea regulată și corectă de praf, acarieni și pete.' },
        { q: 'Prin ce diferă curățarea textilului de cea a pielii?', a: 'Pentru tapițeria textilă și cea din piele folosim metode și soluții diferite, ca să curățăm cu grijă și să păstrăm materialul. Tipul tapițeriei este inclus în calcul.' },
        { q: 'Cât se usucă mobila după curățare?', a: 'De obicei mobila tapițată se usucă în câteva ore. Folosim echipament care nu îmbibă excesiv umplutura.' },
        { q: 'Îndepărtați mirosurile și petele?', a: 'Da, pentru pete și mirosuri puternice folosim soluții speciale. Curățarea redă prospețimea și elimină alergenii.' },
      ],
      testimonials: [
        q('Canapeaua după pisică și copii arăta trist. Au curățat-o — culoarea a revenit, mirosul a dispărut.'),
        q('Am comandat curățarea saltelei — dormit mai plăcut și vizibil mai puțin praf. Alergia mă deranjează mai rar.'),
        q('Canapeaua de colț au curățat-o direct acasă în câteva ore. S-a uscat seara, fără pete.'),
        q('Fotoliile din piele le-au tratat cu grijă, materialul ca nou. Se vede că știu ce fac.'),
        q('Rapid, curat, fără umezeală în plus. Foarte mulțumită de rezultat.'),
      ],
    },
  },

  // ── 7. Уборка складов и промышленных помещений (warehouse) ────────────────
  {
    slug: 'warehouse',
    calcSlug: 'warehouse',
    ru: {
      metaTitle: 'Уборка складов и промышленных помещений в Кишинёве | All Clean',
      metaDescription:
        'Профессиональная уборка складов и промышленных помещений в Кишинёве: мойка и дезинфекция, обеспыливание металлоконструкций, чистка оборудования. Рассчитайте стоимость онлайн.',
      schemaName: 'Уборка складов и промышленных помещений в Кишинёве',
      schemaDescription:
        'Профессиональная уборка складов и промышленных помещений в Кишинёве: мойка и дезинфекция больших площадей, обеспыливание металлоконструкций, чистка вентиляции и оборудования, ежедневное обслуживание.',
      serviceType: 'Industrial cleaning',
      hero: { words: ['УБОРКА', 'СКЛАДОВ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Что входит в уборку склада?', a: 'Мойка и дезинфекция помещений, обеспыливание металлоконструкций, очистка элементов вентиляции, чистка оборудования и технических поверхностей, уборка санузлов, душевых и раздевалок, а также ежедневная поддерживающая уборка.' },
        { q: 'Сколько стоит уборка промышленного помещения?', a: 'Цена зависит от площади, типа уборки и частоты — для больших площадей действует выгодная ставка за м². Рассчитайте предварительную стоимость в калькуляторе выше; точную цену определим после бесплатного осмотра.' },
        { q: 'Вы работаете с высокими потолками?', a: 'Да. Уборка промышленных помещений требует специального оборудования и обученного персонала; работы на высоте и большие площади учитываются в расчёте.' },
        { q: 'Можно ли заключить договор на постоянное обслуживание?', a: 'Да, мы берём на себя регулярную и ежедневную уборку складов и производств. На постоянное обслуживание и большие объёмы действуют скидки.' },
        { q: 'Соблюдаете ли вы технику безопасности?', a: 'Да. Наш персонал обучен работе с промышленной химией, специальным оборудованием для разных типов полов и соблюдает требования охраны труда.' },
      ],
      testimonials: [
        q('Складские полы с въевшейся пылью наконец отмыли. Работают системно, без простоев нашего персонала.'),
        q('Заключили договор на ежедневную уборку производства. Чисто, претензий от проверок нет.'),
        q('Обеспылили металлоконструкции и вентиляцию — то, до чего у нас руки не доходили годами.'),
        q('Большая площадь, сжатые сроки — справились организованно и в график.'),
        q('Адекватная цена за м² и ответственный подход. Рекомендуем для бизнеса.'),
      ],
    },
    ro: {
      metaTitle: 'Curățenie depozite și spații industriale în Chișinău | All Clean',
      metaDescription:
        'Curățenie profesională a depozitelor și spațiilor industriale în Chișinău: spălare și dezinfecție, desprăfuirea structurilor metalice, curățarea echipamentelor. Calculează prețul online.',
      schemaName: 'Curățenie depozite și spații industriale în Chișinău',
      schemaDescription:
        'Curățenie profesională a depozitelor și spațiilor industriale în Chișinău: spălare și dezinfecție pe suprafețe mari, desprăfuirea structurilor metalice, curățarea ventilației și a echipamentelor, întreținere zilnică.',
      serviceType: 'Industrial cleaning',
      hero: { words: ['CURĂȚENIE', 'DEPOZITE', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce include curățenia unui depozit?', a: 'Spălarea și dezinfecția spațiilor, desprăfuirea structurilor metalice, curățarea elementelor de ventilație, curățarea echipamentelor și a suprafețelor tehnice, curățenia grupurilor sanitare, dușurilor și vestiarelor, precum și întreținerea zilnică.' },
        { q: 'Cât costă curățenia unui spațiu industrial?', a: 'Prețul depinde de suprafață, tipul curățeniei și frecvență — pentru suprafețe mari se aplică o rată avantajoasă pe m². Calculează costul aproximativ în calculator; prețul exact îl stabilim după evaluarea gratuită.' },
        { q: 'Lucrați la tavane înalte?', a: 'Da. Curățenia spațiilor industriale necesită echipament special și personal instruit; lucrul la înălțime și suprafețele mari sunt incluse în calcul.' },
        { q: 'Se poate încheia un contract de întreținere permanentă?', a: 'Da, preluăm curățenia regulată și zilnică a depozitelor și producțiilor. Pentru întreținere permanentă și volume mari se aplică reduceri.' },
        { q: 'Respectați normele de securitate?', a: 'Da. Personalul nostru este instruit pentru lucrul cu soluții industriale, echipament special pentru diferite pardoseli și respectă normele de securitate a muncii.' },
      ],
      testimonials: [
        q('Pardoselile depozitului cu praf impregnat în sfârșit curate. Lucrează sistematic, fără să oprească personalul nostru.'),
        q('Am încheiat contract pentru curățenia zilnică a producției. Curat, fără reclamații la inspecții.'),
        q('Au desprăfuit structurile metalice și ventilația — ce nu reușeam de ani de zile.'),
        q('Suprafață mare, termen scurt — au reușit organizat și la timp.'),
        q('Preț corect pe m² și abordare responsabilă. Recomandăm pentru business.'),
      ],
    },
  },

  // ── 8. Уборка магазинов и торговых сетей (retail) ────────────────────────
  {
    slug: 'retail',
    calcSlug: 'retail',
    ru: {
      metaTitle: 'Уборка магазинов и супермаркетов в Кишинёве — цена | All Clean',
      metaDescription:
        'Профессиональная уборка магазинов, супермаркетов и торговых сетей в Кишинёве: торговые залы, витрины, санузлы. Высокие стандарты по приемлемой цене. Рассчитайте стоимость онлайн.',
      schemaName: 'Уборка магазинов и торговых сетей в Кишинёве',
      schemaDescription:
        'Профессиональная уборка магазинов, супермаркетов и торговых сетей в Кишинёве: торговые залы, витрины, санузлы, ежедневное обслуживание. Высокие стандарты по приемлемой цене.',
      serviceType: 'Retail cleaning',
      hero: { words: ['УБОРКА', 'МАГАЗИНОВ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Что входит в уборку магазина?', a: 'Уборка торгового зала и полов, протирание поверхностей и витрин, чистка и дезинфекция санузлов, вынос мусора, поддержание чистоты в течение дня. Для крупных магазинов возможна уборка несколько раз в день.' },
        { q: 'Сколько стоит уборка магазина в Кишинёве?', a: 'Цена зависит от площади, частоты и набора работ. All Clean предлагает высокие стандарты по приемлемой цене. Рассчитайте стоимость в калькуляторе выше; точную цену уточним после осмотра.' },
        { q: 'Вы убираете в часы работы магазина?', a: 'Да, мы подстраиваемся под режим работы: убираем до открытия, после закрытия или поддерживаем чистоту в течение дня, не мешая покупателям.' },
        { q: 'Моете ли вы витрины?', a: 'Да, мойка витрин входит в обслуживание торговых точек — чистые витрины важны для впечатления покупателей. Витрины можно добавить в расчёт.' },
        { q: 'Можно ли заказать ежедневное обслуживание?', a: 'Да, для торговых сетей мы предлагаем регулярное и ежедневное обслуживание со скидкой за частоту.' },
      ],
      testimonials: [
        q('Убирают наш магазин каждое утро до открытия. Торговый зал и витрины всегда в идеале.'),
        q('Перешли на All Clean ради стабильного качества — и не прогадали. Цена адекватная.'),
        q('Несколько точек сети обслуживают по графику. Удобно работать с одним подрядчиком.'),
        q('Санузлы для покупателей всегда чистые и с расходниками. Это важно для репутации.'),
        q('Поддерживают чистоту в течение дня, не мешая покупателям. Профессионально.'),
      ],
    },
    ro: {
      metaTitle: 'Curățenie magazine și supermarketuri în Chișinău — preț | All Clean',
      metaDescription:
        'Curățenie profesională a magazinelor, supermarketurilor și rețelelor comerciale în Chișinău: săli comerciale, vitrine, grupuri sanitare. Standarde înalte la preț accesibil. Calculează prețul online.',
      schemaName: 'Curățenie magazine și rețele comerciale în Chișinău',
      schemaDescription:
        'Curățenie profesională a magazinelor, supermarketurilor și rețelelor comerciale în Chișinău: săli comerciale, vitrine, grupuri sanitare, întreținere zilnică. Standarde înalte la preț accesibil.',
      serviceType: 'Retail cleaning',
      hero: { words: ['CURĂȚENIE', 'MAGAZINE', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce include curățenia unui magazin?', a: 'Curățenia sălii comerciale și a pardoselilor, ștergerea suprafețelor și a vitrinelor, curățarea și dezinfecția grupurilor sanitare, evacuarea gunoiului, menținerea curățeniei pe parcursul zilei. Pentru magazinele mari, curățenie de mai multe ori pe zi.' },
        { q: 'Cât costă curățenia unui magazin în Chișinău?', a: 'Prețul depinde de suprafață, frecvență și volumul lucrărilor. All Clean oferă standarde înalte la preț accesibil. Calculează prețul în calculator; suma exactă o precizăm după evaluare.' },
        { q: 'Faceți curățenie în timpul programului magazinului?', a: 'Da, ne adaptăm la program: facem curățenie înainte de deschidere, după închidere sau menținem curățenia pe parcursul zilei, fără să deranjăm clienții.' },
        { q: 'Spălați vitrinele?', a: 'Da, spălarea vitrinelor face parte din întreținerea punctelor comerciale — vitrinele curate contează pentru impresia clienților. Vitrinele pot fi adăugate în calcul.' },
        { q: 'Se poate comanda întreținere zilnică?', a: 'Da, pentru rețelele comerciale oferim întreținere regulată și zilnică cu reducere pentru frecvență.' },
      ],
      testimonials: [
        q('Fac curățenie în magazinul nostru în fiecare dimineață înainte de deschidere. Sala și vitrinele sunt mereu impecabile.'),
        q('Am trecut la All Clean pentru calitate stabilă — și nu am greșit. Preț corect.'),
        q('Mai multe puncte ale rețelei sunt deservite după program. Comod să lucrezi cu un singur furnizor.'),
        q('Grupurile sanitare pentru clienți sunt mereu curate și aprovizionate. Contează pentru reputație.'),
        q('Mențin curățenia pe parcursul zilei, fără să deranjeze clienții. Profesionist.'),
      ],
    },
  },

  // ── 9. Реставрация и защита полов (floor-restoration) ─────────────────────
  {
    slug: 'floor-restoration',
    calcSlug: 'floor-restoration',
    ru: {
      metaTitle: 'Реставрация полов в Кишинёве — паркет, линолеум, мрамор | All Clean',
      metaDescription:
        'Реставрация и защита полов в Кишинёве: восстановление блеска линолеума, циклёвка и лакировка паркета, полировка мрамора. Рассчитайте стоимость онлайн. Профессиональное оборудование.',
      schemaName: 'Реставрация и защита полов в Кишинёве',
      schemaDescription:
        'Профессиональная реставрация и защита полов в Кишинёве: восстановление блеска и защита линолеума, реставрация и лакировка паркета, восстановление блеска мрамора. Кишинёв и пригороды.',
      serviceType: 'Floor restoration',
      hero: { words: ['РЕСТАВРАЦИЯ', 'ПОЛОВ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Какие полы вы реставрируете?', a: 'Мы выполняем восстановление блеска и защиту линолеума, реставрацию и лакировку паркета (циклёвка + лак) и восстановление блеска мрамора. Тип покрытия выбирается в калькуляторе.' },
        { q: 'Сколько стоит реставрация пола?', a: 'Цена зависит от типа покрытия, площади и состояния пола, а для паркета — от количества слоёв лака. Рассчитайте предварительную стоимость в калькуляторе выше; точную цену подтвердим после осмотра.' },
        { q: 'Сколько слоёв лака нужно паркету?', a: 'Обычно паркет покрывают 1–3 слоями лака: чем больше слоёв, тем выше износостойкость и глубина блеска. Количество выбирается в расчёте.' },
        { q: 'Можно ли восстановить запущенный пол?', a: 'Да. Для пола в среднем и запущенном состоянии требуется больше работы — это учитывается в стоимости. В большинстве случаев мы возвращаем покрытию блеск и вид.' },
        { q: 'Вы работаете в пригородах Кишинёва?', a: 'Да, All Clean выполняет реставрацию полов в Кишинёве и пригородах. Выезд и оценку уточняйте при заявке.' },
      ],
      testimonials: [
        q('Старый паркет отциклевали и покрыли лаком — выглядит как новый, блестит и не скрипит.'),
        q('Мрамор в холле потускнел за годы. После полировки снова блестит, гости отмечают.'),
        q('Линолеум в офисе восстановили — заметно посветлел и стал глянцевым. Недорого за результат.'),
        q('Думали менять паркет, а его просто отреставрировали. Сэкономили прилично.'),
        q('Аккуратно, чисто, с профессиональным оборудованием. Полы как из салона.'),
      ],
    },
    ro: {
      metaTitle: 'Restaurare pardoseli în Chișinău — parchet, linoleum, marmură | All Clean',
      metaDescription:
        'Restaurare și protecție a pardoselilor în Chișinău: restabilirea luciului linoleumului, șlefuirea și lăcuirea parchetului, lustruirea marmurei. Calculează prețul online. Echipament profesional.',
      schemaName: 'Restaurare și protecție a pardoselilor în Chișinău',
      schemaDescription:
        'Restaurare și protecție profesională a pardoselilor în Chișinău: restabilirea luciului și protecția linoleumului, restaurarea și lăcuirea parchetului, lustruirea marmurei. Chișinău și suburbii.',
      serviceType: 'Floor restoration',
      hero: { words: ['RESTAURARE', 'PARDOSELI', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce pardoseli restaurați?', a: 'Realizăm restabilirea luciului și protecția linoleumului, restaurarea și lăcuirea parchetului (șlefuire + lac) și lustruirea marmurei. Tipul pardoselii se alege în calculator.' },
        { q: 'Cât costă restaurarea unei pardoseli?', a: 'Prețul depinde de tipul pardoselii, suprafață și stare, iar pentru parchet — de numărul de straturi de lac. Calculează costul aproximativ în calculator; prețul exact îl confirmăm după evaluare.' },
        { q: 'Câte straturi de lac are nevoie parchetul?', a: 'De obicei parchetul se acoperă cu 1–3 straturi de lac: cu cât mai multe straturi, cu atât rezistența și profunzimea luciului sunt mai mari. Numărul se alege în calcul.' },
        { q: 'Se poate restaura o pardoseală neglijată?', a: 'Da. Pentru o pardoseală în stare medie sau neglijată e nevoie de mai multă muncă — inclusă în preț. În majoritatea cazurilor redăm luciul și aspectul.' },
        { q: 'Lucrați în suburbiile Chișinăului?', a: 'Da, All Clean realizează restaurarea pardoselilor în Chișinău și suburbii. Deplasarea și evaluarea se precizează la comandă.' },
      ],
      testimonials: [
        q('Parchetul vechi l-au șlefuit și lăcuit — arată ca nou, strălucește și nu mai scârțâie.'),
        q('Marmura din hol se mătuise în ani. După lustruire iar strălucește, oaspeții remarcă.'),
        q('Linoleumul din birou l-au restaurat — vizibil mai deschis și lucios. Ieftin pentru rezultat.'),
        q('Credeam să schimbăm parchetul, dar l-au restaurat. Am economisit considerabil.'),
        q('Ordonat, curat, cu echipament profesional. Pardoseli ca din salon.'),
      ],
    },
  },

  // ── 10. Дезинфекция пищевых производств (disinfection) ────────────────────
  {
    slug: 'disinfection',
    calcSlug: 'disinfection',
    ru: {
      metaTitle: 'Мойка и дезинфекция пищевых производств в Кишинёве | All Clean',
      metaDescription:
        'Мойка и дезинфекция пищевых производств, холодильных камер и складов продуктов в Кишинёве по требованиям законодательства РМ. Чистка оборудования и вентиляции. Рассчитайте стоимость онлайн.',
      schemaName: 'Мойка и дезинфекция пищевых производств в Кишинёве',
      schemaDescription:
        'Профессиональная мойка и дезинфекция пищевых производств, холодильных камер и складов продуктов в Кишинёве по требованиям законодательства Молдовы: помещения, оборудование, вентиляция, жироуловители.',
      serviceType: 'Disinfection cleaning',
      hero: { words: ['ДЕЗИНФЕКЦИЯ', 'ПРОИЗВОДСТВ', 'В'], cities: CITIES_RU },
      faq: [
        { q: 'Что входит в дезинфекцию пищевого производства?', a: 'Мойка и дезинфекция производственных помещений и оборудования, очистка элементов вентиляции, чистка вытяжек и жироуловителей, уборка производственных санузлов, душевых и раздевалок — в соответствии с требованиями законодательства РМ.' },
        { q: 'Сколько стоит дезинфекция производства?', a: 'Цена зависит от типа объекта (производство, холодильная камера, склад продуктов), площади и объёма работ. Рассчитайте предварительную стоимость в калькуляторе выше; точную цену определим после осмотра.' },
        { q: 'Соблюдаете ли вы санитарные нормы?', a: 'Да. К уборке пищевых производств предъявляются особенно жёсткие требования, и мы работаем строго в соответствии с санитарными нормами и законодательством Молдовы.' },
        { q: 'Вы дезинфицируете холодильные камеры?', a: 'Да, мойка и дезинфекция холодильных камер — отдельное направление в калькуляторе. Используем средства, безопасные для пищевых помещений.' },
        { q: 'Можно ли заключить договор на регулярную обработку?', a: 'Да, мы выполняем регулярную мойку и дезинфекцию производств. На постоянное обслуживание действуют скидки.' },
      ],
      testimonials: [
        q('Проходим проверки без замечаний — дезинфекцию производства доверяем All Clean.'),
        q('Отмыли и продезинфицировали холодильные камеры качественно, с нужными документами по средствам.'),
        q('Жироуловители и вытяжки на кухне привели в порядок — то, что сложно сделать своими силами.'),
        q('Работают по санитарным нормам, аккуратно и в согласованное время.'),
        q('Регулярно обслуживают наш цех. Чисто, безопасно, по графику.'),
      ],
    },
    ro: {
      metaTitle: 'Spălare și dezinfecție producție alimentară în Chișinău | All Clean',
      metaDescription:
        'Spălare și dezinfecție a producției alimentare, camerelor frigorifice și depozitelor alimentare în Chișinău conform legislației RM. Curățarea echipamentelor și a ventilației. Calculează prețul online.',
      schemaName: 'Spălare și dezinfecție producție alimentară în Chișinău',
      schemaDescription:
        'Spălare și dezinfecție profesională a producției alimentare, camerelor frigorifice și depozitelor alimentare în Chișinău conform legislației Moldovei: spații, echipamente, ventilație, separatoare de grăsimi.',
      serviceType: 'Disinfection cleaning',
      hero: { words: ['DEZINFECȚIE', 'PRODUCȚIE', 'ÎN'], cities: CITIES_RO },
      faq: [
        { q: 'Ce include dezinfecția unei producții alimentare?', a: 'Spălarea și dezinfecția spațiilor de producție și a echipamentelor, curățarea elementelor de ventilație, curățarea hotelor și a separatoarelor de grăsimi, curățenia grupurilor sanitare, dușurilor și vestiarelor de producție — conform cerințelor legislației RM.' },
        { q: 'Cât costă dezinfecția unei producții?', a: 'Prețul depinde de tipul obiectului (producție, cameră frigorifică, depozit alimentar), suprafață și volumul lucrărilor. Calculează costul aproximativ în calculator; prețul exact îl stabilim după evaluare.' },
        { q: 'Respectați normele sanitare?', a: 'Da. Curățeniei producțiilor alimentare i se aplică cerințe deosebit de stricte, iar noi lucrăm strict conform normelor sanitare și legislației Moldovei.' },
        { q: 'Dezinfectați camere frigorifice?', a: 'Da, spălarea și dezinfecția camerelor frigorifice este o direcție separată în calculator. Folosim soluții sigure pentru spațiile alimentare.' },
        { q: 'Se poate încheia un contract de tratare regulată?', a: 'Da, realizăm spălarea și dezinfecția regulată a producțiilor. Pentru întreținere permanentă se aplică reduceri.' },
      ],
      testimonials: [
        q('Trecem inspecțiile fără observații — dezinfecția producției o încredințăm All Clean.'),
        q('Au spălat și dezinfectat camerele frigorifice calitativ, cu documentele necesare pentru soluții.'),
        q('Separatoarele de grăsimi și hotele de la bucătărie le-au pus la punct — greu de făcut singur.'),
        q('Lucrează conform normelor sanitare, ordonat și la ora stabilită.'),
        q('Deservesc regulat secția noastră. Curat, sigur, la program.'),
      ],
    },
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

// Service + FAQPage + BreadcrumbList JSON-LD for a service page (SEO/GEO/AEO).
export function buildServiceJsonLd(service: Service, locale: 'ru' | 'ro', site: string) {
  const L = service[locale];
  const path = locale === 'ru' ? `/services/${service.slug}` : `/ro/services/${service.slug}`;
  const pageUrl = site + path;
  const homeLabel = locale === 'ru' ? 'Главная' : 'Acasă';
  const servicesLabel = locale === 'ru' ? 'Услуги' : 'Servicii';
  const servicesUrl = site + (locale === 'ru' ? '/services' : '/ro/services');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: L.schemaName,
        description: L.schemaDescription,
        serviceType: L.serviceType,
        areaServed: { '@type': 'City', name: 'Chișinău' },
        provider: {
          '@type': 'LocalBusiness',
          name: 'All Clean',
          telephone: '+373 79 955 044',
          email: 'info@allclean.md',
          address: {
            '@type': 'PostalAddress',
            streetAddress: locale === 'ru' ? 'ул. Месаджер 7' : 'str. Mesager 7',
            addressLocality: locale === 'ru' ? 'Кишинёв' : 'Chișinău',
            postalCode: 'MD-2069',
            addressCountry: 'MD',
          },
        },
        inLanguage: locale,
        url: pageUrl,
      },
      {
        '@type': 'FAQPage',
        mainEntity: L.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeLabel, item: site + (locale === 'ru' ? '/' : '/ro') },
          { '@type': 'ListItem', position: 2, name: servicesLabel, item: servicesUrl },
          { '@type': 'ListItem', position: 3, name: L.schemaName, item: pageUrl },
        ],
      },
    ],
  };
}
