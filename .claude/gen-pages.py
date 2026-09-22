# -*- coding: utf-8 -*-
import os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("tpl", os.path.join(HERE, "build-service-pages.py"))
tpl = importlib.util.module_from_spec(spec); spec.loader.exec_module(tpl)
ROOT = tpl.ROOT

def write(slug, html):
    open(os.path.join(ROOT, slug + ".html"), "w", encoding="utf-8").write(html)
    print("  ", slug + ".html", len(html), "bytes")

def figure(src, alt, cap, cls="svc-figure", par="0.14", w=1050, h=788):
    return (f'''    <figure class="{cls} parallax" data-parallax="{par}">
      <img src="{src}" alt="{alt}" loading="lazy" decoding="async" width="{w}" height="{h}">
    </figure>
    <p class="svc-caption svc-wrap">{cap}</p>
''')

# ============================================================ 1
write("creative-direction", tpl.page(
  slug="creative-direction",
  title="Consulenza e<br>Direzione Creativa",
  kicker="",
  # la frase resta in inglese: lang="en" perché la leggano bene anche gli screen reader
  lead='<span lang="en">Images are the only property that our eyes are allowed to own</span>',
  desc="Consulenza e direzione creativa per aziende, brand, istituzioni e professionisti: concetto e narrazione, linguaggio visivo, direzione sonora e direzione artistica sul set. Dipartimento SX, Roma.",
  bg="#d6d6d6", fg="#0a0a0a",
  hero_class=" svc-hero--split",
  hero_extra=tpl.conn("cd", [("M240 690 C 420 780, 720 760, 980 690", None),
                             ("M1180 250 C 1400 330, 1560 320, 1740 250", "1.15")], draw_load=True),
  blocks_html=(
    figure("assets/img/sec-creative-direction.jpg", "File di rocchetti di filo colorati sulla parete di una merceria", "Botteghe Storiche — direzione artistica e foto di scena", w=1600, h=1095) +
    tpl.pair([
      "Il nostro lavoro nasce da una fase conoscitiva con il cliente e si sviluppa con la creazione di un’intenzione comunicativa definita.",
      "Ci approcciamo con aziende, brand, istituzioni e professionisti in modo personale.",
      "Aiutiamo a sviluppare un racconto e un posizionamento visivo che abbia longevità."
    ], "Il nostro output", [
      "Concetto e Narrazione",
      "Linguaggio visivo: palette, stile, inquadrature",
      "Direzione sonora",
      "Direzione artistica sul set",
      "Linee guida per l’utilizzo dei contenuti"
    ], conn_svg=tpl.conn("cd2", [("M320 240 H1120 V620 H1660", None)]))
  ),
  extras=""
))

# ============================================================ 2
TRAIL = '  <svg class="trail" data-trail aria-hidden="true"></svg>\n'

write("directing-video-production", tpl.page(
  slug="directing-video-production",
  title="Regia &amp;<br>Video",
  kicker="",
  lead="Ogni lavoro è concepito, ripreso, editato e post prodotto da noi.",
  desc="Regia e produzione video a Roma: documentari, pubblicità e cortometraggi concepiti, ripresi, montati e post prodotti internamente da Dipartimento SX.",
  bg="#000000", fg="#ffffff",
  body_class="page-doc page-service has-trail",
  body_extra=TRAIL,
  hero_extra=tpl.conn("dv", [("M1420 300 H1660 V620 H1810", None),
                             ("M180 820 C 420 900, 700 880, 900 800", "1.15")]),
  blocks_html=(
    figure("assets/img/sec-directing.jpg", "Estratto da “Thanks, Putin” — auto su un telo rosso in un parcheggio sotterraneo addobbato con luci", "Estratto da “Thanks, Putin”", cls="svc-figure", par="0.18", w=2400, h=1350) +
    tpl.pair([
      "Le persone che scrivono la creatività sono le stesse che stanno sul set, e questo ci permette di rimuovere i passaggi intermedi che possono creare lacune tra l’idea e il risultato.",
      "A seconda del tipo di lavoro estendiamo il nostro team in modo dinamico e ci appoggiamo ad altri professionisti che lavorano nell’ambito cinematografico."
    ], "Il nostro output", [
      "Script e Storyboard",
      "Scouting, casting e permessi",
      "Piano di Produzione e Budget",
      "Riprese",
      "Edit, colour grading, post produzione",
      "Tagli Master per le piattaforme"
    ], conn_svg=tpl.conn("dv2", [("M1700 250 H1000 V600 H420", None)]))
  ),
  extras="",
  scripts='\n  <script src="js/trail-lines.js" defer></script>'
))

