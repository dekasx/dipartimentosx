# Dipartimento SX — cosa manca / cosa modificare

Sito in **inglese**. Tre pagine: home a scorrimento, about, contact
(+ overlay catalogue e due pagine legali). Percorsi relativi alla root.

---

## 1. Pagine

| File | Cosa contiene |
|---|---|
| `index.html` | home: hero, carosello lavori, servizi, sezioni-vetrina, fotografia, footer |
| `catalogue.html` | la ruota dei progetti + elenco completo + scheda del singolo progetto |
| `creative-direction.html` | pagina servizio |
| `directing-video-production.html` | pagina servizio |
| `sound-design.html` | pagina servizio + **4 player** subito dopo l'hero (il suono viene prima delle foto: le immagini qui sono piccole, di lato) |
| `web-development.html` | pagina vetrina: **campo di puntini interattivo**, titolo che si ricompone, nastro scorrevole, **4 siti** con inclinazione 3D, **numeri misurati dal vivo** |
| `photography.html` | pagina servizio + **corridoio di immagini** in testata |
| `about.html` | bio dello studio + elenco servizi (pagina bianca, testo nero) |
| `contact.html` | contatti (pagina bianca, testo nero) |
| `privacy.html`, `cookie-policy.html` | pagine legali — **sono in italiano**: sono rivolte alle autorità e ai clienti italiani. Se le vuoi in inglese dimmelo. |

Le pagine servizio sono generate da uno script, così restano identiche fra loro:
`.claude/build-service-pages.py` (impaginazione) e `.claude/gen-pages.py`
(testi). Per cambiare un testo puoi modificare direttamente l'`.html`, ma se
poi rilanci `python3 .claude/gen-pages.py` lo sovrascrivi: se prevedi di
rigenerarle, modifica `gen-pages.py`.

Ogni pagina servizio porta la palette della sua sezione in home (`--bg` e
`--fg` sullo `<body>`), ha la sua `Service` in dati strutturati, e rimanda alle
altre quattro in fondo.

**Tipografia**: su tutte le pagine interne (`body.page-doc`) il testo è tutto
**Inter** — titoli, prosa, didascalie, etichette, nav e footer. Prima le
didascalie e le etichette usavano il monospaziato e la prosa un font ancora
diverso: la pagina sembrava composta con tre caratteri. La home continua a
usare il font dell'identità: se vuoi allineare anche quella, sposta le tre
righe `--font*` da `body.page-doc` a `:root` in `css/style.css`.

**Niente comparsa a dissolvenza**: sulle pagine servizio (`body.page-service`)
testi e immagini ci sono e basta. L'effetto resta sulla home.

Sezioni attualmente presenti:

| Pagina | Sezioni |
|---|---|
| Creative Direction | How we work, What you get |
| Directing & Video Production | On set, Delivery |
| Sound Design & Score | Listen, Sound design, Mix and master |
| Web Development | Built by us, This page right now, How we build it |
| Photography & Set | What we shoot, On set, The full portfolio |

Le sezioni si aggiungono e si tolgono da `.claude/gen-pages.py`.
Nota: togliendo "Original score" e "Field recording" da Sound Design sarebbero
sparite anche le sue due foto, che stavano lì. Ne ho riattaccata una a
"Sound design", altrimenti la pagina restava senza immagini.

**L'hero occupa esattamente una schermata** (`min-height: 100svh` su `.svc-hero`,
`.page-head` e `.corridor`): non si vede mai un pezzo della sezione successiva.

## 2. Sezioni della home

| # | Sezione | id | Sfondo |
|---|---|---|---|
| 1 | Hero / showreel | `#home` | video |
| 2 | Selected work (carosello) | `#work` | video |
| 3 | Services (animazione puntini) | `#services` | `#ffffff` |
| 4 | Creative Direction | `#creative-direction` | `#d6d6d6` |
| 5 | Directing & Video Production | `#directing-video-production` | `#000000` |
| 6 | Stills / collage | `#directing-still` | `#000000` |
| 7 | Sound Design & Score | `#sound-design` | `#38211b` |
| 8 | Web Development | `#web-development` | `#5b6157` |

