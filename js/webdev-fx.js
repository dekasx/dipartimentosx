/* ============================================================
   DIPARTIMENTO SX — webdev-fx.js
   Effetti della pagina Web Development. È una pagina vetrina:
   deve dimostrare quello che dice, non descriverlo.

   1. Campo di puntini interattivo (lo stesso motivo grafico del sito)
   2. Titolo che si ricompone da caratteri casuali
   3. Card dei siti con inclinazione 3D e riflesso che segue il puntatore
   4. Numeri della pagina misurati dal vivo con la Performance API
   ============================================================ */

(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==================== 1. CAMPO DI PUNTINI ==================== */
  function dotField(canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const SPACING = 34;
    const BASE_R = 1.9;
    const REACH = 190;      // raggio d'azione del puntatore
    let dots = [];
    let w = 0, h = 0, dpr = 1;
    let px = -9999, py = -9999, tx = -9999, ty = -9999;
    let ripples = [];
    let raf = null, t0 = performance.now();
    let visible = true;

    function build() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const ox = (w - (cols - 1) * SPACING) / 2;
      const oy = (h - (rows - 1) * SPACING) / 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({ x: ox + i * SPACING, y: oy + j * SPACING });
        }
      }
    }

    function draw(now) {
      raf = null;
      const t = (now - t0) * 0.001;
      // il puntatore insegue con inerzia: il campo non scatta
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;

      ripples = ripples.filter((r) => now - r.t < 1400);
      ctx.clearRect(0, 0, w, h);

      const col = getComputedStyle(canvas).color;
      ctx.fillStyle = col;
      ctx.beginPath();

      for (let k = 0; k < dots.length; k++) {
        const d = dots[k];
        // onda lenta di fondo, così il campo respira anche da fermo
        const wave = Math.sin(d.x * 0.011 + d.y * 0.017 - t * 1.1);
        let r = BASE_R * (1 + wave * 0.32);
        let ox = 0, oy = 0;

        const dx = d.x - px, dy = d.y - py;
        const dist = Math.hypot(dx, dy);
        if (dist < REACH) {
          const f = 1 - dist / REACH;          // 0 lontano, 1 sotto al cursore
          const push = f * f * 34;
          ox = (dx / (dist || 1)) * push;
          oy = (dy / (dist || 1)) * push;
          r += f * f * 5.6;
        }

        for (let i = 0; i < ripples.length; i++) {
          const rp = ripples[i];
          const age = (now - rp.t) / 1400;
          const radius = age * 620;
          const band = Math.abs(Math.hypot(d.x - rp.x, d.y - rp.y) - radius);
          if (band < 70) {
            const g = (1 - band / 70) * (1 - age);
            r += g * 3.4;
          }
        }

        ctx.moveTo(d.x + ox + r, d.y + oy);
        ctx.arc(d.x + ox, d.y + oy, Math.max(0.2, r), 0, 6.283185);
      }
      ctx.globalAlpha = 0.62;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (visible) raf = requestAnimationFrame(draw);
    }

    function kick() { if (!raf && visible) raf = requestAnimationFrame(draw); }

    build();
    addEventListener("resize", () => { build(); kick(); });

    // Si ascolta sulla finestra, non sul contenitore: la nav e il logo sono
    // `position: fixed` fuori dall'hero, quindi passandoci sopra il puntatore
    // "usciva" dal contenitore e il campo si spegneva. Qui conta solo dove sta
    // il puntatore rispetto al canvas, non su quale elemento si trovi.
    const inside = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const m = 40;   // un margine di tolleranza: il campo non si spegne di scatto
      return (x > -m && y > -m && x < r.width + m && y < r.height + m) ? [x, y] : null;
    };

    addEventListener("pointermove", (e) => {
      const p = inside(e);
      if (p) { tx = p[0]; ty = p[1]; }
      else { tx = -9999; ty = -9999; }
    }, { passive: true });

    addEventListener("pointerdown", (e) => {
      const p = inside(e);
      if (p) ripples.push({ x: p[0], y: p[1], t: performance.now() });
    }, { passive: true });

    document.addEventListener("pointerleave", () => { tx = -9999; ty = -9999; });

    if (reduce) { draw(performance.now()); visible = false; return; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        visible = es[0].isIntersecting;
        if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = null; }
      }, { threshold: 0.02 }).observe(canvas);
    }
    kick();
  }

  /* ==================== 2. TITOLO CHE SI RICOMPONE ==================== */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\<>[]{}*#+=—01";

  function scramble(el) {
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!nodes.length || reduce) return;

    const targets = nodes.map((n) => n.textContent);
    let frame = 0;
    const total = 34;

    function step() {
      let done = true;
      nodes.forEach((n, i) => {
        const target = targets[i];
        // ogni carattere si ferma un po' dopo il precedente
        let out = "";
        for (let c = 0; c < target.length; c++) {
          const settle = 6 + c * 1.6;
          if (frame > settle) out += target[c];
          else if (target[c] === " ") out += " ";
          else { out += GLYPHS[(Math.random() * GLYPHS.length) | 0]; done = false; }
        }
        n.textContent = out;
      });
      frame++;
      if (!done && frame < total + targets[0].length * 2) requestAnimationFrame(step);
      else nodes.forEach((n, i) => { n.textContent = targets[i]; });
    }
    step();
  }

  /* ==================== 3. CARD CON INCLINAZIONE ==================== */
  function tilt(card) {
    if (reduce || matchMedia("(pointer: coarse)").matches) return;
    const shot = card.querySelector(".site-shot");
    if (!shot) return;

    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      shot.style.transform = `perspective(700px) rotateY(${x * 11}deg) rotateX(${-y * 11}deg) scale(1.02)`;
      shot.style.setProperty("--gx", (x + 0.5) * 100 + "%");
      shot.style.setProperty("--gy", (y + 0.5) * 100 + "%");
    });
    card.addEventListener("pointerleave", () => { shot.style.transform = ""; });
  }

  /* ==================== 4. NUMERI DELLA PAGINA, MISURATI ==================== */
  function stats(root) {
    const read = () => {
      const nav = performance.getEntriesByType("navigation")[0];
      const res = performance.getEntriesByType("resource");
      const bytes = res.reduce((a, r) => a + (r.transferSize || 0), 0) +
                    (nav ? nav.transferSize || 0 : 0);
      const paint = performance.getEntriesByName("first-contentful-paint")[0];
      return {
        paint: paint ? Math.round(paint.startTime) : (nav ? Math.round(nav.domContentLoadedEventEnd) : 0),
        weight: Math.max(1, Math.round(bytes / 1024)),
        requests: res.length + 1,
        nodes: document.getElementsByTagName("*").length,
        frameworks: 0
      };
    };

    const run = () => {
      const v = read();
      root.querySelectorAll("[data-stat]").forEach((el) => {
        const key = el.dataset.stat;
        const to = v[key] !== undefined ? v[key] : 0;
        if (reduce) { el.textContent = to.toLocaleString("en"); return; }
        const dur = 900;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * e).toLocaleString("en");
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        if (es[0].isIntersecting) { io.disconnect(); run(); }
      }, { threshold: 0.35 });
      io.observe(root);
    } else run();
  }

  /* ==================== AVVIO ==================== */
  function start() {
    document.querySelectorAll("[data-dotfield]").forEach(dotField);
    document.querySelectorAll("[data-scramble]").forEach(scramble);
    document.querySelectorAll(".site-card").forEach(tilt);
    document.querySelectorAll("[data-stats]").forEach(stats);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

/* ==================== COLONNA DI PUNTINI CHE LAMPEGGIA ====================
   "Come li costruiamo": la linea sotto al titolo è una fila di puntini, uno
   ogni 11px come nel tratteggio del resto del sito. Quanti ne servono lo
   decide l'altezza della colonna; a ogni battito una manciata a caso si
   spegne o si riaccende di colpo, senza dissolvenza, così la linea resta
   leggibile ma non è mai ferma. Fuori dallo schermo non lavora. */
(() => {
  "use strict";
  const cols = [...document.querySelectorAll("[data-dotcol]")];
  if (!cols.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PASSO = 11;
  const SPENTI = 0.3;       // quota di puntini spenti, più o meno, in ogni momento
  const BATTITO = 90;       // ms

  function build(col) {
    const n = Math.max(0, Math.floor(col.getBoundingClientRect().height / PASSO));
    if (col.childElementCount === n) return;
    col.textContent = "";
    for (let i = 0; i < n; i++) col.appendChild(document.createElement("i"));
  }

  const visibili = new Set();
  function battito() {
    visibili.forEach((col) => {
      const dots = col.children, n = dots.length;
      if (!n) return;
      const k = Math.max(1, Math.round(n * 0.08));
      for (let j = 0; j < k; j++) {
        dots[(Math.random() * n) | 0].classList.toggle("is-off", Math.random() < SPENTI);
      }
    });
  }

  const all = () => cols.forEach(build);
  let t = null;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(all, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  all();

  if (reduce) return;       // con "riduci animazioni" la linea resta ferma e piena
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) visibili.add(en.target); else visibili.delete(en.target); });
    }).observe(cols[0]);
    cols.slice(1).forEach((c) => visibili.add(c));
  } else {
    cols.forEach((c) => visibili.add(c));
  }
  setInterval(battito, BATTITO);
})();
