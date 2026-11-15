# Dipartimento SX — istruzioni per lavorare e pubblicare

Sito di Dipartimento SX, studio audio/video di Roma. HTML, CSS e JavaScript
scritti a mano, **nessuna compilazione**: Netlify pubblica la cartella così com'è.
Con l'utente si parla in italiano.

Questo file sta in `.claude/` apposta: Claude Code lo legge da solo all'apertura
di una chat, e Netlify non pubblica le cartelle che iniziano con un punto
(un `.md` nella radice invece finirebbe online).
Il repository su GitHub è **pubblico**: qui dentro niente credenziali, niente
dati personali, niente che non possa leggere chiunque.

## Regola numero uno

**Un push su `main` è un deploy su Netlify, e i deploy si pagano.**
Non fare mai `git push` senza un sì esplicito dell'utente in quella chat.
Preparare, costruire e fare commit in locale va bene; il push no.

## Dove sta cosa

| Cosa | Dove |
|---|---|
| Repository | `github.com/dekasx/dipartimentosx`, ramo `main` |
| Sito online | `https://dipartimentosx.com`, pubblico e indicizzabile. `www.` e `dipartimentosx.netlify.app` rimandano lì |
| Server locale | configurazione `diparti-sito` in `.claude/launch.json`, porta 4173 |
| Video | bucket Cloudflare R2 `dipartimentosx-video`, pubblico su `https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev` |
| Contenuti (progetti, servizi) | `js/data.js`; l'inglese sopra, in `js/data-en.js` |
| Stile | `css/style.css` (sito), `css/legal.css` (solo privacy) |

Pagine scritte a mano: `index.html`, `about.html`, `catalogue.html`,
`contact.html`, `privacy.html`.
Pagine **generate**, da non modificare a mano perché vengono riscritte:
- le cinque pagine servizio (`creative-direction`, `directing-video-production`,
  `sound-design`, `web-development`, `photography`): i testi stanno in
  `.claude/gen-pages.py`, l'impaginazione in `.claude/build-service-pages.py`;
- tutta la cartella `en/`: la produce `.claude/traduci.py` dalle pagine italiane
  più il dizionario `.claude/en/dizionario.py`.

`photography.html` è la pagina "Studio Podcast & Post-Produzione": il nome del
file è rimasto quello vecchio.

## Costruire il sito

Dopo qualunque modifica, sempre in quest'ordine:

```bash
python3 .claude/gen-pages.py
```
```bash
python3 .claude/seo-catalogo.py
```
```bash
python3 .claude/stamp-assets.py
```
```bash
python3 .claude/traduci.py
```

1. `gen-pages.py` riscrive le cinque pagine servizio.
2. `seo-catalogo.py` rifà i dati strutturati del catalogo partendo da `js/data.js`.
3. `stamp-assets.py` aggiorna il `?v=AAAAMMGGhhmm` di css e js in tutte le pagine
   (css e js sono in cache per un anno: senza versione nuova i visitatori
   vedrebbero quelli vecchi).
4. `traduci.py` rigenera `en/`, gli `hreflang` e la sitemap.

L'ultima riga di `traduci.py` deve dire **`0 stringhe da tradurre, 0 voci inutili`**
e, sopra, `dizionario e js/data-en.js: d'accordo su tutte le descrizioni`.
Se segnala stringhe da tradurre, vanno aggiunte al dizionario (coppie
italiano → inglese sull'HTML grezzo, con `&amp;`, `<br>` e apostrofi tipografici
identici a quelli della pagina) e lo script va rilanciato. Non pubblicare con
stringhe rimaste in italiano.

## Pubblicare

1. Costruire il sito come sopra e controllare l'esito di `traduci.py`.
2. Guardare le pagine toccate nel server locale, anche a larghezza telefono (375 px).
3. Controlli prima del commit:
   ```bash
   git status --short
   ```
   - nessun video fra i file da aggiungere (`.mov`, `.mp4` sono in `.gitignore`:
     GitHub rifiuta i file oltre 100 MB);
   - le copertine `assets/projects/*-poster.jpg` invece **vanno** aggiunte;
   - niente materiale di lavoro (cartelle `Desktop/`, `Mobile/`, `converted/`).
4. Se nel catalogo c'è un video nuovo, deve essere già su R2 (vedi sotto):
   altrimenti online la scheda resta senza video.
5. Chiedere all'utente l'ok al push. Poi:
   ```bash
   git add -A
   ```
   ```bash
   git commit -m "Titolo breve in italiano"
   ```
   ```bash
   git push origin main
   ```
   I messaggi di commit sono in italiano, titolo breve e corpo che spiega cosa
   è cambiato. La riga `Co-Authored-By` è quella indicata dalla chat in corso.
6. Netlify pubblica in 20–30 secondi. Verificare **online** su
   `https://dipartimentosx.com`, non a memoria:
   - tutte le pagine italiane e inglesi rispondono 200
     (`/`, `/en/`, e per ogni pagina `/nome.html` e `/en/nome.html`);
   - la modifica appena fatta si vede davvero;
   - il tasto lingua porta alla pagina corrispondente;
   - in console non ci sono errori nuovi.
   Netlify riscrive l'HTML (apici singoli, indirizzi senza `.html`): cercando
   nel sorgente online un attributo copiato dal file locale si può non trovarlo.

Errori già presenti e noti, da non scambiare per regressioni: cinque font
dichiarati nel CSS ma mai esistiti (`NeueHaasUnicaPro-*`, `GT-Zirkon-Regular`,
`mono`) danno 404; il sito ripiega su Helvetica e Inter.

