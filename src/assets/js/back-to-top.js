(function () {
  var btn = document.querySelector(".back-to-top");
  if (!btn) return;

  var THRESHOLD = 800;

  function toggle() {
    btn.hidden = window.scrollY < THRESHOLD;
  }

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
