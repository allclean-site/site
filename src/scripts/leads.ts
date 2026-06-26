// Booking-form → Supabase `site_leads`. Loaded on the Book Cleaning page (RU + RO).
import { SUPABASE_URL, SUPABASE_KEY } from '../lib/supabasePublic';

const PROJECT_SLUG = 'allclean';
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

const isRo = document.documentElement.lang.startsWith('ro');
const T = isRo
  ? {
      phoneBad: 'Introduceți un număr valid: +373 XX XXX XXX.',
      consentNeed: 'Confirmați acordul privind prelucrarea datelor.',
      err: 'Nu s-a putut trimite. Sunați: +373 79 955 044',
    }
  : {
      phoneBad: 'Введите корректный номер: +373 XX XXX XXX.',
      consentNeed: 'Подтвердите согласие на обработку данных.',
      err: 'Не удалось отправить. Позвоните: +373 79 955 044',
    };

const form = document.querySelector<HTMLFormElement>('form[name="wf-form-Contact-Form"]');
if (form) {
  const wrap = form.closest('.w-form') ?? form.parentElement;
  const done = wrap?.querySelector<HTMLElement>('.w-form-done') ?? null;
  const fail = wrap?.querySelector<HTMLElement>('.w-form-fail') ?? null;
  const msg = document.getElementById('book-msg');
  const consent = document.getElementById('book-consent') as HTMLInputElement | null;
  const phEl = document.getElementById('Phone') as HTMLInputElement | null;
  let projectId: string | null = null;

  // phone mask: +373 XX XXX XXX (Moldova)
  if (phEl) {
    const maskPhone = () => {
      let d = phEl.value.replace(/\D/g, '');
      if (d.indexOf('373') === 0) d = d.slice(3);
      d = d.slice(0, 8);
      let out = '+373';
      if (d.length) out += ' ' + d.slice(0, 2);
      if (d.length > 2) out += ' ' + d.slice(2, 5);
      if (d.length > 5) out += ' ' + d.slice(5, 8);
      phEl.value = out;
    };
    phEl.addEventListener('focus', () => { if (!phEl.value.trim()) phEl.value = '+373 '; });
    phEl.addEventListener('input', maskPhone);
  }

  function showErr(text: string) {
    if (msg) { msg.textContent = text; msg.className = 'book-msg'; }
  }

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

      // Validate phone (must be +373 + 8 digits = 11 digits total) and consent.
      const phDigits = (phEl?.value || '').replace(/\D/g, '');
      if (phDigits.length !== 11) { showErr(T.phoneBad); phEl?.focus(); return; }
      if (consent && !consent.checked) { showErr(T.consentNeed); return; }
      if (msg) msg.textContent = '';

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
          locale: isRo ? 'ro' : 'ru',
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
        showErr(T.err);
        if (fail) fail.style.display = 'block';
      }
    },
    true
  );
}
