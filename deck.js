/* =========================================================
   Navegación del deck
   - scroll-snap nativo + teclado + puntos clicables
   - reveal al entrar (IntersectionObserver)
   - barra de progreso y contador
   ========================================================= */
(function () {
  var deck    = document.querySelector('.deck');
  var slides  = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dotsNav = document.querySelector('.dots');
  var bar     = document.querySelector('.progress__bar');
  var counter = document.querySelector('.counter');
  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!deck || !slides.length) return;

  var total  = slides.length;
  var active = 0;
  var pad = function (n) { return String(n).padStart(2, '0'); };

  /* ---- Construir los puntos ---- */
  var dots = slides.map(function (slide, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('aria-label', 'Ir a: ' + (slide.dataset.label || 'Sección ' + (i + 1)));

    var label = document.createElement('span');
    label.className = 'dot__label';
    label.textContent = slide.dataset.label || pad(i + 1);
    b.appendChild(label);

    b.addEventListener('click', function () { go(i); });
    dotsNav.appendChild(b);
    return b;
  });

  /* ---- Estado activo ---- */
  function setActive(i) {
    active = i;
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('is-active', d === i);
    }
    if (counter) counter.textContent = pad(i + 1) + ' / ' + pad(total);
    document.body.classList.toggle('at-start', i === 0);
  }

  /* ---- Ir a una sección ---- */
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    slides[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    document.body.classList.add('moved');
  }

  /* ---- Reveal (aparece al entrar) ---- */
  var ioReveal = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { root: deck, threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(function (el) { ioReveal.observe(el); });

  /* ---- Sección activa ---- */
  var ioActive = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var idx = slides.indexOf(e.target);
        if (idx > -1) setActive(idx);
      }
    });
  }, { root: deck, threshold: 0.6 });
  slides.forEach(function (s) { ioActive.observe(s); });

  /* ---- Barra de progreso ---- */
  function onScroll() {
    var max = deck.scrollHeight - deck.clientHeight;
    var p = max > 0 ? deck.scrollTop / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
  }
  deck.addEventListener('scroll', onScroll, { passive: true });
  deck.addEventListener('scroll', function () { document.body.classList.add('moved'); }, { passive: true, once: true });

  /* ---- Teclado ---- */
  window.addEventListener('keydown', function (e) {
    // No secuestrar el teclado si el foco está en un enlace/campo
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'input' || tag === 'textarea') return;

    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ') {
      e.preventDefault(); go(active + 1);
    } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') {
      e.preventDefault(); go(active - 1);
    } else if (k === 'Home') {
      e.preventDefault(); go(0);
    } else if (k === 'End') {
      e.preventDefault(); go(total - 1);
    }
  });

  /* ---- Inicial ---- */
  setActive(0);
  onScroll();
})();


/* =========================================================
   Interactive exhibit · "Inside the system"
   Five interaction patterns for one component (abstracted).
   Generic, invented content — no client UI or data.
   ========================================================= */
(function () {
  var root = document.querySelector('[data-explorer]');
  if (!root) return;

  var opts = Array.prototype.slice.call(root.querySelectorAll('[data-opt]'));
  var mock = root.querySelector('[data-mock]');
  var note = root.querySelector('[data-note]');
  var KEY = '••••••••';

  function field(label, val) {
    return '<label class="mk-field"><span>' + label + '</span><i class="mk-input">' + val + '</i></label>';
  }
  function block(title, fields) {
    return '<div class="mk-block"><p class="mk-blabel">' + title + '</p>' + fields + '</div>';
  }
  function chooser(kind) {
    return '<div class="mk-' + kind + '"><span class="mk-' + kind + '__item is-on">Shared secret</span>' +
           '<span class="mk-' + kind + '__item">OAuth 2.0</span></div>';
  }

  var shared = field('Authentication key', KEY);
  var oauth  = field('Client ID', 'id_' + KEY) + field('Client secret', KEY) + field('Token URL', 'https://…');
  var cta    = '<button class="mk-cta" type="button" tabindex="-1">Generate &amp; connect</button>';

  var MODES = {
    'both':       { body: block('Shared secret', shared) + block('OAuth 2.0', oauth),
                    note: 'Everything visible at once. Fastest to scan — but heavier, and it invites errors when only one path is valid.' },
    'one':        { body: chooser('seg') + block('Shared secret', shared),
                    note: 'Choose a method, see only its fields. Cleaner — though it hides that a choice is even being made.' },
    'button':     { body: cta + block('Shared secret', shared) + block('OAuth 2.0', oauth),
                    note: 'A commit action starts setup. Prevents half‑configured states — at the cost of an extra step.' },
    'button-one': { body: cta + chooser('seg') + block('Shared secret', shared),
                    note: 'Focused and safe: pick one path, then commit. Best when the two methods differ a lot.' },
    'toggle':     { body: chooser('toggle') + block('Shared secret', shared),
                    note: 'A segmented switch makes the choice obvious and reversible. Compact, familiar, low‑risk — my pick here.' }
  };

  var HEAD = '<div class="mk-head"><p class="mk-title">Security &amp; Authentication</p>' +
             '<p class="mk-sub">Choose your authentication method</p></div>';

  function select(opt) {
    var m = MODES[opt] || MODES.toggle;
    opts.forEach(function (b) {
      var on = b.dataset.opt === opt;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    mock.innerHTML = HEAD + m.body;
    note.textContent = m.note;
  }

  opts.forEach(function (b) {
    b.addEventListener('click', function () { select(b.dataset.opt); });
  });

  select('toggle'); // default to the recommended pattern
})();
