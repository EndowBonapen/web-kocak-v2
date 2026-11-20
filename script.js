/* =========================================================
   Ngupi Yuk, Sayya Diva June! — logika interaksi
   Bagian: konfigurasi · util · dekorasi · navigasi halaman ·
           tombol NO yang kabur · kalender · WhatsApp · confetti
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Konfigurasi ---------- */
  const CONFIG = {
    year: 2026,
    waNumber: '6285716405001', // format internasional Indonesia
    hints: [
      'Yakin mau pilih NO? Coba lagi deh 😝',
      'Eits, meleset! Coba lagi 😜',
      'Dikit lagi... eh, kabur lagi 🤭',
      'Jarinya kurang gesit nih ✨',
      'Tombol NO-nya alergi disentuh 🤧',
      'Udah, nyerah aja. YES-nya nganggur tuh 😆',
      'Kopinya keburu dingin lho, Za ☕',
      'Gigih banget sih, sayang tenaganya 💪',
      'Tombol NO-nya lebih lincah dari kamu 😎',
      'Capek kan? YES aja yuk 🧋'
    ]
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const pad = (n) => String(n).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Elemen ---------- */
  const pages = { ask: $('#page-ask'), date: $('#page-date'), done: $('#page-done') };
  let currentPage = 'ask';

  /* =========================================================
     Dekorasi latar: sparkle, bintang, bubble, doodle
     ========================================================= */
  const SHAPES = {
    sparkle: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C13 7 17 11 24 12 17 13 13 17 12 24 11 17 7 13 0 12 7 11 11 7 12 0Z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><polygon fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" points="12,2 14.8,8.6 22,9.2 16.5,13.9 18.2,21 12,17.2 5.8,21 7.5,13.9 2,9.2 9.2,8.6"/></svg>',
    bubble: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="rgba(255, 255, 255,.55)" stroke="currentColor" stroke-width="2"/><path d="M7 10a5.5 5.5 0 0 1 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    dot: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/></svg>',
    squiggle: '<svg viewBox="0 0 34 24"><path d="M2 12q4-8 8 0t8 0 8 0" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" fill="none"/></svg>'
  };
  const PALETTE = ['#b5d8ff', '#8cc2ff', '#d3e8ff', '#a8cef9', '#c2deff', '#58a0f2'];

  function buildDecorations() {
    const deco = $('#deco');
    const kinds = ['sparkle', 'sparkle', 'star', 'bubble', 'bubble', 'dot', 'plus', 'squiggle'];
    const count = window.innerWidth < 600 ? 16 : 26;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const kind = kinds[i % kinds.length];
      const el = document.createElement('span');
      const size = kind === 'dot' ? 8 + Math.random() * 8 : 16 + Math.random() * 30;
      el.className = 'd' + (kind === 'sparkle' || kind === 'star' ? ' twinkle' : '');
      el.innerHTML = SHAPES[kind];
      el.style.cssText = [
        `left:${(Math.random() * 96).toFixed(1)}%`,
        `top:${(Math.random() * 94).toFixed(1)}%`,
        `width:${size.toFixed(0)}px`,
        `height:${(kind === 'squiggle' ? size * 0.7 : size).toFixed(0)}px`,
        `--c:${PALETTE[Math.floor(Math.random() * PALETTE.length)]}`,
        `--dur:${(6 + Math.random() * 6).toFixed(1)}s`,
        `--tw:${(2 + Math.random() * 2).toFixed(1)}s`,
        `--delay:${(-Math.random() * 8).toFixed(1)}s`,
        `--dx:${(-14 + Math.random() * 28).toFixed(0)}px`,
        `--dy:${(-26 + Math.random() * 20).toFixed(0)}px`,
        `--rot:${(-25 + Math.random() * 50).toFixed(0)}deg`
      ].join(';');
      frag.appendChild(el);
    }
    deco.appendChild(frag);
  }

  /* =========================================================
     Navigasi antar halaman (dengan transisi halus)
     ========================================================= */
  function goTo(name) {
    if (name === currentPage) return;
    const from = pages[currentPage];
    const to = pages[name];
    // NO hidup di <body> saat kabur, jadi harus disembunyikan manual saat pindah halaman
    if (from === pages.ask) noBtn.style.display = 'none';
    currentPage = name;

    const swap = () => {
      from.classList.remove('is-active', 'is-leaving');
      to.classList.add('is-active');
      window.scrollTo(0, 0);
      const heading = $('[tabindex="-1"]', to);
      if (heading) heading.focus({ preventScroll: true });
    };

    from.classList.add('is-leaving');
    if (reduceMotion) swap(); else setTimeout(swap, 280);
  }

  /* =========================================================
     Tombol NO — selalu kabur, tidak pernah bisa diklik
     ---------------------------------------------------------
     • Saat pertama kabur, tombol dipindah ke <body> (position:fixed)
       supaya posisinya relatif ke viewport & tidak terpengaruh transform
       milik kartu. Sebuah "slot" menjaga ruang kosong di tempat asalnya.
     • Posisi baru dipilih acak, dengan skor: hindari menutup elemen
       penting, jauhi kursor, dan jangan pindah terlalu dekat.
     • Pemicu: kursor mendekat, pointerdown, touchstart, mousedown,
       click, fokus keyboard (Tab), Enter/Space.
     • Handler click tidak pernah melakukan apa pun selain kabur.
     ========================================================= */
  const noBtn = $('#btn-no');
  const noSlot = $('#no-slot');
  const yesBtn = $('#btn-yes');
  const hintEl = $('#hint');

  const MARGIN = 14;       // jarak minimal dari tepi viewport
  const TRIGGER = 95;      // jarak kursor (px) yang membuat NO kabur
  const COOLDOWN = 110;    // ms, mencegah kabur berkali-kali dalam 1 aksi

  const dodge = { active: false, x: 0, y: 0, w: 0, h: 0, count: 0, px: null, py: null, last: 0 };

  const viewport = () => ({ w: document.documentElement.clientWidth, h: window.innerHeight });

  function placeNo(animate) {
    if (!animate) noBtn.style.transition = 'none';
    noBtn.style.transform = `translate3d(${dodge.x}px, ${dodge.y}px, 0)`;
    if (!animate) {
      void noBtn.offsetWidth; // paksa reflow agar posisi awal tidak beranimasi
      noBtn.style.transition = '';
    }
  }

  function liftNo() {
    if (dodge.active) return;
    const r = noBtn.getBoundingClientRect();
    dodge.w = r.width;
    dodge.h = r.height;
    dodge.x = r.left;
    dodge.y = r.top;
    noSlot.style.width = r.width + 'px';
    noSlot.style.height = r.height + 'px';
    document.body.appendChild(noBtn);
    noBtn.classList.add('is-fleeing');
    placeNo(false);
    dodge.active = true;
  }

  function overlapArea(a, b) {
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 0 && h > 0 ? w * h : 0;
  }

  function inflate(r, p) {
    return { left: r.left - p, top: r.top - p, right: r.right + p, bottom: r.bottom + p };
  }

  function pickSpot() {
    const vp = viewport();
    const minX = MARGIN, minY = MARGIN;
    const maxX = Math.max(minX, vp.w - dodge.w - MARGIN);
    const maxY = Math.max(minY, vp.h - dodge.h - MARGIN);

    // elemen yang tidak boleh tertutup tombol NO
    const avoid = [yesBtn, $('#ask-title'), hintEl, $('#mascot')]
      .map((el) => inflate(el.getBoundingClientRect(), 14));

    let best = null;
    for (let i = 0; i < 90; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      const rect = { left: x, top: y, right: x + dodge.w, bottom: y + dodge.h };

      let score = 0;
      for (const a of avoid) score += overlapArea(rect, a) * 100;

      if (dodge.px !== null) {
        const d = Math.hypot(x + dodge.w / 2 - dodge.px, y + dodge.h / 2 - dodge.py);
        if (d < 240) score += (240 - d) * 400;
      }
      const moved = Math.hypot(x - dodge.x, y - dodge.y);
      if (moved < 160) score += (160 - moved) * 200;

      score += Math.random();
      if (!best || score < best.score) best = { x, y, score };
    }
    return best;
  }

  function nextHint() {
    const list = CONFIG.hints;
    // pesan pertama ada di HTML awal, jadi putar mulai dari indeks 1
    hintEl.textContent = list[((dodge.count - 1) % (list.length - 1)) + 1];
    hintEl.classList.remove('pop');
    void hintEl.offsetWidth;
    hintEl.classList.add('pop');
  }

  function flee(e) {
    if (currentPage !== 'ask') return;
    const now = performance.now();
    if (now - dodge.last < COOLDOWN) return;
    dodge.last = now;

    if (e && typeof e.clientX === 'number') { dodge.px = e.clientX; dodge.py = e.clientY; }

    liftNo();
    const spot = pickSpot();
    dodge.x = spot.x;
    dodge.y = spot.y;
    placeNo(true);

    dodge.count += 1;
    nextHint();
    // YES pelan-pelan membesar (maks 1.25x) — makin menggoda dipencet
    yesBtn.style.setProperty('--s', Math.min(1.25, 1 + dodge.count * 0.025).toFixed(3));
  }

  function distanceToRect(px, py, r) {
    const dx = Math.max(r.left - px, 0, px - r.right);
    const dy = Math.max(r.top - py, 0, py - r.bottom);
    return Math.hypot(dx, dy);
  }

  function currentNoRect() {
    return dodge.active
      ? { left: dodge.x, top: dodge.y, right: dodge.x + dodge.w, bottom: dodge.y + dodge.h }
      : noBtn.getBoundingClientRect();
  }

  // Kursor mendekat → kabur sebelum sempat menyentuh
  document.addEventListener('pointermove', (e) => {
    if (currentPage !== 'ask' || e.pointerType === 'touch') return;
    dodge.px = e.clientX;
    dodge.py = e.clientY;
    if (distanceToRect(e.clientX, e.clientY, currentNoRect()) < TRIGGER) flee(e);
  }, { passive: true });

  // Semua cara "menekan" NO hanya membuatnya kabur
  const block = (e) => { e.preventDefault(); e.stopPropagation(); flee(e.touches ? e.touches[0] : e); };
  ['pointerdown', 'mousedown', 'pointerenter', 'click', 'dblclick', 'contextmenu'].forEach((t) =>
    noBtn.addEventListener(t, block));
  noBtn.addEventListener('touchstart', block, { passive: false });
  noBtn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
  noBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') block(e);
  });
  noBtn.addEventListener('focus', () => { flee(); noBtn.blur(); });

  // Jaga tombol tetap di dalam viewport saat ukuran layar berubah
  function clampNo() {
    if (!dodge.active) return;
    const vp = viewport();
    dodge.x = Math.min(Math.max(MARGIN, dodge.x), Math.max(MARGIN, vp.w - dodge.w - MARGIN));
    dodge.y = Math.min(Math.max(MARGIN, dodge.y), Math.max(MARGIN, vp.h - dodge.h - MARGIN));
    placeNo(false);
  }
  window.addEventListener('resize', clampNo);
  window.addEventListener('orientationchange', () => setTimeout(clampNo, 200));

  function resetNo() {
    noBtn.style.display = '';
    if (dodge.active) {
      noBtn.classList.remove('is-fleeing');
      noBtn.style.transform = '';
      noBtn.style.transition = '';
      noSlot.appendChild(noBtn);
      noSlot.style.width = '';
      noSlot.style.height = '';
    }
    Object.assign(dodge, { active: false, count: 0, last: 0 });
    yesBtn.style.removeProperty('--s');
    hintEl.textContent = CONFIG.hints[0];
    hintEl.classList.remove('pop');
  }

  /* =========================================================
     Kalender kustom (biru) — hanya 2026, tanpa tanggal lampau
     ========================================================= */
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
                  'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const dateKey = (y, m, d) => y * 10000 + (m + 1) * 100 + d;

  const now = new Date();
  const todayKey = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
  const minKey = now.getFullYear() < CONFIG.year ? dateKey(CONFIG.year, 0, 1)
               : now.getFullYear() === CONFIG.year ? todayKey
               : Infinity; // 2026 sudah lewat semua
  const maxKey = dateKey(CONFIG.year, 11, 31);
  const minMonth = now.getFullYear() < CONFIG.year ? 0 : now.getMonth();

  const calGrid = $('#cal-grid');
  const calTitle = $('#cal-title');
  const calPrev = $('#cal-prev');
  const calNext = $('#cal-next');
  const calendar = $('#calendar');
  const pickedValue = $('#picked-value');
  const dateMsg = $('#date-msg');

  let viewMonth = minMonth;
  let selected = null; // { y, m, d }

  const formatDate = (s) => `${pad(s.d)}/${pad(s.m + 1)}/${s.y}`;

  function renderCalendar() {
    calTitle.textContent = `${MONTHS[viewMonth]} ${CONFIG.year}`;
    calPrev.disabled = viewMonth <= minMonth || minKey === Infinity;
    calNext.disabled = viewMonth >= 11 || minKey === Infinity;
    calGrid.innerHTML = '';

    if (minKey === Infinity) {
      calGrid.innerHTML = '<p class="cal-empty">Tahun 2026 sudah lewat, jadi nggak ada tanggal yang bisa dipilih 😅</p>';
      $('#btn-pick').disabled = true;
      return;
    }

    const lead = (new Date(CONFIG.year, viewMonth, 1).getDay() + 6) % 7; // minggu mulai Senin
    const days = new Date(CONFIG.year, viewMonth + 1, 0).getDate();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < lead; i++) {
      const s = document.createElement('span');
      s.className = 'cal-spacer';
      frag.appendChild(s);
    }
    for (let d = 1; d <= days; d++) {
      const key = dateKey(CONFIG.year, viewMonth, d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.textContent = d;
      btn.dataset.day = d;
      btn.disabled = key < minKey || key > maxKey;
      btn.setAttribute('aria-label', `${pad(d)}/${pad(viewMonth + 1)}/${CONFIG.year}`);
      if (key === todayKey) { btn.classList.add('is-today'); btn.title = 'Hari ini'; }
      if (selected && selected.m === viewMonth && selected.d === d) {
        btn.classList.add('is-selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      frag.appendChild(btn);
    }
    calGrid.appendChild(frag);
  }

  function updatePicked() {
    if (selected) {
      pickedValue.textContent = formatDate(selected);
      pickedValue.classList.remove('is-empty');
    } else {
      pickedValue.textContent = 'DD/MM/YYYY';
      pickedValue.classList.add('is-empty');
    }
    pickedValue.classList.remove('bump');
    void pickedValue.offsetWidth;
    if (selected) pickedValue.classList.add('bump');
  }

  calGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.day');
    if (!btn || btn.disabled) return;
    selected = { y: CONFIG.year, m: viewMonth, d: Number(btn.dataset.day) };
    dateMsg.textContent = '';
    renderCalendar();
    updatePicked();
  });
  calPrev.addEventListener('click', () => { if (viewMonth > minMonth) { viewMonth--; renderCalendar(); } });
  calNext.addEventListener('click', () => { if (viewMonth < 11) { viewMonth++; renderCalendar(); } });

  /* =========================================================
     Konfirmasi + WhatsApp (Click to Chat)
     ========================================================= */
  const waBtn = $('#btn-wa');

  function buildWaUrl(dateStr) {
    const text =
      'Halo Pemuda Babelan! 👋\n\n' +
      'Sayya Diva June, mau konfirmasi ajakan ngupi di Bekasi.\n\n' +
      `Tanggal pilihan: ${dateStr}\n\n` +
      'Gas ngupi! ☕';
    return `https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent(text)}`;
  }

  $('#btn-pick').addEventListener('click', () => {
    // 1. validasi tanggal
    if (!selected) {
      dateMsg.textContent = 'Eits, pilih tanggalnya dulu yaa 😝';
      calendar.classList.remove('shake');
      void calendar.offsetWidth;
      calendar.classList.add('shake');
      return;
    }
    // 2-3. tampilkan halaman konfirmasi
    const dateStr = formatDate(selected);
    $('#done-date').textContent = dateStr;
    waBtn.href = buildWaUrl(dateStr);
    goTo('done');
    setTimeout(confetti, reduceMotion ? 0 : 320);
  });

  // Pastikan link selalu terbaru; target=_blank membuka app WhatsApp / WhatsApp Web
  waBtn.addEventListener('click', () => {
    if (selected) waBtn.href = buildWaUrl(formatDate(selected));
  });

  /* ---------- Tombol YES & kembali ke beranda ---------- */
  yesBtn.addEventListener('click', () => goTo('date'));

  $('#btn-home').addEventListener('click', () => {
    selected = null;
    viewMonth = minMonth;
    dateMsg.textContent = '';
    renderCalendar();
    updatePicked();
    resetNo();
    goTo('ask');
  });

  /* =========================================================
     Confetti: sparkle, bintang, bubble (tanpa simbol romantis)
     ========================================================= */
  function confetti() {
    if (reduceMotion) return;
    const layer = document.createElement('div');
    layer.className = 'confetti';
    layer.setAttribute('aria-hidden', 'true');
    const kinds = ['sparkle', 'star', 'bubble', 'dot', 'sparkle'];

    for (let i = 0; i < 38; i++) {
      const el = document.createElement('i');
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * Math.min(window.innerWidth, 700) * 0.42;
      el.innerHTML = SHAPES[kinds[i % kinds.length]];
      el.style.cssText = [
        `--x:${Math.cos(angle) * dist}px`,
        `--y:${Math.sin(angle) * dist * 0.8 - 40}px`,
        `--r:${(Math.random() * 540 - 270).toFixed(0)}deg`,
        `--sz:${(12 + Math.random() * 20).toFixed(0)}px`,
        `--c:${PALETTE[Math.floor(Math.random() * PALETTE.length)]}`,
        `--d:${(Math.random() * 0.25).toFixed(2)}s`
      ].join(';');
      layer.appendChild(el);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 2300);
  }

  /* ---------- Mulai ---------- */
  buildDecorations();
  renderCalendar();
  updatePicked();
})();
