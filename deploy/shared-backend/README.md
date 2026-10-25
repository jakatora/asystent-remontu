# Porównanie ofert w istniejącym backendzie

Moduł Asystenta Remontu działa pod `/api/remont/*` na wspólnym backendzie
`https://backend-production-a43e3.up.railway.app`. Używa oryginalnego silnika
`lib/pricing-service` i serializera API, z odizolowanym adapterem katalogu.
Nie otwiera baz innych aplikacji, nie wywołuje AI ani płatnych API.

## Źródła i zakres

Pierwszy katalog z 2026-10-25 obejmował 7 ofert 4 produktów w 4 sklepach: Śnieżka Barwy
Natury biała 5 l (Castorama, OBI, Sewera), Knauf Universalgrund 5 l
(Castorama, Realbud), taśma Blue Dolphin 30 mm × 50 m i gruba folia
Blue Dolphin 4 × 5 m (Sewera). To zamknięty pilotaż malowania ścian,
nie pełna porównywarka wszystkich materiałów budowlanych.
Adresy są zamkniętą listą w `src/lib/retail-catalog.ts`; żądanie klienta
nie może dostarczyć URL do pobrania. Dopasowanie wymaga EAN, marki,
nazwy, pojemności i wymiarów wariantu. Parser wymaga jawnej oferty
Product/Offer JSON-LD albo sprawdzonego szablonu microdata Sewery/Realbudu,
PLN i InStock. W szablonach potwierdza widoczną cenę brutto oddzielnie od
netto. Nie używa wyników wyszukiwania, AggregateOffer ani cen
tylko dla odbioru w wybranym sklepie. Dostawa i dojazd są poza sumą.

`verified-offers.json` zawiera faktycznie odczytane obserwacje z 2026-10-24 i 2026-10-25:
URL produktu, cenę w groszach, oryginalny czas odczytu i SHA-256 treści.
To nie są próbki testowe ani wyliczone ceny. Nie zmieniać daty podczas
publikowania, kopiowania pliku lub nieudanego odświeżenia.

Serwer próbuje ponownego odczytu co 6 godzin oraz przy starcie. HTTP 403,
503, niepoprawna waluta/wariant albo brak jawnej ceny nie generuje ceny
zastępczej i nie przedłuża daty. Obserwacje starsze niż 7 dni wypadają
z porównania. Jawny termin ważności oferty również obowiązuje; daty bez
godziny wygasają po zakończeniu danego dnia w Warszawie. Potwierdzone
OutOfStock/Discontinued usuwa ofertę od razu i zapisuje wycofanie w cache,
żeby restart nie przywrócił starej obserwacji. Kolejny poprawny odczyt może
przywrócić ofertę. Cache v2 `/data/remont-prices.json` zachowuje oryginalne
daty i wycofania; czyta też poprzedni format tablicy.
`/api/remont/health` pokazuje pokrycie, daty, aktywność i błędy źródeł.

Odbiór produkcyjny 2026-10-25 potwierdził automatyczny odczyt wszystkich
4 nowych kart Sewery/Realbudu po starcie serwera (09:54:26–09:54:30 UTC),
z nowym czasem i bez błędu. Castorama i OBI nadal blokują bezpośredni fetch
Node; ich 3 obserwacje z 2026-10-24 starzeją się normalnie. Błąd nie może
udawać nowego odczytu. Nie omijamy zabezpieczeń sklepu. Dla szerszego,
stabilnego pokrycia nadal potrzebne są feedy/API lub uzgodniony dostęp.

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
   40,5 m², 2 warstwy, wydajność 10 m²/l, 1 rolka taśmy 50 m i 1 opakowanie
   folii 20 m². Zero taśmy/folii oznacza, że użytkownik już je ma i nie
   potrzebuje zakupu; klient pomija te pozycje w zapytaniu. Ten smoke sprawdza obserwacje
   z tej daty i celowo przestanie przechodzić po ich wygaśnięciu.
4. Railway ma `source.rootDirectory=backend`; upload musi zawierać
   katalog `backend/`. Wykluczyć `.env*`, node_modules, lokalne dane i testy.
   Nie dotykać środowiska ani sekretów pozostałych aplikacji.
5. Czekać na SUCCESS konkretnego deploymentId, potem sprawdzić rzeczywisty
   HTTPS: `/health`, `/auth/me` bez tokenu (401), `/api/remont/health`, POST
   `/api/remont/pricing/project` oraz ekran aplikacji. Sam upload nie jest
   potwierdzeniem wdrożenia.

