# Ramki Asfora — wspólny koszyk różnych układów

Stan sprawdzenia: 2026-10-29. Zachowano job socket-frame-replace, input frameCount i materiał socket-frames. Poprzedni wzór faucets liczył według baterii; nowy model asfora-white-frames-v1 liczy całe ramki. Dodano dwa materiały legacy socket-frames-double i socket-frames-triple bez mieszania formatów materiałów.

frameCount pozostaje ŁĄCZNĄ liczbą ramek. Użytkownik potwierdza zgodną serię Asfora i białe ramki oraz wybiera same pojedyncze albo policzone różne rodzaje. Dla mieszanego układu pojedyncze = łącznie − podwójne − potrójne. Podwójna lub potrójna nadal jest jedną kupowaną sztuką. Nie doliczamy zapasu. Ujemne reszty, ułamkowe liczby, niewypełniony podział lub niepotwierdzona seria nie dają pełnej wyceny. Układ pionowy, inne serie i kolory wymagają osobnego doboru; model nie zamienia ich na tańsze.

## Dokładne produkty i zdjęcia

| Ramka biała Asfora | Kod producenta | EAN | Cena brutto za całą ramkę |
| --- | --- | --- | ---: |
| Pojedyncza | EPH5800121 | 3606480527166 | 3,50 zł |
| Podwójna pozioma | EPH5800221 | 3606480527180 | 6,40 zł |
| Potrójna pozioma | EPH5800321 | 3606480527203 | 9,60 zł |

To same ramki bez mechanizmów. Producent rozróżnia opakowanie jednostkowe PCE=1 i opakowania zbiorcze; native Shoper sprzedał wyraźnie sztuki, nie obowiązkowy karton 15/25/30 sztuk. Każda ramka ma odrębne zdjęcie, EAN i wymaganie. Z prądem: publiczne karty i API potwierdziły can_buy=true, producenta, kod, cenę brutto i jednostkę szt. floating_point=false; koszyk potwierdził rzeczywiste ilości i sumy. Aktualny zapas liczbowy nie był publikowany; nie podajemy zmyślonej liczby.

