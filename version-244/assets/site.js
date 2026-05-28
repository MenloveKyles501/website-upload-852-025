(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      document.body.classList.toggle('panel-open', panel.classList.contains('open'));
      button.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var slider = qs('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dot', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(next, 5200);
    }

    var prevButton = qs('.hero-prev', slider);
    var nextButton = qs('.hero-next', slider);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        startTimer();
      });
    });
    show(0);
    startTimer();
  }

  function initFilters() {
    var lists = qsa('.filter-list');
    if (!lists.length) {
      return;
    }
    var input = qs('.filter-input') || qs('#searchKeyword');
    var selects = qsa('.filter-select');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    function valueOf(card, key) {
      return (card.getAttribute('data-' + key) || '').toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        var key = select.getAttribute('data-filter');
        if (key && select.value) {
          filters[key] = select.value.toLowerCase();
        }
      });
      lists.forEach(function (list) {
        qsa('.movie-card, .rank-card', list).forEach(function (card) {
          var content = [
            valueOf(card, 'title'),
            valueOf(card, 'region'),
            valueOf(card, 'type'),
            valueOf(card, 'year'),
            valueOf(card, 'genre'),
            valueOf(card, 'tags'),
            valueOf(card, 'category')
          ].join(' ');
          var matched = !keyword || content.indexOf(keyword) !== -1;
          Object.keys(filters).forEach(function (key) {
            if (valueOf(card, key) !== filters[key]) {
              matched = false;
            }
          });
          card.classList.toggle('filter-hidden', !matched);
        });
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayers() {
    qsa('.watch-player').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('.player-start', player);
      var stream = player.getAttribute('data-stream');
      var hls = null;
      var prepared = false;
      if (!video || !button || !stream) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        player.classList.add('playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('playing');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
