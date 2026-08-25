/* ===========================================================================
   PANEL STACK SUPPORT
   Three small jobs. None of them touch scrolling — the browser still owns
   that completely. No wheel or touch listeners exist anywhere in this build.

     1. measure  — writes each panel's real height into --panel-measured so a
                   taller-than-viewport panel can pin its bottom edge instead
                   of hiding it. Only mobile needs this; desktop derives the
                   height from --ar in CSS.
     2. active   — marks the nav link for whichever panel is on screen.
     3. deeplink — keeps the URL hash in step with the panel, so #works is a
                   real, shareable address.
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

  /* --- 1. measure --------------------------------------------------------
     Measures the CONTENT's natural height plus the inner's vertical padding —
     not the inner itself, which is stretched by flex to fill the panel and
     would feed its own height straight back in as a growing loop.
     The 1px guard stops the ResizeObserver retriggering on itself. */
  function measure() {
    panels.forEach(function (panel) {
      var inner = panel.firstElementChild;
      var content = inner && inner.firstElementChild;
      if (!inner || !content) return;

      var cs = getComputedStyle(inner);
      var pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      var h = Math.ceil(content.getBoundingClientRect().height + pad);

      var prev = parseFloat(panel.style.getPropertyValue('--panel-measured')) || 0;
      if (Math.abs(h - prev) > 1) {
        panel.style.setProperty('--panel-measured', h + 'px');
      }
    });
  }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(measure);
    panels.forEach(function (p) {
      var content = p.firstElementChild && p.firstElementChild.firstElementChild;
      if (content) ro.observe(content);
    });
  } else {
    window.addEventListener('resize', measure);
  }
  measure();

  /* --- 2 + 3. active panel and hash -------------------------------------- */
  var current = null;
  var lastRun = 0;

  function currentPanel() {
    /* Panels stack, so the active one is the last that covers the upper half
       of the viewport. Reading in DOM order means the topmost wins. */
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
       would also stuff nine entries into the back button. */
    if (window.history && history.replaceState) {
      history.replaceState(null, '', '#' + panel.id);
    }

    document.dispatchEvent(new CustomEvent('panelchange', { detail: { panel: panel } }));
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

  /* IntersectionObserver is the primary trigger, not the scroll event.
     Panels overlap once stacked, so IO is only used to know that *something*
     moved — which panel is active is still decided geometrically above. */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(onScroll, {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]
    });
    panels.forEach(function (p) { io.observe(p); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  /* --- 4. anchor jumps ----------------------------------------------------
     A sticky panel reports its PINNED position, not its position in flow, so
     once you have scrolled past it both scrollIntoView() and a plain #hash
     jump decide it is already at the top and do nothing — clicking "about"
     from panel 6 would just sit there.
     offsetTop is no help either — on a sticky element it reports the
     sticky-adjusted position too, so `about` reads 6000 when you are at 6000
     and 900 when you are at the top. The one scroll-independent measure is
     the panels' own heights, which layout fixes regardless of pinning, so
     flow position is their running sum from the top of the stack. */
  function flowTop(panel) {
    var stack = panel.parentNode;
    var y = stack.getBoundingClientRect().top + window.scrollY;
    for (var i = 0; i < panels.length; i++) {
      if (panels[i] === panel) return Math.round(y);
      y += panels[i].getBoundingClientRect().height;
    }
    return Math.round(y);
  }

  function goTo(panel, smooth) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* 'instant', not 'auto' — 'auto' defers to the CSS scroll-behavior, which
       is smooth, so the reduced-motion path would animate anyway. */
    window.scrollTo({
      top: flowTop(panel),
      behavior: (smooth && !reduce) ? 'smooth' : 'instant'
    });
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
