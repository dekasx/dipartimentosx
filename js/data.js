/* ============================================================
   DIPARTIMENTO SX — dati del sito
   Tutto ciò che è "contenuto" (progetti, servizi, foto) sta qui:
   per aggiornare il sito basta modificare questo file.
   I file media vanno messi in assets/ (vedi PLACEHOLDERS.md).
   ============================================================ */

/* ------------------------------------------------------------
   1. PROGETTI — alimentano sia il catalogue (ruota) sia il
   carosello "lavori selezionati" della home (quelli con reel: true)
   ------------------------------------------------------------ */
const PROJECTS = [
  {
    slug: "lodigiani",
    title: "Lodigiani \u00d7 Umbro",
    reel: true,
    portrait: true,   // girato 9:16: nel carosello non viene ritagliato
    media: { type: "video", src: "assets/projects/lodigiani.mp4", poster: "assets/projects/lodigiani-poster.jpg" },
    date: "2026 [PLACEHOLDER]",
    scope: "Fasce da capitano — contenuto brand [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Lodigiani, Umbro",
    description: "Descrizione del progetto Lodigiani x Umbro. [PLACEHOLDER]"
  },
  {
    slug: "documentario",
    title: "Documentario",
    media: { type: "video", src: "assets/projects/documentario.mp4", poster: "assets/projects/documentario-poster.jpg" },
    date: "2025 [PLACEHOLDER]",
    scope: "Documentario [PLACEHOLDER]",
    gear: "Camera + audio di presa diretta [PLACEHOLDER]",
    partner: "— [PLACEHOLDER]",
    description: "Descrizione del documentario: tema, ricerca e produzione. [PLACEHOLDER]"
  },
  {
    slug: "botteghe-storiche",
    title: "Botteghe Storiche di Quartiere",
    reel: true,
    // Più episodi dentro un'unica voce: `media` può essere una lista.
    // `src` è l'episodio completo in qualità piena, non convertito: lo usano
    // la scheda del catalogo e l'anteprima a tutto schermo della home.
    // `clip` sono i 10 secondi leggeri che girano nel carosello della home.
    media: [
      { type: "video", src: "assets/projects/botteghe/ep1.mp4", poster: "assets/projects/botteghe-ep1-poster.jpg", label: "Ep. 1 — Merceria Frustaci" },
      { type: "video", src: "assets/projects/botteghe/ep2.mp4", poster: "assets/projects/botteghe-ep2-poster.jpg", label: "Ep. 2 — Fratelli Tocci" },
      { type: "video", src: "assets/projects/botteghe/ep3.mp4", poster: "assets/projects/botteghe-ep3-poster.jpg", label: "Ep. 3 — Studio d’Arte Candeloro" },
      { type: "video", src: "assets/projects/botteghe/ep4.mp4", clip: "assets/projects/botteghe-ep4.mp4", poster: "assets/projects/botteghe-ep4-poster.jpg", label: "Ep. 4 — Il Dono degli Gnomi" },
      { type: "video", src: "assets/projects/botteghe/ep5.mp4", clip: "assets/projects/botteghe-ep5.mp4", poster: "assets/projects/botteghe-ep5-poster.jpg", label: "Ep. 5 — Di Biagio" },
      { type: "video", src: "assets/projects/botteghe/ep6.mp4", poster: "assets/projects/botteghe-ep6-poster.jpg", label: "Ep. 6 — Bar Orazio" },
      { type: "video", src: "assets/projects/botteghe/ep7.mp4", clip: "assets/projects/botteghe-ep7.mp4", poster: "assets/projects/botteghe-ep7-poster.jpg", label: "Ep. 7 — Mercato Arabo" }
    ],
    date: "2026 [PLACEHOLDER]",
    scope: "Serie documentaria [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "[PLACEHOLDER]",
    description: "Serie di ritratti delle botteghe storiche di quartiere. [PLACEHOLDER]"
  },
  {
    slug: "roland",
    title: "Roland",
        media: { type: "video", src: "assets/projects/roland.mp4", poster: "assets/projects/roland-poster.jpg" },
    date: "2024 [PLACEHOLDER]",
    scope: "Contenuto brand [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Roland",
    description: "Progetto realizzato per Roland. [PLACEHOLDER]"
  },
  {
    slug: "elektron",
    title: "Elektron",
    media: { type: "video", src: "assets/projects/elektron.mp4", poster: "assets/projects/elektron-poster.jpg" },
    date: "2024 [PLACEHOLDER]",
    scope: "Contenuto brand [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Elektron",
    description: "Progetto realizzato per Elektron. [PLACEHOLDER]"
  },
  {
    slug: "mercato-arabo",
    title: "Mercato Arabo",
    media: [
      { type: "video", src: "assets/projects/mercato-arabo-1.mp4", poster: "assets/projects/mercato-arabo-1-poster.jpg", label: "Mamma ho fatto la spesa" },
      { type: "video", src: "assets/projects/mercato-arabo-2.mp4", poster: "assets/projects/mercato-arabo-2-poster.jpg", label: "Teletrasporto" },
      { type: "video", src: "assets/projects/mercato-arabo-3.mp4", poster: "assets/projects/mercato-arabo-3-poster.jpg", label: "Walk &amp; Talk" }
    ],
    date: "2023 [PLACEHOLDER]",
    scope: "Reportage fotografico [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "— [PLACEHOLDER]",
    description: "Reportage al mercato arabo. [PLACEHOLDER]"
  },
  {
    slug: "artmosaic",
    title: "Artmosaic",
    media: { type: "video", src: "assets/projects/artmosaic.mp4", poster: "assets/projects/artmosaic-poster.jpg" },
    date: "2023 [PLACEHOLDER]",
    scope: "[PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Artmosaic",
    description: "[PLACEHOLDER]"
  },
  {
    slug: "zoom",
    title: "Zoom",
    media: { type: "video", src: "assets/projects/zoom-spot.mp4", poster: "assets/projects/zoom-spot-poster.jpg" },
    date: "2023 [PLACEHOLDER]",
    scope: "[PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Zoom",
    description: "[PLACEHOLDER]"
  },
  {
    slug: "beat-skatepark",
    title: "Beat Skatepark",
    reel: true,
    media: { type: "video", src: "assets/projects/beat-skatepark.mp4", poster: "assets/projects/beat-skatepark-poster.jpg" },
    date: "2023 [PLACEHOLDER]",
    scope: "Aftermovie / video evento [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Beat Skatepark",
    description: "[PLACEHOLDER]"
  },
  {
    slug: "cacao-crudo",
    title: "Cacao Crudo",
        media: [
      { type: "photo", src: "assets/projects/cacao-crudo-1.jpg", label: "Modern Pleasure — 01" },
      { type: "photo", src: "assets/projects/cacao-crudo-2.jpg", label: "Modern Pleasure — 02" },
      { type: "photo", src: "assets/projects/cacao-crudo-3.jpg", label: "Modern Pleasure — 03" },
      { type: "photo", src: "assets/projects/cacao-crudo-4.jpg", label: "Modern Pleasure — 04" },
      { type: "photo", src: "assets/projects/cacao-crudo-5.jpg", label: "Il Natale ha bisogno di un eroe" }
    ],
    date: "2022 [PLACEHOLDER]",
    scope: "Contenuto brand [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Cacao Crudo",
    description: "[PLACEHOLDER]"
  },
  {
    slug: "redbull",
    title: "RedBull",
        media: { type: "video", src: "assets/projects/redbull.mp4", poster: "assets/projects/redbull-poster.jpg" },
    date: "2022 [PLACEHOLDER]",
    scope: "[PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Red Bull",
    description: "[PLACEHOLDER]"
  },
  {
    slug: "umbro",
    title: "Umbro",
    media: [
      { type: "video", src: "assets/projects/umbro-1.mp4", poster: "assets/projects/umbro-1-poster.jpg", label: "Kit Reveal — Lodigiani" },
      { type: "video", src: "assets/projects/umbro-2.mp4", poster: "assets/projects/umbro-2-poster.jpg", label: "Fasce da capitano — reveal kit" },
      { type: "video", src: "assets/projects/umbro-3.mp4", poster: "assets/projects/umbro-3-poster.jpg", label: "Presentation video — Stefano Gallo" }
    ],
    date: "2022 [PLACEHOLDER]",
    scope: "[PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Umbro",
    description: "[PLACEHOLDER]"
  }
];

