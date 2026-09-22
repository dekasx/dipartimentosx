/* ============================================================
   DIPARTIMENTO SX — site.js
   Shared behaviour for every page: custom cursor, footer logo,
   year, and section links that also work from the sub-pages.
   ============================================================ */

(() => {
  "use strict";

  const body = document.body;
  const isHome = !!document.getElementById("servicesGrid");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------- custom "+" cursor -------- */
  const cursor = document.getElementById("cursor");
  if (cursor && matchMedia("(pointer: fine)").matches) {
    addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    }, { passive: true });

    let rot = 0;
    addEventListener("mousedown", () => {
      rot += 45;
      cursor.style.setProperty("--rot", rot + "deg");
    });
    addEventListener("mouseover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, .wheel-item, .reel-slide"));
    });
  }

  /* -------- the fixed logo would sit on top of the footer text -------- */
  const footer = document.querySelector(".site-footer");
  if (footer && "IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((en) => body.classList.toggle("at-footer", en.isIntersecting)),
      { threshold: 0.02 }
    ).observe(footer);
  }

  /* -------- current year in the footer -------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* -------- section links from the sub-pages -------- */
  // on the home page home.js handles these (it knows about the pinned section)
  if (!isHome) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-scroll]");
      if (!a) return;
      e.preventDefault();
      const id = a.dataset.scroll;
      const target = document.getElementById(id);
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY,
          behavior: reduceMotion ? "auto" : "smooth"
        });
      } else {
        location.href = id === "home" ? "index.html" : "index.html#" + id;
      }
    });
  }
})();

/* contact: con "riduci animazioni" il video di sfondo resta fermo sul poster */
(() => {
  const v = document.querySelector(".contact-bg");
  if (v && matchMedia("(prefers-reduced-motion: reduce)").matches) {
    v.removeAttribute("autoplay");
    v.pause();
  }
})();

/* Studio Fotografico: il testo accanto all'elenco "I nostri servizi" è alto
   esattamente quanto l'elenco, dal primo all'ultimo tratteggio. Il carattere
   è il più grande che ci sta: se il testo non entra, scende finché entra.
   Da telefono le due parti stanno una sotto l'altra e non serve. */
