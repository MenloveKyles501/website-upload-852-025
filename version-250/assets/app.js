(function () {
  var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@latest";
  var hlsLoadingPromise = null;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }

    hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("HLS 脚本加载失败"));
      };
      document.head.appendChild(script);
    });

    return hlsLoadingPromise;
  }

  function initMenu() {
    var button = $("[data-menu-button]");
    var nav = $("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = $$("[data-hero-slide]", hero);
    var dots = $$("[data-hero-dot]", hero);
    var previous = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = $$("[data-filter-panel]");

    panels.forEach(function (panel) {
      var input = $("[data-filter-input]", panel);
      var sort = $("[data-sort-select]", panel);
      var reset = $("[data-filter-reset]", panel);
      var status = $("[data-filter-status]", panel);
      var grid = panel.parentElement ? $("[data-filter-grid]", panel.parentElement) : null;

      if (!grid) {
        return;
      }

      var cards = $$(".movie-card", grid);
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function cardText(card) {
        return normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-section"),
          card.textContent
        ].join(" "));
      }

      function apply() {
        var query = normalizeText(input ? input.value : "");
        var sortValue = sort ? sort.value : "default";
        var sortedCards = cards.slice();

        sortedCards.sort(function (a, b) {
          if (sortValue === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          if (sortValue === "likes") {
            return Number(b.getAttribute("data-likes")) - Number(a.getAttribute("data-likes"));
          }
          if (sortValue === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (sortValue === "title") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
          }
          return 0;
        });

        sortedCards.forEach(function (card) {
          grid.appendChild(card);
          card.hidden = query ? cardText(card).indexOf(query) === -1 : false;
        });

        if (status) {
          status.textContent = query ? "已更新筛选结果" : "输入关键词即可筛选当前页面影片";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (sort) {
        sort.addEventListener("change", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (sort) {
            sort.value = "default";
          }
          apply();
        });
      }

      apply();
    });
  }

  function attachSource(player, video, source, message) {
    if (!source) {
      if (message) {
        message.textContent = "当前播放源暂不可用";
      }
      return Promise.reject(new Error("播放源为空"));
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }

    return loadHlsScript().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (player._hlsInstance) {
          player._hlsInstance.destroy();
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        player._hlsInstance = hls;
        return;
      }

      video.src = source;
    });
  }

  function initPlayers() {
    var players = $$("[data-player]");

    players.forEach(function (player) {
      var video = $("video", player);
      var button = $("[data-player-button]", player);
      var message = $("[data-player-message]", player);
      var source = player.getAttribute("data-src");
      var ready = false;

      if (!video || !button) {
        return;
      }

      function play() {
        if (message) {
          message.textContent = "";
        }

        var sourcePromise = ready ? Promise.resolve() : attachSource(player, video, source, message);
        ready = true;

        sourcePromise.then(function () {
          return video.play();
        }).then(function () {
          player.classList.add("is-playing");
        }).catch(function () {
          if (message) {
            message.textContent = "播放未自动开始，请再次点击视频区域。";
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
}());
