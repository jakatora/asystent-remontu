# Paradyż Nati Bianco struktura: pełne paczki i dostawa Pati (2026-10-29)

## Problem użytkownika

Referencyjna płytka ścienna Nati Bianco **struktura** 25×40 cm (EAN 5902610507960) miała zdjęcie, ale nie miała aktywnej oferty z wyceną dostawy. Nie można było uczciwie wskazać najtańszego pełnego zestawu dla prac z tą płytką. Wariant gładki ma inne opakowanie 1,3 m² i nie jest tą samą płytką.

## Wdrożenie

- [Pati Art Studio](https://patiartstudio.pl/produkt/paradyz-nati-bianco-sciana-struktura-25x40-ss-250x400-1-nati-bi/) publikuje dokładny wariant `SS--250X400-1-NATI.BI`: 12 sztuk / 1,2 m², 66,00 zł za opakowanie, zdjęcie produktu i bieżący stan 39,30 m². [eŁazienki](https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/) potwierdza EAN. Zdjęcie Pati odpowiedziało HTTP 200 `image/jpeg`.
- Natywne Woo Store API sklepu odrzuca dodanie bez pola powierzchni; próba podania go w JSON tworzy pozycję z ilością zero. Adapter używa wyłącznie sprawdzonego, anonimowego formularza produktu z `area_needed = liczba opakowań × 1,2`, po czym odczytuje koszyk i kontroluje SKU, ilość, cenę brutto oraz sumę. Nie wysyła danych klienta ani zamówienia.
- Stan produktu ogranicza ofertę do 32 pełnych opakowań. Sklep dopuszcza zamówienia oczekujące, ale porównanie nie wykorzystuje ilości ponad potwierdzony stan.
- Jedna wycena kuriera obejmuje cały koszyk Pati. Wycena ma kod pocztowy, ograniczony czas ważności i zapis dowodowy SHA-256. Cena z API produktu nigdy samodzielnie nie staje się ceną końcową.
- Fotografia referencji w aplikacji wskazuje aktualną kartę Pati. Cena historyczna w lokalnym katalogu pozostaje oznaczona jako historyczna; ranking korzysta z żywej oferty.

## Wynik rzeczywisty

Żywy natywny koszyk Pati oraz produkcyjny `POST /api/remont/pricing/project`, kod testowy `00-001`, 2026-10-29:

| Koszyk | Materiały | Dostawa do domu | Razem | Wynik |
|---|---:|---:|---:|---|
| Nati Bianco struktura, 2 paczki = 2,4 m² | 132,00 zł | 170,00 zł | **302,00 zł** | `compared`, `missing=0` |
| Te same płytki + Cersanit Carina SLIM K98-0135 | 402,93 zł | 195,00 zł | **597,93 zł** | `compared`, `missing=0` |

Globalne porównanie sklepów dla tych dwóch przypadków wskazało tę samą potwierdzoną wycenę Pati. To wynik dla wskazanego kodu, ilości i chwili, nie stała cena dla całej Polski.

Testy: aplikacja i serwis cenowy 925/925 PASS, wspólny backend 1053/1053 PASS (wcześniejszy licznik 1054 obejmował dodatkowo plik pomocniczy uruchomiony jako test), API/mobile typecheck PASS. Testy kontrolują także wspólny koszyk płytki i deski, zmianę ceny, ilości, brak stanu i ograniczenie tras formularza. Żywy koszyk oraz produkcyjne HTTP są dowodem niezależnym od fixture.

Pakiet wdrożeniowy ze świeżego snapshotu zachował 248 poprzednich obserwacji, dodał jedną i zmienił tylko `src/data/remont-verified-offers.json` oraz `src/services/remont-pricing.cjs`. Railway deployment `6764f03d-9afc-4916-8506-3fa6955ec1a3` ma status SUCCESS. Snapshot po wdrożeniu: 148/148 plików zgodnych, 249 obserwacji, bundle SHA-256 `091dc6481813120690501047a239f69bc92316be0e0ab366e51938b798c5b839`. Backend [PR 100](https://github.com/jakatora/przetargai/pull/100) scalony jako `dcbfa6abcafdf6548e9b894ab5222272c5465905`. Kod aplikacji: `4a01b3d` i test mieszanego koszyka `df10226`, oba wypchnięte.

## Bieżący zakres katalogu

Zdrowie produkcji po wdrożeniu: 249 źródeł, 242 aktywne oferty, 180 aktywnych produktów. Wśród 187 śledzonych referencji z fotografiami nadal jest **7 bez aktywnej oferty**: profil Norgips UD30 C2, farba Dulux Rapidry White Matt 1 l, umywalka Cersanit Facile 50, panele Kronospan Toledo 2,22 m², folia Diall 20 m², gres Paradyż Petro Grey i drzwi Archi 80. Nati weszła do porównań; oferta Dulux w ABUD została w tym czasie wycofana jako niedostępna, więc licznik aktywnych produktów nie wzrósł. Ranking prawidłowo nie używa wycofanej ceny.

Dla profilu Norgips [Castorama](https://www.castorama.pl/profil-sufitowy-norgips-ud30-0-6-mm-3-mb/5907651698905_CAPL.prd) publikuje dokładny EAN, lecz automatyczny odczyt zwraca HTTP 503 i nie ma potwierdzonej dostawy koszyka. Rodimax nie został dodany: jego [regulamin](https://rodimax.pl/regulamin.html) nie podaje jednoznacznej tożsamości sprzedawcy i ogranicza obszar dostawy, podczas gdy [UOKiK zaleca sprawdzenie danych sprzedawcy przed zakupem](https://uokik.gov.pl/zanim-klikniesz-kupuje-sprawdz-od-kogo-zakupy-wysokiego-ryzyka). Następna praca: znaleźć potwierdzoną ofertę Dulux lub innego brakującego dokładnego produktu, z rzeczywistą dostawą całego koszyka.

## Kontrola kwot

Dotyczyły punkty money-path-review o kwocie faktycznej, ilości i braku cichych rabatów/opłat. Adapter porównuje cenę produktu z ceną każdej pełnej paczki w koszyku, sumy w groszach oraz ostateczną opłatę kuriera dla kodu. Nie inicjuje płatności, zwrotów ani zamówień. Dowód: natywny koszyk sklepu i produkcyjne HTTP z powyższymi kwotami.
