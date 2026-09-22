# -*- coding: utf-8 -*-
"""Genera le pagine servizio: struttura e footer identici, contenuto per pagina."""
import io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SERVICES = [
    ("creative-direction", "Consulenza e Direzione Creativa"),
    ("directing-video-production", "Regia &amp; Video"),
    ("sound-design", "Musica, Sound Design &amp; Foley"),
    ("web-development", "Web Development, UX &amp; UI"),
    ("photography", "Studio Fotografico &amp; Post-Produzione"),
]

def head(slug, title, desc, bg, extra_ld=""):
    return f'''<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <title>{title} — Dipartimento SX | Reparto creativo audio/video a Roma</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="https://www.dipartimentosx.com/{slug}.html">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="{bg}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Dipartimento SX">
  <meta property="og:title" content="{title} — Dipartimento SX">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="https://www.dipartimentosx.com/{slug}.html">
  <meta property="og:image" content="https://www.dipartimentosx.com/assets/img/og-cover.jpg">
  <meta property="og:locale" content="it_IT">
  <meta name="twitter:card" content="summary_large_image">

  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "{title.replace('&amp;', '&')}",
    "serviceType": "{title.replace('&amp;', '&')}",
    "description": "{desc}",
    "url": "https://www.dipartimentosx.com/{slug}.html",
    "areaServed": "IT",
    "provider": {{
      "@type": "ProfessionalService",
      "name": "Dipartimento SX",
      "url": "https://www.dipartimentosx.com/",
      "email": "info@dipartimentosx.com",
      "address": {{ "@type": "PostalAddress", "addressLocality": "Roma", "addressCountry": "IT" }}
    }}
  }}
  </script>{extra_ld}

  <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
  <link rel="apple-touch-icon" href="assets/img/logo-sx.svg">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/pellicola.css">
  <script src="js/pellicola.js"></script>
</head>'''

NAV = '''
  <div class="cursor" id="cursor" aria-hidden="true"><span></span><span></span></div>

  <header class="site-header" role="banner">
    <a class="logo" href="index.html" aria-label="Dipartimento SX — home">
      <img src="assets/img/logo-sx-white.svg" alt="Logo Dipartimento SX" width="120" height="120">
    </a>
    <nav class="main-nav" aria-label="Navigazione principale">
      <a href="catalogue.html">catalogo</a>
      <a href="index.html#services">servizi</a>
      <a href="about.html">about</a>
      <a href="contact.html">contatti</a>
    </nav>
  </header>
'''

def others(slug):
    rows = []
    n = 0
    for s, t in SERVICES:
        if s == slug:
            continue
        n += 1
        rows.append(f'        <li><a href="{s}.html">{t} <span>0{n}</span></a></li>')
    return ('''
    <section class="svc-others svc-wrap" aria-labelledby="others">
      <h2 id="others">Altri servizi</h2>
      <ul>
''' + "\n".join(rows) + '''
      </ul>
    </section>
''')

FOOTER = '''
  <footer class="site-footer">
    <div class="foot-grid">
      <div class="foot-brand">
        <p class="foot-copy">&copy; Dipartimento SX <span id="year">2026</span></p>
        <p class="foot-small">Reparto creativo audio/video — Roma, Italia</p>
      </div>
      <nav class="foot-nav" aria-label="Mappa del sito">
        <h3>Sito</h3>
        <a href="index.html">Home</a>
        <a href="index.html#work">Lavori</a>
        <a href="index.html#services">Servizi</a>
        <a href="catalogue.html">Catalogo</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contatti</a>
      </nav>
      <nav class="foot-nav" aria-label="Servizi">
        <h3>Servizi</h3>
        <a href="creative-direction.html">Consulenza e Direzione Creativa</a>
        <a href="directing-video-production.html">Regia &amp; Video</a>
        <a href="sound-design.html">Musica, Sound Design &amp; Foley</a>
        <a href="web-development.html">Web Development, UX &amp; UI</a>
        <a href="photography.html">Studio Fotografico &amp; Post-Produzione</a>
      </nav>
      <div class="foot-nav">
        <h3>Contatti</h3>
        <a href="mailto:info@dipartimentosx.com">info@dipartimentosx.com</a>
        <a href="https://www.instagram.com/dipartimento.sx" target="_blank" rel="noopener">@dipartimento.sx</a>
      </div>
    </div>
    <div class="foot-legal">
      <p>
        Tutti i contenuti audio, video e fotografici di questo sito appartengono a Dipartimento SX
        o ai rispettivi clienti e non possono essere riprodotti senza autorizzazione.
      </p>
      <p class="foot-links">
        <a href="privacy.html">Privacy Policy</a>
        <a href="cookie-policy.html">Cookie Policy</a>
        <span>P. IVA [DA COMPLETARE]</span>
      </p>
    </div>
  </footer>
'''

def conn(mid, paths, draw_load=False, solo=None):
    """paths: lista di (d, from_attr). draw_load: le linee in cima alla pagina
    si disegnano da sole al caricamento invece che con lo scroll.
    solo: "desktop" o "telefono" quando una sezione ha due disegni diversi
    (da telefono la colonna è una sola e il disegno del computer, stirato,
    può finire sopra una foto)."""
    defs, gs = [], []
    for i, (d, frm) in enumerate(paths):
        f = f' data-from="{frm}"' if frm else ""
        defs.append(f'          <mask id="mk-{mid}{i}" maskUnits="userSpaceOnUse">'
                    f'<path class="reveal"{f} pathLength="1" d="{d}" stroke="#fff" stroke-width="40" fill="none" stroke-dasharray="1 1"/></mask>')
        gs.append(f'        <g mask="url(#mk-{mid}{i})"><path d="{d}" class="dotpath"/></g>')
    dl = ' data-draw="load"' if draw_load else ""
    cl = f" conn--solo-{solo}" if solo else ""
    return (f'      <svg class="conn{cl}"{dl} viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">\n'
            '        <defs>\n' + "\n".join(defs) + '\n        </defs>\n' + "\n".join(gs) + '\n      </svg>\n')

