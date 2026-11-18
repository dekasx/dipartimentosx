/* ============================================================
   DIPARTIMENTO SX — pallini.js

   Apertura della pagina Consulenza e Direzione Creativa: il video di sfondo
   non si vede a tutto schermo ma da pallini che compaiono in punti a caso,
   si aprono, restano un attimo e si richiudono. Ogni pallino mostra la
   porzione del video che gli sta sotto, come un oblò.

   Ogni <video class="pallini-video"> è uno solo, steso su tutta la sua
   sezione e ritagliato con `clip-path: path(...)`, riscritto a ogni
   fotogramma con i cerchi del momento. Così lo decodifica il browser una volta sola, senza
   canvas, e Safari non lo mette in pausa (lo fa con i video che non si
   vedono).

   - data-src: il video; data-src-piccolo, se c'è, da telefono (più leggero);
   - data-evita: un elemento della sezione dietro cui non aprire pallini
     (una foto, per esempio: lì sotto non si vedrebbero).
   Sta sotto testi e foto (z-index -1, come le linee tratteggiate). Si
   scarica solo quando la sezione arriva sullo schermo.
   ============================================================ */
(() => {
  "use strict";

  const video = document.querySelectorAll(".pallini-video");
  if (!video.length || !("IntersectionObserver" in window)) return;
  if (!(window.CSS && CSS.supports("clip-path", 'path("M0 0H1V1Z")'))) return;

  const fermo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stretto = matchMedia("(max-width: 820px)").matches;
  const MAX = 6;                    // pallini aperti insieme, al massimo
  const APRI = 420, CHIUDI = 380;   // ms per aprirsi e richiudersi
  const VUOTO = 'path("M0 0Z")';

  const caso = (a, b) => a + Math.random() * (b - a);
  const morbido = (t) => 1 - Math.pow(1 - t, 3);

  video.forEach((v) => {
    const sec = v.closest("section") || v.parentNode;
    const foto = v.dataset.evita ? sec.querySelector(v.dataset.evita) : null;

    let quadri = [];
    let raf = null;
    let prossimo = 0;
    let voglio = false;          // il video deve andare (sezione sullo schermo)
    let riprova = 0;

    /* Chrome mette in pausa da solo un video muto che gli sembra invisibile,
       e con pochi pallini piccoli per lui lo è. Con `autoplay` lo fa
       ripartire da sé appena torna visibile; in più ci riproviamo noi. */
    v.addEventListener("pause", () => { if (voglio) riprova = 0; });

    /* un pallino nuovo, in un punto a caso (mai dietro a `data-evita`).
       Dietro ai testi sì. `s` è il diametro. */
    function nuovo(ora) {
      const W = v.clientWidth, H = v.clientHeight;
      if (!W || !H) return;
      const r = sec.getBoundingClientRect();
      const f = foto ? foto.getBoundingClientRect() : null;
      // sul lato lungo: da telefono, in verticale, non vengono minuscoli
      const base = Math.max(W, H);
      for (let tentativo = 0; tentativo < 12; tentativo++) {
        const s = Math.round(Math.min(base * caso(0.06, 0.15), W * 0.45));
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
          : t < APRI ? 0.35 + 0.65 * morbido(t / APRI)
          : t > q.vita - CHIUDI ? 0.35 + 0.65 * morbido((q.vita - t) / CHIUDI)
          : 1;
        const r = q.s * k / 2;
        if (r < 0.5) return;
        // un cerchio: due mezzi archi dal bordo sinistro al destro e ritorno
        const cx = q.x + q.s / 2, cy = q.y + q.s / 2, R = r.toFixed(1);
        d += "M" + (cx - r).toFixed(1) + " " + cy.toFixed(1) +
             "a" + R + " " + R + " 0 1 0 " + (2 * r).toFixed(1) + " 0" +
             "a" + R + " " + R + " 0 1 0 " + (-2 * r).toFixed(1) + " 0Z";
      });
      v.style.clipPath = d ? 'path("' + d + '")' : VUOTO;
    }

    function ciclo(ora) {
      // almeno due pallini sempre aperti, poi uno nuovo ogni tanto
      if (quadri.length < 2 || (ora >= prossimo && quadri.length < MAX)) {
        nuovo(ora);
        prossimo = ora + caso(350, 950);
      }
      if (v.paused && ora > riprova) {
        riprova = ora + 300;
        v.play().catch(() => {});
      }
      disegna(ora);
      raf = requestAnimationFrame(ciclo);
    }

    function entra() {
      if (!v.getAttribute("src")) {
        if (!fermo) v.autoplay = true;
        v.src = (stretto && v.dataset.srcPiccolo) || v.dataset.src;
      }
      if (fermo) {
        // movimento ridotto: qualche pallino fermo su un fotogramma fermo
        if (!quadri.length) {
          for (let i = 0; i < 5; i++) nuovo(0);
          quadri.forEach((q) => { q.vita = Infinity; });
          disegna(1);
        }
        return;
      }
      voglio = true;
      v.play().catch(() => {});
      if (!raf) {
        prossimo = 0;
        raf = requestAnimationFrame(ciclo);
      }
    }

    function esce() {
      if (fermo) return;
      voglio = false;
      v.pause();
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      quadri = [];
      v.style.clipPath = VUOTO;
    }

    new IntersectionObserver((voci) => {
      voci.forEach((e) => (e.isIntersecting ? entra() : esce()));
    }, { rootMargin: "200px 0px" }).observe(sec);
  });
})();
