/**
 * Serwer statyczny dla WEBOWEJ wersji Asystenta Remontu (`web-build/`).
 *
 * Po co: apka jest Expo (iOS/Android) i nie ma natywnego celu Windows. Jedyna forma, która
 * realnie uruchamia ją NA KOMPUTERZE, to eksport webowy (`expo export --platform web`) —
 * ten sam kod, ten sam ekran, tylko renderowany przez react-native-web.
 *
 * Zero zależności zewnętrznych (jak `serve.js` obok) — same wbudowane moduły Node.
 * Wszystkie nieznane ścieżki oddają `index.html`, bo expo-router trzyma trasy po stronie
 * przeglądarki: bez tego wejście wprost w /onboarding kończyłoby się 404.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const KATALOG = path.resolve(__dirname, "..", "web-build");
const PORT = Number(process.env.PORT || 4174);

const TYPY = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

function oddaj(res, plik) {
  const typ = TYPY[path.extname(plik).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "content-type": typ });
  fs.createReadStream(plik).pipe(res);
}

const serwer = http.createServer((req, res) => {
  const sciezka = decodeURIComponent((req.url || "/").split("?")[0]);
  // Zabezpieczenie przed wyjściem poza katalog builda (../../).
  const cel = path.normalize(path.join(KATALOG, sciezka));
  if (!cel.startsWith(KATALOG)) {
    res.writeHead(403).end("nie wolno");
    return;
  }
  if (fs.existsSync(cel) && fs.statSync(cel).isFile()) {
    oddaj(res, cel);
    return;
  }
  const index = path.join(KATALOG, "index.html");
  if (!fs.existsSync(index)) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Brak web-build/. Zbuduj apkę:  npx expo export --platform web --output-dir web-build");
    return;
  }
  oddaj(res, index);     // trasy expo-router obsługuje przeglądarka
});

serwer.listen(PORT, "127.0.0.1", () => {
  console.log(`Asystent Remontu (web) → http://127.0.0.1:${PORT}`);
});