- [Z prądem: ASFORA Ramka pojedyncza biała EPH5800121](https://zpradem.pl/asfora-ramka-pojedyncza-biala-eph5800121/788683); [Schneider: 1-krotna](https://www.se.com/pl/pl/product/EPH5800121/asfora-ramka-1krotna-pozioma-bia%C5%82y/).
- [Z prądem: ASFORA Ramka podwójna pozioma biała EPH5800221](https://zpradem.pl/asfora-ramka-podwojna-pozioma-biala-eph5800221/799939); [Schneider: 2-krotna](https://www.se.com/pl/pl/product/EPH5800221/asfora-ramka-2krotna-pozioma-bia%C5%82y/).
- [Z prądem: ASFORA Ramka potrójna pozioma biała EPH5800321](https://zpradem.pl/asfora-ramka-potrojna-pozioma-biala-eph5800321/815336); [Schneider: 3-krotna](https://www.se.com/pl/pl/product/EPH5800321/asfora-ramka-3krotna-pozioma-bia%C5%82y/).

Dokumenty oryginalne producenta udostępnione w sklepie:
- [EPH5800121, karta danych](https://sklep.elektrospark.pl/upload/m/download/17948482/eph5800121-document.pdf).
- [EPH5800221, karta danych](https://sklep.elektrospark.pl/upload/m/download/17946873/eph5800221-document.pdf).
- [EPH5800321, karta danych](https://sklep.elektrospark.pl/upload/m/download/17946879/eph5800321-document.pdf).

Trzy bieżące strony Schneider odczytano przez narzędzie przeglądania. Automatyczny skrypt URL otrzymuje od se.com ochronę antybotową 403 (OK z trzema ostrzeżeniami); nie deklarujemy HTTP200 dla tych trzech URL-i ani nie obchodzimy blokady. API i zdjęcia sklepu były dostępne. Tańsza ramka w Elektro-Hurt (EPH5800121, 1,82 zł) miała can_buy=false i „tymczasowo niedostępny”, więc nie została aktywowana. Prescot nie zwrócił tych ramek. Próba szerszego wyszukania Elektro-Hurt przekroczyła istniejący limit rozmiaru odpowiedzi; limitu nie zwiększano.

## Dostawa i wspólne zakupy

Sześć prawdziwych anonimowych koszyków Shoper potwierdziło kuriera domowego „Paczka kurier — przedpłata (wysyłka 24h)” i płatność Przelewy24.pl, 27,00 zł za CAŁE zamówienie. To national basket PL, a nie stawka ustalona indywidualnie dla kodu. API wymaga poprawnego formatu kodu użytkownika, a UI pokazuje krajową podstawę wyceny. Nie używamy kwoty z reklamy „dostawa od”, paczkomatu, pobrania ani zera odbioru. Nie przesłano danych klienta i nie złożono zamówienia. Odbiór osobisty pozostaje do potwierdzenia.

| Zestaw | Materiały | Dostawa | Łącznie |
| --- | ---: | ---: | ---: |
| 1 pojedyncza | 3,50 zł | 27,00 zł | 30,50 zł |
| 5 pojedynczych | 17,50 zł | 27,00 zł | 44,50 zł |
| 7 pojedynczych + 2 podwójne + 1 potrójna | 46,90 zł | 27,00 zł | 73,90 zł |
| 3 podwójne + 2 potrójne | 38,40 zł | 27,00 zł | 65,40 zł |
| Dwa pokoje po 7 + 2 + 1 | 93,80 zł | 27,00 zł | 120,80 zł |

Dwa osobne zamówienia po 73,90 zł = 147,80 zł. Łączny zakup identycznych wariantów oszczędza jedną dostawę 27,00 zł. Posiadane 7 pojedynczych usuwa tylko właściwą pozycję, nie inne rodzaje; do kupienia zostaje 22,40 zł + 27,00 zł = 49,40 zł. Zmiana modelu, nieznany układ, brak pomiaru i zwiększona ilość nie mogą być ukryte przez historyczne Mam/Kupione.

16 produkcyjnych scenariuszy prawdziwego SDK, 10 pełnych wycen. Potwierdzono 73,90 zł za zestaw, 120,80 zł za dwa pomieszczenia, inny kod 42-209, wybrany sklep Z prądem, Mam, 56,40 zł po zmianie łącznej liczby na 5 (2 pojedyncze, 2 podwójne, 1 potrójna). Wybrany sklep bez produktów, nieznana seria, nieznany podział, niemożliwe ilości i brak kodu nie dają pełnego wyniku.

Cały wariant remontu: fronty 10 m², V33 biały satyna z automatycznym doborem puszek, 4 arkusze P240, Chem-Rozlew 500 ml, 4 czarne uchwyty NYXA i 10 powyższych ramek. 289,00 zł materiałów + 66,35 zł dostaw = 355,35 zł. Odpowiedni detergent jest jawnie posiadany, pasowanie śrub i ramek potwierdzone. Robocizna i narzędzia są poza wyceną.

## Sprawdzenie

867 testów rdzenia i 1054 współdzielonego backendu: PASS, 0 błędów, 0 pominięć; mobile i API typecheck PASS. 66 identyfikatorów prac bez zmian. Bieżący katalog: 184 referencje i zdjęcia, 177 produktów z aktywną ofertą, 226 ofert, 232 obserwacje źródłowe, 50 aktywnych kanałów sklepów. Nadal 7 starszych dokładnych referencji nie ma aktywnej oferty. Stare 65 map obmiarów: 81/254 wycenione, 173 nieuzgodnione (103 no-query, 69 no-product, 1 no-offer), 11 scenariuszy z pełnymi cenami materiałów. Dwa nowe wymagania to odrębne układy ramki; nie przypisujemy ich starym projektom bez potwierdzenia. Liczba niewycenionych pozycji nie oznacza liczby unikalnych brakujących produktów.

PR87 https://github.com/jakatora/przetargai/pull/87 merged, Railway5911a959-2cf4-4ce1-9b32-1fb9b757b092 SUCCESS. Po wdrożeniu wszystkie 148 plików zgadzały się z wydaniem; zachowano 229 wcześniejszych obserwacji i 146 pozostałych plików produkcyjnych. Cel rozwoju aplikacji nadal aktywny.

## Odbiór interfejsu

Własny projekt proj_mvt4yswhz5dbe1exe utworzono przez kreator: 10 całych ramek, potwierdzona seria, mieszany układ, w tym 2 podwójne i 1 potrójna. Widok Gdzie najtaniej pokazał 7 + 2 + 1, trzy zdjęcia, 46,90 zł materiałów + 27,00 zł kuriera = 73,90 zł. Kod 00-001.

Edytor odrzucił łączną liczbę 2 przy 2 podwójnych i 1 potrójnej, pozostawiając formularz z konkretnym komunikatem o przekroczonej sumie. Po poprawieniu liczby na 5 i nazwy projektu zapisano 2 pojedyncze + 2 podwójne + 1 potrójną: 29,40 zł + 27,00 zł = 56,40 zł. Podczas przeliczenia starej kwoty nie pozostawiono jako aktualnej. Przeładowanie, otwarcie porównania i rozwinięcie produktów potwierdziły ten sam zestaw, kod i kwotę 56,40 zł.

Dowody work/catalog-wave88-ten.jpg i -five.jpg oraz AX -ten-ui, -invalid-split-ui, -five-saved-ui, -five-reloaded-ui, -five-expanded-ui. AX potwierdził wszystkie trzy zdjęcia; zwykły zrzut widoku 1280×720 obejmuje górną część listy produktów. Nie zmieniano rozmiaru widoku tylko dla zdjęcia. Odbiór dotyczy Expo Web, nie fizycznego telefonu. Nie zmieniano innych projektów ani globalnego wyboru prac do koszyka.

Ścieżka pieniędzy: rzeczywiste ceny brutto i krajowy kurier z kompletnego natywnego koszyka; sumy całkowitych groszy i dokładne całe sztuki. Mam/Kupione jest ograniczone do projektu, układu i wystarczającej liczby. Weryfikacja obejmuje native HTTP, produkcyjny SDK i interfejs; nie opiera się wyłącznie na zielonych testach. Backend nie potwierdził dostawy dla konkretnego kodu — potwierdził krajowy koszyk PL, a UI ujawnia tę podstawę.