## Video nuovi nel catalogo

I video non stanno nel repository ma su R2. Per aggiungerne uno:

1. Convertire per il web. Se il master è H.264 fino a circa 17 Mbps, **senza
   ricomprimere l'immagine** (se fosse HEVC va ricodificato, vedi
   `.claude/prepara-video.sh`):
   ```bash
   ffmpeg -i ORIGINALE.mov -map 0:v:0 -map 0:a:0 -c:v copy -c:a aac -b:a 320k -write_tmcd 0 -movflags +faststart assets/projects/NOME.mp4
   ```
   Se invece è un master pesante (4K, 40 Mbps e oltre: in streaming andrebbe a
   scatti) va portato a 1080p, come si è fatto per il trailer di Thanks, Putin:
   ```bash
   ffmpeg -i ORIGINALE.mov -map 0:v:0 -map 0:a:0 -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset slow -crf 18 -maxrate 14M -bufsize 28M -profile:v high -pix_fmt yuv420p -c:a aac -b:a 320k -write_tmcd 0 -movflags +faststart assets/projects/NOME.mp4
   ```
2. Copertina da un fotogramma, larga 1600 px, in `assets/projects/NOME-poster.jpg`.
3. Caricare su R2 con le stesse intestazioni degli altri. È un'azione verso
   l'esterno: farla quando l'utente ha chiesto di mettere online quel video.
   ```bash
   rclone copyto assets/projects/NOME.mp4 "r2:dipartimentosx-video/projects/NOME.mp4" --s3-chunk-size 64M --header-upload "Cache-Control: public, max-age=604800" --header-upload "Content-Type: video/mp4" --s3-no-check-bucket
   ```
   Poi controllare che risponda 200 con la stessa dimensione del file locale:
   ```bash
   curl -sI https://pub-57989fc69eda4fc1a74ded76122845fd.r2.dev/projects/NOME.mp4
   ```
4. Aggiungere la voce in `js/data.js` (`PROJECTS`) con `src` sull'indirizzo
   pubblico di R2 e `poster` su `/assets/projects/NOME-poster.jpg`; la
   descrizione inglese va in `js/data-en.js` **e** nel dizionario.

`rclone` è già configurato sul Mac dell'utente con il remote `r2`. Le credenziali
stanno nella sua configurazione: non stamparle, non copiarle in nessun file,
non chiederle in chat. `rclone lsd r2:` dà "Access Denied" ed è normale (il
token vede un solo bucket): si elenca con `rclone lsf r2:dipartimentosx-video/projects/`.

## Cose da sapere prima di toccare

- **Niente richieste a domini esterni**, a parte i video su Cloudflare: i font
  sono ospitati nel sito. La privacy policy dichiara che non ci sono cookie né
  servizi terzi: aggiungere Google Fonts, statistiche o incorporamenti la
  renderebbe falsa.
- **Logo e menu sono in negativo** (`mix-blend-mode: difference`): il loro
  colore dipende dallo sfondo, non si imposta.
- **Colore di sfondo della home**: lo interpola `paintBackground` in
  `js/home.js` attorno al confine fra due sezioni, con una finestra di 0,9
  schermi. Due confini più vicini di circa 0,85 schermi fanno uno scatto di colore.
- **Da telefono la home è corta**: apertura, elenco servizi a fisarmonica,
  footer. Le sezioni a tutto schermo dei singoli servizi e l'about si vedono
  solo da desktop.
- `getBoundingClientRect()` restituisce il rettangolo già trasformato: il logo
  si misura con la classe `is-misura`, che spegne trasformazioni e transizioni.
- Le pagine in secondo piano nel browser di anteprima sospendono
  `requestAnimationFrame` e lo scorrimento animato: per misurare animazioni la
  scheda va portata in primo piano.

## Dominio

Online dal 15 novembre 2026 su `https://dipartimentosx.com`, senza `www`: è il
dominio principale scelto su Netlify, `www` e l'indirizzo `netlify.app`
rimandano lì (il secondo con la regola in `netlify.toml`). DNS su Hostinger:
A `@` → `75.2.60.5`, CNAME `www` → `dipartimentosx.netlify.app`; MX e SPF
sono quelli della posta Hostinger, da non toccare.

L'indirizzo del sito sta in `.claude/sito-base.txt` e lo usano tutti gli
script (canonical, `hreflang`, sitemap, anteprime dei link, dati strutturati).
Si cambia solo con `sito-base.py`, seguito dalla costruzione completa; con un
indirizzo `*.netlify.app` lo stesso comando rimette il sito in prova
(`noindex, nofollow`). Le date `<lastmod>` della sitemap le scrive
`traduci.py` a ogni costruzione.

## In sospeso

- "Thanks, Putin": nel catalogo c'è il trailer, con "Dal 15 novembre su
  YouTube". Quando c'è il link al documentario va aggiunto.
- Su R2 è rimasto `projects/thanks-putin-teaser.mp4`, il teaser sostituito dal
  trailer: non è più usato, si può cancellare se l'utente è d'accordo.
- I quattro estratti audio della pagina suono non hanno sottotitolo (ruolo e
  anno): mancano i dati.
- `assets/img/filmploeg-studio.jpg` e `filmploeg-in-de-studio.png` sono foto di
  archivio con filigrana, non usate: da cancellare se l'utente è d'accordo.
- Privacy: manca il nome del titolare da pubblicare (ora "fornito su richiesta").
