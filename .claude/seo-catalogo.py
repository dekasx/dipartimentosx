# -*- coding: utf-8 -*-
"""Dati strutturati del catalogo per i motori di ricerca.

Il catalogo è costruito da JavaScript (js/data.js): qui se ne ricava un
elenco schema.org (ItemList di VideoObject e, per le foto, ImageObject) e lo
si scrive nel <head> di catalogue.html, tra i due commenti segnaposto.
È quello che permette a Google di mostrare i video nei risultati.

  python3 .claude/seo-catalogo.py        (dopo ogni modifica ai progetti)

La durata si legge dai file in assets/projects/ con ffprobe; se un file non
c'è, la durata si omette (non è obbligatoria)."""
import io, json, os, re, subprocess, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITO = "https://dipartimentosx.com/"
INIZIO, FINE = "<!-- seo-catalogo:inizio -->", "<!-- seo-catalogo:fine -->"

def progetti():
    js = io.open(os.path.join(ROOT, "js/data.js"), encoding="utf-8").read()
    out = subprocess.run(["node", "-e", js + "\nprocess.stdout.write(JSON.stringify(PROJECTS))"],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)

def durata(src):
    # dall'indirizzo su R2 (o locale) al file in assets/projects/
    m = re.search(r"/projects/([^?#]+)", src)
    if not m: return None
    f = os.path.join(ROOT, "assets/projects", m.group(1))
    if not os.path.exists(f): return None
    s = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                       capture_output=True, text=True).stdout.strip()
    try: sec = round(float(s))
    except ValueError: return None
    return "PT%dM%dS" % (sec // 60, sec % 60) if sec >= 60 else "PT%dS" % sec

def assoluto(u):
    return u if u.startswith("http") else SITO + u.lstrip("/")

def testo(t):
    return html.unescape(t or "").replace("\n", " ").strip()

def elementi():
    lista = []
    for p in progetti():
        if p.get("catalogo") is False:   # solo nella home, non nel catalogo
            continue
        items = p["media"] if isinstance(p["media"], list) else [p["media"]]
        for k, m in enumerate(items):
            campo = lambda n: m[n] if n in m else p.get(n)
            nome = testo(p["title"]) + (" — " + testo(m["label"]) if m.get("label") else "")
            descr = testo(campo("description")) or ("%s, un lavoro di Dipartimento SX." % nome)
            clienti = [c["name"] for c in (campo("clients") or [])]
            if clienti: descr += " Cliente: " + ", ".join(clienti) + "."
            anno = (campo("date") or "").strip()
            base = {
                "name": nome,
                "description": descr,
                "url": SITO + "catalogue.html#" + p["slug"],
                "creator": {"@id": SITO + "#organizzazione"},
                "inLanguage": "it-IT",
            }
            if anno: base["dateCreated"] = anno
            if m["type"] == "video":
                v = dict(base, **{"@type": "VideoObject",
                                  "thumbnailUrl": assoluto(m.get("poster", "")),
                                  "contentUrl": m["src"]})
                if anno: v["uploadDate"] = anno
                d = durata(m["src"])
                if d: v["duration"] = d
                lista.append(v)
            else:
                lista.append(dict(base, **{"@type": "ImageObject", "contentUrl": assoluto(m["src"])}))
    return lista

# ---------------------------------------------------------------------------
# Elenco semplice dei progetti dentro <ul id="wheelList">: lo legge chi non
# esegue JavaScript (motori di ricerca, assistenti AI che scaricano la
# pagina). js/catalogue.js lo svuota e ci costruisce la ruota.
ELENCO_DA, ELENCO_A = "<!-- catalogo-statico:inizio -->", "<!-- catalogo-statico:fine -->"

def nel_catalogo():
    return sorted([p for p in progetti() if p.get("catalogo") is not False],
                  key=lambda p: html.unescape(p["title"]).casefold())

def protetto(t):
    # solo < e >: le & e le virgolette restano come in js/data.js, così il
    # dizionario inglese le ritrova uguali a quelle dei dati strutturati
    return t.replace("<", "&lt;").replace(">", "&gt;")

def scheda(p):
    """anno · clienti — descrizione, per ogni video o foto del progetto"""
    items = p["media"] if isinstance(p["media"], list) else [p["media"]]
    righe, viste = [], set()
    for m in items:
        campo = lambda n: m[n] if n in m else p.get(n)
        pezzi = [x for x in [(campo("date") or "").strip(),
                             ", ".join(c["name"] for c in (campo("clients") or []))] if x]
        descr = testo(campo("description"))
        riga = " · ".join(pezzi)
        if m.get("label"): riga = testo(m["label"]) + (" · " + riga if riga else "")
        if descr: riga += (" — " if riga else "") + descr
        if riga and riga not in viste:
            viste.add(riga); righe.append(riga)
    return righe

def elenco_statico():
    voci = []
    for p in nel_catalogo():
        meta = "".join(' <span class="cat-meta">%s</span>' % protetto(r) for r in scheda(p))
        voci.append('        <li class="wheel-item"><a href="#%s">%s</a>%s</li>\n'
                    % (p["slug"], protetto(testo(p["title"])), meta))
    return ELENCO_DA + "\n" + "".join(voci) + "        " + ELENCO_A

def scrivi_elenco(s):
    blocco = elenco_statico()
    if ELENCO_DA in s:
        return s[:s.index(ELENCO_DA)] + blocco + s[s.index(ELENCO_A) + len(ELENCO_A):]
    vuoto = '<ul class="wheel-list" id="wheelList"><!-- built by JS --></ul>'
    assert vuoto in s, "non trovo l'elenco della ruota in catalogue.html"
    return s.replace(vuoto, '<ul class="wheel-list" id="wheelList">\n        ' + blocco + "\n        </ul>", 1)

# ---------------------------------------------------------------------------
# llms.txt: il sito in breve, in testo semplice, per gli assistenti AI e i
# browser guidati da un agente (proposta llmstxt.org). Tutto quello che c'è
# dentro viene dalle pagine e da js/data.js: niente da tenere aggiornato a mano.
def meta_descrizione(pagina):
    t = io.open(os.path.join(ROOT, pagina), encoding="utf-8").read()
    m = re.search(r'<meta name="description" content="([^"]*)">', t)
    return html.unescape(m.group(1)) if m else ""

def titolo_servizio(pagina):
    t = io.open(os.path.join(ROOT, pagina), encoding="utf-8").read()
    m = re.search(r'<h1[^>]*>(.*?)</h1>', t, re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))).strip() if m else pagina