Sfondo e colore testo di ogni sezione stanno negli attributi `data-bg` /
`data-fg`: la transizione graduale si ricalcola da sola.

Le sezioni 4-8 sono **vetrine**: il titolo porta alla pagina del servizio, dove
sta il testo lungo. Anche l'elenco puntato della sezione 3 porta alle pagine.
Il link "read more" sotto ai paragrafi è stato tolto: restava il titolo, che
è già cliccabile. Su mobile il "read more" c'è ancora, dentro la fisarmonica.

La sezione fotografia in fondo alla home è stata rimossa: le foto stanno sulla
pagina `photography.html`. Nella fisarmonica mobile la voce Photography prende
il testo dal campo `blurb` in `SERVICES` e la foto da `PHOTOS` (`js/data.js`),
perché non c'è più una vetrina da cui pescarli.

### Il catalogo è una pagina

Prima era un pannello sovrapposto alla home, ora è `catalogue.html`, ed è
**tutta ruota**: una schermata sola, senza altro sotto.

- **Scorrimento libero e continuo**, come la selezione dell'ora su iPhone.
  Nessun passo imposto: c'è lo scroll nativo del browser, con la sua inerzia,
  e lo `scroll-snap-type: y mandatory` che posa la voce al centro quando ti
  fermi. Prima ogni gesto veniva intercettato e tradotto in un passo secco —
  da lì gli scatti.
- **L'effetto tamburo** (rotazione + dissolvenza verso i bordi) è fatto dal
  browser con una animazione agganciata allo scroll
  (`animation-timeline: view()` su `.wheel-item`, in `css/style.css`). Gira sul
  compositor, quindi resta in sincrono con lo scorrimento a qualsiasi velocità.
  Farlo in JavaScript voleva dire ricalcolarlo a ogni fotogramma: sfogliando
  veloce la trasformazione arrivava in ritardo rispetto allo scroll e le voci
  sembravano allontanarsi per poi riavvicinarsi. La versione JS
  (`updateWheel()` in `js/catalogue.js`) resta come riserva per i browser che
  non supportano le animazioni da scroll — Safari precedenti al 26 e Firefox.
- **È infinita.** L'elenco è ripetuto `COPIES` volte (9, in `js/catalogue.js`)
  e quando lo scroll si avvicina a un'estremità viene riportato al centro di
  un numero intero di blocchi: i blocchi sono identici, quindi il salto non si
  vede. Dopo Zoom ricomincia da Artmosaic e così via, all'infinito.
- Il click apre la **scheda del progetto**, con deep link:
  `catalogue.html#lodigiani` apre quel progetto.
- Dentro la scheda i progetti sono **impilati e si scorrono**: da uno all'altro
  si passa scorrendo, con l'indirizzo che segue quello al centro. Prima ogni
  gesto scambiava la scheda con una dissolvenza, e il contenuto spariva e
  ricompariva.
- **Si esce cliccando fuori dal riquadro**, oltre che con la freccia o con Esc.
- Il **player è minimale**: tasto play a sinistra, una riga sottile con il
  trattino verticale che segna il punto, tasto audio a destra. Nessun controllo
  di sistema, nessun conteggio dei secondi. Si clicca sulla riga per spostarsi
  nel video, sul video per mettere in pausa, sull'altoparlante per accendere
  l'audio (parte muto perché lo impongono i browser). Quando l'audio è acceso
  il titolo del progetto diventa verde.
  Il trattino si muove a **ogni fotogramma**: prima era agganciato all'evento
  `timeupdate`, che arriva quattro o cinque volte al secondo, e si vedeva
  avanzare a scatti.
- Nella ruota i titoli lunghi vengono troncati con i puntini di sospensione;
  per intero si leggono nella scheda. Se preferisci, si può aggiungere un
  titolo breve per la ruota in `js/data.js`.

