/* DEV ONLY — delete this file and the <aside> in index.html before launch.
   Reports which panel is on screen and the live viewport size. */
(function () {
  'use strict';
  var box = document.getElementById('devtools');
  if (!box) return;


  var elPanel = document.getElementById('devPanel');
  var elName  = document.getElementById('devName');
  var elSize  = document.getElementById('devSize');

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


  document.getElementById('devHide').addEventListener('click', function () {
    box.hidden = true;
    var b = document.createElement('button');
    b.className = 'devreveal';
    b.textContent = 'dev';
    b.onclick = function () { box.hidden = false; b.remove(); };
    document.body.appendChild(b);
  });
})();