def chi_siamo():
    t = io.open(os.path.join(ROOT, "about.html"), encoding="utf-8").read()
    t = t[t.index("<main"):t.index("</main>")]
    return [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in re.findall(r"<p>(.*?)</p>", t, re.S)]

SERVIZI = ["creative-direction", "directing-video-production", "sound-design",
           "web-development", "photography"]

def llms():
    r = ["# Dipartimento SX", "", "> " + meta_descrizione("index.html"), ""]
    r += chi_siamo() + [""]
    r += ["Sito in italiano; versione inglese completa su %sen/" % SITO, "", "## Servizi", ""]
    for slug in SERVIZI:
        r.append("- [%s](%s%s.html): %s" % (titolo_servizio(slug + ".html"), SITO, slug,
                                            meta_descrizione(slug + ".html")))
    r += ["", "## Catalogo dei lavori", "",
          "Ogni progetto ha un indirizzo diretto che apre la sua scheda con il video.", ""]
    for p in nel_catalogo():
        righe = scheda(p)
        r.append("- [%s](%scatalogue.html#%s)%s" % (testo(p["title"]), SITO, p["slug"],
                                                     (": " + righe[0]) if len(righe) == 1 else ""))
        if len(righe) > 1:
            r += ["  - " + x for x in righe]
    r += ["", "## Contatti", "",
          "- Email: info@dipartimentosx.com",
          "- Instagram: https://www.instagram.com/dipartimento.sx",
          "- [Pagina contatti](%scontact.html)" % SITO,
          "- [Chi siamo](%sabout.html)" % SITO,
          "- [Privacy](%sprivacy.html)" % SITO, ""]
    io.open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf-8").write("\n".join(r))
    return len(r)

def main():
    el = elementi()
    dati = {"@context": "https://schema.org", "@type": "ItemList", "name": "Catalogo — Dipartimento SX",
            "itemListElement": [dict(item, **{"position": i + 1}) for i, item in enumerate(el)]}
    blocco = (INIZIO + '\n  <script type="application/ld+json">\n'
              + json.dumps(dati, ensure_ascii=False, indent=2) + "\n  </script>\n  " + FINE)
    f = os.path.join(ROOT, "catalogue.html")
    s = io.open(f, encoding="utf-8").read()
    if INIZIO in s:
        s = s[:s.index(INIZIO)] + blocco + s[s.index(FINE) + len(FINE):]
    else:
        s = s.replace("</head>", "  " + blocco + "\n</head>", 1)
    s = scrivi_elenco(s)
    io.open(f, "w", encoding="utf-8").write(s)
    print("llms.txt: %d righe" % llms())
    video = sum(1 for e in el if e["@type"] == "VideoObject")
    print("catalogo: %d elementi (%d video, %d foto)" % (len(el), video, len(el) - video))

if __name__ == "__main__":
    main()