Deployment `48d46563-366d-43bf-ae4c-f877c7e21091` ma status SUCCESS.
Bazą był aktualny kontener `28e56cec-c10a-4735-8d08-f3008c09c138`,
z zachowaniem zmian PrzetargAI 1.1.6. HTTPS przez klienta mobile: health 200,
auth bez tokenu 401, 7 ofert/4 produkty, 4 materiały rozpoznane, 0 brakujących.
Koszt powyższego przykładu: 255,65 zł (Sewera 220,17 zł + Castorama 35,48 zł),
bez dostaw, narzędzi i robocizny. Żaden pojedynczy sklep nie ma kompletu.
169 testów modułów i 68 regresji istniejącego backendu PASS. Mobilny podgląd
web sprawdzony w 390 × 844; natywnego wydania jeszcze nie opublikowano.

Następny priorytet: stabilne feedy i szerszy katalog, następnie lokalizacja,
dostawa, posiadane materiały i pełny koszyk wszystkich prac. Brakujące
produkty pozostają jawnie poza sumą.

## Aktualny zakres: więcej produktów i dostawa — 2026-10-25

**13 ofert / 7 produktów / 6 sklepów.** Doszły Rab-Dom (taśma i folia),
Buduj24 (taśma) oraz Sewera: Dulux EasyCare 9 l, Atlas GTA 18 kg,
Acryl-Putz ST10 20 kg. Dokładny EAN, wymiary, widoczna cena i zakres
Product/Offer są sprawdzane także dla szablonów Shoper/Buduj24.

Nowy opcjonalny kontrakt POST `/pricing/project`:

```json
{
  "jobs": ["dotychczasowe obiekty etapów"],
  "options": {
    "delivery": {
      "mode": "shipping",
      "postalCode": "00-001",
      "costsGrosze": { "Sewera": 1990, "Castorama": 2000 }
    }
  }
}
```

Przykład pokazuje strukturę i kontrolne koszty użytkownika, nie taryfę
sklepów. `jobs` musi zawierać rzeczywiste obiekty dotychczasowego kontraktu.
Tryb `pickup` wyłącza wysyłkę; dojazd nie jest liczony. Kod należy do użytkownika
i projektu, a nie właściciela aplikacji. Kwoty to nieujemne całkowite grosze,
maks. 10 000 000 na sklep; pusty/brakujący koszt nie jest zerem.

Odpowiedź dodaje `deliveryComparison`: status, kod, wybrany pełny zestaw,
materiały/dostawa/razem oraz konkretne opakowania i URL w każdym sklepie.
Stare `storeComparison` i sumy materiałów zachowują znaczenie. Backend jest
bezstanowy w zakresie kosztów użytkownika; preferencje klient zapisuje lokalnie
osobno dla projektu, obmiarów, regionu i jakości. Zmiana kodu czyści stawki.

Silnik z `lib/pricing-service/src/delivery.ts` wylicza wszystkie podzbiory
do 10 sklepów i 50 produktów, korzystając z tego samego optymalizera opakowań.
Płaci raz za każdy faktycznie użyty sklep. Nie przycina wyszukiwania i nie
ogłasza przybliżonego wyniku najtańszym. Niepełny zestaw ma status `partial`.
`needs_delivery_costs` oznacza, że nieznane opłaty mogą zmienić zwycięzcę.
Nieznana opłata ma `null` w sumie końcowej, nigdy domyślne 0 zł.

Warunki sklepów i stawki „od” są w `src/lib/store-delivery.ts`, z prawdziwymi
datami odczytu i źródłami. Po 7 dniach stawki początkowe nie są prezentowane.
**Nie są automatyczną ostateczną wyceną wysyłki.** Waga, gabaryt, adres,
płatność, wybrana metoda oraz warunki promocji wymagają potwierdzenia w koszyku
sklepu. Realbud podaje m.in. stawki netto; nie kopiować ich jako brutto.
Ostateczne opłaty wpisuje użytkownik. To jawna granica bieżącej integracji.

Aktualny deployment `a1c22f04-4918-452b-a825-625538a265c6` SUCCESS zachował
świeżą bazę `48d46563-366d-43bf-ae4c-f877c7e21091`. Wszystkie 10 odczytywalnych
źródeł odświeżono po starcie 10:39:18–10:39:27 UTC. Castorama/OBI nadal blokują
bezpośredni fetch. HTTPS: health200, auth/me401, 13 ofert/7 produktów. Dla
kontrolnych opłat `smoke.mjs`: 25565 + 3990 = 29555 groszy, 2 sklepy zamiast
4 dla najtańszych pojedynczych produktów. Bez kosztów wysyłki pełna kwota
z dostawą nie jest wskazywana. 181 testów modułów/HTTP + 55 regresji tras PASS;
kontrole typów i 743 ID/15 plików PASS. Native Android/iOS nie opublikowano.
