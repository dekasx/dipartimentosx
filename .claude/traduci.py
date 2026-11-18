# -*- coding: utf-8 -*-
"""Genera la versione inglese del sito dentro en/.

L'italiano resta l'unica fonte: qui le pagine vengono copiate e tradotte con
il dizionario di .claude/en/dizionario.py, che lavora sul testo GREZZO (quindi
comprese le entità &amp; e gli apostrofi tipografici).

Due controlli automatici, che sono il motivo per cui il file esiste:
  1. ogni voce del dizionario che non viene trovata da nessuna parte è
     segnalata: vuol dire che la chiave non corrisponde più al sito;
  2. ogni stringa ancora in italiano nelle pagine generate è segnalata:
     vuol dire che manca una traduzione.
"""
import io, os, re, sys, glob, importlib.util
from html.parser import HTMLParser

QUI = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(QUI)
OUT = os.path.join(ROOT, "en")

spec = importlib.util.spec_from_file_location("diz", os.path.join(QUI, "en", "dizionario.py"))
diz = importlib.util.module_from_spec(spec); spec.loader.exec_module(diz)

PAGINE = ["index", "catalogue", "about", "contact", "privacy",
          "creative-direction", "directing-video-production", "sound-design",
          "web-development", "photography"]

# ---------------------------------------------------------------- traduzione
def traduci(testo, coppie, usate):
    """Sostituzione dalla più lunga alla più corta, con segnaposto: così una
    frase già tradotta non viene ritoccata da una chiave più corta."""
    pezzi = []
    for it, en in sorted(coppie, key=lambda c: -len(c[0])):
        if it not in testo:
            continue
        usate.add(it)
        seg = "\x00%d\x00" % len(pezzi)
        pezzi.append(en)
        testo = testo.replace(it, seg)
    for i, en in enumerate(pezzi):
        testo = testo.replace("\x00%d\x00" % i, en)
    return testo

def percorsi(testo):
    """en/pagina.html sta una cartella più in basso: i file comuni salgono."""
    for a in ("assets/", "css/", "js/"):
        testo = testo.replace('href="' + a, 'href="../' + a)
        testo = testo.replace('src="' + a, 'src="../' + a)
        testo = testo.replace('poster="' + a, 'poster="../' + a)
        testo = testo.replace('url("' + a, 'url("../' + a)
    return testo

def indirizzi(testo, slug, base):
    """canonical, og:url e dati strutturati puntano alla pagina inglese."""
    it_url = base + "/" if slug == "index" else base + "/" + slug + ".html"
    en_url = base + "/en/" if slug == "index" else base + "/en/" + slug + ".html"
    # prima le pagine specifiche, poi la home (che è un prefisso di tutte)
    for s in sorted(PAGINE, key=len, reverse=True):
        testo = testo.replace(base + "/" + s + ".html", base + "/en/" + s + ".html")
    testo = testo.replace('"' + base + '/"', '"' + base + '/en/"')
    testo = testo.replace('"' + base + '/#', '"' + base + '/en/#')
    return testo, it_url, en_url

def alternate(slug, base):
    it_url = base + "/" if slug == "index" else base + "/" + slug + ".html"
    en_url = base + "/en/" if slug == "index" else base + "/en/" + slug + ".html"
    return ('  <link rel="alternate" hreflang="it" href="%s">\n'
            '  <link rel="alternate" hreflang="en" href="%s">\n'
            '  <link rel="alternate" hreflang="x-default" href="%s">\n' % (it_url, en_url, it_url))

