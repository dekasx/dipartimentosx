/* ============================================================
   DIPARTIMENTO SX — catalogue.js

   La ruota dei progetti (stile sveglia iPhone) e la scheda del
   singolo progetto. Prima erano due pannelli sovrapposti alla home,
   ora la ruota è la pagina e resta a sovrapporsi solo la scheda.

   Deep link: catalogue.html#lodigiani apre quel progetto.
   ============================================================ */

(() => {
  "use strict";

  const body = document.body;
  const el = (id) => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wheel = el("wheel");
  if (!wheel) return;

  PROJECTS.sort((a, b) => a.title.localeCompare(b.title, "en"));

  /* ==================== RUOTA ====================
     Scorrimento libero e continuo, come la selezione dell'ora su iPhone:
     niente passi imposti, ci pensa lo scroll nativo (inerzia inclusa) e
     lo scroll-snap del browser a posare la voce al centro.

     L'infinito è ottenuto ripetendo l'elenco COPIES volte e riportando
     silenziosamente lo scroll al centro quando ci si avvicina a un'estremità:
     essendo i blocchi identici, il salto è invisibile. */
  /* Da telefono il riposizionamento avviene solo a ruota ferma (vedi più
     sotto), quindi una spinta forte deve avere abbastanza elenco davanti per
     non sbattere contro la fine: 21 copie sono circa 6.700 px per parte. */
  const TOCCO = matchMedia("(pointer: coarse)").matches;
  const COPIES = TOCCO ? 21 : 9;
  const wheelList = el("wheelList");
  const N = PROJECTS.length;

  for (let c = 0; c < COPIES; c++) {
    PROJECTS.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "wheel-item";
      li.textContent = p.title;
      li.dataset.project = i;
      li.addEventListener("click", () => selectItem(li, i));
      wheelList.appendChild(li);
    });
  }

  const items = [...wheelList.children];
  const count = el("catCount");
  if (count) count.textContent = String(N).padStart(2, "0");
  const itemH = () => items[0].offsetHeight || 76;
  const blockH = () => itemH() * N;

  /* riporta lo scroll nella fascia centrale: il salto è di un numero intero
     di blocchi, quindi né l'occhio né lo snap se ne accorgono */
  function recentre() {
    const b = blockH();
    const st = wheel.scrollTop;
    let d = 0;
    if (st < b * 1.5) d = b * (COPIES - 3);
    else if (st > b * (COPIES - 1.5)) d = -b * (COPIES - 3);
    if (d) wheel.scrollTop = st + d;
    return d;      // chi sta animando la ruota sposta il suo traguardo di tanto
  }

  function selectItem(li, projectIndex) {
    const target = li.offsetTop - (wheel.clientHeight - li.offsetHeight) / 2;
    const dist = Math.abs(wheel.scrollTop - target);
    if (dist < 4 || reduceMotion) { openProject(projectIndex, true); return; }
    if (TOCCO) vaiA(target, 320, true);
    else wheel.scrollTo({ top: target, behavior: "smooth" });
    setTimeout(() => openProject(projectIndex, true), Math.min(650, 280 + dist * 0.3));
  }

  /* Effetto tamburo: rotazione e dissolvenza verso i bordi.

     La posizione va calcolata dal LAYOUT, non con getBoundingClientRect():
     quel metodo restituisce il rettangolo **già trasformato**, cioè l'effetto
     del fotogramma precedente. Usandolo, ogni fotogramma calcolava la nuova
     trasformazione a partire dalla vecchia — un anello di retroazione. Da
     fermo si stabilizzava, scorrendo veloce l'errore si accumulava e le voci
     sembravano allontanarsi per poi riavvicinarsi.

     Le voci sono tutte alte uguale, quindi la posizione si ricava con due
     letture sole invece di 117: niente rimbalzi e niente layout forzato. */
  // se il browser sa animare sullo scroll, l'effetto lo fa il CSS (compositor)
  const CSS_DRUM = window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()");

  function updateWheel() {
    if (CSS_DRUM) return;
    const h = wheel.clientHeight;
    const mid = h / 2;
    const ih = itemH();
    const base = items[0].offsetTop;      // una lettura, fuori dal ciclo
    const st = wheel.scrollTop;

    for (let i = 0; i < items.length; i++) {
      const center = base + i * ih + ih / 2 - st;
      const li = items[i];
      if (center < -140 || center > h + 140) continue;   // fuori campo
      const d = clamp((center - mid) / mid, -1, 1);
      if (!reduceMotion) {
        li.style.transform = `rotateX(${-d * 55}deg) translateZ(${(1 - Math.abs(d)) * 40}px)`;
      }
      li.style.opacity = String(1 - Math.abs(d) * 0.65);
    }
  }

  /* Assestamento della ruota.

     Lo scatto è dello scroll-snap del browser e da computer basta. Da telefono
     no: con lo scorrimento a inerzia, e con i riposizionamenti che tengono
     infinito l'elenco, capita che la voce resti a metà fra due righe. Quando la
     ruota sta ferma per un attimo la porto io sulla riga, con la stessa curva
     morbida del carosello degli episodi. Se è già a posto non fa niente. */
  const DUR_POSA = 260;
  let posaT = null, posaRaf = null;

  function fermaPosa() { cancelAnimationFrame(posaRaf); posaRaf = null; }

  function posaSullaRiga() {
    const h = itemH();
    if (!h) return;
    const base = items[0].offsetTop;
    const mira = Math.round((wheel.scrollTop + wheel.clientHeight / 2 - base - h / 2) / h) * h + base + h / 2 - wheel.clientHeight / 2;
    const da = wheel.scrollTop;
    if (Math.abs(mira - da) < 1) return;
    if (reduceMotion) { wheel.scrollTop = mira; return; }
    const t0 = performance.now();
    fermaPosa();
    const passo = (now) => {
      const t = Math.min(1, (now - t0) / DUR_POSA);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      wheel.scrollTop = da + (mira - da) * e;
      if (t < 1) posaRaf = requestAnimationFrame(passo); else posaRaf = null;
    };
    posaRaf = requestAnimationFrame(passo);
  }

  ["pointerdown", "touchstart", "wheel"].forEach((ev) =>
    wheel.addEventListener(ev, fermaPosa, { passive: true }));

  /* ---------- da telefono: la ruota come il timer di iPhone ----------
     Lo scroll nativo con lo snap del browser dava un aggancio secco: l'inerzia
     andava per conto suo e alla fine la voce veniva tirata sulla riga, tutta
     in una volta. Il picker di iOS fa un'altra cosa: sceglie la riga di arrivo
     NEL MOMENTO in cui stacchi il dito, e frena dolcemente proprio fin lì.
     Quindi da telefono il gesto lo gestisco io:
       - col dito appoggiato la ruota segue il dito, 1:1;
       - allo stacco misuro la velocità, proietto dove arriverebbe per inerzia
         (con la decelerazione di iOS) e arrotondo alla riga più vicina;
       - poi ci arrivo con una frenata esponenziale che PARTE dalla velocità
         del dito: nessuno strappo allo stacco, nessuno scatto all'arrivo.
     Il riposizionamento dell'elenco infinito si fa in qualsiasi momento:
     sposta ruota e traguardo dello stesso numero intero di blocchi. */
  const DECEL = 0.997;                          // per millisecondo, come iOS
  const PROIEZIONE = DECEL / (1 - DECEL);       // ms: velocità × questo = strada
  let motoRaf = null, sopprimiClick = false;

  function fermaMoto() { if (motoRaf) cancelAnimationFrame(motoRaf); motoRaf = null; }

  function rigaVicina(pos) {
    const h = itemH(), base = items[0].offsetTop, mezza = wheel.clientHeight / 2;
    return Math.round((pos + mezza - base - h / 2) / h) * h + base + h / 2 - mezza;
  }

  /* Arrivo sulla riga T in un tempo definito.
     - Dopo una spinta: frenata "ease-out" cubica, x = x0 + (T-x0)·(1-(1-t)³).
       La sua velocità iniziale è 3·(T-x0)/durata: scegliendo la durata così
       parte alla stessa velocità del dito e arriva a zero proprio sulla riga.
       Prima era una frenata esponenziale, che ha una coda lunghissima (quasi
       3 s di strisciamento lento dopo una spinta forte): sembrava che
       l'assestamento non finisse mai.
     - Da fermo (dito staccato senza velocità): curva morbida in entrata e in
       uscita, breve. */
  function vaiA(T, durata, daFermo) {
    fermaMoto(); fermaPosa();
    let x0 = wheel.scrollTop;
    if (reduceMotion || Math.abs(T - x0) < 0.5) { wheel.scrollTop = T; recentre(); return; }
    const t0 = performance.now();
    const curva = daFermo
      ? (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      : (t) => 1 - Math.pow(1 - t, 3);
    const passo = (now) => {
      const t = Math.min(1, (now - t0) / durata);
      wheel.scrollTop = x0 + (T - x0) * curva(t);
      const d = recentre();
      if (d) { T += d; x0 += d; }
      if (t < 1) motoRaf = requestAnimationFrame(passo);
      else motoRaf = null;
    };
    motoRaf = requestAnimationFrame(passo);
  }

  function lancia(v) {                           // v in px/ms, verso lo scroll
    const pos = wheel.scrollTop;
    const T = rigaVicina(pos + v * PROIEZIONE);
    const strada = T - pos;
    if (Math.abs(v) < 0.05 || Math.sign(v) !== Math.sign(strada)) {
      // quasi fermo: posa breve, più lunga solo se la riga è lontana
      vaiA(T, 200 + Math.min(Math.abs(strada), 60) * 1.5, true);
      return;
    }
    const durata = Math.min(Math.max((3 * strada) / v, 220), 1400);
    vaiA(T, durata, false);
  }

  if (TOCCO) {
    let dito = false, yDito = 0, stDito = 0, campioni = [], mosso = false, eraInMoto = false;

    wheel.addEventListener("touchstart", (e) => {
      eraInMoto = motoRaf !== null;
      fermaMoto(); fermaPosa();
      dito = true; mosso = false; sopprimiClick = false;
      yDito = e.touches[0].clientY;
      stDito = wheel.scrollTop;
      campioni = [{ t: performance.now(), y: yDito }];
    }, { passive: true });

    wheel.addEventListener("touchmove", (e) => {
      if (!dito) return;
      const y = e.touches[0].clientY;
      if (!mosso && Math.abs(y - yDito) > 6) mosso = true;
      wheel.scrollTop = stDito - (y - yDito);
      const d = recentre();
      if (d) stDito += d;
      const now = performance.now();
      campioni.push({ t: now, y });
      while (campioni.length > 2 && now - campioni[0].t > 100) campioni.shift();
    }, { passive: true });

    const stacca = () => {
      if (!dito) return;
      dito = false;
      // un tocco che ferma la ruota in moto non apre niente: la ferma e basta
      if (mosso || eraInMoto) sopprimiClick = true;
      if (!mosso) { if (eraInMoto) lancia(0); return; }
      /* velocità allo stacco: sugli ultimi 50 ms, non su tutto il gesto.
         Un gesto che accelera ha la media più bassa della velocità finale,
         e la ruota sembrava frenare appena staccato il dito. */
      const b = campioni[campioni.length - 1];
      const recenti = campioni.filter((c) => b.t - c.t <= 50);
      const a = recenti.length >= 2 ? recenti[0] : campioni[0];
      const dt = b.t - a.t;
      // dito fermo prima di staccare: niente inerzia
      const fermo = performance.now() - b.t > 60;
      const v = dt > 0 && !fermo ? -(b.y - a.y) / dt : 0;
      lancia(v);
    };
    wheel.addEventListener("touchend", stacca, { passive: true });
    wheel.addEventListener("touchcancel", stacca, { passive: true });

    // il click che segue un trascinamento o una frenata non seleziona
    wheel.addEventListener("click", (e) => {
      if (sopprimiClick) { e.stopPropagation(); e.preventDefault(); sopprimiClick = false; }
    }, true);
  }

  let wheelRaf = null;
  wheel.addEventListener("scroll", () => {
    // da telefono la posizione la scrive solo il codice qui sopra
    if (!TOCCO) {
      recentre();
      clearTimeout(posaT);
      posaT = setTimeout(posaSullaRiga, 140);
    }
    if (wheelRaf) return;
    wheelRaf = requestAnimationFrame(() => { wheelRaf = null; updateWheel(); });
  }, { passive: true });

  /* ==================== SCHEDA PROGETTO ====================
     Un blocco per progetto, impilati: si passa da uno all'altro **scorrendo**,
     non con una dissolvenza. Prima ogni gesto scambiava la scheda con un
     fade-out/fade-in: da lì il "scompare e riappare".
     ============================================================ */
  const panel = el("panel-project");
  const scroller = el("projectScroll");
  let isOpen = false;
  let savedScroll = 0;
  const blocks = [];

  /* se l'audio è acceso resta acceso passando da un progetto all'altro */
  let soundOn = false;

  /* Schermo intero e rotazione del telefono ridimensionano la pagina. Senza
     precauzioni, a finestra più grande più progetti risultano "in campo"
     insieme e partivano tutti, con l'audio sovrapposto; e il mazzo degli
     episodi, ricalcolato su una larghezza nuova, poteva saltare a un altro
     episodio. Finché dura lo schermo intero non cambia niente. */
  let schermoPieno = false;
  let bloccoPieno = null;
  const inPieno = () => schermoPieno ||
    !!(document.fullscreenElement || document.webkitFullscreenElement);

  function entraPieno(b) { schermoPieno = true; bloccoPieno = b; }
  function esciPieno() {
    const b = bloccoPieno;
    bloccoPieno = null;
    // il layout è cambiato sotto: riporto al centro il progetto che guardavi
    if (b && isOpen) centra(b);
    raddrizza();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      schermoPieno = false;
      aggiornaInCampo();
    }));
  }

  function buildBlock(p) {
    const block = document.createElement("article");
    block.className = "project-block";

    const card = document.createElement("div");
    card.className = "project-card";
    block.appendChild(card);

    const titlebox = document.createElement("div");
    titlebox.className = "project-titlebox";
    titlebox.innerHTML =
      '<span class="split-line split-line--top" aria-hidden="true"></span>' +
      '<h2 class="project-title"></h2>' +
      '<span class="split-line split-line--bottom" aria-hidden="true"></span>';
    titlebox.querySelector(".project-title").textContent = p.title;
    card.appendChild(titlebox);

    /* Un progetto può avere più video (Botteghe Storiche ne ha due): stanno
       tutti dentro una stessa voce, in un mazzo di carte. Quella scelta sta
       davanti, le altre dietro e spostate di lato. Scorrendo di lato le carte
       si muovono di continuo: quella dietro viene avanti, quella davanti va
       indietro dal lato opposto. Niente dissolvenze, niente passi imposti.

       Il motore è uno scorrevole nativo trasparente steso sopra il mazzo:
       trackpad, dito e inerzia li fa il browser, che è l'unico a saperli fare
       bene — i tentativi di contare le scrollate a mano finivano sempre o
       troppo sordi o troppo sensibili. Le carte le muove il js leggendo
       `scrollLeft`. L'infinito è lo stesso trucco della ruota: celle ripetute
       e ritorno silenzioso al centro. */
    const items = Array.isArray(p.media) ? p.media : [p.media];
    const multi = items.length > 1;
    if (multi) card.classList.add("project-card--multi");

    const stage = document.createElement("div");
    stage.className = "project-stage" + (multi ? " project-stage--multi" : "");
    /* Riquadro che prende la forma del contenuto. Il palco resta 16/9 e ne
       fissa l'altezza; dentro, questo riquadro si stringe sulla larghezza
       vera del media, così un verticale appare alla sua misura invece di
       stare in mezzo a due bande nere. Carte, frecce, pista e player stanno
       tutti qui dentro e si stringono con lui. */
    const box = document.createElement("div");
    box.className = "stage-box";
    stage.appendChild(box);
    const main = document.createElement("div");
    main.className = "project-deck";
    box.appendChild(main);
    card.appendChild(stage);

    const videos = [];
    /* larghezza/altezza di ogni media, appena il browser la conosce */
    const formati = [];
    function adattaFormato() {
      const r = formati[block._active];
      if (!r) return;
      box.style.setProperty("--ar", r.toFixed(4));
      stage.classList.add("is-fit");
      adattaAltezza();
    }

    /* Quanto può essere alto il riquadro. Prima era un 68% fisso dello
       schermo: con un video verticale 9:16 da telefono il riquadro arrivava
       a 517 px e, con titolo, etichetta e scheda sotto (282 px), player e
       descrizione finivano fuori dallo schermo. Ora è lo spazio che resta
       davvero: altezza visibile, meno i margini del blocco, meno quello che
       occupa il resto della scheda. Così tutto il progetto sta in una
       schermata; i formati orizzontali non ne sono toccati, perché lì
       comanda la larghezza. */
    function adattaAltezza() {
      if (!stage.classList.contains("is-fit")) return;
      const cs = getComputedStyle(block);
      const disponibile = scroller.clientHeight
        - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      // la scheda compatta per un istante: da telefono si allunga per
      // centrare video e dati, e il vuoto non va contato come contenuto
      block.classList.add("is-misura");
      const resto = card.offsetHeight - stage.offsetHeight;
      block.classList.remove("is-misura");
      const h = Math.max(180, Math.min(disponibile - resto - 8, innerHeight * 0.68));
      box.style.setProperty("--hmax", Math.floor(h) + "px");
    }
    block._altezza = adattaAltezza;

    items.forEach((m, k) => {
      const slide = document.createElement("figure");
      slide.className = "project-slide";

      const shade = document.createElement("span");
      shade.className = "slide-shade";
      shade.setAttribute("aria-hidden", "true");

      if (m.type === "video") {
        const v = document.createElement("video");
        v.muted = true; v.loop = true; v.playsInline = true;
        v.preload = "auto";
        if (m.poster) v.poster = m.poster;
        v.dataset.src = m.src;
        v.setAttribute("aria-label", (m.label || p.title));
        /* Se l'episodio completo non c'è (o non si carica) si ripiega sul clip
           da 10 secondi; se non c'è neanche quello resta il fotogramma di
           anteprima, e solo senza poster si scrive che manca il file. */
        v.addEventListener("error", () => {
          if (m.clip && v.dataset.src !== m.clip) {
            v.dataset.src = m.clip;
            v.src = m.clip;
            return;
          }
          if (!m.poster) {
            slide.innerHTML = '<div class="media-missing">media in arrivo — ' + m.src + "</div>";
          }
        });
        // il riquadro prende la forma del video invece di tagliarlo
        v.addEventListener("loadedmetadata", () => {
          if (!v.videoWidth || !v.videoHeight) return;
          formati[k] = v.videoWidth / v.videoHeight;
          adattaFormato();
        });
        slide.appendChild(v);

        /* L'anteprima come immagine vera sopra al video. Il `poster` del video
           non basta: quando una carta smette di essere attiva le tolgo il
           video (gli episodi pesano centinaia di mega) e quella nuova lo
           riceve a metà del movimento. In quell'istante, su iOS soprattutto,
           il riquadro non ha né fotogramma né poster e diventa nero. Questa
           copertina sparisce solo quando il video ha mostrato davvero il suo
           primo fotogramma, e torna appena la carta smette di essere attiva. */
        if (m.poster) {
          const cop = document.createElement("img");
          cop.className = "slide-cover";
          cop.src = m.poster;
          cop.alt = "";
          cop.decoding = "async";
          cop.setAttribute("aria-hidden", "true");
          slide.appendChild(cop);
          const scopri = () => {
            if (!v.getAttribute("src")) return;
            if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(() => slide.classList.add("is-frame"));
            else slide.classList.add("is-frame");
          };
          v.addEventListener("playing", scopri);
          v.addEventListener("seeked", scopri);
          v.addEventListener("emptied", () => slide.classList.remove("is-frame"));
        }
        videos.push(v);
      } else {
        const img = document.createElement("img");
        img.src = m.src;
        img.alt = "Anteprima — " + p.title;
        img.loading = "lazy";
        img.addEventListener("error", () => {
          slide.innerHTML = '<div class="media-missing">media in arrivo — ' + m.src + "</div>";
        });
        img.addEventListener("load", () => {
          if (!img.naturalWidth || !img.naturalHeight) return;
          formati[k] = img.naturalWidth / img.naturalHeight;
          adattaFormato();
        });
        slide.appendChild(img);
        videos.push(null);
      }

      slide.appendChild(shade);
      slide._shade = shade;
      main.appendChild(slide);
    });

    const slides = [...main.children];

    // etichetta dell'episodio, solo quando ce n'è più di uno
    let epLabel = null;
    if (multi) {
      epLabel = document.createElement("p");
      epLabel.className = "project-ep";
      epLabel.textContent = items[0].label || "";
      card.appendChild(epLabel);
    }

    /* ---------- il mazzo e il suo scorrevole ---------- */
    const NCOPIE = 9;                 // quante volte si ripete l'elenco
    const SLOT_X = 0.25;              // di quanto si sposta una carta per posto
    let track = null, ghost = null, chevL = null, chevR = null;
    let deckRaf = null;

    const wrap = (i) => ((i % items.length) + items.length) % items.length;

    if (multi) {
      /* carta finta: con due soli episodi l'altro deve comparire su ENTRAMBI
         i lati, ma un <video> non può stare in due posti. La copia è solo il
         fotogramma fermo e non arriva mai al centro — sta sempre dal lato
         opposto a quello verso cui ti stai muovendo, dove è indistinguibile
         dalla carta vera. */
      if (items.length === 2) {
        ghost = document.createElement("figure");
        ghost.className = "project-slide project-slide--ghost";
        const gi = document.createElement("img");
        gi.alt = ""; gi.loading = "lazy";
        ghost.appendChild(gi);
        const gs = document.createElement("span");
        gs.className = "slide-shade";
        gs.setAttribute("aria-hidden", "true");
        ghost.appendChild(gs);
        ghost._shade = gs;
        main.appendChild(ghost);
      }

      /* Erano <span> con pointer-events:none, e per giunta stanno **fuori**
         dal riquadro, dove la pista non arriva: non erano cliccabili da
         nessuna parte. Ora sono bottoni veri. */
      const chev = (dir) => {
        const c = document.createElement("button");
        c.type = "button";
        c.className = "deck-nav deck-nav--" + dir;
        c.setAttribute("aria-label", dir === "prev" ? "Episodio precedente" : "Episodio successivo");
        c.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" ' +
          'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
          'stroke-linejoin="round"/></svg>';
        c.addEventListener("click", (e) => {
          e.stopPropagation();
          nudge(dir === "prev" ? -1 : 1);
        });
        return c;
      };
      chevL = chev("prev"); chevR = chev("next");
      box.append(chevL, chevR);

      track = document.createElement("div");
      track.className = "project-track";
      track.setAttribute("aria-label", "Scorri tra gli episodi");
      for (let c = 0; c < NCOPIE * items.length; c++) {
        const cell = document.createElement("div");
        cell.className = "track-cell";
        track.appendChild(cell);
      }
      box.appendChild(track);
    }

    const cellW = () => track.clientWidth || 1;
    /* L'episodio che stai guardando è un NUMERO, non una posizione in pixel.
       Prima lo ricavavo da scrollLeft ÷ larghezza: ruotando il telefono la
       larghezza cambia, e WebKit durante il riadattamento può toccare anche
       scrollLeft per conto suo; il conto sbagliava di un episodio e tornando
       in verticale il video era cambiato. Ora la posizione in pixel si
       ricava sempre da qui, e mai il contrario. */
    let cella = 0;

    /* ritorno silenzioso al centro: il salto è di un numero intero di blocchi,
       quindi le carte si ritrovano esattamente dov'erano */
    function recentreTrack() {
      const n = items.length;
      let salto = 0;
      if (cella < n * 1.5) salto = n * (NCOPIE - 3);
      else if (cella > n * (NCOPIE - 1.5)) salto = -n * (NCOPIE - 3);
      if (!salto) return;
      cella += salto;
      track.scrollLeft = cella * cellW();
    }

    // rimette la pista esattamente sull'episodio corrente (dopo rotazioni)
    function riallinea() {
      if (!multi || modo === "assesta") return;
      track.scrollLeft = cella * cellW();
      paintDeck();
    }
    block._riallinea = riallinea;

    /* posa una carta al posto `pos` (0 = davanti, ±1 = un posto di lato)

       Spostamento e rimpicciolimento non seguono la corsa in modo lineare ma
       con una curva che parte ripida: appena inizi a scorrere, la carta
       davanti si ritira subito e fa spazio, invece di restare grande fino a
       metà strada e poi farsi passare davanti di colpo dall'altra. A fine
       corsa le curve valgono 1, quindi la posizione di riposo non cambia. */
    function place(node, pos) {
      const a = Math.abs(pos);
      const eX = Math.pow(Math.min(a, 2), 0.4);
      const eS = Math.pow(Math.min(a, 2), 0.5);
      /* Scostamento e rimpicciolimento in più, che valgono zero da ferme e
         massimo a metà corsa. Servono a far passare le due carte senza che
         si tocchino: a metà strada la distanza fra i centri è 0.78 di
         larghezza contro 0.70 di ingombro, cioè restano staccate proprio nel
         punto in cui si scambiano il piano. Senza, quella che entra resta
         nascosta dietro per mezza corsa e poi compariva tutta in una volta:
         era quello lo scatto. */
      const arco = Math.sin(Math.PI * Math.min(a, 1));
      // da telefono lo spazio ai lati è poco: lo scarto è più contenuto
      const stretto = innerWidth < 720;
      const scarto = stretto ? 0.17 : 0.18;
      const rientro = stretto ? 0.24 : 0.21;
      const x = Math.sign(pos) * (eX * SLOT_X + scarto * arco);
      const s = 1 - 0.14 * eS - rientro * arco;
      node.style.transform =
        "translate3d(" + (x * 100).toFixed(3) + "%,0,0) scale(" + s.toFixed(4) + ")";
      /* niente `filter`: ridisegnava il fotogramma del video a ogni passo.
         Il buio lo fa un velo nero di cui cambia solo l'opacità. */
      if (node._shade) node._shade.style.opacity = (0.62 * Math.min(eS, 1)).toFixed(3);
      /* La carta più lontana, a metà corsa, salta dall'altro lato: con due
         episodi è la copia, con tre è il terzo, e in generale è sempre lo
         stesso elemento a servire i due lati opposti. Il salto avviene
         intorno a |pos| 1.4, quindi la dissolvenza deve essere già finita
         a 1.35: così cambia lato mentre è invisibile. */
      node.style.opacity = a > 1 ? clamp((1.35 - a) / 0.35).toFixed(3) : "1";
      // scala fine: due carte quasi appaiate non finiscono nello stesso piano
      node.style.zIndex = String(Math.round(1000 - Math.min(a, 2) * 400));
      node.style.pointerEvents = "none";
    }

    function park(node) {          // fuori dai tre posti visibili
      node.style.opacity = "0";
      node.style.zIndex = "0";
    }

    function paintDeck() {
      if (!multi) return;
      const off = track.scrollLeft / cellW();
      const base = Math.round(off);
      const f = off - base;                       // -0.5 … 0.5
      const centro = wrap(base);
      const altro = wrap(base + (f >= 0 ? 1 : -1));   // dove stai andando
      const posAvanti = (f >= 0 ? 1 : -1) - f;
      const posDietro = (f >= 0 ? -1 : 1) - f;

      slides.forEach((node, i) => {
        if (i === centro) place(node, -f);
        else if (i === altro) place(node, posAvanti);
        else if (items.length > 2 && i === wrap(base - (f >= 0 ? 1 : -1))) place(node, posDietro);
        else park(node);
      });

      if (ghost) {
        // la copia riempie il lato da cui ti stai allontanando
        const gi = ghost.firstChild;
        const src = items[altro].poster || items[altro].src;
        if (gi.getAttribute("src") !== src) gi.setAttribute("src", src);
        place(ghost, posDietro);
      }

      const nuovo = centro;
      if (nuovo !== block._active && !inPieno()) block._show(nuovo, soundOn || block.classList.contains("is-live"));
    }

    /* ---------- il movimento ----------
       Un gesto = un episodio, con la stessa curva delle frecce: trackpad,
       dito e tastiera passano tutti da `nudge`. La pista non scorre più da
       sola (`overflow: hidden`), serve solo a leggere il gesto e i clic;
       la posizione la scrive solo il tween qui sotto. Così non c'è più uno
       scorrimento libero seguito da un assestamento, cioè due movimenti
       diversi attaccati. */
    const DUR_FRECCIA = 520;
    let modo = "fermo";
    let tFrom = 0, tTo = 0, tT0 = 0, tDur = 0;

    function tweenA(target, dur) {
      tFrom = track.scrollLeft; tTo = target; tDur = dur; tT0 = performance.now();
      if (reduceMotion || Math.abs(tTo - tFrom) < 0.5) {
        track.scrollLeft = target; recentreTrack(); paintDeck(); modo = "fermo"; return;
      }
      const partiva = modo === "assesta";
      modo = "assesta";
      if (!partiva) requestAnimationFrame(ciclo);
    }

    function ciclo(now) {
      if (modo !== "assesta") return;
      const t = Math.min(1, (now - tT0) / tDur);
      // morbida in entrata e in uscita: né strappo alla partenza né all'arrivo
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      track.scrollLeft = tFrom + (tTo - tFrom) * e;
      paintDeck();
      if (t >= 1) {
        modo = "fermo";
        recentreTrack();      // mai a metà tween: sposta di blocchi interi
        paintDeck();
        return;
      }
      requestAnimationFrame(ciclo);
    }

    function nudge(dir) {
      if (!multi) return;
      // da fermi la pista si rimette esattamente sull'episodio: un passo è
      // sempre una carta sola, anche se qualcosa l'avesse spostata
      if (modo !== "assesta") track.scrollLeft = cella * cellW();
      // se un movimento è già in corso si parte da dove arriverà, così due
      // frecce di fila fanno due episodi invece di annullarsi
      cella += dir;
      tweenA(cella * cellW(), DUR_FRECCIA);
    }

    if (multi) {
      /* Trackpad. Il punto delicato resta la coda d'inerzia: dopo che hai
         staccato le dita il browser continua a mandare eventi per più di un
         secondo, e presi alla lettera farebbero scorrere tre episodi. Dopo
         uno scatto si sta sordi per la durata del movimento; l'inerzia cala
         sempre, quindi se la spinta torna a crescere è una mano nuova e si
         riparte subito. */
      /* Trackpad.

         Distinguere il gesto vero dalla coda d'inerzia guardando la forma
         degli eventi non funziona: ci ho provato in tre modi diversi e su
         hardware vero fallivano tutti, o incatenando gli episodi o — peggio —
         restando sordi per sempre dopo il primo scatto. La coda dura più di
         un secondo e assomiglia troppo a una mano che continua.

         Quindi niente più sordina che possa restare incastrata: qui c'è solo
         una pausa fissa lunga quanto il movimento, e dopo di quella per fare
         un altro episodio serve molta più strada (320px invece di 30). Una
         scrollata normale ne fa uno; la coda di una flickata forte, quel che
         le resta dopo mezzo secondo, al massimo ne fa un altro. Il caso
         peggiore è un episodio di troppo, mai il blocco. */
      const SOGLIA_PRIMA = 30;    // per il primo scatto, dopo una pausa
      const SOGLIA_ANCORA = 320;  // per continuare dentro lo stesso flusso
      const QUIETE = 120;
      let accX = 0, verso = 0, quietT = null, soglia = SOGLIA_PRIMA, pausaFino = 0;

      track.addEventListener("wheel", (ev) => {
        // verticale: è il passaggio da un progetto all'altro, non si tocca
        if (Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return;
        ev.preventDefault();

        // dopo un po' di silenzio si riparte come nuovi
        clearTimeout(quietT);
        quietT = setTimeout(() => { accX = 0; verso = 0; soglia = SOGLIA_PRIMA; pausaFino = 0; }, QUIETE);

        const ora = performance.now();
        if (ora < pausaFino) return;            // il movimento è ancora in corso

        const segno = Math.sign(ev.deltaX);
        // cambio di verso: l'inerzia non torna mai indietro, è una mano nuova
        if (verso && segno !== verso) { accX = 0; soglia = SOGLIA_PRIMA; }
        verso = segno;

        if (accX !== 0 && segno !== Math.sign(accX)) accX = 0;
        accX += ev.deltaX;
        if (Math.abs(accX) > soglia) {
          nudge(accX > 0 ? 1 : -1);
          accX = 0;
          soglia = SOGLIA_ANCORA;
          pausaFino = ora + DUR_FRECCIA;
        }
      }, { passive: false });

      /* Dito. Qui i confini del gesto li dà il browser, non serve indovinarli:
         uno strisciamento, uno scatto. */
      let tx = 0, ty = 0, seguo = false;
      track.addEventListener("touchstart", (ev) => {
        if (ev.touches.length !== 1) return;
        tx = ev.touches[0].clientX; ty = ev.touches[0].clientY; seguo = true;
      }, { passive: true });
      track.addEventListener("touchmove", (ev) => {
        if (!seguo) return;
        const dx = ev.touches[0].clientX - tx, dy = ev.touches[0].clientY - ty;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        seguo = false;
        nudge(dx < 0 ? 1 : -1);
      }, { passive: true });
      track.addEventListener("touchend", () => { seguo = false; }, { passive: true });

      /* clic: al centro accende e spegne il video, sui lati porta di là.
         Si conta solo se il dito non si è mosso, se no ogni trascinamento
         finirebbe per essere anche un clic. */
      let downX = 0, downY = 0;
      track.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; });
      track.addEventListener("click", (e) => {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
        e.stopPropagation();
        const r = track.getBoundingClientRect();
        const rel = (e.clientX - r.left) / r.width - 0.5;      // -0.5 … 0.5
        if (Math.abs(rel) < 0.5 - SLOT_X) {
          const v = current();
          if (v) { if (v.paused) v.play().catch(() => {}); else v.pause(); }
        } else {
          nudge(rel > 0 ? 1 : -1);
        }
      });
    }

    block._step = multi ? nudge : null;

    /* ---------- player minimale ---------- */
    const hasVideo = videos.some(Boolean);
    let ui, bar, fill, bPlay, bSound, bFull;

    if (hasVideo) {
      ui = document.createElement("div");
      ui.className = "vplayer";
      ui.innerHTML =
        '<button class="vbtn vbtn--play" type="button" aria-label="Pausa">' +
          '<svg class="ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>' +
          '<svg class="ico-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg>' +
        '</button>' +
        '<div class="vbar"><span class="vbar-fill"></span></div>' +
        '<button class="vbtn vbtn--sound" type="button" aria-label="Disattiva l\'audio">' +
          '<svg class="ico-on" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M11 5 6 9H3v6h3l5 4z"/>' +
            '<path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
            '<path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
          '</svg>' +
          '<svg class="ico-off" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M11 5 6 9H3v6h3l5 4z"/>' +
            '<path d="M22 9.5 17.5 14M17.5 9.5 22 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
        '<button class="vbtn vbtn--full" type="button" aria-label="Schermo intero">' +
          '<svg class="ico-full" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
          '<svg class="ico-exit" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</button>';
      box.appendChild(ui);              // il player sta dentro al video
      bar = ui.querySelector(".vbar");
      fill = ui.querySelector(".vbar-fill");
      bPlay = ui.querySelector(".vbtn--play");
      bSound = ui.querySelector(".vbtn--sound");
      bFull = ui.querySelector(".vbtn--full");
    }

    const current = () => videos[block._active] || null;

    /* La barra si riempie a ogni fotogramma: con l'evento `timeupdate`
       avanzava a scatti, quello arriva quattro o cinque volte al secondo. */
    let raf = null;
    const paint = () => {
      const v = current();
      if (v && v.duration && fill) fill.style.width = ((v.currentTime / v.duration) * 100).toFixed(3) + "%";
      raf = requestAnimationFrame(paint);
    };
    const startPaint = () => { if (!raf && fill) raf = requestAnimationFrame(paint); };
    const stopPaint = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

    videos.forEach((v) => {
      if (!v) return;
      v.addEventListener("play", () => { startPaint(); block.classList.add("is-playing"); });
      v.addEventListener("pause", () => {
        if (!videos.some((x) => x && !x.paused)) { stopPaint(); block.classList.remove("is-playing"); }
      });
      v.addEventListener("click", (e) => {
        e.stopPropagation();
        if (v.paused) v.play().catch(() => {}); else v.pause();
      });
    });

    if (hasVideo) {
      bPlay.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = current();
        if (!v) return;
        if (v.paused) v.play().catch(() => {}); else v.pause();
      });
      bSound.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = current();
        if (!v) return;
        v.muted = !v.muted;
        soundOn = !v.muted;
        block.classList.toggle("is-live", !v.muted);
        bSound.setAttribute("aria-label", v.muted ? "Attiva l'audio" : "Disattiva l'audio");
        if (v.paused) v.play().catch(() => {});
      });
      /* Schermo intero sul video che si sta guardando. In questo modo se ne
         occupa il browser: da telefono iOS usa il suo player a pieno schermo,
         che è l'unico modo per farlo lì. */
      /* Prima si prova lo schermo intero vero del browser. Non sempre è
         concesso (dentro un pannello incorporato la richiesta viene ignorata
         in silenzio, senza errore), quindi se dopo un attimo non è successo
         niente apriamo il nostro: il video si stende su tutta la finestra e i
         comandi restano dove sono. */
      block._cinema = (on) => {
        if (on) entraPieno(block);
        else if (card.classList.contains("is-cinema")) esciPieno();
        card.classList.toggle("is-cinema", on);
        document.documentElement.classList.toggle("is-cinema", on);
        ui.classList.toggle("is-full", on);
        slides.forEach((s, n) => {
          s.style.opacity = on ? (n === block._active ? "1" : "0") : "";
          s.style.transform = on && n === block._active ? "none" : (on ? s.style.transform : "");
          s.style.zIndex = on ? (n === block._active ? "3" : "0") : "";
          if (s._shade) s._shade.style.opacity = on && n === block._active ? "0" : s._shade.style.opacity;
        });
        if (ghost) ghost.style.opacity = on ? "0" : ghost.style.opacity;
        if (!on) paintDeck();
      };

      bFull.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = current();
        if (!v) return;

        if (card.classList.contains("is-cinema")) { block._cinema(false); return; }
        if (document.fullscreenElement) { document.exitFullscreen(); return; }

        const apri = v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen;
        entraPieno(block);
        if (apri) {
          try {
            const p = apri.call(v);
            if (p && p.catch) p.catch(() => {});
          } catch (_) { /* vecchi browser senza schermo intero */ }
        }
        // se lo schermo intero del browser non è arrivato, ci pensiamo noi
        setTimeout(() => {
          if (!document.fullscreenElement && !v.webkitDisplayingFullscreen) block._cinema(true);
        }, 250);
      });
      const cambioPieno = () => {
        const el = document.fullscreenElement || document.webkitFullscreenElement;
        ui.classList.toggle("is-full", !!el);
        if (el && block.contains(el)) entraPieno(block);
        else if (!el && bloccoPieno === block && !card.classList.contains("is-cinema")) esciPieno();
      };
      document.addEventListener("fullscreenchange", cambioPieno);
      document.addEventListener("webkitfullscreenchange", cambioPieno);
      // iPhone: il player a schermo intero è quello di sistema, con eventi suoi
      videos.forEach((v) => {
        if (!v) return;
        v.addEventListener("webkitbeginfullscreen", () => entraPieno(block));
        v.addEventListener("webkitendfullscreen", () => esciPieno());
      });

      bar.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = current();
        if (!v || !v.duration) return;
        const r = bar.getBoundingClientRect();
        v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
        if (fill) fill.style.width = ((v.currentTime / v.duration) * 100).toFixed(3) + "%";
      });
    }

    /* ---------- stato del blocco ---------- */
    block._active = 0;

    block._show = (k, sound) => {
      block._active = k;
      if (block._scheda) block._scheda(k);
      adattaFormato();
      if (epLabel) epLabel.textContent = items[k].label || "";

      videos.forEach((v, n) => {
        if (!v) return;
        if (n === k) return;
        v.pause();
        v.muted = true;
        // la copertina torna PRIMA di togliere il video: nessun istante nero
        slides[n].classList.remove("is-frame");
        // gli episodi completi pesano centinaia di mega: quello che non si sta
        // guardando smette di scaricare e torna al suo poster
        if (v.getAttribute("src")) { v.removeAttribute("src"); v.load(); }
      });

      const v = videos[k];
      if (!v) { block.classList.remove("is-live"); return; }
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      if (sound) v.muted = false;
      block.classList.toggle("is-live", !v.muted);
      if (bSound) bSound.setAttribute("aria-label", v.muted ? "Attiva l'audio" : "Disattiva l'audio");
      v.play().catch(() => {
        // se il browser rifiuta l'audio, si riparte in muto
        v.muted = true;
        block.classList.remove("is-live");
        v.play().catch(() => {});
      });
    };

    block._stop = () => {
      videos.forEach((v) => { if (v) { v.pause(); v.muted = true; } });
      block.classList.remove("is-live");
      stopPaint();
    };

    /* si parte con lo scorrevole al centro dell'elenco ripetuto */
    if (multi) {
      requestAnimationFrame(() => {
        cella = items.length * Math.floor(NCOPIE / 2);
        track.scrollLeft = cella * cellW();
        paintDeck();
      });
      /* La pista cambia larghezza anche senza che la finestra cambi: quando
         il video carica e se ne scopre il formato, il riquadro si stringe
         (le Botteghe sono 4:3). Senza riallineare, la posizione restava
         calcolata sulla larghezza vecchia e al primo passo il mazzo correva
         attraverso decine di carte in mezzo secondo. Qualunque cambio di
         larghezza riporta la pista esattamente sull'episodio corrente. */
      if ("ResizeObserver" in window) {
        let ultimaLarghezza = 0;
        new ResizeObserver(() => {
          const w = track.clientWidth;
          if (!w || w === ultimaLarghezza) return;
          ultimaLarghezza = w;
          if (modo === "assesta") modo = "fermo";
          track.scrollLeft = cella * w;
          recentreTrack();
          paintDeck();
        }).observe(track);
      }
      /* La posizione è in pixel: se la larghezza cambia (rotazione, schermo
         intero) va riscalata, altrimenti la stessa posizione cade su un altro
         episodio. Si riscala anche un movimento in corso. */
      addEventListener("resize", () => {
        if (!block.isConnected) return;
        // un movimento a metà durante una rotazione arriva subito a destinazione
        if (modo === "assesta") modo = "fermo";
        track.scrollLeft = cella * cellW();
        recentreTrack();
        paintDeck();
      }, { passive: true });
    }

    /* ---------- scheda tecnica ----------
       Data, cliente e descrizione possono cambiare da un episodio all'altro
       (ognuno delle Botteghe ha il suo): ogni video/foto di `media` può
       sovrascrivere quelli del progetto, e la scheda si riscrive quando
       cambia l'episodio (vedi _show). I clienti con un sito sono link. */
    const info = document.createElement("div");
    info.className = "project-info";
    const campo = (k, nome) => (items[k] && nome in items[k] ? items[k][nome] : p[nome]);
    const nuovaCella = (titolo, larga) => {
      const c = document.createElement("div");
      c.className = "info-cell" + (larga ? " info-cell--wide" : "");
      c.innerHTML = "<h3></h3><div class=\"info-val\"></div>";
      c.querySelector("h3").textContent = titolo;
      info.appendChild(c);
      return c;
    };
    const cData = nuovaCella("Data"), cCliente = nuovaCella("Cliente"), cDescr = nuovaCella("Descrizione", true);
    /* Tutti i testi della scheda stanno su due righe esatte (CSS): la scheda
       ha la stessa altezza per ogni episodio, quindi il video non cambia
       misura passando da uno all'altro. Un testo più lungo si taglia e
       compare "leggi tutto": aprendolo si allunga verso il basso, ma il video
       resta com'è (l'altezza la misura adattaAltezza sempre a due righe). */
    [cData, cCliente, cDescr].forEach((c) => c.querySelector(".info-val").classList.add("info-val--due"));
    const altro = document.createElement("button");
    altro.type = "button";
    altro.className = "info-altro";
    altro.textContent = "leggi tutto";
    cDescr.appendChild(altro);
    altro.addEventListener("click", (e) => {
      e.stopPropagation();
      const aperta = cDescr.classList.toggle("is-aperta");
      altro.textContent = aperta ? "chiudi" : "leggi tutto";
    });
    // la riga della descrizione sparisce solo se nel progetto non ce n'è nessuna
    const qualcheDescr = items.some((m, k) => campo(k, "description"));

    function scriviScheda(k) {
      const data = campo(k, "date") || "";
      const clienti = campo(k, "clients") || [];
      const descr = campo(k, "description") || "";

      cData.querySelector(".info-val").textContent = data || "—";

      const vc = cCliente.querySelector(".info-val");
      vc.textContent = "";
      clienti.forEach((cl, n) => {
        if (n) vc.appendChild(document.createTextNode(", "));
        if (cl.url) {
          const a = document.createElement("a");
          a.className = "client-link";
          a.href = cl.url;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = cl.name;
          vc.appendChild(a);
        } else {
          vc.appendChild(document.createTextNode(cl.name));
        }
      });
      if (!clienti.length) vc.textContent = "—";

      // una riga di testo = un paragrafo; senza descrizione la riga sparisce
      const vd = cDescr.querySelector(".info-val");
      vd.textContent = "";
      descr.split("\n").filter(Boolean).forEach((riga) => {
        const par = document.createElement("p");
        par.textContent = riga;
        vd.appendChild(par);
      });
      // vuota ma con altri episodi descritti: lo spazio resta, il testo no
      cDescr.hidden = !qualcheDescr;
      cDescr.classList.toggle("is-vuota", !descr);
      cDescr.classList.remove("is-aperta");
      altro.textContent = "leggi tutto";
      // lo spazio del pulsante c'è sempre (altezza costante), si vede solo se serve
      altro.classList.toggle("is-inutile", !(vd.scrollHeight > vd.clientHeight + 1));
    }
    block._scheda = scriviScheda;
    scriviScheda(0);
    card.appendChild(info);

    return block;
  }

  PROJECTS.forEach((p) => {
    const b = buildBlock(p);
    blocks.push(b);
    scroller.appendChild(b);
  });

  /* Il video si carica e parte solo quando il suo blocco è in campo.
     L'audio segue: se lo stavi ascoltando, scorrendo al progetto successivo
     continui a sentirlo senza doverlo riaccendere. */
  /* Suona un solo progetto alla volta: quello più vicino al centro, e solo
     se è davvero in vista. Prima ogni blocco che entrava in campo partiva
     per conto suo, e quando la finestra si allargava ne partivano diversi. */
  let inCampo = null;

  function aggiornaInCampo() {
    if (!isOpen || inPieno()) return;
    const r0 = scroller.getBoundingClientRect();
    const h = scroller.clientHeight, mid = r0.top + h / 2;
    let best = null, bestD = Infinity;
    blocks.forEach((b) => {
      const r = b.getBoundingClientRect();
      const vis = Math.min(r.bottom, r0.top + h) - Math.max(r.top, r0.top);
      if (vis < Math.min(r.height, h) * 0.55) return;
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = b; }
    });
    suona(best);
  }

  function suona(b) {
    if (b === inCampo) return;
    if (inCampo && inCampo._stop) inCampo._stop();
    inCampo = b;
    if (b && b._show) b._show(b._active || 0, soundOn);
  }

  function centra(b) {
    scroller.scrollTop = b.offsetTop - (scroller.clientHeight - b.offsetHeight) / 2;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(() => aggiornaInCampo(),
      { root: scroller, threshold: [0, 0.25, 0.55, 0.8, 1] });
    blocks.forEach((b) => io.observe(b));
  }

  /* ruotando il telefono l'altezza dei blocchi cambia sotto lo scorrimento:
     si resta sul progetto che stavi guardando */
  let giroT = null;
  addEventListener("resize", () => {
    if (!isOpen || inPieno()) return;
    clearTimeout(giroT);
    giroT = setTimeout(() => {
      blocks.forEach((b) => b._altezza && b._altezza());
      if (inCampo) centra(inCampo);
      raddrizza();
      aggiornaInCampo();
    }, 180);
  }, { passive: true });

  // dopo che site.js ha rifatto l'impaginazione (rotazione su iPhone) ogni
  // mazzo torna esattamente sul suo episodio
  document.addEventListener("ripaginato", () => {
    blocks.forEach((b) => b._riallinea && b._riallinea());
    raddrizza();
  });

  /* iPhone: dopo una rotazione il pannello a volte resta spostato di lato.
     Qui si azzerano gli scostamenti del catalogo; il ricalcolo completo della
     pagina dopo la rotazione lo fa js/site.js, per tutte le pagine. */
  function raddrizza() {
    scroller.scrollLeft = 0;
    wheel.scrollLeft = 0;
  }


  /* click fuori dalla scheda: si torna al catalogo */
  scroller.addEventListener("click", (e) => {
    if (!e.target.closest(".project-card")) closePanel();
  });

  /* l'indirizzo segue il progetto che stai guardando */
  let hashRaf = null;
  scroller.addEventListener("scroll", () => {
    if (hashRaf) return;
    hashRaf = requestAnimationFrame(() => {
      hashRaf = null;
      const mid = scroller.clientHeight / 2;
      let best = 0, bestD = Infinity;
      blocks.forEach((b, i) => {
        const r = b.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - scroller.getBoundingClientRect().top - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      const slug = PROJECTS[best].slug;
      if (location.hash !== "#" + slug) history.replaceState(null, "", "#" + slug);
    });
  }, { passive: true });

  function openPanel() {
    if (isOpen) return;
    isOpen = true;
    savedScroll = window.scrollY;
    body.style.top = -savedScroll + "px";
    body.classList.add("is-locked");
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    body.dataset.view = "project";
  }

  function closePanel() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    body.classList.remove("is-locked");
    body.style.top = "";
    window.scrollTo({ top: savedScroll, behavior: "instant" });
    body.dataset.view = "catalogue";
    history.replaceState(null, "", location.pathname);
    blocks.forEach((b) => { if (b._stop) b._stop(); });
    inCampo = null;
    soundOn = false;
  }

  document.querySelectorAll("[data-close-project]").forEach((b) =>
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); closePanel(); })
  );
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // se si sta guardando a tutto schermo, il primo Esc esce solo da lì
      const cine = document.querySelector(".project-card.is-cinema");
      if (cine) { blocks.forEach((b) => b._cinema && b._cinema(false)); return; }
      closePanel();
      return;
    }
    if (!isOpen || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    // il progetto che stai guardando è quello a metà schermo
    const mid = scroller.clientHeight / 2;
    let best = null, bestD = Infinity;
    blocks.forEach((b) => {
      const r = b.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = b; }
    });
    if (!best || !best._step) return;
    e.preventDefault();
    best._step(e.key === "ArrowRight" ? 1 : -1);
  });

  function openProject(i, withSound) {
    openPanel();
    const b = blocks[i];
    if (b) {
      // salto secco all'apertura: da lì in poi si scorre
      centra(b);
      /* Aprendo da un click il video parte **con l'audio**: il click è un
         gesto dell'utente, quindi il browser lo consente. Aprendo da un link
         diretto (nessun gesto) resta muto: `_show` se ne accorge e riparte
         in muto da solo invece di non partire affatto. */
      if (withSound) soundOn = true;
      if (b._altezza) { b._altezza(); centra(b); }
      blocks.forEach((x) => { if (x !== b && x._stop) x._stop(); });
      inCampo = b;
      if (b._show) b._show(b._active || 0, !!withSound);
    }
    history.replaceState(null, "", "#" + PROJECTS[i].slug);
  }

  /* ==================== AVVIO ==================== */
  addEventListener("resize", updateWheel);

  function start() {
    // parto dal blocco centrale, così c'è corsa in tutte e due le direzioni
    wheel.scrollTop = blockH() * Math.floor(COPIES / 2);
    updateWheel();
    fromHash();
  }

  // tasto indietro, o link con hash arrivato a pagina già aperta
  function fromHash() {
    const slug = decodeURIComponent(location.hash.replace("#", ""));
    if (!slug) { closePanel(); return; }
    const i = PROJECTS.findIndex((p) => p.slug === slug);
    if (i >= 0) openProject(i);
  }
  addEventListener("hashchange", fromHash);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
