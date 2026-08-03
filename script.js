document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.querySelector('.lightbox-overlay');
  var overlayImg = overlay.querySelector('img');
  var galleryImages = document.querySelectorAll('.gallery-grid img, .preview-grid img');

  galleryImages.forEach(function (img) {
    img.addEventListener('click', function () {
      overlayImg.src = img.src;
      overlayImg.alt = img.alt;
      overlay.classList.add('active');
    });
  });

  overlay.addEventListener('click', function () {
    overlay.classList.remove('active');
  });

  var filterButtons = document.querySelectorAll('.filter-btn');
  var galleryPhotos = document.querySelectorAll('.gallery-grid img');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var filter = btn.dataset.filter;
      galleryPhotos.forEach(function (photo) {
        var show = filter === 'all' || photo.dataset.category === filter;
        photo.classList.toggle('hidden', !show);
      });
    });
  });
});
