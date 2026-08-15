document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.querySelector('.lightbox-overlay');
  if (!overlay) return;
  var overlayImg = overlay.querySelector('img');
  var closeBtn = overlay.querySelector('.lightbox-close');
  if (!closeBtn) return;
  var lightboxTriggers = document.querySelectorAll('.gallery-item, .preview-grid img');

  // The element that opened the dialog, so focus can return to it on
  // close. Screen reader and keyboard users would otherwise land back at
  // the top of the page and have to re-navigate to where they were.
  var openerEl = null;

  function focusableElements() {
    // Only two possible focusable descendants today (the close button
    // and the image, and the image isn't focusable without a tabindex),
    // but this is written to keep working if the dialog ever gains more
    // controls, rather than hard-coding "just the close button".
    return Array.prototype.slice.call(
      overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
  }

  // Keeps Tab/Shift+Tab cycling only through elements inside the dialog,
  // so keyboard focus can't slip out to the page underneath while it's
  // open. Only the two ends of the tab order need handling: everywhere
  // else, the browser's normal Tab behavior already stays inside the
  // dialog on its own.
  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (e.key !== 'Tab') return;

    var focusable = focusableElements();
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openLightbox(trigger) {
    var img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
    overlayImg.src = img.dataset.full || img.src;
    overlayImg.alt = img.alt;
    overlay.setAttribute('aria-label', img.alt || 'Image preview');
    openerEl = trigger;
    overlay.classList.add('active');
    closeBtn.focus();
    document.addEventListener('keydown', trapFocus);
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.removeEventListener('keydown', trapFocus);
    if (openerEl) {
      openerEl.focus();
      openerEl = null;
    }
  }

  // Clicking a thumbnail only starts fetching the full 1600px image at
  // that instant, so there's a visible pause before it appears. Warming
  // the browser's cache earlier - on hover (mouse), focus (keyboard), or
  // touchstart (touchscreens, which fires slightly before the tap
  // completes) - means the fetch is often already done by the time the
  // click lands, so the swap feels instant instead of laggy. Harmless to
  // call more than once per image: the Set skips repeats, and a request
  // for a URL already in the browser's cache is served from there
  // instead of hitting the network again.
  var preloadedFulls = new Set();
  function preloadFull(trigger) {
    var img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
    var full = img && img.dataset.full;
    if (!full || preloadedFulls.has(full)) return;
    preloadedFulls.add(full);
    new Image().src = full;
  }

  lightboxTriggers.forEach(function (trigger) {
    trigger.addEventListener('mouseenter', function () {
      preloadFull(trigger);
    });
    trigger.addEventListener('focus', function () {
      preloadFull(trigger);
    });
    trigger.addEventListener('touchstart', function () {
      preloadFull(trigger);
    }, { passive: true });
    trigger.addEventListener('click', function () {
      openLightbox(trigger);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  // Only close on a direct click on the backdrop itself. Without the
  // target check, this fires on *any* click inside .lightbox-overlay,
  // including the image and the close button, because click events
  // bubble up to the element the listener is attached to - so a click
  // on the image reads here as "clicked the overlay" unless it's ruled
  // out explicitly.
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });

  var filterButtons = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      var filter = btn.dataset.filter;
      galleryItems.forEach(function (item) {
        var show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });
});
