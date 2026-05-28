(function () {
  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
      });
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
      var grid = root.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var search = root.querySelector('[data-filter-search]');
      var category = root.querySelector('[data-filter-category]');
      var region = root.querySelector('[data-filter-region]');
      var year = root.querySelector('[data-filter-year]');
      var type = root.querySelector('[data-filter-type]');
      var sort = root.querySelector('[data-sort-cards]');
      var empty = root.querySelector('[data-filter-empty]');

      function includes(card, text) {
        var source = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        return source.indexOf(text) !== -1;
      }

      function applySort() {
        var mode = sort ? sort.value : 'index';
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'views') {
            return Number(b.dataset.views) - Number(a.dataset.views);
          }
          if (mode === 'rating') {
            return Number(b.dataset.rating) - Number(a.dataset.rating);
          }
          if (mode === 'year') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          return Number(a.dataset.index) - Number(b.dataset.index);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var text = search ? search.value.trim().toLowerCase() : '';
        var categoryValue = category ? category.value : '';
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matched = true;
          if (text && !includes(card, text)) {
            matched = false;
          }
          if (categoryValue && card.dataset.category !== categoryValue) {
            matched = false;
          }
          if (regionValue && card.dataset.region !== regionValue) {
            matched = false;
          }
          if (yearValue && card.dataset.year !== yearValue) {
            matched = false;
          }
          if (typeValue && card.dataset.type !== typeValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        applySort();
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [search, category, region, year, type, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
