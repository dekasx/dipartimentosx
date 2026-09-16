# -*- coding: utf-8 -*-
"""Aggiunge ?v=<versione> ai riferimenti locali di CSS e JS in tutte le pagine.

Serve a una cosa sola: quando pubblichi una modifica, chi ha già visitato il
sito deve vedere la versione nuova invece di quella tenuta in cache dal suo
browser. Cambiando la stringa, l'indirizzo del file cambia e la cache viene
ignorata.

Uso:  python3 .claude/stamp-assets.py
"""
import glob, os, re, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VER = time.strftime("%Y%m%d%H%M")

pat = re.compile(r'(?P<attr>src|href)="(?P<file>(?:js|css)/[A-Za-z0-9._-]+\.(?:js|css))(?:\?v=[0-9]+)?"')

changed = 0
for f in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
    s = open(f, encoding="utf-8").read()
    new = pat.sub(lambda m: f'{m.group("attr")}="{m.group("file")}?v={VER}"', s)
    if new != s:
        open(f, "w", encoding="utf-8").write(new)
        changed += 1

print(f"versione {VER} applicata a {changed} pagine")
