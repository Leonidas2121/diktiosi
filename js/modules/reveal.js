/* ==========================================================================
   REVEAL — εμφάνιση στοιχείων κατά το scroll
   data-reveal="up|down|left|right|zoom|blur"  → εφέ
   data-delay="200"                             → καθυστέρηση (ms)
   data-stagger="80" [data-stagger-type="up"]   → διαδοχικά για τα παιδιά
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initReveal = function () {
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    const step = parseInt(group.dataset.stagger, 10) || 80;
    const type = group.dataset.staggerType || "up";
    Array.from(group.children).forEach((child, i) => {
      if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", type);
      child.style.setProperty("--reveal-delay", i * step + "ms");
    });
  });

  document.querySelectorAll("[data-delay]").forEach((el) => {
    el.style.setProperty("--reveal-delay", el.dataset.delay + "ms");
  });

  const items = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
};
