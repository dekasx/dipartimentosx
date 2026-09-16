// Server statico minimale per l'anteprima locale del sito.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".mp4": "video/mp4", ".mov": "video/quicktime",
  ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain"
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(ROOT, url === "/" ? "index.html" : url);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.stat(file, (err, st) => {
    if (err || st.isDirectory()) { res.writeHead(404).end("not found"); return; }

    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range;

    // Senza supporto alle richieste Range il browser non può spostarsi dentro
    // un video: `seekable` resta vuoto e la barra di avanzamento non funziona.
    // Gli hosting veri lo fanno, il server di prova deve farlo anche lui.
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        const start = m[1] ? parseInt(m[1], 10) : 0;
        const end = m[2] ? parseInt(m[2], 10) : st.size - 1;
        if (start >= st.size || end >= st.size || start > end) {
          res.writeHead(416, { "Content-Range": `bytes */${st.size}` }).end();
          return;
        }
        res.writeHead(206, {
          "Content-Type": type,
          "Content-Range": `bytes ${start}-${end}/${st.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Cache-Control": "no-store"
        });
        fs.createReadStream(file, { start, end }).pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": st.size,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => console.log("serving " + ROOT + " on http://localhost:" + PORT));
