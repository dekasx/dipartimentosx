/* Passaggio a pellicola fra le pagine: direzione e prima schermata.
   Sta nel <head> e NON è differito: deve essere registrato prima che la
   pagina venga disegnata, perché `pagereveal` arriva proprio lì.

   1. Direzione. La gerarchia del sito è home → catalogo → servizi → about →
      contatti, con le pagine servizio dentro "servizi". Se la pagina nuova
      sta più in alto di quella da cui arrivi, la pellicola scorre indietro.
      Da dove arrivi lo dice la Navigation API; dove non c'è (Safari prima
      della 26.2) il referrer, che vale per i link ma non per il tasto
      indietro: lì la pellicola va avanti.

   2. Prima schermata. I testi entrano con una dissolvenza e partono
      invisibili (opacity 0): il browser fotografava la pagina nuova prima
      della comparsa, quindi entrava un fotogramma vuoto e i titoli
      spuntavano dopo, come se la pagina non fosse caricata. Arrivando col
      passaggio, quello che è già in vista si mostra subito: l'entrata la fa
      la pellicola. Quello più in basso continua a comparire scorrendo. */
(() => {
  if (!("onpagereveal" in window)) return;

  const ORDINE = {
    "index": 0,
    "catalogue": 1,
    "creative-direction": 2.1,
    "directing-video-production": 2.2,
    "sound-design": 2.3,
    "web-development": 2.4,
    "photography": 2.5,
    "about": 3,
    "contact": 4,
    "privacy": 5,
    "cookie-policy": 5.1
  };

  function rango(indirizzo) {
    const u = new URL(indirizzo, location.href);
    const nome = (u.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
    if (nome === "index" && u.hash === "#services") return 2;   // la sezione servizi della home
    return nome in ORDINE ? ORDINE[nome] : 0;
  }

  addEventListener("pagereveal", (e) => {
    const vt = e.viewTransition;
    if (!vt) return;

    const nav = window.navigation && navigation.activation;
    const da = (nav && nav.from && nav.from.url) || document.referrer;
    try {
      if (da && new URL(da).origin === location.origin && rango(location.href) < rango(da)) {
        vt.types.add("indietro");
      }
    } catch (_) { /* indirizzo non leggibile: si va avanti */ }

    const h = innerHeight;
    const subito = [...document.querySelectorAll("[data-anim]:not(.is-in)")]
      .filter((el) => el.getBoundingClientRect().top < h);
    subito.forEach((el) => el.classList.add("vt-subito", "is-in"));
    vt.finished.finally(() => subito.forEach((el) => el.classList.remove("vt-subito")));
  });
})();
