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
    var link = e.target.closest('[aria-disabled="true"]');
    if (link) e.preventDefault();
  });
})();