(() => {
  const pairs = [...document.querySelectorAll(".svc-pair--rev")];
  if (!pairs.length) return;
  const MIN = 12;

  function fit(pair) {
    const list = pair.querySelector(".svc-facts");
    const intro = pair.querySelector(".svc-pair-intro");
    if (!list || !intro) return;
    intro.style.height = "";
    intro.style.fontSize = "";
    if (matchMedia("(max-width: 820px)").matches) return;

    const H = list.getBoundingClientRect().height;
    // la grandezza di partenza è quella delle voci dell'elenco: stessa per tutti
    const li = list.querySelector("li");
    const MAX = li ? parseFloat(getComputedStyle(li).fontSize) : 26;
    // altezza vera del testo: non `scrollHeight`, che conta anche il margine
    // negativo sotto l'ultimo paragrafo e sbaglia di un terzo di riga
    const alto = (px) => { intro.style.fontSize = px + "px"; return intro.getBoundingClientRect().height; };

    if (alto(MAX) <= H) {                     // ci sta già alla grandezza dell'elenco
      intro.style.fontSize = MAX + "px";
      intro.style.height = H + "px";
      return;
    }
    let lo = MIN, hi = MAX;
    for (let i = 0; i < 14; i++) {            // ricerca per metà: 14 passi bastano al decimo di pixel
      const mid = (lo + hi) / 2;
      if (alto(mid) <= H) lo = mid; else hi = mid;
    }
    /* Il testo va a capo a scatti: il valore trovato sta proprio sul bordo
       oltre il quale scende una riga intera. Arrotondarlo per eccesso anche
       di un centesimo lo faceva sbordare di 20px, quindi per difetto e con un
       quarto di pixel di margine, e un ultimo controllo che scende finché ci sta. */
    let px = Math.floor(lo * 100) / 100 - 0.25;
    while (px > MIN && alto(px) > H) px -= 0.5;
    intro.style.fontSize = px.toFixed(2) + "px";
    intro.style.height = H + "px";
  }

  const all = () => pairs.forEach(fit);
  let t = null;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(all, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  all();
})();

/* Rotazione del telefono. Su iPhone, girando da verticale a orizzontale e
   ritorno, a volte gli elementi fissi (il pannello del progetto, l'intestazione)
   restano ancorati dove stavano in orizzontale e tutta la pagina appare
   spostata a destra finché non si gira di nuovo. A rotazione finita si
   costringe WebKit a rifare l'impaginazione da zero: la pagina viene tolta e
   rimessa nello stesso istante, prima che si disegni, quindi non si vede. */
(() => {
  if (!matchMedia("(pointer: coarse)").matches) return;
  const orientamento = () => (innerWidth > innerHeight ? "o" : "v");
  let ultimo = orientamento(), t = null;

  function rifai() {
    const de = document.documentElement;
    const y = window.scrollY;
    /* le aree scorrevoli (ruota, pannello, caroselli) tengono la loro
       posizione: in Chrome resta da sé, in WebKit non è garantito */
    const posizioni = [...document.querySelectorAll("body *")]
      .filter((el) => el.scrollTop || el.scrollLeft)
      .map((el) => [el, el.scrollTop, el.scrollLeft]);
    de.style.display = "none";
    void de.offsetHeight;                   // impaginazione forzata
    de.style.display = "";
    void de.offsetHeight;
    // pannello e ruota scorrono solo in verticale: di lato sempre a zero
    const soloVerticale = (el) => el.id === "projectScroll" || el.id === "wheel";
    posizioni.forEach(([el, top, left]) => {
      el.scrollTop = top;
      el.scrollLeft = soloVerticale(el) ? 0 : left;
    });
    window.scrollTo(0, y);                  // mai scostati di lato
    document.body.scrollLeft = 0;
  }

  const girato = () => {
    const ora = orientamento();
    if (ora === ultimo) return;
    ultimo = ora;
    clearTimeout(t);
    // due passate: iOS a volte finisce di sistemare la rotazione in ritardo
    t = setTimeout(() => { rifai(); setTimeout(rifai, 350); }, 120);
  };
  addEventListener("resize", girato, { passive: true });
  addEventListener("orientationchange", girato, { passive: true });
})();

/* Diagnosi: aprendo una pagina con ?diagnosi nell'indirizzo compare in alto
   un riquadro con le misure che il browser sta usando, aggiornate dal vivo.
   Serve a capire da uno screenshot cosa succede su un telefono vero. */
(() => {
  if (!/[?&]diagnosi\b/.test(location.search)) return;
  const box = document.createElement("pre");
  box.style.cssText = "position:fixed;left:6px;top:6px;z-index:99999;margin:0;padding:6px 8px;" +
    "background:rgba(0,0,0,.82);color:#9f9;font:11px/1.35 ui-monospace,monospace;" +
    "pointer-events:none;border-radius:4px;white-space:pre";
  document.documentElement.appendChild(box);
  const r = (el) => {
    if (!el) return "—";
    const b = el.getBoundingClientRect();
    return Math.round(b.left) + "→" + Math.round(b.right) + " (w" + Math.round(b.width) + ")";
  };
  const scriviMisure = () => {
    const vv = window.visualViewport;
    const pan = document.querySelector(".panel.is-open");
    const sc = document.getElementById("projectScroll");
    const card = [...document.querySelectorAll(".project-card")].find((c) => {
      const b = c.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight;
    });
    box.textContent = [
      "inner      " + innerWidth + "×" + innerHeight,
      "clientW    " + document.documentElement.clientWidth + "  scrollW " + document.documentElement.scrollWidth,
      "scrollX/Y  " + Math.round(scrollX) + " / " + Math.round(scrollY),
      vv ? "visual     " + Math.round(vv.width) + "×" + Math.round(vv.height) +
           "  off " + Math.round(vv.offsetLeft) + "," + Math.round(vv.offsetTop) +
           "  scala " + vv.scale.toFixed(2) : "visual     —",
      "screen     " + screen.width + "×" + screen.height + "  " + ((screen.orientation && screen.orientation.type) || ""),
      "body       " + r(document.body) + (document.body.classList.contains("is-locked") ? "  bloccato" : ""),
      "pannello   " + r(pan),
      "scroller   " + (sc ? "sL " + sc.scrollLeft + "  " + r(sc) : "—"),
      "scheda     " + r(card)
    ].join("\n");
  };
  ["resize", "scroll", "orientationchange"].forEach((e) => addEventListener(e, scriviMisure, { passive: true }));
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", scriviMisure);
    visualViewport.addEventListener("scroll", scriviMisure);
  }
  setInterval(scriviMisure, 500);
  scriviMisure();
})();
