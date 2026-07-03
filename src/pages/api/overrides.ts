// Visual-editor overrides API (Astro SSR endpoint, runs in the Cloudflare worker).
//   GET  ?project&locale&page         -> { payload }            (public read)
//   POST {project,locale,page,payload[,publish]}  (x-edit-key)  -> save draft; publish triggers rebuild
//   POST {project,uploadFile:{name,type,dataBase64}} (x-edit-key) -> { url } file upload
//   POST multipart {file,project}      (x-edit-key)             -> { url } file upload (legacy path)
// File uploads are JSON+base64, not multipart/form-data: Astro's built-in CSRF origin-check
// targets form-content-types (multipart/form-data, x-www-form-urlencoded, text/plain) and on
// this Vercel deployment was rejecting every multipart POST with 403 "Cross-site POST form
// submissions are forbidden" even for same-origin requests. JSON isn't a form-content-type, so
// it never hits that check — no change to Astro's security settings needed. The multipart
// branch below is kept only as a legacy fallback; the editor client no longer sends it.
// Writes use the Supabase service role; the edit password (EDIT_KEY) gates all writes.
export const prerender = false;

import { SUPABASE_URL, SUPABASE_KEY } from '../../lib/supabasePublic';

function env(locals: any) {
  const e = (locals && locals.runtime && locals.runtime.env) || {};
  const pe = (typeof process !== 'undefined' && process.env) || {};
  return {
    EDIT_KEY: e.EDIT_KEY ?? pe.EDIT_KEY ?? (import.meta as any).env?.EDIT_KEY,
    SERVICE_ROLE: e.SUPABASE_SERVICE_ROLE_KEY ?? pe.SUPABASE_SERVICE_ROLE_KEY ?? (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY,
    // Host-agnostic: prefer DEPLOY_HOOK (Vercel deploy hook after the migration),
    // fall back to the legacy Cloudflare name so either env keeps working.
    DEPLOY_HOOK:
      e.DEPLOY_HOOK ?? pe.DEPLOY_HOOK ?? (import.meta as any).env?.DEPLOY_HOOK ??
      e.CF_DEPLOY_HOOK ?? pe.CF_DEPLOY_HOOK ?? (import.meta as any).env?.CF_DEPLOY_HOOK,
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

  // ---- file upload: legacy multipart path (kept for back-compat, client no longer sends this) ----
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

  const body = await request.json().catch(() => ({}));

  // ---- file upload: JSON+base64 path (current client) ----
  if (body.uploadFile && body.uploadFile.dataBase64) {
    const { name, type, dataBase64 } = body.uploadFile;
    const ext = (name?.split('.').pop() || 'jpg').toLowerCase();
    const path = `allclean/site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    let bytes: Uint8Array;
    try { bytes = Uint8Array.from(atob(dataBase64), (c: string) => c.charCodeAt(0)); }
    catch { return json({ ok: false, error: 'invalid base64' }, 400); }
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/article-images/${path}`, {
      method: 'POST',
      headers: { ...sb, 'content-type': type || 'application/octet-stream', 'x-upsert': 'true' },
      body: bytes,
    });
    if (!up.ok) return json({ ok: false, error: 'upload failed: ' + (await up.text()) }, 502);
    return json({ ok: true, url: `${SUPABASE_URL}/storage/v1/object/public/article-images/${path}` });
  }

  // ---- save / publish ----
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
    if (!DEPLOY_HOOK) return json({ ok: true, warning: 'saved, but DEPLOY_HOOK is not set — no rebuild triggered' });
    await fetch(DEPLOY_HOOK, { method: 'POST' }).catch(() => {});
  }
  return json({ ok: true });
}
