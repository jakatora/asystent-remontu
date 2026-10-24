# Porównanie ofert w istniejącym backendzie

Moduł Asystenta Remontu działa pod `/api/remont/*` na wspólnym backendzie
`https://backend-production-a43e3.up.railway.app`. Używa oryginalnego silnika
`lib/pricing-service` i serializera API, z odizolowanym adapterem katalogu.
Nie otwiera baz innych aplikacji, nie wywołuje AI ani płatnych API.

## Źródła i zakres

Pierwszy katalog to 3 oferty 2 produktów: Śnieżka Barwy Natury biała 5 l
w Castoramie i OBI oraz Knauf grunt uniwersalny 5 l w Castoramie.
Adresy są zamkniętą listą w `src/lib/retail-catalog.ts`; żądanie klienta
nie może dostarczyć URL do pobrania. Dopasowanie wymaga EAN, marki,
nazwy i pojemności. Parser wymaga jawnej oferty Product/Offer JSON-LD,
PLN i InStock; nie używa wyników wyszukiwania, AggregateOffer ani cen
tylko dla odbioru w wybranym sklepie. Dostawa i dojazd są poza sumą.

`verified-offers.json` zawiera faktycznie odczytane obserwacje z 2026-10-24:
URL produktu, cenę w groszach, oryginalny czas odczytu i SHA-256 treści.
To nie są próbki testowe ani wyliczone ceny. Nie zmieniać daty podczas
publikowania, kopiowania pliku lub nieudanego odświeżenia.

Serwer próbuje ponownego odczytu co 6 godzin oraz przy starcie. HTTP 403,
503, niepoprawna waluta/wariant albo brak jawnej ceny nie generuje ceny
zastępczej i nie przedłuża daty. Obserwacje starsze niż 7 dni wypadają
z porównania. Cache `/data/remont-prices.json` zachowuje datę oryginalnego
odczytu. `/api/remont/health` pokazuje pokrycie, daty i błędy źródeł.

Weryfikacja na komputerze wykazała, że PowerShell odczytuje publiczne karty,
ale bezpośredni fetch Node jest blokowany. Nie omijamy zabezpieczeń sklepu.
Stabilne automatyczne odświeżanie wymaga udostępnionego feedu/API sklepu
lub uzgodnionego dostępu. Nie deklarować integracji całego katalogu.

## Przygotowanie i publikacja

1. Pracować na kopii **obecnie działającego kodu backendu**, a nie starym
   lokalnym checkoutcie. Wspólny backend obsługuje również inne aplikacje.
   Zachować jego aktualne zmiany i konfigurację.
2. `node artifacts/api-server/prepare-shared-backend.mjs <checkout-backendu>`
   kopiuje trasę i obserwacje, buduje moduł CJS oraz montuje trasę przed 404.
   Potrzebne zależności już istnieją w backendzie. Nie edytować wygenerowanego
   `remont-pricing.cjs` ręcznie; źródłem jest `src/shared-backend.ts`.
3. Sprawdzić typecheck, testy parsera/adaptera/HTTP i regresję dotychczasowych
   tras. `smoke.mjs` należy skopiować do katalogu backendu i przekazać mu
   plik JSON z rzeczywistego `toPricingStageInput` kalkulatora malowania
   40,5 m², 2 warstwy, wydajność 10 m²/l. Ten smoke sprawdza obserwacje
   z tej daty i celowo przestanie przechodzić po ich wygaśnięciu.
4. Railway ma `source.rootDirectory=backend`; upload musi zawierać
   katalog `backend/`. Wykluczyć `.env*`, node_modules, lokalne dane i testy.
   Nie dotykać środowiska ani sekretów pozostałych aplikacji.
5. Czekać na SUCCESS konkretnego deploymentId, potem sprawdzić rzeczywisty
   HTTPS: `/health`, `/auth/me` bez tokenu (401), `/api/remont/health`, POST
   `/api/remont/pricing/project` oraz ekran aplikacji. Sam upload nie jest
   potwierdzeniem wdrożenia.

Następny priorytet: stabilne feedy i szerszy katalog, następnie lokalizacja,
dostawa, posiadane materiały i pełny koszyk wszystkich prac. Brakujące
produkty pozostają jawnie poza sumą.
