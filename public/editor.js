/* AllClean visual editor — dormant unless the URL has ?lgedit.
   Per-locale, per-page. RU and RO are edited independently (no cross-language sync).
   Hover an element to get action badges: 📷 replace photo · ✦ replace icon · 🖼 background ·
   🔗 link (works on buttons AND any text element). Double-click text to edit. Width/line/font
   controls, delete, mobile preview, autosave + publish. Saves to /api/overrides keyed by
   (project=allclean, locale, page); the server bakes overrides into the static build on publish,
   so edits are server-rendered and indexable. */
(function () {
  if (!/(?:[?&#]lgedit\b)/.test(location.search + location.hash)) return;

  var LANG = document.documentElement.lang && document.documentElement.lang.indexOf('ro') === 0 ? 'ro' : 'ru';
  var PROJECT = 'allclean';
  var PAGE = (location.pathname.replace(/\/+$/, '') || '/');
  var CH = { texts: [], textsel: [], links: [], images: [], backgrounds: [], styles: [], removed: [], videos: [], blocks: { order: [], hidden: [] }, added: [] };
  var KEY = sessionStorage.getItem('ac_edit_key') || '';
  var SEL = null, delMode = false;

  var setStatus = function () {};
  var refreshPw = function () {};
  function focusPw() { var i = document.getElementById('eedpw'); if (i) { i.focus(); i.select(); } }
  function payload() { return { texts: CH.texts, textsel: CH.textsel, links: CH.links, images: CH.images, backgrounds: CH.backgrounds, styles: CH.styles, removed: CH.removed, videos: CH.videos, blocks: CH.blocks, added: CH.added }; }

  // ---------- save / publish ----------
  var saveT = null;
  function postJSON(extra, cb) {
    fetch('/api/overrides', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-edit-key': KEY },
      body: JSON.stringify(Object.assign({ project: PROJECT, locale: LANG, page: PAGE, payload: payload() }, extra || {})),
    }).then(function (r) { return r.json().catch(function () { return { ok: r.ok, status: r.status }; }); })
      .then(function (d) {
        if (d && d.ok) { cb && cb(d); return; }
        if (d && (d.error === 'unauthorized' || d.status === 401)) { sessionStorage.removeItem('ac_edit_key'); KEY = ''; refreshPw(); setStatus('✗ неверный пароль'); focusPw(); return; }
        setStatus('✗ ' + ((d && d.error) || 'ошибка'));
      }).catch(function () { setStatus('✗ ошибка сети'); });
  }
  function doSave() { if (!KEY) { setStatus('✗ введите пароль'); refreshPw(); focusPw(); return; } setStatus('сохраняю…'); postJSON(null, function () { setStatus('✓ сохранено (черновик)'); }); }
  function scheduleSave() { clearTimeout(saveT); saveT = setTimeout(doSave, 700); }
  function doPublish() { if (!KEY) { setStatus('✗ введите пароль'); refreshPw(); focusPw(); return; } clearTimeout(saveT); setStatus('публикую…'); postJSON({ publish: true }, function () { setStatus('✓ опубликовано — сайт пересобирается (~1–2 мин)'); }); }

  // ---------- image downscale + upload ----------
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
    '#eed-hb{position:absolute;z-index:999990;display:none;gap:6px;flex-wrap:wrap}' +
    '.eed-badge{background:#2b6cf6;color:#fff;font:600 12px Inter,system-ui,sans-serif;border:0;border-radius:7px;padding:5px 9px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.4)}' +
    '.eed-badge.lnk{background:#0c2959}' +
    '.eed-badge:hover{filter:brightness(1.12)}' +
    '#eedmob-ov{position:fixed;inset:0;z-index:1000000;background:rgba(8,5,20,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center}' +
    '.eedmob-frame{width:390px;max-width:94vw;height:84vh;background:#000;border:9px solid #15131c;border-radius:30px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.6);display:flex;flex-direction:column}' +
    '.eedmob-bar{flex:none;background:#0c2959;color:#fff;font:600 13px Inter,system-ui,sans-serif;padding:9px 14px;display:flex;justify-content:space-between;align-items:center}' +
    '.eedmob-bar button{background:rgba(255,255,255,.16);color:#fff;border:0;border-radius:8px;padding:3px 10px;cursor:pointer;font-weight:700}' +
    '.eedmob-frame iframe{flex:1;width:390px;max-width:100%;border:0;background:#fff}' +
    /* Apple-style frosted glass panel with a purple tint (above the mobile overlay so it stays usable) */
    '#eed{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:1000001;max-width:calc(100% - 24px);' +
      'background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(24,14,46,.50));' +
      '-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);' +
      'color:#fff;font:14px Inter,system-ui,sans-serif;padding:10px 16px;display:flex;gap:9px;align-items:center;flex-wrap:wrap;' +
      'border:1px solid rgba(184,160,255,.32);border-radius:20px;box-shadow:0 16px 50px rgba(76,29,149,.45),0 2px 8px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.22)}' +
    '#eed b{font-weight:700;letter-spacing:.01em}' +
    '#eed button{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:7px 12px;font-weight:600;cursor:pointer;transition:.15s;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '#eed button:hover{background:rgba(255,255,255,.28);border-color:rgba(255,255,255,.35)}' +
    '#eed .alt{background:rgba(255,255,255,.09)}' +
    '#eed #eedpub{background:linear-gradient(135deg,#b07cff,#7c3aed);border:1px solid rgba(255,255,255,.28);box-shadow:0 6px 18px rgba(124,58,237,.55)}' +
    '#eed .on{background:linear-gradient(135deg,rgba(134,239,172,.5),rgba(34,197,94,.5));border-color:rgba(134,239,172,.55)}' +
    '#eed .grp{display:flex;gap:5px;align-items:center;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:4px 9px;font-size:13px}' +
    '#eed .grp button{padding:1px 10px;border-radius:8px;font-size:16px;line-height:1;border:0;background:rgba(255,255,255,.16)}' +
    '#eed .off{opacity:.35;pointer-events:none}' +
    '#eed input{border-radius:10px;border:1px solid rgba(255,255,255,.30);background:rgba(255,255,255,.10);color:#fff;font:13px Inter,system-ui,sans-serif;padding:6px 9px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '#eed input::placeholder{color:rgba(255,255,255,.62)}' +
    '#eed input[type=color]{width:30px;height:26px;padding:1px;cursor:pointer}' +
    /* rich-text formatting toolbar (shown while editing text) */
    '#eed-rtb{position:absolute;z-index:1000002;display:none;gap:4px;padding:5px;border-radius:12px;' +
      'background:linear-gradient(135deg,rgba(139,92,246,.42),rgba(24,14,46,.66));-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);' +
      'border:1px solid rgba(184,160,255,.4);box-shadow:0 10px 30px rgba(76,29,149,.5)}' +
    '.eed-rtbtn{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:8px;min-width:30px;height:28px;padding:0 8px;font:600 13px Inter,system-ui,sans-serif;cursor:pointer}' +
    '.eed-rtbtn:hover{background:rgba(255,255,255,.3)}' +
    /* block mode */
    'body.eed-blkmode main.main-wrapper>section{outline:2px dashed rgba(124,58,237,.5);outline-offset:-2px}' +
    '#eed-blk{position:absolute;z-index:1000002;display:none;gap:5px;padding:5px;border-radius:12px;background:linear-gradient(135deg,rgba(139,92,246,.5),rgba(24,14,46,.7));-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(184,160,255,.45);box-shadow:0 10px 28px rgba(76,29,149,.5)}' +
    '#eed-blk button{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;width:34px;height:30px;font-size:15px;cursor:pointer}' +
    '#eed-blk button:hover{background:rgba(255,255,255,.32)}' +
    /* add-block picker */
    '#eed-pick{position:fixed;inset:0;z-index:1000003;background:rgba(8,5,20,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center}' +
    '.eed-pick-card{background:#16151f;border:1px solid #2b2740;border-radius:18px;padding:22px;width:min(520px,92vw);box-shadow:0 30px 80px rgba(0,0,0,.6)}' +
    '.eed-pick-h{color:#fff;font:800 18px Inter,system-ui,sans-serif;margin-bottom:14px}' +
    '.eed-pick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.eed-pick-grid button{background:#211f2b;color:#fff;border:1px solid #322d44;border-radius:12px;padding:14px 12px;font:600 14px Inter,system-ui,sans-serif;cursor:pointer;text-align:left}' +
    '.eed-pick-grid button:hover{border-color:#7c3aed;background:#262333}' +
    '.eed-pick-x{margin-top:14px;background:transparent;color:#a0a0ad;border:1px solid #322d44;border-radius:10px;padding:8px 14px;cursor:pointer;font:600 13px Inter,system-ui,sans-serif}';
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
  var STYLE_PROPS = ['width', 'max-width', 'line-height', 'font-size', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'text-align', 'color', 'background-color', 'border-radius'];
  function recStyle(el) {
    if (typeof insideAdded === 'function' && insideAdded(el)) { syncAdded(el); return; }
    var sel = cssPath(el), s = {};
    STYLE_PROPS.forEach(function (p) { var v = el.style.getPropertyValue(p); if (v) s[p] = v; });
    CH.styles = CH.styles.filter(function (c) { return c.selector !== sel; });
    if (Object.keys(s).length) CH.styles.push({ selector: sel, styles: s });
    scheduleSave();
  }

  // ---------- editable text ----------
  var TAGS = 'h1,h2,h3,h4,h5,h6,p,a,span,div,li,button,strong,em,blockquote';
  var INLINE = { B: 1, I: 1, EM: 1, STRONG: 1, SPAN: 1, A: 1, BR: 1, SMALL: 1, SUP: 1, SUB: 1, U: 1, MARK: 1, CODE: 1 };
  var INLINE_LEAF = { A: 1, SPAN: 1, STRONG: 1, EM: 1, B: 1, SMALL: 1, U: 1, MARK: 1 };
  function markEditable() {
    document.querySelectorAll(TAGS).forEach(function (el) {
      if (el.closest('#eed') || el.hasAttribute('data-eedit')) return;
      if (el.parentElement && el.parentElement.closest('[data-eedit]')) { if (!(el.children.length === 0 && INLINE_LEAF[el.tagName])) return; }
      var t = (el.textContent || '').trim(); if (!t) return;
      for (var i = 0; i < el.children.length; i++) if (!INLINE[el.children[i].tagName]) return;
      el.setAttribute('data-eedit', ''); el.dataset.eorig = t;
    });
  }
  function showSel() { document.querySelectorAll('.eed-sel').forEach(function (e) { e.classList.remove('eed-sel'); }); if (SEL) SEL.classList.add('eed-sel'); }
  function select(el) { SEL = el; showSel(); updateBar(); }
  document.addEventListener('dblclick', function (e) { if (blkMode) return; var el = e.target.closest('[data-eedit]'); if (!el) return; e.preventDefault(); e.stopPropagation(); el.setAttribute('contenteditable', 'true'); el.focus(); select(el); showRTB(el); }, true);
  document.addEventListener('click', function (e) { if (delMode || blkMode) return; var el = e.target.closest && e.target.closest('[data-eedit]'); if (el && el.getAttribute('contenteditable') !== 'true') { e.preventDefault(); select(el); } }, false);
  document.addEventListener('blur', function (e) {
    var el = e.target; if (!el || !el.hasAttribute || !el.hasAttribute('data-eedit')) return;
    el.removeAttribute('contenteditable'); hideRTB();
    if (insideAdded(el)) { el.dataset.eorig = (el.textContent || '').trim(); syncAdded(el); return; }
    var nw = (el.textContent || '').trim(), old = el.dataset.eorig || '';
    if (!nw || nw === old) return;
    if (el.children.length) { var sel = cssPath(el); CH.textsel = CH.textsel.filter(function (c) { return c.selector !== sel; }); CH.textsel.push({ selector: sel, html: el.innerHTML }); }
    else { CH.texts = CH.texts.filter(function (c) { return c.old !== old; }); CH.texts.push({ old: old, 'new': nw }); }
    el.dataset.eorig = nw; scheduleSave();
  }, true);

  // ---------- rich-text formatting toolbar (Tilda-style) ----------
  var rtb = document.createElement('div'); rtb.id = 'eed-rtb'; document.body.appendChild(rtb);
  [['bold', '<b>Ж</b>'], ['italic', '<i>К</i>'], ['underline', '<u>Ч</u>'], ['ul', '• список'], ['link', '🔗'], ['clear', '✕ формат']].forEach(function (it) {
    var b = document.createElement('button'); b.className = 'eed-rtbtn'; b.dataset.cmd = it[0]; b.innerHTML = it[1]; rtb.appendChild(b);
  });
  rtb.addEventListener('mousedown', function (e) {
    var b = e.target.closest('.eed-rtbtn'); if (!b) return; e.preventDefault(); // keep caret in the editable
    var c = b.dataset.cmd;
    if (c === 'bold' || c === 'italic' || c === 'underline') document.execCommand(c, false);
    else if (c === 'ul') document.execCommand('insertUnorderedList', false);
    else if (c === 'link') { var u = prompt('Ссылка (URL):', 'https://'); if (u) document.execCommand('createLink', false, u); }
    else if (c === 'clear') { document.execCommand('removeFormat', false); document.execCommand('unlink', false); }
  });
  function showRTB(el) { var r = el.getBoundingClientRect(); rtb.style.top = Math.max(8, window.scrollY + r.top - 44) + 'px'; rtb.style.left = (window.scrollX + r.left) + 'px'; rtb.style.display = 'flex'; }
  function hideRTB() { rtb.style.display = 'none'; }

  // ---------- file picker (shared) ----------
  var picker = document.createElement('input'); picker.type = 'file'; picker.accept = 'image/*'; picker.style.display = 'none'; document.body.appendChild(picker);
  var BG_LAST_URL = /url\((["']?)[^)]*\1\)(?![\s\S]*url\()/;
  var pickCb = null;
  picker.addEventListener('change', function () {
    var f = picker.files[0]; if (!f || !pickCb) return; var cb = pickCb; pickCb = null;
    if (!KEY) { setStatus('✗ введите пароль для загрузки фото'); refreshPw(); focusPw(); return; }
    setStatus('загружаю фото…');
    downscaleImage(f, function (uf) { uploadFile(uf, function (url) { if (!url) { setStatus('✗ фото не загружено'); return; } try { cb(url); } catch (e) {} scheduleSave(); }); });
  });
  function pickFile(cb) { pickCb = cb; picker.value = ''; picker.click(); }

  // video picker (no downscale; uploads as-is)
  var vpicker = document.createElement('input'); vpicker.type = 'file'; vpicker.accept = 'video/mp4,video/webm,video/*'; vpicker.style.display = 'none'; document.body.appendChild(vpicker);
  var vpickCb = null;
  vpicker.addEventListener('change', function () {
    var f = vpicker.files[0]; if (!f || !vpickCb) return; var cb = vpickCb; vpickCb = null;
    if (!KEY) { setStatus('✗ введите пароль для загрузки видео'); refreshPw(); focusPw(); return; }
    if (f.size > 30 * 1024 * 1024) { setStatus('✗ видео >30 МБ — сожмите (см. рекомендации)'); return; }
    setStatus('загружаю видео…');
    uploadFile(f, function (url) { if (!url) { setStatus('✗ видео не загружено'); return; } try { cb(url); } catch (e) {} scheduleSave(); });
  });
  function pickVideo(cb) { vpickCb = cb; vpicker.value = ''; vpicker.click(); }

  // ---------- replace actions ----------
  function replaceImage(img) {
    pickFile(function (url) {
      img.removeAttribute('srcset'); img.removeAttribute('sizes'); img.src = url;
      if (insideAdded(img)) { syncAdded(img); setStatus('✓ фото заменено'); return; }
      var slot = img.getAttribute('data-slot') || cssPath(img); if (!img.getAttribute('data-slot')) img.setAttribute('data-slot', slot);
      CH.images = CH.images.filter(function (c) { return c.slot !== slot; }); CH.images.push({ slot: slot, url: url }); setStatus('✓ фото заменено');
    });
  }
  function replaceIcon(svg) {
    var parent = svg.parentElement; if (!parent) return;
    pickFile(function (url) {
      var im = document.createElement('img'); im.src = url; im.alt = ''; im.style.cssText = 'width:100%;height:100%;object-fit:contain';
      svg.replaceWith(im);
      if (insideAdded(parent)) { syncAdded(parent); setStatus('✓ иконка заменена'); return; }
      var sel = cssPath(parent); CH.textsel = CH.textsel.filter(function (c) { return c.selector !== sel; }); CH.textsel.push({ selector: sel, html: parent.innerHTML }); setStatus('✓ иконка заменена');
    });
  }
  function replaceBg(el) {
    var bgTmpl = getComputedStyle(el).backgroundImage.replace(BG_LAST_URL, 'url("__URL__")');
    pickFile(function (url) {
      el.style.backgroundImage = bgTmpl.replace('__URL__', url); el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center';
      if (insideAdded(el)) { syncAdded(el); setStatus('✓ фон заменён'); return; }
      var sel = cssPath(el); CH.backgrounds = CH.backgrounds.filter(function (c) { return c.selector !== sel; }); CH.backgrounds.push({ selector: sel, css: bgTmpl, url: url }); setStatus('✓ фон заменён');
    });
  }
  function replaceVideo(container) {
    if (!KEY) { setStatus('✗ введите пароль'); refreshPw(); focusPw(); return; }
    pickVideo(function (vurl) {
      var v = container.querySelector('video');
      if (v) {
        v.querySelectorAll('source').forEach(function (s) { s.remove(); });
        var src = document.createElement('source'); src.src = vurl; v.appendChild(src);
        try { v.load(); } catch (e) {}
      }
      container.setAttribute('data-video-urls', vurl);
      var sel = cssPath(container);
      CH.videos = CH.videos.filter(function (c) { return c.selector !== sel; });
      CH.videos.push({ selector: sel, mp4: vurl });
      setStatus('✓ видео заменено'); scheduleSave();
      setTimeout(function () {
        if (confirm('Загрузить постер (картинку-превью, видна пока видео грузится)?')) {
          pickFile(function (purl) {
            var e = CH.videos.filter(function (c) { return c.selector === sel; })[0]; if (e) e.poster = purl;
            if (v) v.setAttribute('poster', purl);
            container.setAttribute('data-poster-url', purl);
            setStatus('✓ постер добавлен'); scheduleSave();
          });
        }
      }, 300);
    });
  }
  function setLink(el) {
    var isLinkEl = el.tagName === 'A' || el.tagName === 'BUTTON';
    var cur = el.getAttribute('href') || '';
    var val = window.prompt('Ссылка (URL). Оставьте пустым, чтобы убрать:', cur);
    if (val == null) return; val = val.trim();
    if (insideAdded(el)) { if (isLinkEl) el.setAttribute('href', val); else { var o = el.querySelector('a'); if (o) o.setAttribute('href', val); } syncAdded(el); setStatus('✓ ссылка обновлена'); return; }
    if (isLinkEl) {
      el.setAttribute('href', val);
      var sel = cssPath(el); CH.links = CH.links.filter(function (c) { return c.selector !== sel; }); CH.links.push({ selector: sel, href: val });
    } else {
      var only = el.children.length === 1 && el.firstElementChild.tagName === 'A' ? el.firstElementChild : null;
      if (val) { if (only) only.setAttribute('href', val); else el.innerHTML = '<a href="' + val.replace(/"/g, '&quot;') + '">' + el.innerHTML + '</a>'; }
      else if (only) el.innerHTML = only.innerHTML;
      var sel2 = cssPath(el); CH.textsel = CH.textsel.filter(function (c) { return c.selector !== sel2; }); CH.textsel.push({ selector: sel2, html: el.innerHTML });
    }
    setStatus('✓ ссылка обновлена'); scheduleSave();
  }

  // ---------- hover action badges ----------
  var hb = document.createElement('div'); hb.id = 'eed-hb'; document.body.appendChild(hb);
  var hbAnchor = null, hbHideT = null;
  function isBg(el) { try { return getComputedStyle(el).backgroundImage.indexOf('url(') >= 0; } catch (e) { return false; } }
  function bgAncestor(t) { var el = t; while (el && el !== document.body) { if (el.tagName !== 'IMG' && isBg(el)) { var r = el.getBoundingClientRect(); if (r.width * r.height > 40000) return el; } el = el.parentElement; } return null; }
  function actionsFor(t) {
    var acts = [], anchor = null;
    var videoCont = t.closest('.video_hero-home, .w-background-video');
    if (!videoCont && t.closest('video')) videoCont = t.closest('video').closest('.video_hero-home, .w-background-video') || t.closest('video');
    if (videoCont) {
      acts.push({ l: '🎬 видео', run: function () { replaceVideo(videoCont); } });
      return { acts: acts, anchor: videoCont };  // video container: only the video action (skip bg)
    }
    var img = t.closest('img'); var svg = !img && t.closest('svg'); var bg = bgAncestor(t);
    var link = t.closest('a,button'); var txt = t.closest('[data-eedit]');
    if (img) { acts.push({ l: '📷 фото', run: function () { replaceImage(img); } }); anchor = img; }
    if (svg) { acts.push({ l: '✦ иконка', run: function () { replaceIcon(svg); } }); anchor = anchor || svg; }
    if (bg) { acts.push({ l: '🖼 фон', c: 'lnk', run: function () { replaceBg(bg); } }); anchor = anchor || bg; }
    if (link) { acts.push({ l: '🔗 ссылка', c: 'lnk', run: function () { setLink(link); } }); anchor = anchor || link; }
    else if (txt) { acts.push({ l: '🔗 ссылка', c: 'lnk', run: function () { setLink(txt); } }); anchor = anchor || txt; }
    return { acts: acts, anchor: anchor };
  }
  function placeHB() { if (!hbAnchor) return; var r = hbAnchor.getBoundingClientRect(); hb.style.top = (window.scrollY + r.top + 6) + 'px'; hb.style.left = (window.scrollX + r.left + 6) + 'px'; }
  function hideHB() { hb.style.display = 'none'; hbAnchor = null; }
  function showHB(t) {
    var info = actionsFor(t);
    if (!info.acts.length || !info.anchor) { hideHB(); return; }
    if (info.anchor === hbAnchor) { hb.style.display = 'flex'; return; }
    hbAnchor = info.anchor; hb.innerHTML = '';
    info.acts.forEach(function (a) { var b = document.createElement('button'); b.className = 'eed-badge' + (a.c ? ' ' + a.c : ''); b.textContent = a.l; b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); a.run(); }); hb.appendChild(b); });
    hb.style.display = 'flex'; placeHB();
  }
  document.addEventListener('pointerover', function (e) { if (delMode || blkMode) return; var t = e.target; if (t.closest('#eed,#eedmob-ov,#eed-hb')) { clearTimeout(hbHideT); return; } clearTimeout(hbHideT); showHB(t); }, true);
  document.addEventListener('pointerout', function (e) { var to = e.relatedTarget; if (to && to.closest && to.closest('#eed-hb,#eed')) return; clearTimeout(hbHideT); hbHideT = setTimeout(hideHB, 300); }, true);
  window.addEventListener('scroll', placeHB, true);
  window.addEventListener('resize', placeHB);

  // ---------- delete mode ----------
  var delHover = null;
  function skipDel(t) { return !t || t === document.body || t === document.documentElement || (t.closest && t.closest('#eed,#eed-hb,#eedmob-ov')) || (t.classList && t.classList.contains('eed-badge')); }
  function setDelMode(on) { delMode = on; document.body.classList.toggle('eed-del', on); var b = document.getElementById('eeddel'); if (b) b.classList.toggle('on', on); if (delHover) { delHover.style.outline = ''; delHover = null; } setStatus(on ? 'режим удаления: клик по элементу' : ''); if (on) hideHB(); }
  document.addEventListener('mousemove', function (e) { if (!delMode) return; var t = e.target; if (delHover && delHover !== t) delHover.style.outline = ''; if (skipDel(t)) { delHover = null; return; } delHover = t; t.style.outline = '2px solid #ef4444'; t.style.outlineOffset = '1px'; }, true);
  document.addEventListener('click', function (e) { if (!delMode) return; var t = e.target; if (skipDel(t)) return; e.preventDefault(); e.stopPropagation(); var sel = cssPath(t); if (!sel) return; if (CH.removed.indexOf(sel) < 0) CH.removed.push(sel); t.style.outline = ''; t.style.setProperty('display', 'none', 'important'); delHover = null; scheduleSave(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && delMode) setDelMode(false); });

  // ---------- block mode: reorder / hide whole sections (Tilda-style) ----------
  function mainWrap() { return document.querySelector('main.main-wrapper'); }
  function topSections() { var m = mainWrap(); return m ? [].slice.call(m.children).filter(function (n) { return n.tagName === 'SECTION'; }) : []; }
  function ensureLgids() { topSections().forEach(function (s, i) { if (!s.hasAttribute('data-lgid')) s.setAttribute('data-lgid', String(i)); }); }
  function topSectionOf(el) { var m = mainWrap(); if (!m || !el.closest) return null; var s = el.closest('section'); while (s && s.parentElement !== m) s = s.parentElement && s.parentElement.closest ? s.parentElement.closest('section') : null; return (s && s.parentElement === m) ? s : null; }
  function blockId(s) { return s.dataset.lgadd ? 'add:' + s.dataset.lgadd : s.getAttribute('data-lgid'); }
  function findSec(id) { var m = mainWrap(); if (!m) return null; return id && id.indexOf('add:') === 0 ? m.querySelector(':scope > section[data-lgadd="' + id.slice(4) + '"]') : m.querySelector(':scope > section[data-lgid="' + id + '"]'); }
  function saveOrder() { ensureLgids(); CH.blocks.order = topSections().map(blockId); scheduleSave(); }
  function applyBlocksLocal() {
    var m = mainWrap(); if (!m) return;
    // re-insert previously added blocks
    (CH.added || []).forEach(function (a) { if (!m.querySelector(':scope > section[data-lgadd="' + a.id + '"]')) { var tmp = document.createElement('div'); tmp.innerHTML = a.html; var sec = tmp.firstElementChild; if (sec) { m.appendChild(sec); } } });
    ensureLgids();
    (CH.blocks.order || []).forEach(function (id) { var s = findSec(id); if (s) m.appendChild(s); });
    topSections().forEach(function (s) { if ((CH.blocks.hidden || []).indexOf(blockId(s)) >= 0) s.style.setProperty('display', 'none', 'important'); });
    markEditable();
  }
  // serialize an added block back into CH.added after it's edited
  function syncAdded(el) {
    var sec = el && el.closest && el.closest('section[data-lgadd]'); if (!sec) return false;
    var clone = sec.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
    clone.querySelectorAll('.eed-sel').forEach(function (n) { n.classList.remove('eed-sel'); });
    clone.style.removeProperty('opacity');
    var id = sec.dataset.lgadd, e = (CH.added || []).filter(function (a) { return a.id === id; })[0];
    if (e) { e.html = clone.outerHTML; scheduleSave(); }
    return true;
  }
  var blkMode = false, blkSec = null;
  var blkBar = document.createElement('div'); blkBar.id = 'eed-blk'; blkBar.style.display = 'none';
  blkBar.innerHTML = '<button data-blk="up" title="выше">↑</button><button data-blk="down" title="ниже">↓</button><button data-blk="add" title="добавить блок ниже">➕</button><button data-blk="dup" title="дублировать секцию">⧉</button><button data-blk="hide" title="скрыть / удалить">🚫</button>';
  document.body.appendChild(blkBar);
  function isHidden(s) { return (CH.blocks.hidden || []).indexOf(blockId(s)) >= 0; }
  function placeBlk() { if (!blkSec) { blkBar.style.display = 'none'; return; } var r = blkSec.getBoundingClientRect(); blkBar.style.top = (window.scrollY + Math.max(r.top, 4) + 6) + 'px'; blkBar.style.left = (window.scrollX + r.right - 208) + 'px'; blkBar.querySelector('[data-blk="hide"]').textContent = blkSec.dataset.lgadd ? '🗑' : (isHidden(blkSec) ? '👁' : '🚫'); blkBar.style.display = 'flex'; }
  blkBar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !blkSec) return; var m = mainWrap(); var act = b.dataset.blk;
    function sib(dir) { var n = dir === 'up' ? blkSec.previousElementSibling : blkSec.nextElementSibling; while (n && n.tagName !== 'SECTION') n = dir === 'up' ? n.previousElementSibling : n.nextElementSibling; return n; }
    if (act === 'up') { var p = sib('up'); if (p) { m.insertBefore(blkSec, p); saveOrder(); placeBlk(); } }
    else if (act === 'down') { var nx = sib('down'); if (nx) { m.insertBefore(nx, blkSec); saveOrder(); placeBlk(); } }
    else if (act === 'add') { openAddPicker(blkSec); }
    else if (act === 'dup') { duplicateSec(blkSec); }
    else if (act === 'hide') {
      if (blkSec.dataset.lgadd) { // added block → delete entirely
        var aid = blkSec.dataset.lgadd; CH.added = (CH.added || []).filter(function (a) { return a.id !== aid; }); var id2 = 'add:' + aid; CH.blocks.order = (CH.blocks.order || []).filter(function (x) { return x !== id2; }); CH.blocks.hidden = (CH.blocks.hidden || []).filter(function (x) { return x !== id2; }); blkSec.remove(); blkSec = null; blkBar.style.display = 'none'; scheduleSave();
      } else { // original section → reversible hide
        var id = blockId(blkSec); var h = CH.blocks.hidden || (CH.blocks.hidden = []); var i = h.indexOf(id); if (i >= 0) { h.splice(i, 1); blkSec.style.removeProperty('display'); blkSec.style.opacity = '.4'; } else { h.push(id); blkSec.style.opacity = '.4'; } placeBlk(); scheduleSave();
      }
    }
  });
  // strip editor-only attributes before storing/serializing an added block
  function cleanClone(sec) { var c = sec.cloneNode(true); c.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); }); c.querySelectorAll('[data-eedit]').forEach(function (n) { n.removeAttribute('data-eedit'); n.removeAttribute('data-eorig'); }); c.querySelectorAll('.eed-sel').forEach(function (n) { n.classList.remove('eed-sel'); }); c.style.removeProperty('opacity'); return c; }
  function insideAdded(el) { return el && el.closest && el.closest('section[data-lgadd]'); }

  // library of insertable blocks (native Sparkles classes; editable after insert)
  var BLOCKS = {
    heading: { name: '📝 Заголовок + текст', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:64px;padding-bottom:64px"><div class="heading-style-h2">Новый заголовок</div><p class="text-size-large" style="margin-top:14px;max-width:760px">Текст раздела. Дважды кликните, чтобы отредактировать.</p></div></div>' },
    cta: { name: '🎯 Призыв к действию', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:56px;padding-bottom:56px;text-align:center"><div class="heading-style-h2">Готовы заказать уборку?</div><p class="text-size-large" style="margin:14px auto 0;max-width:620px">Оставьте заявку — мы перезвоним и согласуем время.</p><a href="/book-cleaning" style="display:inline-block;margin-top:22px;background:#0c2959;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700">Записаться</a></div></div>' },
    two: { name: '🧱 Две колонки', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:56px;padding-bottom:56px;display:grid;grid-template-columns:1fr 1fr;gap:32px"><div><div class="heading-style-h4">Колонка 1</div><p class="text-size-large" style="margin-top:10px">Текст первой колонки.</p></div><div><div class="heading-style-h4">Колонка 2</div><p class="text-size-large" style="margin-top:10px">Текст второй колонки.</p></div></div></div>' },
    image_text: { name: '🖼 Картинка + текст', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:56px;padding-bottom:56px;display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center"><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;border-radius:18px"/><div><div class="heading-style-h3">Заголовок</div><p class="text-size-large" style="margin-top:12px">Описание услуги или преимущества.</p></div></div></div>' },
    spacer: { name: '↕ Отступ (пустой)', html: '<div style="height:80px"></div>' },
    review: { name: '⭐ Отзывы (3 шт)', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:64px;padding-bottom:64px"><div class="heading-style-h2" style="text-align:center">ОТЗЫВЫ КЛИЕНТОВ</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:36px"><div style="background:#eef3fd;border:1px solid #dbe6fb;border-radius:18px;padding:24px"><div style="color:#537FDD;font-size:18px;letter-spacing:3px">★★★★★</div><p class="text-size-large" style="margin:12px 0 16px">«Приехали вовремя, убрали идеально. В квартире свежо и чисто — рекомендую!»</p><div class="text_body-bold">Анна</div></div><div style="background:#eef3fd;border:1px solid #dbe6fb;border-radius:18px;padding:24px"><div style="color:#537FDD;font-size:18px;letter-spacing:3px">★★★★★</div><p class="text-size-large" style="margin:12px 0 16px">«Заказывал генеральную уборку после ремонта. Результат превзошёл ожидания.»</p><div class="text_body-bold">Виктор</div></div><div style="background:#eef3fd;border:1px solid #dbe6fb;border-radius:18px;padding:24px"><div style="color:#537FDD;font-size:18px;letter-spacing:3px">★★★★★</div><p class="text-size-large" style="margin:12px 0 16px">«Вежливая команда и честная цена. Теперь убираются у нас каждые две недели.»</p><div class="text_body-bold">Мария</div></div></div></div></div>' },
    faq: { name: '❓ Вопросы (аккордеон)', html: '<style>.lg-faq details{background:#eef3fd;border:1px solid #dbe6fb;border-radius:14px;margin-bottom:12px;overflow:hidden}.lg-faq summary{list-style:none;cursor:pointer;padding:18px 22px;font-weight:700;color:#0c2959;display:flex;justify-content:space-between;align-items:center;gap:16px}.lg-faq summary::-webkit-details-marker{display:none}.lg-faq summary::after{content:"+";color:#0c2959;font-size:24px;line-height:1;transition:transform .2s}.lg-faq details[open] summary::after{transform:rotate(45deg)}.lg-faq .lg-faq-a{padding:0 22px 18px;color:#33415c}</style><div class="padding-global"><div class="w-layout-blockcontainer container-large w-container lg-faq" style="padding-top:64px;padding-bottom:64px;max-width:820px"><div class="heading-style-h2" style="text-align:center;margin-bottom:32px">ЧАСТЫЕ ВОПРОСЫ</div><details><summary>Как заказать уборку?</summary><div class="lg-faq-a">Оставьте заявку на сайте или позвоните нам — мы согласуем удобное время и рассчитаем стоимость.</div></details><details><summary>Какие средства вы используете?</summary><div class="lg-faq-a">Профессиональные нетоксичные средства, безопасные для детей и животных.</div></details><details><summary>Сколько длится уборка?</summary><div class="lg-faq-a">Обычно 2–3 часа в зависимости от площади и состояния помещения.</div></details></div></div>' },
    gallery: { name: '🖼 Галерея фото', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:64px;padding-bottom:64px"><div class="heading-style-h2" style="text-align:center;margin-bottom:32px">НАШИ РАБОТЫ</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px"><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px"/><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px"/><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px"/><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px"/><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px"/><img src="https://cdn.prod.website-files.com/692f17afc3743c9cd4b7cac6/6937d9a66b88a8c458db6362_book-about.avif" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px"/></div></div></div>' },
    pricing: { name: '💳 Тарифы (3 плана)', html: '<div class="padding-global"><div class="w-layout-blockcontainer container-large w-container" style="padding-top:64px;padding-bottom:64px"><div class="heading-style-h2" style="text-align:center;margin-bottom:36px">ТАРИФЫ</div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:stretch"><div style="background:#eef3fd;border:1px solid #dbe6fb;border-radius:18px;padding:28px 24px;text-align:center"><div class="text_body-bold" style="text-transform:uppercase;letter-spacing:1px">Базовый</div><div class="heading-style-h3" style="margin:14px 0">от 1200 MDL</div><p class="text-size-large" style="margin-bottom:20px">Поддерживающая уборка квартиры под ключ.</p><a href="/book-cleaning" style="display:inline-block;background:#0c2959;color:#fff;padding:13px 26px;border-radius:12px;text-decoration:none;font-weight:700">Записаться</a></div><div style="background:#0c2959;border:1px solid #0c2959;border-radius:18px;padding:28px 24px;text-align:center;color:#fff"><div class="text_body-bold" style="text-transform:uppercase;letter-spacing:1px;color:#b6cbf9">Стандарт</div><div class="heading-style-h3" style="margin:14px 0;color:#fff">от 2500 MDL</div><p class="text-size-large" style="margin-bottom:20px;color:#dbe6fb">Генеральная уборка с мытьём окон и кухни.</p><a href="/book-cleaning" style="display:inline-block;background:#fff;color:#0c2959;padding:13px 26px;border-radius:12px;text-decoration:none;font-weight:700">Записаться</a></div><div style="background:#eef3fd;border:1px solid #dbe6fb;border-radius:18px;padding:28px 24px;text-align:center"><div class="text_body-bold" style="text-transform:uppercase;letter-spacing:1px">Премиум</div><div class="heading-style-h3" style="margin:14px 0">от 4000 MDL</div><p class="text-size-large" style="margin-bottom:20px">Уборка после ремонта с вывозом мусора.</p><a href="/book-cleaning" style="display:inline-block;background:#0c2959;color:#fff;padding:13px 26px;border-radius:12px;text-decoration:none;font-weight:700">Записаться</a></div></div></div></div>' }
  };
  function uid4() { var s = ''; for (var i = 0; i < 6; i++) s += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor((Date.now() + i * 7 + performance.now()) % 36)]; return s + (Date.now() % 1000); }
  function insertBlock(key, afterSec) {
    var tpl = BLOCKS[key]; if (!tpl) return;
    var id = uid4(); var m = mainWrap(); if (!m) return;
    var sec = document.createElement('section'); sec.className = 'lg-added'; sec.setAttribute('data-lgadd', id); sec.innerHTML = tpl.html;
    if (afterSec && afterSec.parentElement === m) m.insertBefore(sec, afterSec.nextSibling); else m.appendChild(sec);
    markEditable();
    CH.added.push({ id: id, html: cleanClone(sec).outerHTML });
    saveOrder(); setStatus('✓ блок добавлен'); blkSec = sec; placeBlk();
  }
  // duplicate any section (original or added) into a new editable added-block right below it
  function duplicateSec(sec) {
    var m = mainWrap(); if (!m || !sec) return;
    ensureLgids();
    var id = uid4();
    var clone = cleanClone(sec);
    clone.removeAttribute('data-lgid');
    clone.setAttribute('data-lgadd', id);
    clone.classList.add('lg-added');
    m.insertBefore(clone, sec.nextSibling);
    markEditable();
    CH.added.push({ id: id, html: cleanClone(clone).outerHTML });
    saveOrder(); setStatus('✓ блок продублирован'); blkSec = clone; placeBlk();
  }
  function openAddPicker(afterSec) {
    var ov = document.createElement('div'); ov.id = 'eed-pick';
    var h = '<div class="eed-pick-card"><div class="eed-pick-h">Добавить блок</div><div class="eed-pick-grid">';
    Object.keys(BLOCKS).forEach(function (k) { h += '<button data-tpl="' + k + '">' + BLOCKS[k].name + '</button>'; });
    h += '</div><button class="eed-pick-x">Отмена</button></div>';
    ov.innerHTML = h; document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.classList.contains('eed-pick-x')) { ov.remove(); return; } var b = e.target.closest('[data-tpl]'); if (b) { insertBlock(b.dataset.tpl, afterSec); ov.remove(); } });
  }

  function setBlkMode(on) {
    blkMode = on; document.body.classList.toggle('eed-blkmode', on);
    var btn = document.getElementById('eedblk'); if (btn) btn.classList.toggle('on', on);
    if (on) { ensureLgids(); hideHB(); topSections().forEach(function (s) { if (isHidden(s)) { s.style.removeProperty('display'); s.style.opacity = '.4'; } }); }
    else { blkBar.style.display = 'none'; blkSec = null; topSections().forEach(function (s) { s.style.opacity = ''; if (isHidden(s)) s.style.setProperty('display', 'none', 'important'); }); }
    setStatus(on ? 'режим блоков: наведи на секцию → ↑ ↓ скрыть' : '');
  }
  document.addEventListener('pointerover', function (e) { if (!blkMode) return; if (e.target.closest('#eed,#eed-blk')) return; var s = topSectionOf(e.target); if (s && s !== blkSec) { blkSec = s; placeBlk(); } }, true);
  window.addEventListener('scroll', function () { if (blkMode) placeBlk(); }, true);

  // ---------- mobile preview (true 390px viewport via iframe, shows current edits) ----------
  var mobOverlay = null;
  function toggleMobile(btn) {
    if (mobOverlay) { mobOverlay.remove(); mobOverlay = null; btn.classList.remove('on'); return; }
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('#eed,#eedmob-ov,#eed-hb,#eed-rtb,#eed-blk,#eed-pick,.eed-badge,script').forEach(function (n) { n.remove(); });
    clone.querySelectorAll('[contenteditable]').forEach(function (e) { e.removeAttribute('contenteditable'); });
    clone.querySelectorAll('.eed-sel').forEach(function (e) { e.classList.remove('eed-sel'); });
    var ov = document.createElement('div'); ov.id = 'eedmob-ov';
    ov.innerHTML = '<div class="eedmob-frame"><div class="eedmob-bar"><span>📱 Мобильный предпросмотр (390px)</span><button type="button">✕ закрыть</button></div><iframe></iframe></div>';
    document.body.appendChild(ov);
    ov.querySelector('iframe').srcdoc = '<!doctype html>' + clone.outerHTML;
    ov.querySelector('.eedmob-bar button').addEventListener('click', function () { toggleMobile(btn); });
    ov.addEventListener('click', function (e) { if (e.target === ov) toggleMobile(btn); });
    mobOverlay = ov; btn.classList.add('on');
  }

  // ---------- toolbar ----------
  var bar = document.createElement('div'); bar.id = 'eed';
  bar.innerHTML =
    '<b>✏️ Редактор (' + LANG.toUpperCase() + ')</b>' +
    '<span style="opacity:.7;font-size:12px">2× клик — текст (Ж/К/Ч, списки, ссылка) · 1 клик — блок (отступы/выравнивание/цвет) · наведи: 📷 ✦ 🔗</span>' +
    '<span class="grp off" id="eedw">Ширина <button data-w="-1">−</button><button data-w="1">+</button></span>' +
    '<span class="grp off" id="eedl">Интервал <button data-l="-1">−</button><button data-l="1">+</button></span>' +
    '<span class="grp off" id="eedf">Шрифт <button data-f="-1">−</button><button data-f="1">+</button></span>' +
    '<span class="grp off" id="eedp">Отступы <button data-p="-1">−</button><button data-p="1">+</button></span>' +
    '<span class="grp off" id="eeda">Текст <button data-a="left">⬅</button><button data-a="center">⬍</button><button data-a="right">➡</button></span>' +
    '<span class="grp off" id="eedc">Цвет <input type="color" data-col="text" title="цвет текста"/><input type="color" data-col="bg" title="цвет фона"/></span>' +
    '<button class="alt off" id="eedup" title="выбрать родительский блок (чтобы менять ширину контейнера)">⬆ блок</button>' +
    '<button class="alt" id="eedblk" title="режим блоков: перемещение/скрытие секций">🧩 Блоки</button>' +
    '<button class="alt" id="eedmob" title="мобильный вид">📱 Моб.</button>' +
    '<button class="alt" id="eeddel" title="режим удаления">🗑</button>' +
    '<span style="flex:1"></span>' +
    '<span class="grp" id="eedpwg"><input id="eedpw" type="password" placeholder="пароль" autocomplete="off" style="width:104px"/><button id="eedpwb">войти</button></span>' +
    '<span id="eedst" style="opacity:.85;font-size:13px;min-width:120px;text-align:right"></span>' +
    '<button id="eedsave" class="alt">💾 Черновик</button>' +
    '<button id="eedpub">🚀 Опубликовать</button>';
  document.body.appendChild(bar);

  function updateBar() { var on = !!SEL; ['eedw', 'eedl', 'eedf', 'eedp', 'eeda', 'eedc'].forEach(function (id) { document.getElementById(id).classList.toggle('off', !on); }); document.getElementById('eedup').classList.toggle('off', !(SEL && SEL.parentElement && SEL.parentElement !== document.body)); }
  bar.addEventListener('input', function (e) {
    var t = e.target; if (!SEL || !t.dataset || t.dataset.col === undefined) return;
    if (t.dataset.col === 'text') SEL.style.setProperty('color', t.value, 'important');
    else if (t.dataset.col === 'bg') SEL.style.setProperty('background-color', t.value, 'important');
    recStyle(SEL);
  });
  bar.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'eedmob') { toggleMobile(t); return; }
    if (t.id === 'eedblk') { setBlkMode(!blkMode); return; }
    if (t.id === 'eedup' && SEL && SEL.parentElement && SEL.parentElement !== document.body) { SEL = SEL.parentElement; showSel(); updateBar(); return; }
    if (t.id === 'eeddel') { setDelMode(!delMode); return; }
    if (t.dataset && t.dataset.p !== undefined && SEL) { var cp = parseInt(SEL.style.paddingTop) || 0; var npd = Math.max(0, cp + (t.dataset.p === '1' ? 8 : -8)); SEL.style.setProperty('padding-top', npd + 'px', 'important'); SEL.style.setProperty('padding-bottom', npd + 'px', 'important'); recStyle(SEL); }
    if (t.dataset && t.dataset.a !== undefined && SEL) { SEL.style.setProperty('text-align', t.dataset.a, 'important'); recStyle(SEL); }
    if (t.dataset && t.dataset.w !== undefined && SEL) { var cw = parseInt(SEL.style.width) || Math.round(SEL.getBoundingClientRect().width); var nw = Math.max(80, cw + (t.dataset.w === '1' ? 40 : -40)); SEL.style.setProperty('width', nw + 'px', 'important'); SEL.style.setProperty('max-width', nw + 'px', 'important'); recStyle(SEL); }
    if (t.dataset && t.dataset.l !== undefined && SEL) { var cl = parseFloat(SEL.style.lineHeight) || parseFloat(getComputedStyle(SEL).lineHeight) || 24; SEL.style.lineHeight = Math.max(10, cl + (t.dataset.l === '1' ? 2 : -2)) + 'px'; recStyle(SEL); }
    if (t.dataset && t.dataset.f !== undefined && SEL) { var cf = parseFloat(SEL.style.fontSize) || parseFloat(getComputedStyle(SEL).fontSize) || 16; var nf = Math.max(8, Math.round((cf + (t.dataset.f === '1' ? 2 : -2)) * 10) / 10); SEL.style.setProperty('font-size', nf + 'px', 'important'); SEL.querySelectorAll('*').forEach(function (c) { if (!c.children.length) c.style.setProperty('font-size', 'inherit', 'important'); }); recStyle(SEL); }
  });

  var stEl = document.getElementById('eedst');
  setStatus = function (t) { if (!stEl) return; stEl.textContent = t || ''; stEl.style.color = /✓/.test(t) ? '#86efac' : (/✗/.test(t) ? '#fca5a5' : '#cdddfb'); };
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
    (p.texts || []).forEach(function (c) { if (!c.old || c.old === c['new']) return; var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, hits = []; while ((n = w.nextNode())) { if ((n.nodeValue || '').trim() === c.old) hits.push(n); } hits.forEach(function (t) { t.nodeValue = t.nodeValue.replace(c.old, c['new']); }); });
    (p.textsel || []).forEach(function (c) { var el = c.selector && document.querySelector(c.selector); if (el) el.innerHTML = c.html; });
    (p.links || []).forEach(function (c) { var el = c.selector && document.querySelector(c.selector); if (el) el.setAttribute('href', c.href); });
    (p.images || []).forEach(function (c) { if (c.url) document.querySelectorAll('img[data-slot="' + (c.slot || '').replace(/"/g, '\\"') + '"]').forEach(function (im) { im.src = c.url; im.removeAttribute('srcset'); }); var e2 = c.slot && safeQ(c.slot); if (e2 && e2.tagName === 'IMG') { e2.src = c.url; e2.removeAttribute('srcset'); } });
    (p.backgrounds || []).forEach(function (c) { var el = c.selector && safeQ(c.selector); if (el && c.url) { el.style.setProperty('background-image', (c.css ? c.css.replace('__URL__', c.url) : 'url("' + c.url + '")'), 'important'); el.style.setProperty('background-size', 'cover', 'important'); el.style.setProperty('background-position', 'center', 'important'); } });
    (p.styles || []).forEach(function (c) { if (c.selector && c.styles) safeAll(c.selector).forEach(function (el) { Object.keys(c.styles).forEach(function (k) { el.style.setProperty(k, c.styles[k], 'important'); }); }); });
    (p.removed || []).forEach(function (sel) { safeAll(sel).forEach(function (el) { el.style.setProperty('display', 'none', 'important'); }); });
  }
  function safeQ(s) { try { return document.querySelector(s); } catch (e) { return null; } }
  function safeAll(s) { try { return [].slice.call(document.querySelectorAll(s)); } catch (e) { return []; } }

  markEditable();
  fetch('/api/overrides?project=' + PROJECT + '&locale=' + LANG + '&page=' + encodeURIComponent(PAGE))
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var p = (d && d.payload) || {};
      CH.texts = p.texts || []; CH.textsel = p.textsel || []; CH.links = p.links || [];
      CH.images = p.images || []; CH.backgrounds = p.backgrounds || []; CH.styles = p.styles || []; CH.removed = p.removed || [];
      CH.videos = p.videos || []; CH.blocks = p.blocks && (p.blocks.order || p.blocks.hidden) ? { order: p.blocks.order || [], hidden: p.blocks.hidden || [] } : { order: [], hidden: [] };
      CH.added = p.added || [];
      applyOverrides(p);
      applyBlocksLocal();
      document.querySelectorAll('[data-eedit]').forEach(function (el) { el.dataset.eorig = (el.textContent || '').trim(); });
    }).catch(function () { ensureLgids(); });
})();
