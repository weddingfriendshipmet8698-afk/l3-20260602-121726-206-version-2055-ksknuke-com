(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var backgrounds = Array.prototype.slice.call(root.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      backgrounds.forEach(function (bg, i) {
        bg.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    if (!roots.length) {
      return;
    }

    roots.forEach(function (root) {
      var scope = root.closest("main") || document;
      var input = root.querySelector("[data-filter-input]");
      var type = root.querySelector("[data-filter-type]");
      var region = root.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-filter-text") || "";
          var cardType = card.getAttribute("data-filter-type") || "";
          var cardRegion = card.getAttribute("data-filter-region") || "";
          var match = true;

          if (q && text.indexOf(q) === -1) {
            match = false;
          }
          if (typeValue && cardType !== typeValue) {
            match = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            match = false;
          }

          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(mediaUrl, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var button = document.querySelector("[data-player-start]");
  var hlsInstance = null;
  var loaded = false;

  if (!video || !mediaUrl) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function start() {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (button && button !== cover) {
    button.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
