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
SITO = "https://www.dipartimentosx.com/"
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
    io.open(f, "w", encoding="utf-8").write(s)
    video = sum(1 for e in el if e["@type"] == "VideoObject")
    print("catalogo: %d elementi (%d video, %d foto)" % (len(el), video, len(el) - video))

if __name__ == "__main__":
    main()
