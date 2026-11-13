(function () {
  'use strict';
  var params = new URLSearchParams(location.search);

  // Mobile menu
  var tog = document.querySelector('.nav-toggle');
  if (tog) tog.addEventListener('click', function () {
    var open = tog.getAttribute('aria-expanded') === 'true';
    tog.setAttribute('aria-expanded', String(!open));
    document.getElementById('navlist').classList.toggle('open', !open);
  });

  // Abstract / Cite toggles and BibTeX copy
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-toggle]');
    if (b) {
      var p = document.getElementById(b.getAttribute('data-toggle'));
      var show = p.hidden;
      p.hidden = !show; b.setAttribute('aria-expanded', String(show));
      return;
    }
    var c = e.target.closest('[data-copy]');
    if (c) {
      var pre = document.querySelector('#' + c.getAttribute('data-copy') + ' pre');
      try { navigator.clipboard.writeText(pre.textContent); c.textContent = 'Copied'; } catch (err) { c.textContent = 'Select and copy'; }
      setTimeout(function () { c.textContent = 'Copy citation (BibTeX)'; }, 1800);
    }
  });

  // Sorting (author, journal/venue, year, title, role)
  function cmp(mode, A, B) {
    function s(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
    var byNew = s(B.d, A.d);
    switch (mode) {
      case 'old': return s(A.d, B.d) || s(A.ti, B.ti);
      case 'author': return s(A.a, B.a) || byNew;
      case 'venue': return s(A.v || '~', B.v || '~') || byNew;
      case 'title': return s(A.ti, B.ti);
      case 'role': return (A.r || 99) - (B.r || 99) || byNew;
      default: return byNew;
    }
  }
  var sortSel = document.getElementById('sort');

  // Search + pillar filter
  var q = document.getElementById('q');
  if (!q) return;
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var count = document.querySelector('.count');
  var pillar = params.get('pillar') || '';
  q.value = params.get('q') || '';

  function setChip(v) {
    pillar = v;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-pillar') === v)); });
  }
  function terms() { return q.value.toLowerCase().split(/\s+/).filter(Boolean); }
  function syncUrl() {
    var u = new URL(location.href);
    q.value ? u.searchParams.set('q', q.value) : u.searchParams.delete('q');
    pillar ? u.searchParams.set('pillar', pillar) : u.searchParams.delete('pillar');
    if (sortSel) { sortSel.value !== 'cv' ? u.searchParams.set('sort', sortSel.value) : u.searchParams.delete('sort'); }
    history.replaceState(null, '', u);
  }

  var results = document.getElementById('results');
  if (results) {
    // Site-wide search page
    var data = [];
    fetch(results.getAttribute('data-index'))
      .then(function (r) { return r.json(); })
      .then(function (d) { data = d.filter(Boolean); render(); });
    var render = function () {
      var t = terms(), out = [];
      if (!t.length && !pillar) { results.innerHTML = ''; count.textContent = data.length + ' items. Type to search or choose a pillar.'; syncUrl(); return; }
      data.forEach(function (d) {
        var hay = (d.t.replace(/<[^>]+>/g, '') + ' ' + d.y + ' ' + d.s + ' ' + d.p).toLowerCase();
        if (pillar && (d.g || []).indexOf(pillar) < 0) return;
        if (t.every(function (w) { return hay.indexOf(w) > -1; })) out.push(d);
      });
      var mode = sortSel ? sortSel.value : 'cv';
      if (mode !== 'cv') out.sort(function (x, y) { return cmp(mode, x, y); });
      results.innerHTML = out.map(function (d) {
        return '<li class="item"><div class="item-date">' + d.y + '</div><div class="item-body"><p class="where"><a href="' + d.u + '">' + d.p + ' · ' + d.s + '</a></p><p class="cite">' + d.t + '</p></div></li>';
      }).join('');
      count.textContent = out.length + ' result' + (out.length === 1 ? '' : 's');
      syncUrl();
    };
    q.addEventListener('input', function () { render(); });
    if (sortSel) { sortSel.value = params.get('sort') || 'cv'; sortSel.addEventListener('change', render); }
    chips.forEach(function (c) { c.addEventListener('click', function () { setChip(c.getAttribute('data-pillar')); render(); }); });
    setChip(pillar);
    return;
  }

  // List pages: filter items in place
  var items = Array.prototype.slice.call(document.querySelectorAll('.content .item'));
  if (!items.some(function (li) { return (li.getAttribute('data-pillars') || '').trim(); })) {
    var cg = document.querySelector('.chips'); if (cg) cg.hidden = true; pillar = '';
  }
  function apply() {
    var t = terms(), shown = 0;
    items.forEach(function (li) {
      var okP = !pillar || (' ' + li.getAttribute('data-pillars') + ' ').indexOf(' ' + pillar + ' ') > -1;
      var hay = li.getAttribute('data-search') || '';
      var okQ = t.every(function (w) { return hay.indexOf(w) > -1; });
      li.hidden = !(okP && okQ); if (!li.hidden) shown++;
    });
    document.querySelectorAll('.cv-section').forEach(function (s) {
      s.hidden = !s.querySelector('.item:not([hidden])');
    });
    document.querySelectorAll('h2.group, h3.group').forEach(function (g) { g.hidden = !!(t.length || pillar || flat); });
    count.textContent = (t.length || pillar) ? shown + ' of ' + items.length + ' shown' : items.length + ' items';
    syncUrl();
  }
  // Remember where each item lives so "CV order" can put everything back.
  var home = items.map(function (li) { return { li: li, parent: li.parentNode, next: null }; });
  var flat = null;
  function key(li) {
    return { d: li.getAttribute('data-date') || '', a: li.getAttribute('data-author') || '', v: li.getAttribute('data-venue') || '',
             ti: li.getAttribute('data-title') || '', r: +li.getAttribute('data-role') || 0 };
  }
  function resort() {
    var mode = sortSel.value;
    var sections = document.querySelectorAll('.content .cv-section, .content h2.group');
    if (mode === 'cv') {
      if (flat) {
        home.forEach(function (h) { h.parent.appendChild(h.li); });
        flat.remove(); flat = null;
        document.body.classList.remove('flat');
      }
    } else {
      if (!flat) {
        flat = document.createElement('ol'); flat.className = 'items flatlist';
        var anchor = document.querySelector('.filters'); anchor.parentNode.insertBefore(flat, anchor.nextSibling);
        document.body.classList.add('flat');
      }
      items.slice().sort(function (x, y) { return cmp(mode, key(x), key(y)); }).forEach(function (li) { flat.appendChild(li); });
    }
    apply();
  }
  if (sortSel) {
    // keep each section's original order for restoring
    home.forEach(function (h) { h.order = Array.prototype.indexOf.call(h.parent.children, h.li); });
    home.sort(function (a, b) { return a.order - b.order; });
    sortSel.value = params.get('sort') || 'cv';
    sortSel.addEventListener('change', resort);
  }
  q.addEventListener('input', apply);
  chips.forEach(function (c) { c.addEventListener('click', function () { setChip(c.getAttribute('data-pillar')); apply(); }); });
  document.querySelectorAll('.tag').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); setChip(a.getAttribute('href').split('=')[1]); apply(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });
  setChip(pillar);
  if (sortSel && sortSel.value !== 'cv') resort(); else apply();
})();

