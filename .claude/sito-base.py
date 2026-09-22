# -*- coding: utf-8 -*-
"""Sposta gli indirizzi assoluti del sito da un dominio all'altro.

Canonical, anteprime dei link (og:image, twitter:image), sitemap,
robots.txt, dati strutturati e generatori devono puntare all'indirizzo da
cui il sito si vede davvero: se puntano a un dominio che non risponde (o a
una pagina di parcheggio), WhatsApp non trova l'anteprima e Google può non
indicizzare le pagine.

  python3 .claude/sito-base.py https://dipartimentosx.netlify.app
  python3 .claude/sito-base.py https://www.dipartimentosx.com     (a dominio collegato)

L'indirizzo in uso è scritto in .claude/sito-base.txt.

Modalità: con un indirizzo *.netlify.app il sito è in PROVA — ogni pagina
dice ai motori di ricerca noindex, nofollow e robots.txt non cita la
sitemap. Con il dominio vero torna in PUBBLICAZIONE: index, follow e
sitemap. Così il noindex non resta acceso per sbaglio il giorno del lancio.
robots.txt lascia sempre passare i motori: se li bloccasse lì non
leggerebbero il noindex, e una pagina bloccata può finire nei risultati
lo stesso. Le anteprime dei link (WhatsApp ecc.) non sono toccate."""
import glob, io, os, re, sys

ROBOTS_PROVA = "noindex, nofollow"
ROBOTS_PUBBLICO = "index, follow, max-image-preview:large"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATO = os.path.join(ROOT, ".claude", "sito-base.txt")
FILE = (glob.glob(os.path.join(ROOT, "*.html")) +
        [os.path.join(ROOT, f) for f in ("sitemap.xml", "robots.txt")] +
        [os.path.join(ROOT, ".claude", f) for f in ("build-service-pages.py", "gen-pages.py", "seo-catalogo.py")])

def main(nuovo):
    nuovo = nuovo.rstrip("/")
    vecchio = io.open(STATO).read().strip() if os.path.exists(STATO) else "https://www.dipartimentosx.com"
    if vecchio == nuovo:
        print("già su", nuovo); modalita(nuovo); return
    tot = 0
    for f in FILE:
        if not os.path.exists(f): continue
        s = io.open(f, encoding="utf-8").read()
        n = s.count(vecchio + "/") + s.count(vecchio + '"')
        if not n: continue
        s = s.replace(vecchio + "/", nuovo + "/").replace(vecchio + '"', nuovo + '"')
        io.open(f, "w", encoding="utf-8").write(s)
        tot += n
        print("  %-34s %d" % (os.path.relpath(f, ROOT), n))
    io.open(STATO, "w").write(nuovo + "\n")
    print("indirizzi: %s → %s (%d)" % (vecchio, nuovo, tot))
    modalita(nuovo)

def modalita(base):
    prova = "netlify.app" in base
    valore = ROBOTS_PROVA if prova else ROBOTS_PUBBLICO
    pagine = 0
    for f in FILE:
        if not os.path.exists(f) or not f.endswith((".html", "build-service-pages.py")): continue
        s = io.open(f, encoding="utf-8").read()
        t = re.sub(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="%s">' % valore, s)
        if t != s:
            io.open(f, "w", encoding="utf-8").write(t); pagine += 1
    righe = ["User-agent: *", "Allow: /"]
    if not prova:
        righe += ["", "Sitemap: %s/sitemap.xml" % base]
    io.open(os.path.join(ROOT, "robots.txt"), "w").write("\n".join(righe) + "\n")
    print("modalità %s: robots \"%s\" (%d file), sitemap in robots.txt: %s"
          % ("PROVA" if prova else "PUBBLICAZIONE", valore, pagine, "no" if prova else "sì"))

if __name__ == "__main__":
    if len(sys.argv) != 2: print(__doc__); sys.exit(1)
    main(sys.argv[1])
