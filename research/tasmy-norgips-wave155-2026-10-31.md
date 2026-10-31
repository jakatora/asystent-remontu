# Dokładne rolki taśm Norgips i wspólna dostawa — 2026-10-31, wave155

Dodano dwa produkty ze zdjęciami do wyszukiwarki dodatkowych materiałów wspólnego koszyka. Oba mają bieżącą ofertę HIPPER, potwierdzony GTIN, jednostkę zakupu i długość rolki w dokumentacji producenta. Potrzebne ilości pozostają w metrach; dopiero wycena dobiera całe rolki. Nie zmieniono dotychczasowych prac ani ich zapisanych materiałów.

| Produkt | GTIN | Rolka | Cena brutto przy odczycie |
| --- | --- | --- | --- |
| Taśma papierowa Norgips z wkładką metalową 50 mm | 5907651699940 | 30 m | 96,99 zł |
| Taśma samoprzylepna Norgips z włókna szklanego 45 mm | 5907651699995 | 153 m | 22,99 zł |

Źródła: [oferta taśmy narożnikowej](https://hipper.pl/tasma-papierowa-z-wkladka-metalowa-50-mm-norgips-2682508803), [karta producenta, strona 2](https://norgips.pl/media/repository/0/306/47772594ab104a20ab31ac3f7ea22975/NORGIPS_PL_KT_akcesoria_tasma_papierow_784Tcv5.pdf); [oferta siatki](https://hipper.pl/tasma-samoprzylepna-z-wlokna-szklanego-45-mm-norgips-2682509844), [karta producenta, strona 2](https://norgips.pl/media/repository/0/302/821d0d1d23d644d2b9e7ec418df53b90/NORGIPS_PL_KT_akcesoria_tasma_samoprzy_iKwHTWR.pdf).

Narożnikowa służy do wzmacniania naroży i wymaga systemowej masy. Siatka jest zalecana do oryginalnych spoin podłużnych; producent nie zaleca jej do połączeń ciętych. Nie połączono ich ze zwykłą taśmą papierową, fizeliną 25 m ani uszczelnieniem pod profile. Wpisy wyraźnie opisują zastosowanie i brak automatycznej zamiany. Kartony zbiorcze producenta nie są minimalnym zamówieniem sklepu.

## Sprawdzenie kosztów

Rzeczywisty anonimowy koszyk HIPPER potwierdził **2×30 m + 2×153 m = 239,96 zł materiałów + 18,90 zł kuriera = 258,86 zł**. To wynik dla zapotrzebowania 31 m i 154 m, a nie cena 31 i 154 rolek. Po dodaniu dokładnej rolki AKS YDYp 3×2,5 mm² 450/750 V, 25 m / GTIN 5904617578721, ten koszyk nadal ma dostawę **18,90 zł**: materiały 428,96 zł, razem **447,86 zł**. Nie użyto stawki 37,80 zł z wcześniejszego innego koszyka EPN + przewód. Dane transportu pochodzą z całego aktualnego zamówienia.

Gotowy lokalny pakiet web + izolowane nowe API + rzeczywiste koszyki sklepów potwierdziły obie sumy, dwie załadowane fotografie i wybór HIPPER dla całego zestawu trzech produktów. Przekierowano jedynie HTTP aplikacji do lokalnego API; nie przechwytywano ani nie podmieniano cen lub odpowiedzi sklepu. Ponowne otwarcie zachowało 31/154/25 m i kod 30-001. PL, 390 px bez przepełnienia, crossOriginIsolated=true, 0 błędów strony, 0 odpowiedzi 429.

HIPPER potwierdza taryfę krajową PL. Interfejs pokazuje jej podstawę i odróżnia ją od wyceny sklepu dla konkretnego kodu pocztowego. Nie składano zamówień ani płatności i nie podawano danych kontaktowych.

## Ochrona jednostek i testy

Nowa lista dopuszcza wyłącznie dwa dokładne zestawy GTIN, identyfikatorów produktu/jednostki sklepu, URL, rozmiaru rolki, marki i wariantu. Dodatkowo sprawdza aktualne natywne atrybuty długości, szerokości i marki. Brak, zmiana lub zduplikowanie tych atrybutów zatrzymuje potwierdzenie oferty. Zmiana na cenę metra, karton, rolkę 90 m albo minimalny wielopak nie może dać pozornie taniej oferty. Dotychczasowe zabezpieczenia cen brutto, zapasu, koszyka i płatnej dostawy pozostają.

429/429 testów mobile, 25/25 testów regresji Certusoft/AKS/g-k (w tym trzy nowe), 1064/1064 testów współdzielonego backendu, bez pominięć. Typecheck mobile, API i czystego checkout PASS; 66 legacy IDs zachowane. Pierwszy nowy test zawierał błędne założenie o polu `RetailObservation.packageSize` — poprawiono test do rzeczywistego kontraktu; typecheck i testy powtórzone. Pierwszy przebieg UI zatrzymał się na założeniu, że dwa produkty są zwinięte; aplikacja poprawnie pokazywała już rozwiniętą listę. Test uwzględnia oba stany; następny przebieg na nowym własnym profilu PASS. Nie zmieniano aplikacji, cen ani stawek dla tych błędnych założeń testów.

Odrzucone kandydatury: akustyczna HIPPER oznaczona Norgips / GTIN 5907810197997 odpowiada w PSB marce Sila; brak potwierdzenia Norgips. Ślizgowa HIPPER ma 50 mm / GTIN 5907651697434, podczas gdy aktualna karta producenta ma 48 mm i inny GTIN 5907651697083; stare katalogi z wyszukiwarki z 7434 obecnie zwracają 404. Nie powiązano ich automatycznie z wcześniejszymi referencjami. Dowody w `work/hipper-drywall-native-wave155.json` i pobranych kartach HTML; adresy kandydatów pozostają poza aktywnym katalogiem.

## Wdrożenie

App source `6b154ef8e61f55996d42653dc40cbfd8bddba82f`, czysty checkout. Backend: zmieniły się jedynie runtime i seed 313→315 obserwacji; pozostałe 148 z 150 plików żywego snapshotu są identyczne. Bundle SHA256 `9191c20bcc2da9006094336a6458dfda8077ba1ab67388229f446af1b3595fde`. Przed wdrożeniem ponowny snapshot potwierdził brak zmian live względem bazowego. PR [144](https://github.com/jakatora/przetargai/pull/144), commit `3e7e902f2832f1e0c7f2f95b3b4955cebe1c1002`, MERGED `1fd3ffd5e09dded7ea901b41293f6aa190b972e0`. Nie zmieniono innych modułów ani współdzielonego limitera.

Pakiet web: 63 zasoby / 17149624 B, 76 wartości vaulta bez wycieku. Backend deployment `129c6b97-94a9-4975-b51b-1c222bc3e733` SUCCESS (utworzone 2026-10-31T16:02:49.010Z). Snapshot wdrożenia ma wszystkie 150 plików zgodne z przygotowanym pakietem, seed 315 i powyższy SHA modułu. Web `f739fbdb-cd01-4c19-bbbd-b0c0d2d76a51` SUCCESS (utworzone 2026-10-31T16:04:46.130Z), source `6b154ef8e61f55996d42653dc40cbfd8bddba82f`.

Publiczny UI + publiczne API + natywne koszyki, bez przechwytywania sieci: 258,86 zł za cztery rolki i 447,86 zł po dodaniu przewodu, oba zdjęcia załadowane; po odświeżeniu trzy pozycje 31/154/25 m i kod 30-001 zachowane. PL, 390 px bez przepełnienia, crossOriginIsolated=true, 0 błędów strony, 0 odpowiedzi 429. Publiczny HTTP: 63 SHA zgodne, dziewięć tras 200, brakujące zasoby i pliki prywatne 404, niepodpisany relay POST 401, quoteRelayReady=true, missingAssetCount=0, COOP same-origin, COEP credentialless, Referrer-Policy no-referrer.

222 referencje i 222 wpisy zdjęć, 315 źródeł. Publiczny odczyt 2026-10-31T16:04:43.125Z: 280 aktywnych ofert dla 189 produktów; nadal 33 wcześniejsze referencje bez aktywnej oferty. Przygotowany pakiet z samym seedem miał 41 takich pozycji, bo osiem starszych obserwacji zdążyło wygasnąć; publiczny cache ma nowsze, potwierdzone odczyty. Nie przedłużano dat i nie nadpisywano cen, aby wyrównać liczniki.

Dowody poza repo: `work/joint-tape-products-wave155.json`, `joint-tape-observations-wave155.json`, `joint-tape-native-cart-wave155.json`, `joint-tape-wire-native-cart-wave155.json`, `joint-tapes-{local,production}-qa-wave155.json`, `joint-tapes-{local,production}-{two,basket,mobile}-wave155.png`, `certusoft-regression-wave155.log`, `mobile-tests-wave155.log`, `shared-tests-wave155.log`, `api-typecheck-wave155.log`, `typecheck-wave155.log`, `joint-tapes-preparation-wave155.json`, `web-release-integrity-wave155.json`, `web-production-http-wave155.json`, `catalog-summary-wave155-production.json`. Dalszy cel pozostaje ACTIVE.
