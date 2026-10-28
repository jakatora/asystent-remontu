# Tynkowanie, wspólny koszyk i zapis projektu — 28.10.2026

Poprawiono kalkulator tynkowania oraz dodano dwie dokładne oferty i zdjęcia. Dotychczasowy przepis łączył grunt sprzedawany w kilogramach z zapotrzebowaniem w litrach, nie rozróżniał zużycia wybranego tynku i zakładał siatkę na całej ścianie. Długość narożników wynikała z przybliżonego obwodu, zamiast z planu docinek.

## Dobór materiałów

Użytkownik wybiera konkretny tynk, planowane wykończenie, sposób przygotowania podłoża, obszar zbrojenia oraz liczbę listew narożnikowych 2,5 m. Poziom ceny nie zmienia wybranego systemu. Brakujące dane pozostają widoczne; zero oznacza świadomy brak zakupu danej pozycji. Zmiana tynku usuwa poprzedni dobór gruntu, siatki i potwierdzenie narożników. Istniejące ID prac i pól pomiarowych pozostają zachowane, dodano nowe pola. Tablica materiałów nadal składa się wyłącznie z formatu legacy.

[Knauf MP 75](https://knauf.com/pl-PL/p/produkt/knauf-mp-75-10256_0120) liczy się według 10 kg/m² przy 10 mm, a [Goldband](https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120) według 8,5 kg. [Baumit MPI 25](https://baumit.pl/files/pl/pdf_files/pds_mpi_25_bpl_pl_13202.pdf) ma zużycie 14 kg i zakres ścienny 10–25 mm. W obecnym formularzu zakres gipsowego tynku ograniczono do 8–30 mm; pod płytki minimum 10 mm, przy zbrojeniu Knauf minimum 15 mm. Pod płytki instrukcja nie zaleca wygładzania ani zacierania gipsu. Zapas tynku i gruntu jest osobnym założeniem zakupowym, domyślnie 10%.

Nowe pozycje:

- [Knauf Betokontakt 5 kg w Realbud](https://realbud.com/pl/p/Srodek-gruntujacy-KNAUF-Betokontakt-5-kg%2C-grunt-do-powierzchni-betonowych/74052350), EAN **4006379051014**, SKU 9341, **66,79 zł za całe wiadro**. [Producent](https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120) wiąże go z niechłonnym betonem i tynkami gipsowymi Knauf; około 0,225 kg/m². Nie przypisujemy go automatycznie do chłonnego muru ani do Baumit.
- [Knauf Profix 100 cm × 50 m w Realbud](https://realbud.com/pl/p/Siatka-tynkarska-Knauf-PROFIX-szer.-1000-mm-oczko-10x10-mm-50-mb/75057500), EAN **5902367201067**, SKU 11723, **227,00 zł za rolkę 50 m²**. [Aktualna karta producenta](https://knauf.com/pl-PL/p/produkt/knauf-profix-10681_0120) dotyczy tynków gipsowych wewnątrz. Zakupowe 1,1 m² na m² zbrojenia obejmuje zakłady; nie dodajemy ponownie zapasu tynku. Wybrany obszar nie jest automatycznie równy całej ścianie. Inne szerokości rolek i opakowania pozostają odrębne.

Obie tożsamości, ceny brutto i jednostki zakupu sprawdzono na rzeczywistych kartach i w publicznym API sklepu. Zdjęcie Betokontakt pochodzi ze sklepu; grafikę zastępczą Profix zastąpiono zdjęciem serii ze strony producenta. Dokładny wariant 1000 mm × 50 m potwierdza tabela EAN producenta. Anonimowy koszyk potwierdził **293,79 zł + 25 zł kuriera = 318,79 zł**. To bieżąca taryfa dla Polski, bez deklarowania indywidualnej wyceny adresowej. Zerowy „transport na zapytanie” nie jest darmową dostawą. Nie składano zamówienia ani danych klienta. Odbiór w placówce wymaga potwierdzenia.

## Wspólne zakupy i produkcyjne HTTP

Osiem rzeczywistych przypadków na wdrożonym API potwierdziło m.in. cały wybrany zestaw trzech zakupów materiałowych, dwa pomieszczenia, częściowy koszyk jednego sklepu oraz odrzucenie niepotwierdzonego odbioru i nieprawidłowych parametrów. Dla 10 m², 15 mm Goldband i 10% zapasu potrzeba 140,25 kg, czyli 6 worków po 25 kg. Grunt: 2,475 kg; przy 2 m² zbrojenia siatka: 2,2 m². W próbce świadomie podano zero zakupu narożników.

Dwa pokoje po 10 m² z obszarami zbrojenia 2 i 3 m² potrzebują wspólnie **4,95 kg gruntu i 5,5 m² siatki**. Wystarcza jedno wiadro i jedna rolka. Wskazany podzbiór nadal kosztuje 318,79 zł z jedną potwierdzoną dostawą. Nie jest on całym koszykiem tynkowania: pozostaje zakup tynku Goldband w Krasny.

Pełny próbny zestaw jednego pokoju ma 3/3 zakupy materiałowe z ofertami, łącznie **593,13 zł materiałów**. Dostawa tynku z Krasny nie ma potwierdzonej wyceny, więc pełna suma z dostawą pozostaje nieznana. Dla obu pokoi łączne materiały wynoszą **892,47 zł**, zamiast 1186,26 zł przy osobnym zakupie opakowań; różnica 293,79 zł wynika z połączenia gruntu i siatki. Narzędzia i robocizna są osobno.

## Naprawa rzeczywistego problemu zapisu

Pierwsze utworzenie projektu pokazało błąd czasu oczekiwania, mimo że w bazie istniał już nowy projekt. Nie powtórzono tworzenia; sprawdzono rzeczywistą listę i liczbę projektów. Dalsza kontrola wykazała przyczynę: zainstalowany expo-sqlite 16.0.10 zwraca z `runAsync` generator asynchroniczny z metodami instrukcji. Taki obiekt nie przechodzi przez `BroadcastChannel` i zgłasza `DataCloneError` po wykonaniu SQL. Odtworzenie na prawdziwym SQLite potwierdziło jedną zapisaną pozycję i jedną próbę mutacji.

Połączenie zwraca teraz tylko udokumentowane `changes` i `lastInsertRowId`. Nie ponawia SQL. Test przez rzeczywistą granicę `structuredClone`, z duplikacją komunikatu, potwierdza jedną mutację. Dotychczasowe testy przekazywały już komunikaty przez `structuredClone`, lecz ich adapter zwracał prosty obiekt, zamiast rzeczywistego kształtu Expo.

Karta deweloperska z zachowanym starym koordynatorem otrzymuje jednorazowe przeładowanie po rozpoznaniu niezgodnego formatu wyniku. Nie otwieramy drugiego workera na zajętym OPFS. Nie zmieniono kanału, blokady, układu VFS ani migracji bazy. Zwykły nowy start nie wymaga takiego przeładowania. Serwera podglądu nie restartowano.

Tworzenie projektu otrzymało także odczyt potwierdzający z identyfikatorem znanym przed zapisem. Niepowodzenie opcjonalnego dziennika nie zamienia potwierdzonego zapisu w błąd. Kreator blokuje jednoczesne kliknięcia i pokazuje błąd w formularzu; przy niepewnym zapisie kieruje do sprawdzenia projektów, a przy potwierdzonym projekcie i niepełnej liście zakupów pozwala otworzyć ten projekt.

## Weryfikacja i zakres

715 testów kalkulatora/koszyka/API, osobno 14 testów SQLite i współdzielonego połączenia oraz 1054 testy backendu: PASS, bez pominiętych testów. Runner core nie obejmuje storage i celowo wyklucza dwa samodzielne testy seedowania DB. TypeScript aplikacji i API: PASS. Walidacja 13 nowych adresów: 0 błędów, 8 ostrzeżeń antybotowych; źródła producenta odczytano narzędziem WWW, a zakupowe dane sklepu potwierdzono natywnie i w API. Kontrola ID oraz negatywne próby usunięcia ID, eksportu i rejestru: PASS.

Backend: [PR71](https://github.com/jakatora/przetargai/pull/71), merge `d0f0b27f8fff9f678e335998b2ad692e13434f51`. Railway `48ba6a6b-cfc3-47e3-be5c-cfaab0eb987c`, SUCCESS. Wszystkie 148 plików produkcyjnych zgodne z wydaniem; 146 pozostałych plików i wszystkie 211 wcześniejszych obserwacji zachowane. Dodano dwie obserwacje, łącznie 213. Brak uruchomień GitHub Actions nie jest zielonym CI. Poprawki formularza i bazy są zmianami aplikacji, poza pakietem backendu.

Katalog: **169 referencji, 162 produkty z aktywną ofertą, 207 ofert i 48 aktywnych sklepów/kanałów**. Zdjęcia: 170 wpisów dla 169 referencji. Siedem dawnych referencji nadal nie ma aktywnej dokładnej oferty. Te same 65 map obmiarów daje teraz 84/251 wycenionych wymagań, 167 niewycenionych: 94 bez zapytania, 72 bez produktu i 1 bez oferty; 11 kompletnych scenariuszy materiałowych. Dodatkowe niepotwierdzone narożniki i unieważnienie starego automatycznego doboru tynku są jawne. Zmiana mianownika nie oznacza dodania tylu unikalnych produktów ani procentu ukończenia aplikacji.

Rzeczywisty UI potwierdził wygenerowanie 10 pozycji zakupowych pierwszego projektu po naprawie w około 702 ms oraz utworzenie drugiego projektu z listą w około 538 ms. Dodano dwa własne projekty QA; liczba projektów wzrosła z 23 do 25, bez edycji wcześniejszych 23. Wspólny koszyk zachował dwa projekty i kod 00-001 po przeładowaniu. Pokazał 892,47 zł materiałów, jedną z dwóch dostaw za 25 zł, brak stawki Krasnego i 293,79 zł oszczędności ze wspólnych opakowań. Etykiety oszczędności nie sugerują różnych wielkości opakowań. Trzy zdjęcia rzeczywiście się załadowały, w tym zdjęcie Profix producenta (400 × 400) zamiast grafiki zastępczej. Zrzut: `work/catalog-wave71-koszyk.jpg` (JPEG 1280 × 720), karta browser2/tab6 pozostawiona na wspólnym koszyku. To potwierdzenie tych ścieżek; nie deklaracja naprawy każdego możliwego problemu bazy.

Cel pozostaje aktywny. Do wykonania pozostają dalsze wymagania receptur, brakujące dokładne produkty lub jawnie wybrani następcy, kompletne wyceny dostawy oraz ceny i zapasy konkretnych pobliskich placówek.
