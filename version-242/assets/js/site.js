(function () {
  var body = document.body;
  var prefix = body ? body.getAttribute('data-prefix') || '' : '';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var panel = qs('[data-mobile-menu]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
    });
  }

  qsa('[data-hero-slider]').forEach(function (slider) {
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-local-filter]').forEach(function (panelElement) {
    var container = panelElement.parentElement || document;
    var cards = qsa('[data-movie-card]', container);
    var queryInput = qs('[data-filter-query]', panelElement);
    var typeSelect = qs('[data-filter-type]', panelElement);
    var regionSelect = qs('[data-filter-region]', panelElement);
    var empty = qs('[data-no-results]', container);

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [queryInput, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  qsa('[data-player]').forEach(function (shell) {
    var video = qs('video', shell);
    var button = qs('[data-player-start]', shell);
    var message = qs('[data-player-message]', shell);
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source || video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      attachSource();
      if (!video) {
        return;
      }
      var promise = video.play();
      shell.classList.add('is-playing');
      if (message) {
        message.textContent = '正在加载播放源...';
      }
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (message) {
            message.textContent = '请再次点击播放按钮开始播放';
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        if (message) {
          message.textContent = '';
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });
      video.addEventListener('error', function () {
        if (message) {
          message.textContent = '播放源暂时无法加载，请稍后重试';
        }
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  });

  var searchForm = qs('[data-search-page-form]');
  var searchInput = qs('[data-search-page-input]');
  var searchResults = qs('[data-search-results]');
  var searchEmpty = qs('[data-search-empty]');

  function cardFromMovie(movie) {
    var link = prefix + 'videos/movie-' + movie.id + '.html';
    var img = prefix + movie.cover + '.jpg';
    return [
      '<article class="movie-card">',
      '  <a href="' + link + '">',
      '    <figure>',
      '      <img src="' + img + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <figcaption>' + escapeHtml(movie.bucket) + '</figcaption>',
      '      <span class="hover-play">▶</span>',
      '    </figure>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(query) {
    if (!searchResults || !window.MOVIE_INDEX) {
      return;
    }

    var clean = query.trim().toLowerCase();
    var movies = window.MOVIE_INDEX;
    var matches = clean
      ? movies.filter(function (movie) {
          return movie.search.indexOf(clean) !== -1;
        }).slice(0, 120)
      : movies.slice(0, 40);

    searchResults.innerHTML = matches.map(cardFromMovie).join('');
    if (searchEmpty) {
      searchEmpty.classList.toggle('is-visible', matches.length === 0);
    }
  }

  if (searchForm && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    runSearch(initialQuery);

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextQuery = searchInput.value.trim();
      var url = nextQuery ? '?q=' + encodeURIComponent(nextQuery) : window.location.pathname;
      window.history.replaceState({}, '', url);
      runSearch(nextQuery);
    });

    searchInput.addEventListener('input', function () {
      runSearch(searchInput.value);
    });
  }
})();
