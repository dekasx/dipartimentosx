# -*- coding: utf-8 -*-
"""Sposta i riferimenti dei video fra la cartella locale e lo spazio su CDN.

  python3 .claude/video-base.py https://video.dipartimentosx.com
      -> i video vengono chiesti alla CDN (per il sito pubblicato)
  python3 .claude/video-base.py locale
      -> i video tornano a essere quelli nella cartella (per lavorare offline)

Sul bucket la struttura resta la stessa che c'è in assets/, senza "assets":
  projects/botteghe/ep7.mp4, video/contact-bg.mp4, ...
Le immagini e i poster NON si spostano: pesano poco e stanno nel repo.
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CART = ("projects", "video")                    # sottocartelle di assets/ con i video
EST = r"(?:mp4|mov|m4v|webm)"
FILES = [f for f in os.listdir(ROOT) if f.endswith(".html")] + \
        [os.path.join("js", f) for f in os.listdir(os.path.join(ROOT, "js")) if f.endswith(".js")]

def main(base):
    locale = base in ("locale", "local", "")
    base = base.rstrip("/")
    # qualunque indirizzo assoluto già presente, per poterlo riportare indietro
    da_cdn = re.compile(r'https?://[^"\')\s]+?/((?:%s)/[^"\')\s]+\.%s)' % ("|".join(CART), EST))
    da_loc = re.compile(r'assets/((?:%s)/[^"\')\s]+\.%s)' % ("|".join(CART), EST))
    tot = 0
    for rel in FILES:
        p = os.path.join(ROOT, rel)
        s = o = io.open(p, encoding="utf-8").read()
        s = da_cdn.sub(lambda m: "assets/" + m.group(1), s)      # sempre prima in locale
        if not locale:
            s = da_loc.sub(lambda m: base + "/" + m.group(1), s)
        if s != o:
            io.open(p, "w", encoding="utf-8").write(s)
            n = len(da_loc.findall(o)) + len(da_cdn.findall(o))
            tot += n
            print("  %-34s %d riferimenti" % (rel, n))
    print("video %s (%d riferimenti)" % ("in locale" if locale else "su " + base, tot))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])
