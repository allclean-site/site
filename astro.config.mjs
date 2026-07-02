// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Russian is the primary (root) locale, Romanian lives under /ro.
// To later make Romanian primary, this is a one-line config change
// (swap defaultLocale) + content move — no painful URL migration.
export default defineConfig({
  site: 'https://allclean-theta.vercel.app', // update to custom domain when connected
  i18n: {
    locales: ['ru', 'ro'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: false, // ru at /, ro at /ro
    },
  },
  // Static by default; blog pages opt into on-demand SSR via `export const prerender = false`.
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
