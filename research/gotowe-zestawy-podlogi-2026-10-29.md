# Gotowe zestawy podłogi: pełna cena przed wyborem

29 października 2026, wave81. Poprawiono pierwsze korzystanie z wyceny podłogi. Użytkownik widzi dwa sprawdzone zestawy ze zdjęciami i ceną materiałów oraz dostaw, zanim wybierze płytki i klej. Katalog i backend pozostają w wersji wave80; ten etap nie dodaje produktów, ofert ani nowych taryf.

## Przebieg użytkownika

Na początku zakładki „Gdzie najtaniej” projektu płytek podłogowych pojawia się „Porównaj gotowe zestawy płytek”. Użytkownik otwiera porównanie, wpisuje swój kod i otrzymuje osobno wycenione alternatywy Ennis Light Grey oraz Light Beige ze standardowym ATLAS PLUS 25 kg. Pozostałe materiały wynikają z obmiarów i listy zakupów; pozycje „Mam” i „Kupione” są oceniane względem wybranego produktu.

Każda karta pokazuje rzeczywiste zdjęcie, pełną cenę brutto, materiały, dostawy, sklepy i wymaganą liczbę osobnych zamówień. Kliknięcie „Wybieram ten zestaw” zapisuje obie tożsamości w jednym rekordzie wyboru płytek. Starsze osobne ustawienie opakowania kleju nie nadpisuje zestawu. Indywidualna zmiana koloru zachowuje wybrany klej; ręczna zmiana kleju aktualizuje ten sam rekord. Pozostałe modele, wybór sklepu, odbiór i opcja jednego zamówienia w każdym sklepie nadal są dostępne.

Nie zastępujemy samoczynnie modeli w zapisanych projektach. Podgląd korzysta z tego samego SDK i produkcyjnego endpointu co kosztorys. Dwa warianty są dwoma niezależnymi koszykami, a nie łącznym zakupem obu kolorów.

## Rzeczywiste kwoty kontrolne

Podłoga 10 m², zapas płytek 15%, spoina 3 mm, brak posiadanych pozycji. Ilości: 9 paczek po 1,43 m², 2 worki kleju po 25 kg, fuga Atlas 001 2 kg, krzyżyki 3 mm 150 szt. oraz grunt Ceresit CT 17 10 l. Założenia zużycia i źródła opisuje [raport wave80](atlas-plus-standard-kompletny-koszyk-2026-10-29.md).

| Podgląd dla kodu 00-001 | Materiały brutto | Dostawy | Razem | Osobne zamówienia |
|---|---:|---:|---:|---:|
| Ennis Light Grey, osobne zamówienia | 1232,93 zł | 342,69 zł | **1575,62 zł** | 5 |
| Ennis Light Beige, osobne zamówienia | 1232,93 zł | 342,69 zł | **1575,62 zł** | 5 |
| Light Grey, jedno zamówienie na sklep | 1232,93 zł | 445,99 zł | **1678,92 zł** | 3 |

Pięć zamówień oznacza po jednym w Modnej Łazience i Rab-Dom oraz trzy w Sewerze. Podgląd nie ukrywa tego warunku niższej dostawy. To najtańszy znaleziony potwierdzony wariant w ograniczonym wyszukiwaniu, bez gwarancji globalnego minimum ani niepotwierdzonych stawek równych zero.

## Ochrona poprawności wyceny

- Zmiana obmiarów, listy, kodu, preferencji zamówień lub zakresu unieważnia poprzednie wyniki. Odpowiedź ze starego zapytania nie odblokowuje wyboru.
- Niepełna lista, nierozpoznany materiał, inny kod w odpowiedzi lub wygasła wycena nie daje przycisku wyboru kompletnego zestawu. Sprawdzane są całkowite grosze oraz zgodność sum materiałów, dostaw i sklepów.
- Błędna spoina 1 mm pozostaje nieuzgodniona; zestaw nie poprawia jej samoczynnie i nie pokazuje pełnej ceny.
- Zapis pozostaje zgodny z wcześniejszym JSON version1. Nie ma migracji bazy ani zmian stabilnych ID prac, materiałów i obmiarów.
- Wybranie zestawu odświeża właściwy kosztorys. Cena nie jest rezerwacją; dostępność koszyków i zakres znalezionych podziałów mogą zmienić wynik. W próbie drugiego kodu bieżący kosztorys początkowo miał 1595,52 zł przy sześciu zamówieniach; niezależny podgląd potwierdził tańszy wariant pięciu zamówień 1575,62 zł. Po zastosowaniu ponowiony kosztorys potwierdził 1575,62 zł. Nie zmieniono z tego powodu katalogowej ceny produktów ani historii cen.

