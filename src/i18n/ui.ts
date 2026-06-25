export const languages = { ru: 'Русский', ro: 'Română' } as const;
export const defaultLang: Lang = 'ru';
export type Lang = keyof typeof languages;

// UI strings shared across pages (chrome: nav, buttons).
// Page/CMS content lives in content collections, not here.
export const ui = {
  ru: {
    'nav.services': 'Услуги',
    'nav.pricing': 'Цены',
    'nav.about': 'О нас',
    'nav.faq': 'Вопросы',
    'nav.blog': 'Блог',
    'cta.book': 'Записаться на уборку',
    'hero.title': 'Уборка для занятых людей в Кишинёве',
  },
  ro: {
    'nav.services': 'Servicii',
    'nav.pricing': 'Prețuri',
    'nav.about': 'Despre noi',
    'nav.faq': 'Întrebări',
    'nav.blog': 'Blog',
    'cta.book': 'Programează o curățenie',
    'hero.title': 'Curățenie pentru oameni ocupați din Chișinău',
  },
} as const;

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)['ru']): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}
