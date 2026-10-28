# Chłonny mur pod tynk Knauf — Grundiermittel 60 i pełny koszt palety

Stan badania: 2026-10-28. Cel rozwoju aplikacji pozostaje aktywny. To kolejny potwierdzony wariant materiałowy, bez deklaracji kompletnego katalogu dla wszystkich prac.

## Problem i działanie

Użytkownik tynkujący chłonny mur nie miał konkretnego gruntu w koszyku. Betokontakt przeznaczony do gładkiego niechłonnego betonu nie jest automatycznym zamiennikiem. Dodano osobny wybór Knauf Grundiermittel 60 15 kg, dokładny EAN 5901793357799, zdjęcie rzeczywistego produktu i ofertę BMB Technologie.

Zapisany projekt tynkowania nie pokazywał obmiarów w edytorze mimo zaimportowanych kontrolek. Dodano go do obsługiwanych prac, z opisem dotyczącym tynkowania. Zapis ponownie liczy materiały. Zmiana produktu nie przejmuje oznaczeń „Mam” i „Kupione” dla innego gruntu.

Identyfikatory pracy, czterech materiałów i wcześniejszych obmiarów pozostają bez zmian. Model `wall-plastering-v1` pozostaje zgodny z poprzednimi zapisami. Historyczne projekty nie są automatycznie przepisywane.

## Podstawa techniczna i ilość

