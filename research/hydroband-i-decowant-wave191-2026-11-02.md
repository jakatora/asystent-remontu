# Hydroband i nowy sklep Decowant — 2026-11-02

Status: opublikowane i zweryfikowane publicznie 2026-11-02. To postęp w ciągłym celu, który obejmuje nadal katalog, dostawy, zmiany cen, UX, testy i wdrożenia.

## Zadanie użytkownika

Użytkownik powinien kupić właściwą taśmę i narożniki do Woder E, razem z wybranymi opakowaniami folii i rzeczywistą dostawą. Dodajemy trzy pozycje do wspólnego koszyka oraz sklep Decowant z pięcioma sprawdzonymi ofertami. Nie zmieniamy dotychczasowego kalkulatora Mapei ani nie podstawiamy materiałów Atlas do jego systemu.

## Źródła i tożsamości

- [Atlas Hydroband 3G](https://www.atlas.com.pl/produkt/atlas-hydroband-3g/) i [narożniki producenta](https://www.atlas.com.pl/produkt/atlas-narozniki-uszczelniajace-hydroband-3g/): zgodność z hydroizolacjami Woder, rozdzielenie taśmy i narożników.
- [Rolka Decowant](https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-tasma-uszczelniajaca-125-mm-10-m/370), native product 370: EAN 5905400602807, jedna rolka 125 mm × 10 m. Tożsamość niezależnie potwierdzona przez [PSB](https://www.grupapsb.com.pl/produkt/tasma-izolacyjna-szerokosc-125-mm-10-mb-hydroband-3g-atlas-5905400602807.html).
- [Narożnik wewnętrzny Decowant](https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-WEWNETRZNY/318), product 318: EAN 4260112880754, opis i native jednostka potwierdzają sprzedaż jednej sztuki. Kod potwierdza [Trops](https://trops.pl/pl/products/naroznik-hydroband-3g-wewnetrzny-atlas-5533.html).
- [Narożnik zewnętrzny Decowant](https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-ZEWNETRZNY/319), product 319: EAN 4260112880761, jedna sztuka. Kod i cenę za sztukę pokazuje także [Trops](https://trops.pl/produkt/naroznik-zewnetrzny-hydroband-3g-atlas/).
- Woder E [5 kg](https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-5-KG/317) i [15 kg](https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-15-KG/367): istniejące dokładne GTIN 5905400514490 i 5905400514506. Zachowana dotychczasowa rodzina opakowań, bez Woder W/Duo lub niepotwierdzonych rewizji.

Nie zakładamy równoważności kodów narożników 4260112880754/761 z kartami 5905400601459/442. Natomiast opis pojedynczej jednostki Decowant jest weryfikowany osobno od kodu opakowania zbiorczego. Dane produktu, kod sklepu, producent, jednostka, liczba sztuk, URL i native product ID mają ścisłe potwierdzenie przed ceną i transportem.

Odczyty natywne cen z 03:40:35 UTC: rolka 119,99 zł, narożnik wewnętrzny 12,87 zł, zewnętrzny 12,18 zł, Woder 5 kg 119,99 zł i 15 kg 329,87 zł; wszystkie możliwe do dodania do koszyka. To ceny konkretnego odczytu. Do seed dodano tylko pięć rzeczywistych obserwacji, zachowując poprzednie 356; brak wymyślonej wcześniejszej ceny.

## Rzeczywisty koszyk i transport

Trzy anonimowe koszyki z 03:37 UTC potwierdziły produkty, ilości, sumy, kraj Polska i DPD Kurier / Autopay 19,99 zł: jeden narożnik, dwie rolki + cztery narożniki wewnętrzne + jeden zewnętrzny, a następnie te akcesoria z dwoma wiadrami Woder E 5 kg. Nie składano zamówienia, nie wysyłano danych kontaktowych i nie wykonywano płatności. To wycena krajowa, nie deklaracja indywidualnej stawki dla kodu pocztowego.

Stare indeksowane karty Lobo przekierowały do kategorii. API Dam-Bud product 876 zwróciło can_buy=false mimo starszego wyniku wyszukiwarki. Nie dodano ich jako aktywnych ofert. Sewera ma dodatkowe warianty na metry i z kodami magazynowymi; nie przypisano im na podstawie podobnej nazwy GTIN ani zawartości pudełka.

Artefakty: G:/Projekty/asystent-remontu-work/wave191-20261102. Surowe publiczne odpowiedzi pozostają poza repo; fixture testowy zawiera wyłącznie potrzebne dane, bez sesji i pól kontaktowych.

## Walidacja i publikacja

Czyste grupy 555 mobile / 237 pricing / 159 API lib / 159 adapter / 1064 shared: PASS, bez fail/skip. Grupy częściowo się pokrywają. Typy API/mobile i 66 legacy jobs PASS. GitHub statusy puste; nie deklarować zielonego CI. Nowe testy potwierdzają rzeczywiste jednostki i kwoty, blokują zmieniony model/GTIN/opakowanie/URL oraz pozostawiają transport nieznany przy braku kraju, kuriera lub zgodnego koszyka.

Lokalnie i publicznie 8 scenariuszy rzeczywistego API oraz 11 UI PASS. Fotografie wszystkich trzech nowych pozycji obejrzane w rzeczywistym widoku katalogu. Sprawdzone wyszukiwanie kodem, rolek zakup 2 × 10 m dla potrzeby 12,5 m, narożniki na sztuki, Woder 5/15 kg, dwa kody pocztowe, wspólny koszyk i cały remont. UI: dokładne ilości, wybrany sklep, suma z dostawą, kopiowanie linków, backup, nawigacja i 320/390 px; zero błędów stron i API 429.

Pierwszy lokalny weryfikator UI wybrał wcześniejszą odpowiedź dla wszystkich sklepów (544,53 zł), gdy aplikacja wyświetlała prawidłowy zapisany wybór Decowant (563,61 zł). Zachowano r1; poprawiono predykat testu, aby oczekiwał jawnego wybranego sklepu, i powtórzono r2 bez zmiany aplikacji, cen lub wycen. R2 oraz publiczny r1 przeszły. To ujawniło odrębne zadanie wydajności opisane niżej.

Runtime/WWW source `38259cdf91b6b83f2db6dab930b9f25dcda61ce3`. [PR173](https://github.com/jakatora/przetargai/pull/173), head `49301f2b5c711402e6b22bbc8a7de62c683e61d6`, scalony z kontrolą SHA jako `90f54174efd04e1e616029b4544457a81ed8d882`. API `04ae5c23-8af7-4417-bbdc-3345c9e82f29` SUCCESS 03:53:22.388 UTC; WWW `de4e38b9-2531-4c42-96cb-d2b17f98cba8` SUCCESS 03:56:33.210 UTC.

Rzeczywisty snapshot wdrożenia: 150 plików, 148 pozostałych bajtowo bez zmian, zmienione tylko bundle i seed. Bundle SHA256 `ac941be21358ec4138e27730752ebd9ecf66650166c4178bfc2448302c0770bc`. Seed 361, poprzednie 356 i pięć nowych obserwacji porównane z rzeczywistymi odczytami. Bez zmian zależności, migracji, płatności lub innych aplikacji backendu. Foreign WIP ean-overlay/mappings/lock/.atlas/PROPOZYCJE nietknięte.

WWW: 63 zasoby / 17 296 392 B, wszystkie sprawdzone SHA256, 77 wartości vaulta bez wycieku. Osiem z dziewięciu plików hostingu/relay niezmienionych; relay przebudowany z katalogiem. Jego dozwolone sklepy nadal tylko ABUD/ChemiaDoParkietu25/eTak; Decowant działa bezpośrednim adapterem Shoper. Prywatny POST 401, prywatne pliki 404, trasy aplikacji i dokumentów 200.

Publiczny audyt: 247 referencji / 215 potwierdzonych / 322 oferty / 32 dawne braki. Cztery merchant SKU, zero fałszywych potwierdzeń. Przykłady konkretnych prób, nie prognoza dla kolejnego zakupu: akcesoria 323,63 zł z dostawą; akcesoria z dwoma Woder E 5 kg w Decowant 563,61 zł; jawny dobór opakowań Woder dla potrzeby 7 kg wraz z tymi akcesoriami w Decowant + Lobo 494,43 zł, z dwiema rzeczywistymi dostawami. Pełny remont 19 wymagań / 18 produktów: 3647,12 zł w 11 sklepach; poprzednie 16 wymagań zachowane, trzy nowe dodane osobno. Wyszukiwanie nadal ograniczone, bez dowodu minimum całego rynku.

Końcowy `final-proof.json` 03:57:58.662 UTC: 132 wystąpienia nadal ważnych rzeczywistych wycen; bez korekty dat. Nie przedłuża to ich ważności w przyszłości. Cache przed publikacją 354 obserwacje / 11 578 punktów historii; po: 359 / 11 929. Zachowane 11 575 starych punktów, trzy prawidłowo usunięte przez istniejącą retencję 60/ofertę, dokładnie odtworzoną klasą aplikacji. Pięć nowych ofert ma po trzy rzeczywiste punkty i zmianę 0 gr; nie zaimportowano sklepowej najniższej ceny jako własnej wcześniejszej obserwacji lub promocji.

Własny serwer PID 50236 / sesja 19729 zatrzymany exit 0 (856 żądań łącznie wszystkich lokalnych scenariuszy, nie jednego koszyka). Native 21972/72261 i UI 54414/19657 terminalne 0, przeglądarki zamknięte. Końcowy odczyt procesów nie znalazł node z wave191; localhost:8082 i projekty użytkownika nietknięte.

## Następny konkretny krok

Usunąć zbędne wyceny przed odtworzeniem zapisanego sklepu. W `local-hydroband-qa.json` dwa wejścia na koszyk wygenerowały cztery zapytania: wszystkie sklepy, Decowant, wszystkie sklepy, Decowant. Wyświetlany wynik był poprawny; pierwsze zapytanie nie odpowiadało jeszcze zapisanej preferencji. Zablokować wycenę do ukończenia odczytu ustawień i sklepu, zachować świadomą zmianę sklepu, backup, anulowanie starej odpowiedzi oraz brak przedwczesnego wyzerowania potrzeb. Udowodnić zmniejszenie liczby rzeczywistych żądań, nie tylko zielony unit.

Dalej pozostają 32 braki, zgodny pełny wybór systemu Atlas w kreatorze, dostawy Castorama/OBI, szybkość i koszt oraz pilotaż prawdziwych klientów. Ciągły cel ACTIVE; ta publikacja go nie kończy.
