/* ============================================================
   DIPARTIMENTO SX — dati progetti e servizi
   Sostituisci i campi segnati [PLACEHOLDER] con i contenuti reali.
   I file media vanno messi in assets/projects/ con i nomi indicati
   (vedi PLACEHOLDERS.md nella root del progetto).
   ============================================================ */

const PROJECTS = [
  {
    slug: "lodigiani",
    title: "Lodigiani",
    media: { type: "video", src: "assets/projects/lodigiani.mp4", poster: "assets/projects/lodigiani-poster.jpg" },
    date: "2025 [PLACEHOLDER]",
    scope: "Spot commerciale [PLACEHOLDER]",
    gear: "Sony FX6, ottiche vintage [PLACEHOLDER]",
    partner: "— [PLACEHOLDER]",
    description: "Descrizione del progetto Lodigiani: racconto, obiettivi e risultato finale. [PLACEHOLDER]"
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
    media: { type: "video", src: "assets/projects/botteghe-storiche.mp4", poster: "assets/projects/botteghe-storiche-poster.jpg" },
    date: "2024 [PLACEHOLDER]",
    scope: "Serie documentaria [PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "[PLACEHOLDER]",
    description: "Racconto delle botteghe storiche di quartiere. [PLACEHOLDER]"
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
    media: { type: "photo", src: "assets/projects/mercato-arabo.jpg" },
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
    media: { type: "video", src: "assets/projects/zoom.mp4", poster: "assets/projects/zoom-poster.jpg" },
    date: "2023 [PLACEHOLDER]",
    scope: "[PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Zoom",
    description: "[PLACEHOLDER]"
  },
  {
    slug: "beat-skatepark",
    title: "Beat Skatepark",
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
    media: { type: "video", src: "assets/projects/cacao-crudo.mp4", poster: "assets/projects/cacao-crudo-poster.jpg" },
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
    media: { type: "video", src: "assets/projects/umbro.mp4", poster: "assets/projects/umbro-poster.jpg" },
    date: "2022 [PLACEHOLDER]",
    scope: "[PLACEHOLDER]",
    gear: "[PLACEHOLDER]",
    partner: "Umbro",
    description: "[PLACEHOLDER]"
  }
];

/* Servizi (sezione about) — i numeri sono volutamente "randomici",
   li giustificherete in seguito. Modifica liberamente le voci. */
const SERVICES = [
  { numL: "07", name: "Regia & Videomaking",              numR: "042" },
  { numL: "12", name: "Sound Design & Musica Originale",  numR: "137" },
  { numL: "03", name: "Direzione Creativa",               numR: "009" },
  { numL: "21", name: "Post-produzione & Color Grading",  numR: "233" },
  { numL: "09", name: "Motion Graphics & Animazione",     numR: "078" },
  { numL: "16", name: "Riprese Drone & FPV",              numR: "154" },
  { numL: "05", name: "Fotografia di Set",                numR: "301" }
];
