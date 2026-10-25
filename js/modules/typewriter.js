/* ==========================================================================
   TYPEWRITER — εναλλασσόμενες φράσεις στον τίτλο του hero
   <span data-typewriter='["Φράση 1", "Φράση 2"]'>Φράση 1</span>
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

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    el.textContent = word.slice(0, charIndex);

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

  // Ξεκινά αφού ο επισκέπτης προλάβει να διαβάσει την πρώτη φράση
  setTimeout(step, HOLD + 1500);
};