# ============================================================ 3
SAMPLES = [
    ("Botteghe Storiche — tema principale", "Colonna sonora originale · 2024", "assets/audio/sample-01.mp3"),
    ("Cacao Crudo — film di Natale", "Sound design · 2023", "assets/audio/sample-02.mp3"),
    ("Beat Skatepark — aftermovie", "Musica &amp; mix · 2023", "assets/audio/sample-03.mp3"),
    ("Villa Ada — registrazione ambientale", "Registrazione ambientale · 2025", "assets/audio/sample-04.mp3"),
]

def players():
    rows = []
    for title, sub, src in SAMPLES:
        rows.append(f'''        <article class="player" data-src="{src}">
          <button class="player-btn" type="button" aria-pressed="false" aria-label="Riproduci {title.replace('&amp;','e')}">
            <svg class="ico-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>
            <svg class="ico-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>
          </button>
          <div class="player-main">
            <p class="player-title">{title}</p>
            <p class="player-sub">{sub}</p>
            <div class="player-bar"><span class="player-fill"></span></div>
          </div>
          <time class="player-time">0:00</time>
        </article>''')
    return ('''    <section class="svc-block svc-wrap" aria-labelledby="samples">
      <div class="rule" aria-hidden="true"></div>
      <div class="svc-grid">
        <h2 class="svc-h2" id="samples" data-anim="title">Ascolta</h2>
        <div class="svc-prose" data-anim="copy">
          <p>Quattro estratti da lavori recenti. Tutto quello che senti è stato scritto, registrato e mixato qui.</p>
          <div class="players">
''' + "\n".join(rows) + '''
          </div>
        </div>
      </div>
    </section>
''')

def aside(src, alt, cap, par="0.1", w=414, h=552):
    capline = f'            <figcaption>{cap}</figcaption>\n' if cap else ""
    return (f'''          <figure class="svc-aside">
            <span class="frame parallax" data-parallax="{par}">
              <img src="{src}" alt="{alt}" loading="lazy" decoding="async" width="{w}" height="{h}">
            </span>
{capline}          </figure>
''')

write("sound-design", tpl.page(
  slug="sound-design",
  title="Musica, Sound<br>Design &amp; Foley",
  kicker="",
  lead="Componiamo musiche originali, effetti sonori, sound design per transizioni e prese audio dirette.",
  desc="Musiche originali, sound design, foley, audio in presa diretta, audio branding, mixing e mastering per video, cinema e teatri. Dipartimento SX, Roma.",
  bg="#38211b", fg="#ffffff",
  hero_extra=tpl.conn("sd", [("M150 120 C 420 260, 700 100, 940 190 S 1420 280, 1720 170", "1.35"),
                             ("M300 860 H1100 V960", "1.1")], draw_load=True),
  extras_first=True,
  extras=players(),
  blocks_html=(
    tpl.pair([
      "Ogni parte del sonoro è studiata in correlazione al materiale video specifico, garantendo un approccio che arricchisce le immagini."
    ], "I nostri servizi", [
      "Produzione Musicale",
      "Sound Design, Foley",
      "Audio in presa diretta",
      "Audio branding e Sound Logo",
      "Pulizia Dialoghi per podcast e doppiaggio",
      "Mixing &amp; Mastering adattati a impianti audio, cinema e teatri"
    ], conn_svg=tpl.conn("sd2", [("M1780 240 H1080 V620 H500", None)], solo="desktop") +
                 # da telefono la foto sta a sinistra (5–67% della larghezza, 15–49%
                 # dell'altezza): la linea entra da destra e scende nella colonna
                 # libera accanto alla foto, fermandosi prima di "I nostri servizi".
                 # Tutta disegnata già con la sezione a un terzo di schermo (to=0.35)
                 tpl.conn("sd2m", [("M1920 190 H1575 V555", None, 0.35)], solo="telefono"),
       rule=False,          # niente striscia tratteggiata sopra "I nostri servizi"
       aside=aside("assets/img/zoom.jpg", "Registrazione ambientale con un registratore Zoom H6 tra gli alberi", "", w=479, h=864))
  ),
  scripts='\n  <script src="js/players.js" defer></script>'
))