// ---- Color theme: Light, Dark, or System (follows the device). Choice is remembered in this browser.
(function () {
  var root = document.documentElement, btns = document.querySelectorAll('[data-theme-choice]');
  function current() { try { return localStorage.getItem('theme') || 'system'; } catch (e) { return 'system'; } }
  function set(choice) {
    if (choice === 'light' || choice === 'dark') root.setAttribute('data-theme', choice);
    else root.removeAttribute('data-theme');
    try { if (choice === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', choice); } catch (e) {}
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-choice') === choice)); });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-theme-choice')); }); });
  set(current());
})();

// ---- Home page carousels (featured, recent publications, recent talks): arrows, dots, swipe/scroll,
// keyboard; each rotates every 8 s (staggered) unless paused, hovered, focused, or the visitor prefers
// reduced motion (WCAG 2.2.2).
document.querySelectorAll('.carousel').forEach(function (c, idx) {
  var track = c.querySelector('.carousel-track'), slides = track.children, dots = c.querySelectorAll('.carousel-dot');
  var pauseBtn = c.querySelector('.carousel-pause'), i = 0, timer = null, hold = false;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, paused = reduced;
  function go(n) { i = (n + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); mark(); }
  function mark() { dots.forEach(function (d, k) { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); }); }
  function start() { stop(); if (paused || hold || slides.length < 2) return; timer = setTimeout(function tick() { go(i + 1); timer = setTimeout(tick, 8000); }, 8000 + idx * 2600); }
  function stop() { if (timer) clearTimeout(timer); timer = null; }
  function setPaused(v) { paused = v; pauseBtn.setAttribute('aria-pressed', String(v)); pauseBtn.setAttribute('aria-label', v ? 'Start automatic rotation' : 'Pause automatic rotation'); pauseBtn.innerHTML = '<i class="fa-solid fa-' + (v ? 'play' : 'pause') + '" aria-hidden="true"></i>'; start(); }
  c.querySelectorAll('[data-dir]').forEach(function (b) { b.addEventListener('click', function () { go(i + Number(b.getAttribute('data-dir'))); start(); }); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); start(); }); });
  pauseBtn.addEventListener('click', function () { setPaused(!paused); });
  track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); } });
  var t; track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(function () { var n = Math.round(track.scrollLeft / track.clientWidth); if (n !== i) { i = n; mark(); } }, 80); });
  c.addEventListener('mouseenter', function () { hold = true; stop(); }); c.addEventListener('mouseleave', function () { hold = false; start(); });
  c.addEventListener('focusin', function () { hold = true; stop(); }); c.addEventListener('focusout', function (e) { if (!c.contains(e.relatedTarget)) { hold = false; start(); } });
  setPaused(paused);
});
