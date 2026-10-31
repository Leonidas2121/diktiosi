/* ==========================================================================
   COPY — αντιγραφή κειμένου στο πρόχειρο
   <button data-copy="κείμενο"><i></i> <span>Αντιγραφή</span></button>
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initCopy = function () {
  // Εναλλακτικός τρόπος για browsers / περιβάλλοντα χωρίς Clipboard API
  const fallbackCopy = (text) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return fallbackCopy(text);
    }
  };

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("span");
    const icon = btn.querySelector("i");
    const originalLabel = label ? label.textContent : "";
    const originalIcon = icon ? icon.className : "";
    let timer;

    btn.addEventListener("click", async () => {
      const ok = await copy(btn.dataset.copy);
      if (label) label.textContent = ok ? "Αντιγράφηκε!" : "Επιλέξτε & αντιγράψτε";
      if (icon && ok) icon.className = "fas fa-check";
      btn.classList.toggle("is-copied", ok);

      clearTimeout(timer);
      timer = setTimeout(() => {
        if (label) label.textContent = originalLabel;
        if (icon) icon.className = originalIcon;
        btn.classList.remove("is-copied");
      }, 2000);
    });
  });
};
