# -*- coding: utf-8 -*-
"""Sposta gli indirizzi assoluti del sito da un dominio all'altro.

Canonical, anteprime dei link (og:image, twitter:image), sitemap,
robots.txt, dati strutturati e generatori devono puntare all'indirizzo da
cui il sito si vede davvero: se puntano a un dominio che non risponde (o a
una pagina di parcheggio), WhatsApp non trova l'anteprima e Google può non
indicizzare le pagine.

  python3 .claude/sito-base.py https://dipartimentosx.netlify.app
  python3 .claude/sito-base.py https://www.dipartimentosx.com     (a dominio collegato)

L'indirizzo in uso è scritto in .claude/sito-base.txt."""
import glob, io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATO = os.path.join(ROOT, ".claude", "sito-base.txt")
FILE = (glob.glob(os.path.join(ROOT, "*.html")) +
        [os.path.join(ROOT, f) for f in ("sitemap.xml", "robots.txt")] +
        [os.path.join(ROOT, ".claude", f) for f in ("build-service-pages.py", "gen-pages.py", "seo-catalogo.py")])

def main(nuovo):
    nuovo = nuovo.rstrip("/")
    vecchio = io.open(STATO).read().strip() if os.path.exists(STATO) else "https://www.dipartimentosx.com"
    if vecchio == nuovo:
        print("già su", nuovo); return
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

if __name__ == "__main__":
    if len(sys.argv) != 2: print(__doc__); sys.exit(1)
    main(sys.argv[1])
