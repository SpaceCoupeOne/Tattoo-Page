document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.querySelector('.lightbox-overlay');
  if (!overlay) return;
  var overlayImg = overlay.querySelector('img');
  var lightboxTriggers = document.querySelectorAll('.gallery-item, .preview-grid img');

  lightboxTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
      overlayImg.src = img.dataset.full || img.src;
      overlayImg.alt = img.alt;
      overlay.classList.add('active');
    });
  });

  overlay.addEventListener('click', function () {
    overlay.classList.remove('active');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      overlay.classList.remove('active');
    }
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
