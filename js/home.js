/* ============================================================
   DIPARTIMENTO SX — home.js

   Solo la home. Gli effetti condivisi (linee tratteggiate, parallasse,
   comparsa dei testi) stanno in scroll-fx.js.

   1. Colore di sfondo interpolato fra una sezione e l'altra.
   2. Animazione dei puntini della sezione servizi, guidata dallo scroll.
   3. Carosello lavori e carosello fotografie.
   Il catalogo sta su catalogue.html, non più qui.
   ============================================================ */

(() => {
  "use strict";

  const body = document.body;
  const root = document.documentElement;
  const el = (id) => document.getElementById(id);
  const clamp = SXFX.clamp;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const reduceMotion = SXFX.reduceMotion;
  const vh = SXFX.vh;

  /* ==================== COLOURS ==================== */
  const hex2rgb = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgb2css = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  /* ==================== SECTIONS ==================== */
  const sections = [...document.querySelectorAll(".sec[data-bg]")];
  sections.forEach((s) => {
    s.style.setProperty("--fg", s.dataset.fg || "#ffffff");
    s._bg = hex2rgb(s.dataset.bg);
  });

  let metrics = [];

  function measure() {
    // da mobile alcune sezioni sono nascoste (display:none): vanno escluse,
    // altrimenti avrebbero altezza e posizione zero e romperebbero il
    // calcolo del colore di sfondo
    metrics = sections
      .filter((s) => s.offsetParent !== null || s.offsetHeight > 0)
      .map((s) => {
        const top = s.getBoundingClientRect().top + window.scrollY;
        return { el: s, top, h: s.offsetHeight, center: top + s.offsetHeight / 2, bg: s._bg };
      });
  }

  /* Il colore vira attorno al CONFINE fra due sezioni, con una finestra
     centrata sul confine stesso: metà prima e metà dopo. Così la funzione è
     continua — prima il viraggio partiva solo DOPO il confine e i primi 40%
     del cambio venivano applicati di colpo: era quello lo scatto. */
  const BG_ZONE = 0.9;   // ampiezza totale del viraggio, in schermate

  function paintBackground(y) {
    if (!metrics.length) return;
    const h = vh();
    const c = y + h / 2;
    const half = (BG_ZONE * h) / 2;

    let i = 0;
    while (i < metrics.length - 1 && c >= metrics[i + 1].top) i++;

    const cur = metrics[i];
    const prev = metrics[i - 1];
    const next = metrics[i + 1];

    const dFromEntry = c - cur.top;                     // >= 0
    const dToExit = next ? next.top - c : Infinity;     // > 0

    let col;
    if (prev && dFromEntry < half) {
      // appena dentro la sezione: seconda metà del viraggio precedente
      col = mix(prev.bg, cur.bg, smooth(0.5 + 0.5 * (dFromEntry / half)));
    } else if (next && dToExit < half) {
      // in avvicinamento al confine successivo: prima metà del viraggio
      col = mix(cur.bg, next.bg, smooth(0.5 - 0.5 * (dToExit / half)));
    } else {
      col = cur.bg;
    }

    root.style.setProperty("--bg", rgb2css(col));
  }

  /* ==================== SECTION 3 — DOTS + SERVICES ==================== */
  const servicesSec = el("services");
  const grid = el("servicesGrid");

  SERVICES.forEach((s, i) => {
    const line = document.createElement("div");
    line.className = "dline";
    line.appendChild(document.createElement("i"));
    grid.appendChild(line);

    const row = document.createElement("div");
    row.className = "srow";
    row.dataset.align = s.align || "start";

    const a = document.createElement("a");
    a.className = "sitem";
    // ogni voce porta alla pagina dedicata del servizio: è lì che sta
    // il testo lungo che Google legge
    a.href = s.target + ".html";
    a.textContent = s.name;
    a.style.setProperty("--i", i);
    row.appendChild(a);

    // il "+" serve solo da mobile, dove la voce apre il pannello invece
    // di portare alla pagina (su desktop il CSS lo nasconde)
    const plus = document.createElement("span");
    plus.className = "splus";
    plus.setAttribute("aria-hidden", "true");
    row.appendChild(plus);

    grid.appendChild(row);
    grid.appendChild(buildPanel(s, row));
  });
  const lastLine = document.createElement("div");
  lastLine.className = "dline";
  lastLine.appendChild(document.createElement("i"));
  grid.appendChild(lastLine);

  /* Il pannello mobile riusa quello che sta già nella sezione-vetrina
     corrispondente: un testo, una foto e il link alla pagina. Così non c'è
     un secondo testo da tenere aggiornato. */
  function buildPanel(s, row) {
    const wrap = document.createElement("div");
    wrap.className = "spanel";
    wrap.id = "sp-" + s.target;

    const inner = document.createElement("div");
    inner.className = "spanel-inner";
    wrap.appendChild(inner);

    const sec = document.getElementById(s.target);
    const copy = sec && sec.querySelector(".sec-copy");
    const shot = sec && sec.querySelector("figure img");

    if (copy) {
      const p = document.createElement("p");
      p.className = "spanel-text";
      p.textContent = copy.textContent.trim();
      inner.appendChild(p);
    } else if (s.blurb) {
      const p = document.createElement("p");
      p.className = "spanel-text";
      p.textContent = s.blurb;
      inner.appendChild(p);
    }

    // solo la foto della sezione: dove non c'è (web e fotografia) il pannello
    // resta di solo testo, invece di pescare una foto a caso dal carosello
    const src = shot ? shot.getAttribute("src") : null;
    if (src) {
      const fig = document.createElement("figure");
      fig.className = "spanel-shot";
      const img = document.createElement("img");
      img.src = src;
      img.alt = shot ? shot.alt : "";
      img.loading = "lazy";
      img.decoding = "async";
      fig.appendChild(img);
      inner.appendChild(fig);
    }

    const more = document.createElement("a");
    more.className = "spanel-more";
    more.href = s.target + ".html";
    more.textContent = s.name;      // il nome del servizio, cliccabile
    inner.appendChild(more);

    row.setAttribute("aria-controls", wrap.id);
    row.setAttribute("aria-expanded", "false");
    // il tocco vale su tutta la riga, "+" compreso; il preventDefault qui
    // annulla anche la navigazione del link, che è dentro la riga
    row.addEventListener("click", (e) => {
      if (!isMobile()) return;      // su desktop la voce resta un link normale
      e.preventDefault();
      toggleRow(row);
    });

    return wrap;
  }

  const isMobile = () => matchMedia("(max-width: 820px)").matches;

  function toggleRow(row) {
    const open = row.classList.contains("is-open");
    // una alla volta: la pagina resta corta
    grid.querySelectorAll(".srow.is-open").forEach((r) => {
      r.classList.remove("is-open");
      r.setAttribute("aria-expanded", "false");
    });
    if (!open) {
      row.classList.add("is-open");
      row.setAttribute("aria-expanded", "true");
    }
  }

  const dotLines = [...grid.querySelectorAll(".dline i")];
  const serviceItems = [...grid.querySelectorAll(".sitem")];
  let rowH = 96;

  function measureRows() {
    const r = grid.querySelector(".srow");
    if (r) rowH = r.getBoundingClientRect().height || 96;
  }

  const DOT_MIN = 5;
  const DOTS_END = 0.40;
  const TEXT_START = 0.30;
  const TEXT_SPAN = 0.30;
  const TEXT_STAGGER = 0.07;

  function servicesRange() {
    const m = metrics.find((x) => x.el === servicesSec);
    if (!m) return { start: 0, end: 0, len: 1 };
    const len = Math.max(1, m.h - vh());
    return { start: m.top, end: m.top + len, len };
  }

  function paintServices(y) {
    // su mobile la sezione è una fisarmonica, non una scena bloccata:
    // i puntini restano piccoli e le voci sempre visibili
    if (isMobile()) {
      dotLines.forEach((i) => i.style.setProperty("--dot", DOT_MIN + "px"));
      serviceItems.forEach((a) => {
        a.style.setProperty("--slide", "0vw");
        a.style.setProperty("--op", "1");
        a.style.pointerEvents = "auto";
      });
      return;
    }

    const r = servicesRange();
    const p = clamp((y - r.start) / r.len);

    const size = lerp(rowH, DOT_MIN, easeOut(clamp(p / DOTS_END)));
    dotLines.forEach((i) => i.style.setProperty("--dot", size.toFixed(2) + "px"));

    serviceItems.forEach((a, i) => {
      const e = easeOut(clamp((p - TEXT_START - i * TEXT_STAGGER) / TEXT_SPAN));
      a.style.setProperty("--slide", ((1 - e) * 62).toFixed(2) + "vw");
      a.style.setProperty("--op", e.toFixed(3));
      a.style.pointerEvents = e > 0.6 ? "auto" : "none";
    });
  }

    /* ==================== ACTIVE NAV ==================== */
  const navLinks = [...document.querySelectorAll(".main-nav a[data-scroll]")];
  function paintNav(y) {
    const c = y + vh() / 2;
    let active = null;
    metrics.forEach((m) => { if (c >= m.top && c < m.top + m.h) active = m.el.id; });
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.scroll === active));
  }

  /* ==================== AGGANCIO AL MOTORE CONDIVISO ==================== */
  SXFX.add(
    (y) => { paintBackground(y); paintServices(y); paintNav(y); },
    () => { measure(); measureRows(); }
  );

  /* ==================== PASSAGGIO HERO ↔ LAVORI ====================
     Un gesto = una sezione, come premere la freccia giù. Il gesto viene
     riconosciuto una volta sola: mentre il salto è in corso le rotellate
     rimaste (la coda dell'inerzia del trackpad) vengono ignorate, così la
     pagina non scivola oltre, ma **non allungano il blocco**. C'è anche un
     tetto massimo: comunque vada si sblocca entro 1,2 secondi, così non può
     restare incastrato come succedeva prima. */
  const heroSec = el("home");
  const workSec = el("work");

  let jumping = false;
  let quietT = null;
  let hardT = null;

  function releaseJump() {
    jumping = false;
    clearTimeout(quietT); clearTimeout(hardT);
    quietT = hardT = null;
  }

  function doJump(to) {
    jumping = true;
    window.scrollTo({ top: to, behavior: reduceMotion ? "auto" : "smooth" });
    clearTimeout(hardT);
    hardT = setTimeout(releaseJump, 1200);   // tetto: non si incastra mai
  }

  // chiamata a ogni evento inghiottito: sblocca quando smettono di arrivare
  function afterQuiet() {
    clearTimeout(quietT);
    quietT = setTimeout(releaseJump, 140);
  }

  // dove siamo: 'hero', 'work' o null (fuori dalla zona che ci interessa)
  function zone() {
    if (!heroSec || !workSec) return null;
    const y = window.scrollY;
    const edge = workSec.getBoundingClientRect().top + y;
    if (y < edge - 4) return { at: "hero", edge };
    if (y <= edge + 8) return { at: "work", edge };
    return null;
  }

  if (heroSec && workSec) {
    addEventListener("wheel", (e) => {
      if (lbOpen) return;                               // anteprima aperta: la pagina sta ferma
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || !e.deltaY) return;

      if (jumping) { e.preventDefault(); afterQuiet(); return; }

      const z = zone();
      if (!z) return;                                   // resto della pagina: libera
      const dir = Math.sign(e.deltaY);
      if (z.at === "hero" && dir < 0) return;           // già in cima
      if (z.at === "work" && dir > 0) return;           // si prosegue normalmente

      e.preventDefault();
      afterQuiet();
      doJump(z.at === "hero" ? z.edge : 0);
    }, { passive: false });

    /* Le stesse due sezioni rispondono anche alla tastiera: freccia,
       pagina su/giù e barra spaziatrice fanno lo stesso salto. */
    const GIU = ["ArrowDown", "PageDown", " ", "Spacebar"];
    const SU = ["ArrowUp", "PageUp"];
    addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (lbOpen) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      const giu = GIU.includes(e.key);
      const su = SU.includes(e.key);
      if (!giu && !su) return;
      if (jumping) { e.preventDefault(); return; }

      const z = zone();
      if (!z) return;
      if (z.at === "hero" && su) return;
      if (z.at === "work" && giu) return;

      e.preventDefault();
      doJump(z.at === "hero" ? z.edge : 0);
    });
  }

  /* ==================== SCROLL TO SECTION ==================== */
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) { location.href = "index.html#" + id; return; }

    let top = target.getBoundingClientRect().top + window.scrollY;

    // the services section is pinned: land where the animation has played out
    if (id === "services") top += Math.max(0, target.offsetHeight - vh()) * 0.95;

    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", "#" + id);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll]");
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.scroll;
    if (id === "home") {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", location.pathname);
    } else {
      requestAnimationFrame(() => scrollToSection(id));
    }
  });

  /* ==================== SECTION 2 — SELECTED WORK ==================== */
  const reelTrack = el("reelTrack");
  const reelDots = el("reelDots");
  const reelName = el("reelName");
  const reelSound = el("reelSound");
  /* L'ordine e i video li decide REEL in data.js. Ogni voce diventa un
     progetto con un video solo, così il resto del codice non deve sapere
     degli episodi. */
  const bySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));
  const reelSource = typeof REEL !== "undefined"
    ? REEL
    : PROJECTS.filter((p) => p.reel).map((p) => ({ slug: p.slug }));
  const reelItems = reelSource.map((r) => {
    const proj = bySlug[r.slug];
    if (!proj) return null;
    const list = Array.isArray(proj.media) ? proj.media : [proj.media];
    return Object.assign({}, proj, {
      title: r.title || proj.title,
      media: list[r.episode || 0] || list[0]
    });
  }).filter(Boolean);
  let reelIndex = 0;
  let soundOn = false;

  const PLAY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10"/><path d="M10 8.2v7.6l6-3.8z" fill="currentColor" stroke="none"/></svg>';

  reelItems.forEach((p, i) => {

    const slide = document.createElement("div");
    slide.className = "reel-slide";
    slide.dataset.index = i;

    if (p.media.type === "video") {
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true;
      v.preload = "none";
      if (p.media.poster) v.poster = p.media.poster;
      v.dataset.src = p.media.clip || p.media.src;   // nel carosello il clip leggero
      v.setAttribute("aria-label", "Anteprima — " + p.title);
      v.addEventListener("error", () => showPlaceholder(slide), true);

      // Un video verticale in una slide a tutto schermo verrebbe tagliato a
      // metà: qui lo mostriamo intero, con una copia sfocata del fotogramma
      // a riempire i lati. `portrait` in data.js lo dice subito (prima ancora
      // che il file venga caricato), il controllo sui metadati fa da rete.
      if (p.portrait) slide.classList.add("is-portrait");
      // URL assoluto: una variabile CSS viene risolta rispetto al foglio di
      // stile (css/), non al documento, e un percorso relativo finirebbe su
      // css/assets/... cioè da nessuna parte
      if (p.media.poster) {
        slide.style.setProperty("--shot", 'url("' + new URL(p.media.poster, location.href).href + '")');
      }
      v.addEventListener("loadedmetadata", () => {
        slide.classList.toggle("is-portrait", v.videoHeight > v.videoWidth);
      });

      slide.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = p.media.src;
      img.alt = "Anteprima — " + p.title;
      img.loading = "lazy";
      img.addEventListener("error", () => showPlaceholder(slide));
      slide.appendChild(img);
    }

    // cliccando il video si apre a tutto schermo
    slide.addEventListener("click", () => openLightbox(i));
    reelTrack.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", p.title);
    dot.addEventListener("click", () => goToSlide(reelTrack, i));
    reelDots.appendChild(dot);
  });

  function showPlaceholder(slide) {
    if (slide.querySelector(".slide-missing")) return;
    const ph = document.createElement("div");
    ph.className = "slide-missing";
    ph.innerHTML = PLAY_ICON;
    slide.appendChild(ph);
  }

  function goToSlide(track, i) {
    track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function setReelIndex(i) {
    if (i === reelIndex && reelName.textContent) return;
    reelIndex = i;
    const p = reelItems[i];
    if (!p) return;
    reelName.textContent = p.title;
    [...reelDots.children].forEach((d, k) => d.classList.toggle("is-active", k === i));

    [...reelTrack.children].forEach((slide, k) => {
      const v = slide.querySelector("video");
      if (!v) return;
      if (k === i) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        v.muted = !soundOn;
        v.play().catch(() => {});
      } else {
        v.pause();
        v.muted = true;
      }
    });
  }

  let reelRaf = false;
  reelTrack.addEventListener("scroll", () => {
    if (reelRaf) return;
    reelRaf = true;
    requestAnimationFrame(() => {
      reelRaf = false;
      setReelIndex(Math.round(reelTrack.scrollLeft / (reelTrack.clientWidth || 1)));
    });
  }, { passive: true });

  function toggleReelSound() {
    soundOn = !soundOn;
    reelSound.setAttribute("aria-pressed", String(soundOn));
    reelSound.setAttribute("aria-label", soundOn ? "Disattiva l'audio" : "Attiva l'audio");
    const v = reelTrack.children[reelIndex] && reelTrack.children[reelIndex].querySelector("video");
    if (!v) return;
    v.muted = !soundOn;
    v.play().catch(() => {
      // se il browser rifiuta l'audio si resta in muto invece di fermarsi
      soundOn = false;
      reelSound.setAttribute("aria-pressed", "false");
      v.muted = true;
      v.play().catch(() => {});
    });
  }
  reelSound.addEventListener("click", toggleReelSound);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = reelTrack.children[reelIndex] && reelTrack.children[reelIndex].querySelector("video");
        if (!v) return;
        if (en.isIntersecting) {
          if (!v.src && v.dataset.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.35 }).observe(el("work"));
  }

  setReelIndex(0);

  /* ==================== ANTEPRIMA A TUTTO SCHERMO ====================
     Stesso player della scheda del catalogue — pulsante di riproduzione e
     barra con il trattino — senza il tasto dell'audio: qui si apre già con
     l'audio acceso, perché ci si arriva cliccando. */
  const lb = el("reelLightbox");
  const lbVideo = lb && lb.querySelector(".lightbox-video");
  const lbPlay = lb && lb.querySelector(".vbtn--play");
  const lbBar = lb && lb.querySelector(".vbar");
  const lbFill = lb && lb.querySelector(".vbar-fill");
  const lbClose = lb && lb.querySelector(".lightbox-close");
  let lbOpen = false;
  let lbRaf = null;
  let lbFocus = null;

  // la barra si riempie a ogni fotogramma, come nel catalogue
  function lbPaint() {
    if (lbVideo.duration) lbFill.style.width = ((lbVideo.currentTime / lbVideo.duration) * 100).toFixed(3) + "%";
    lbRaf = requestAnimationFrame(lbPaint);
  }
  const reelVideo = (k) => reelTrack.children[k] && reelTrack.children[k].querySelector("video");

  function openLightbox(i) {
    const item = reelItems[i];
    if (!lb || !item || item.media.type !== "video") return;
    const rv = reelVideo(i);
    if (rv) rv.pause();                              // il carosello dietro si ferma

    lbFocus = document.activeElement;
    lbVideo.poster = item.media.poster || "";
    lbVideo.src = item.media.src;
    // stessa rete del catalogo: se l'episodio completo manca, si guarda il clip
    lbVideo.onerror = () => {
      if (item.media.clip && lbVideo.getAttribute("src") !== item.media.clip) {
        lbVideo.src = item.media.clip;
        lbVideo.play().catch(() => {});
      }
    };
    lbVideo.muted = false;
    lbFill.style.width = "0%";
    lb.setAttribute("aria-label", item.title);
    lb.classList.add("is-open");
    document.documentElement.classList.add("is-lightbox");
    lbOpen = true;

    lbVideo.play().catch(() => {
      // se il browser rifiuta l'audio parte in muto invece di non partire
      lbVideo.muted = true;
      lbVideo.play().catch(() => {});
    });
    lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lbOpen) return;
    lbOpen = false;
    lbVideo.pause();
    lb.classList.remove("is-open", "is-playing");
    document.documentElement.classList.remove("is-lightbox");
    cancelAnimationFrame(lbRaf);
    lbRaf = null;

    const rv = reelVideo(reelIndex);                 // il carosello riparte com'era
    if (rv) { rv.muted = !soundOn; rv.play().catch(() => {}); }

    // tolgo la sorgente a dissolvenza finita: chiusa, non deve scaricare niente
    setTimeout(() => {
      if (lbOpen) return;
      lbVideo.removeAttribute("src");
      lbVideo.load();
    }, 500);
    if (lbFocus && lbFocus.focus) lbFocus.focus({ preventScroll: true });
  }

  if (lb) {
    const toggle = () => { if (lbVideo.paused) lbVideo.play().catch(() => {}); else lbVideo.pause(); };
    lbVideo.addEventListener("play", () => {
      lb.classList.add("is-playing");
      lbPlay.setAttribute("aria-label", "Pausa");
      if (!lbRaf) lbRaf = requestAnimationFrame(lbPaint);
    });
    lbVideo.addEventListener("pause", () => {
      lb.classList.remove("is-playing");
      lbPlay.setAttribute("aria-label", "Riproduci");
      cancelAnimationFrame(lbRaf);
      lbRaf = null;
    });
    lbVideo.addEventListener("click", toggle);
    lbPlay.addEventListener("click", toggle);
    lbBar.addEventListener("click", (e) => {
      if (!lbVideo.duration) return;
      const r = lbBar.getBoundingClientRect();
      lbVideo.currentTime = clamp((e.clientX - r.left) / r.width) * lbVideo.duration;
      lbFill.style.width = ((lbVideo.currentTime / lbVideo.duration) * 100).toFixed(3) + "%";
    });
    lbClose.addEventListener("click", closeLightbox);
    addEventListener("keydown", (e) => {
      if (!lbOpen) return;
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
      else if (e.key === " " || e.key === "Spacebar") {
        if (e.target === lbPlay || e.target === lbClose) return;   // lo fa già il bottone
        e.preventDefault();
        toggle();
      }
    });
  }

  /* ==================== SHOWREEL ==================== */
  const showreel = el("showreel");
  showreel.addEventListener("error", () => body.classList.add("no-video"), true);
  const src = showreel.querySelector("source");
  if (src) src.addEventListener("error", () => body.classList.add("no-video"));

  /* ==================== INCOMING HASH ==================== */
  function applyHash() {
    const h = decodeURIComponent(location.hash.replace("#", ""));
    if (!h) return;
    if (document.getElementById(h)) {
      // deep link da un'altra pagina: salto secco, ripetuto dopo il load
      // (le immagini che si caricano possono spostare il punto d'arrivo)
      const jump = () => {
        const t = document.getElementById(h);
        if (!t) return;
        let top = t.getBoundingClientRect().top + window.scrollY;
        if (h === "services") top += Math.max(0, t.offsetHeight - vh()) * 0.95;
        window.scrollTo({ top, behavior: "instant" });
        SXFX.onScroll();
      };
      requestAnimationFrame(jump);
      addEventListener("load", () => { SXFX.refresh(); jump(); }, { once: true });
      setTimeout(jump, 500);
    }
  }

  /* ==================== START ==================== */
  SXFX.refresh();
  applyHash();

  // tasto indietro / link con hash sulla stessa pagina
  addEventListener("hashchange", applyHash);
})();
