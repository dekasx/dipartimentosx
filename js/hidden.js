/* ============================================================
   DIPARTIMENTO SX — hidden.js

   La pagina nascosta (hidden.html). Le immagini del sito in negativo,
   sparse, che respirano e ogni tanto sfarfallano; i quattro estratti audio
   della pagina suono tutti insieme, in loop, a metà velocità e senza
   correggere l'intonazione: un'ottava sotto.
   ============================================================ */
(() => {
  "use strict";

  const fermo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const caso = (a, b) => a + Math.random() * (b - a);

  /* ---------- le immagini ---------- */
  const foto = [...document.querySelectorAll(".muro img")];
  foto.forEach((img, i) => {
    // sparse su tutto lo schermo, un po' fuori dai bordi; le prime più grandi
    const s = img.style;
    s.left = caso(-4, 104).toFixed(1) + "%";
    s.top = caso(-4, 104).toFixed(1) + "%";
    s.setProperty("--w", caso(i < 6 ? 24 : 12, i < 6 ? 38 : 26).toFixed(1) + "vw");
    s.setProperty("--r", caso(-7, 7).toFixed(1) + "deg");
    s.setProperty("--s", caso(0.85, 1.1).toFixed(2));
    s.setProperty("--t", caso(18, 42).toFixed(1) + "s");
    s.setProperty("--d", (-caso(0, 40)).toFixed(1) + "s");
    s.setProperty("--dx", caso(-60, 60).toFixed(0) + "px");
    s.setProperty("--dy", caso(-60, 60).toFixed(0) + "px");
    s.zIndex = String(Math.floor(caso(0, 20)));
  });

  // ogni tanto un'immagine si spegne di colpo, un'altra si accende troppo
  if (!fermo) {
    (function sfarfalla() {
      const img = foto[Math.floor(caso(0, foto.length))];
      const cls = Math.random() < 0.7 ? "sfarfalla" : "acceso";
      img.classList.add(cls);
      setTimeout(() => img.classList.remove(cls), caso(50, 220));
      setTimeout(sfarfalla, caso(120, 900));
    })();
  }

  /* ---------- l'audio ---------- */
  const TRACCE = [
    "assets/audio/rce-beat-skatepark.mp3",
    "assets/audio/botteghe-di-biagio.mp3",
    "assets/audio/redbull-64-bars-taranto.mp3",
    "assets/audio/thanks-putin-ending.mp3",
  ];
  const tracce = TRACCE.map((src) => {
    const a = new Audio(src);
    a.loop = true;
    a.preload = "auto";
    // a metà velocità e senza tenere l'intonazione: tutto un'ottava sotto
    a.preservesPitch = false;
    a.mozPreservesPitch = false;
    a.webkitPreservesPitch = false;
    a.defaultPlaybackRate = 0.5;
    a.playbackRate = 0.5;
    return a;
  });

  const entra = document.querySelector(".entra");
  const muto = document.querySelector(".muto");
  let suona = false;

  function parti() {
    return Promise.all(tracce.map((a) => {
      a.playbackRate = 0.5;            // alcuni browser lo azzerano al caricamento
      return a.play();
    })).then(() => {
      suona = true;
      muto.textContent = "silenzio";
      entra.classList.remove("serve");
    });
  }
  function ferma() {
    tracce.forEach((a) => a.pause());
    suona = false;
    muto.textContent = "suono";
  }

  // il browser di solito vuole un clic prima di far suonare una pagina
  parti().catch(() => {
    tracce.forEach((a) => a.pause());
    entra.classList.add("serve");
  });
  entra.addEventListener("click", () => { parti().catch(() => {}); });
  muto.addEventListener("click", () => { if (suona) ferma(); else parti().catch(() => {}); });
})();
