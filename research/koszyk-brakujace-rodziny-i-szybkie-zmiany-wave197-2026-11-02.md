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
