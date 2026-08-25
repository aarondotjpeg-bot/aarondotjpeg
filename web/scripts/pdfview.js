/* ===========================================================================
   PDF VIEWER
   Any link carrying data-pdf opens in the on-page dialog instead of handing
   the file to the browser's download prompt.

   Generic on purpose: the resume is the first document, not the only one that
   will ever want this.
   =========================================================================== */
(function () {
  'use strict';

  var dialog = document.getElementById('pdfview');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var frame    = document.getElementById('pdfviewFrame');
  var title    = document.getElementById('pdfviewTitle');
  var openLink = document.getElementById('pdfviewOpen');
  var fallback = document.getElementById('pdfviewFallback');
  var closeBtn = document.getElementById('pdfviewClose');
  var lastFocus = null;

  /* Phones get the browser's own PDF view. iOS Safari renders a PDF in an
     iframe as a single non-scrolling page, so an embedded viewer there is
     worse than the native one — and a document is unreadable in a 375px
     modal regardless. */
  function embeddable() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  function open(href, label) {
    lastFocus = document.activeElement;
    title.textContent = label || 'Document';
    frame.title = label || 'Document';
    openLink.href = href;
    fallback.querySelector('a').href = href;
    dialog.dataset.embed = 'true';
    frame.src = href;
    dialog.showModal();
  }

  function close() {
    /* Drop the src so the plugin stops rendering and the next open starts
       from page one rather than wherever the last visitor left off. */
    frame.src = 'about:blank';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-pdf]');
    if (!link) return;
    if (!embeddable()) return;            /* let the browser handle it */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    open(link.getAttribute('href'), link.dataset.pdf || link.textContent.trim());
  });

  closeBtn.addEventListener('click', function () { dialog.close(); });

  /* Clicking the backdrop. The dialog fills its own box, so any click that
     lands outside that box came from the backdrop. */
  dialog.addEventListener('click', function (e) {
    if (e.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right &&
                 e.clientY >= r.top  && e.clientY <= r.bottom;
    if (!inside) dialog.close();
  });

  /* Covers the close button, Escape, and the backdrop alike. */
  dialog.addEventListener('close', close);

  /* If the frame never loads, show the plain link instead of a blank panel. */
  frame.addEventListener('error', function () {
    dialog.dataset.embed = 'false';
  });
})();
