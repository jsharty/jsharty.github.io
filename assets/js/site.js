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
      setTimeout(function () { c.textContent = 'Copy BibTeX'; }, 1800);
    }
  });

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
      results.innerHTML = out.map(function (d) {
        return '<li class="item"><div class="item-date">' + d.y + '</div><div class="item-body"><p class="where"><a href="' + d.u + '">' + d.p + ' · ' + d.s + '</a></p><p class="cite">' + d.t + '</p></div></li>';
      }).join('');
      count.textContent = out.length + ' result' + (out.length === 1 ? '' : 's');
      syncUrl();
    };
    q.addEventListener('input', function () { render(); });
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
    document.querySelectorAll('h2.group, h3.group').forEach(function (g) { g.hidden = !!(t.length || pillar); });
    count.textContent = (t.length || pillar) ? shown + ' of ' + items.length + ' shown' : items.length + ' items';
    syncUrl();
  }
  q.addEventListener('input', apply);
  chips.forEach(function (c) { c.addEventListener('click', function () { setChip(c.getAttribute('data-pillar')); apply(); }); });
  document.querySelectorAll('.tag').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); setChip(a.getAttribute('href').split('=')[1]); apply(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });
  setChip(pillar);
  apply();
})();
