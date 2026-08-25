/* ===========================================================================
   TRIANGLE NAV
   Clicking the triangle retracts the links into it; clicking again brings
   them back. Default is open, matching artboard 1.
   =========================================================================== */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  if (!nav || !toggle) return;

  function setOpen(open) {
    nav.dataset.open = open ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setOpen(nav.dataset.open !== 'true');
  });

  /* Escape closes it, matching normal disclosure behaviour. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  /* A disabled link must not navigate. */
  nav.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[aria-disabled="true"]');
    if (link) e.preventDefault();
  });

  /* Collapsing on leaving home is one-way on purpose. Auto-opening on the way
     back fought the user's own toggle: open the nav, click "home", and the
     panel change re-opened something that was already animating — two slides
     at once. Leaving is the only automatic transition; opening is always the
     visitor's choice, and whatever they choose stays. */
  document.addEventListener('panelchange', function (e) {
    if (e.detail.panel.id !== 'home' && nav.dataset.open === 'true') {
      setOpen(false);
    }
  });
})();
