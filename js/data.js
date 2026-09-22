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
/* ==================== PROGETTI DEL CATALOGO ====================
   Ogni progetto ha: data, clienti e descrizione. I clienti sono
   { name, url }: col sito il nome diventa un link (utile anche ai motori di
   ricerca), senza sito resta testo. Ogni singolo video o foto di `media`
   può sovrascrivere date, clients o description: la scheda cambia insieme
   all'episodio. Descrizione vuota = la riga non si mostra.
   hidden: true = per ora non compare da nessuna parte (basta toglierlo). */
const CLIENTI = {
  candeloro:   { name: "Studio d'Arte Candeloro", url: "https://www.studiodartecandeloro.it/" },
  frustaci:    { name: "Merceria Frustaci" },
  tocci:       { name: "Fratelli Tocci" },
  gnomi:       { name: "Il Dono degli Gnomi" },
  dibiagio:    { name: "Di Biagio" },
  orazio:      { name: "Bar Orazio" },
  mercatoArabo:{ name: "Mercato Arabo", url: "https://www.mercatoarabo.it/" },
  beat:        { name: "Beat Skatepark", url: "https://beatsb.it/" },
  rce:         { name: "RCE Foto", url: "https://www.rcefoto.it/" },
  cacaoCrudo:  { name: "Cacao Crudo S.r.l.", url: "https://cacaocrudo.it/" },
  elektron:    { name: "Elektron", url: "https://www.elektron.se/" },
  lodigiani:   { name: "Lodigiani" },
  umbro:       { name: "Umbro", url: "https://www.umbro.com/it/" },
  fasce:       { name: "fascedacapitano.it", url: "https://fascedacapitano.it/" },
  halal:       { name: "Halal Express" },
  roland:      { name: "Roland Corporation", url: "https://www.roland.com/it/" },
  zoom:        { name: "Zoom", url: "https://zoomcorp.com/" }
};

