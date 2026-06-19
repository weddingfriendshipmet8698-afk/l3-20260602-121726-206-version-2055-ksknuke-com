(function () {
  window.setupPlayer = function (source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var attached = false;

    if (!video || !button || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }

      attached = true;
    }

    function beginPlayback() {
      attachSource();
      button.classList.add("is-hidden");
      video.controls = true;

      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", beginPlayback);

    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("error", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
