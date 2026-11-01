# Odświeżanie katalogu i zakup rury PEX na metry — wave181, 2026-11-01

Wdrożono jawne sprawdzenie oferty wybranego produktu w katalogu. Użytkownik może przywrócić aktualne potwierdzenie wygasłej oferty przed dodaniem do wspólnego koszyka. Wyszukiwanie i wpisywanie ilości nie kontaktują się ze sklepami. Błąd nie usuwa wyboru ani zapotrzebowania, a opóźniona odpowiedź nie potwierdza innego produktu wybranego w międzyczasie.

## Wersja i wdrożenia

- Kod aplikacji: a2023d0f7ccd5a4cb85f89816feb4b94794539de, wypchnięty na codex/remont-zakupy-20261024.
- [PR 164](https://github.com/jakatora/przetargai/pull/164), head 772cf81f71042f04caf1da7e2680eda6ecf4e605, merge 37b4c93b11d43c8322a2dc67f9af543b94a8e995.
- API: b3b9d0a6-0c37-4f29-aa94-3447a91426d2, SUCCESS 2026-11-01 21:53:53 UTC.
- WWW: bc88d8e2-2788-437b-8e70-cac3482bd288, SUCCESS 2026-11-01 21:55:48 UTC.
- [Publiczna aplikacja](https://asystent-remontu-web-production.up.railway.app).
- Końcowy odbiór: 2026-11-01T21:57:45.832Z, czyli 2026-11-01 22:57:45 CET. W tym momencie 87 sprawdzonych zwycięskich wycen i 12 potwierdzeń części zamówień zachowywało ważność. Nie przedłużano terminów ważności.

## Weryfikacja oferty w katalogu

POST /api/remont/pricing/catalog-availability/refresh przyjmuje wyłącznie dokładny EAN albo jeden ze zweryfikowanych identyfikatorów sklepowych, kategorię, rozmiar opakowania i jednostkę. Nie przyjmuje adresów URL, cen, danych klienta ani ilości. Nieznana referencja nie powoduje zapytań do sklepów. Cztery istniejące warianty bez GTIN mają jawne identyfikatory sklepowe; nie dopisano im sztucznych EAN.

Równoczesne sprawdzenia współdzielą jeden odczyt. Ponowienia tej samej oferty mają ograniczenie 60 sekund. Sprawdzane są źródła wybranego produktu; dostawa i zapas dla potrzebnej ilości pozostają zadaniem wyceny koszyka. Interfejs pokazuje tę różnicę. Starszy GET katalogu nie może nadpisać nowszego potwierdzenia. Odpowiedź 503 i opóźnienie w testach odporności to jawne wstrzyknięcia awarii przeglądarki; udane sprawdzenia produktów i transportu korzystały z rzeczywistych odpowiedzi sklepów.

## Rura PEX: opakowanie, jednostka i dostawa

Istniejąca referencja mat-pex-pipe-tycner-16x2, EAN 5901095517976, dotyczy zakupu na metry. [Karta Plus-Market](https://www.plus-market.pl/pl/p/Rura-pexalpex-16-mmx2-1mb/12990) podaje „Oferta dotyczy 1mb!”. [Natywny produkt](https://www.plus-market.pl/webapi/front/pl_PL/products/PLN/12990) ma id 12990, stockId 13709 i jednostkę mb oznaczoną floating_point=true. Ten znacznik powodował wcześniej odrzucanie odczytu przez ogólną kontrolę całych opakowań.

Zgoda na ten znacznik jest ograniczona do dokładnie zweryfikowanej oferty, jej modelu, kodu, opakowania, jednostki, adresu i danych sklepu. Nie rozluźniono kontroli innych ofert. Natywny producent widnieje jako PLUS-MARKET, natomiast opis oferty i źródło referencyjne identyfikują Tycner; GTIN i format oferty są jawnie sprawdzone. Zdjęcie w aplikacji wybiera istniejący, zweryfikowany resolver dla EAN. [Źródło referencyjne zdjęcia i produktu Tycner](https://mrowka.com.pl/produkt/rura-pex-al-pex-16-mmx2-200-mb-tycner-5901095517976.html) przedstawia zwój; oferta zakupu w Plus-Market dotyczy wybranej liczby metrów z tego rodzaju rury.

Obecne porównanie dobiera pełne metry, zachowując pierwotne zapotrzebowanie. Nie deklaruje obsługi dowolnych ułamkowych jednostek wszystkich sklepów. Rzeczywiste koszyki i publiczny przepływ aplikacji potwierdziły poniższe kwoty brutto przy płatności z góry w testach z 2026-11-01:

| Zapotrzebowanie | Zakup | Materiały | Dostawa | Razem |
| --- | --- | --- | --- | --- |
| 12,5 m | 13 × 1 mb | 51,87 zł | 20,00 zł | 71,87 zł |
| 20 m | Jedno zamówienie, 20 × 1 mb | 79,80 zł | 55,00 zł | 134,80 zł |
| 20 m | Dwa osobne zamówienia po 10 × 1 mb | 79,80 zł | 40,00 zł | 119,80 zł |

Oszczędność ostatniego wariantu to 15 zł i wymaga dwóch zamówień. Interfejs oraz kopiowany plan pokazują podział 10 + 10 i cenę wariantu z jednym zamówieniem. Użytkownik może wybrać jedno zamówienie; wybór przeżywa ponowne otwarcie. Kopia zapasowa zachowuje zapotrzebowanie 12,5 m, nie zamienia go na 13 m zakupu. Są to zweryfikowane stawki krajowe dla Polski z natywnego koszyka, nie indywidualna wycena pełnego adresu; aplikacja oznacza podstawę wyceny. Stawki i dostępność mogą się zmienić po czasie pomiaru.

## Katalog i zachowane dane

Na tym samym rzeczywistym cache produkcyjnym, bez zmiany dat istniejących obserwacji i bez wstrzykiwania wycen dostawy:

| Stan | Referencje | Z potwierdzoną ofertą | Oferty | Bez potwierdzenia |
| --- | --- | --- | --- | --- |
| Wave180 | 240 | 207 | 307 | 33 |
| Wave181 | 240 | 208 | 308 | 32 |

Przywrócono jedną istniejącą ofertę PEX. Nie dodano nowej referencji katalogowej. Audyt publiczny: 240 referencji, 227 wierszy informacji o ofertach, cztery warianty identyfikowane przez SKU, zero pominiętych i fałszywych potwierdzeń. Potwierdzenie produktu nie oznacza potwierdzenia dostawy każdego możliwego koszyka.

Snapshot API: 150 plików, 148 zachowanych, zmienione wyłącznie moduł Remont i seed. Seed nadal liczy 347 obserwacji; wymieniono tylko rzeczywisty odczyt PEX, a pozostałe 346 zachowano. SHA-256 modułu: 01ca05e06483395aa26debea8ace14bdb2de5f12a5cdf406ef8c152dfd8bd695. Preflight i snapshot po wdrożeniu porównano bajt po bajcie. Osiem wspólnych plików hostingu i konfiguracji WWW pozostało identycznych; zmienił się prywatny bundle dostaw. Nie zmieniano migracji 001–014, identyfikatorów prac i obmiarów, zależności ani cudzych zmian roboczych.

## Dowody i testy

- Mobile 540, pricing 210, biblioteki API 125, adaptery 156, wspólny backend 1064: PASS, zero skipów. Zestawy częściowo się pokrywają; nie sumować ich jako odrębnych testów. Typy API/mobile, kompilacja pricing i 66 wpisów legacy PASS. Dwa źródłowe URL-e PEX zweryfikowane skryptem validate-sources.sh: HTTP 200, zero ostrzeżeń.
- 18 lokalnych i 18 publicznych scenariuszy natywnych koszyków; dodatkowo po trzy sprawdzenia ponownego użycia krajowej wyceny Elmas. Lokalnie pierwsze porównanie wykonało osiem żądań sklepu, dwa kolejne poprawne kody pocztowe po zero; zachowano te same dowody i terminy ważności. Publicznego licznika wewnętrznych HTTP nie mierzono i zapisano null.
- 45 lokalnych i 38 publicznych scenariuszy przeglądarkowych. Różnica to siedem lokalnych prób odzyskiwania wygasłej oferty ze stanem rzeczywiście zachowanym z wcześniejszej produkcji. Produkcyjnych dat nie cofano na potrzeby testu. Przeszły wyszukiwanie, rzeczywiste zdjęcie, odświeżanie, błąd, późna odpowiedź po zmianie produktu, pełne opakowania, osobne zamówienia, kopia, ponowne otwarcie i szerokości 320/390 px. Obejrzano renderowane zrzuty wybranego produktu oraz publicznego planu przy 320 px.
- Odrębna zamknięta instancja kandydata: 610 żądań do sklepów w całej sesji, zero 429 i zero /order/new. Wcześniejszy odrębny test odzyskania PEX liczył 52 żądania. Nie składano zamówień ani płatności.
- WWW: 63 pliki, 17 274 852 bajty, zgodne SHA lokalnie/publicznie; zero wykrytych wartości spośród 77 sprawdzanych sekretów. PL, WASM i nagłówki izolacji zachowane. Dziewięć tras 200, pięć kontroli 404, prywatny endpoint bez autoryzacji 401.
- Główne artefakty: G:/Projekty/asystent-remontu-work/wave181-20261101/verification-summary.json, validation.json, deployed-verification.json, production-pex-native.json, production-pex-qa.json, production-refresh-resilience.json i catalog-identity-production-audit-wave181.json. Procesy QA zakończyły pracę; własna lokalna instancja PID 56232 została zamknięta po odbiorze.

## Dalsze prace

Pozostają 32 pozycje bez potwierdzonej oferty, ograniczenia rzeczywistej wyceny niektórych sklepów, w tym Castoramy/OBI, oraz szybkość pierwszej wyceny dużego remontu. Ta fala nie dodaje im fikcyjnych cen ani zerowego transportu. W porównaniu 14 pozycji publiczna pierwsza odpowiedź trwała 35 883 ms; lokalna przy uprzednio rozgrzanym Elmas 38 295 ms i 441 żądań sklepów. To pojedyncze pomiary, nie p95 ani dowód gotowości na duży ruch. Rozwijanie współdzielenia ważnych odpowiedzi, ograniczanie powtórzeń i stabilne źródła partnerów pozostają potrzebne.

Nie uruchamiano ponownie szerokiej suity API z wcześniejszymi 28 błędami bazowymi. Nie uruchomiono płatności, afiliacji, analityki klienta, kontaktów z osobami trzecimi ani harmonogramów. Cel ciągłego rozwoju pozostaje aktywny; ukończono i zweryfikowano tę partię.
