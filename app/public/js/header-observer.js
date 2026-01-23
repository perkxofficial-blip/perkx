(function () {
  const header = document.getElementById("site-header");
  const sentinel = document.getElementById("hero-sentinel");

  if (!header || !sentinel) return;

  new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("scrolled", !entry.isIntersecting);
    },
    { threshold: 0 }
  ).observe(sentinel);
})();