/* ------------------------------------------------------------
   2. SERVICES — index of section 3 (dotted lines).
   `align` places the label as in the reference layout
   (start | mid-start | center | mid-end | end).
   `target` is both the id of the teaser section on the home page and
   the slug of the dedicated page (<target>.html).
   ------------------------------------------------------------ */
const SERVICES = [
  { name: "Consulenza e Direzione Creativa",       target: "creative-direction",          align: "start" },
  { name: "Regia & Video",                         target: "directing-video-production",  align: "mid-start" },
  { name: "Musica, Sound Design & Foley",          target: "sound-design",                align: "end" },
  { name: "Web Development, UX & UI",              target: "web-development",             align: "center" },
  { name: "Studio Fotografico & Post-Produzione",  target: "photography",                 align: "start",
    // la sezione-vetrina di Photography è solo un carosello, senza testo:
    // questo serve alla fisarmonica su mobile
    blurb: "Mettiamo a disposizione il nostro studio fotografico e le nostre competenze per riprese, fotografia e sperimentazioni visive." }
];

/* ------------------------------------------------------------
   3. FOTOGRAFIA — carosello della sezione 8.
   Sostituisci con gli scatti veri (assets/img/photo-XX.jpg).
   ------------------------------------------------------------ */
const PHOTOS = [
  // Cacao Crudo alternato alle altre foto, così il carosello non ne fa una fila
  { src: "assets/img/photo-cacao-1.jpg", alt: "Cacao Crudo — confezione legata con una corda da arrampicata" },
  { src: "assets/img/merceria.jpg",      alt: "Merceria — still di scena" },
  { src: "assets/img/photo-cacao-2.jpg", alt: "Cacao Crudo — ritratto in controluce con la giacca aperta" },
  { src: "assets/img/photo-pic-1.jpg",   alt: "Persone davanti a un cancello, una con un peluche viola" },
  { src: "assets/img/photo-cacao-3.jpg", alt: "Cacao Crudo — operatore con videocamera in controluce" },
  { src: "assets/img/babbo-2.jpg",       alt: "Cacao Crudo — campagna di Natale" },
  { src: "assets/img/photo-cacao-4.jpg", alt: "Cacao Crudo — ritratto in controluce con il cappello" },
  { src: "assets/img/photo-pic-2.jpg",   alt: "Scale mobili viste dall’alto tra pareti di vetro" },
  { src: "assets/img/photo-cacao-5.jpg", alt: "Cacao Crudo — ritratto in controluce con il cappuccio" },
  { src: "assets/img/zoom.jpg",          alt: "Registrazione ambientale — Zoom H6" },
  { src: "assets/img/photo-cacao-6.jpg", alt: "Cacao Crudo — grafica con fava di cacao su fondo giallo" },
  { src: "assets/img/photo-pic-3.jpg",   alt: "Due persone su una passerella in un atrio di vetro" },
  { src: "assets/img/photo-cacao-7.jpg", alt: "Cacao Crudo — Il processo crudo. A freddo." },
  { src: "assets/img/photo-pic-4.jpg",   alt: "Sala con stendardi e una persona di spalle" },
  { src: "assets/img/photo-cacao-8.jpg", alt: "Cacao Crudo — Babbo Natale con fumogeno rosso" }
];

/* Carosello "lavori selezionati" della home: l'ordine è deciso qui, non da
   quello dei progetti. `episode` sceglie il video per i progetti che ne hanno
   più d'uno; `title` sostituisce il nome mostrato. */
const REEL = [
  { slug: "beat-skatepark" },
  { slug: "botteghe-storiche", episode: 3 },
  { slug: "lodigiani" },
  { slug: "botteghe-storiche", episode: 6, title: "Botteghe Storiche di Quartiere — Ep. 7 — Mercato Arabo" }
];
