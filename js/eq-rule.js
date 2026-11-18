/* ============================================================
   La riga tratteggiata sopra a "Ascolta" (da telefono, dove la fila di
   cerchi col video non c'è) non sta ferma: ogni pallino sale e scende per conto suo, come le barre di un
   equalizzatore. I pallini della riga normale sono un motivo di sfondo,
   che non si può animare pezzo per pezzo: qui diventano elementi veri.
   Quanti sono lo decide la larghezza, così la grana resta quella (8 px).
   ============================================================ */
(() => {
  document.querySelectorAll("[data-eq]").forEach((riga) => {
    const PASSO = 8;               // stessa grana della riga ferma
    let quanti = 0;

    function costruisci() {
      const n = Math.max(6, Math.round(riga.clientWidth / PASSO));
      if (n === quanti) return;
      quanti = n;

      const f = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const p = document.createElement("i");
        // altezza del salto, durata e partenza diverse per ogni pallino:
        // senza questo salirebbero tutti insieme, che è un'onda, non un
        // equalizzatore. I numeri sono fissi (non a caso) così la riga è
        // sempre la stessa e non "salta" quando viene ricostruita.
        const a = 2.2 + ((i * 7) % 11) * 0.42;          // 2,2 → 6,4 px
        const t = 0.62 + ((i * 5) % 9) * 0.085;         // 0,62 → 1,3 s
        p.style.setProperty("--a", a.toFixed(2) + "px");
        p.style.setProperty("--t", t.toFixed(2) + "s");
        p.style.setProperty("--d", (-((i * 13) % 31) * 0.07).toFixed(2) + "s");
        f.appendChild(p);
      }
      riga.replaceChildren(f);
    }

    costruisci();
    if ("ResizeObserver" in window) new ResizeObserver(costruisci).observe(riga);
    else addEventListener("resize", costruisci);
  });
})();
