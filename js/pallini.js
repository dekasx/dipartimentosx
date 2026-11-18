/* ============================================================
   DIPARTIMENTO SX — pallini.js

   In apertura delle pagine servizio il video di sfondo non si vede a tutto
   schermo ma da pallini: ogni pallino mostra la porzione del video che gli
   sta sotto, come un oblò. Il video è lo stesso ovunque; cambia il modo in
   cui i pallini si muovono, scelto con `data-effetto`:

   - sparsi        Consulenza: pallini medi in punti a caso, si aprono e
                   si richiudono
   - diaframma     Regia: un pallino solo, grande, che si apre come l'iride
                   di una cinepresa, scivola piano e si richiude
   - equalizzatore Sound Design, sopra a "Ascolta": una fila che sale e
                   scende come un equalizzatore; con un estratto audio in
                   riproduzione segue il suono vero (evento "campione" da
                   js/players.js). Quanti sono: data-n (24)
   - puntatore     Web: una griglia di pallini minuscoli che si accendono
                   dove passa il mouse e si spengono piano
   - dialogo       Studio Podcast: due pallini che si gonfiano a turno,
                   come due voci che si rispondono

   Ogni <video class="pallini-video"> copre il suo contenitore (il genitore)
   ed è ritagliato con `clip-path: path(...)`, riscritto a ogni fotogramma.
   Un video solo per pagina, decodificato dal browser, senza canvas.

   - data-src: il video; data-src-piccolo, da telefono. Senza
     data-src-piccolo da telefono non c'è niente e non si scarica niente
     (oggi i pallini da telefono ci sono solo in Consulenza);
   - data-evita: un elemento dietro cui non aprire pallini (solo "sparsi").
   Sta sotto ai testi (z-index -1). Si scarica quando il contenitore arriva
   sullo schermo e si ferma quando ne esce.
   ============================================================ */
