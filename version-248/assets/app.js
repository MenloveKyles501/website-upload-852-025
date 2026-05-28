(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var filterBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
    filterBoxes.forEach(function (box) {
      var targetSelector = box.getAttribute('data-target') || '[data-movie-card]';
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      var inputs = Array.prototype.slice.call(box.querySelectorAll('input, select'));
      var count = document.querySelector(box.getAttribute('data-count-target') || '');

      function apply() {
        var q = normalize((box.querySelector('[data-filter-query]') || {}).value);
        var type = normalize((box.querySelector('[data-filter-type]') || {}).value);
        var region = normalize((box.querySelector('[data-filter-region]') || {}).value);
        var year = normalize((box.querySelector('[data-filter-year]') || {}).value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var ok = true;
          ok = ok && (!q || text.indexOf(q) !== -1);
          ok = ok && (!type || normalize(card.getAttribute('data-type')) === type);
          ok = ok && (!region || normalize(card.getAttribute('data-region')) === region);
          ok = ok && (!year || normalize(card.getAttribute('data-year')) === year);
          card.classList.toggle('hidden-by-filter', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      inputs.forEach(function (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      });
      apply();
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="pill">' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card landscape" data-movie-card>',
      '  <a href="' + escapeHtml(movie.file) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
      '      <span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="card-mask"><span class="card-play">▶</span></span>',
      '    </div>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3 class="card-title"><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-desc">' + escapeHtml(movie.one_line || movie.summary || '') + '</p>',
      '    <div class="meta-row"><span class="pill">' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span>' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var q = normalize(input.value);
      var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.one_line,
          movie.summary
        ].join(' '));
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 120);

      if (!list.length) {
        results.innerHTML = '<div class="content-box detail-copy"><p>没有找到匹配内容。</p></div>';
        return;
      }
      results.innerHTML = '<div class="grid grid-cards">' + list.map(createSearchCard).join('\n') + '</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var params = new URLSearchParams(window.location.search);
      if (input.value.trim()) {
        params.set('q', input.value.trim());
      } else {
        params.delete('q');
      }
      var next = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', next);
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      var message = shell.querySelector('[data-player-message]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src') || video.getAttribute('src') || '';
      var hls = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function attachSource() {
        if (!source) {
          setMessage('播放源暂不可用');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('播放源已就绪');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请切换网络后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setMessage('播放源已就绪');
        } else {
          video.src = source;
          setMessage('正在尝试加载播放源');
        }
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            setMessage('点击播放器即可开始播放');
          });
        }
      }

      attachSource();

      if (button) {
        button.addEventListener('click', function () {
          playVideo();
        });
      }

      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
