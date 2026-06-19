(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
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

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(index - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get("q") || "";
    var panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      var keywordInput = panel.querySelector("[data-filter-input]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var categorySelect = panel.querySelector("[data-filter-category]");
      var countLabel = panel.querySelector("[data-filter-count]");
      var list = document.querySelector("[data-filter-list]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      if (keywordInput && initialKeyword) {
        keywordInput.value = initialKeyword;
      }

      function filterCards() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var region = regionSelect ? regionSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var category = categorySelect ? categorySelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-category") || ""
          ].join(" ").toLowerCase();

          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesRegion = !region || card.getAttribute("data-region") === region;
          var matchesYear = !year || card.getAttribute("data-year") === year;
          var matchesCategory = !category || card.getAttribute("data-category") === category;
          var visibleCard = matchesKeyword && matchesRegion && matchesYear && matchesCategory;

          card.classList.toggle("is-filter-hidden", !visibleCard);

          if (visibleCard) {
            visible += 1;
          }
        });

        if (countLabel) {
          countLabel.textContent = "当前显示 " + visible + " 部";
        }
      }

      [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });

      filterCards();
    });
  });
})();