# ============================================================ 4
SITES = [
    ("Olichi",          "E-commerce &middot; 2026", "assets/img/web-olichi.jpg",        "https://olichisrl.com/en/index.html"),
    ("Propaganda / Sezione Ricette", "Sito vetrina &middot; 2026", "assets/img/web-propaganda.jpg", "https://propagandaitaliancuisine.it/ricette/"),
    ("Sicurfer",        "Sito aziendale &middot; 2026", "assets/img/web-sicurfer.jpg",  "https://sicurfer06.it/"),
    ("Dipartimento SX", "Questo sito &middot; 2026", "assets/img/web-dipartimentosx.jpg", "index.html"),
]

def sites():
    cards = []
    for name, meta, img, href in SITES:
        # i siti dei clienti si aprono in una scheda nuova
        fuori = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
        cards.append(f'''            <a class="site-card" href="{href}"{fuori}>
              <span class="site-shot">
                <img src="{img}" alt="{name} — sito" loading="lazy" decoding="async"
                     onerror="this.remove()">
                <span class="site-missing">anteprima<br>in arrivo</span>
              </span>
              <span class="site-name">{name}</span>
              <span class="site-meta">{meta}</span>
            </a>''')
    return ('''    <section class="svc-block svc-wrap" aria-labelledby="built">
      <div class="rule" aria-hidden="true"></div>
      <div class="svc-grid">
        <h2 class="svc-h2" id="built" data-anim="title">Fatti da noi</h2>
        <div class="svc-prose" data-anim="copy">
          <div class="sites">
''' + "\n".join(cards) + '''
          </div>
        </div>
      </div>
    </section>
''')

# parole tecniche vere, e solo per cose che facciamo davvero (vedi il copy:
# html, css, javascript, react, webGL, UX e UI, siti facili da indicizzare)
MARQUEE = ["Front-end scritto a mano", "React", "Canvas &amp; WebGL", "Responsive design",
           "UX &amp; UI", "Core Web Vitals", "SEO tecnica", "Accessibilità",
           "Dati strutturati", "Scroll design", "Nessun page builder"]

def marquee():
    row = "".join(f"<span>{w}</span>" for w in MARQUEE)
    return ('''    <div class="marquee svc-wrap" aria-hidden="true">
      <div class="marquee-track">''' + row + row + '''</div>
    </div>

''')

def stats():
    cells = [
        ("paint", "ms", "Primo rendering"),
        ("weight", "kB", "Peso della pagina"),
        ("requests", "", "Richieste"),
        ("frameworks", "", "Framework"),
    ]
    out = []
    for key, unit, label in cells:
        u = f"<small>{unit}</small>" if unit else ""
        out.append(f'''              <div class="stat"><b><i data-stat="{key}">0</i>{u}</b><span>{label}</span></div>''')
    return ('''    <section class="svc-block svc-wrap" data-stats aria-labelledby="live">
      <div class="rule" aria-hidden="true"></div>
      <div class="svc-grid">
        <h2 class="svc-h2" id="live" data-anim="title">Questa pagina, adesso</h2>
        <div class="svc-prose" data-anim="copy">
          <div class="stats">
''' + "\n".join(out) + '''
          </div>
        </div>
      </div>
    </section>

''')

