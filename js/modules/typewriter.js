/* ==========================================================================
   TYPEWRITER — εναλλασσόμενες φράσεις στον τίτλο του hero
   ========================================================================== */
window.Diktiosi = window.Diktiosi || {};

window.Diktiosi.initTypewriter = function () {
  const el = document.querySelector("[data-typewriter]");
  if (!el) return;

  let words;
  try {
    words = JSON.parse(el.dataset.typewriter);
  } catch (err) {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion || !Array.isArray(words) || words.length < 2) return;

  const TYPE_SPEED = 70;
  const DELETE_SPEED = 35;
  const HOLD = 2400;

  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  const step = () => {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;

    const currentSlice = word.slice(0, charIndex);
    el.textContent = currentSlice || "\u200B";

    let delay = deleting ? DELETE_SPEED : TYPE_SPEED;
    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = HOLD;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 350;
    }
    setTimeout(step, delay);
  };

  setTimeout(step, HOLD + 1500);
};
