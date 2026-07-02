// Visual-editor overrides API (Astro SSR endpoint, runs in the Cloudflare worker).
//   GET  ?project&locale&page         -> { payload }            (public read)
//   POST {project,locale,page,payload[,publish]}  (x-edit-key)  -> save draft; publish triggers rebuild
//   POST multipart {file,project}      (x-edit-key)             -> { url } image upload
// Writes use the Supabase service role; the edit password (EDIT_KEY) gates all writes.
export const prerender = false;

import { SUPABASE_URL, SUPABASE_KEY } from '../../lib/supabasePublic';

function env(locals: any) {
  const e = (locals && locals.runtime && locals.runtime.env) || {};
  const pe = (typeof process !== 'undefined' && process.env) || {};
  return {
    EDIT_KEY: e.EDIT_KEY ?? pe.EDIT_KEY ?? (import.meta as any).env?.EDIT_KEY,
    SERVICE_ROLE: e.SUPABASE_SERVICE_ROLE_KEY ?? pe.SUPABASE_SERVICE_ROLE_KEY ?? (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY,
    DEPLOY_HOOK: e.CF_DEPLOY_HOOK ?? pe.CF_DEPLOY_HOOK ?? (import.meta as any).env?.CF_DEPLOY_HOOK,
  };
}
const json = (o: any, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
const norm = (p: string) => (p || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

export async function GET({ url }: any) {
  const project = url.searchParams.get('project') || 'allclean';
  const locale = url.searchParams.get('locale') || 'ru';
  const page = norm(url.searchParams.get('page') || '/');
  const q = `${SUPABASE_URL}/rest/v1/page_overrides?select=payload&project=eq.${encodeURIComponent(project)}&locale=eq.${locale}&page_path=eq.${encodeURIComponent(page)}&limit=1`;
  const r = await fetch(q, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  const rows = r.ok ? await r.json() : [];
  return json({ ok: true, payload: rows[0]?.payload || {} });
}

export async function POST({ request, locals }: any) {
  const { EDIT_KEY, SERVICE_ROLE, DEPLOY_HOOK } = env(locals);
  const key = request.headers.get('x-edit-key') || '';
  if (!EDIT_KEY || key !== EDIT_KEY) return json({ ok: false, error: 'unauthorized' }, 401);
  if (!SERVICE_ROLE) return json({ ok: false, error: 'server not configured (SUPABASE_SERVICE_ROLE_KEY)' }, 500);

  const ct = request.headers.get('content-type') || '';
  const sb = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };

  // ---- image upload ----
  if (ct.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return json({ ok: false, error: 'no file' }, 400);
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    const path = `allclean/site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/article-images/${path}`, {
      method: 'POST',
      headers: { ...sb, 'content-type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
      body: await file.arrayBuffer(),
    });
    if (!up.ok) return json({ ok: false, error: 'upload failed: ' + (await up.text()) }, 502);
    return json({ ok: true, url: `${SUPABASE_URL}/storage/v1/object/public/article-images/${path}` });
  }

  // ---- save / publish ----
  const body = await request.json().catch(() => ({}));
  const project = body.project || 'allclean';
  const locale = body.locale === 'ro' ? 'ro' : 'ru';
  const page = norm(body.page || '/');
  const payload = body.payload || {};

  const up = await fetch(`${SUPABASE_URL}/rest/v1/page_overrides?on_conflict=project,locale,page_path`, {
    method: 'POST',
    headers: { ...sb, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ project, locale, page_path: page, payload, updated_at: new Date().toISOString() }),
  });
  if (!up.ok) return json({ ok: false, error: 'save failed: ' + (await up.text()) }, 502);

  if (body.publish) {
    if (!DEPLOY_HOOK) return json({ ok: true, warning: 'saved, but CF_DEPLOY_HOOK is not set — no rebuild triggered' });
    await fetch(DEPLOY_HOOK, { method: 'POST' }).catch(() => {});
  }
  return json({ ok: true });
}
