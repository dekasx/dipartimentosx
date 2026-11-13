/* ============================================================
   DIPARTIMENTO SX — contenuti in inglese

   Lo caricano solo le pagine di en/, subito DOPO js/data.js: quello resta
   l'unica fonte (struttura, media, clienti, ordine), qui sopra ci va solo la
   lingua. Un progetto senza voce qui resta in italiano, ed è voluto: i nomi
   propri — Botteghe Storiche di Quartiere, Halal Express, i clienti — non si
   traducono.
   ============================================================ */
(() => {
  "use strict";
  if (typeof PROJECTS === "undefined") return;

  /* per slug: titolo del progetto, descrizione, e per i progetti a episodi
     l'elenco degli episodi nello stesso ordine di `media` */
  const EN = {
    "botteghe-storiche": {
      media: [
        { description: "The Frustaci haberdashery has been part of the history of Centocelle for more than sixty years. Now that Rome’s Fifth Municipality has recognised it as a historic business, we are dedicating this portrait to it." },
        { description: "A point of reference for leather and hide repairs since 1975, the Tocci brothers take us into their world of Italian craftsmanship." },
        { description: "Since 1968 Studio d’Arte Candeloro has been the place where art gets its frame.\nToday the studio is the result of a continuous dialogue between generations, research and craft." },
        { label: "Ep. 4 — Il Dono degli Gnomi", description: "On 7 April 1984 “Il Dono degli Gnomi” opened its doors. A welcoming shop that is above all a leather workshop. This is our view of its work." },
        { description: "Since 1979 Di Biagio has been the neighbourhood’s artisan coffee roastery, with room as well for sweets, spirits and selected wines.\nTheir blends come from supply chains backed by ethical and sustainable certifications." },
        { description: "Orazio opened one of the oldest bars in the neighbourhood in 1954, when Centocelle was still thought of as little more than a hamlet.\nOver the years the bar became the meeting point of figures who shaped the vision of neorealist cinema, such as Pasolini, and of Italian popular music, such as Claudio Baglioni." },
        { description: "Mercato Arabo was born in Naples in the 1980s.\nIt is also a meeting place between the Arab and Italian communities, and between generations — those born and raised here and the older ones.\nIt is a place that holds together the love for one’s country of origin and for the one you live in." }
      ]
    },
    "roland": {
      description: "Commercial for the Roland SP-404 sampler, an iconic instrument from the Japanese brand."
    },
    "elektron": {
      description: "Commercial for the Syntakt, a musical instrument by the Swedish brand Elektron. A live performance played and filmed at different moments of the day."
    },
    "halal-express": {
      description: "Social ad for the “Halal Express” express delivery service.",
      media: [
        { label: "Mum, I did the shopping" },
        { label: "Teleport" },
        { label: "Walk & Talk", description: "Walk & Talk social ad for the “Halal Express” express delivery service." }
      ]
    },
    "zoom": {
      description: "Commercial for the Zoom H6 portable recorder, with sound captured live on location."
    },
    "beat-skatepark": {
      description: "The Beat is the reference indoor skatepark for the eastern side of Rome. A place where both the youngest and the oldest know they can go even when it is raining outside."
    },
    "cacao-crudo": {
      description: "An unreleased still from the “gorpcore” campaign, promoting the company’s chocolate bars.",
      media: [
        {}, {}, {}, {},
        { label: "Christmas needs a hero", description: "An unreleased still from the Christmas campaign, promoting the company’s artisan nougat." }
      ]
    },
    "umbro": {
      description: "I fight. I suffer. I win. That is the motto engraved on Lodigiani’s captain armbands. A passion born in 1972 and still going today, from father to son.",
      media: [
        { description: "Umbro was the technical sponsor of Associazione Sportiva Lodigiani for the 2023/2024 season. The Parco degli Acquedotti is the backdrop to the reveal, and the home/away duality states the strength of the brand plainly, paying tribute to it through the historicism of Rome." },
        { label: "Captain armbands — kit reveal" },
        { label: "Stefano Gallo video", description: "Presentation for Stefano Gallo, born in 1996, joining Lodigiani’s first team." }
      ]
    },
    "lodigiani": {}
  };

  PROJECTS.forEach((p) => {
    const t = EN[p.slug];
    if (!t) return;
    if (t.title) p.title = t.title;
    if (t.description) p.description = t.description;
    if (t.media && Array.isArray(p.media)) {
      t.media.forEach((m, i) => {
        if (!p.media[i] || !m) return;
        if (m.label) p.media[i].label = m.label;
        if (m.description) p.media[i].description = m.description;
      });
    }
  });

  /* i servizi: gli stessi nomi delle pagine */
  const SERVIZI_EN = [
    "Consulting & Creative Direction",
    "Directing, Documentaries & Video",
    "Music, Sound Design & Foley",
    "Web Development, UX & UI",
    "Podcast Studio & Post-Production"
  ];
  if (typeof SERVICES !== "undefined") {
    SERVICES.forEach((s, i) => { if (SERVIZI_EN[i]) s.name = SERVIZI_EN[i]; });
    const foto = SERVICES.find((s) => s.target === "photography");
    if (foto) foto.blurb = "We make our studio and our skills available for filming, podcasts, photography and visual experiments.";
  }

  /* le descrizioni delle foto (alt): servono a chi non vede le immagini */
  const FOTO_EN = [
    "Cacao Crudo — package tied with a climbing rope",
    "Haberdashery — still from the set",
    "Cacao Crudo — backlit portrait with an open jacket",
    "People in front of a gate, one holding a purple soft toy",
    "Cacao Crudo — camera operator backlit",
    "Cacao Crudo — Christmas campaign",
    "Cacao Crudo — backlit portrait with a hat",
    "Escalators seen from above between glass walls",
    "Cacao Crudo — backlit portrait with a hood",
    "Field recording — Zoom H6",
    "Cacao Crudo — artwork with a cocoa bean on a yellow background",
    "Two people on a walkway in a glass atrium",
    "Cacao Crudo — The raw process. Cold.",
    "A hall with banners and a person seen from behind",
    "Cacao Crudo — Father Christmas with a red smoke flare"
  ];
  if (typeof PHOTOS !== "undefined") {
    PHOTOS.forEach((f, i) => { if (FOTO_EN[i]) f.alt = FOTO_EN[i]; });
  }
})();
