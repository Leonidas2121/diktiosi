/* ==========================================================================
   EFFECTS — ripple, spotlight, 3D tilt, magnetic buttons, hero parallax
   data-spotlight  → glow που ακολουθεί τον κέρσορα
   data-tilt="6"   → 3D κλίση (μοίρες)
   data-magnetic   → το κουμπί "τραβιέται" προς τον κέρσορα
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initEffects = function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* --- Ripple στα κουμπιά --- */
  if (!reduceMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    });
  }

  // Τα παρακάτω μόνο σε ποντίκι, όχι σε touch
  if (reduceMotion || !finePointer) return;

  /* --- Spotlight --- */
  document.querySelectorAll("[data-spotlight]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - rect.left + "px");
      el.style.setProperty("--my", e.clientY - rect.top + "px");
    });
  });

  /* --- 3D Tilt --- */
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 6;
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--ry", (x * max).toFixed(2) + "deg");
      el.style.setProperty("--rx", (-y * max).toFixed(2) + "deg");
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  /* --- Magnetic buttons --- */
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = 0.25;
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.translate = `${x * strength}px ${y * strength}px`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.translate = "";
    });
  });

  /* --- Hero parallax (blobs) --- */
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("pointermove", (e) => {
      hero.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      hero.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    });
  }
};
