/* ===========================================================================
   PANEL STACK SUPPORT
   Two small jobs. Neither touches scrolling — the browser owns that
   completely, panels are normal document flow now (no sticky, no pinning).

     1. active   — marks the nav link for whichever panel is on screen. This
                   is aria-current only; nothing paints, by design.
                   Also keeps the URL hash in step with the panel, so #works
                   is a real, shareable address.
     2. anchors  — smooth-scrolls to a panel on nav click or a landing hash.
   =========================================================================== */
(function () {
  'use strict';

  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  if (!panels.length) return;

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link[data-panel]'));

  /* Which nav link owns which panel. Every project panel belongs to "works". */
  function ownerOf(id) {
    if (id === 'home' || id === 'about' || id === 'works') return id;
    return 'works';
  }

  /* --- 1. active panel and hash -------------------------------------------- */
  var current = null;
  var lastRun = 0;

  function currentPanel() {
    /* The active one is the last panel (in DOM order) whose top has already
       crossed the vertical middle of the viewport. */
    var mid = window.innerHeight * 0.5;
    var found = panels[0];
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getBoundingClientRect().top < mid) found = panels[i];
    }
    return found;
  }

  function update() {
    var panel = currentPanel();
    if (!panel || panel === current) return;
    current = panel;

    var owner = ownerOf(panel.id);
    links.forEach(function (link) {
      if (link.dataset.panel === owner) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    /* replaceState, not a hash assignment — assigning would scroll-jump and
       would also stuff a dozen entries into the back button. */
    if (window.history && history.replaceState) {
      history.replaceState(null, '', '#' + panel.id);
    }
  }

  /* Throttled by timestamp rather than requestAnimationFrame. rAF is the
     natural choice, but it is suspended whenever the page is not being
     painted — a background tab, a hidden pane — and the active link would
     then silently stop tracking. A 16ms clock behaves the same on screen
     and keeps working off it. */
  var trailing = null;
  function onScroll() {
    var now = Date.now();
    if (now - lastRun < 16) {
      /* Trailing edge: without this the final position of a fast scroll can
         land inside the throttle window and never be processed, leaving the
         active link one panel behind. */
      clearTimeout(trailing);
      trailing = setTimeout(onScroll, 24);
      return;
    }
    lastRun = now;
    update();
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(onScroll, {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]
    });
    panels.forEach(function (p) { io.observe(p); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  /* --- 2. anchor jumps ------------------------------------------------------
     Panels are normal flow now, so the browser's own geometry is trustworthy
     — no cumulative-height workaround needed here anymore. */
  function goTo(panel, smooth) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.scrollIntoView({ behavior: (smooth && !reduce) ? 'smooth' : 'instant', block: 'start' });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('aria-disabled') === 'true') return;
    var id = link.getAttribute('href').slice(1);
    var panel = id && document.getElementById(id);
    if (!panel || !panel.classList.contains('panel')) return;

    e.preventDefault();
    goTo(panel, true);
    if (window.history && history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
    onScroll();
  });

  /* Landing on a hash directly. */
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains('panel')) {
      setTimeout(function () { goTo(target, false); update(); }, 0);
    }
  }
})();
