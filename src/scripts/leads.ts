// Booking-form → Supabase `site_leads`. Loaded on the Book Cleaning page (RU + RO).
import { SUPABASE_URL, SUPABASE_KEY } from '../lib/supabasePublic';

const PROJECT_SLUG = 'allclean';
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

const form = document.querySelector<HTMLFormElement>('form[name="wf-form-Contact-Form"]');
if (form) {
  const wrap = form.closest('.w-form') ?? form.parentElement;
  const done = wrap?.querySelector<HTMLElement>('.w-form-done') ?? null;
  const fail = wrap?.querySelector<HTMLElement>('.w-form-fail') ?? null;
  let projectId: string | null = null;

  async function getProjectId(): Promise<string | null> {
    if (projectId) return projectId;
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?slug=eq.${PROJECT_SLUG}&select=id`,
      { headers }
    );
    const rows = (await r.json()) as Array<{ id: string }>;
    projectId = rows?.[0]?.id ?? null;
    return projectId;
  }

  // Capture phase + stopImmediatePropagation so Webflow's own handler never fires.
  form.addEventListener(
    'submit',
    async (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const fd = new FormData(form);
      const submitBtn = form.querySelector<HTMLInputElement>('input[type="submit"]');
      if (submitBtn) submitBtn.value = submitBtn.dataset.wait || 'Отправка…';
      try {
        const pid = await getProjectId();
        const body = {
          project_id: pid,
          name: (fd.get('name') as string) || null,
          phone: (fd.get('Phone') as string) || null,
          service: (fd.get('Service-type') as string) || null,
          bedrooms: (fd.get('Number-of-bedrooms') as string) || null,
          notes: (fd.get('Message') as string) || null,
          locale: document.documentElement.lang.startsWith('ro') ? 'ro' : 'ru',
          source_url: location.href,
        };
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_leads`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        form.style.display = 'none';
        if (done) done.style.display = 'block';
      } catch (err) {
        console.error('Lead submit failed:', err);
        if (fail) fail.style.display = 'block';
      }
    },
    true
  );
}
