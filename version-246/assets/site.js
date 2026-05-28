document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSpotlight();
    initFilters();
});

function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initSpotlight() {
    var root = document.querySelector("[data-spotlight]");

    if (!root) {
        return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".spotlight-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-slide-dot]"));
    var current = 0;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            show(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }
}

function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
        var section = panel.parentElement;
        var search = panel.querySelector("[data-filter-search]");
        var category = panel.querySelector("[data-filter-category]");
        var year = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));

        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            var categoryValue = category ? category.value : "";
            var yearValue = year ? year.value : "";

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-tags") || "").toLowerCase();
                var cardCategory = card.getAttribute("data-category") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedCategory = !categoryValue || cardCategory === categoryValue;
                var matchedYear = !yearValue || cardYear === yearValue;

                card.classList.toggle("is-filtered", !(matchedKeyword && matchedCategory && matchedYear));
            });
        }

        [search, category, year].forEach(function (item) {
            if (item) {
                item.addEventListener("input", apply);
                item.addEventListener("change", apply);
            }
        });
    });
}

function initMoviePlayer(streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var prepared = false;
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function start() {
        prepare();
        button.classList.add("is-hidden");
        video.controls = true;

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
