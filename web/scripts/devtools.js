/* DEV ONLY — delete this file and the <aside> in index.html before launch.
   Lets the intra-artboard boundaries (panels 5, 7, 9) be flipped between
   fade and slide live, so the choice can be made by feel rather than by
   description. */
(function () {
  'use strict';
  var box = document.getElementById('devtools');
  if (!box) return;

  var FADE = ['work-01b', 'work-02b', 'work-03b'];
  var mode = 'fade';

  var elPanel = document.getElementById('devPanel');
  var elName  = document.getElementById('devName');
  var elSize  = document.getElementById('devSize');
  var elMode  = document.getElementById('devMode');

  function size() {
    elSize.textContent = window.innerWidth + ' x ' + window.innerHeight +
      '  dpr ' + (window.devicePixelRatio || 1);
  }
  window.addEventListener('resize', size, { passive: true });
  size();

  document.addEventListener('panelchange', function (e) {
    var p = e.detail.panel;
    var n = Array.prototype.indexOf.call(document.querySelectorAll('.panel'), p) + 1;
    elPanel.textContent = String(n).padStart(2, '0');
    elName.textContent = p.getAttribute('aria-label') || p.id;
  });

  document.getElementById('devTransition').addEventListener('click', function () {
    mode = mode === 'fade' ? 'slide' : 'fade';
    elMode.textContent = mode;
    FADE.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.dataset.transition = mode;
    });
  });

  document.getElementById('devHide').addEventListener('click', function () {
    box.hidden = true;
    var b = document.createElement('button');
    b.className = 'devreveal';
    b.textContent = 'dev';
    b.onclick = function () { box.hidden = false; b.remove(); };
    document.body.appendChild(b);
  });
})();