- [Aktualna karta Knauf Grundiermittel 60, wydanie 08/2026](https://knauf.com/api/download-center/v1/assets/7639fea2-44c7-4c59-b464-b436316de77a?country=pl&download=true): wnętrza, chłonne podłoża mineralne pod tynki gipsowe; rozcieńczenie zależne od chłonności 1:1–1:3. Dla cegły przykłady obejmują 1:2 i 1:3, dla betonu komórkowego/silikatów 1:1 i 1:2.
- [Karta produktu producenta](https://knauf.com/pl-PL/p/produkt/knauf-grundiermittel-60-28517_0120): nr 473259, EAN 5901793357799, wiadro 15 kg. Nie stary Grundiermittel z innym EAN ani Grundiermittel 90.
- Karta podaje orientacyjnie 400–450 m² z całego wiadra przy 1:2, czyli 45 l gotowej mieszanki. Wariant kalkulatora jawnie dotyczy 1:2. Domyślne 400 m² to założenie zakupowe z dolnego końca tego zakresu, edytowalne po próbie na ścianie.
- Zapotrzebowanie koncentratu w kg: `powierzchnia × 15 / wydajność całego wiadra × (1 + zapas / 100)`. Wody do rozcieńczania nie kupuje się jako gruntu. Przy 10 m² / 400 m² / 10%: 0,4125 kg; dwa pokoje: 0,825 kg → jedno wiadro.
- Nie przeliczono automatycznie osobnego, niejednoznacznego co do koncentratu/mieszanki wpisu 0,1 kg/m² przy 1:3 na zużycie koncentratu przy 1:2.
- Całkowite wyschnięcie przed tynkowaniem; minimum 12 h przy 20°C / 50% RH według aktualnej karty. Nie skopiowano starszego opisu sklepu podającego 65% RH. Chłód i wilgotność wydłużają czas. Baumit MPI 25 nie otrzymuje tego gruntu automatycznie.
- Pole wydajności widoczne i walidowane tylko dla odpowiedniego wariantu Knauf. Błędne ukryte pole nie blokuje zapisu po zmianie podłoża.

## Cena brutto, zapas i dostawa BMB

[Dokładny produkt BMB](https://bmbtechnologie.pl/grunty-do-tynkowania/srodek-gruntujacy-knauf-grundiermittel-60-15kg.html): ID 5454, kod 5901793357799, stan 23 sztuki, jeden krok zamówienia = jedno wiadro 15 kg. Odczyt z 2026-10-28T22:27:07.370Z: **198,99 zł brutto**. Odczyt strony produktu sam nie potwierdza brutto: adapter dodatkowo sprawdza kolumnę ceny brutto i wartość produktu w świeżym anonimowym koszyku.

W rzeczywistym koszyku przy Wysyłce paletowej / Przelewy24:

| Liczba wiader | Materiały brutto | Przewóz | Obowiązkowa paleta KN-WO | Całość |
| --- | ---: | ---: | ---: | ---: |
| 1 | 198,99 zł | 210,00 zł | 98,00 zł | **506,99 zł** |
| 2 | 397,98 zł | 210,00 zł | 98,00 zł | **705,98 zł** |

Pełna dostawa i opakowanie wynoszą aktualnie **308,00 zł**, mimo niejednoznacznego opisu palety jako zawartej w cenie. Adapter uzgadnia te składniki z faktyczną końcową sumą brutto. Niezgodność, zmiana EAN/ilości/ceny, dodatkowy produkt, odbiór, inny kraj lub finansowanie uniemożliwiają potwierdzenie takiej wyceny. Ogólny baner darmowej wysyłki nie jest używany.

Taryfa dotyczy Polski, nie indywidualnego adresu. Kod 00-001 służy testowi aplikacji; nie został przesłany do BMB jako potwierdzona wycena adresowa. Dostępność miejscowego odbioru wymaga potwierdzenia.

Świeże sesje anonimowe wykonują odczyt produktu, dodanie wyłącznie `add_product[5454]`, następnie odczyt koszyka. Bez danych klienta, zgody na warunki, składania zamówienia lub inicjowania płatności. Fixture zawiera tylko potrzebne fragmenty publicznego DOM; usunięto konfigurację podpisów widgetu rat.

## Sprawdzony pełny koszyk

Dwa testowe pokoje po 10 m², Goldband 15 mm, zapas 10%, siatka na 2 i 3 m², bez zakupu narożników. Jeden pokój: beton/Betokontakt; drugi: chłonny mur/Grundiermittel 60 przy 1:2 i 400 m² z wiadra.

| Sklep | Materiały | Dostawa z wymaganymi opłatami | Razem |
| --- | ---: | ---: | ---: |
| BMB Technologie | 198,99 zł | 308,00 zł | 506,99 zł |
| LiderzyCen | 364,56 zł (12 worków Goldband) | 230,00 zł | 594,56 zł |
| Realbud | 293,79 zł (Betokontakt i Profix) | 25,00 zł | 318,79 zł |
| **Suma** | **857,34 zł** | **563,00 zł** | **1 420,34 zł** |

Wspólne opakowania: jedna rolka siatki zamiast dwóch, oszczędność materiałowa 227 zł. Nie jest to historyczna obniżka ceny. Oba grunty pozostają osobnymi EAN mimo wspólnego legacy ID `plaster-primer`.

Dwa pokoje z samym chłonnym murem: materiały 790,55 zł, dostawy 563 zł, razem 1 353,55 zł. Jeden taki pokój: razem 1 171,27 zł. Kwoty obejmują wskazane zakupy materiałów, bez narzędzi i robocizny. Wynik dotyczy dostępnych potwierdzonych ofert, nie całego rynku.

Sewera i eAdamex dla tego dokładnego produktu nie zostały aktywowane: bieżące karty wykazały brak zapasu / zamówienie odroczone, mimo korzystniejszych wyników wyszukiwania. Realbud miał niespójne oznaczenie masy i brak towaru. Nie tworzono ofert z samych fragmentów wyszukiwarki.

## Weryfikacja i wydanie

- 731 testów kalkulatora, cen i adapterów; 1054 istniejące testy współdzielonego backendu: zero błędów i pominięć. TypeScript mobile/API poprawny. Dodatkowa końcowa poprawka ukrytego pola jest objęta testem kalkulatora i ponownym typecheckiem mobile.
- Rzeczywiste koszyki sprzedawcy 1 i 2 wiadra oraz 10 przebiegów kalkulator → produkcyjne HTTP. W tym różne grunty, wspólne opakowanie, zmieniona wydajność, niezgodny system, niepełny wybrany sklep i niepotwierdzony odbiór.
- Native UI: edycja tylko własnego drugiego projektu QA; wydajność 0 zatrzymuje zapis, 400 zapisuje i przelicza. Nowy produkt i zdjęcie widoczne. Wspólny koszyk dwóch prac: 1 420,34 zł, trzy taryfy PL. Wybór samego BMB jasno pokazuje tylko 1/4 produktów i trzy braki, bez pełnej ceny.
- Skrypt walidacji źródeł: BMB HTTP 200; dwie odpowiedzi 403 Knauf dla skryptu, treść producenta odczytana przez narzędzie WWW. Bez deklaracji, że 403 to pozytywna weryfikacja HTTP. Kontrola historycznych ID obejmuje testy ujemne usuniętego ID/eksportu i pustego rejestru.
- Fresh snapshot produkcji: 148 plików. Zmiana tylko bundla i ziarna; zachowano wszystkie 214 wcześniejsze obserwacje oraz 146 pozostałych plików.
- [PR 73](https://github.com/jakatora/przetargai/pull/73) scalony: `9289410e217e80b8a0755750e93c8919357d1620`; head `04c9e8b49954b8965055b7f59967198807f2b73f`. Brak uruchomień GitHub Actions, testy wykonane lokalnie.
- Railway `806bdf34-6245-4cfc-9c09-6b5828bc74d8`: SUCCESS 2026-10-28T22:32:59.277Z. Wszystkie 148 plików produkcji zgodne z przygotowanym wydaniem przy sprawdzeniu 22:33:18.861Z.

Katalog: 170 referencji / 163 z aktywną ofertą / 209 ofert / 215 źródeł / 52 zarejestrowane i 49 aktywnych kanałów sklepowych; 170 referencji ma zdjęcia (171 wpisów zdjęć). Siedem wcześniejszych dokładnych produktów nadal bez aktywnej oferty. Te same 65 historycznych scenariuszy: 84/251 wycenionych wymagań, 167 braków (94 bez zapytania, 72 bez produktu, 1 bez oferty), 11 kompletnych scenariuszy materiałowych. To nie są liczniki unikalnych produktów ani procent ukończenia aplikacji.

Następne prace: kolejne brakujące warianty materiałów i gotowe scenariusze z jawnym doborem, dodatkowe konkurencyjne oferty dla nowych produktów, wyceny transportu w dostępnych kanałach oraz lepsze pokazywanie znanego kosztu dostępnej części koszyka przy brakach w wybranym sklepie. Cel pozostaje aktywny.
