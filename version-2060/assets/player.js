(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var panel = document.querySelector('[data-player-panel]');
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-play-button]');

        if (!panel || !video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;

        function bindSource() {
            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            panel.classList.add('is-playing');
            if (!video.src && source) {
                bindSource();
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    panel.classList.remove('is-playing');
                });
            }
        }

        bindSource();
        button.addEventListener('click', startPlayback);
        panel.addEventListener('click', function (event) {
            if (event.target === panel) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            panel.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                panel.classList.remove('is-playing');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
