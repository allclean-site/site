// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { listArticles } from './src/lib/articles.ts';

const SITE = 'https://allclean.md';

// Blog posts are SSR (`export const prerender = false`), so @astrojs/sitemap — which only scans
// the prerendered static output — never sees them; the sitemap silently included the /blog and
// /ro/blog index pages but zero individual posts. Fetch the published slugs at build time and
// list them explicitly via `customPages` so they're not invisible to sitemap-based discovery.
async function blogSitemapPages() {
  try {
    const [ru, ro] = await Promise.all([listArticles('ru'), listArticles('ro')]);
    return [
      ...ru.map((a) => `${SITE}/blog/${a.slug}`),
      ...ro.map((a) => `${SITE}/ro/blog/${a.slug}`),
    ];
  } catch {
    return []; // build must not fail if Supabase is briefly unreachable
  }
}

// Russian is the primary (root) locale, Romanian lives under /ro.
// To later make Romanian primary, this is a one-line config change
// (swap defaultLocale) + content move — no painful URL migration.
export default defineConfig({
  site: SITE,
  i18n: {
    locales: ['ru', 'ro'],
    defaultLocale: 'ru',
    routing: {
      prefixDefaultLocale: false, // ru at /, ro at /ro
    },
  },
  // Static by default; blog pages opt into on-demand SSR via `export const prerender = false`.
  adapter: vercel(),
  integrations: [sitemap({ customPages: await blogSitemapPages() })],
  vite: {
    plugins: [tailwindcss()],
  },
});