## Weryfikacja

**799 testów rdzenia: 799 PASS, 0 fail, 0 skip.** TypeScript mobile poprawny. Ochrona 66 historycznych wpisów rejestru poprawna. Trzy źródła techniczne nowego modułu zwracają HTTP200: [ATLAS](https://www.atlas.com.pl/produkt/atlas-plus/), [Light Grey](https://www.paradyz.com/pl/produkty/p39069-u117-light-grey-gres-szkl-rekt-mat-598x598-g1), [Light Beige](https://www.paradyz.com/pl/produkty/p39162-u117-light-beige-gres-szkl-rekt-mat-598x598-g1). Nie powtarzano wdrożenia ani testów niezmienionego wspólnego backendu.

Cztery rzeczywiste wywołania produkcyjnego SDK: dwa kolory, jedno zamówienie na sklep i niepoprawna spoina. Trzy kompletne podglądy; spoina 1 mm prawidłowo zablokowana. Równość wejścia podglądu i zastosowanego wyboru potwierdzona; starsze ustawienie innego kleju go nie nadpisuje.

Interfejs uruchomionej aplikacji Expo web na localhost:8082 sprawdzono przez przeglądarkę:

- Projekt QA przywrócony do historycznego modelu bez oferty: porównanie pokazuje dwie pełne alternatywy przed zmianą modelu. Jeden wybór zapisuje Light Grey i standardowy klej; wynik 1575,62 zł, zachowany po przeładowaniu.
- Ręczna zmiana na promocyjne opakowanie Castoramy pokazuje brak pełnej dostawy; przywrócenie standardowego kleju odzyskuje pełny koszyk.
- Usunięcie kodu usuwa ceny i przyciski wyboru; wpisywanie części kodu nie przywraca starej wartości. Kod 42-209 ma oddzielne wyceny i po zastosowaniu pełny wynik 1575,62 zł. Na koniec przywrócono testowy 00-001.
- Wspólny koszyk dwóch projektów QA (Ennis i podkład) sam odczytuje zapisany zestaw: **1890,06 zł**, w tym materiały 1485,38 zł i dostawy 404,68 zł. Po próbie przywrócono poprzedni wybór trzech własnych prac QA.
- Zdjęcia, dwie ceny i przyciski widoczne w końcowym podglądzie. Nie jest to odbiór na fizycznym Androidzie lub iPhonie.

Przegląd ścieżki pieniędzy: kwoty pochodzą z rzeczywistych koszyków API, nie z cen netto ani sum samych kart; wybory i zapis są izolowane per projekt, a odpowiedź musi dotyczyć aktualnego kodu i zakresu. Dowód: rzeczywiste produkcyjne HTTP oraz powyższe przejścia interfejsu. Nie składano zamówień, nie wprowadzano danych klienta i nie uruchamiano płatności ani płatnego AI.

## Pozostała praca

Katalog nadal obejmuje **175 pozycji ze zdjęciami, 168 z aktywnymi ofertami, 216 ofert i 222 źródła**. Siedem starych modeli pozostaje bez aktywnej oferty. Audyt tych samych 65 historycznych map nadal ma 170 nierozpoznanych wymagań, a nie 170 odrębnych produktów. Ten etap upraszcza dostęp do istniejącego kompletnego zestawu; nie domyka całego katalogu ani rzeczywistych stanów pobliskich placówek. Kolejne etapy powinny rozszerzać kompletne zestawy i uzupełniać braki wynikające z obmiarów oraz potwierdzeń sklepów.
