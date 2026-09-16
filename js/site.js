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
