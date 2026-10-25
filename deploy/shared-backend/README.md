# Porównanie ofert w istniejącym backendzie

Moduł Asystenta Remontu działa pod `/api/remont/*` na wspólnym backendzie
`https://backend-production-a43e3.up.railway.app`. Używa oryginalnego silnika
`lib/pricing-service` i serializera API, z odizolowanym adapterem katalogu.
Nie otwiera baz innych aplikacji, nie wywołuje AI ani płatnych API.

## Aktualizacja: Sewera, Buduj24 i zmiany cen — 2026-10-25

Automatyczne koszyki obejmują teraz pięć sklepów. **Sewera otrzymuje kod
pocztowy** w swoim publicznym kalkulatorze płatności/dostaw, z kompletnym
anonimowym koszykiem i magazynem Katowice. `retailer-checkouts.ts` potwierdza
EAN i brutto na kartach oraz SKU, ilości, ceny i sumę po dodaniu. Metody
kurierskie/paletowe pochodzą z checkoutu; każda dostaje osobną wycenę z kodem.
Płatność z góry potwierdzana jest razem z jej kosztem. `block_order=1` i cena0
oznaczają brak wyceny, nie darmowy transport. Lokalny transport wymagający
pełnego adresu i wycena indywidualna nie są podstawiane jako potwierdzone.
Źródło kontraktu: `https://sklep.sewera.pl/js/zamowienie.js?v=20260716`.

**Buduj24**: sesja koszyka TrisoSHOP, dokładne ilości i brutto, wybór Polski,
kuriera do domu i płatności z góry przez publiczne akcje `js/cart.js`. Suma
końcowa musi równać się materiałom + transportowi. Odczytywane są wyłącznie
dwa literalne fragmenty HTML z odpowiedzi; kod JavaScript nigdy nie jest
wykonywany. Kurier: 15 zł dla jednej taśmy i potwierdzone0zł dla 27 sztuk
(306,45zł) w rzeczywistych próbach z 2026-10-25. Taryfa krajowa PL jest jawna.

Rab-Dom, Realbud i Zino zachowują wcześniejszą integrację. **Castorama i OBI
nie są podłączone do automatycznej wyceny:** Castorama zwraca serwerowi503
również dla zasobów formularza; OBI zwraca puste404 dla publicznej karty/API
webinterface. Normalny podgląd w przeglądarce nie daje dostępu serwerowego.
Nie kopiujemy cookies przeglądarki i nie obchodzimy zabezpieczeń. Potrzebny
uzgodniony dostęp do kalkulatorów/feedów tych sklepów; w vaulcie nie ma ich
kluczy. Zwracane `retailer_access_required`, a nie zmyślona stawka. Wynik jest
najtańszy spośród uzyskanych wycen. Częściowo wycenione koszyki jednego sklepu
są rozróżniane od sklepów bez jakiejkolwiek wyceny.

Żądanie z `options.refreshPrices:true` rzeczywiście odczytuje karty ponownie,
z trzema czytnikami, współdzieleniem trwającej aktualizacji i limitem jednej
nowej partii na60s. `priceRefresh` podaje potwierdzone/nieodczytane oferty oraz
informację o niedawnym odświeżeniu. Awaria nie zmienia starej ceny ani daty.
Publiczny HTML produktów Sewery jest współdzielony maks.60s, z nowym kluczem
po zmianie ceny; sesje i koszyki pozostają rozdzielone. Wycena Sewery ma limit
20s, pozostałych12s; nowe wyceny w żądaniu startują przez maks.20s.

Mobile zapisuje ostatnio widziane ceny lokalnie dla projektu. Porównuje ten
sam EAN/produkt, ofertę, sklep, wielkość opakowania i jednostkę. Ilość sztuk,
zmiana najtańszego sklepu, brak nowej ceny albo starsza obserwacja nie generują
fałszywej podwyżki. UI pokazuje kwotę wzrostu/spadku za opakowanie oraz cenę
przed i po. Pierwszy odczyt tworzy punkt odniesienia; błąd sieci go nie usuwa.
Koszyki cenowe nie zmieniają cen wstecz, a dawne ręczne opłaty są ignorowane.

Rzeczywisty przykład potwierdzony na produkcji HTTPS i w UI: materiały264,09 + dostawy48,90 =
312,99zł (Sewera244,07 + Realbud68,92). Wszystkie kwoty brutto. Backend i UI
zawsze pokazują zakres wyceny; to nie dowód najniższej ceny na całym rynku.

