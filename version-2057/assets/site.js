(function () {
    var navButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restartHero() {
        if (!slides.length) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            restartHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            restartHero();
        });
    }

    restartHero();

    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var category = document.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function applyQueryFromUrl() {
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var c = category ? category.value : '';

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-category'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' ').toLowerCase();
            var okText = !q || text.indexOf(q) !== -1;
            var okYear = !y || card.getAttribute('data-year') === y;
            var okCategory = !c || card.getAttribute('data-category') === c;
            card.classList.toggle('is-hidden', !(okText && okYear && okCategory));
        });
    }

    applyQueryFromUrl();
    [input, year, category].forEach(function (node) {
        if (node) {
            node.addEventListener('input', filterCards);
            node.addEventListener('change', filterCards);
        }
    });
    filterCards();

    var video = document.getElementById('movie-player');
    var shell = document.querySelector('[data-video-shell]');
    var playButton = document.querySelector('[data-video-play]');

    if (video) {
        var streamUrl = video.getAttribute('data-src');
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached || !streamUrl) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function beginPlay() {
            attachStream();
            var playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
            if (shell) {
                shell.classList.add('is-playing');
            }
        }

        if (playButton) {
            playButton.addEventListener('click', beginPlay);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlay();
            }
        });

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (shell) {
                shell.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
