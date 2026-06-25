// Fetch a service price calculator config from Supabase (plain fetch — SSR/Workers friendly).
import { SUPABASE_URL, SUPABASE_KEY } from './supabasePublic';

const PROJECT = 'allclean';

export interface Calculator {
  slug: string;
  name: Record<string, string>;
  config: any;
  enabled: boolean;
}

export async function getCalculator(slug: string): Promise<Calculator | null> {
  const q = `${SUPABASE_URL}/rest/v1/calculators?select=slug,name,config,enabled&project=eq.${PROJECT}&slug=eq.${encodeURIComponent(slug)}&enabled=eq.true&limit=1`;
  const r = await fetch(q, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] ?? null;
}
