(function () {
  function createNative(video, streamUrl) {
    video.src = streamUrl;
    return Promise.resolve();
  }

  function createHls(video, streamUrl) {
    return new Promise(function (resolve) {
      if (!window.Hls || !window.Hls.isSupported()) {
        createNative(video, streamUrl).then(resolve);
        return;
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        resolve();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
      video._hls = hls;
    });
  }

  function mount(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var streamUrl = root.getAttribute('data-stream');
    var loading = false;
    var ready = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    function start() {
      if (loading) {
        return;
      }
      loading = true;
      root.classList.add('is-loading');

      var setup = ready
        ? Promise.resolve()
        : (video.canPlayType('application/vnd.apple.mpegurl')
          ? createNative(video, streamUrl)
          : createHls(video, streamUrl));

      setup.then(function () {
        ready = true;
        return video.play();
      }).then(function () {
        root.classList.remove('is-loading');
        root.classList.add('is-playing');
        loading = false;
      }).catch(function () {
        root.classList.remove('is-loading');
        root.classList.add('is-playing');
        loading = false;
      });
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
    video.addEventListener('play', function () {
      root.classList.remove('is-loading');
      root.classList.add('is-playing');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(mount);
  });
})();
