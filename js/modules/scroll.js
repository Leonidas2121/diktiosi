/* ==========================================================================
   SCROLL — μπάρα προόδου & κουμπί "επιστροφή πάνω"
   Το --progress (0 → 1) μπαίνει στο <html> και το χρησιμοποιεί το CSS.
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initScroll = function () {
  const root = document.documentElement;
  const backToTop = document.querySelector(".back-to-top");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  const update = () => {
    const max = root.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    root.style.setProperty("--progress", progress.toFixed(4));
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
};
