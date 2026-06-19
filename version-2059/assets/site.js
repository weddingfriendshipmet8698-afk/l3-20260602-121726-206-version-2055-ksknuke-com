
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var stage = document.querySelector("[data-hero]");
    if (!stage) {
      return;
    }
    var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));
    if (!lists.length) {
      return;
    }
    lists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector(".filter-input");
      var year = section.querySelector(".filter-year");
      var category = section.querySelector(".filter-category");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var query = new URLSearchParams(window.location.search).get("q");
      if (query && input) {
        input.value = query;
      }
      function apply() {
        var keyword = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var categoryValue = category ? category.value : "";
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.category,
            card.dataset.region,
            card.dataset.genre,
            card.textContent
          ].join(" "));
          var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var passYear = !yearValue || String(card.dataset.year) === String(yearValue);
          var passCategory = !categoryValue || String(card.dataset.category) === String(categoryValue);
          card.classList.toggle("is-hidden", !(passKeyword && passYear && passCategory));
        });
      }
      [input, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("img-hidden");
      }, { once: true });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var button = wrap.querySelector(".play-cover");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream");
      var isReady = false;
      function attach() {
        if (isReady || !streamUrl) {
          return;
        }
        isReady = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
      }
      function play() {
        attach();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        attach();
      });
      video.addEventListener("play", function () {
        wrap.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          wrap.classList.remove("is-playing");
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initImages();
    initPlayers();
  });
})();
