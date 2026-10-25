/* ==========================================================================
   MAIN — εκκίνηση όλων των modules
   Για να απενεργοποιήσεις ένα εφέ, σβήσε το όνομά του από τη λίστα.
   ========================================================================== */
(function () {
  const modules = [
    "initNav",
    "initReveal",
    "initScroll",
    "initCounters",
    "initEffects",
    "initTypewriter",
    "initContactForm",
    "initCopy",
  ];

  const start = () => {
    modules.forEach((name) => {
      const fn = window.Diktiosi && window.Diktiosi[name];
      if (typeof fn !== "function") return;
      try {
        fn();
      } catch (err) {
        console.error(`[Diktiosi] ${name} failed:`, err);
      }
    });

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  };

  // Κρύβει τον preloader και ξεκινά τα εφέ του hero
  const markLoaded = () => document.body.classList.add("is-loaded");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.addEventListener("load", markLoaded);
  setTimeout(markLoaded, 2500); // ασφάλεια αν αργήσουν fonts/εικόνες
})();
