/* ============================================================
   DIPARTIMENTO SX — players.js
   Player audio minimali per i sample della pagina Sound Design.
   Uno alla volta: farne partire uno mette in pausa gli altri.
   Se il file non c'è, lo slot lo dice invece di rompersi.
   ============================================================ */

(() => {
  "use strict";

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    return m + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  };

  const all = [];

  function init(node) {
    const src = node.dataset.src;
    if (!src) return;

    const btn = node.querySelector(".player-btn");
    const bar = node.querySelector(".player-bar");
    const fill = node.querySelector(".player-fill");
    const time = node.querySelector(".player-time");

    const audio = new Audio();
    audio.preload = "metadata";   // così uno slot senza file lo dice subito
    audio.src = src;
    all.push({ node, audio });

    let loaded = false;

    audio.addEventListener("error", () => {
      node.classList.add("is-missing");
      if (time) time.textContent = "—";
      btn.disabled = true;
      btn.setAttribute("aria-label", "Estratto non ancora disponibile");
    });
    audio.addEventListener("loadedmetadata", () => {
      loaded = true;
      if (time) time.textContent = fmt(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      if (fill) fill.style.transform = `scaleX(${audio.currentTime / audio.duration})`;
      if (time) time.textContent = fmt(audio.duration - audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      node.classList.remove("is-playing");
      btn.setAttribute("aria-pressed", "false");
      if (fill) fill.style.transform = "scaleX(0)";
      if (loaded && time) time.textContent = fmt(audio.duration);
    });

    btn.addEventListener("click", () => {
      if (audio.paused) {
        all.forEach((o) => {
          if (o.audio !== audio && !o.audio.paused) {
            o.audio.pause();
            o.node.classList.remove("is-playing");
            o.node.querySelector(".player-btn").setAttribute("aria-pressed", "false");
          }
        });
        audio.play().then(() => {
          node.classList.add("is-playing");
          btn.setAttribute("aria-pressed", "true");
        }).catch(() => {
          node.classList.add("is-missing");
          btn.disabled = true;
        });
      } else {
        audio.pause();
        node.classList.remove("is-playing");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    if (bar) {
      bar.addEventListener("click", (e) => {
        if (!audio.duration) return;
        const r = bar.getBoundingClientRect();
        audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
      });
    }
  }

  const start = () => document.querySelectorAll(".player[data-src]").forEach(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
