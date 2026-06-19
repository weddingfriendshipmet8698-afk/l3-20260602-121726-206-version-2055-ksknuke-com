document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var previousButton = document.querySelector(".hero-prev");
  var nextButton = document.querySelector(".hero-next");
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      showSlide(currentSlide - 1);
      startHero();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(currentSlide + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startHero();
    });
  });

  var searchInput = document.getElementById("movieSearch");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
  var emptyMessage = document.querySelector(".empty-message");
  var activeFilter = "all";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var term = searchInput ? normalize(searchInput.value) : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags")
      ].join(" "));
      var filterMatched = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
      var termMatched = !term || haystack.indexOf(term) !== -1;
      var visible = filterMatched && termMatched;

      card.style.display = visible ? "" : "none";

      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.style.display = visibleCount ? "none" : "block";
    }
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("is-active");
      });

      button.classList.add("is-active");
      activeFilter = button.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });
});