# ------------------------------------------------- controllo dell'italiano
ATTR = {"alt", "aria-label", "title", "content"}
class Visibili(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.out = []; s.skip = 0
    def handle_starttag(s, t, a):
        if t in ("script", "style"): s.skip += 1
        d = dict(a)
        for k, v in a:
            if k in ATTR and v and v.strip():
                if k == "content":
                    n = (d.get("name") or d.get("property") or "")
                    if not re.search(r"description|title|image:alt", n): continue
                s.out.append(v.strip())
    def handle_endtag(s, t):
        if t in ("script", "style") and s.skip: s.skip -= 1
    def handle_data(s, d):
        if s.skip: return
        t = d.strip()
        if t: s.out.append(re.sub(r"\s+", " ", t))

# Parole che esistono SOLO in italiano. Fuori quelle che esistono anche in
# inglese (in, la, le, un, no, come, si, ci, ne): davano falsi allarmi su
# frasi già tradotte.
SPIA = re.compile(r"\b(che|con|per|della|delle|dello|degli|dei|del|dal|dalla|dalle|dallo|"
                  r"sono|siamo|nostro|nostra|nostri|nostre|anche|questo|questa|quello|quella|"
                  r"sul|sulla|nel|nella|viene|vengono|essere|abbiamo|loro|più|già|senza|dove|"
                  r"quando|perché|gli|una|uno|di|da|su|tra|fra|non|il|lo|ed|agli|alle|"
                  r"nostri|qui|sito|siti|video|foto|riproduci|ascolta)\b", re.I)

def piatto(t):
    # via anche la punteggiatura ai bordi: un testo spezzato da un tag inizia
    # spesso con ". " o finisce con " ("
    return re.sub(r"\s+", " ", t).strip().strip(" .,;:()“”\"")

def sospette(html, ammesse):
    p = Visibili(); p.feed(html)
    testi = list(p.out)
    # i dati strutturati stanno dentro <script>, che il parser salta: lì
    # l'italiano era passato inosservato la prima volta
    import json as _j
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try: dati = _j.loads(b)
        except Exception: continue
        pila = [dati]
        while pila:
            o = pila.pop()
            if isinstance(o, dict):
                for k, v in o.items():
                    if k in ("name", "description", "caption") and isinstance(v, str): testi.append(v)
                    else: pila.append(v)
            elif isinstance(o, list):
                pila.extend(o)
    # Un testo può essere il montaggio di più pezzi — una descrizione più
    # "Client: X." — e contenere nomi propri italiani. Quindi invece di
    # cercare la frase intera nel dizionario, si toglie dal testo tutto quello
    # che si sa essere inglese o un nome proprio: se resta dell'italiano,
    # allora manca davvero una traduzione.
    noti = sorted(ammesse, key=len, reverse=True)
    fuori = []
    for t in testi:
        piatta = piatto(t)
        if piatta in ammesse: continue
        if len(piatta) < 12: continue
        resto = piatta
        for n in noti:
            if len(n) < 3: continue
            if n in resto: resto = resto.replace(n, " ")
        if not SPIA.search(resto): continue
        fuori.append(t)
    return fuori

# ---------------------------------------------------------------------- via
def main():
    # l'indirizzo del sito è uno solo, quello scritto da sito-base.py
    base = io.open(os.path.join(ROOT, ".claude", "sito-base.txt"), encoding="utf-8").read().strip().rstrip("/")
    os.makedirs(OUT, exist_ok=True)
    usate = set()
    import html as _h
    ammesse = set()
    for _, en in diz.COPPIE:
        ammesse.add(piatto(_h.unescape(en)))
        # una traduzione può contenere tag: valgono anche i suoi pezzi di testo
        for pezzo in re.split(r"<[^>]+>", en):
            if pezzo.strip(): ammesse.add(piatto(_h.unescape(pezzo)))
    for x in diz.INVARIANTI: ammesse.add(piatto(x))
    problemi = 0

    for slug in PAGINE:
        src = os.path.join(ROOT, slug + ".html")
        if not os.path.exists(src):
            print("   manca", slug + ".html"); continue
        s = io.open(src, encoding="utf-8").read()
        # via gli hreflang di un giro precedente, se no si accumulano (e quelli
        # vecchi, tradotti, finirebbero a puntare alla pagina sbagliata)
        s = re.sub(r'[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', "", s)

        s = traduci(s, diz.COPPIE, usate)
        s = percorsi(s)
        s, it_url, en_url = indirizzi(s, slug, base)
        s = s.replace('<html lang="it">', '<html lang="en">')
        # il tasto torna all'italiano
        s = re.sub(r'<a class="lang-btn"[^>]*>[^<]*</a>',
                   '<a class="lang-btn" href="../%s.html" hreflang="it" lang="it" aria-label="Passa all\'italiano">IT</a>'
                   % slug if slug != "index" else
                   '<a class="lang-btn" href="../index.html" hreflang="it" lang="it" aria-label="Passa all\'italiano">IT</a>', s)
        # i dati dei progetti in inglese, subito DOPO data.js: si appoggia a
        # quello che data.js ha costruito
        ver = re.search(r'js/data\.js(\?v=\d+)', s)
        ver = ver.group(1) if ver else ""
        s = re.sub(r'(<script src="\.\./js/data\.js[^>]*></script>)',
                   r'\1\n  <script src="../js/data-en.js%s" defer></script>' % ver, s, count=1)
        # hreflang
        s = s.replace('  <link rel="canonical"', alternate(slug, base) + '  <link rel="canonical"', 1)

        io.open(os.path.join(OUT, slug + ".html"), "w", encoding="utf-8").write(s)

        resto = sospette(s, ammesse)
        print("   en/%s.html  %6d byte" % (slug, len(s)), end="")
        if resto:
            problemi += len(resto)
            print("   ⚠ %d da tradurre" % len(resto))
            for t in resto: print("        •", t[:160])
        else:
            print("   ok")

    # l'italiano ha anche lui i suoi hreflang
    for slug in PAGINE:
        p = os.path.join(ROOT, slug + ".html")
        if not os.path.exists(p): continue
        s = io.open(p, encoding="utf-8").read()
        s = re.sub(r'[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', "", s)
        s = s.replace('  <link rel="canonical"', alternate(slug, base) + '  <link rel="canonical"', 1)
        io.open(p, "w", encoding="utf-8").write(s)

    # sitemap: le pagine inglesi accanto a quelle italiane
    sm = os.path.join(ROOT, "sitemap.xml")
    if os.path.exists(sm):
        x = io.open(sm, encoding="utf-8").read()
        x = "".join(r for r in x.splitlines(True) if "/en/" not in r)
        oggi = __import__("datetime").date.today().isoformat()
        voci = []
        for slug in PAGINE:
            if not os.path.exists(os.path.join(ROOT, slug + ".html")): continue
            loc = base + "/en/" if slug == "index" else base + "/en/" + slug + ".html"
            voci.append('  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n' % (loc, oggi))
        x = x.replace("</urlset>", "".join(voci) + "</urlset>")
        # ogni costruzione riscrive tutte le pagine (almeno la versione di css
        # e js), quindi la data di ultima modifica è quella di oggi per tutte
        x = re.sub(r"<lastmod>[^<]*</lastmod>", "<lastmod>%s</lastmod>" % oggi, x)
        io.open(sm, "w", encoding="utf-8").write(x)
        print("\n   sitemap: %d pagine inglesi" % len(voci))

    # Le descrizioni dei progetti stanno in due posti: qui (perché finiscono
    # nei dati strutturati per i motori) e in js/data-en.js (perché le mostra
    # la scheda del catalogo). Devono dire la stessa cosa.
    # La regola è secca: se l'italiano di una voce compare in js/data.js,
    # allora il suo inglese deve comparire in js/data-en.js.
    def norm(t):
        return re.sub(r"\s+", " ", t.replace("\\n", " ")).strip()

    dati = os.path.join(ROOT, "js", "data.js")
    dae = os.path.join(ROOT, "js", "data-en.js")
    if os.path.exists(dati) and os.path.exists(dae):
        it_js = norm(io.open(dati, encoding="utf-8").read())
        en_js = norm(io.open(dae, encoding="utf-8").read())
        diverse = [en for it, en in diz.COPPIE
                   if len(it) > 40 and norm(it) in it_js and norm(en) not in en_js]
        if diverse:
            print("\n   ⚠ %d frasi che il dizionario e js/data-en.js dicono diversamente:" % len(diverse))
            for t in diverse: print("        •", t[:130])
        else:
            print("\n   dizionario e js/data-en.js: d'accordo su tutte le descrizioni")

    mai = [it for it, _ in diz.COPPIE if it not in usate]
    if mai:
        print("\n   ⚠ %d voci del dizionario non trovate nel sito:" % len(mai))
        for t in mai: print("        •", t[:160])
    print("\n   %d pagine, %d voci di dizionario, %d stringhe da tradurre, %d voci inutili"
          % (len(PAGINE), len(diz.COPPIE), problemi, len(mai)))
    return 1 if (problemi or mai) else 0

if __name__ == "__main__":
    sys.exit(main())
