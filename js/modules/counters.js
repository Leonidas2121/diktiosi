/* ==========================================================================
   COUNTERS — αριθμοί που "μετράνε" μέχρι την τιμή τους
   <span data-count="1600">1.600</span>
   Στο HTML γράφεται πάντα η τελική τιμή (φαίνεται σωστά και χωρίς JS).
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initCounters = function () {
  const counters = document.querySelectorAll("[data-count]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!counters.length || reduceMotion || !("IntersectionObserver" in window)) return;

  // 1600 → "1.600"
  const format = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = parseInt(el.dataset.duration, 10) || 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      el.textContent = format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => {
    el.textContent = "0";
    observer.observe(el);
  });
};
