(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var hlsInstance = null;
    var loaded = false;

    function attachSource() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      video.setAttribute("controls", "controls");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
        return;
      }

      video.src = source;
    }

    function playMovie() {
      attachSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", function () {
        playMovie();
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playMovie();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
