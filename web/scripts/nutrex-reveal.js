/* ===========================================================================
   NUTREX TWO-LAYER REVEAL
   The gradient and jar shot both start invisible; the moment the panel
   scrolls into view, a single [data-revealed] attribute triggers both —
   the CSS transition delays on .nx-reveal__jars (see project.css) are what
   actually stagger the background fading in first and the jars zooming
   out + fading in after it, not separate JS timers. Runs once; the
   observer disconnects after the first reveal.
   =========================================================================== */
(function () {
  'use strict';

  var panel = document.getElementById('nutrex');
  if (!panel) return;

  var box = panel.querySelector('.nx-reveal');
  if (!box) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function reveal() {
    box.setAttribute('data-revealed', '');
  }

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        reveal();
        io.disconnect();
      }
    });
  }, { threshold: 0.15 });

  io.observe(panel);
})();
