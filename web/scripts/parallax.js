/* ===========================================================================
   ARTWORK WINDOW PARALLAX
   .pj-window is a fixed-size box (NutraKey's right-hand collage, 1192x1080
   in the PSD); the image inside it is taller than that box. As the panel
   scrolls up through the viewport, the image translates upward inside its
   window — image top visible when the panel is just entering, image bottom
   visible once the panel has fully reached the top of the viewport — so the
   whole picture reveals itself before the next panel arrives.

   Desktop only: below 1024px the artwork rejoins normal flow at full width
   (see project.css), so there's nothing to drive.
   =========================================================================== */
(function () {
  'use strict';

  var windows = Array.prototype.slice.call(document.querySelectorAll('.pj-window'));
  if (!windows.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 1024px)');

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function update() {
    if (reduce || !desktop.matches) {
      windows.forEach(function (win) {
        var img = win.querySelector('.pj-parallax');
        if (img) img.style.transform = '';
      });
      return;
    }

    var vh = window.innerHeight;

    windows.forEach(function (win) {
      var img = win.querySelector('.pj-parallax');
      var panel = win.closest('.panel');
      if (!img || !panel) return;

      var panelTop = panel.getBoundingClientRect().top;
      /* 0 when the panel's top is at the viewport's bottom edge (just
         entering), 1 once the panel's top reaches the viewport's top edge
         (fully landed) — matches how a nav click or natural scroll lands
         a panel, so the reveal completes exactly as the panel settles
         into view rather than continuing to drift during the scroll-past. */
      var progress = clamp((vh - panelTop) / vh, 0, 1);

      var overshoot = Math.max(0, img.offsetHeight - win.getBoundingClientRect().height);
      img.style.transform = 'translateY(' + (-progress * overshoot) + 'px)';
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('load', update);
  update();
})();
