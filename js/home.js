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

  /* ---------- lingua ----------
     Le pagine di en/ portano lang="en": le etichette scritte da qui dentro
     cambiano di conseguenza. Il testo dei progetti arriva invece da
     js/data-en.js. */
  const T = (it, en) => (document.documentElement.lang === "en" ? en : it);

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

    // solo la foto della sezione: dove non c'è (web e studio podcast) il
    // pannello resta di solo testo. Con foto: false in data.js la si toglie
    // anche dove la sezione ce l'ha.
    const src = (shot && s.foto !== false) ? shot.getAttribute("src") : null;
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

  /* ==================== IL LOGO SULLA SCRITTA ====================
     In cima alla home il logo non sta nell'angolo: sta accanto alla scritta
     "dipartimento" (da telefono, dove la scritta è larga quasi quanto lo
     schermo, sotto e centrato). Appena si scorre torna nel suo angolo in alto
     a sinistra, che è lo stesso di tutte le altre pagine: da lì in poi fa da
     tasto per tornare in cima.

     Il viaggio lo fa il CSS (transform con una transizione di 0.75s): qui si
     scrive solo dove deve stare. La misura va presa a trasformazione spenta,
     perché getBoundingClientRect restituisce il rettangolo GIÀ trasformato e
     altrimenti ogni calcolo partirebbe dal risultato del precedente. */
  const logo = document.querySelector(".logo");
  const marchio = document.querySelector(".hero-mark img") || document.querySelector(".hero-mark");
  let postoLogo = null;      // {dx, dy, s} oppure null se non calcolabile
  if (logo) {
    logo.classList.add("is-attesa");
    // comunque vada, entro due secondi il logo si vede
    setTimeout(() => logo.classList.remove("is-attesa"), 2000);
  }

  function misuraLogo() {
    postoLogo = null;
    if (!logo || !marchio || !heroSec) return;

    logo.classList.add("is-misura");
    const l = logo.getBoundingClientRect();
    logo.classList.remove("is-misura");
    const m = marchio.getBoundingClientRect();
    if (!l.width || !m.width) return;

    const stretto = matchMedia("(max-width: 820px)").matches;
    let cx, cy, scala;
    if (stretto) {
      // sotto la scritta, centrato nello schermo
      scala = 1;
      cx = innerWidth / 2;
      cy = m.bottom + 22 + (l.height * scala) / 2;
    } else {
      // a destra della scritta, un filo più alto di lei
      scala = Math.max(0.8, Math.min(2.4, (m.height * 1.5) / l.height));
      cx = m.right + 30 + (l.width * scala) / 2;
      cy = m.top + m.height / 2;
    }
    postoLogo = { dx: cx - (l.left + l.width / 2), dy: cy - (l.top + l.height / 2), s: scala };
  }

  /* `subito`: quando a cambiare è la pagina (apertura, immagine caricata,
     finestra ridimensionata) il logo va al suo posto senza viaggio. Prima
     ogni nuova misura faceva ripartire la transizione di 0.75s verso un
     punto un po' diverso, e il logo tremolava prima di fermarsi. Il viaggio
     resta solo quando si scorre (dalla scritta all'angolo e ritorno). */
  function posaLogo(y, subito) {
    if (!logo) return;
    if (!postoLogo) {
      // la scritta è un'immagine ancora in arrivo: si aspetta lei, non si
      // mostra il logo nell'angolo per farlo saltare dopo
      const attendo = marchio && marchio.tagName === "IMG" && !marchio.complete;
      if (subito && !attendo) logo.classList.remove("is-attesa");
      return;
    }
    // attaccato alla scritta solo in cima: al primo movimento vola nell'angolo
    const sopra = y < 8;
    if (subito) logo.classList.add("is-fermo");
    logo.style.setProperty("--lx", (sopra ? postoLogo.dx : 0).toFixed(1) + "px");
    logo.style.setProperty("--ly", (sopra ? postoLogo.dy : 0).toFixed(1) + "px");
    logo.style.setProperty("--ls", sopra ? postoLogo.s.toFixed(3) : "1");
    if (subito) {
      logo.getBoundingClientRect();          // il posto nuovo vale da adesso
      logo.classList.remove("is-fermo", "is-attesa");
    }
  }

  /* ==================== AGGANCIO AL MOTORE CONDIVISO ==================== */
  SXFX.add(
    (y) => { paintBackground(y); paintServices(y); paintNav(y); posaLogo(y); },
    () => { measure(); measureRows(); misuraLogo(); posaLogo(window.scrollY, true); }
  );
  // la scritta è un'immagine: finché non è caricata non si sa quanto è alta
  if (marchio && marchio.tagName === "IMG" && !marchio.complete) {
    marchio.addEventListener("load", () => { misuraLogo(); posaLogo(window.scrollY, true); }, { once: true });
  }

  /* ==================== PASSAGGIO DALLO SHOWREEL ====================
     Un gesto = una sezione, come premere la freccia giù. Vale solo dalla
     schermata di apertura: da lì in poi la rotellina è libera. Il gesto viene
     riconosciuto una volta sola: mentre il salto è in corso le rotellate
     rimaste (la coda dell'inerzia del trackpad) vengono ignorate, così la
     pagina non scivola oltre. C'è anche un tetto: comunque vada si sblocca
     entro 1,2 secondi, così non può restare incastrato. */
  const heroSec = el("home");
  // la sezione subito dopo lo showreel, qualunque sia
  const dopoHero = heroSec && [...document.querySelectorAll(".sec[data-bg]")]
    .find((x) => x !== heroSec && (x.offsetParent !== null || x.offsetHeight > 0));

  let jumping = false;
  let quietT = null;
  let hardT = null;
  let meta = 0;

  function releaseJump() {
    jumping = false;
    clearTimeout(quietT); clearTimeout(hardT);
    quietT = hardT = null;
  }

  /* Il salto finisce quando la pagina è arrivata, non allo scadere del tetto. */
  let controllo = false;
  function arrivato() {
    if (!jumping) { controllo = false; return; }
    if (Math.abs(window.scrollY - meta) <= 1) { releaseJump(); controllo = false; return; }
    requestAnimationFrame(arrivato);
  }

  function doJump(to) {
    jumping = true;
    meta = to;
    window.scrollTo({ top: to, behavior: reduceMotion ? "auto" : "smooth" });
    clearTimeout(hardT);
    hardT = setTimeout(releaseJump, 1200);   // tetto: non si incastra mai
    if (!controllo) { controllo = true; requestAnimationFrame(arrivato); }
  }

  // chiamata a ogni evento inghiottito: sblocca quando smettono di arrivare
  function afterQuiet() {
    clearTimeout(quietT);
    quietT = setTimeout(releaseJump, 140);
  }

  // il bordo della sezione che segue lo showreel, o null se siamo oltre
  function bordoDopoHero() {
    if (!heroSec || !dopoHero) return null;
    const y = window.scrollY;
    const edge = Math.round(dopoHero.getBoundingClientRect().top + y);
    return y < edge - 4 ? edge : null;
  }

  if (heroSec && dopoHero) {
    addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || !e.deltaY) return;
      if (jumping) { e.preventDefault(); afterQuiet(); return; }
      if (e.deltaY < 0) return;                 // all'indietro si è liberi
      const edge = bordoDopoHero();
      if (edge === null) return;                // resto della pagina: libera
      e.preventDefault();
      afterQuiet();
      doJump(edge);
    }, { passive: false });

    /* La stessa cosa con la tastiera: freccia, pagina giù e barra spaziatrice. */
    const GIU = ["ArrowDown", "PageDown", " ", "Spacebar"];
    addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!GIU.includes(e.key)) return;
      if (jumping) { e.preventDefault(); return; }
      const edge = bordoDopoHero();
      if (edge === null) return;
      e.preventDefault();
      doJump(edge);
    });
  }

  /* ==================== SCATTO FRA LE SEZIONI (solo col dito) ====================
     Col dito non arrivano rotellate, quindi il blocco qui sopra da telefono
     non vale: lo scatto lo fa questo. Vale per TUTTA la home, non solo per le
     prime due sezioni — un gesto, una sezione, come le frecce da computer.

     Due eccezioni, se no si romperebbe qualcosa:
     • gesto di lato: è il carosello dei lavori, non lo tocchiamo;
     • sezione più alta di una schermata (da telefono la fisarmonica dei
       servizi): dentro si scorre liberamente, lo scatto riprende ai suoi due
       bordi. Se no non si potrebbe leggerla.
     Sotto l'ultima sezione c'è il footer, che non è una sezione: lì si scorre
     libero.

     Se il browser aveva già fatto partire lo scorrimento prima che potessimo
     fermarlo — a quel punto non lo si ferma più — il salto si fa quando il
     dito si stacca, così non si resta a metà fra due sezioni. */
  const TOCCO = matchMedia("(pointer: coarse)").matches;

  if (TOCCO) {
    /* Lo scatto vale solo scendendo: tornando indietro si risale liberi.

       Le fermate si misurano al momento del gesto, non una volta per tutte:
       la fisarmonica dei servizi cambia altezza quando si apre una voce, e
       con una misura vecchia il blocco impedirebbe di leggere quello che si è
       appena aperto. Sono l'inizio di ogni sezione, il fondo pagina (dove il
       footer si vede tutto) e, per le sezioni più alte di una schermata,
       anche il loro fondo. Il footer conta come una sezione. */
    const footer = document.querySelector(".site-footer");

    function mira(dir) {
      if (dir < 0) return null;            // all'indietro non si blocca niente

      const h = vh();
      const max = Math.max(0, document.documentElement.scrollHeight - h);
      const scroll = window.scrollY;
      /* Se un salto è ancora in volo si conta da dove sta andando, non da
         dove si trova: la dissolvenza dello scorrimento dura più di mezzo
         secondo e un secondo swipe, arrivato prima, veniva buttato via —
         dalla seconda sezione alla terza ne servivano due. Così invece si
         incatena la fermata successiva. */
      const y = jumping ? meta : scroll;

      const blocchi = sections
        .filter((s) => s.offsetParent !== null || s.offsetHeight > 0)
        .concat(footer && footer.offsetHeight ? [footer] : [])
        .map((s) => {
          const top = Math.round(s.getBoundingClientRect().top + scroll);
          return { top, fondo: Math.min(top + s.offsetHeight - h, max), alta: s.offsetHeight > h + 8 };
        });
      if (!blocchi.length) return null;

      // dentro una sezione alta si scende a mano fino al suo fondo
      for (const b of blocchi) {
        if (b.alta && y >= b.top - 4 && y < b.fondo - 4) return null;
      }

      const fermate = new Set([max]);
      blocchi.forEach((b) => {
        fermate.add(Math.min(b.top, max));
        if (b.alta) fermate.add(Math.max(0, b.fondo));
      });

      const t = [...fermate].sort((x, z) => x - z).find((v) => v > y + 4);
      return t === undefined ? null : t;
    }

    let dito = null;

    addEventListener("touchstart", (e) => {
      dito = null;
      if (e.touches.length > 1) return;
      const t = e.touches[0];
      dito = { y: t.clientY, x: t.clientX, dir: 0, meta: 0, fermata: false, fatto: false };
    }, { passive: true });

    addEventListener("touchmove", (e) => {
      if (!dito) return;
      if (e.touches.length > 1) { dito = null; return; }   // due dita: ingrandimento

      const dy = dito.y - e.touches[0].clientY;   // positivo = dito in su = si scende
      const dx = dito.x - e.touches[0].clientX;

      if (!dito.dir) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;   // gesto ancora indeciso
        if (Math.abs(dy) <= Math.abs(dx)) { dito = null; return; }   // di lato: carosello
        const meta = mira(dy > 0 ? 1 : -1);
        if (meta === null) { dito = null; return; }                  // qui si scorre libero
        dito.dir = dy > 0 ? 1 : -1;
        dito.meta = meta;
        dito.fermata = e.cancelable;   // se lo scorrimento è già partito, non si ferma
      }
      if (!dito.fermata) return;
      e.preventDefault();
      if (!dito.fatto && Math.abs(dy) > 24) { dito.fatto = true; doJump(dito.meta); }
    }, { passive: false });

    const staccaDito = () => {
      if (dito && dito.dir && !dito.fermata && !dito.fatto) doJump(dito.meta);
      dito = null;
    };
    addEventListener("touchend", staccaDito, { passive: true });
    addEventListener("touchcancel", staccaDito, { passive: true });
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

  /* Il carosello dei lavori e la sua anteprima a tutto schermo stavano qui:
     la sezione è stata tolta dalla home, i progetti si vedono nel catalogo. */

  /* ==================== SHOWREEL ==================== */
  const showreel = el("showreel");
  showreel.addEventListener("error", () => body.classList.add("no-video"), true);
  const src = showreel.querySelector("source");
  if (src) src.addEventListener("error", () => body.classList.add("no-video"));

  /* ==================== #services SOLO QUANDO CI SEI ====================
     Il passaggio a pellicola sceglie la direzione dalla pagina di partenza,
     e per la home legge l'indirizzo: #services vuol dire "sono nei servizi",
     che nella gerarchia viene dopo il catalogo. Cliccando "servizi" nel menu
     l'indirizzo diventava #services e ci restava anche risalendo all'hero,
     quindi dalla home il catalogo risultava sempre "indietro". Ora #services
     c'è solo mentre la sezione attraversa la metà dello schermo. */
  if ("IntersectionObserver" in window && servicesSec) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const dentro = en.isIntersecting;
        if (dentro && location.hash !== "#services") {
          history.replaceState(null, "", "#services");
        } else if (!dentro && location.hash === "#services") {
          history.replaceState(null, "", location.pathname + location.search);
        }
      });
    }, { rootMargin: "-50% 0px -50% 0px" }).observe(servicesSec);
  }

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