const PROJECTS = [
  {
    slug: "lodigiani",
    title: "Lodigiani × Umbro",
    reel: true,
    portrait: true,   // girato 9:16: nel carosello non viene ritagliato
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/lodigiani.mp4", poster: "assets/projects/lodigiani-poster.jpg" },
    date: "2024",
    clients: [CLIENTI.lodigiani, CLIENTI.umbro, CLIENTI.fasce],
    description: ""
  },
  {
    slug: "documentario",
    title: "Documentario",
    hidden: true,
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/documentario.mp4", poster: "assets/projects/documentario-poster.jpg" },
    date: "",
    clients: [],
    description: ""
  },
  {
    slug: "botteghe-storiche",
    title: "Botteghe Storiche di Quartiere",
    reel: true,
    // Più episodi dentro un'unica voce: `media` può essere una lista.
    // `src` è l'episodio completo, per la scheda del catalogo e l'anteprima a
    // tutto schermo della home; `clip` i 10 secondi leggeri del carosello.
    media: [
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep1.mp4?v=20260922", poster: "assets/projects/botteghe-ep1-poster.jpg", label: "Ep. 1 — Merceria Frustaci",
        date: "2025", clients: [CLIENTI.frustaci],
        description: "La merceria Frustaci fa parte della storia di Centocelle da più di sessant’anni. Con il riconoscimento come attività storica del V Municipio di Roma, le dedichiamo questo ritratto." },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep2.mp4?v=20260922", poster: "assets/projects/botteghe-ep2-poster.jpg", label: "Ep. 2 — Fratelli Tocci",
        date: "2025", clients: [CLIENTI.tocci],
        description: "Punto di riferimento dal 1975 per riparazioni di cuoio e pellame, i fratelli Tocci ci portano nel loro mondo dell’artigianato italiano." },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep3.mp4?v=20260922", poster: "assets/projects/botteghe-ep3-poster.jpg", label: "Ep. 3 — Studio d’Arte Candeloro",
        date: "2026", clients: [CLIENTI.candeloro],
        description: "Dal 1968 lo Studio d’Arte Candeloro è il luogo dove l’arte ha la sua cornice.\nOggi lo studio è il risultato di un dialogo continuo tra generazioni, ricerca e artigianato." },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep4.mp4?v=20260922", clip: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe-ep4.mp4", poster: "assets/projects/botteghe-ep4-poster.jpg", label: "Ep. 4 — Il Dono degli Gnomi",
        date: "2026", clients: [CLIENTI.gnomi],
        description: "Il 7 aprile 1984 apre “Il Dono degli Gnomi”. Una bottega accogliente che è soprattutto un laboratorio di manifattura della pelle. Questa è la nostra visione del suo lavoro." },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep5.mp4?v=20260922", clip: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe-ep5.mp4", poster: "assets/projects/botteghe-ep5-poster.jpg", label: "Ep. 5 — Di Biagio",
        date: "2026", clients: [CLIENTI.dibiagio],
        description: "Dal 1979 Di Biagio è la torrefazione artigianale del quartiere, dove trovano spazio anche dolciumi, distillati e vini selezionati.\nLe loro miscele provengono da filiere garantite da certificazioni etiche e sostenibili." },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep6.mp4?v=20260922", poster: "assets/projects/botteghe-ep6-poster.jpg", label: "Ep. 6 — Bar Orazio",
        date: "2026", clients: [CLIENTI.orazio],
        description: "Orazio ha aperto uno dei bar più storici del quartiere nel 1954, quando Centocelle era ancora considerata solo una borgata.\nNegli anni il bar è diventato il punto di ritrovo di personalità che hanno contribuito alla visione del cinema neorealista, come Pasolini, e della musica leggera, come Claudio Baglioni." },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe/ep7.mp4?v=20260922", clip: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/botteghe-ep7.mp4", poster: "assets/projects/botteghe-ep7-poster.jpg", label: "Ep. 7 — Mercato Arabo",
        date: "2026", clients: [CLIENTI.mercatoArabo],
        description: "Mercato Arabo nasce a Napoli negli anni ’80.\nÈ anche il luogo d’incontro tra la comunità araba e quella italiana, tra le nuove generazioni, sia quelle nate e cresciute qui sia quelle più anziane.\nÈ un posto che racchiude l’amore per il proprio paese di origine e per quello attuale." }
    ],
    date: "",
    clients: [],
    description: ""
  },
  {
    slug: "roland",
    title: "Roland",
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/roland.mp4", poster: "assets/projects/roland-poster.jpg" },
    date: "2025",
    clients: [CLIENTI.roland],
    description: "Video pubblicitario per il campionatore Roland SP-404, strumento iconico del brand giapponese."
  },
  {
    slug: "elektron",
    title: "Elektron",
    portrait: true,
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/elektron.mp4", poster: "assets/projects/elektron-poster.jpg" },
    date: "2025",
    clients: [CLIENTI.elektron],
    description: "Video pubblicitario per lo strumento musicale Syntakt del brand svedese Elektron. Una performance dal vivo suonata e ripresa in più momenti della giornata."
  },
  {
    slug: "halal-express",
    title: "Halal Express",
    media: [
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/mercato-arabo-1.mp4", poster: "assets/projects/mercato-arabo-1-poster.jpg", label: "Mamma ho fatto la spesa" },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/mercato-arabo-2.mp4", poster: "assets/projects/mercato-arabo-2-poster.jpg", label: "Teletrasporto" },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/mercato-arabo-3.mp4", poster: "assets/projects/mercato-arabo-3-poster.jpg", label: "Walk &amp; Talk",
        description: "Adv Social Walk & Talk per il servizio espresso di delivery “Halal Express”." }
    ],
    date: "2026",
    clients: [CLIENTI.halal],
    description: "Adv Social per il servizio espresso di delivery “Halal Express”."
  },
  {
    slug: "artmosaic",
    title: "Artmosaic",
    hidden: true,
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/artmosaic.mp4", poster: "assets/projects/artmosaic-poster.jpg" },
    date: "",
    clients: [],
    description: ""
  },
  {
    slug: "zoom",
    title: "Zoom",
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/zoom-spot.mp4", poster: "assets/projects/zoom-spot-poster.jpg" },
    date: "2025",
    clients: [CLIENTI.zoom],
    description: "Video pubblicitario per il registratore portatile Zoom H6, con suoni registrati in presa diretta."
  },
  {
    slug: "beat-skatepark",
    title: "Beat Skatepark",
    reel: true,
    // intero nel catalogo e a schermo intero; nel carosello della home il clip leggero
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/beat-skatepark-full.mp4", clip: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/beat-skatepark.mp4", poster: "assets/projects/beat-skatepark-poster.jpg" },
    date: "2026",
    clients: [CLIENTI.beat, CLIENTI.rce],
    description: "Il Beat è lo skatepark indoor di riferimento del quadrante Est di Roma. Un posto dove sia i più piccoli che i grandi sanno di poter andare anche quando fuori piove."
  },
  {
    slug: "cacao-crudo",
    title: "Cacao Crudo",
    media: [
      { type: "photo", src: "assets/projects/cacao-crudo-1.jpg", label: "Modern Pleasure — 01" },
      { type: "photo", src: "assets/projects/cacao-crudo-2.jpg", label: "Modern Pleasure — 02" },
      { type: "photo", src: "assets/projects/cacao-crudo-3.jpg", label: "Modern Pleasure — 03" },
      { type: "photo", src: "assets/projects/cacao-crudo-4.jpg", label: "Modern Pleasure — 04" },
      { type: "photo", src: "assets/projects/cacao-crudo-5.jpg", label: "Il Natale ha bisogno di un eroe",
        description: "Estratto mai pubblicato della campagna di Natale, in cui si promuove il torrone artigianale dell’azienda." }
    ],
    date: "2026",
    clients: [CLIENTI.cacaoCrudo],
    // le prime quattro: campagna "gorpcore" (giacche su fondo bianco)
    description: "Estratto mai pubblicato della campagna “gorpcore”, in cui si promuovono le tavolette di cioccolato dell’azienda."
  },
  {
    slug: "redbull",
    title: "RedBull",
    hidden: true,
    media: { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/redbull.mp4", poster: "assets/projects/redbull-poster.jpg" },
    date: "",
    clients: [],
    description: ""
  },
  {
    slug: "umbro",
    title: "Umbro × Lodigiani",
    media: [
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/umbro-1.mp4", poster: "assets/projects/umbro-1-poster.jpg", label: "Kit Reveal — Lodigiani" },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/umbro-2.mp4", poster: "assets/projects/umbro-2-poster.jpg", label: "Fasce da capitano — reveal kit" },
      { type: "video", src: "https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/umbro-3.mp4", poster: "assets/projects/umbro-3-poster.jpg", label: "Video Stefano Gallo", description: "" }
    ],
    date: "2024",
    clients: [CLIENTI.umbro, CLIENTI.lodigiani],
    description: "Lotto. Soffro. Vinco. È questo il motto inciso sulle fasce da capitano della Lodigiani. Una passione che nasce nel 1972 e che continua ancora oggi, da padre in figlio."
  }
];

// i progetti nascosti per ora escono da qui: il resto del sito non li vede
for (let i = PROJECTS.length - 1; i >= 0; i--) if (PROJECTS[i].hidden) PROJECTS.splice(i, 1);

/* ------------------------------------------------------------
   2. SERVICES — index of section 3 (dotted lines).
   `align` places the label as in the reference layout
   (start | mid-start | center | mid-end | end).
   `target` is both the id of the teaser section on the home page and
   the slug of the dedicated page (<target>.html).
   ------------------------------------------------------------ */
const SERVICES = [
  { name: "Consulenza e Direzione Creativa",       target: "creative-direction",          align: "start" },
  { name: "Regia, Documentari & Video",            target: "directing-video-production",  align: "mid-start" },
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
