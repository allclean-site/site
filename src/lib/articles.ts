// Fetch published blog articles from Supabase REST (plain fetch — Workers/SSR friendly).
import { SUPABASE_URL, SUPABASE_KEY } from './supabasePublic';

// AllClean project id (projects.slug = 'allclean').
const PROJECT_ID = '8878db57-c541-4502-bfa6-ae812dc3aefd';

export type Locale = 'ru' | 'ro';

export interface FaqItem { question: string; answer: string; }
export interface ArticleMeta { faq?: FaqItem[]; takeaways?: string[]; tags?: string[]; }
export interface Article {
  id: string;
  group_id: string;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cover_url: string | null;
  image2_url: string | null;
  meta: ArticleMeta | null;
  jsonld: any | null;
  created_at: string;
  updated_at: string;
}

async function supaGet<T>(query: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

const LIST_FIELDS = 'id,slug,title,excerpt,cover_url,created_at';
const FULL_FIELDS =
  'id,group_id,locale,slug,title,excerpt,body,seo_title,seo_description,cover_url,image2_url,meta,jsonld,created_at,updated_at';

/** Published articles for a locale, newest first. */
export async function listArticles(locale: Locale): Promise<Article[]> {
  return supaGet<Article[]>(
    `select=${LIST_FIELDS}&project_id=eq.${PROJECT_ID}&locale=eq.${locale}&status=eq.published&order=created_at.desc`,
  );
}

/** Single published article by locale + slug, or null. */
export async function getArticle(locale: Locale, slug: string): Promise<Article | null> {
  const rows = await supaGet<Article[]>(
    `select=${FULL_FIELDS}&project_id=eq.${PROJECT_ID}&locale=eq.${locale}&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
  );
  const article = rows[0] ?? null;
  if (article?.jsonld) {
    // The CMS baked mainEntityOfPage.@id with the old allclean.pages.dev domain at
    // creation time; the site has since moved to allclean.md. Fix it on the way out
    // rather than requiring a CMS/Supabase write for every existing + future article.
    article.jsonld = JSON.parse(
      JSON.stringify(article.jsonld).replaceAll('https://allclean.pages.dev', 'https://allclean.md'),
    );
  }
  return article;
}

/** Slug of the same article in the other locale (for hreflang), or null. */
export async function counterpartSlug(groupId: string, otherLocale: Locale): Promise<string | null> {
  const rows = await supaGet<{ slug: string }[]>(
    `select=slug&group_id=eq.${groupId}&locale=eq.${otherLocale}&status=eq.published&limit=1`,
  );
  return rows[0]?.slug ?? null;
}
