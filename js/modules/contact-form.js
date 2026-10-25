/* ==========================================================================
   CONTACT FORM — έλεγχος πεδίων & αποστολή μέσω FormSubmit (AJAX)
   Ο παραλήπτης ορίζεται στο data-endpoint της φόρμας στο index.html.
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

  /* --- Καταστάσεις φόρμας: idle | loading | success --- */
  const setState = (state) => {
    form.dataset.state = state;
    form.querySelector(".form-success").setAttribute("aria-hidden", String(state !== "success"));
  };

  /* --- Αποστολή --- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

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

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || String(result.success) === "false") {
        const error = new Error(result.message || "HTTP " + response.status);
        error.serviceMessage = result.message;
        throw error;
      }

      form.reset();
      setState("success");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.error("[Diktiosi] Αποτυχία αποστολής φόρμας:", err);
      setState("idle");
      status.textContent = err.serviceMessage
        ? "Η αποστολή δεν ολοκληρώθηκε: " + err.serviceMessage
        : "Κάτι πήγε στραβά με την αποστολή. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας τηλεφωνικά.";
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
