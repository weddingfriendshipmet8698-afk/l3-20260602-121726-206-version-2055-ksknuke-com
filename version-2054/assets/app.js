(function () {
  function queryAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = document.querySelector('.menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = queryAll('.hero-slide', root);
    var dots = queryAll('.hero-dot', root);
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initGlobalSearch() {
    var inputs = queryAll('.site-search-input');
    if (!inputs.length || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    inputs.forEach(function (input) {
      var holder = input.parentElement ? input.parentElement.querySelector('.site-search-results') : null;
      if (!holder) {
        return;
      }

      function render() {
        var keyword = normalize(input.value);
        if (!keyword) {
          holder.style.display = 'none';
          holder.innerHTML = '';
          return;
        }
        var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
          return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).indexOf(keyword) >= 0;
        }).slice(0, 12);

        if (!results.length) {
          holder.style.display = 'block';
          holder.innerHTML = '<div class="search-result"><span></span><span><strong>暂无匹配内容</strong><span>换一个关键词试试</span></span></div>';
          return;
        }

        holder.innerHTML = results.map(function (item) {
          return '<a class="search-result" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></span>' +
            '</a>';
        }).join('');
        holder.style.display = 'block';
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!holder.contains(event.target) && event.target !== input) {
          holder.style.display = 'none';
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initLocalFilters() {
    var list = document.querySelector('.filter-list');
    if (!list) {
      return;
    }
    var cards = queryAll('.movie-card', list);
    var input = document.querySelector('.local-filter-input');
    var selects = queryAll('.local-filter-select');

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute('data-filter')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre'));
        var ok = !keyword || text.indexOf(keyword) >= 0;
        if (active.type) {
          ok = ok && normalize(card.getAttribute('data-type')) === active.type;
        }
        if (active.region) {
          ok = ok && normalize(card.getAttribute('data-region')) === active.region;
        }
        card.classList.toggle('is-filter-hidden', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  window.initVideoPlayer = function (id, sourceUrl) {
    var video = document.getElementById(id);
    var cover = document.querySelector('[data-player-cover="' + id + '"]');
    if (!video || !cover || !sourceUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      loaded = true;
    }

    function start() {
      load();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {});
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initLocalFilters();
  });
})();
