/* ==========================================================================
   CONTACT FORM — έλεγχος πεδίων & αποστολή μέσω Web3Forms (AJAX)
   Ο παραλήπτης ορίζεται από το access_key της φόρμας στο index.html (Web3Forms).
   Τα κουμπιά με data-package="..." προεπιλέγουν το αντίστοιχο πακέτο.
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initContactForm = function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const endpoint = form.dataset.endpoint;
  const status = form.querySelector(".form-status");
  const picker = form.querySelector(".package-picker");
  const packageInputs = form.querySelectorAll('input[name="Πακέτο"]');
  const fields = form.querySelectorAll(".form-field");

  const MESSAGES = {
    valueMissing: "Το πεδίο είναι υποχρεωτικό.",
    typeMismatch: "Συμπληρώστε ένα έγκυρο email.",
    patternMismatch: "Συμπληρώστε έναν έγκυρο αριθμό τηλεφώνου.",
    package: "Επιλέξτε το πακέτο που σας ενδιαφέρει.",
    consent: "Απαιτείται η συναίνεσή σας για να επικοινωνήσουμε μαζί σας.",
  };

  /* --- Προεπιλογή πακέτου από τα κουμπιά των τιμών --- */
  document.querySelectorAll("[data-package]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const match = Array.from(packageInputs).find((input) =>
        input.value.startsWith(btn.dataset.package)
      );
      if (!match) return;
      match.checked = true;
      validateField(picker);
      picker.classList.remove("is-highlight");
      void picker.offsetWidth; // επανεκκίνηση animation
      picker.classList.add("is-highlight");
    });
  });

  /* --- Έλεγχος ενός πεδίου --- */
  function validateField(field) {
    const errorEl = field.querySelector(".field-error");
    const input = field.querySelector("input:not([type=hidden]), textarea");
    if (!input || !errorEl) return true;

    let message = "";
    if (field === picker) {
      if (!Array.from(packageInputs).some((i) => i.checked)) message = MESSAGES.package;
    } else if (input.type === "checkbox") {
      if (input.required && !input.checked) message = MESSAGES.consent;
    } else {
      input.value = input.value.trimStart();
      const v = input.validity;
      if (v.valueMissing || (input.required && !input.value.trim())) message = MESSAGES.valueMissing;
      else if (v.typeMismatch) message = MESSAGES.typeMismatch;
      else if (v.patternMismatch) message = MESSAGES.patternMismatch;
    }

    errorEl.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    return !message;
  }

  // Έλεγχος όταν ο χρήστης φεύγει από ένα πεδίο, καθαρισμός λάθους όταν το διορθώνει
  fields.forEach((field) => {
    field.addEventListener("focusout", () => {
      if (field !== picker) validateField(field);
    });
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid")) validateField(field);
    });
    field.addEventListener("change", () => {
      if (field.classList.contains("is-invalid")) validateField(field);
    });
  });

  /* --- Εναλλακτική αποστολή (email / WhatsApp) αν αποτύχει η υπηρεσία --- */
  const fallback = form.querySelector(".form-fallback");
  const FALLBACK_EMAIL = "diktiosi@outlook.com";
  const FALLBACK_PHONE = "306994243547";
  // Ρυθμίσεις της υπηρεσίας — δεν μπαίνουν στο κείμενο του email / WhatsApp
  const SERVICE_FIELDS = ["access_key", "subject", "from_name", "botcheck"];

  function showFallback(data) {
    const subject = "Αίτημα από τη φόρμα του Diktiosi";
    const body = Object.entries(data)
      .filter(([key, value]) => !SERVICE_FIELDS.includes(key) && value)
      .map(([key, value]) => key + ": " + value)
      .join("\n");
    const enc = encodeURIComponent;
    const links = {
      mailto: "mailto:" + FALLBACK_EMAIL + "?subject=" + enc(subject) + "&body=" + enc(body),
      gmail:
        "https://mail.google.com/mail/?view=cm&fs=1&to=" + FALLBACK_EMAIL +
        "&su=" + enc(subject) + "&body=" + enc(body),
      whatsapp: "https://wa.me/" + FALLBACK_PHONE + "?text=" + enc(subject + "\n\n" + body),
    };
    fallback.querySelectorAll("[data-fallback]").forEach((a) => {
      a.href = links[a.dataset.fallback];
    });
    fallback.hidden = false;
  }

  /* --- Καταστάσεις φόρμας: idle | loading | success --- */
  const setState = (state) => {
    form.dataset.state = state;
    form.querySelector(".form-success").setAttribute("aria-hidden", String(state !== "success"));
  };

  /* --- Αποστολή --- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    fallback.hidden = true;

    const invalid = Array.from(fields).filter((field) => !validateField(field));
    if (invalid.length) {
      const first = invalid[0].querySelector("input, textarea");
      invalid[0].scrollIntoView({ behavior: "smooth", block: "center" });
      if (first) first.focus({ preventScroll: true });
      return;
    }

    setState("loading");

    // Αν η υπηρεσία δεν απαντήσει σε 20", σταματάμε την αναμονή
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || String(result.success) === "false") {
        throw new Error(result.message || "HTTP " + response.status);
      }

      form.reset();
      setState("success");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.error("[Diktiosi] Αποτυχία αποστολής φόρμας:", err);
      setState("idle");
      status.textContent =
        "Η αυτόματη αποστολή δεν ολοκληρώθηκε. Τα στοιχεία σας δεν χάθηκαν — " +
        "στείλτε τα με ένα κλικ από εδώ:";
      showFallback(data);
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      clearTimeout(timeout);
    }
  });

  form.querySelector(".form-reset").addEventListener("click", () => {
    setState("idle");
    form.querySelector("#cf-name").focus();
  });
};
