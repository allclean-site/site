// Telegram lead notifier (Astro SSR, runs in the Cloudflare worker).
// Clients POST the lead summary AFTER it's saved to Supabase; this forwards it to the
// Telegram bot. Token is server-side only (env), never exposed to visitors.
export const prerender = false;

function env(locals: any) {
  const e = (locals && locals.runtime && locals.runtime.env) || {};
  return {
    TOKEN: e.TELEGRAM_BOT_TOKEN ?? (import.meta as any).env?.TELEGRAM_BOT_TOKEN,
    CHAT: e.TELEGRAM_CHAT_ID ?? (import.meta as any).env?.TELEGRAM_CHAT_ID,
  };
}
const json = (o: any, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

export async function POST({ request, locals }: any) {
  const { TOKEN, CHAT } = env(locals);
  if (!TOKEN || !CHAT) return json({ ok: false, error: 'telegram not configured' }, 500);

  const b = await request.json().catch(() => ({}));
  // light anti-spam: must look like a real lead
  if (!b || (!b.phone && !b.name)) return json({ ok: false, error: 'empty' }, 400);

  const L: string[] = [];
  L.push('🧼 Новая заявка — All Clean');
  if (b.service) L.push('📋 Услуга: ' + b.service);
  if (b.name) L.push('👤 Имя: ' + b.name);
  if (b.phone) L.push('📞 Телефон: ' + b.phone);
  if (b.estimate) L.push('💰 Оценка: ' + b.estimate);
  if (b.bedrooms) L.push('🚪 Комнат: ' + b.bedrooms);

  // calculator selections (object: label -> value | array)
  if (b.selections && typeof b.selections === 'object') {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(b.selections)) {
      const val = Array.isArray(v) ? (v as any[]).join(', ') : String(v);
      if (val) parts.push('   • ' + k + ': ' + val);
    }
    if (parts.length) L.push('🧩 Параметры:\n' + parts.join('\n'));
  }

  if (b.comment) L.push('💬 Комментарий: ' + b.comment);
  else if (b.notes) L.push('💬 Комментарий: ' + b.notes);
  if (b.locale) L.push('🌐 Язык: ' + String(b.locale).toUpperCase());
  if (b.source_url) L.push('🔗 Откуда: ' + b.source_url);

  const photos: string[] = Array.isArray(b.photos) ? b.photos.filter(Boolean) : [];
  if (photos.length) L.push('📷 Фото: ' + photos.length + ' шт.');

  const text = L.join('\n');
  const api = `https://api.telegram.org/bot${TOKEN}`;

  try {
    const r = await fetch(`${api}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
    });
    if (!r.ok) return json({ ok: false, error: 'tg ' + r.status + ' ' + (await r.text()).slice(0, 200) }, 502);

    // photos as an album (best-effort)
    if (photos.length) {
      const media = photos.slice(0, 10).map((url, i) => ({ type: 'photo', media: url, ...(i === 0 ? { caption: '📷 ' + (b.name || 'заявка') } : {}) }));
      await fetch(`${api}/sendMediaGroup`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT, media }),
      }).catch(() => {});
    }
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 502);
  }
}