def block(h2, paras, facts=None, conn_svg="", aside=""):
    out = io.StringIO()
    out.write('    <section class="svc-block svc-wrap">\n')
    out.write(conn_svg)
    out.write('      <div class="rule" aria-hidden="true"></div>\n')
    out.write('      <div class="svc-grid">\n')
    if aside:
        out.write(f'        <div><h2 class="svc-h2" data-anim="title">{h2}</h2>\n{aside}        </div>\n')
    else:
        out.write(f'        <h2 class="svc-h2" data-anim="title">{h2}</h2>\n')
    out.write('        <div class="svc-prose" data-anim="copy">\n')
    for p in paras:
        out.write(f'          <p>{p}</p>\n')
    if facts:
        out.write('          <ul class="svc-facts">\n')
        for i, f in enumerate(facts, 1):
            out.write(f'            <li><span class="n">{i:02d}</span><span>{f}</span></li>\n')
        out.write('          </ul>\n')
    out.write('        </div>\n      </div>\n    </section>\n')
    return out.getvalue()

def pair(left, right_h2, facts, after=None, conn_svg="", aside="", reverse=False, rule=True):
    """Racconto ed elenco affiancati in un'unica griglia: il titolo sta sopra
    l'elenco e il racconto parte alla riga del primo tratteggio dell'elenco.
    reverse=False: racconto a sinistra, elenco a destra. True: il contrario."""
    out = io.StringIO()
    # senza striscia la sezione prosegue il discorso di quella sopra:
    # da telefono le si avvicina (vedi .svc-block--segue nel CSS)
    segue = "" if rule else " svc-block--segue"
    out.write(f'    <section class="svc-block svc-wrap{segue}">\n')
    out.write(conn_svg)
    if rule:
        out.write('      <div class="rule" aria-hidden="true"></div>\n')

    def facts_html(ind):
        h = [f'{ind}<ul class="svc-facts">\n']
        for i, f in enumerate(facts, 1):
            h.append(f'{ind}  <li><span class="n">{i:02d}</span><span>{f}</span></li>\n')
        h.append(f'{ind}</ul>\n')
        for p in (after or []):
            h.append(f'{ind}<p>{p}</p>\n')
        return "".join(h)

    if reverse:
        out.write('      <div class="svc-pair svc-pair--rev">\n')
        out.write(f'        <h2 class="svc-h2 svc-pair-h" data-anim="title">{right_h2}</h2>\n')
        out.write('        <div class="svc-prose svc-pair-list" data-anim="copy">\n')
        out.write(facts_html('          '))
        out.write('        </div>\n')
        out.write('        <div class="svc-prose svc-pair-intro" data-anim="copy">\n')
        for p in left:
            out.write(f'          <p>{p}</p>\n')
        out.write('        </div>\n')
        out.write('      </div>\n    </section>\n')
        return out.getvalue()

    # nel documento prima il racconto, poi titolo ed elenco: da telefono,
    # su una colonna sola, si legge in quest'ordine
    out.write('      <div class="svc-pair svc-pair--grid">\n')
    out.write('        <div class="svc-pair-left">\n')
    out.write('          <div class="svc-prose svc-pair-intro" data-anim="copy">\n')
    for p in left:
        out.write(f'            <p>{p}</p>\n')
    out.write('          </div>\n')
    if aside:
        out.write(aside)
    out.write('        </div>\n')
    out.write(f'        <h2 class="svc-h2 svc-pair-h" data-anim="title">{right_h2}</h2>\n')
    out.write('        <div class="svc-prose svc-pair-list" data-anim="copy">\n')
    out.write(facts_html('          '))
    out.write('        </div>\n')
    out.write('      </div>\n    </section>\n')
    return out.getvalue()

def page(slug, title, kicker, lead, desc, bg, fg, hero_extra, blocks_html, extras,
         scripts="", extra_ld="", corridor=False, extras_first=False, hero_html=None,
         body_class="page-doc page-service", hero_class="", body_extra=""):
    # senza frase sotto il titolo non resta un paragrafo vuoto
    lead_html = f'      <p class="svc-lead" data-anim="copy">{lead}</p>\n' if lead else ""
    hero = f'''    <section class="svc-hero svc-wrap{hero_class}">
{hero_extra}      <h1 class="svc-title" data-anim="title">{title}</h1>
{lead_html}    </section>
'''
    if hero_html is not None:
        hero = hero_html
    if corridor:
        hero = '    <div class="corridor" data-corridor data-cards="9" data-speed="20">\n' + hero + '    </div>\n'
    body = (extras + blocks_html) if extras_first else (blocks_html + extras)
    return (head(slug, title.replace('<br>', ' ').replace('&amp;', '&'), desc, bg, extra_ld) +
f'''
<body class="{body_class}" style="--bg: {bg}; --fg: {fg};">
{body_extra}{NAV}
  <main>
{hero}

{body}
    <section class="svc-cta svc-wrap">
      <div class="rule" aria-hidden="true" style="width:100%"></div>
      <p data-anim="title">Hai un progetto in mente?</p>
      <a class="big" href="contact.html" data-anim="copy">Scrivici →</a>
    </section>
{others(slug)}  </main>
{FOOTER}
  <script src="js/data.js" defer></script>
  <script src="js/scroll-fx.js" defer></script>
  <script src="js/site.js" defer></script>{scripts}
</body>
</html>
''')
