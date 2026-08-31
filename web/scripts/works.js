/* ===========================================================================
   WORKS LOGO SHUFFLE
   The 14 grid slots (position) are fixed — they carry the PSD's own layout.
   Which logo sits in which slot is randomized once per page load, so the
   wall looks different every time without touching the grid itself.

   Each logo's own size (--w/--h, matching its width/height attributes)
   travels WITH it rather than staying behind with the slot — otherwise a
   small logo dropped into a slot sized for a big one renders stretched
   oversize, and vice versa. Only position is randomized; every logo always
   renders at its own original size.
   =========================================================================== */
(function () {
  'use strict';

  var logos = Array.prototype.slice.call(document.querySelectorAll('.wk-logo'));
  if (logos.length < 2) return;

  var entries = logos.map(function (img) {
    return {
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      w: img.getAttribute('width'),
      h: img.getAttribute('height')
    };
  });

  for (var i = entries.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = entries[i];
    entries[i] = entries[j];
    entries[j] = tmp;
  }

  logos.forEach(function (img, i) {
    var e = entries[i];
    img.setAttribute('src', e.src);
    img.setAttribute('alt', e.alt);
    img.setAttribute('width', e.w);
    img.setAttribute('height', e.h);
    img.style.setProperty('--w', e.w);
    img.style.setProperty('--h', e.h);
  });
})();
