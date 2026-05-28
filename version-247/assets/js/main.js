(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var category = area.querySelector('[data-filter-category]');
    var type = area.querySelector('[data-filter-type]');
    var region = area.querySelector('[data-filter-region]');
    var grid = area.querySelector('[data-filter-grid]') || document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var query = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(' '));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
        var matchedType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var matchedRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedCategory && matchedType && matchedRegion));
      });
    }

    [input, category, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var started = false;

    function startPlayer() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        started = true;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayer);
    }

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      startPlayer();
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