Wdrożenie Railway `2e258fae-2d1a-4fb4-bd5f-47f616e3d998` SUCCESS
z 2026-10-25 12:21 UTC. Źródła wspólnego backendu: PR4,
merge `61b29607eb05a8aef3649520ac32704ff63a4c1b`. Weryfikacja: 194 testy
modułu/aplikacji i 55 regresji dotychczasowych tras, typecheck mobile/API/silnika,
743 identyfikatory. `smoke-delivery.mjs` sprawdza rzeczywiste koszyki,
zmianę ilości, kody oraz odświeżenie 11 ofert bez fałszywej daty dla 3 błędów.

## Pierwszy tryb automatycznych koszyków — 2026-10-25

**14 obserwacji / 7 produktów / 7 sklepów.** Dodano farbę Śnieżka 173 5 l
w Zino, z potwierdzonym EAN i ceną brutto w publicznym API sklepu.
`options.delivery: {mode:'shipping',method:'automatic',postalCode:'00-001'}`
jest teraz domyślną ścieżką. Bez kodu zwraca `needs_postal_code`, bez wywołań
sklepów. Stare `costsGrosze` są ignorowane, chyba że klient jawnie zażąda
`method:'manual'`. UI nie wymaga ręcznych opłat. Preferencje v2 zapisują tylko
tryb i kod osobno dla projektu; poprzednie kontrolne opłaty v1 nie są migrowane.

Rab-Dom, Realbud i Zino są wyceniane przez ich publiczny Shoper Front API:
`products/PLN/<id>` potwierdza EAN, stockId, dostępność i aktualną cenę brutto;
nowa anonimowa sesja dodaje wymagane ilości do koszyka. Odczyt koszyka musi
potwierdzić dokładnie wszystkie sztuki, ceny i sumę. Wybierana jest najtańsza
dostępna dostawa kurierska do domu w Polsce z kompatybilną płatnością z góry,
łącznie z ewentualną dopłatą. Wykluczone: odbiór, automaty/punkty, pobranie,
transport na zapytanie i palety z wyceną indywidualną. Baner darmowej dostawy
nie zastępuje faktycznej metody zwróconej dla koszyka.

**Zakres adresu:** te API zwracają taryfy dla Polski, nie wycenę zależną
wyłącznie od kodu. Pełny adres i dostępność obsługi potwierdza sklep przy
zakupie. W API/UI to `basis:retailer_basket_national`, `destinationScope:PL`.
Nie wysyłamy fikcyjnych danych kontaktowych, nie używamy cookies użytkownika
i nie składamy zamówień. Sewera wymaga oddziału/pełnego adresu, a Castorama,
OBI i Buduj24 pozostają bez automatycznej integracji dostawy. Brak wyceny jest
jawny; najtańszy wariant dotyczy tylko uzyskanych wycen, nie całego rynku.

Silnik `automatic-delivery.ts` rozważa wszystkie rozdziały potrzebnych
opakowań między sklepami, również kilku sztuk tego samego EAN. Każdy pełny
koszyk sklepu jest wyceniany oddzielnie, więc waga i progi promocji mogą
zmienić zwycięzcę. Nie dokupuje niepotrzebnego nadmiaru. Limit 4096 kombinacji,
80 unikalnych koszyków, 20 produktów, 10 sklepów, 60 sztuk/EAN; mieszane
rozmiary w jednym EAN poza tym trybem. Przekroczenie daje `limit_exceeded`.
Niepełna lista daje `partial`; brak transportu nigdy nie staje się zerem.

Cache 10 minut: klucz kod + sklep + dokładne oferty/ilości/ceny; maks. 256
wpisów. Trzy jednoczesne wyceny globalnie, brak nieograniczonej kolejki,
12 s na koszyk, 20 s na rozpoczęcie kolejnych wycen w żądaniu. Strumienie
JSON ograniczone do 1 MB, cookies do 8 kB, przekierowania tylko wewnątrz
zamkniętej domeny. Błędy krótko cache'owane. UI pokazuje przewoźnika, czas
sprawdzenia i automatycznie ponawia wynik po wygaśnięciu najstarszej wyceny.

Odbiór rzeczywisty: `node deploy/shared-backend/smoke-delivery.mjs
<HTTPS api/remont> <calculator-request.json> [proof.json]`. Sprawdza dwa kody,
izolację starych opłat, zmianę ilości i opłaty (dwie puszki Zino: 40 zł,
jedna: 20 zł), brak/błąd kodu oraz health200/auth401. Poniższe sekcje opisują
historię wcześniejszej integracji; ręczne stawki nie są już główną ścieżką.

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

## Poprzedni etap: więcej produktów i ręczne koszty — 2026-10-25

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
