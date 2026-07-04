(function () {
  var banner = document.getElementById("formError");
  if (!banner) return;

  if (window.location.search.indexOf("error=1") !== -1) {
    banner.hidden = false;
    banner.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
