# Konkretne ceny i zmiany ceny wybranego produktu — wave182, 2026-11-01

Po kliknięciu „Sprawdź aktualną cenę produktu” użytkownik widzi teraz kwotę brutto za dokładnie wybrane opakowanie, sklep, datę odczytu oraz porównanie z poprzednim zapisanym odczytem tej samej oferty. Wcześniejsza wersja pokazywała jedynie liczbę potwierdzonych ofert. Koszt transportu pozostaje częścią wyceny całego remontu i jest jawnie wyłączony z ceny w katalogu.

## Publikacja i dowód

- Runtime aplikacji: 61af6fb8a4ff0e0be95f76400f7b79b465865cf4, wypchnięty na codex/remont-zakupy-20261024.
- [PR 165](https://github.com/jakatora/przetargai/pull/165), head 6aa84858dbbc779a03ed6fe5eb2ba4b08e05b036, merge c0001e301a6bf2937f860a6d19158629069af29f.
- API 7d4f04a9-fcc9-443b-a3c9-88a71550ee36: SUCCESS 2026-11-01 22:18:02 UTC.
- WWW c2eccc6f-efb3-416f-9e6c-7edbdaab3374: SUCCESS 2026-11-01 22:21:09 UTC.
- [Publiczna aplikacja](https://asystent-remontu-web-production.up.railway.app).
- Końcowy odbiór: 2026-11-01T22:24:17.751Z (2026-11-01 23:24:17 CET). W tym momencie 87 sprawdzonych zwycięskich wycen i 12 potwierdzeń części zamówień zachowywało ważność. Nie zmieniano ich terminów.

## Zachowanie aplikacji

Najpierw widać jedną potwierdzoną cenę wybranego opakowania. Pozostałe ceny można rozwinąć i zwinąć. Backend porządkuje wyniki rosnąco według ceny tego samego opakowania; taki porządek nie jest rankingiem kosztu zakupów z dostawą. Wpisana ilość nie zmienia się podczas odczytu, rozwijania listy, błędu ani późnej odpowiedzi dotyczącej poprzednio wybranego produktu. Pokazano daty bieżącego i poprzedniego odczytu w czasie Warszawy.

Zmiana dotyczy poprzedniego zapisanego odczytu w tym samym sklepie, z tej samej serii historii; nie jest deklaracją rabatu ani automatycznie osobistą ostatnio widzianą ceną użytkownika. Istniejące porównanie cen koszyka z jego zapisanym stanem pozostaje bez zmian. Brak wcześniejszego odczytu daje brak porównania, a nie zerową cenę lub wymyśloną oszczędność. Gdy różnica wynosi zero, komunikat mówi o braku zmiany. Wzrost i spadek mają tekstową informację z kwotą oraz właściwą jednostką.

Odpowiedź POST /api/remont/pricing/catalog-availability/refresh otrzymała opcjonalne offers. Starsze odpowiedzi bez tego pola i wcześniejsi klienci pozostają obsługiwani. Cena pochodzi tylko ze źródła, którego odczyt został potwierdzony i którego oferta jest nadal dopuszczona do porównania. Nieudana lub wycofana oferta nie dostaje nowej ceny.

Każdy wynik ma identyfikator oferty, sklep, źródłowy URL, PLN, rozmiar opakowania, jednostkę, całkowite grosze, czas odczytu i ewentualny poprzedni odczyt oraz różnicę. Walidator sprawdza zgodność identyfikatora z potwierdzonym źródłem, dokładne opakowanie i jednostkę, dodatnie całkowite kwoty, kolejność dat i zgodność różnicy z obiema cenami. Korzystamy z istniejącej historii, której fingerprint uwzględnia sklep, URL, wariant, format sprzedaży i fizyczne opakowanie. Nie dopisano cen ani historii demonstracyjnej do produkcji.

## Rzeczywiste odczyty

Publiczny endpoint potwierdził 3,99 zł za 1 mb rury PEX, EAN 5901095517976, i 32 zł za pełną rolkę Norgips 75 mm × 30 m, EAN 5907651698011. Odczyty PEX i Norgips miały różnicę 0 gr względem poprzednich zapisanych punktów. Dla wybranej taśmy Blue Dolphin 50 mb, EAN 5907758515952, otrzymano poniższe ceny brutto bez transportu:

| Sklep i źródło | Cena | Zakres ceny |
| --- | --- | --- |
| [Buduj24](https://buduj24.pl/produkt/10647,blue-dolphin-tasma-malarska-30mm-x-50m-niebieska-maskujaca-do-odcinania-1-sztuka) | 11,35 zł | 50 mb |
| [Rab-Dom](https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-30mm-x-50m-niebieska/2526) | 11,99 zł | 50 mb |
| [Sewera](https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966) | 14,72 zł | 50 mb |
| [Lobo](https://lobo.pl/blue-dolphin-tasma-papierowa-niebieska-30mm-x-50m) | 15,99 zł | 50 mb |

To ceny z zapisanego sprawdzenia z 2026-11-01, nie gwarancja przyszłej ceny ani najtańszego transportu. Odpowiednie daty i pola są w production-catalog-prices-native.json. Koszyk nadal wybiera pełne opakowania i potwierdza dostawy: zapotrzebowanie 12,5 m PEX daje zakup 13 m za 71,87 zł z kurierem; 20 m kosztowało 134,80 zł w jednym zamówieniu albo 119,80 zł w dwóch zamówieniach po 10 m. Podział i wybór jednego zamówienia pozostają jawne.

## Zakres testów

- Czyste źródło: mobile 540, pricing 212, biblioteki API 127, adaptery 158, wspólny backend 1064 PASS, zero skipów. Zestawy częściowo się pokrywają. Typy API/mobile, kompilacja pricing i 66 wpisów legacy PASS.
- Po 21 lokalnych i publicznych scenariuszy rzeczywistych cen oraz koszyków; dodatkowo po trzy przypadki ponownego użycia krajowego potwierdzenia Elmas. Lokalnie pierwsze porównanie wykonało osiem żądań, dwa następne poprawne kody pocztowe po zero, z niezmienionymi dowodami i terminami. Publicznego wewnętrznego licznika HTTP nie mierzono.
- Po 48 lokalnych i publicznych scenariuszy przeglądarkowych. Nowy zestaw liczy 10: pięć rzeczywistych przypadków cen/układu oraz pięć jawnie kontrolowanych odpowiedzi (wzrost, spadek, brak historii, odpowiedź starego API i niezgodne opakowanie). Kontrolowane przypadki służą sprawdzeniu prezentacji i odrzucania błędnych danych; nie są dowodem rzeczywistej zmiany ceny w sklepie. Nie zapisują symulowanych cen na serwerze.
- Rzeczywisty widok pokazuje 3,99 zł / 1 mb i 32 zł / 30 m, listę czterech sklepów, daty oraz zachowane ilości. Rozwijanie i zwijanie działa. Obejrzano zrzuty lokalne i publiczne przy 320/390 px. Dalsze regresje obejmują koszyk całego remontu, zapas opakowań, osobne zamówienia, kopię, ponowne otwarcie, błąd 503 i późną odpowiedź po zmianie produktu.
- Jeden zamknięty kandydat: 619 żądań sklepów, zero 429 i zero /order/new. PID 36192 i session 23637 zakończone poprawnie. Wcześniejszy osobny rzeczywisty odczyt ceny PEX wykonał jeden GET produktu bez zapytania o dostawę. Nie składano zamówień, nie płacono i nie kontaktowano osób trzecich.
- WWW 63 pliki / 17 279 263 bajty, SHA zgodne publicznie, zero znalezionych wartości spośród 77 sprawdzonych sekretów. Dziewięć tras 200, pięć kontroli 404, prywatny POST bez autoryzacji 401; PL, WASM i nagłówki izolacji zachowane.

Jedno narzędzie QA początkowo wymagało, by zegar źródła nigdy nie wyprzedzał zegara komputera testowego. Rzeczywista odpowiedź Sewery pokazała niewielką różnicę zegarów. Zapisano public-price-clock-investigation.json, po czym sprawdzenie oparto na czasie wygenerowania odpowiedzi serwera i istniejącym limicie 60 sekund przesunięcia używanym przez kontrakt. Nie zmieniono dat obserwacji ani ważności wycen. Powtórzono wyłącznie te trzy przypadki cen; wcześniejsze udane sprawdzenia koszyków zachowano. Interfejs opublikowano po pomyślnym powtórzeniu.

## Zachowane dane i dalsza praca

API snapshot ma 150 plików. Zmieniono tylko moduł Remont, zachowano 149 pozostałych plików i wszystkie 347 obserwacji seedu bez zmian. SHA modułu f8d98bf0c1a8e3f8e4ed5b4f4371c7a5b01387a3bcbe7625965f0ee21f28a74b. Snapshot po wdrożeniu jest identyczny z przygotowanym. Wszystkie dziewięć wspólnych plików hostingu i konfiguracji WWW, także prywatny relay dostaw, jest identycznych z wave181. Nie zmieniono migracji, identyfikatorów prac i obmiarów ani zależności. Cudze zmiany robocze pozostają poza commitami.

Katalog pozostaje przy 240 referencjach, 208 z potwierdzonymi ofertami, 308 ofertach i 32 brakach. Audyt 227 wierszy i czterech identyfikatorów SKU nie wykazał pominiętych ani fałszywych potwierdzeń. Sprawdzona rzeczywistym HTTP 200 taśma Norgips 30 mm × 30 m w Adamex, EAN 5907651698851, nadal ma stan zero i oznaczenie „Produkt na zamówienie”; nie dodano jej do dostępnych zakupów.

Pozostają braki katalogu, pełne źródła dostaw Castoramy/OBI i czas pierwszej dużej wyceny. Pierwszy publiczny scenariusz 14 pozycji trwał 34 452 ms; lokalny 35 298 ms i 441 HTTP przy uprzednio sprawdzonym Elmas. To pojedyncze pomiary, nie p95 ani dowód obsługi dużego ruchu. Można dalej usprawnić porównanie ceny względem ostatniego sprawdzenia konkretnego użytkownika w katalogu, odrębnie od globalnej historii sklepu. Nie uruchamiano ponownie szerokiej suity API z wcześniejszymi 28 błędami bazowymi, analityki klienta, afiliacji ani płatności.

Artefakty: G:/Projekty/asystent-remontu-work/wave182-20261101/verification-summary.json, validation.json, production-catalog-prices-native.json, production-catalog-prices-qa.json, deployed-verification.json oraz catalogue-research.json. Ukończono i odebrano tę partię. Cel ciągłego rozwoju pozostaje aktywny.