**Nota**: siccome la ruota è infinita non c'è una fine da cui scendere, quindi
questa pagina **non ha il footer** — i due link legali stanno in basso a
destra. Se lo rivuoi, l'alternativa è rimettere un limite alla ruota.

Il click su una slide del carosello in home porta direttamente alla scheda
(`catalogue.html#slug`).

### Su mobile la home è un'altra cosa

Sotto gli 820px le sezioni 4-9 **spariscono** e il loro contenuto finisce dentro
una fisarmonica: le voci dei servizi si aprono al tocco, con un `+` che diventa
un `−` verde. La pagina passa da **8615 a 2935 px**.

Il testo e la foto di ogni pannello sono **presi dalla sezione-vetrina
corrispondente**, che resta nel documento (nascosta via CSS): non c'è un secondo
testo da tenere aggiornato, e Google continua a leggerli. L'unica eccezione è
Photography, la cui vetrina è solo un carosello senza testo: per quella c'è un
campo `blurb` in `SERVICES` (`js/data.js`).

Anche l'animazione dei puntini è disattivata su mobile: la sezione non è più
una scena bloccata alta due schermate ma un elenco che scorre normale.
Su desktop non cambia niente — `+` e pannelli sono nascosti e la voce resta
un link alla pagina.

**Servizi: sono 5.** Post-produzione è dentro *Directing & Video Production*,
come nella tua demo `4.png`. L'elenco si modifica in un punto solo: `SERVICES`
in `js/data.js` — `target` è insieme l'id della sezione in home e lo slug della
pagina (`<target>.html`).

## 3. Comportamento dello scroll

