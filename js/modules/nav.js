/* ==========================================================================
   NAV — mobile menu, glass header στο scroll, ενεργό link ανά ενότητα
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initNav = function () {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!header || !toggle || !menu) return;

  /* --- Mobile menu --- */
  const setOpen = (open) => {
    body.classList.toggle("nav-open", open);
    body.classList.toggle("no-scroll", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(!body.classList.contains("nav-open")));

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Αν μεγαλώσει το παράθυρο ενώ είναι ανοιχτό, κλείσ' το
  window.matchMedia("(min-width: 993px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });

  /* --- Glass header μετά από λίγο scroll --- */
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Ενεργό link ανάλογα με την ενότητα που βλέπουμε --- */
  const navLinks = menu.querySelectorAll(".nav-link");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));
};
