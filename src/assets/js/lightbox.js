(function () {
  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var group = document.querySelector("[data-lightbox-group]");
  if (!group) return;

  var triggers = Array.prototype.slice.call(group.querySelectorAll(".gallery-grid__trigger"));
  if (!triggers.length) return;

  var items = triggers.map(function (t) {
    return { src: t.getAttribute("href"), alt: t.getAttribute("data-lightbox-alt") || "" };
  });

  var img = lightbox.querySelector(".lightbox__img");
  var caption = lightbox.querySelector(".lightbox__caption");
  var closeBtn = lightbox.querySelector(".lightbox__close");
  var prevBtn = lightbox.querySelector(".lightbox__nav--prev");
  var nextBtn = lightbox.querySelector(".lightbox__nav--next");
  var stage = lightbox.querySelector(".lightbox__stage");

  var currentIndex = 0;
  var lastFocused = null;

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    var item = items[currentIndex];
    img.src = item.src;
    img.alt = item.alt;
    caption.textContent = item.alt;
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    img.src = "";
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach(function (trigger, i) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      open(i);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { show(currentIndex - 1); });
  nextBtn.addEventListener("click", function () { show(currentIndex + 1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });

  // basic touch swipe support
  var touchStartX = null;
  stage.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      show(currentIndex + (dx < 0 ? 1 : -1));
    }
    touchStartX = null;
  }, { passive: true });
})();