WD_HERO = '''    <div class="fx-hero">
      <canvas class="dotfield" data-dotfield aria-hidden="true"></canvas>
      <section class="svc-hero svc-wrap">
        <h1 class="svc-title" data-scramble>Web Development,<br>UX &amp; UI</h1>
        <p class="svc-lead">Ideiamo e sviluppiamo siti dal back al front end.</p>
      </section>
    </div>
'''

write("web-development", tpl.page(
  slug="web-development",
  # il titolo qui ha già il suo effetto: niente comparsa a dissolvenza
  body_class="page-doc page-service page-webdev",
  title="Web Development,<br>UX &amp; UI",
  kicker="",
  lead="Ideiamo e sviluppiamo siti dal back al front end.",
  desc="Ideiamo e sviluppiamo siti dal back al front end a Roma: estetica, user experience e interfaccia, in HTML, CSS, JavaScript, React e WebGL, con foto, video e grafiche realizzate da noi.",
  bg="#5b6157", fg="#ffffff",
  hero_extra="",
  hero_html=WD_HERO,
  extras_first=True,
  extras=(marquee() + sites()),
  blocks_html=(
    tpl.block("Come li costruiamo", [
      "Curiamo l’estetica, la user experience (UX) e l’interfaccia (UI), programmando direttamente in html, css e javascript, react, webGL.",
      "Curiamo anche l’identità visiva dei siti, concependo e realizzando foto, video e grafiche."
    ],
    # al posto della linea che attraversava il testo: una colonna di puntini
    # sotto al titolo, che lampeggiano (js/webdev-fx.js)
    aside='          <span class="dotcol" data-dotcol aria-hidden="true"></span>\n',
    facts=[
      "Ideazione creativa",
      "Progettazione e sviluppo, desktop e mobile",
      "Interazione, canvas e scroll design",
      "Markup semantico, dati strutturati, sitemap",
      "Accessibilità e versioni a movimento ridotto",
      "Messa online e gestione"
    ]) +
    stats()          # "Questa pagina, adesso" sotto "Come li costruiamo"
  ),
  scripts='\n  <script src="js/webdev-fx.js" defer></script>'
))

# ============================================================ 5
write("photography", tpl.page(
  slug="photography",
  title="Studio Fotografico<br>&amp; Post-Produzione",
  kicker="",
  lead="",
  desc="Studio fotografico e post-produzione a Roma: un set modulare e adattabile, con attrezzatura analogica e digitale, per riprese, fotografia e sperimentazioni visive.",
  bg="#8e948b", fg="#0f120e",
  hero_extra="",
  corridor=True,
  blocks_html=(
    tpl.pair([
      "Mettiamo a disposizione il nostro studio fotografico e le nostre competenze per riprese, fotografia e sperimentazioni visive.",
      "Lo stesso luogo dove vengono realizzate le idee è anche il posto dove le post produciamo e facciamo ricerca.",
      "Il nostro set è modulare e adattabile, con attrezzatura e strumentazione analogica e digitale."
    ], "I nostri servizi", [
      "Still life e foto di prodotto",
      "Ritratto",
      "Foto di scena durante le riprese video",
      "In studio o in esterna, con set costruito quando serve",
      "Post-produzione e ritagli in più formati"
    ], conn_svg=tpl.conn("ph2", [("M240 300 C 620 420, 1080 200, 1700 380", None)]), reverse=True) +
    figure("assets/img/still-4.jpg", "Passanti che attraversano la Grand-Place di Bruxelles controluce", "Bruxelles — Grand-Place", cls="svc-figure", par="0.14", w=1600, h=890) +
    tpl.block("Il portfolio completo è disponibile su richiesta", [
      '<a class="big" href="mailto:info@dipartimentosx.com?subject=Richiesta%20portfolio">Richiedi il portfolio completo &rarr;</a>'
    ])
  ),
  extras="",
  scripts='\n  <script src="js/corridor.js" defer></script>'
))
