/* ============================================================
   DIPARTIMENTO SX — corridor.js

   Porting in JS puro del componente React "ImageStreamHero".
   Due binari di card corrono dal fondo verso chi guarda: è la sola
   prospettiva a fare il lavoro che sembrano due animazioni, perché la
   proiezione scala insieme posizione e dimensione.

   Tre scelte, ognuna risolve un artefatto preciso:
   1. la profondità è scritta come *dimensione apparente* geometrica —
      ogni card è più grande della precedente di un rapporto costante;
   2. i binari si aprono forte all'inizio e poi tengono (`fan` > 1), così
      il nastro esce dal centro piatto, piega una volta sola e poi corre
      in diagonale;
   3. nessuna delle due estremità del ciclo è mai visibile: la card nasce
      *attraversando* l'asse (`railBirth` negativo), così la gola resta
      sempre coperta e la nuova card non ha bisogno di dissolvenza.

   Tutte le lunghezze sono in `cqw` (percentuale della larghezza del
   contenitore): il corridoio tiene le proporzioni a qualsiasi misura.
   ============================================================ */

(() => {
  "use strict";

  const PATH = {
    perspective: 30,
    cardWidth: 18,
    cardHeight: 25,
    cardRadius: 0.4,
    birthHeight: 2.6,
    exitHeight: 46,
    railBirth: -11,
    railExit: 44,
    fan: 3.3,
    turnBirth: 6,
    turnExit: 28,
    stops: 24
  };

  /** Campiona la curva una volta sola, così i keyframe CSS la ricalcano. */
  function keyframes(dir, name, p) {
    const steps = [];
    for (let s = 0; s <= p.stops; s++) {
      const u = s / p.stops;
      // geometrico nella dimensione apparente: card consecutive mantengono
      // un rapporto costante e il nastro resta compatto alle due estremità
      const scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
      const z = p.perspective * (1 - 1 / scale);
      const rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
      const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
      steps.push(
        `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,` +
        `${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`
      );
    }
    return `@keyframes ${name}{${steps.join("")}}`;
  }

  let uid = 0;

  function init(root) {
    // PHOTOS è dichiarato con `const` in data.js: sta nello scope globale
    // lessicale, non su window
    const images = (typeof PHOTOS !== "undefined" ? PHOTOS : []).slice();
    if (!images.length) return;

    const p = Object.assign({}, PATH);
    const cards = parseInt(root.dataset.cards, 10) || 9;
    const speed = parseFloat(root.dataset.speed) || 18;
    const axis = parseFloat(root.dataset.axis) || 55;

    const id = "co" + (++uid);
    const right = `${id}-r`;
    const left = `${id}-l`;
    const card = `${id}-c`;

    const style = document.createElement("style");
    style.textContent =
      keyframes(1, right, p) + keyframes(-1, left, p) +
      // in pausa, non disabilitata: ogni card è già lasciata a metà volo dal
      // suo delay negativo, quindi si congela come un fermo immagine finito
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused}}`;
    root.appendChild(style);

    const layer = document.createElement("div");
    layer.className = "corridor-cards";
    layer.setAttribute("aria-hidden", "true");
    layer.style.perspective = p.perspective + "cqw";
    layer.style.perspectiveOrigin = `50% ${axis}%`;

    const stage = document.createElement("div");
    stage.className = "corridor-stage";
    layer.appendChild(stage);

    [right, left].forEach((name) => {
      for (let i = 0; i < cards; i++) {
        // i due binari percorrono la stessa sequenza: il lato sinistro
        // specchia il destro a ogni profondità
        const img = images[i % images.length];
        const el = document.createElement("div");
        el.className = "corridor-card " + card;
        Object.assign(el.style, {
          left: "50%",
          top: axis + "%",
          width: p.cardWidth + "cqw",
          height: p.cardHeight + "cqw",
          marginLeft: -p.cardWidth / 2 + "cqw",
          marginTop: -p.cardHeight / 2 + "cqw",
          borderRadius: p.cardRadius + "cqw",
          animation: `${name} ${speed}s linear infinite`,
          // delay negativo: il corridoio è già pieno al primo fotogramma
          animationDelay: `${-(i * speed) / cards}s`,
          backfaceVisibility: "hidden"
        });
        if (img) {
          const im = document.createElement("img");
          im.src = img.src;
          im.alt = "";
          im.loading = "lazy";
          im.decoding = "async";
          im.draggable = false;
          el.appendChild(im);
        }
        stage.appendChild(el);
      }
    });

    root.insertBefore(layer, root.firstChild);
  }

  const start = () => document.querySelectorAll("[data-corridor]").forEach(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
