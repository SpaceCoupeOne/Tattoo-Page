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
});
