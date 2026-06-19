(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var container = document.querySelector("[data-filter-results]");
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function matches(card) {
        var query = normalize(input ? input.value : "");
        var wantedRegion = normalize(region ? region.value : "");
        var wantedYear = normalize(year ? year.value : "");
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        return (!query || haystack.indexOf(query) !== -1) &&
          (!wantedRegion || cardRegion === wantedRegion) &&
          (!wantedYear || cardYear === wantedYear);
      }

      function apply() {
        cards.forEach(function (card) {
          card.classList.toggle("is-hidden", !matches(card));
        });
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, triggerId, src) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    if (!video || !trigger || !src) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      var nativeHls = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
      if (nativeHls) {
        video.src = src;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }
      video.src = src;
      return Promise.resolve();
    }

    function start() {
      trigger.classList.add("is-loading");
      attach().then(function () {
        return video.play();
      }).then(function () {
        trigger.classList.add("is-hidden");
        trigger.classList.remove("is-loading");
      }).catch(function () {
        trigger.classList.remove("is-loading");
      });
    }

    trigger.addEventListener("click", start);
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
      trigger.classList.remove("is-loading");
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