- **Scroll libero**, tranne il primo passaggio. Dalla sezione 1 alla 2 (e
  ritorno) un gesto porta di là, intero — e **la stessa cosa la fanno freccia
  giù/su, pagina giù/su e la barra spaziatrice**. Dalla sezione 3 in poi la
  pagina scorre come qualsiasi altro sito. Sta in `js/home.js`, cerca
  "PASSAGGIO HERO"; per toglierlo basta cancellare quel blocco.

  Due accorgimenti che servono a non farlo incastrare: mentre il salto è in
  corso le rotellate rimaste (la coda dell'inerzia del trackpad) vengono
  ignorate ma **non allungano il blocco**, e c'è un **tetto di 1,2 secondi**
  oltre il quale si sblocca comunque. Nella versione precedente ogni evento
  inghiottito rimandava la scadenza: con una scrollata forte l'inerzia teneva
  il blocco vivo all'infinito e la pagina sembrava congelata.

- **Sezione puntini**: l'animazione è guidata dallo scroll e occupa circa 1,2
  schermate (`height: 220svh` in `css/style.css`, `200svh` su mobile).
  Abbassa quel valore se vuoi che finisca prima.
- **Linee tratteggiate**: guidate dallo scroll, si disegnano mentre la sezione
  sale in posizione e si completano quando è a filo. Manopole in
  `js/scroll-fx.js`: `REVEAL_START` (alzalo per un tratto più lento),
  `REVEAL_STAGGER`, `REVEAL_END`. Sul singolo `<path>` puoi forzare
  `data-from` / `data-to`. Stanno **dietro** a foto e testi (`.conn { z-index: -1 }`).
- **Colore di sfondo**: vira su una finestra centrata sul confine fra due
  sezioni (`BG_ZONE` in `js/home.js`). Deve restare centrata, altrimenti torna
  lo scatto.
- **Linee al movimento del mouse** (solo `directing-video-production.html`):
  ogni tanto ne nasce una discosta dal cursore, si disegna, resta un attimo e
  svanisce. Nascono in **coordinate di pagina**: restano dove sono e scorrono
  via con il contenuto, non restano incollate allo schermo. Per questo il
  livello è `position: absolute` alto quanto tutta la pagina e il `<body>`
  della pagina ha la classe `has-trail`. Manopole in `js/trail-lines.js`: `TRAVEL` (quanti px di movimento
  fra una linea e l'altra — alzalo per farne meno), `MAX_LIVE` (quante ne
  restano a schermo), `DRAW` / `HOLD` / `FADE` (tempi). Passano dietro a testi
  e foto. Su touch e con `prefers-reduced-motion` non partono affatto.
  Per metterle anche su un'altra pagina servono tre cose: la classe
  `has-trail` sul `<body>`, il tag `<svg class="trail" data-trail
  aria-hidden="true"></svg>` come primo figlio del body, e lo script.

### File JavaScript

| File | Cosa fa |
|---|---|
| `js/data.js` | progetti, servizi, fotografie |
| `js/scroll-fx.js` | motore condiviso: linee, parallasse, comparsa dei testi |
| `js/site.js` | cursore, logo, anno, link fra pagine |
| `js/home.js` | solo home: colore di sfondo, puntini, caroselli |
| `js/catalogue.js` | ruota dei progetti e scheda del singolo progetto |
| `js/corridor.js` | corridoio di immagini (Photography) |
| `js/players.js` | player audio (Sound Design) |
| `js/webdev-fx.js` | campo di puntini, titolo scramble, tilt delle card, numeri live |
| `js/trail-lines.js` | linee tratteggiate che nascono al movimento del mouse (Directing) |

### Due trappole trovate strada facendo

**I video devono nascere con `preload="auto"`.** Erano creati con
`preload="none"` e la sorgente assegnata dopo: così il browser li scarica come
un flusso e non li considera navigabili — `seekable` resta `[0,0]` e la barra
non permette di spostarsi nel video. Il caricamento resta comunque pigro,
perché finché non c'è una sorgente non viene scaricato niente.

**Il server di prova ora gestisce le richieste Range** (`.claude/serve.js`).
Senza, nessun video è navigabile in locale, e sembra un problema del sito
quando invece è del server. Gli hosting veri, Netlify compreso, lo fanno già.

### La testata della home

La scritta **dipartimento** sta a sinistra, centrata in verticale, con il
**logo alla sua destra**; appena si scorre il logo torna nell'angolo in basso
a sinistra, dove vive nel resto del sito. Sono due stati con una transizione
in mezzo (`--lx` / `--ly` / `--ls` scritte da `js/home.js`, cerca
"LOGO ACCANTO ALLA SCRITTA"), non un'animazione legata allo scroll.

Entrambi restano **in negativo** (`mix-blend-mode: difference`), così si
leggono su qualsiasi fotogramma del video.

| File | Nota |
|---|---|
| `assets/img/wordmark.png` | la scritta, ritagliata sul contenuto (1456×144, 48 kB). Il tuo originale `assets/projects/diparti hero.png` era 1920×1080 quasi tutto vuoto: ritagliarlo serve a poterla posizionare con precisione. |

Su mobile l'accostamento non si fa — non c'è larghezza: la scritta va al
centro e il logo resta in alto a sinistra.

## 4. Logo

| File | Uso |
|---|---|
| `assets/img/logo-sx.svg` | logo originale che mi hai mandato (nero) |
| `assets/img/logo-sx-white.svg` | **usato nell'header**: è lo stesso file con `fill="#ffffff"`. Serve bianco perché la nav è in negativo (`mix-blend-mode: difference`): un logo nero risulterebbe invisibile. |
| `assets/img/favicon.svg` | icona della scheda del browser, nera su temi chiari e bianca su temi scuri |

Se cambi il logo, aggiorna tutti e tre i file.

---

## 5. Video

### Showreel della home

| File | Note |
|---|---|
| `assets/video/showreel-web.mp4` | **è questo che usa il sito** (15,6 MB): `-movflags +faststart`, audio rimosso, CRF 26 |
| `assets/video/showreel.mp4` | il tuo master (48 MB). Resta qui come sorgente, non viene servito. |

### Carosello dei lavori (sezione viola della home)

I quattro video sono **estratti da 10 secondi in alta qualità**, non i film
interi compressi. Comprimere un master di due minuti fino a farlo stare in
pochi MB significa buttare via dettaglio; tagliare dieci secondi e lasciarli
quasi intatti no. Il carosello va in loop, quindi dieci secondi bastano.

| Master | File servito | Master | Clip 10s | Qualità |
|---|---|---|---|---|
| Lodigiani x Umbro (1080×1920) | `lodigiani.mp4` | 15 MB | **5,6 MB** | CRF 20 |
| Botteghe Ep. 4 (1440×1080) | `botteghe-ep4.mp4` | 120 MB | **4,0 MB** | CRF 20 |
| Botteghe Ep. 5 (2880×2160) | `botteghe-ep5.mp4` | 425 MB | **18 MB** | CRF 22 |
| Battle Beat Skate Park (1920×1080) | `beat-skatepark.mp4` | 197 MB | **11 MB** | CRF 22 |
| | | 758 MB | **39 MB** | |

I due più pesanti sono a CRF 22 invece di 20: sono girati mossi e pieni di
grana, a 20 pesavano un terzo in più senza che si veda la differenza in
movimento. Se li vuoi al massimo, metti 20 anche lì.

### Il comando

```
ffmpeg -ss 0 -i "MASTER.mov" -t 10 \
  -vf "scale='min(1920,iw)':-2:flags=lanczos" \
  -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -profile:v high -level 4.0 \
  -c:a aac -b:a 192k -ac 2 \
  -movflags +faststart "assets/projects/nome.mp4"

ffmpeg -i "assets/projects/nome.mp4" -frames:v 1 -q:v 3 "assets/projects/nome-poster.jpg"
```

**I due numeri che vorrai cambiare** sono in cima: `-ss 0` è il secondo da cui
parte il taglio, `-t 10` quanto dura. Adesso partono tutti da zero perché ho
controllato che nessuno abbia neri o titoli in testa — ma il momento giusto lo
sai solo tu. Per prendere i dieci secondi dal minuto 1 e 12:

```
ffmpeg -ss 72 -i "MASTER.mov" -t 10 ...il resto uguale...
```

Il resto, pezzo per pezzo:

- `scale='min(1920,iw)'` — porta a 1920 di lato lungo solo se è più grande,
  non ingrandisce mai. Un 4K su un sito è sprecato.
- `-crf 20` — qualità quasi indistinguibile dal master. **Niente `-maxrate`**:
  era il tetto di bitrate a rovinare la resa, non il CRF. Sulla scala x264:
  18-20 praticamente identico all'originale, 23 default buono, oltre 28 si
  vedono i blocchi.
- `-c:a aac -b:a 192k` — l'audio va tenuto, il carosello ha il tasto
  altoparlante. Due dei master avevano audio **non compresso** (PCM): da soli
  pesavano 25 e 33 MB.
- `-movflags +faststart` — **il più importante**. Sposta l'indice del filmato
  all'inizio: senza, il browser deve scaricare tutto il file prima di far
  partire un fotogramma. È lo stesso problema che avevi notato sullo showreel.
- Il poster **deve essere il fotogramma 0** del file servito, altrimenti si
  vede lo scatto quando parte la riproduzione.

### I sorgenti non devono finire online

Prima di pubblicare vanno spostati fuori dalla cartella del sito:

| Dove | Cosa | Peso |
|---|---|---|
| `assets/video/` | i `.mov` di montaggio + `showreel.mp4` originale | ~758 MB |
| `assets/img/sito olichi.mov` | la registrazione da cui è nata la GIF | 68 MB |
| `assets/img/sito *.png` | gli screenshot a piena risoluzione | 3 MB |
| `assets/projects/diparti hero.png` | l'originale della scritta | 40 kB |

Al sito servono solo i file già convertiti: `assets/projects/*.mp4`,
`showreel-web.mp4` e i `.jpg` / `.gif` / `wordmark.png` in `assets/img/`.

### Attenzione: la foto della pagina Photography

`assets/img/filmploeg-in-de-studio.png`, quella che mi hai chiesto di mettere
sotto, è **una foto stock di Getty Images con la filigrana ancora sopra**: si
legge "gettyimages / Credit: DigitalVision" in mezzo all'immagine. L'ho messa
dove chiedevi (convertita in `assets/img/filmploeg-studio.jpg`), ma così com'è
non può andare online: oltre a vedersi la scritta, sarebbe un uso senza
licenza su un sito commerciale.

Tre strade: comprare la licenza e sostituire il file con la versione pulita,
usare uno scatto vostro dello stesso tipo, oppure rimettere quella di prima
(`assets/img/cacao.jpg`). Il nome del file sta in `.claude/gen-pages.py`,
blocco `photography`.

### Video verticali

Lodigiani è girato 9:16. In una slide a tutto schermo verrebbe tagliato a metà,
quindi lo mostro intero con una copia sfocata del suo fotogramma a riempire i
lati. Si attiva da solo, ma puoi forzarlo con `portrait: true` sul progetto in
`js/data.js`.

## 6. Immagini

Ho convertito in JPG le foto che mi hai passato (da ~8 MB a ~500 KB totali);
gli originali PNG restano in `assets/nuove pic/`.

`merceria.jpg`, `babbo.jpg`, `babbo-2.jpg`, `cacao.jpg`, `gorp.jpg`,
`studio.jpg`, `zoom.jpg` in `assets/img/`, più `showreel-poster.jpg` e
`og-cover.jpg` generati dal video.

**Carosello fotografia (sezione 9)**: adesso riusa quelle foto. Quando hai gli
scatti veri, mettili in `assets/img/` e aggiorna `PHOTOS` in `js/data.js`
(percorso + `alt`, che serve per Google). JPG, 1600 px sul lato lungo.

---

## 6b. Da caricare per le pagine servizio

### Sample audio — `sound-design.html`

Quattro slot. Finché i file mancano, lo slot lo dichiara ("file coming soon") e
il tasto resta disattivato: non si rompe niente.

| Slot | File | Titolo attuale (modificabile in `.claude/gen-pages.py`, lista `SAMPLES`) |
|---|---|---|
| 1 | `assets/audio/sample-01.mp3` | Botteghe Storiche — main theme |
| 2 | `assets/audio/sample-02.mp3` | Cacao Crudo — Christmas film |
| 3 | `assets/audio/sample-03.mp3` | Beat Skatepark — aftermovie |
| 4 | `assets/audio/sample-04.mp3` | Villa Ada — field recording |

MP3 128-192 kbps, 30-60 secondi: sono estratti, non il brano intero.

### Anteprime dei siti — `web-development.html`

Ci sono, convertite dai file che hai caricato:

| Progetto | File servito | Peso |
|---|---|---|
| Olichi | `assets/img/web-olichi.gif` | 3,4 MB |
| Propaganda | `assets/img/web-propaganda.jpg` | 179 kB |
| Sicurfer | `assets/img/web-sicurfer.jpg` | 118 kB |
| Dipartimento SX | `assets/img/web-dipartimentosx.jpg` | 66 kB |

Nomi, didascalie e link sono nella lista `SITES` in `.claude/gen-pages.py`:
adesso i link puntano a `#`, mettici gli indirizzi veri.

**Sulla GIF.** L'ho fatta come chiedevi: 640 px, 10 fotogrammi al secondo,
64 colori, primi 6 secondi — 3,4 MB. Per darti il metro: la registrazione
intera a 800 px veniva **14 MB**, e lo stesso spezzone in mp4 a doppia
risoluzione pesa **364 kB**, cioè un decimo. Ho lasciato anche quello in
`assets/img/web-olichi.mp4`: se vuoi passarci basta cambiare il nome del file
in `SITES` e sostituire l'`<img>` con un `<video autoplay muted loop
playsinline>` nel generatore. La GIF resta quella servita finché non lo fai.

### Effetti della pagina Web Development — `js/webdev-fx.js`

| Effetto | Dove si tara |
|---|---|
| Campo di puntini (repulsione del cursore, onda di fondo, onda al click) | `SPACING`, `BASE_R`, `REACH`, il moltiplicatore di `push` |
| Titolo che si ricompone da caratteri casuali | `GLYPHS` e i tempi in `scramble()` |
| Inclinazione 3D delle card + riflesso che segue il puntatore | gradi in `tilt()` |
| Quattro numeri **misurati dal vivo** con la Performance API | `stats()` — sono misure reali del caricamento, non valori scritti a mano: cambiano a ogni ricarica |

Tutto si ferma o resta statico con `prefers-reduced-motion`, e il campo di
puntini smette di disegnare quando esce dallo schermo.

### Corridoio di immagini — `photography.html`

Usa la stessa lista `PHOTOS` di `js/data.js`. Più foto carichi, meno si ripete.
La geometria sta in `js/corridor.js` (oggetto `PATH`): `speed` e `cards` si
cambiano anche dagli attributi `data-speed` / `data-cards` nell'HTML.


---

## 7. Testi da rivedere

- I testi delle **pagine servizio**, delle sezioni-vetrina in `index.html` e la
  bio in `about.html` sono una **prima stesura scritta da me**: riscrivili con
  parole vostre. Sono quelli che Google legge davvero.
- `js/data.js` → `PROJECTS`: data, scopo, attrezzatura, collaborazioni,
  descrizione di ogni progetto. Cerca `[PLACEHOLDER]`.
- `privacy.html` / `cookie-policy.html`: i campi evidenziati in giallo
  (ragione sociale, indirizzo, partita IVA, fornitori, tempi di conservazione).
  Falli vedere a un commercialista o a un legale prima di pubblicare.
- Footer: `VAT [TO BE COMPLETED]` in tutte e tre le pagine.
- Dominio: nelle meta è ipotizzato `https://www.dipartimentosx.com/`. Se cambia,
  cerca e sostituisci anche in `robots.txt` e `sitemap.xml`.

---

## 8. Font (`assets/fonts/`)

**Inter c'è già**: `Inter-latin.woff2` (48 kB) e `Inter-latin-ext.woff2`, scaricati
da Google e **ospitati da noi**. Così il sito non fa nessuna richiesta a domini
esterni e la cookie policy resta valida com'è. È un font variabile: un file solo
copre i pesi 400-600. Licenza SIL OFL, la redistribuzione è consentita.
Lo usano i link "read more" (`--font-inter` in `css/style.css`).

Gli altri mancano ancora e si usano i fallback di sistema. Servono in **WOFF2**:
`NeueHaasUnicaPro-Regular/Medium/Bold`, `GT-Zirkon-Regular`, `mono`, `bmon`.
Se i nomi dei tuoi file sono diversi, aggiorna i `@font-face` in cima a
`css/style.css`.

## 9. Prova in locale

```
node .claude/serve.js
```
poi `http://localhost:4173`.

## 9b. Prima di pubblicare: aggiorna la versione degli asset

```
python3 .claude/stamp-assets.py
```

Aggiunge `?v=<data e ora>` a tutti i riferimenti a CSS e JavaScript nelle
pagine. Serve a una cosa sola, ma importante: senza, chi ha già visitato il
sito continua a vedere i file vecchi tenuti in cache dal suo browser anche
dopo che hai pubblicato le modifiche. Cambiando la stringa cambia l'indirizzo
del file, e la cache viene ignorata.

Mi è successo proprio durante il lavoro: il browser di prova continuava a
eseguire una versione vecchia dello script e le verifiche davano risultati
incoerenti. Rilancialo ogni volta che tocchi un file in `css/` o `js/`.

---

## 10. Nota SEO

Il sito è in inglese: intercetta bene le ricerche internazionali, meno quelle
italiane tipo "videomaker Roma". Se in futuro vi interessa anche il mercato
italiano, la strada è una versione `/it/` con `hreflang`, non la traduzione della
stessa pagina.

Le cinque pagine servizio sono online con 450-600 parole ciascuna, dati
strutturati `Service`, e link incrociati fra home, about e pagine.
Prossimo passo utile: **2-3 casi studio per pagina** (progetto, problema,
risultato) — è il contenuto che fa la differenza fra comparire e essere scelti.
