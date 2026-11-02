# W197 — wspólny koszyk, szybkie zmiany i dostępna nazwa projektu

Data: 2026-11-02. Poprzednia produkcja: API cdaf9078bdd6b55fd4b6e12a6184072fedd5f74a / WWW 61f64ecd0a830b8ebfdac7a9c50267aa827b1c96.

## Potwierdzony problem

Rzeczywista odpowiedź W196 dla trzech prac z jawnym doborem Mapegum oraz wybranym FUGI.PL zawiera trzy brakujące linie folii po 6,6 kg i trzy linie gruntu po 1 l. query.packageFamily jest już w HTTP API, lecz typ klienta i grupowanie nie uwzględniały go. UI pokazywał cztery brakujące pozycje zamiast dwóch, w tym trzy nieczytelne znormalizowane nazwy folii. Serwer prawidłowo zachował best=null i brak całkowitej ceny. Dowód źródłowy: W196 production-hydro-qa.json oraz publiczny zrzut tekstu.

## Zmiana

Klient przyjmuje istniejący opcjonalny packageFamily. Grupowanie uznaje wyłącznie zamkniętą, wcześniej zweryfikowaną rodzinę z pasującą nazwą, kategorią i jednostką, bez GTIN lub pojedynczego produktu. Sumuje surowe ilości do 19,8 kg i pokazuje czytelną nazwę rodziny. Nie wybiera wiadra ani fotografii konkretnego opakowania, nie tworzy ceny, nie zmienia ilości, kompletności lub kwot serwera. Różne rodziny, błędne kody, jednostki, nazwy, nieznane ilości i przyczyny pozostają oddzielne.

Automatyczne zmiany wyboru prac lub produktów są łączone przez 300 ms przed rozpoczęciem kosztownych natywnych koszyków. Starsze odpowiedzi tracą ważność od razu, poprzednie przyciski zakupowe są ukryte. Ręczne odświeżenie i ponowienie anulują oczekującą automatyczną wycenę i zaczynają od razu. Nie zmieniono zakresu porównania, limitów czasu, metod dostawy lub ważności wycen. Skuteczność dla rzeczywistych szybkich zmian wymaga jeszcze odbioru przeglądarki i liczby zapytań, nie samego odczytu kodu.

Nazwa projektu w kreatorze otrzymuje przetłumaczoną etykietę i podpowiedź dostępności, zgodną z widocznym napisem.

## Weryfikacja

14 testów grupowania, rodzin i odnośników PASS bez skip, w tym pięć nowych. Sprawdzono wszystkie siedem wcześniej zatwierdzonych rodzin oraz zachowanie six-line missingProductCount i best=null z serwera. Czysty build, pełne testy, sprawdzenie identyczności API, rzeczywisty lokalny/publiczny UI i publikacja WWW pozostają do wykonania. Nowych produktów, cen lub stawek dostawy w tej partii nie dodano.

## Końcowy stan publiczny — 2026-11-02

Źródło aplikacji 91b42702018ce060c7ec8afa2f5667fbfb5f9f81. WWW deployment 05d28b34-c60a-41a1-bad9-2cd20dfa7b25 SUCCESS 2026-11-02T07:34:59.591Z. API nadal 08817aa8-dde0-4eb5-9219-ef2a6d482f8f / źródło cdaf9078bdd6b55fd4b6e12a6184072fedd5f74a; nie wykonywano nowego wdrożenia API ani zmian współdzielonych usług. Nowy czysty build modułu ma identyczny SHA256 7d0155ccfd79a1c56bfa2e5db7103357ddaa6916a3cf45e5019afa8a08e17236, seed 369 identyczny. Odczyt produkcyjnego kontenera potwierdza wszystkie 150 plików bez różnic. Wszystkie 9 plików hostingu WWW, w tym prywatny relay, pozostają identyczne z W196.

