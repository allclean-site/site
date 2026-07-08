// Public Supabase config for the site.
// Defaults to the shared agency instance; a per-deploy override (a client's own
// Supabase project) is supplied via PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON
// env vars on that project's Vercel — so the SAME code serves both the agency
// deploy and a handed-off client deploy, differing only by env.
// The anon (publishable) key is safe to ship to the client; RLS protects data.
export const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL || 'https://hbdjboimxqwkzxntidzt.supabase.co';
export const SUPABASE_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON || 'sb_publishable_HovRZnqMhQiTiM8WC-wjBA_lbTH533G';

// Public storage base for site images (buckets are public).
export const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;
