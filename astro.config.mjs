// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Russian is the primary (root) locale, Romanian lives under /ro.
// To later make Romanian primary, this is a one-line config change
// (swap defaultLocale) + content move — no painful URL migration.
export default defineConfig({
  site: 'https://allclean.pages.dev', // update to custom domain when connected
  i18n: {
    locales: ['ru', 'ro'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: false, // ru at /, ro at /ro
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
