/* ==========================================================
   Wehan Coombs · site behaviour
   Plain JavaScript, no libraries. Everything degrades gracefully.
   ========================================================== */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const root = document.documentElement, body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const TAU = Math.PI * 2;
  $$('a[href$=".pdf"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
  const CH_LABEL = { threshold: 'Begin', teach: 'Teach', think: 'Think', make: 'Make', write: 'Contact' };

  /* ---------- Colours (read from the CSS so both themes just work) ---------- */
  function cssVar(name, el) { return getComputedStyle(el || body).getPropertyValue(name).trim(); }
  function rgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const pal = {
    light: false, text: rgb('#ECE4D6'), gold: rgb('#C9A24D'),
    accent: rgb('#C9A24D'), target: rgb('#C9A24D'),
    refresh() {
      this.light = root.getAttribute('data-theme') === 'light';
      this.text = rgb(cssVar('--text'));
      this.gold = rgb(cssVar('--gold'));
      this.target = rgb(cssVar('--accent'));
    }
  };
  pal.refresh();

  /* ---------- Light and dark: the visitor's system setting, until the switch is used; the switch is remembered ---------- */
  const themeBtn = $('#theme'), sysLight = matchMedia('(prefers-color-scheme: light)');
  const isLight = () => root.getAttribute('data-theme') === 'light';
  function setTheme(light) { if (light) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme'); }
  function paintTheme() {
    themeBtn.innerHTML = isLight() ? '☾<span class="lbl"> Dark</span>' : '☀<span class="lbl"> Light</span>';
    pal.refresh();
    const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', cssVar('--bg'));
  }
  themeBtn.addEventListener('click', () => {
    body.classList.add('theming');
    setTheme(!isLight());
    try { localStorage.setItem('theme', isLight() ? 'light' : 'dark'); } catch (e) {}
    paintTheme();
    setTimeout(() => body.classList.remove('theming'), 1000);
  });
  // If the system setting changes while the page is open, follow it, unless the switch has been used.
  const followSystem = () => { let saved = null; try { saved = localStorage.getItem('theme'); } catch (e) {} if (saved !== 'light' && saved !== 'dark') { setTheme(sysLight.matches); paintTheme(); } };
  if (sysLight.addEventListener) sysLight.addEventListener('change', followSystem); else if (sysLight.addListener) sysLight.addListener(followSystem);
  paintTheme();

  /* ---------- The CVs in the top bar: a dropdown on narrow screens ---------- */
  const cvs = $('#cvs'), cvsBtn = $('#cvs-btn');
  function closeCvs() { if (!cvs.classList.contains('on')) return; cvs.classList.remove('on'); cvsBtn.setAttribute('aria-expanded', 'false'); }
  cvsBtn.addEventListener('click', e => { e.stopPropagation(); const on = cvs.classList.toggle('on'); cvsBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  document.addEventListener('click', closeCvs);

  let pageVisible = true;
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

  /* ---------- Named clicks, counted only once a counter script is on the page ---------- */
  function track(name) { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} }
  document.addEventListener('click', e => { const t = e.target.closest('[data-track]'); if (t) track(t.dataset.track); });

  /* ---------- The star rating: filled as soon as the page loads; nothing on this page waits for a scroll ---------- */
  $$('.stars').forEach(el => { $('.stars-fg', el).style.width = ((+el.dataset.rating || 0) / 5 * 100).toFixed(1) + '%'; });

  /* ---------- The library and the sheet ---------- */
  // A large faint drawing in each pop-up's header, named by data-art on the pop-up
  const ART = {
    quill: '<path d="M8 40c6-2 10-6 14-12 4-6 8-10 18-16-4 10-8 14-14 18-6 4-10 6-18 10z"/><path d="M8 40l10-10"/>',
    scroll: '<path d="M10 8h24l6 6v26H10z"/><path d="M34 8v6h6"/><path d="M16 20h16M16 26h16M16 32h10"/>',
    school: '<path d="M6 40V20l10-8 10 8v20"/><path d="M26 40V24l8-6 8 6v16"/><path d="M6 40h36"/>',
    lamp: '<path d="M18 34c-6-3-9-8-9-14a15 15 0 0 1 30 0c0 6-3 11-9 14"/><path d="M18 34v4h12v-4M20 42h8"/>',
    book: '<path d="M8 10h14a4 4 0 0 1 4 4v26a4 4 0 0 0-4-4H8z"/><path d="M40 10H26a4 4 0 0 0-4 4v26a4 4 0 0 1 4-4h14z"/>',
    quote: '<path d="M10 28a8 8 0 0 1 8-8v-8a16 16 0 0 0-16 16v12h16V28z"/><path d="M28 28a8 8 0 0 1 8-8v-8a16 16 0 0 0-16 16v12h16V28z"/>',
    person: '<circle cx="24" cy="16" r="8"/><path d="M8 42c0-10 7-16 16-16s16 6 16 16"/>',
    people: '<circle cx="17" cy="16" r="6"/><circle cx="33" cy="18" r="5"/><path d="M5 40c0-8 5-13 12-13s12 5 12 13M30 28c7-1 13 4 13 12"/>',
    compass: '<circle cx="24" cy="24" r="17"/><path d="M31 17l-4 10-10 4 4-10z"/>',
    crown: '<path d="M10 36L7 16l10 9 7-13 7 13 10-9-3 20z"/><path d="M10 41h28"/>',
    ship: '<path d="M24 6v20M24 9l12 14H24M24 13l-9 10h9"/><path d="M6 31c4-4 8-4 12 0s8 4 12 0 8-4 12 0M6 39c4-4 8-4 12 0s8 4 12 0 8-4 12 0"/>',
    bubble: '<path d="M8 10h32v22H22l-8 8v-8H8z"/><path d="M14 18h20M14 24h12"/>',
    shirt: '<path d="M16 8L6 16l5 7 5-3v20h16V20l5 3 5-7-10-8c-1 4-4 6-8 6s-7-2-8-6z"/>',
    leaf: '<path d="M10 38C10 20 22 10 40 8c-2 18-12 30-30 30z"/><path d="M10 38l16-16M18 30h8M20 22v6"/>',
    pilcrow: '<path d="M30 8v32M22 8v32M36 8H20a9 9 0 0 0 0 18h2"/>',
    film: '<path d="M6 10h36v28H6zM12 10v28M36 10v28M6 17h6M6 24h6M6 31h6M36 17h6M36 24h6M36 31h6"/><path d="M21 18l8 6-8 6z"/>',
    temple: '<path d="M6 16L24 6l18 10zM10 16v20M19 16v20M29 16v20M38 16v20M8 36h32M6 41h36"/>',
    spark: '<path d="M22 8c1 9 6 14 15 15-9 1-14 6-15 15-1-9-6-14-15-15 9-1 14-6 15-15z"/><path d="M38 6c0 4 2 6 6 6-4 0-6 2-6 6 0-4-2-6-6-6 4 0 6-2 6-6z"/>',
    cap: '<path d="M4 18l20-9 20 9-20 9z"/><path d="M12 22v10c3 4 8 6 12 6s9-2 12-6V22M44 18v12"/>',
    board: '<path d="M6 8h36v24H6zM24 32v8M16 40h16M12 16h14M12 22h8"/>',
    play: '<circle cx="24" cy="24" r="17"/><path d="M20 16l12 8-12 8z"/>',
    mic: '<path d="M18 8h12v18a6 6 0 0 1-12 0z"/><path d="M12 24a12 12 0 0 0 24 0M24 36v6M16 42h16"/>',
    blocks: '<path d="M6 26h14v14H6zM22 26h20v14H22zM6 8h22v14H6zM30 8h12v14H30z"/>',
    check: '<path d="M10 6h28v36H10z"/><path d="M16 16l3 3 5-6M28 16h6M16 28l3 3 5-6M28 28h6"/>',
    heart: '<path d="M24 40S6 29 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23z"/>',
    calendar: '<path d="M8 12h32v28H8zM8 20h32M16 6v10M32 6v10"/><path d="M19 30l4 4 7-8"/>',
    edit: '<path d="M8 12h26M8 20h18M8 28h10"/><path d="M40 18L24 34l-6 2 2-6 16-16z"/>',
    dots: '<circle cx="24" cy="9" r="2.6"/><circle cx="19" cy="19" r="2.6"/><circle cx="29" cy="19" r="2.6"/><circle cx="14" cy="29" r="2.6"/><circle cx="24" cy="29" r="2.6"/><circle cx="34" cy="29" r="2.6"/><circle cx="9" cy="39" r="2.6"/><circle cx="19" cy="39" r="2.6"/><circle cx="29" cy="39" r="2.6"/><circle cx="39" cy="39" r="2.6"/>',
    envelope: '<path d="M6 12h36v26H6z"/><path d="M6 12l18 14 18-14"/>',
    star: '<path d="M24 6l5 13h13l-10.5 8 4 13L24 32l-11.5 8 4-13L6 19h13z"/>'
  };
  const library = {};
  $$('#library article').forEach(a => { library[a.id.replace(/^s-/, '')] = { title: a.dataset.title, ch: a.dataset.ch, html: a.innerHTML, read: a.hasAttribute('data-read'), art: a.dataset.art, tone: a.dataset.tone }; });
  library.evaluations = library.said = library.testimonials; // old links still open the testimonials

  /* ---------- Request sheets: a drafted message you can send from your email app, from Gmail, or copy ---------- */
  const EMAIL = 'wehancoombs@gmail.com';
  // Paste a booking link here (a Google Calendar appointment page, or Calendly) and every request sheet gets a "Book a call" button. Empty hides it.
  const BOOKING_URL = 'https://calendar.app.google/LnQHr42n4ykTqa4ZA', FORM_URL = 'https://formspree.io/f/xnppyzon';
  const REQUESTS = {
    tutoring: { ch: 'make', title: 'Request tutoring', subject: 'Tutoring request', intro: 'Tell me the subject, the level and when suits you. I reply with a plan, a rate and a start date.', body: 'Hi Wehan,\n\nI’d like to ask about tutoring.\n\nSubject and grade or level: \nWhen and how often: \nIn person or online: \n\nThanks,\n' },
    editing: { ch: 'make', title: 'Request editing', subject: 'Editing request', intro: 'Tell me what the document is and when you need it back. I reply with a rate and a date.', body: 'Hi Wehan,\n\nI’d like to ask about editing.\n\nWhat the document is and roughly how long: \nWhen I need it back: \n\nThanks,\n' },
    design: { ch: 'make', title: 'Request learning design', subject: 'Learning design request', intro: 'Tell me what you need built and who it is for. I reply with a plan, a rate and a timeline.', body: 'Hi Wehan,\n\nI’d like to ask about learning design.\n\nWhat I need built: \nWho it is for: \nWhen I need it: \n\nThanks,\n' },
    consulting: { ch: 'make', title: 'Request consulting', subject: 'Consulting request', intro: 'Tell me the question and who it is for. I reply with a proposal and a rate.', body: 'Hi Wehan,\n\nI’d like to talk about philosophical and AI consulting.\n\nFor me personally, or for a school, team or organisation: \nThe question or situation: \nA talk, a workshop, a written brief, or a conversation: \n\nThanks,\n' },
    any: { ch: 'write', title: 'Write to me', subject: 'Hello', intro: 'For anything else: a post, a reference, a question, a hello.', body: 'Hi Wehan,\n\n\n\nThanks,\n' }
  };
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  Object.keys(REQUESTS).forEach(k => {
    const r = REQUESTS[k];
    library['request-' + k] = { title: r.title, ch: r.ch, html:
      '<p class="when">' + r.intro + '</p>' +
      '<div class="req" data-kind="' + k + '">' +
        '<label class="req-label" for="req-from">Your email <small>so that I can reply</small></label>' +
        '<input id="req-from" class="req-from" type="email" autocomplete="email" placeholder="you@example.com">' +
        '<input class="req-trap" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<label class="req-label" for="req-body">Your message <small>change anything you like</small></label>' +
        '<textarea id="req-body" class="req-body" rows="9" spellcheck="false">' + esc(r.body) + '</textarea>' +
        '<div class="req-actions">' +
          '<button class="btn solid" type="button" data-send="here">Send from here</button>' +
          '<button class="btn" type="button" data-send="mail">Send from my email app</button>' +
          '<button class="btn" type="button" data-send="gmail">Send from Gmail</button>' +
          '<button class="btn" type="button" data-send="copy">Copy the message</button>' +
        '</div>' +
        '<p class="req-to">To <button type="button" class="inline" data-copy="' + EMAIL + '">' + EMAIL + '</button> · subject: ' + r.subject + '</p>' +
        '<p class="note">Send from here goes through Formspree, which stores messages on servers abroad; I reply from Gmail. The other buttons use your own email.</p>' +
        (k !== 'any' ? '<p class="more"><button type="button" data-sheet="book">Book a free intro call instead →</button></p>' : '') +
      '</div>' };
  });
  function copyText(t) {
    const legacy = () => new Promise((res, rej) => {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); ok ? res() : rej();
    });
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).catch(legacy);
    return legacy();
  }
  function flash(btn, msg) { const old = btn.textContent; btn.textContent = msg; btn.disabled = true; setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 1800); }
  function activateRequest(container) {
    const form = $('.req', container); if (!form) return;
    const r = REQUESTS[form.dataset.kind], ta = $('.req-body', form);
    form.addEventListener('click', e => {
      const b = e.target.closest('[data-send]'); if (!b) return;
      const text = ta.value;
      track('send-' + form.dataset.kind + '-' + b.dataset.send);
      if (b.dataset.send === 'here') {
        const from = $('.req-from', form), trap = $('.req-trap', form);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.value)) { from.focus(); flash(b, 'Add your email first'); return; }
        if (text.trim().length < 10) { ta.focus(); flash(b, 'Write a message first'); return; }
        b.disabled = true; b.textContent = 'Sending…';
        fetch(FORM_URL, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: from.value, message: text, _subject: r.subject, _gotcha: trap.value }) })
          .then(res => { if (!res.ok) throw new Error(res.status); b.textContent = 'Sent ✓ I will reply by email'; })
          .catch(() => { b.disabled = false; b.textContent = 'Could not send. Try the email buttons'; setTimeout(() => { b.textContent = 'Send from here'; }, 3000); });
        return;
      }
      if (b.dataset.send === 'mail') location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(r.subject) + '&body=' + encodeURIComponent(text);
      else if (b.dataset.send === 'gmail') window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) + '&su=' + encodeURIComponent(r.subject) + '&body=' + encodeURIComponent(text), '_blank', 'noopener');
      else copyText('To: ' + EMAIL + '\nSubject: ' + r.subject + '\n\n' + text).then(() => flash(b, 'Copied ✓'), () => flash(b, 'Could not copy'));
    });
  }
  // The order Previous and Next step through, as the old Map menu had it.
  const ORDER = {
    threshold: ['about', 'qualifications', 'why'],
    teach: ['approach', 'abbotts', 'garsfontein', 'macbeth', 'tempest', 'poems', 'grammar', 'film', 'enrichment', 'beyond', 'ai'],
    think: ['posts', 'courses', 'guides', 'lectures', 'testimonials', 'publications', 'papers', 'funding', 'philosophy', 'curriculum', 'assessment', 'support'],
    make: ['tutoring', 'editing', 'design', 'consulting', 'working', 'book'],
    write: ['request-any', 'referees', 'resume']
  };

  const scrim = $('#scrim'), sheet = $('#sheet'), sheetCh = $('#sheet-ch'), sheetTitle = $('#sheet-title'), sheetBody = $('#sheet-body'), sheetWhere = $('#sheet-where'), sheetArt = $('#sheet-art');
  let openId = null, lastFocus = null, sheetTimer = null;

  function showScrim() { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('on')); }
  function hideScrimIfIdle() { if (sheet.classList.contains('on')) return; scrim.classList.remove('on'); setTimeout(() => { if (!scrim.classList.contains('on')) scrim.hidden = true; }, 360); }
  function lock() { body.classList.add('locked'); }
  function unlockIfIdle() { if (!sheet.classList.contains('on')) body.classList.remove('locked'); }

  function activateEmbeds(container) {
    $$('.embed', container).forEach(e => {
      if (e.querySelector('iframe, video')) return;
      if (e.dataset.video) {
        const v = document.createElement('video');
        v.src = e.dataset.video; v.controls = true; v.preload = 'metadata'; v.playsInline = true;
        e.appendChild(v); return;
      }
      const f = document.createElement('iframe');
      f.src = e.dataset.src; f.loading = 'lazy'; f.setAttribute('allow', 'autoplay; fullscreen'); f.setAttribute('allowfullscreen', '');
      f.title = sheetTitle.textContent;
      e.appendChild(f);
    });
  }

  // The long pieces (data-read) open as a centred page with a contents line; everything else stays a drawer.
  function addContents(container) {
    const heads = $$('h4', container);
    if (heads.length < 3) return;
    const nav = document.createElement('nav');
    nav.className = 'contents'; nav.setAttribute('aria-label', 'Contents');
    heads.forEach((h, i) => {
      h.id = 'read-' + i;
      const b = document.createElement('button'); b.type = 'button'; b.textContent = h.textContent; b.dataset.jump = h.id;
      nav.appendChild(b);
    });
    container.prepend(nav);
  }
  sheetBody.addEventListener('click', e => {
    const j = e.target.closest('[data-jump]');
    if (!j) return;
    const t = $('#' + j.dataset.jump, sheetBody);
    if (t) sheetBody.scrollTo({ top: t.getBoundingClientRect().top - sheetBody.getBoundingClientRect().top + sheetBody.scrollTop - 12, behavior: 'smooth' });
  });
  // Dressing at open time, so the HTML stays plain: the date line becomes chips, the opening paragraph a lede.
  function dressSheet(container) {
    const when = $(':scope > .when', container);
    if (when && when.innerHTML.includes(' \u00b7 ')) {
      const parts = when.innerHTML.split(' \u00b7 ');
      if (parts.length >= 2 && parts.length <= 6) { when.innerHTML = parts.map(p => '<span>' + p.trim() + '</span>').join(''); when.classList.add('chips'); }
    }
    const lede = $$(':scope > *', container).slice(0, 4).find(k => k.tagName === 'P' && !k.className);
    if (lede && lede.textContent.length > 80) lede.classList.add('lede');
    // Links that leave the pop-up (a file, a Drive document) become cards, in the link's own words
    $$('.more', container).forEach(more => {
      const links = $$('a[href]:not(.btn)', more);
      if (!links.length) return;
      const cards = document.createElement('div'); cards.className = 'dl-cards';
      links.forEach(a => {
        const href = a.getAttribute('href'), words = a.textContent.replace(/\s*\u2197\s*$/, '').trim();
        const local = !/^https?:/.test(href);
        const kind = /\.pdf$/i.test(href) ? 'PDF' : /drive\.google/.test(href) ? 'Google Drive' : /docs\.google/.test(href) ? 'Google Docs' : '';
        const said = kind && new RegExp(kind.split(' ').pop(), 'i').test(words);
        a.className = 'dl';
        a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (local ? '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>' : '<path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5M9 13h6M9 17h6"/>') + '</svg><b></b>' + (kind && !said ? '<span>' + kind + '</span>' : '');
        a.querySelector('b').textContent = words;
        cards.appendChild(a);
      });
      more.parentNode.insertBefore(cards, more);
      if (!more.textContent.trim()) more.remove();
    });
    let lastYear = null;
    $$('.timeline li', container).forEach(li => {
      const b = $('b', li);
      if (!b) return;
      if (b.textContent === lastYear) b.classList.add('again');
      lastYear = b.textContent;
      if (li.querySelector('.t-title')) return;
      const rest = li.innerHTML.slice(li.innerHTML.indexOf('</b>') + 4).trim();
      const k = rest.indexOf(' \u00b7 ');
      li.innerHTML = b.outerHTML + '<span class="t-title">' + (k < 0 ? rest : rest.slice(0, k)) + '</span>' + (k < 0 ? '' : '<span class="t-where">' + rest.slice(k + 3) + '</span>');
    });
  }
  // Student ratings draw themselves as bars, scaled out of five.
  function activateRatings(container) {
    const rows = $$('.ratings li', container);
    if (!rows.length) return;
    requestAnimationFrame(() => requestAnimationFrame(() => rows.forEach(li => {
      const b = li.querySelector('b'), v = b && parseFloat(b.textContent);
      if (v) li.style.setProperty('--v', (v / 5).toFixed(3));
    })));
  }
  // The lesson at a glance: tap a stage in the bar and read that stage.
  function initStages(container) {
    $$('.lesson-bar', container).forEach(bar => {
      const steps = bar.parentElement.querySelector('ol.steps'); if (!steps) return;
      const segs = $$('span', bar), items = $$('li', steps);
      bar.classList.add('staged'); steps.classList.add('staged');
      const pick = i => { segs.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); items.forEach((li, k) => { li.dataset.n = k + 1; li.classList.toggle('on', k === i); }); };
      segs.forEach((s, i) => { s.setAttribute('role', 'button'); s.setAttribute('tabindex', '0'); s.addEventListener('click', () => pick(i)); s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } }); });
      pick(0);
    });
  }
  function openSheet(id) {
    const item = library[id];
    if (!item) return;
    clearTimeout(sheetTimer);
    closePanel();
    if (!sheet.classList.contains('on')) lastFocus = document.activeElement;
    openId = id;
    sheet.dataset.ch = item.ch;
    if (item.tone) sheet.dataset.tone = item.tone; else delete sheet.dataset.tone;
    const art = item.art || (id.indexOf('request-') === 0 ? 'envelope' : id.indexOf('star-') === 0 ? 'star' : '');
    sheetArt.innerHTML = ART[art] ? '<svg viewBox="0 0 48 48">' + ART[art] + '</svg>' : '';
    sheetCh.textContent = CH_LABEL[item.ch] || '';
    sheetTitle.textContent = item.title;
    sheetBody.innerHTML = item.html;
    sheetBody.scrollTop = 0;
    sheet.classList.toggle('read', !!item.read);
    dressSheet(sheetBody);
    if (item.read) addContents(sheetBody);
    activateEmbeds(sheetBody); activateRequest(sheetBody); activateRatings(sheetBody); initStages(sheetBody);
    const order = ORDER[item.ch] || [], i = order.indexOf(id);
    $('#sheet-prev').disabled = !(i > 0); $('#sheet-next').disabled = !(i >= 0 && i < order.length - 1);
    sheetWhere.textContent = i >= 0 ? (i + 1) + ' of ' + order.length + ' · ' + (CH_LABEL[item.ch] || '') : '';
    sheet.hidden = false; showScrim(); lock();
    requestAnimationFrame(() => { sheet.classList.add('on'); sheetTitle.focus({ preventScroll: true }); });
    try { history.replaceState(null, '', '#s-' + id); } catch (e) {}
  }
  function closeSheet() {
    if (!sheet.classList.contains('on')) return;
    sheet.classList.remove('on'); openId = null;
    sheetTimer = setTimeout(() => { sheet.hidden = true; sheetBody.innerHTML = ''; }, 460);
    unlockIfIdle(); hideScrimIfIdle();
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; }
  }
  function stepSheet(d) {
    if (!openId) return;
    const order = ORDER[library[openId].ch] || [], i = order.indexOf(openId);
    if (i < 0) return;
    const n = order[i + d];
    if (n) openSheet(n);
  }
  $('#sheet-close').addEventListener('click', closeSheet);
  $('#sheet-prev').addEventListener('click', () => stepSheet(-1));
  $('#sheet-next').addEventListener('click', () => stepSheet(1));

  scrim.addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); closePanel(); closeCvs(); } });

  /* ---------- The board's tabs (narrow screens) ---------- */
  const board = $('#board'), tabs = $$('.tabs [data-tab]');
  function openTab(k) { board.dataset.open = k; tabs.forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === k ? 'true' : 'false')); }
  tabs.forEach(b => b.addEventListener('click', () => { openTab(b.dataset.tab); track('tab-' + b.dataset.tab); }));

  /* ---------- The contact panel: the form, opened from the bar at the bottom ---------- */
  const panel = $('#panel'), panelBody = $('#panel-body'), panelBtns = [$('#bar-write'), $('#bar-one')];
  let panelTimer = null, panelFocus = null;
  function openPanel() {
    if (panel.classList.contains('on')) return;
    clearTimeout(panelTimer); closeSheet(); closeCvs();
    panelFocus = document.activeElement;
    if (!panelBody.firstChild) { panelBody.innerHTML = library['request-any'].html; activateRequest(panelBody); }   // filled once, so a half-written message survives closing the panel
    panel.hidden = false; panelBtns.forEach(b => b.setAttribute('aria-expanded', 'true'));
    void panel.offsetWidth;   // lay it out where it starts, so that it slides up instead of jumping
    panel.classList.add('on'); $('#panel-title').focus({ preventScroll: true });
  }
  function closePanel(refocus) {
    if (!panel.classList.contains('on')) return;
    panel.classList.remove('on'); panelBtns.forEach(b => b.setAttribute('aria-expanded', 'false'));
    panelTimer = setTimeout(() => { panel.hidden = true; }, 320);
    if (refocus && panelFocus && panelFocus.focus) panelFocus.focus({ preventScroll: true });
    panelFocus = null;
  }
  panelBtns.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); if (panel.classList.contains('on')) closePanel(true); else openPanel(); }));
  $('#panel-close').addEventListener('click', () => closePanel(true));
  document.addEventListener('click', e => { if (panel.classList.contains('on') && !e.target.closest('#panel')) closePanel(); });

  /* ---------- Places on the page, and the addresses of the old site ---------- */
  // #teach and #make were the service cabinets: they lead to the board. #think was the academic cabinet: it leads to About. #write opens the contact panel.
  const PLACES = { '#top': 'top', '#threshold': 'top', '#board': 'top', '#teach': 'teach', '#make': 'top', '#make-detail': 'top', '#about': 'about', '#think': 'about', '#think-detail': 'about', '#teach-detail': 'about', '#write': 'panel' };
  function goPlace(hash, instant) {
    const p = PLACES[hash];
    if (!p) return false;
    closeSheet(); body.classList.remove('locked');
    if (p === 'panel') { openPanel(); return true; }
    closePanel();
    if (p === 'teach') openTab('teach');
    const how = instant || reduced ? 'auto' : 'smooth';
    if (p === 'about') $('#about').scrollIntoView({ behavior: how, block: 'start' }); else window.scrollTo({ top: 0, behavior: how });
    return true;
  }

  // One listener for every "open this" button on the page and inside the pop-ups.
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copy]');
    if (c) { e.preventDefault(); copyText(c.dataset.copy).then(() => flash(c, 'Copied ✓'), () => flash(c, 'Could not copy')); return; }
    const s = e.target.closest('[data-sheet]');
    if (s) { e.preventDefault(); openSheet(s.dataset.sheet); return; }
    const a = e.target.closest('a[href^="#"]'), href = a && a.getAttribute('href');
    if (href && PLACES[href]) {
      e.preventDefault(); goPlace(href);
      try { history.replaceState(null, '', PLACES[href] === 'top' || PLACES[href] === 'teach' ? location.pathname + location.search : href); } catch (err) {}
    }
  });
  function openFromHash() {
    const h = location.hash || '';
    if (h.startsWith('#s-')) { const id = h.slice(3); if (library[id]) openSheet(id); }
    else if (h.length > 1) goPlace(h, true);
  }
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Voices: what students, mentors and colleagues say, one at a time ---------- */
  const VOICES = {
    teach: { more: 'testimonials', items: [
      ['Excellent knowledge and innovative way of using media.', 'University of Pretoria mentor lecturer · observed Grade 11 poetry lesson, 2026 · 98 out of 100'],
      ['Enhanced the learners’ vocabulary through scaffolding.', 'Mentor teacher, Abbotts College Pretoria East · formal assessment, 2026 · 95 out of 100'],
      ['Dr Coombs was in total control of the material and guided and facilitated student learning actively by successfully engaging students in learning.', 'Prof Emma Ruttkamp-Bloem · lecture observation, University of Pretoria'],
      ['He is friendly but also firm in terms of discipline.', 'Prof Emma Ruttkamp-Bloem · peer evaluation report, 2026'],
      ['Mr Coombs does an incredible job at grabbing our attention and forcing us to truly think and be present.', 'A first-year student, 2023']
    ] },
    think: { more: 'testimonials', items: [
      ['In 2019 I noted that Dr Coombs had the potential to become a brilliant lecturer. In the years since, he has more than fulfilled that potential, and I recommend him without reservation.', 'Prof Emma Ruttkamp-Bloem · Head of Philosophy, University of Pretoria, 2026'],
      ['His dissertation was a careful, scholarly, deep investigation into the Platonic method.', 'Prof John F. Finamore · Emeritus Professor of Classics, University of Iowa, 2026'],
      ['This is an exceptional thesis. I recommend this thesis receive a PhD without reservation.', 'PhD examiner · Ainigma, 2023'],
      ['A creative and rigorous scholar, and among the most capable early-career philosophers I have worked with.', 'Dr Mitchell-Ron Black · research collaborator, 2026'],
      ['Without exaggeration, those seminars changed the way I write and engage with the tradition in which I am trained.', 'Dr Mitchell-Ron Black · on the honours seminars, 2026'],
      ['Wehan is an excellent teacher and researcher who knows Plato’s philosophy well.', 'Prof John F. Finamore · Emeritus Professor of Classics, University of Iowa, 2026'],
      ['Mr Coombs is a fantastic lecturer who manages to explain deep philosophical topics in a manner that is easy to grasp.', 'A first-year student, 2020'],
      ['The content was by far the most complex and difficult material I have encountered in my academic career so far, but the way in which seminars were presented made it much easier to grapple with.', 'An honours student, 2024'],
      ['It is needless to say this course has been my favorite in honours so far.', 'An honours student, 2025']
    ] },
    make: { more: 'testimonials', items: [
      ['One-on-one consultations were especially useful for receiving advice and insights for essays and assignments. Additionally, assignment feedback was always helpful and detailed.', 'An honours student, 2024'],
      ['Dr. Coombs is passionate and knowledgeable in his field, he has the ability to simplify complex ideas, which is helpful as a student.', 'An honours student, 2024'],
      ['Professor Coombs is able to explain abstract concepts in a way that makes it easy to understand.', 'A first-year student, 2023'],
      ['He moves between close readings of Plato and present concerns without flattening either, bringing out the best in the people he works with as he goes along.', 'Dr Mitchell-Ron Black · research collaborator, 2026'],
      ['Students describe the seminars as challenging but highly interactive, and comment on his command of the material, his ability to make complex ideas accessible, his availability for consultation and the good organisation of his modules.', 'Prof Emma Ruttkamp-Bloem · peer evaluation report, 2026']
    ] }
  };
  $$('.voices[data-set]').forEach(box => {
    const set = VOICES[box.dataset.set]; if (!set) return;
    let i = 0, timer = null, visible = false;
    box.innerHTML = '<figure class="voice"><p></p><figcaption></figcaption></figure><div class="voices-nav">' +
      set.items.map((_, k) => '<button type="button" aria-label="Quotation ' + (k + 1) + ' of ' + set.items.length + '"></button>').join('') +
      '<button class="textlink" type="button" data-sheet="' + set.more + '">More →</button></div>';
    const fig = $('.voice', box), p = $('p', fig), cap = $('figcaption', fig), dots = $$('.voices-nav button:not(.textlink)', box);
    const extra = box.nextElementSibling;
    if (extra && extra.classList.contains('voices-extra')) { $('.voices-nav', box).append(...extra.children); extra.remove(); }
    function show(k, instant) {
      i = (k + set.items.length) % set.items.length;
      const go = () => { p.textContent = set.items[i][0]; cap.textContent = set.items[i][1]; fig.classList.remove('swap'); dots.forEach((d, n) => { if (n === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); }); };
      if (instant || reduced) go(); else { fig.classList.add('swap'); setTimeout(go, 360); }
    }
    function arm() { clearTimeout(timer); if (!visible) return; timer = setTimeout(() => { show(i + 1); arm(); }, 8000); }
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); arm(); }));
    box.addEventListener('mouseenter', () => clearTimeout(timer));
    box.addEventListener('mouseleave', arm);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; arm(); }, { threshold: .3 }).observe(box);
    show(0, true);
  });

  /* ---------- The arc of a lesson ---------- */
  const arcPath = $('#arcpath'), runner = $('.arc .runner'), arcNodes = $$('.arc .node'), arcText = $('#arc-text');
  const arcLen = arcPath.getTotalLength();
  function fracAt(x, y) {
    let best = 0, bd = 1e12;
    for (let i = 0; i <= 300; i++) { const p = arcPath.getPointAtLength(arcLen * i / 300); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i / 300; } }
    return best;
  }
  const fr = arcNodes.map(n => fracAt(+n.dataset.x, +n.dataset.y));
  fr[0] = 0; fr[fr.length - 1] = 1;
  const A = { phase: 0, hold: performance.now() + 3000, last: performance.now(), idx: -1, visible: false };
  new IntersectionObserver(es => { A.visible = es[0].isIntersecting; }, { threshold: .2 }).observe($('.arc'));
  function setArc(i) {
    if (A.idx === i) return;
    A.idx = i;
    arcNodes.forEach((n, k) => { n.classList.toggle('is-on', k === i); n.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    arcText.classList.add('swap');
    setTimeout(() => { arcText.textContent = arcNodes[i].dataset.text; arcText.classList.remove('swap'); }, 200);
  }
  function placeRunner() { const p = arcPath.getPointAtLength(A.phase * arcLen); runner.setAttribute('cx', p.x); runner.setAttribute('cy', p.y); }
  function arcTick(t) {
    const dt = Math.min(60, t - A.last); A.last = t;
    if (!A.visible || t < A.hold) { placeRunner(); return; }
    const prev = A.phase;
    if (A.idx === 2 && prev >= 1) { A.phase = 0; A.hold = t + 3000; setArc(0); placeRunner(); return; }
    let ph = prev + dt / 12000;
    for (let k = 1; k < fr.length; k++) { if (prev < fr[k] && ph >= fr[k]) { ph = fr[k]; A.hold = t + 3200; setArc(k); break; } }
    A.phase = ph; placeRunner();
  }
  setArc(0);
  arcNodes.forEach((n, i) => {
    const go = () => { A.phase = fr[i]; A.hold = performance.now() + 7000; setArc(i); placeRunner(); };
    n.addEventListener('click', go);
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* ---------- The shelf: what I taught in 2026 ---------- */
  const SHELF = {
    macbeth: { cap: '<strong>Macbeth.</strong> Grade 10 Home Language, three classes, August. Whose fault is the murder, a banquet with an empty chair, and a revision sheet of my own.', sheet: 'macbeth' },
    tempest: { cap: '<strong>The Tempest.</strong> Grade 11 Home Language, five classes. A scene a day through Act 3, staged with desks, sweets and thunder; then the RSC.', sheet: 'tempest' },
    grammar: { cap: '<strong>Grammar.</strong> Grade 10 First Additional Language at Hoërskool Garsfontein, May. Conditionals and prepositions, taught inside real situations.', sheet: 'grammar' },
    film: { cap: '<strong>Film study.</strong> Grade 11: the language of film, then a pub quiz on shots and angles. Grade 10: Spirited Away and Howl’s Moving Castle, with a method called FRAME.', sheet: 'film' },
    enrichment: { cap: '<strong>Philosophy for teenagers.</strong> Grade 11 enrichment, September. Prove your neighbour exists, trolley problems, an ask-me-anything, and English as the meta-skill.', sheet: 'enrichment' }
  };
  const POEMS = [
    { id: 'poem-words', title: 'Too Many Words', poet: 'Bernard Levinson', where: 'Gr 10 · Garsfontein' },
    { id: 'poem-clothes', title: 'The Clothes', poet: 'Mongane Wally Serote', where: 'Gr 10 · Garsfontein' },
    { id: 'poem-oompiet', title: 'For Oom Piet', poet: 'Finuala Dowling', where: 'Gr 11 · Abbotts' },
    { id: 'poem-herb', title: 'The Herb Garden', poet: 'Stephen Gray', where: 'Gr 11 · Abbotts' },
    { id: 'poem-poet', title: 'The Poet', poet: 'Shakespeare, A Midsummer Night’s Dream', where: 'Gr 11 · Abbotts' }
  ];
  const shelfDetail = $('#shelf-detail'), spines = $$('.shelf [data-item]');
  function showShelf(item) {
    spines.forEach(b => { const on = b.dataset.item === item; b.classList.toggle('is-on', on); if (b.dataset.item === 'poems') b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    if (item === 'poems') {
      shelfDetail.innerHTML = '<div class="fan" role="group" aria-label="The five poems I taught">' + POEMS.map((p, i) =>
        '<button class="poem-card" type="button" data-sheet="' + p.id + '" style="animation-delay:' + (i * 90) + 'ms"><span class="p-title">' + p.title + '</span><span class="p-poet">' + p.poet + '</span><span class="p-where">' + p.where + '</span></button>').join('') + '</div>';
    } else {
      const d = SHELF[item];
      shelfDetail.innerHTML = '<p class="caption">' + d.cap + ' <button class="textlink" type="button" data-sheet="' + d.sheet + '">Open →</button></p>';
    }
  }
  spines.forEach(b => b.addEventListener('click', () => showShelf(b.dataset.item)));

  /* ---------- The constellation ---------- */
  const NODES = [
    { id: 'plato', x: 520, y: 225, r: 10, big: true, label: 'Plato',
      body: 'The centre of the map. My PhD, <em>Ainigma</em>, read Plato’s esotericism in its historical context: what he wrote, what he withheld, and why.',
      links: [['Ainigma: Plato’s Esotericism in Context (PhD, 2023)', 'https://repository.up.ac.za/handle/2263/89290']] },
    { id: 'aristotle', x: 205, y: 150, r: 6.5, label: 'Aristotle',
      body: 'My MA, <em>Symphonia</em>, argued that Aristotle stays in harmony with Plato on the separable, immortal soul. The argument became a journal article in 2017.',
      links: [['Aristotle’s harmony with Plato on separable and immortal soul (SAJP, 2017)', 'https://doi.org/10.1080/02580136.2017.1385951'], ['Symphonia: Aristotle versus Plato Critiqued (MA, 2016)', 'https://repository.up.ac.za/handle/2263/57175']] },
    { id: 'neo', x: 755, y: 148, r: 7.5, label: 'Neoplatonism',
      body: 'Plotinus, Iamblichus, Proclus. A member of the International Society for Neoplatonic Studies since 2017. In 2026 I designed and taught the honours course <em>Philosophy as a Rite of Rebirth: From Ancient Egypt to Neoplatonism</em>.', more: 'guide-c5' },
    { id: 'theurgy', x: 925, y: 55, r: 5.5, label: 'Theurgy',
      body: 'Ritual as philosophy in late Platonism. Conference paper: <em>The Curious Case of Neoplatonic Ritual Magic</em>, PSSA, University of KwaZulu-Natal, 2020.', more: 'papers' },
    { id: 'egypt', x: 965, y: 240, r: 5.5, label: 'Ancient Egypt',
      body: 'Where the rite of rebirth begins. The opening movement of the honours course <em>Philosophy as a Rite of Rebirth</em> (FIL710/810, 2026).', more: 'guide-c5' },
    { id: 'eso', x: 670, y: 335, r: 7.5, label: 'Esotericism',
      body: 'Hidden teachings, and how to read them. Honours course: <em>The (Secret) History of Thought</em> (2024, 2025). Paper: <em>Reflexive Esotericism: Insights from Literary and Theological Hermeneutics</em>, PSSA, 2025.', more: 'guide-c3' },
    { id: 'african', x: 880, y: 405, r: 6.5, label: 'African esotericism',
      body: 'Postdoctoral Research Fellow at the University of Johannesburg, 2024 to 2026: <em>Platonic and African Esotericism</em>, with an eye on decolonial curricula.', more: 'posts' },
    { id: 'life', x: 265, y: 325, r: 6.5, label: 'A way of life',
      body: 'Philosophy as practice, not only doctrine. Designed and taught <em>The Good Life</em> (FIL220, 2024).', more: 'guide-c4' },
    { id: 'nature', x: 115, y: 400, r: 5.5, label: 'Animism & nature',
      body: '<em>Animism, Consilience and the Rights of Nature</em>, co-presented at the South African Society for Environmental Philosophy, North-West University, 2025.', more: 'papers' },
    { id: 'rorty', x: 75, y: 250, r: 5, label: 'Rorty',
      body: 'An early article: <em>Contingency, irony and morality: a critical review of Rorty’s notion of the liberal utopia</em>, Humanities, 2013.',
      links: [['Read the article', 'https://doi.org/10.3390/h2020313']] },
    { id: 'meta', x: 450, y: 405, r: 5.5, label: 'Metacrisis',
      body: '<em>Is Philosophy A(gnostic)? Post-disciplinary Interventions in the Time of Metacrisis</em>, PSSA Annual Conference, University of Cape Town, 2026, with Mitchell Black.', more: 'papers' },
    { id: 'ai', x: 340, y: 55, r: 6.5, label: 'AI & the humanities',
      body: 'What is human teaching for, once a machine can write the essay? My current project, <em>Socratic Pedagogy beyond the AI Horizon</em>, reads Plato’s <em>Phaedrus</em> as a guide to what cannot be automated in learning, and to how teaching should be built around it. Proposed as a 2027 fellowship at the University of Pretoria.', more: 'ai' }
  ];
  const EDGES = [['plato', 'aristotle'], ['plato', 'neo'], ['plato', 'eso'], ['plato', 'life'], ['plato', 'rorty'], ['neo', 'theurgy'], ['neo', 'egypt'], ['theurgy', 'egypt'], ['eso', 'african'], ['eso', 'neo'], ['eso', 'meta'], ['life', 'nature'], ['life', 'meta'], ['nature', 'meta'], ['african', 'egypt'], ['plato', 'ai'], ['ai', 'life']];
  NODES.forEach(n => {
    const links = (n.links || []).map(l => '<li><a href="' + l[1] + '" target="_blank" rel="noopener">' + l[0] + '</a></li>').join('');
    library['star-' + n.id] = { title: n.label, ch: 'think', html: '<p class="when">A star in my research</p><p>' + n.body + '</p>' + (links ? '<ul class="list">' + links + '</ul>' : '') + '<p class="more">' + (n.more ? '<button type="button" data-sheet="' + n.more + '">Go further →</button> ' : '') + '<button type="button" data-sheet="publications">Research and publications →</button></p>' };
  });
  const sky = $('#sky'), NS = 'http://www.w3.org/2000/svg';
  const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const put = (e, a) => { for (const k in a) e.setAttribute(k, a[k]); };
  // On a phone the same twelve stars are laid out again in a tall frame, so that every star and every name fits the screen with no sideways scrolling.
  const TALL = { ai: [112, 42], theurgy: [290, 46], aristotle: [62, 132], neo: [238, 130], rorty: [44, 236], plato: [172, 236], egypt: [308, 222], life: [78, 340], eso: [254, 332], nature: [74, 452], meta: [178, 420], african: [264, 492] };
  const byId = {}; NODES.forEach(n => { byId[n.id] = n; });
  const edgeEls = EDGES.map(([a, b]) => { const l = mk('line', {}); l.dataset.a = a; l.dataset.b = b; sky.appendChild(l); return l; });
  const nodeEls = {};
  NODES.forEach(n => {
    const g = mk('g', { class: 'node' + (n.big ? ' big' : ''), tabindex: '0', role: 'button', 'aria-label': n.label });
    n.hit = mk('circle', { class: 'hit' }); n.glow = mk('circle', { class: 'glow' }); n.dot = mk('circle', { class: 'dot' }); n.tx = mk('text', { 'text-anchor': 'middle' });
    n.dot.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's'; n.tx.textContent = n.label;
    g.append(n.hit, n.glow, n.dot, n.tx);
    sky.appendChild(g); nodeEls[n.id] = g;
    const lit = on => {
      g.classList.toggle('lit', on);
      edgeEls.forEach(l => {
        if (l.dataset.a !== n.id && l.dataset.b !== n.id) return;
        l.classList.toggle('lit', on);
        const o = l.dataset.a === n.id ? l.dataset.b : l.dataset.a;
        if (nodeEls[o]) nodeEls[o].classList.toggle('near', on);
      });
    };
    g.addEventListener('mouseenter', () => lit(true)); g.addEventListener('mouseleave', () => lit(false));
    g.addEventListener('focus', () => lit(true)); g.addEventListener('blur', () => lit(false));
    g.addEventListener('click', () => openSheet('star-' + n.id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSheet('star-' + n.id); } });
  });
  const narrowSky = matchMedia('(max-width: 640px)');
  function placeSky() {
    const tall = narrowSky.matches, k = tall ? .72 : 1, at = n => tall ? TALL[n.id] : [n.x, n.y];
    sky.setAttribute('viewBox', tall ? '0 0 360 524' : '0 0 1040 450'); sky.classList.toggle('tall', tall);
    NODES.forEach(n => {
      const p = at(n), r = n.r * k;
      put(n.hit, { cx: p[0], cy: p[1], r: tall ? 24 : 28 }); put(n.glow, { cx: p[0], cy: p[1], r: r * 2.4 }); put(n.dot, { cx: p[0], cy: p[1], r: r }); put(n.tx, { x: p[0], y: p[1] + r + (tall ? 17 : 24) });
    });
    edgeEls.forEach(l => { const a = at(byId[l.dataset.a]), b = at(byId[l.dataset.b]); put(l, { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }); });
  }
  placeSky();
  if (narrowSky.addEventListener) narrowSky.addEventListener('change', placeSky); else if (narrowSky.addListener) narrowSky.addListener(placeSky);

  /* ---------- Lectures: the player loads when you press play ---------- */
  $$('.lecture').forEach(l => {
    $('.play', l).addEventListener('click', () => {
      if (l.classList.contains('playing')) return;
      const f = document.createElement('iframe');
      f.src = l.dataset.src; f.setAttribute('allow', 'autoplay; fullscreen'); f.setAttribute('allowfullscreen', ''); f.title = $('.l-cap strong', l).textContent;
      l.appendChild(f); l.classList.add('playing');
    });
  });

  /* ---------- Beside the Teach heading: the lesson arc, small, with a point that runs along it ---------- */
  const miniPath = $('#mini-arcpath'), miniRun = $('.mini-run');
  function miniTick(t) {
    if (!miniPath || reduced) return;
    const len = miniPath.getTotalLength(); if (!len) return;   // nothing to do while the heading is hidden (narrow screens)
    const s = (t % 7200) / 7200, p = miniPath.getPointAtLength(len * Math.min(1, s / .72));   // up the arc, then a short rest at the top
    miniRun.setAttribute('cx', p.x.toFixed(2)); miniRun.setAttribute('cy', p.y.toFixed(2));
  }

  /* ---------- Beside the Consult heading: the tetraktys, small. Four corners of a tetrahedron and the middle of each edge:
     ten points, turning slowly, with one lighting up now and then. ---------- */
  const mt = $('#mini-tetra');
  let drawMini = () => {};
  if (mt) {
    const mx = mt.getContext('2d'), K = Math.min(window.devicePixelRatio || 1, 2);
    const R3 = Math.sqrt(8 / 9), V4 = [[0, 1, 0], [R3, -1 / 3, 0], [-R3 / 2, -1 / 3, R3 * Math.sqrt(3) / 2], [-R3 / 2, -1 / 3, -R3 * Math.sqrt(3) / 2]];
    const P = V4.slice();
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) P.push(V4[a].map((v, n) => (v + V4[b][n]) / 2));
    const gap3 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]), nearest = gap3(P[0], P[4]);
    const LINKS = [];
    for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++) if (Math.abs(gap3(P[a], P[b]) - nearest) < 1e-6) LINKS.push([a, b]);
    const glow = P.map(() => 0);
    let MW = 0, ay = -.35, lastSpark = 0, lastT = 0;
    const sizeMini = () => { MW = mt.getBoundingClientRect().width; if (!MW) return; mt.width = mt.height = Math.round(MW * K); mx.setTransform(K, 0, 0, K, 0, 0); };
    sizeMini();
    if ('ResizeObserver' in window) new ResizeObserver(sizeMini).observe(mt);
    drawMini = t => {
      if (!MW) return;
      const dt = Math.min(50, t - lastT); lastT = t;
      if (!reduced) { ay += dt * .00055; if (t - lastSpark > 700) { lastSpark = t; glow[Math.floor(Math.random() * glow.length)] = 1; } }
      for (let i = 0; i < glow.length; i++) glow[i] *= .965;
      const ca = Math.cos(.3), sa = Math.sin(.3), cb = Math.cos(ay), sb = Math.sin(ay), sc = MW * .4, g = pal.gold, tc = pal.text;
      const col = g.r + ',' + g.g + ',' + g.b, tcol = tc.r + ',' + tc.g + ',' + tc.b;
      const pts = P.map(p => { const y0 = p[1] - .12, x = p[0] * cb + p[2] * sb, z0 = -p[0] * sb + p[2] * cb, y = y0 * ca - z0 * sa, z = y0 * sa + z0 * ca, f = 3.4 / (3.4 - z); return { x: MW / 2 + x * f * sc, y: MW / 2 - y * f * sc, d: Math.max(0, Math.min(1, (z + 1) / 2)) }; });
      mx.clearRect(0, 0, MW, MW);
      for (const l of LINKS) {
        const a = pts[l[0]], b = pts[l[1]], dep = (a.d + b.d) / 2;
        mx.lineWidth = .6 + .6 * dep; mx.strokeStyle = 'rgba(' + col + ',' + (.25 + .6 * dep).toFixed(3) + ')';
        mx.beginPath(); mx.moveTo(a.x, a.y); mx.lineTo(b.x, b.y); mx.stroke();
      }
      pts.forEach((p, i) => {
        const r = MW * (.024 + .022 * p.d) * (1 + glow[i] * .7);
        mx.fillStyle = 'rgba(' + col + ',' + (.2 + .2 * p.d + .45 * glow[i]).toFixed(3) + ')';
        mx.beginPath(); mx.arc(p.x, p.y, r * 2.2, 0, TAU); mx.fill();
        mx.fillStyle = 'rgba(' + tcol + ',' + (.6 + .4 * Math.max(p.d, glow[i])).toFixed(3) + ')';
        mx.beginPath(); mx.arc(p.x, p.y, r, 0, TAU); mx.fill();
      });
    };
  }

  /* ---------- Main loop ---------- */
  function loop(t) {
    if (pageVisible) { arcTick(t); miniTick(t); drawMini(t); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  openFromHash();
})();
