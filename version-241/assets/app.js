(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prevButton = document.querySelector("[data-hero-prev]");
  var nextButton = document.querySelector("[data-hero-next]");
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === activeIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === activeIndex);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      showSlide(activeIndex - 1);
      startHeroTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(activeIndex + 1);
      startHeroTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
      showSlide(index);
      startHeroTimer();
    });
  });

  startHeroTimer();

  var filterInput = document.querySelector("[data-filter-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var emptyResult = document.querySelector("[data-empty-result]");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilter(value) {
    var query = normalize(value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search") || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle("is-visible", cards.length > 0 && visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      filterInput.value = query;
    }
    applyFilter(filterInput.value);
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }
})();
