/* ============================================================
   DIPARTIMENTO SX — scroll-fx.js
   Motore di scroll condiviso da home e pagine servizio:
   linee tratteggiate guidate dallo scroll, parallasse,
   comparsa dei testi. Le pagine registrano lavoro extra con
   SXFX.add(painter, measurer).
   ============================================================ */

window.SXFX = (() => {
  "use strict";

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vh = () => window.innerHeight;

  const painters = [];
  const measurers = [];

  /* ---------- linee tratteggiate ----------
     I valori sono `rect.top` del contenitore espresso in schermate: la linea
     si disegna mentre la sezione sale in posizione e si completa quando è a
     filo. Alzare REVEAL_START = tratto più lento. */
  const REVEAL_START = 1.35;
  const REVEAL_STAGGER = 0.2;
  const REVEAL_END = 0;

  let reveals = [];

  function collectReveals() {
    // quelle in cima si disegnano al caricamento (css), non con lo scroll
    reveals = [...document.querySelectorAll('.conn:not([data-draw="load"]) .reveal')].map((path) => {
      const svg = path.closest(".conn");
      const i = [...svg.querySelectorAll(".reveal")].indexOf(path);
      const from = path.dataset.from !== undefined
        ? parseFloat(path.dataset.from)
        : REVEAL_START - i * REVEAL_STAGGER;
      const to = path.dataset.to !== undefined ? parseFloat(path.dataset.to) : REVEAL_END;
      return { path, host: svg.closest("[data-fx-host]") || svg.parentElement, from, to };
    });
  }

  function paintReveals() {
    const h = vh();
    reveals.forEach((r) => {
      if (!r.host) return;
      const rect = r.host.getBoundingClientRect();
      if (rect.bottom < -h || rect.top > 2 * h) return;
      const p = clamp((r.from * h - rect.top) / ((r.from - r.to) * h));
      r.path.style.strokeDashoffset = (1 - p).toFixed(4);
    });
  }

  /* ---------- parallasse ---------- */
  let parallaxItems = [];
  let driftItems = [];

  function collectParallax() {
    parallaxItems = [...document.querySelectorAll("[data-parallax]")];
    driftItems = [...document.querySelectorAll("[data-drift]")];
  }

  function paintParallax() {
    if (reduceMotion) return;
    const h = vh();

    parallaxItems.forEach((fig) => {
      const r = fig.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      const rel = (r.top + r.height / 2 - h / 2) / h;
      const amount = parseFloat(fig.dataset.parallax) || 0.12;
      const max = r.height * 0.075;
      const py = clamp(-rel * r.height * amount, -max, max);
      const img = fig.querySelector("img");
      if (img) img.style.setProperty("--py", py.toFixed(1) + "px");
    });

    driftItems.forEach((fig) => {
      const r = fig.getBoundingClientRect();
      if (r.bottom < -300 || r.top > h + 300) return;
      const rel = (r.top + r.height / 2 - h / 2) / h;
      const d = parseFloat(fig.dataset.drift) || 0;
      fig.style.transform = `translate3d(0, ${(-rel * d).toFixed(1)}px, 0)`;
    });
  }

  /* ---------- comparsa dei testi ---------- */
  function observeAnim() {
    const targets = document.querySelectorAll("[data-anim]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- loop ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      paintReveals();
      paintParallax();
      painters.forEach((f) => f(y));
    });
  }

  function refresh() {
    collectReveals();
    collectParallax();
    measurers.forEach((f) => f());
    onScroll();
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", refresh);
  addEventListener("load", refresh);

  document.addEventListener("DOMContentLoaded", () => { observeAnim(); refresh(); });
  if (document.readyState !== "loading") { observeAnim(); refresh(); }

  return {
    add(paint, measure) {
      if (paint) painters.push(paint);
      if (measure) measurers.push(measure);
    },
    refresh,
    onScroll,
    clamp,
    reduceMotion,
    vh
  };
})();

/* ==================== LE LINEE NON PASSANO SUI TESTI ====================
   Le linee tratteggiate sono disegnate su una griglia fissa (1920×1080) che
   viene stirata sulla sezione: dove cade il testo dipende dalla misura dello
   schermo, e da telefono finivano regolarmente sopra le parole.

   Qui misuro dove stanno davvero le scritte dentro la sezione e le ritaglio
   via dal disegno con una maschera: la linea si interrompe prima della parola
   e riprende dopo. Si ricalcola quando cambia la misura della finestra. */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const TESTI = "h1,h2,h3,h4,p,li,figcaption,blockquote,.sitem,.svc-caption,.site-name,.site-meta,.stat,.player-title,.player-sub,.foot-nav a,.marquee-track";
  const conns = [...document.querySelectorAll(".conn")];
  if (!conns.length) return;
  let uid = 0;

  function maschera(svg) {
    const host = svg.parentElement;
    const sr = svg.getBoundingClientRect();
    if (!host || !sr.width || !sr.height) return;

    // dal pixel dello schermo alle coordinate del disegno (viewBox 1920×1080)
    const kx = 1920 / sr.width, ky = 1080 / sr.height;
    const padX = 10 * kx, padY = 8 * ky;

    let defs = svg.querySelector("defs");
    if (!defs) { defs = document.createElementNS(NS, "defs"); svg.insertBefore(defs, svg.firstChild); }

    let id = svg.dataset.textmask;
    if (!id) { id = "tm" + (++uid); svg.dataset.textmask = id; }
    let mask = svg.querySelector("#" + id);
    if (!mask) {
      mask = document.createElementNS(NS, "mask");
      mask.setAttribute("id", id);
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      defs.appendChild(mask);
    }
    mask.textContent = "";

    const bianco = document.createElementNS(NS, "rect");   // bianco = si vede
    bianco.setAttribute("x", "0"); bianco.setAttribute("y", "0");
    bianco.setAttribute("width", "1920"); bianco.setAttribute("height", "1080");
    bianco.setAttribute("fill", "#fff");
    mask.appendChild(bianco);

    host.querySelectorAll(TESTI).forEach((el) => {
      if (svg.contains(el) || !el.textContent.trim()) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const buco = document.createElementNS(NS, "rect");   // nero = si nasconde
      buco.setAttribute("x", ((r.left - sr.left) * kx - padX).toFixed(1));
      buco.setAttribute("y", ((r.top - sr.top) * ky - padY).toFixed(1));
      buco.setAttribute("width", (r.width * kx + padX * 2).toFixed(1));
      buco.setAttribute("height", (r.height * ky + padY * 2).toFixed(1));
      buco.setAttribute("fill", "#000");
      mask.appendChild(buco);
    });

    // i gruppi hanno già la loro maschera (quella che disegna la linea allo
    // scroll): li avvolgo in un gruppo in più, così le due si sommano
    let wrap = svg.querySelector("g[data-textmask]");
    if (!wrap) {
      wrap = document.createElementNS(NS, "g");
      wrap.setAttribute("data-textmask", "");
      [...svg.children].forEach((n) => { if (n !== defs) wrap.appendChild(n); });
      svg.appendChild(wrap);
    }
    wrap.setAttribute("mask", "url(#" + id + ")");
  }

  const tutte = () => conns.forEach(maschera);
  let t = null;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(tutte, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tutte);
  // dopo che gli altri script hanno finito di impaginare (vedi site.js)
  setTimeout(tutte, 400);
  tutte();
})();
