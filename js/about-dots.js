/* ============================================================
   DIPARTIMENTO SX — about-dots.js

   La colonna di puntini della pagina about.

   1. Lampeggiano. Ogni puntino vive per conto suo: si accende con un
      colore preso a caso fra quelli della stampa (CMYK) e dello schermo
      (RGB), resta acceso un po', poi si spegne di colpo — sparisce e
      basta, niente dissolvenza — e dopo un po' si riaccende con un altro
      colore. Tempi tutti casuali: se ne accendono diversi insieme senza
      mai un ritmo riconoscibile.

   2. Si suonano. Un clic fa una nota con un'onda sinusoidale; la nota la
      decide il colore del puntino. Tenendo premuto la nota si ripete, e
      siccome intanto il puntino cambia colore, cambiano anche le note.
   ============================================================ */

(() => {
  "use strict";

  const dots = [...document.querySelectorAll(".ab-dot")];
  if (!dots.length) return;

  // ogni colore ha la sua nota: una scala pentatonica (do re mi sol la do re),
  // così qualunque sequenza esca dal caso suona comunque intonata
  const COLORI = [
    { hex: "#000000", nota: 261.63 },   // nero     — do
    { hex: "#FF0000", nota: 293.66 },   // rosso    — re
    { hex: "#FFF200", nota: 329.63 },   // giallo   — mi
    { hex: "#00FF00", nota: 392.00 },   // verde    — sol
    { hex: "#00AEEF", nota: 440.00 },   // ciano    — la
    { hex: "#0000FF", nota: 523.25 },   // blu      — do acuto
    { hex: "#EC008C", nota: 587.33 }    // magenta  — re acuto
  ];
  const NOTA = Object.fromEntries(COLORI.map((c) => [c.hex, c.nota]));

  /* ---------- 2. suono ---------- */
  let ctx = null;

  function suona(freq) {
    // il contesto audio nasce al primo gesto: prima i browser non lo lasciano partire
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    // attacco rapido e coda morbida, senza il "clic" di un'onda tagliata di netto
    vol.gain.setValueAtTime(0.0001, t);
    vol.gain.exponentialRampToValueAtTime(0.25, t + 0.012);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(vol).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  const REPEAT = 170;   // ms fra una nota e l'altra tenendo premuto

  dots.forEach((dot) => {
    dot.dataset.c = COLORI[0].hex;
    let timer = null;

    const notaAttuale = () => NOTA[dot.dataset.c] || COLORI[0].nota;
    const ferma = () => { clearInterval(timer); timer = null; };

    dot.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try { dot.setPointerCapture(e.pointerId); } catch (_) { /* non tutti i puntatori si possono catturare */ }
      ferma();
      suona(notaAttuale());
      timer = setInterval(() => suona(notaAttuale()), REPEAT);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => dot.addEventListener(ev, ferma));
    dot.addEventListener("contextmenu", (e) => e.preventDefault());
  });
  // se la pagina va in secondo piano mentre si tiene premuto, niente note all'infinito
  addEventListener("blur", () => dots.forEach((d) => d.dispatchEvent(new Event("pointercancel"))));

  /* ---------- 1. lampeggio ---------- */
  // con "riduci animazioni" restano neri e fermi (e suonano tutti il do)
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const caso = (a, b) => a + Math.random() * (b - a);
  const nuovoColore = (prima) => {
    let c;
    do { c = COLORI[Math.floor(Math.random() * COLORI.length)].hex; } while (c === prima);
    return c;
  };

  dots.forEach((dot) => {
    let colore = null;
    const accendi = () => {
      colore = nuovoColore(colore);
      dot.style.background = colore;
      dot.style.opacity = "1";
      dot.dataset.c = colore;         // la nota segue il colore
      setTimeout(spegni, caso(220, 1300));
    };
    const spegni = () => {
      dot.style.opacity = "0";
      setTimeout(accendi, caso(140, 1500));
    };
    // partono sfasati, spenti
    dot.style.opacity = "0";
    setTimeout(accendi, caso(0, 1400));
  });
})();
