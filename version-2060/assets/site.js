(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchPanel = document.querySelector('[data-search-panel]');

    if (searchPanel) {
        var input = searchPanel.querySelector('[data-search-input]');
        var category = searchPanel.querySelector('[data-category-filter]');
        var year = searchPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-grid] .movie-card'));

        function filterCards() {
            var query = (input.value || '').trim().toLowerCase();
            var selectedCategory = category.value || '';
            var selectedYear = year.value || '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                card.style.display = matchesQuery && matchesCategory && matchesYear ? '' : 'none';
            });
        }

        [input, category, year].forEach(function (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        });
    }
})();
