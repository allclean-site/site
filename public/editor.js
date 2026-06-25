/* AllClean visual editor — dormant unless the URL has ?lgedit.
   Per-locale, per-page. RU and RO are edited independently (no cross-language sync).
   Capabilities: edit text (dbl-click) · replace photos/backgrounds (📷) · change links (🔗)
   · width/line-height/font-size · delete elements · mobile preview · autosave + publish.
   Saves to /api/overrides keyed by (project=allclean, locale, page). Server bakes overrides
   into the static build on publish, so edits are server-rendered and indexable. */
(function () {
  if (!/(?:[?&#]lgedit\b)/.test(location.search + location.hash)) return;

  var LANG = document.documentElement.lang && document.documentElement.lang.indexOf('ro') === 0 ? 'ro' : 'ru';
  var PROJECT = 'allclean';
  // normalized page path (no query/hash, no trailing slash except root)
  var PAGE = (location.pathname.replace(/\/+$/, '') || '/');
  var CH = { texts: [], textsel: [], links: [], images: [], backgrounds: [], styles: [], removed: [] };
  var KEY = sessionStorage.getItem('ac_edit_key') || '';
  var SEL = null;

  var setStatus = function () {};
  var refreshPw = function () {};
  function focusPw() { var i = document.getElementById('eedpw'); if (i) { i.focus(); i.select(); } }
  function payload() { return { texts: CH.texts, textsel: CH.textsel, links: CH.links, images: CH.images, backgrounds: CH.backgrounds, styles: CH.styles, removed: CH.removed }; }

  // ---------- save / publish ----------
  var saveT = null;
  function post(extra, cb) {
    fetch('/api/overrides', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-edit-key': KEY },
      body: JSON.stringify(Object.assign({ project: PROJECT, locale: LANG, page: PAGE, payload: payload() }, extra || {})),
    }).then(function (r) { return r.json().catch(function () { return { ok: r.ok, status: r.status }; }); })
      .then(function (d) {
        if (d && d.ok) { cb && cb(d); return; }
        if (d && (d.error === 'unauthorized' || d.status === 401)) {
          sessionStorage.removeItem('ac_edit_key'); KEY = ''; refreshPw(); setStatus('✗ неверный пароль'); focusPw(); return;
        }
        setStatus('✗ ' + ((d && d.error) || 'ошибка'));
      })
      .catch(function () { setStatus('✗ ошибка сети'); });
  }
  function doSave() {
    if (!KEY) { setStatus('✗ введите пароль'); refreshPw(); focusPw(); return; }
    setStatus('сохраняю…');
    post(null, function () { setStatus('✓ сохранено (черновик)'); });
  }
  function scheduleSave() { clearTimeout(saveT); saveT = setTimeout(doSave, 700); }
  function doPublish() {
    if (!KEY) { setStatus('✗ введите пароль'); refreshPw(); focusPw(); return; }
    clearTimeout(saveT); setStatus('публикую…');
    post({ publish: true }, function () { setStatus('✓ опубликовано — сайт пересобирается (~1–2 мин)'); });
  }

  // ---------- image downscale + upload (server-side, keeps the key off the client) ----------
  function downscaleImage(file, cb) {
    try {
      if (!file || !/^image\//.test(file.type) || /gif|svg/.test(file.type) || file.size < 1.2 * 1024 * 1024) { cb(file); return; }
      var url = URL.createObjectURL(file), img = new Image();
      img.onerror = function () { cb(file); };
      img.onload = function () {
        try {
          var MAX = 2400, w = img.naturalWidth, h = img.naturalHeight, sc = Math.min(1, MAX / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
          var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
          cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
          var base = (file.name || 'img').replace(/\.\w+$/, '');
          cv.toBlob(function (b) {
            if (b && b.size < file.size) cb(new File([b], base + '.webp', { type: 'image/webp' }));
            else cv.toBlob(function (j) { cb(j && j.size < file.size ? new File([j], base + '.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.82);
          }, 'image/webp', 0.82);
        } catch (e) { cb(file); }
      };
      img.src = url;
    } catch (e) { cb(file); }
  }
  function uploadFile(file, cb) {
    var fd = new FormData(); fd.append('file', file); fd.append('project', PROJECT);
    fetch('/api/overrides', { method: 'POST', headers: { 'x-edit-key': KEY }, body: fd })
      .then(function (r) {
        if (r.status === 401) { sessionStorage.removeItem('ac_edit_key'); KEY = ''; refreshPw(); setStatus('✗ неверный пароль'); focusPw(); cb(null); return; }
        if (r.status === 413) { setStatus('✗ фото слишком большое'); cb(null); return; }
        r.json().then(function (d) { cb(d && d.url); }).catch(function () { cb(null); });
      }).catch(function () { cb(null); });
  }

  // ---------- styles ----------
  var S = document.createElement('style');
  S.textContent =
    '[data-eedit]:hover{outline:2px dashed #2b6cf6;outline-offset:2px;cursor:text}' +
    '[data-eedit][contenteditable="true"]{outline:2px solid #2b6cf6;outline-offset:2px}' +
    '.eed-sel{outline:2px solid #16a34a!important;outline-offset:2px}' +
    'body.eed-del,body.eed-del *{cursor:crosshair!important}' +
    'body.eed-mobile{max-width:390px;margin:0 auto;box-shadow:0 0 0 100vmax rgba(0,0,0,.35);overflow-x:hidden}' +
    '.eed-badge{position:absolute;z-index:999998;background:#2b6cf6;color:#fff;font:600 12px Inter,system-ui,sans-serif;' +
      'border:0;border-radius:6px;padding:4px 8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}' +
    '.eed-badge.lnk{background:#0c2959}' +
    /* Apple-style frosted glass panel with a purple tint */
    '#eed{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:999999;max-width:calc(100% - 24px);' +
      'background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(24,14,46,.50));' +
      '-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);' +
      'color:#fff;font:14px Inter,system-ui,sans-serif;padding:10px 16px;display:flex;gap:9px;align-items:center;flex-wrap:wrap;' +
      'border:1px solid rgba(184,160,255,.32);border-radius:20px;' +
      'box-shadow:0 16px 50px rgba(76,29,149,.45),0 2px 8px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.22)}' +
    '#eed b{font-weight:700;letter-spacing:.01em}' +
    '#eed button{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:12px;' +
      'padding:7px 12px;font-weight:600;cursor:pointer;transition:.15s;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '#eed button:hover{background:rgba(255,255,255,.28);border-color:rgba(255,255,255,.35)}' +
    '#eed .alt{background:rgba(255,255,255,.09)}' +
    '#eed #eedpub{background:linear-gradient(135deg,#b07cff,#7c3aed);border:1px solid rgba(255,255,255,.28);' +
      'box-shadow:0 6px 18px rgba(124,58,237,.55)}' +
    '#eed .on{background:linear-gradient(135deg,rgba(134,239,172,.5),rgba(34,197,94,.5));border-color:rgba(134,239,172,.55)}' +
    '#eed .grp{display:flex;gap:5px;align-items:center;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);' +
      'border-radius:12px;padding:4px 9px;font-size:13px}' +
    '#eed .grp button{padding:1px 10px;border-radius:8px;font-size:16px;line-height:1;border:0;background:rgba(255,255,255,.16)}' +
    '#eed .off{opacity:.35;pointer-events:none}' +
    '#eed input{border-radius:10px;border:1px solid rgba(255,255,255,.30);background:rgba(255,255,255,.10);color:#fff;' +
      'font:13px Inter,system-ui,sans-serif;padding:6px 9px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '#eed input::placeholder{color:rgba(255,255,255,.62)}';
  document.head.appendChild(S);

  // ---------- selector ----------
  function cssPath(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      var sel = el.tagName.toLowerCase();
      var cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(function (c) { return c && c !== 'eed-sel'; });
      if (cls.length) sel += '.' + CSS.escape(cls[0]);
      var idx = 1, sib = el;
      while ((sib = sib.previousElementSibling)) { if (sib.tagName === el.tagName) idx++; }
      sel += ':nth-of-type(' + idx + ')';
      parts.unshift(sel); el = el.parentNode;
    }
    return parts.join(' > ');
  }
  function recStyle(el) {
    var sel = cssPath(el), s = {};
    if (el.style.width) s['width'] = el.style.width;
    if (el.style.maxWidth) s['max-width'] = el.style.maxWidth;
    if (el.style.lineHeight) s['line-height'] = el.style.lineHeight;
    if (el.style.fontSize) s['font-size'] = el.style.fontSize;
    CH.styles = CH.styles.filter(function (c) { return c.selector !== sel; });
    if (Object.keys(s).length) CH.styles.push({ selector: sel, styles: s });
    scheduleSave();
  }

  // ---------- editable text ----------
  var TAGS = 'h1,h2,h3,h4,h5,h6,p,a,span,div,li,button,strong,em,blockquote';
  var INLINE = { B: 1, I: 1, EM: 1, STRONG: 1, SPAN: 1, A: 1, BR: 1, SMALL: 1, SUP: 1, SUB: 1, U: 1, MARK: 1, CODE: 1 };
  var INLINE_LEAF = { A: 1, SPAN: 1, STRONG: 1, EM: 1, B: 1, SMALL: 1, U: 1, MARK: 1 };
  function markEditable(root) {
    (root || document).querySelectorAll(TAGS).forEach(function (el) {
      if (el.closest('#eed') || el.hasAttribute('data-eedit')) return;
      if (el.parentElement && el.parentElement.closest('[data-eedit]')) {
        if (!(el.children.length === 0 && INLINE_LEAF[el.tagName])) return;
      }
      var t = (el.textContent || '').trim(); if (!t) return;
      for (var i = 0; i < el.children.length; i++) if (!INLINE[el.children[i].tagName]) return;
      el.setAttribute('data-eedit', ''); el.dataset.eorig = t;
    });
  }
  function showSel() {
    document.querySelectorAll('.eed-sel').forEach(function (e) { e.classList.remove('eed-sel'); });
    if (SEL) SEL.classList.add('eed-sel');
  }
  function select(el) { SEL = el; showSel(); updateBar(); }

  document.addEventListener('dblclick', function (e) {
    var el = e.target.closest('[data-eedit]'); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    el.setAttribute('contenteditable', 'true'); el.focus(); select(el);
  }, true);
  document.addEventListener('click', function (e) {
    if (delMode) return;
    var el = e.target.closest && e.target.closest('[data-eedit]');
    if (el && el.getAttribute('contenteditable') !== 'true') { e.preventDefault(); select(el); }
  }, false);
  document.addEventListener('blur', function (e) {
    var el = e.target; if (!el || !el.hasAttribute || !el.hasAttribute('data-eedit')) return;
    el.removeAttribute('contenteditable');
    var nw = (el.textContent || '').trim(), old = el.dataset.eorig || '';
    if (!nw || nw === old) return;
    if (el.children.length) {
      var sel = cssPath(el);
      CH.textsel = CH.textsel.filter(function (c) { return c.selector !== sel; });
      CH.textsel.push({ selector: sel, html: el.innerHTML });
    } else {
      CH.texts = CH.texts.filter(function (c) { return c.old !== old; });
      CH.texts.push({ old: old, 'new': nw });
    }
    el.dataset.eorig = nw; scheduleSave();
  }, true);

  // ---------- image / background badges ----------
  var picker = document.createElement('input');
  picker.type = 'file'; picker.accept = 'image/*'; picker.style.display = 'none';
  document.body.appendChild(picker);
  var BG_LAST_URL = /url\((["']?)[^)]*\1\)(?![\s\S]*url\()/;
  var cur = null;
  picker.addEventListener('change', function () {
    var f = picker.files[0], C = cur; if (!f || !C) return;
    var bgTmpl = C.type === 'bg' ? getComputedStyle(C.el).backgroundImage.replace(BG_LAST_URL, 'url("__URL__")') : null;
    var r = new FileReader();
    r.onload = function () {
      if (C.type === 'img') { C.el.src = r.result; C.el.removeAttribute('srcset'); }
      else { C.el.style.backgroundImage = bgTmpl.replace('__URL__', r.result); C.el.style.backgroundSize = 'cover'; C.el.style.backgroundPosition = 'center'; }
    };
    r.readAsDataURL(f);
    if (!KEY) { setStatus('✗ введите пароль для загрузки фото'); refreshPw(); focusPw(); return; }
    setStatus('загружаю фото…');
    downscaleImage(f, function (uf) {
      uploadFile(uf, function (url) {
        if (!url) { setStatus('✗ фото не загружено'); return; }
        if (C.type === 'img') {
          C.el.removeAttribute('srcset'); C.el.removeAttribute('sizes'); C.el.src = url;
          var slot = C.el.getAttribute('data-slot') || cssPath(C.el);
          if (!C.el.getAttribute('data-slot')) C.el.setAttribute('data-slot', slot);
          CH.images = CH.images.filter(function (c) { return c.slot !== slot; });
          CH.images.push({ slot: slot, url: url });
        } else {
          C.el.style.backgroundImage = bgTmpl.replace('__URL__', url);
          var sel = cssPath(C.el);
          CH.backgrounds = CH.backgrounds.filter(function (c) { return c.selector !== sel; });
          CH.backgrounds.push({ selector: sel, css: bgTmpl, url: url });
        }
        scheduleSave();
      });
    });
  });
  var badges = [];
  function addBadge(el, type, label, cls) {
    var b = document.createElement('button');
    b.className = 'eed-badge' + (cls ? ' ' + cls : ''); b.textContent = label;
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (type === 'link') { editLink(el); return; }
      cur = { type: type, el: el }; picker.value = ''; picker.click();
    });
    document.body.appendChild(b); badges.push({ b: b, el: el, type: type });
  }
  function buildBadges() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.closest('#eed')) return;
      if (!img.getAttribute('data-slot')) img.setAttribute('data-slot', cssPath(img));
      addBadge(img, 'img', '📷 фото');
    });
    document.querySelectorAll('*').forEach(function (el) {
      if (el.closest('#eed') || el.tagName === 'IMG') return;
      if (getComputedStyle(el).backgroundImage.indexOf('url(') < 0) return;
      var r = el.getBoundingClientRect(); if (r.width * r.height < 40000) return;
      addBadge(el, 'bg', '🖼 фон');
    });
    document.querySelectorAll('a[href],button').forEach(function (el) {
      if (el.closest('#eed')) return;
      addBadge(el, 'link', '🔗 ссылка', 'lnk');
    });
  }
  function placeBadges() {
    var seen = {};
    badges.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      var vis = r.width > 4 && r.height > 4 && o.el.offsetParent !== null;
      if (!vis) { o.b.style.display = 'none'; return; }
      // stack link/img/bg badges on the same element so they don't overlap
      var keyp = Math.round(r.top) + 'x' + Math.round(r.left); var off = seen[keyp] = (seen[keyp] || 0);
      seen[keyp] += 28;
      o.b.style.display = 'block';
      o.b.style.top = (window.scrollY + r.top + 6 + off) + 'px';
      o.b.style.left = (window.scrollX + r.left + 6) + 'px';
    });
  }
  window.addEventListener('scroll', placeBadges, true);
  window.addEventListener('resize', placeBadges);
  setInterval(placeBadges, 600);

  // ---------- link editing ----------
  function editLink(el) {
    var cur = el.getAttribute('href') || '';
    var val = window.prompt('Ссылка для этого элемента (href):', cur);
    if (val == null) return;
    val = val.trim();
    el.setAttribute('href', val);
    var sel = cssPath(el);
    CH.links = CH.links.filter(function (c) { return c.selector !== sel; });
    CH.links.push({ selector: sel, href: val });
    setStatus('ссылка обновлена'); scheduleSave();
  }

  // ---------- delete mode ----------
  var delMode = false, delHover = null;
  function skipDel(t) { return !t || t === document.body || t === document.documentElement || (t.closest && t.closest('#eed')) || (t.classList && t.classList.contains('eed-badge')); }
  function setDelMode(on) {
    delMode = on; document.body.classList.toggle('eed-del', on);
    var b = document.getElementById('eeddel'); if (b) b.classList.toggle('on', on);
    if (delHover) { delHover.style.outline = ''; delHover = null; }
    setStatus(on ? 'режим удаления: клик по элементу' : '');
  }
  document.addEventListener('mousemove', function (e) {
    if (!delMode) return; var t = e.target;
    if (delHover && delHover !== t) delHover.style.outline = '';
    if (skipDel(t)) { delHover = null; return; }
    delHover = t; t.style.outline = '2px solid #ef4444'; t.style.outlineOffset = '1px';
  }, true);
  document.addEventListener('click', function (e) {
    if (!delMode) return; var t = e.target; if (skipDel(t)) return;
    e.preventDefault(); e.stopPropagation();
    var sel = cssPath(t); if (!sel) return;
    if (CH.removed.indexOf(sel) < 0) CH.removed.push(sel);
    t.style.outline = ''; t.style.setProperty('display', 'none', 'important');
    delHover = null; placeBadges(); scheduleSave();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && delMode) setDelMode(false); });

  // ---------- toolbar ----------
  var bar = document.createElement('div'); bar.id = 'eed';
  bar.innerHTML =
    '<b>✏️ Редактор (' + LANG.toUpperCase() + ')</b>' +
    '<span style="opacity:.7;font-size:12px">2× клик — текст · 📷 фото · 🔗 ссылка · автосохранение</span>' +
    '<span class="grp off" id="eedw">Ширина <button data-w="-1">−</button><button data-w="1">+</button></span>' +
    '<span class="grp off" id="eedl">Интервал <button data-l="-1">−</button><button data-l="1">+</button></span>' +
    '<span class="grp off" id="eedf">Шрифт <button data-f="-1">−</button><button data-f="1">+</button></span>' +
    '<button class="alt" id="eedmob" title="мобильный вид">📱 Моб.</button>' +
    '<button class="alt" id="eeddel" title="режим удаления">🗑</button>' +
    '<span style="flex:1"></span>' +
    '<span class="grp" id="eedpwg"><input id="eedpw" type="password" placeholder="пароль" autocomplete="off" style="width:104px"/><button id="eedpwb">войти</button></span>' +
    '<span id="eedst" style="opacity:.85;font-size:13px;min-width:120px;text-align:right"></span>' +
    '<button id="eedsave" class="alt">💾 Черновик</button>' +
    '<button id="eedpub">🚀 Опубликовать</button>';
  document.body.appendChild(bar);

  function updateBar() {
    var on = !!SEL;
    ['eedw', 'eedl', 'eedf'].forEach(function (id) { document.getElementById(id).classList.toggle('off', !on); });
  }
  bar.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'eedmob') { document.body.classList.toggle('eed-mobile'); t.classList.toggle('on'); placeBadges(); return; }
    if (t.id === 'eeddel') { setDelMode(!delMode); return; }
    if (t.dataset && t.dataset.w !== undefined && SEL) {
      var cw = parseInt(SEL.style.width) || Math.round(SEL.getBoundingClientRect().width);
      var nw = Math.max(80, cw + (t.dataset.w === '1' ? 40 : -40));
      SEL.style.setProperty('width', nw + 'px', 'important'); SEL.style.setProperty('max-width', nw + 'px', 'important');
      recStyle(SEL); placeBadges();
    }
    if (t.dataset && t.dataset.l !== undefined && SEL) {
      var cl = parseFloat(SEL.style.lineHeight) || parseFloat(getComputedStyle(SEL).lineHeight) || 24;
      SEL.style.lineHeight = Math.max(10, cl + (t.dataset.l === '1' ? 2 : -2)) + 'px'; recStyle(SEL);
    }
    if (t.dataset && t.dataset.f !== undefined && SEL) {
      var cf = parseFloat(SEL.style.fontSize) || parseFloat(getComputedStyle(SEL).fontSize) || 16;
      var nf = Math.max(8, Math.round((cf + (t.dataset.f === '1' ? 2 : -2)) * 10) / 10);
      SEL.style.setProperty('font-size', nf + 'px', 'important');
      SEL.querySelectorAll('*').forEach(function (c) { if (!c.children.length) c.style.setProperty('font-size', 'inherit', 'important'); });
      recStyle(SEL); placeBadges();
    }
  });

  var stEl = document.getElementById('eedst');
  setStatus = function (t) {
    if (!stEl) return; stEl.textContent = t || '';
    stEl.style.color = /✓/.test(t) ? '#86efac' : (/✗/.test(t) ? '#fca5a5' : '#cdddfb');
  };
  var pwG = document.getElementById('eedpwg'), pwI = document.getElementById('eedpw');
  refreshPw = function () { if (pwG) pwG.style.display = KEY ? 'none' : ''; };
  function submitPw() { var v = (pwI && pwI.value || '').trim(); if (!v) { focusPw(); return; } KEY = v; sessionStorage.setItem('ac_edit_key', KEY); pwI.value = ''; refreshPw(); setStatus('✓ пароль принят'); }
  document.getElementById('eedpwb').addEventListener('click', submitPw);
  pwI.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitPw(); } });
  document.getElementById('eedsave').addEventListener('click', function () { clearTimeout(saveT); doSave(); });
  document.getElementById('eedpub').addEventListener('click', doPublish);
  refreshPw();
  if (!KEY) setStatus('введите пароль для публикации');

  // ---------- apply published overrides (edit-mode preview), then seed CH ----------
  function applyOverrides(p) {
    p = p || {};
    (p.texts || []).forEach(function (c) {
      if (!c.old || c.old === c['new']) return;
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, hits = [];
      while ((n = w.nextNode())) { if ((n.nodeValue || '').trim() === c.old) hits.push(n); }
      hits.forEach(function (t) { t.nodeValue = t.nodeValue.replace(c.old, c['new']); });
    });
    (p.textsel || []).forEach(function (c) { var el = c.selector && document.querySelector(c.selector); if (el) el.innerHTML = c.html; });
    (p.links || []).forEach(function (c) { var el = c.selector && document.querySelector(c.selector); if (el) el.setAttribute('href', c.href); });
    (p.images || []).forEach(function (c) { if (c.url) document.querySelectorAll('img[data-slot="' + c.slot + '"]').forEach(function (im) { im.src = c.url; im.removeAttribute('srcset'); }); });
    (p.backgrounds || []).forEach(function (c) { var el = c.selector && document.querySelector(c.selector); if (el && c.url) { el.style.setProperty('background-image', (c.css ? c.css.replace('__URL__', c.url) : 'url("' + c.url + '")'), 'important'); el.style.setProperty('background-size', 'cover', 'important'); el.style.setProperty('background-position', 'center', 'important'); } });
    (p.styles || []).forEach(function (c) { if (c.selector && c.styles) document.querySelectorAll(c.selector).forEach(function (el) { Object.keys(c.styles).forEach(function (k) { el.style.setProperty(k, c.styles[k], 'important'); }); }); });
    (p.removed || []).forEach(function (sel) { try { document.querySelectorAll(sel).forEach(function (el) { el.style.setProperty('display', 'none', 'important'); }); } catch (e) {} });
  }

  markEditable();
  buildBadges();
  placeBadges();
  fetch('/api/overrides?project=' + PROJECT + '&locale=' + LANG + '&page=' + encodeURIComponent(PAGE))
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var p = (d && d.payload) || {};
      CH.texts = p.texts || []; CH.textsel = p.textsel || []; CH.links = p.links || [];
      CH.images = p.images || []; CH.backgrounds = p.backgrounds || []; CH.styles = p.styles || []; CH.removed = p.removed || [];
      applyOverrides(p);
      document.querySelectorAll('[data-eedit]').forEach(function (el) { el.dataset.eorig = (el.textContent || '').trim(); });
      placeBadges();
    }).catch(function () {});
})();
