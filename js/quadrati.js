/* ============================================================
   DIPARTIMENTO SX — quadrati.js

   Home, sezione Consulenza e Direzione Creativa: il video di sfondo non si
   vede a tutto schermo ma da quadrati che compaiono in punti a caso, si
   aprono, restano un attimo e si richiudono. Ogni quadrato mostra la
   porzione del video che gli sta sotto, come una finestra.

   Il video è uno solo, steso su tutta la sezione e ritagliato con
   `clip-path: path(...)`, riscritto a ogni fotogramma con i quadrati del
   momento. Così lo decodifica il browser una volta sola, senza canvas, e
   Safari non lo mette in pausa (lo fa con i video che non si vedono).

   Sta sotto testi e foto (z-index -1 nella sezione, come le linee
   tratteggiate). Si scarica solo quando la sezione arriva sullo schermo:
   da telefono la sezione è nascosta, quindi non si scarica mai.
   ============================================================ */
(() => {
  "use strict";

  const v = document.querySelector(".sq-video");
  if (!v || !("IntersectionObserver" in window)) return;
  if (!(window.CSS && CSS.supports("clip-path", 'path("M0 0H1V1Z")'))) return;

  const sec = v.closest("section");
  const foto = sec.querySelector(".split-col--media");
  const fermo = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MAX = 6;                    // quadrati aperti insieme, al massimo
  const APRI = 420, CHIUDI = 380;   // ms per aprirsi e richiudersi
  const VUOTO = 'path("M0 0Z")';

  const caso = (a, b) => a + Math.random() * (b - a);
  const morbido = (t) => 1 - Math.pow(1 - t, 3);

  let quadri = [];
  let raf = null;
  let prossimo = 0;

  /* un quadrato nuovo, in un punto a caso. Non dove c'è la foto: lì sotto
     non si vedrebbe. Dietro ai testi invece sì. */
  function nuovo(ora) {
    const W = v.clientWidth, H = v.clientHeight;
    if (!W || !H) return;
    const r = sec.getBoundingClientRect();
    const f = foto ? foto.getBoundingClientRect() : null;
    for (let tentativo = 0; tentativo < 12; tentativo++) {
      const s = Math.round(W * caso(0.06, 0.15));
      const x = Math.round(caso(0, W - s));
      const y = Math.round(caso(0, H - s));
      const cx = x + s / 2 + r.left, cy = y + s / 2 + r.top;
      if (f && cx > f.left && cx < f.right && cy > f.top && cy < f.bottom) continue;
      quadri.push({ x, y, s, t0: ora, vita: caso(1800, 3600) });
      return;
    }
  }

  function disegna(ora) {
    let d = "";
    quadri = quadri.filter((q) => ora - q.t0 < q.vita);
    quadri.forEach((q) => {
      const t = ora - q.t0;
      const k = fermo ? 1
        : t < APRI ? morbido(t / APRI)
        : t > q.vita - CHIUDI ? morbido((q.vita - t) / CHIUDI)
        : 1;
      const lato = q.s * k;
      if (lato < 1) return;
      const x = q.x + (q.s - lato) / 2, y = q.y + (q.s - lato) / 2;
      d += "M" + x.toFixed(1) + " " + y.toFixed(1) +
           "h" + lato.toFixed(1) + "v" + lato.toFixed(1) +
           "h-" + lato.toFixed(1) + "Z";
    });
    v.style.clipPath = d ? 'path("' + d + '")' : VUOTO;
  }

  function ciclo(ora) {
    if (ora >= prossimo && quadri.length < MAX) {
      nuovo(ora);
      prossimo = ora + caso(350, 950);
    }
    disegna(ora);
    raf = requestAnimationFrame(ciclo);
  }

  function entra() {
    if (!v.getAttribute("src")) v.src = v.dataset.src;
    if (fermo) {
      // movimento ridotto: qualche quadrato fermo su un fotogramma fermo
      if (!quadri.length) {
        for (let i = 0; i < 5; i++) nuovo(0);
        quadri.forEach((q) => { q.vita = Infinity; });
        disegna(1);
      }
      return;
    }
    v.play().catch(() => {});
    if (!raf) {
      prossimo = 0;
      raf = requestAnimationFrame(ciclo);
    }
  }

  function esce() {
    if (fermo) return;
    v.pause();
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    quadri = [];
    v.style.clipPath = VUOTO;
  }

  new IntersectionObserver((voci) => {
    voci.forEach((e) => (e.isIntersecting ? entra() : esce()));
  }, { rootMargin: "200px 0px" }).observe(sec);
})();