(() => {
  "use strict";

  const video = document.querySelectorAll(".pallini-video");
  if (!video.length || !("IntersectionObserver" in window)) return;
  if (!(window.CSS && CSS.supports("clip-path", 'path("M0 0H1V1Z")'))) return;

  const fermo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stretto = matchMedia("(max-width: 820px)").matches;
  const VUOTO = 'path("M0 0Z")';

  const caso = (a, b) => a + Math.random() * (b - a);
  const morbido = (t) => 1 - Math.pow(1 - t, 3);
  const tra = (a, b, t) => a + (b - a) * t;

  // un cerchio nel path: due mezzi archi dal bordo sinistro al destro e ritorno
  function cerchio(cx, cy, r) {
    const R = r.toFixed(1);
    return "M" + (cx - r).toFixed(1) + " " + cy.toFixed(1) +
           "a" + R + " " + R + " 0 1 0 " + (2 * r).toFixed(1) + " 0" +
           "a" + R + " " + R + " 0 1 0 " + (-2 * r).toFixed(1) + " 0Z";
  }

  /* Ogni effetto riceve il video e il contenitore e restituisce:
     passo(ora) -> [[cx, cy, r], ...] i cerchi di questo fotogramma
     fermo()    -> i cerchi per chi ha chiesto meno movimento (immagine ferma)
     via()      -> quando il contenitore esce dallo schermo */

  /* ---------- Consulenza: pallini sparsi ---------- */
  function sparsi(v, box) {
    const MAX = 6, APRI = 420, CHIUDI = 380;
    const foto = v.dataset.evita ? box.querySelector(v.dataset.evita) : null;
    let pallini = [], prossimo = 0;

    function nuovo(ora) {
      const W = box.clientWidth, H = box.clientHeight;
      const r = box.getBoundingClientRect();
      const f = foto ? foto.getBoundingClientRect() : null;
      // sul lato lungo: da telefono, in verticale, non vengono minuscoli
      const base = Math.max(W, H);
      for (let i = 0; i < 12; i++) {
        const s = Math.min(base * caso(0.06, 0.15), W * 0.45);
        const x = caso(s / 2, W - s / 2), y = caso(s / 2, H - s / 2);
        if (f && x + r.left > f.left && x + r.left < f.right &&
            y + r.top > f.top && y + r.top < f.bottom) continue;
        pallini.push({ x, y, s, t0: ora, vita: caso(1800, 3600) });
        return;
      }
    }
    // si aprono da un terzo della misura, non da zero: mai minuscoli
    const apertura = (t, vita) =>
      t < APRI ? 0.35 + 0.65 * morbido(t / APRI)
      : t > vita - CHIUDI ? 0.35 + 0.65 * morbido((vita - t) / CHIUDI)
      : 1;

    return {
      passo(ora) {
        // almeno due sempre aperti, poi uno nuovo ogni tanto
        if (pallini.length < 2 || (ora >= prossimo && pallini.length < MAX)) {
          nuovo(ora);
          prossimo = ora + caso(350, 950);
        }
        pallini = pallini.filter((p) => ora - p.t0 < p.vita);
        return pallini.map((p) => [p.x, p.y, p.s / 2 * apertura(ora - p.t0, p.vita)]);
      },
      fermo() {
        pallini = [];
        for (let i = 0; i < 5; i++) nuovo(0);
        return pallini.map((p) => [p.x, p.y, p.s / 2]);
      },
      via() { pallini = []; },
    };
  }

  /* ---------- Regia: il diaframma ---------- */
  function diaframma(v, box) {
    const APRE = 1100, CHIUDE = 900, BUIO = 450;
    let giro = null;

    function nuovo(ora) {
      const W = box.clientWidth, H = box.clientHeight, m = Math.min(W, H);
      // più verso destra: a sinistra ci sono titolo e testo
      const ax = caso(0.48, 0.78) * W, ay = caso(0.32, 0.68) * H;
      const ang = caso(0, Math.PI * 2), dist = m * caso(0.08, 0.16);
      giro = { t0: ora, vita: caso(4200, 6000), R: m * caso(0.28, 0.36),
               ax, ay, bx: ax + Math.cos(ang) * dist, by: ay + Math.sin(ang) * dist };
    }
    return {
      passo(ora) {
        if (!giro || ora - giro.t0 > giro.vita + BUIO) nuovo(ora);
        const g = giro, t = ora - g.t0;
        if (t >= g.vita) return [];                 // un attimo di buio fra un giro e l'altro
        const k = t < APRE ? morbido(t / APRE)
          : t > g.vita - CHIUDE ? morbido((g.vita - t) / CHIUDE) : 1;
        const u = t / g.vita, e = u * u * (3 - 2 * u);
        return [[tra(g.ax, g.bx, e), tra(g.ay, g.by, e), g.R * k]];
      },
      fermo() {
        const W = box.clientWidth, H = box.clientHeight;
        return [[W * 0.62, H * 0.5, Math.min(W, H) * 0.32]];
      },
      via() { giro = null; },
    };
  }

  /* ---------- Sound Design: l'equalizzatore ---------- */
  let audioCtx = null;
  const analisiDi = new WeakMap();

  function equalizzatore(v, box) {
    const N = parseInt(v.dataset.n, 10) || 24;
    const onde = Array.from({ length: N }, () =>
      [caso(0, 6.28), caso(0.7, 1.7), caso(0, 6.28), caso(1.9, 3.4)]);
    const livelli = new Array(N).fill(0.3);
    let analisi = null, dati = null;

    /* Un estratto parte (dentro al clic): lo facciamo passare da un
       analizzatore. Se il browser non concede l'audio, non si collega
       niente e l'estratto suona come sempre. */
    document.addEventListener("campione", (e) => {
      const audio = e.detail;
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const pronto = () => {
          if (audioCtx.state !== "running") return;
          let a = analisiDi.get(audio);
          if (!a) {
            a = audioCtx.createAnalyser();
            a.fftSize = 256;
            a.smoothingTimeConstant = 0.78;
            const src = audioCtx.createMediaElementSource(audio);
            src.connect(a);
            a.connect(audioCtx.destination);
            analisiDi.set(audio, a);
            const stop = () => { if (analisi === a) analisi = null; };
            audio.addEventListener("pause", stop);
            audio.addEventListener("ended", stop);
          }
          analisi = a;
          dati = new Uint8Array(a.frequencyBinCount);
        };
        if (audioCtx.state === "running") pronto();
        else audioCtx.resume().then(pronto, () => {});
      } catch (_) { analisi = null; }
    });

    /* Frequenze in scala logaritmica, così i bassi non si prendono tutta la
       fila. Il livello è relativo al picco recente (che cala piano): la fila
       si muove allo stesso modo a volume alto e basso, perché l'analizzatore
       sente il suono dopo il volume. */
    let picco = 40;
    function bande() {
      analisi.getByteFrequencyData(dati);
      const n = dati.length, grezzi = [];
      for (let i = 0; i < N; i++) {
        const a = Math.floor(Math.pow(n * 0.8, i / N)), b = Math.max(a + 1, Math.floor(Math.pow(n * 0.8, (i + 1) / N)));
        let s = 0;
        for (let j = a; j < b; j++) s += dati[j];
        // la musica ha meno energia sugli acuti: a destra si alza un po'
        grezzi.push(s / (b - a) * (0.85 + 1.3 * i / N));
      }
      picco = Math.max(8, picco * 0.995, ...grezzi);
      return grezzi.map((g) => Math.pow(g / picco, 1.4));
    }

    // la fila occupa tutta la larghezza del riquadro, a metà altezza
    function fila(livello) {
      const W = box.clientWidth, H = box.clientHeight;
      const rMax = Math.min(W / N * 0.46, H / 2);
      const dx = (W - 2 * rMax) / (N - 1);
      return livelli.map((_, i) => [rMax + i * dx, H / 2, rMax * Math.max(0.08, livello(i))]);
    }

    return {
      passo(ora) {
        const t = ora / 1000;
        const suono = analisi ? bande() : null;
        for (let i = 0; i < N; i++) {
          const [p1, f1, p2, f2] = onde[i];
          const meta = suono ? suono[i]
            : 0.42 + 0.22 * Math.sin(t * f1 + p1) + 0.16 * Math.sin(t * f2 + p2);
          livelli[i] += (meta - livelli[i]) * (suono ? 0.35 : 0.12);
        }
        return fila((i) => livelli[i]);
      },
      fermo() { return fila((i) => 0.3 + 0.4 * Math.abs(Math.sin(i * 1.7))); },
      via() {},
    };
  }

  /* ---------- Web: il puntatore ---------- */
  function puntatore(v, box) {
    const G = 26;            // passo della griglia
    const RAGGIO = 130;      // quanto lontano dal mouse si accendono
    const energia = new Map();
    let px = -1e4, py = -1e4, prima = 0, lucciola = 0;

    // come il campo di puntini della pagina: si ascolta sulla finestra,
    // conta solo dove sta il puntatore rispetto al riquadro
    const segui = (e) => {
      const r = box.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
    };
    addEventListener("pointermove", segui, { passive: true });
    addEventListener("pointerdown", segui, { passive: true });
    document.addEventListener("pointerleave", () => { px = py = -1e4; });

    const accendi = (c, r, e) => {
      const k = r * 10000 + c;
      if ((energia.get(k) || 0) < e) energia.set(k, e);
    };
    const cerchi = (W, H) => {
      const out = [];
      energia.forEach((e, k) => {
        const c = k % 10000, r = (k - c) / 10000;
        const x = c * G + G / 2, y = r * G + G / 2;
        if (x < W && y < H) out.push([x, y, G * 0.48 * e]);
      });
      return out;
    };

    return {
      passo(ora) {
        const dt = prima ? Math.min(64, ora - prima) : 16;
        prima = ora;
        const W = box.clientWidth, H = box.clientHeight;
        const cols = Math.ceil(W / G), righe = Math.ceil(H / G);
        const cala = Math.exp(-dt / 650);
        energia.forEach((e, k) => { const n = e * cala; if (n < 0.05) energia.delete(k); else energia.set(k, n); });

        if (px > -RAGGIO && py > -RAGGIO && px < W + RAGGIO && py < H + RAGGIO) {
          const c0 = Math.max(0, Math.floor((px - RAGGIO) / G)), c1 = Math.min(cols - 1, Math.floor((px + RAGGIO) / G));
          const r0 = Math.max(0, Math.floor((py - RAGGIO) / G)), r1 = Math.min(righe - 1, Math.floor((py + RAGGIO) / G));
          for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
            const d = Math.hypot(c * G + G / 2 - px, r * G + G / 2 - py);
            if (d < RAGGIO) { const f = 1 - d / RAGGIO; accendi(c, r, f * (2 - f)); }
          }
        }
        // anche senza mouse qualcuno si accende da solo
        if (ora > lucciola) {
          lucciola = ora + caso(50, 160);
          accendi(Math.floor(caso(0, cols)), Math.floor(caso(0, righe)), caso(0.6, 1));
        }
        return cerchi(W, H);
      },
      fermo() {
        const W = box.clientWidth, H = box.clientHeight;
        for (let i = 0; i < 60; i++) accendi(Math.floor(caso(0, W / G)), Math.floor(caso(0, H / G)), caso(0.5, 1));
        return cerchi(W, H);
      },
      via() { energia.clear(); prima = 0; },
    };
  }

  /* ---------- Studio Podcast: il dialogo ---------- */
  function dialogo(v, box) {
    // a destra del titolo: a sinistra c'è il velo che lo tiene leggibile
    const posti = [[0.62, 0.42], [0.85, 0.6]];
    const r = [0, 0];
    let chi = 0, insieme = false, cambio = 0;

    return {
      passo(ora) {
        const W = box.clientWidth, H = box.clientHeight;
        const R = Math.min(W, H) * 0.2;
        if (ora > cambio) {
          insieme = Math.random() < 0.18;          // ogni tanto parlano insieme
          if (!insieme) chi = 1 - chi;
          cambio = ora + caso(1400, 3000);
        }
        const t = ora / 1000;
        return posti.map(([fx, fy], i) => {
          const parla = insieme || i === chi;
          // la voce: sillabe, cioè due oscillazioni veloci sommate
          const voce = 0.72 + 0.16 * Math.abs(Math.sin(t * (7 + i * 1.3))) +
                       0.12 * Math.abs(Math.sin(t * (3.1 + i * 0.7) + i));
          const meta = parla ? voce : 0;
          r[i] += (meta - r[i]) * (meta > r[i] ? 0.16 : 0.09);
          return [W * fx, H * fy, R * r[i]];
        });
      },
      fermo() {
        const W = box.clientWidth, H = box.clientHeight, R = Math.min(W, H) * 0.2;
        return posti.map(([fx, fy]) => [W * fx, H * fy, R * 0.85]);
      },
      via() { r[0] = r[1] = 0; },
    };
  }

  const EFFETTI = { sparsi, diaframma, equalizzatore, puntatore, dialogo };

  video.forEach((v) => {
    // da telefono solo dove c'è la versione leggera
    if (stretto && !v.dataset.srcPiccolo) { v.remove(); return; }

    const box = v.parentElement;
    const fx = (EFFETTI[v.dataset.effetto] || sparsi)(v, box);
    let raf = null, voglio = false, riprova = 0;

    const disegna = (cerchi) => {
      let d = "";
      cerchi.forEach(([x, y, r]) => { if (r >= 0.5) d += cerchio(x, y, r); });
      v.style.clipPath = d ? 'path("' + d + '")' : VUOTO;
    };

    /* Chrome mette in pausa da solo un video muto che gli sembra
       invisibile, e con pochi pallini piccoli per lui lo è. Con `autoplay`
       lo fa ripartire da sé quando torna visibile; in più ci riproviamo. */
    function ciclo(ora) {
      disegna(fx.passo(ora));
      if (voglio && v.paused && ora > riprova) {
        riprova = ora + 300;
        v.play().catch(() => {});
      }
      raf = requestAnimationFrame(ciclo);
    }

    function entra() {
      if (!v.getAttribute("src")) {
        if (!fermo) v.autoplay = true;
        v.src = (stretto && v.dataset.srcPiccolo) || v.dataset.src;
      }
      if (fermo) {
        // movimento ridotto: un'immagine ferma, pallini fermi
        if (!v.style.clipPath || v.style.clipPath === VUOTO) disegna(fx.fermo());
        return;
      }
      voglio = true;
      v.play().catch(() => {});
      if (!raf) raf = requestAnimationFrame(ciclo);
    }

    function esce() {
      if (fermo) return;
      voglio = false;
      v.pause();
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      fx.via();
      v.style.clipPath = VUOTO;
    }

    new IntersectionObserver((voci) => {
      voci.forEach((e) => (e.isIntersecting ? entra() : esce()));
    }, { rootMargin: "200px 0px" }).observe(box);
  });
})();