581 testów mobile PASS, 0 fail/skip, w tym pięć nowych. Typy mobile i 66 ID PASS. 22 scenariusze lokalnego interfejsu na rzeczywistym PUBLICZNYM API oraz 22 scenariusze publicznego interfejsu PASS, bez interceptowania lub podstawiania wycen, bez błędów strony i 429. W każdym przebiegu zarejestrowano 6 rzeczywistych POST /pricing/project. Odbiór obejmuje kreator, etykietę i keyboard focus nazwy, zapis oraz undo starych wariantów, pełną siedmiopozycyjną recepturę, kopię, trzy prace, agregację surowych ilości, opakowania, odświeżenie, rzeczywistą dostawę, pięć fotografii i natywny link, częściowy sklep i powrót do pełnego koszyka.

Poprzedni publiczny ślad W196 zawiera po szybkich trzech wyborach trzy zapytania z odpowiednio 1 / 2 / 3 włączonymi rodzinami. W197 dla tego samego wzorca interakcji wysyła jeden POST z kompletnym końcowym wyborem, zarówno lokalnie, jak i publicznie. Wynik zachowuje 19,8 surowych kg i wszystkie dodatnie akcesoria. Pomiar obejmował rzeczywiste żądania przeglądarki; nie deklarujemy trzykrotnego skrócenia zimnej wyceny lub stałego czasu odpowiedzi sklepów.

Wybranie FUGI.PL daje 5 dostępnych akcesoriów oraz brak folii i gruntu. Surowy HTTP ma nadal sześć niewycenionych linii (3×6,6 kg folii i 3×1 l gruntu), missingProductCount=6 i best=null. UI pokazuje dwie brakujące pozycje: czytelną rodzinę Mapegum z 19,8 kg i grunt z 3 l, obie z informacją o trzech pracach. Grupa folii nie dostała zmyślonego GTIN, zdjęcia konkretnego wiadra, ceny lub opakowania. Oryginalna odpowiedź serwera i jej kwoty pozostały nienaruszone. Zrzuty publiczne scalonych braków 320/390 px sprawdzono wizualnie; brak poziomego przepełnienia.

Po powrocie do pełnego koszyka w badanym przykładzie: 970,36 PLN materiały + 24,49 PLN dostawy = 994,85 PLN, na oryginalnych potwierdzonych wycenach. Kontrola końcowa 2026-11-02T07:37:50.236Z sprawdziła sumy groszowe, zakres dostawy i oryginalną ważność przy obserwacji, a wyceny ostatniego porównania były wciąż ważne w tym momencie. Nie odnawiano dat. Katalog nadal 249 referencji / 217 potwierdzonych / 330 ofert / 32 wcześniejsze luki.

63 publiczne zasoby zgodne po SHA256; 17 312 880 B. Sprawdzono 77 wartości vaulta, 0 wycieków. Trasy 200, brakujące/prywatne pliki 404, anonimowy prywatny POST 401, polski dokument i właściwe nagłówki. Pierwsza lokalna próba narzędzia audytu katalogu nie znalazła express przy ładowaniu identycznego standalone bundle; ponowne uruchomienie z NODE_PATH wskazującym istniejące zależności przeszło. Aplikacja i publikacja nie wymagały tej poprawki ani nowej instalacji.

Ścieżka pieniędzy: kwoty i dostawy pochodzą z rzeczywistego API, grupowanie zmienia tylko prezentację potrzeb i zachowuje niepełność, starsze wyniki tracą prawo do przycisków zakupowych przy zmianie wyboru. Dowód rzeczywisty to oba przebiegi UI/HTTP oraz identyczność modułu API, nie wyłącznie zielony unit. Płatności, subskrypcji, afiliacji ani płatnego AI nie uruchamiano. Własny serwer WWW PID 50576 / session 15533 zamknięty poprawnie; konteksty Edge zakończone. Cel rozwoju pozostaje aktywny.
