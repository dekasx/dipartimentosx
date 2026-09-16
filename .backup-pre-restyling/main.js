/* ============================================================
   DIPARTIMENTO SX — main.js
   Navigazione a pannelli con fade, ruota "sveglia iPhone",
   dettaglio progetto con scroll tra progetti, cursore custom.
   ============================================================ */

(() => {
  "use strict";

  const body = document.body;
  const video = document.getElementById("showreel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (id) => document.getElementById(id);

  // catalogo in ordine alfabetico
  PROJECTS.sort((a, b) => a.title.localeCompare(b.title, "it"));

  /* ==================== VIDEO SHOWREEL ==================== */
  // se il file non esiste ancora, mostriamo il fallback senza rompere il layout
  video.addEventListener("error", () => body.classList.add("no-video"), true);
  video.querySelector("source").addEventListener("error", () => body.classList.add("no-video"));

  const pauseVideo = () => { if (!video.paused) video.pause(); };
  const playVideo  = () => { video.play().catch(() => {}); };

  /* ==================== CURSORE CUSTOM "+" ==================== */
  // segue il mouse direttamente; ruota di 45° a ogni click
  const cursor = document.getElementById("cursor");
  if (window.matchMedia("(pointer: fine)").matches) {
    addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    }, { passive: true });

    let rot = 0;
    addEventListener("mousedown", () => {
      rot += 45;
      cursor.style.setProperty("--rot", rot + "deg");
    });

    // leggero ingrandimento sugli elementi cliccabili
    addEventListener("mouseover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, .wheel-item"));
    });
  }

  /* ==================== NAVIGAZIONE PANNELLI ==================== */
  const panels = {
    catalogue: el("panel-catalogue"),
    project:   el("panel-project"),
    about:     el("panel-about"),
    contact:   el("panel-contact"),
  };

  let currentView = "home";

  function setView(view, { pushHash = true } = {}) {
    if (view === currentView) return;

    Object.values(panels).forEach((p) => {
      p.classList.remove("is-open");
      p.setAttribute("aria-hidden", "true");
    });

    // il video si stoppa solo dentro contact
    if (view === "contact") pauseVideo(); else playVideo();

    if (view !== "home") {
      const p = panels[view];
      p.classList.add("is-open");
      p.setAttribute("aria-hidden", "false");
    }

    body.dataset.view = view;
    currentView = view;

    if (pushHash) {
      history.replaceState(null, "", view === "home" ? location.pathname : "#" + view);
    }

    if (view === "catalogue") {
      // l'inerzia del gesto che ha aperto il catalogue non deve muovere la ruota
      stepLock = Date.now() + 700;
      // alla prima apertura la ruota parte centrata su un elemento centrale
      if (!wheelInitialized) {
        wheelInitialized = true;
        padWheel();
        centerItem(Math.max(0, Math.floor(PROJECTS.length / 2) - 1), "auto");
      }
      updateWheel();
    }
  }

  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setView(a.dataset.nav);
    });
  });

  document.querySelectorAll("[data-close]").forEach((b) =>
    b.addEventListener("click", () => setView("home"))
  );
  document.querySelectorAll("[data-back-to]").forEach((b) =>
    b.addEventListener("click", () => setView(b.dataset.backTo))
  );

  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentView !== "home") {
      setView(currentView === "project" ? "catalogue" : "home");
    }
  });

  /* ==================== RUOTA CATALOGUE ==================== */
  const wheel = el("wheel");
  const wheelList = el("wheelList");

  PROJECTS.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "wheel-item";
    li.textContent = p.title;
    li.dataset.index = i;
    li.addEventListener("click", () => selectItem(i));
    wheelList.appendChild(li);
  });

  const items = [...wheelList.children];
  let wheelInitialized = false;
  let stepLock = 0;   // cooldown condiviso: un gesto (rotella o swipe) = un solo passo

  // click sullo sfondo (fuori dalle scritte) → torna alla landing
  wheel.addEventListener("click", (e) => {
    if (e.target === wheel || e.target === wheelList) setView("home");
  });

  // porta l'elemento i al centro della ruota
  function centerItem(i, behavior = "smooth") {
    const li = items[i];
    if (!li) return;
    const top = li.offsetTop - (wheel.clientHeight - li.offsetHeight) / 2;
    wheel.scrollTo({ top, behavior: reduceMotion ? "auto" : behavior });
  }

  // click su una scritta: la ruota scorre fino a centrarla, poi si apre il progetto
  function selectItem(i) {
    const li = items[i];
    const target = li.offsetTop - (wheel.clientHeight - li.offsetHeight) / 2;
    const dist = Math.abs(wheel.scrollTop - target);

    if (dist < 4 || reduceMotion) { openProject(i); return; }

    centerItem(i, "smooth");
    setTimeout(() => openProject(i), Math.min(700, 300 + dist * 0.35));
  }

  // padding per permettere a primo/ultimo elemento di raggiungere il centro
  function padWheel() {
    const itemH = items[0].offsetHeight || 76;
    const pad = Math.max(0, wheel.clientHeight / 2 - itemH / 2);
    wheelList.style.paddingTop = pad + "px";
    wheelList.style.paddingBottom = pad + "px";
  }

  // effetto tamburo: rotazione frontale + fade verso i bordi
  // (lo snap sulle scritte è gestito da CSS scroll-snap: mandatory)
  function updateWheel() {
    padWheel();
    const mid = wheel.clientHeight / 2;
    const wheelTop = wheel.getBoundingClientRect().top;

    items.forEach((li) => {
      const r = li.getBoundingClientRect();
      const center = r.top + r.height / 2 - wheelTop;
      const d = (center - mid) / mid;              // -1 .. 1
      const clamped = Math.max(-1, Math.min(1, d));

      if (!reduceMotion) {
        const rot = clamped * 55;                  // gradi di rotazione frontale
        const z = (1 - Math.abs(clamped)) * 40;    // leggero avvicinamento al centro
        li.style.transform = `rotateX(${-rot}deg) translateZ(${z}px)`;
      }
      li.style.opacity = String(1 - Math.abs(clamped) * 0.65);
    });
  }

  let wheelRaf = null;
  wheel.addEventListener("scroll", () => {
    if (wheelRaf) return;
    wheelRaf = requestAnimationFrame(() => { wheelRaf = null; updateWheel(); });
  }, { passive: true });

  /* --- scroll controllato: un gesto = un brand ---
     Rotella/trackpad: ogni gesto fa avanzare la ruota di UNA scritta.
     Touch: lo scroll nativo è disattivato (touch-action: none) e ogni
     swipe verticale sposta di UNA scritta. */
  const itemH = () => items[0].offsetHeight || 76;
  const scrollIndex = () => Math.round(wheel.scrollTop / itemH());

  function stepWheel(dir) {
    const next = Math.min(items.length - 1, Math.max(0, scrollIndex() + dir));
    wheel.scrollTo({ top: next * itemH(), behavior: reduceMotion ? "auto" : "smooth" });
  }

  let stepAcc = 0;
  wheel.addEventListener("wheel", (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now < stepLock) { stepAcc = 0; return; }   // ignora l'inerzia del gesto appena consumato
    stepAcc += e.deltaY;
    if (Math.abs(stepAcc) < 30) return;

    const dir = Math.sign(stepAcc);
    stepAcc = 0;
    stepWheel(dir);
    stepLock = now + 450;
  }, { passive: false });

  // swipe touch sulla ruota: uno swipe = un brand
  let wheelTouchY = null;
  wheel.addEventListener("touchstart", (e) => {
    wheelTouchY = e.touches[0].clientY;
  }, { passive: true });
  wheel.addEventListener("touchend", (e) => {
    if (wheelTouchY === null) return;
    const dy = wheelTouchY - e.changedTouches[0].clientY;
    wheelTouchY = null;
    if (Math.abs(dy) < 30) return;   // è un tap, lo gestisce il click
    const now = Date.now();
    if (now < stepLock) return;
    stepWheel(Math.sign(dy));
    stepLock = now + 350;
  }, { passive: true });

  // riallineamento di sicurezza a fine scroll
  let snapTimer = null;
  wheel.addEventListener("scroll", () => {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const target = Math.min(items.length - 1, Math.max(0, scrollIndex())) * itemH();
      if (Math.abs(wheel.scrollTop - target) > 1) {
        wheel.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }, 110);
  }, { passive: true });

  addEventListener("resize", () => { if (currentView === "catalogue") updateWheel(); });

  /* ==================== DETTAGLIO PROGETTO ==================== */
  const projectScroll = el("projectScroll");
  const projectInner = document.querySelector(".project-inner");
  let currentProject = -1;

  function fillProject(i) {
    const p = PROJECTS[i];
    const prev = PROJECTS[i - 1];
    const next = PROJECTS[i + 1];

    el("projPrev").textContent = prev ? prev.title : "";
    el("projNext").textContent = next ? next.title : "";
    el("projTitle").textContent = p.title;
    el("projDate").textContent = p.date;
    el("projScope").textContent = p.scope;
    el("projGear").textContent = p.gear;
    el("projPartner").textContent = p.partner;
    el("projDesc").textContent = p.description;

    // media: video o foto, con placeholder se il file non c'è ancora
    const fig = el("projMedia");
    fig.innerHTML = "";
    let media;
    if (p.media.type === "video") {
      media = document.createElement("video");
      media.src = p.media.src;
      if (p.media.poster) media.poster = p.media.poster;
      media.muted = true;
      media.loop = true;
      media.autoplay = true;
      media.playsInline = true;
      media.setAttribute("aria-label", "Anteprima video — " + p.title);
    } else {
      media = document.createElement("img");
      media.src = p.media.src;
      media.alt = "Anteprima — " + p.title;
      media.loading = "lazy";
    }
    media.addEventListener("error", () => {
      fig.innerHTML = '<div class="media-missing">media in arrivo — ' + p.media.src + "</div>";
    });
    fig.appendChild(media);

    history.replaceState(null, "", "#catalogue/" + p.slug);

    // contenuto sempre centrato nello schermo
    requestAnimationFrame(() => {
      projectScroll.scrollTop = (projectInner.scrollHeight - projectScroll.clientHeight) / 2;
    });
  }

  function openProject(i, { fade = false } = {}) {
    currentProject = i;

    if (fade && !reduceMotion) {
      projectInner.style.opacity = "0";
      setTimeout(() => {
        fillProject(i);
        projectInner.style.opacity = "1";
      }, 230);
    } else {
      fillProject(i);
    }

    setView("project", { pushHash: false });
  }

  // scroll dentro al progetto → passa al progetto precedente/successivo
  let navLock = 0;

  function stepProject(dir) {
    const j = currentProject + dir;
    if (j < 0 || j >= PROJECTS.length) return false;
    openProject(j, { fade: true });
    return true;
  }

  function atEdges() {
    const canScroll = projectScroll.scrollHeight > projectScroll.clientHeight + 2;
    return {
      top: !canScroll || projectScroll.scrollTop <= 1,
      bottom: !canScroll ||
        projectScroll.scrollTop + projectScroll.clientHeight >= projectScroll.scrollHeight - 1,
    };
  }

  // rotella: UN singolo gesto passa al progetto precedente/successivo
  let projAcc = 0;
  panels.project.addEventListener("wheel", (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now < navLock) { projAcc = 0; return; }   // ignora l'inerzia del gesto consumato
    projAcc += e.deltaY;
    if (Math.abs(projAcc) < 30) return;

    const dir = Math.sign(projAcc);
    projAcc = 0;
    if (stepProject(dir)) {
      navLock = now + 800;
    } else {
      // primo/ultimo progetto: lascio scorrere il contenuto se sfora
      projectScroll.scrollTop += e.deltaY;
    }
  }, { passive: false });

  // swipe verticale su touch
  let touchY = null;
  panels.project.addEventListener("touchstart", (e) => {
    touchY = e.touches[0].clientY;
  }, { passive: true });
  panels.project.addEventListener("touchend", (e) => {
    if (touchY === null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    const now = Date.now();
    if (now < navLock) return;
    const edge = atEdges();

    if (dy > 60 && edge.bottom) {
      if (stepProject(1)) navLock = now + 800;
    } else if (dy < -60 && edge.top) {
      if (stepProject(-1)) navLock = now + 800;
    }
  }, { passive: true });

  /* ==================== LANDING: SCROLL/SWIPE → CATALOGUE ==================== */
  addEventListener("wheel", (e) => {
    if (currentView !== "home") return;
    if (Math.abs(e.deltaY) > 15) setView("catalogue");
  }, { passive: true });

  let homeTouchY = null;
  addEventListener("touchstart", (e) => {
    if (currentView === "home") homeTouchY = e.touches[0].clientY;
  }, { passive: true });
  addEventListener("touchend", (e) => {
    if (currentView !== "home" || homeTouchY === null) { homeTouchY = null; return; }
    const dy = Math.abs(homeTouchY - e.changedTouches[0].clientY);
    homeTouchY = null;
    if (dy > 50) setView("catalogue");
  }, { passive: true });

  /* ==================== SERVIZI (about) ==================== */
  const servicesList = el("servicesList");
  SERVICES.forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<span class="num">' + s.numL + "</span>" +
      '<span class="name">' + s.name + "</span>" +
      '<span class="num num--r">' + s.numR + "</span>";
    servicesList.appendChild(li);
  });

  /* ==================== ROUTING VIA HASH (deep link) ==================== */
  function applyHash() {
    const h = location.hash.replace("#", "");
    if (!h) return;
    if (h.startsWith("catalogue/")) {
      const slug = h.split("/")[1];
      const idx = PROJECTS.findIndex((p) => p.slug === slug);
      setView("catalogue", { pushHash: false });
      if (idx >= 0) openProject(idx);
    } else if (["catalogue", "about", "contact"].includes(h)) {
      setView(h, { pushHash: false });
    }
  }
  applyHash();

  // primo paint della ruota
  updateWheel();
})();
