#!/usr/bin/env python3
"""Avvisa Bing (e Yandex, Seznam, Naver…, che se lo passano) delle pagine
cambiate con l'ultimo push, con il protocollo IndexNow. Google non lo usa.

Uso, DOPO il push e dopo aver controllato il sito online:
    python3 .claude/indexnow.py            # mostra le pagine, non manda nulla
    python3 .claude/indexnow.py --invia    # manda l'avviso

Di base confronta origin/main prima e dopo l'ultimo push (origin/main@{1}..
origin/main). Con --da COMMIT si sceglie da dove partire; con --tutte si
mandano tutte le pagine della sitemap.

La chiave è il file <32 cifre esadecimali>.txt nella radice del sito: è
pubblica per forza (i motori la scaricano per controllare che l'avviso venga
da noi), non è una credenziale.
"""
import json, os, re, subprocess, sys, urllib.request, urllib.error

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RADICE)

def git(*a):
    return subprocess.run(["git", *a], capture_output=True, text=True, check=True).stdout

def chiave():
    trovate = [f for f in os.listdir(".") if re.fullmatch(r"[0-9a-f]{32}\.txt", f)]
    if len(trovate) != 1:
        sys.exit("serve uno e un solo file chiave <32 esadecimali>.txt nella radice, trovati: %s" % trovate)
    k = trovate[0][:-4]
    assert open(trovate[0]).read().strip() == k, "il file chiave deve contenere la chiave stessa"
    return k

BASE = open(".claude/sito-base.txt").read().strip().rstrip("/") + "/"

def indirizzo(f):
    # stessi indirizzi di canonical e sitemap: index.html -> cartella
    return BASE + (f[:-len("index.html")] if f.endswith("index.html") else f)

def pulita(t):
    # stamp-assets.py cambia ?v= in tutte le pagine a ogni costruzione:
    # una pagina cambiata solo lì non è cambiata davvero
    return re.sub(r"\?v=\d+", "", t)

def cambiate(da, a):
    out = []
    for f in git("diff", "--name-only", da, a, "--", "*.html").split():
        if f.startswith(".") or "/." in f:
            continue
        try:
            prima = git("show", "%s:%s" % (da, f))
        except subprocess.CalledProcessError:
            prima = ""                       # pagina nuova
        try:
            dopo = git("show", "%s:%s" % (a, f))
        except subprocess.CalledProcessError:
            continue                         # pagina tolta
        # le pagine con noindex (hidden.html) non si annunciano a nessuno
        if re.search(r'<meta name="robots" content="[^"]*noindex', dopo):
            continue
        if pulita(prima) != pulita(dopo):
            out.append(indirizzo(f))
    return out

def tutte():
    return re.findall(r"<loc>([^<]+)</loc>", open("sitemap.xml").read())

def main():
    a = sys.argv[1:]
    invia = "--invia" in a
    if "--tutte" in a:
        urls = tutte()
    else:
        if "--da" in a:
            da, fino = a[a.index("--da") + 1], "HEAD"
        else:
            da, fino = "origin/main@{1}", "origin/main"
        urls = cambiate(da, fino)
    urls = sorted(set(urls))
    if not urls:
        print("nessuna pagina cambiata: niente da mandare")
        return
    print("%d pagine:" % len(urls))
    for u in urls:
        print("  " + u)
    if not invia:
        print("(prova: aggiungere --invia per mandare l'avviso)")
        return
    k = chiave()
    host = BASE.split("/")[2]
    corpo = json.dumps({"host": host, "key": k, "keyLocation": BASE + k + ".txt",
                        "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=corpo,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print("IndexNow: %d %s" % (r.status, "ricevuto" if r.status in (200, 202) else ""))
    except urllib.error.HTTPError as e:
        # 403: chiave non trovata online; 422: indirizzi non del sito; 429: troppi avvisi
        sys.exit("IndexNow: errore %d %s" % (e.code, e.read().decode(errors="replace")[:200]))

main()
