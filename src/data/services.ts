// Per-service landing content (RU + RO). page slug === calculator slug.
// Used by src/pages/services/[slug].astro + ro/services/[slug].astro + ServiceLanding.astro.
// SEO/GEO/AEO: meta titles/descriptions with city, FAQ for answer-engines, Service schema.

export interface ServiceFaq { q: string; a: string }
export interface ServiceHero { words: string[]; cities: string[] }
export interface ServiceLocale {
  metaTitle: string;
  metaDescription: string;
  schemaName: string;        // Service name for JSON-LD
  schemaDescription: string; // short citable summary (AEO)
  hero: ServiceHero;
  faq: ServiceFaq[];
}
export interface Service {
  slug: string;       // page + calculator slug
  calcSlug: string;
  ru: ServiceLocale;
  ro: ServiceLocale;
}

const CITIES_RU = ['КИШИНЁВЕ', 'ЧОКАНЕ', 'БОТАНИКЕ', 'РЫШКАНОВКЕ', 'КИШИНЁВЕ'];
const CITIES_RO = ['CHIȘINĂU', 'CIOCANA', 'BOTANICA', 'RÂȘCANI', 'CHIȘINĂU'];

export const SERVICES: Service[] = [
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
      hero: { words: ['УБОРКА', 'ОФИСОВ', 'В'], cities: CITIES_RU },
      faq: [
        {
          q: 'Что входит в уборку офиса?',
          a: 'Ежедневная уборка офиса включает мойку и пылесос полов, протирание столов, оргтехники и поверхностей до 2 м, чистку зеркал и стекла, чистку и дезинфекцию санузлов, вынос мусора и пополнение расходников — туалетной бумаги, мыла, полотенец и освежителя.',
        },
        {
          q: 'Как часто нужно убирать офис?',
          a: 'От разовой генеральной уборки до ежедневного обслуживания всего здания. При регулярном графике — еженедельно, два раза в неделю или ежедневно — действует скидка: чем чаще уборка, тем ниже цена за выезд.',
        },
        {
          q: 'Сколько стоит уборка офиса в Кишинёве?',
          a: 'Цена зависит от площади, типа уборки и частоты. Рассчитайте предварительную стоимость в калькуляторе выше за минуту — точную цену менеджер подтвердит после бесплатного осмотра помещения.',
        },
        {
          q: 'Вы убираете после рабочего дня?',
          a: 'Да. Мы подстраиваемся под график компании и можем убирать рано утром или вечером, чтобы не мешать сотрудникам и рабочим процессам.',
        },
        {
          q: 'Какие средства вы используете?',
          a: 'Мы работаем профессиональным оборудованием и сертифицированными эко-средствами европейских брендов, безопасными для сотрудников и посетителей офиса.',
        },
      ],
    },
    ro: {
      metaTitle: 'Curățenie birouri Chișinău — preț și calcul online | All Clean',
      metaDescription:
        'Curățenie profesională a birourilor în Chișinău: întreținere zilnică, curățenie generală și după renovare. Calculează prețul online într-un minut și comandă. Evaluare gratuită, soluții ecologice.',
      schemaName: 'Curățenie birouri în Chișinău',
      schemaDescription:
        'Curățenie profesională a birourilor și spațiilor comerciale în Chișinău: de la întreținere zilnică la curățenie generală și după renovare. Calcul online transparent și evaluare gratuită la fața locului.',
      hero: { words: ['CURĂȚENIE', 'BIROURI', 'ÎN'], cities: CITIES_RO },
      faq: [
        {
          q: 'Ce include curățenia biroului?',
          a: 'Curățenia zilnică a biroului include aspirarea și spălarea pardoselilor, ștergerea birourilor, a echipamentelor de birou și a suprafețelor până la 2 m, curățarea oglinzilor și a sticlei, curățarea și dezinfecția grupurilor sanitare, evacuarea gunoiului și completarea consumabilelor — hârtie igienică, săpun, prosoape și odorizant.',
        },
        {
          q: 'Cât de des trebuie făcută curățenia în birou?',
          a: 'De la o curățenie generală unică până la întreținerea zilnică a întregii clădiri. Pentru un program regulat — săptămânal, de două ori pe săptămână sau zilnic — se aplică reducere: cu cât mai des, cu atât prețul per vizită este mai mic.',
        },
        {
          q: 'Cât costă curățenia unui birou în Chișinău?',
          a: 'Prețul depinde de suprafață, tipul curățeniei și frecvență. Calculează costul aproximativ în calculatorul de mai sus într-un minut — prețul exact va fi confirmat de manager după evaluarea gratuită a spațiului.',
        },
        {
          q: 'Faceți curățenie după programul de lucru?',
          a: 'Da. Ne adaptăm la programul companiei și putem face curățenie dimineața devreme sau seara, ca să nu deranjăm angajații și procesele de lucru.',
        },
        {
          q: 'Ce soluții folosiți?',
          a: 'Lucrăm cu echipament profesional și soluții ecologice certificate de la branduri europene, sigure pentru angajați și vizitatorii biroului.',
        },
      ],
    },
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
