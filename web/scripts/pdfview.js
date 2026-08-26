/* ===========================================================================
   DOCUMENT VIEWER
   Any link carrying data-pdf opens on the page instead of being handed to the
   browser's download prompt.

   It shows PRE-RENDERED PAGE IMAGES, not the PDF itself. An <iframe> pointed at
   a .pdf depends entirely on the visitor's browser having its PDF plugin
   enabled — and when it is set to "download PDFs instead of opening them", the
   frame renders as a blank white panel with no error. That is not something CSS
   or JS can override, and it is exactly the behaviour that made the resume link
   feel broken. Rendering the pages at build time removes the browser from the
   decision entirely.

   Pages come from data-pdf-pages (comma-separated). Without it the link is left
   alone and the browser opens the file however it likes.
   =========================================================================== */
(function () {
  'use strict';

  var dialog = document.getElementById('pdfview');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var pagesBox = document.getElementById('pdfviewPages');
  var title    = document.getElementById('pdfviewTitle');
  var openLink = document.getElementById('pdfviewOpen');
  var closeBtn = document.getElementById('pdfviewClose');
  var lastFocus = null;

  /* Phones get the browser's own view: a document is unreadable in a 375px
     modal, and the native viewer pinch-zooms properly. */
  function embeddable() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  function open(link) {
    var pages = (link.dataset.pdfPages || '').split(',')
                  .map(function (s) { return s.trim(); })
                  .filter(Boolean);
    if (!pages.length) return false;

    lastFocus = document.activeElement;
    var label = link.dataset.pdf || link.textContent.trim();
    title.textContent = label;
    openLink.href = link.getAttribute('href');

    pagesBox.textContent = '';
    pages.forEach(function (src, i) {
      var img = document.createElement('img');
      img.className = 'pdfview__page';
      img.src = src;
      img.alt = label + ' — page ' + (i + 1) + ' of ' + pages.length;
      img.decoding = 'async';
      if (i > 0) img.loading = 'lazy';
      pagesBox.appendChild(img);
    });

    dialog.showModal();
    pagesBox.scrollTop = 0;
    return true;
  }

  function close() {
    /* Drop the images so a reopen starts at page one and the memory goes back. */
    pagesBox.textContent = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-pdf]');
    if (!link) return;
    if (!embeddable()) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    if (open(link)) e.preventDefault();
  });

  closeBtn.addEventListener('click', function () { dialog.close(); });

  /* Backdrop click: the dialog fills its own box, so anything outside it is
     the backdrop. */
  dialog.addEventListener('click', function (e) {
    if (e.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right &&
                 e.clientY >= r.top  && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });

  /* Covers the close button, Escape and the backdrop alike. */
  dialog.addEventListener('close', close);
})();
