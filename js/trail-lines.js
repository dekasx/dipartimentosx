/* ============================================================
   DIPARTIMENTO SX — trail-lines.js

   Linee tratteggiate che nascono dal nulla mentre si muove il mouse.
   Non seguono il puntatore: ogni tanto, dopo un certo tratto di
   movimento, ne compare una **discosta** dal cursore, si disegna da
   sola in un paio di decimi di secondo, resta un attimo e svanisce.

   Nascono in coordinate di **pagina**, non di schermo: una volta create
   restano dove sono, e scorrendo se ne vanno su con il resto del
   contenuto invece di restare incollate al monitor.

   Stessa grafica delle linee fisse delle sezioni: un tracciato con i
   punti (`.dotpath`) rivelato da una maschera che si allunga. Il
   livello sta a z-index -1, quindi le linee passano dietro a testi e
   foto e non danno fastidio alla lettura.
   ============================================================ */

(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.querySelector("[data-trail]");
  if (!svg) return;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(pointer: fine)").matches) return;   // senza mouse non ha senso

  const TRAVEL = 170;      // px di movimento fra una linea e l'altra
  const MIN_GAP = 190;     // ms minimi fra due linee
  const MAX_LIVE = 12;     // quante ne restano a schermo al massimo
  const DRAW = 620;        // ms per disegnarla
  const HOLD = 900;        // ms di permanenza
  const FADE = 800;        // ms di dissolvenza

  const defs = document.createElementNS(NS, "defs");
  svg.appendChild(defs);

  let uid = 0;
  let live = 0;
  let travel = 0;
  let last = null;
  let lastSpawn = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  /* Due grammatiche, le stesse delle linee fisse del sito:
     spezzate a squadra e curve morbide. */
  // limiti in coordinate di pagina
  const docW = () => document.documentElement.clientWidth;
  const docH = () => Math.max(document.documentElement.scrollHeight, innerHeight);

  function makePath(x, y) {
    const w = docW(), h = docH();
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    if (Math.random() < 0.35) {
      // curva
      const len = rnd(150, 380) * pick([1, -1]);
      const bend = rnd(-90, 90);
      const x2 = clamp(x + len, 20, w - 20);
      const y2 = clamp(y + rnd(-70, 70), 20, h - 20);
      return `M${x.toFixed(0)} ${y.toFixed(0)} Q ${((x + x2) / 2).toFixed(0)} ${(y + bend).toFixed(0)}, ${x2.toFixed(0)} ${y2.toFixed(0)}`;
    }

    // spezzata a squadra
    let cx = x, cy = y;
    let d = `M${cx.toFixed(0)} ${cy.toFixed(0)}`;
    let horiz = Math.random() < 0.5;
    const segs = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < segs; i++) {
      const len = rnd(45, 165) * pick([1, -1]);
      if (horiz) cx = clamp(cx + len, 20, w - 20);
      else cy = clamp(cy + len, 20, h - 20);
      d += horiz ? ` H${cx.toFixed(0)}` : ` V${cy.toFixed(0)}`;
      horiz = !horiz;
    }
    return d;
  }

  function spawn(px, py) {
    if (live >= MAX_LIVE) return;

    // la linea non nasce sotto al cursore: si stacca in una direzione a caso
    const a = Math.random() * Math.PI * 2;
    const r = rnd(120, 340);
    const x = Math.max(30, Math.min(docW() - 30, px + Math.cos(a) * r));
    const y = Math.max(30, Math.min(docH() - 30, py + Math.sin(a) * r));

    const d = makePath(x, y);
    const id = "trail-" + ++uid;

    const mask = document.createElementNS(NS, "mask");
    mask.setAttribute("id", id);
    mask.setAttribute("maskUnits", "userSpaceOnUse");

    const rev = document.createElementNS(NS, "path");
    rev.setAttribute("d", d);
    rev.setAttribute("pathLength", "1");
    rev.setAttribute("stroke", "#fff");
    rev.setAttribute("stroke-width", "24");
    rev.setAttribute("fill", "none");
    rev.setAttribute("stroke-dasharray", "1 1");
    rev.setAttribute("stroke-dashoffset", "1");
    mask.appendChild(rev);
    defs.appendChild(mask);

    const g = document.createElementNS(NS, "g");
    g.setAttribute("mask", `url(#${id})`);
    const dots = document.createElementNS(NS, "path");
    dots.setAttribute("d", d);
    dots.setAttribute("class", "dotpath");
    g.appendChild(dots);
    svg.appendChild(g);
    live++;

    requestAnimationFrame(() => {
      rev.style.transition = `stroke-dashoffset ${DRAW}ms cubic-bezier(0.33, 1, 0.68, 1)`;
      rev.style.strokeDashoffset = "0";
    });

    setTimeout(() => {
      g.style.transition = `opacity ${FADE}ms linear`;
      g.style.opacity = "0";
    }, DRAW + HOLD);

    setTimeout(() => {
      g.remove();
      mask.remove();
      live--;
    }, DRAW + HOLD + FADE + 60);
  }

  addEventListener("pointermove", (e) => {
    const p = { x: e.clientX, y: e.clientY };
    if (last) travel += Math.hypot(p.x - last.x, p.y - last.y);
    last = p;

    const now = performance.now();
    if (travel < TRAVEL || now - lastSpawn < MIN_GAP) return;
    travel = 0;
    lastSpawn = now;
    // da coordinate di schermo a coordinate di pagina
    spawn(p.x + window.scrollX, p.y + window.scrollY);
  }, { passive: true });
})();
