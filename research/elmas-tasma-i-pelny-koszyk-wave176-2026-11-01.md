# Elmas, taśma Norgips i dobór opakowań — 2026-11-01

Źródło aplikacji: `a4135ed68ddf2710c4ddc43986f89aff418da509`. Artefakty wydania: `G:/Projekty/asystent-remontu-work/wave176-20261101/release`. API i WWW mają status SUCCESS. Końcowy audyt z 2026-11-01 19:42:01 UTC potwierdza sześć publicznych wycen i dwanaście publicznych scenariuszy przeglądarkowych; wszystkie zwycięskie wyceny dostaw były wtedy ważne.

## Uzupełniona potrzeba

Istniejąca referencja `mat-gypsum-acoustic-norgips-50x30` otrzymuje ofertę i właściwe zdjęcie taśmy Norgips 50 mm × 3 mm × 30 m, GTIN `5907651698004`. Kupowana jednostka to pełna rolka 30 m. Nie jest to karton ani inny rozmiar taśmy.

Dwa niezależne źródła to [karta producenta Norgips](https://norgips.pl/media/repository/0/153/36260b03960b449691b96488c1d9b974/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf) oraz [główna karta produktu Elmas](https://sklep-elmas.pl/p/tasma-akustyczna-samoprzylepna-z-klejem-50x3x30). Producent potwierdza kod i wymiary; sklep potwierdza ten sam kod, markę, opis, cenę brutto 22,89 zł i stan 197 rolek w obserwacji z 2026-11-01. Importowane przez sklep pomocnicze atrybuty wymiarów są sprzeczne z opisem; adapter nie używa ich do przeliczania jednostki.

Fotografia pochodzi z głównej karty tego konkretnego produktu: [zdjęcie Elmas](https://sklep-elmas.pl/upload/6b89e6014d62a9e7cb888fdfa8ba.jpg). Nie dodano obrazu generowanego ani zamiennika.

## Rzeczywista dostawa

Adapter odczytuje główną kartę, ponownie sprawdza natywny produkt i wywołuje używany przez sklep kalkulator `/api/public/order/form`. Wybiera i ponownie potwierdza usługę InPost Kurier, z płatnością Przelewy24, dla kraju Polska. Nie wysyła końcowego zamówienia `/api/public/order/new`, adresu, danych osobowych ani zgód.

Etykieta „Bezpłatnie” na karcie oraz domyślny paczkomat za 40 zł nie stanowią wyceny kuriera do domu. Wyniki rzeczywistego kalkulatora, ponownie sprawdzone przez lokalny endpoint aplikacji:

| Potrzeba | Zakup | Materiały | Kurier | Razem |
| --- | --- | --- | --- | --- |
| Dodatnia ilość mniejsza od 30 m | 1 rolka | 22,89 zł | 50,00 zł | 72,89 zł |
| 60 m | 2 rolki | 45,78 zł | 50,00 zł | 95,78 zł |
| 240 m | 8 rolek | 183,12 zł | 50,00 zł | 233,12 zł |
| 270 m | 9 rolek | 206,01 zł | 0,00 zł | 206,01 zł |

Opłata pochodzi z odpowiedzi sklepu dla całego zamówienia, nie z ręcznej tabeli ani wpisanego w kod progu. Adapter jawnie oznacza `retailer_basket_national` i `destinationScope: PL`: sklep nie oblicza osobnej stawki dla kodu pocztowego. Kody `30-001` i `00-001` sprawdzono w aplikacji; nie przedstawiamy krajowej stawki jako lokalnej wyceny.

## Poprawka całego koszyka

Dodanie niezależnej taśmy ujawniło brak korzystnego miksu opakowań po rozszerzeniu planów o innego sprzedawcę. Dla 12 l CT17 Transparent w Buduj24 zakup 5 l + 10 l kosztuje 127,63 zł, a 3 × 5 l kosztuje 129,45 zł. Wcześniejszy ograniczony wybór pomijał tańszą kombinację w części kompletnych planów.

Silnik zachowuje oryginalny wariant jednej wielkości i dodaje zoptymalizowane wielkości w obrębie wybranego sprzedawcy, również po zmianie sklepu dla innego materiału. Zachowane są fizyczne produkty, zapotrzebowanie, ograniczenia stanów oraz limit 80 zewnętrznych wycen. Tańszy materiałowo plan nadal musi otrzymać rzeczywistą akceptowaną wycenę dostawy.

Regresja odtwarza duży remont, niedostępny produkt u pierwszego sprzedawcy oraz mieszane opakowania gruntu. Przed rozszerzoną poprawką wynik wynosił 175,45 zł zamiast 173,63 zł. Po poprawce test przechodzi; odrzucenie ceny mieszanego wariantu przez sklep pozostawia poprawny potwierdzony wariant 175,45 zł. Dane wejściowe nie są zmieniane.

W rzeczywistym scenariuszu trzech projektów, dodatkowych gruntów i jednej rolki taśmy:

- pełny remont bez nowej taśmy: 2478,98 zł;
- niezależna taśma i jej kurier: 72,89 zł;
- kompletny nowy zestaw: **2551,87 zł**, w tym materiały 2184,97 zł i dostawy 366,90 zł;
- poprzedni wybór tych samych potrzeb: 2553,69 zł; poprawa wynosi 1,82 zł.

Wynik obejmuje 14 wejściowych pozycji w czterech etapach, w tym etap dodatkowych materiałów. Podział na sklepy i opakowania pochodzi z pełnego porównania. Nie dodano nowej pracy ani nie zmieniono identyfikatorów istniejących projektów.

## Dotychczasowe dowody wydania

| Grupa | Wynik lokalny dla źródła a4135ed |
| --- | --- |
| Mobile | 528 PASS, 0 FAIL, 0 SKIP |
| Pricing | 195 PASS, 0 FAIL, 0 SKIP; w tym 27 porównania dostawy |
| API lib, natywny runner TSX | 101 PASS, 0 FAIL, 0 SKIP |
| Adaptery, runner CJS | 132 PASS, 0 FAIL, 0 SKIP |
| Wspólny backend | 1064 PASS, 0 FAIL, 0 SKIP |
| Typecheck mobile/API, build pricing, 66 legacy IDs | PASS |
| Rzeczywiste lokalne wyceny HTTP | 6/6 PASS |
| Przeglądarka, pełny interfejs | 12/12 PASS; bez błędów strony i odpowiedzi 429 |
| Rzeczywiste publiczne wyceny HTTP | 6/6 PASS |
| Przeglądarka na produkcji | 12/12 PASS; bez błędów strony i odpowiedzi 429 |

Grupy testów częściowo się pokrywają; nie należy sumować ich jako unikalnych testów. Pierwszy niewłaściwy runner CJS dla całej biblioteki API nie obsługiwał `import.meta`; właściwy natywny runner TSX przeszedł 101 testów. W pierwszym układzie katalogów końcowego zestawu wspólnego backendu brakowało sąsiedniego katalogu mobile wymaganego przez testy innej aplikacji. Poprawiono wyłącznie strukturę środowiska testowego i uruchomiono pełny zestaw ponownie.

Kontrola przygotowanego katalogu z bieżącą produkcyjną pamięcią cen oraz nową obserwacją, a następnie publicznego API: 239 referencji, 207 potwierdzonych, 307 ofert, 32 braki. Ubywa wyłącznie wskazana luka Norgips 50 × 30. Audyt tożsamości nie wykazał fałszywych potwierdzeń ani pominięć; cztery warianty bez EAN zachowały tożsamość sklepową. Nie przedłużano dat obserwacji. Same starsze dane startowe, bez aktualnej pamięci produkcyjnej, nie dowodzą bieżącego pokrycia katalogu.

Przeglądarka sprawdza rzeczywiste zdjęcie, pełną rolkę, krajową usługę kuriera, zmianę ilości do dziewięciu rolek, drugi kod pocztowy, kopiowanie zakupów, backup i import w nowym profilu, szerokości 320/390 px oraz pełny remont z jedną dostawą Elmas. Obraz przy 320 px sprawdzono również wizualnie.

## Zakres publikacji i pozostałe ograniczenia

Wspólne repozytorium: [PR 161](https://github.com/jakatora/przetargai/pull/161), commit `b7e7faf226772930ec2f9b9a6990ac9e28fcdba7`. Publikowane są tylko moduł remontowy i dane 345 zachowanych obserwacji + 1 nowa. Snapshot ma 150 plików; 148 pozostaje identycznych. SHA modułu: `0f1c573723005e2c7319f7b13ebe1829e269acf11ab515ecd96b97d1dd3886a8`.

PR scalono jako `7c2c6fab2d7a29784244fa5ee31d31bb0ef78c77`. Wdrożenie API `eaca9a91-1f7e-4f38-8e4f-4733cceef183` ma status SUCCESS; snapshot z 2026-11-01 19:38:48 UTC potwierdza wszystkie 150 plików i 346 obserwacji bez różnic względem przygotowanego wydania. Wdrożenie WWW `7853bb2b-d6eb-425b-b08a-7b396f238e71` również ma status SUCCESS.

WWW ma 63 zasoby, 17 262 410 bajtów i zgodne sumy SHA, sprawdzone także przez publiczny HTTP. Kontrola 76 wartości z vaulta nie znalazła wycieku w zasobach klienta. Sześć plików hosta/konfiguracji pozostaje identycznych; zmienia się prywatny adapter dostaw zawierający nowy sklep. Kontrola obejmuje dziewięć stron z HTTP 200, pięć niedostępnych ścieżek z HTTP 404, poprawny typ WASM i polski dokument. Prywatny adapter zwraca HTTP 401 bez uwierzytelnienia. Nagłówki zachowują COOP `same-origin`, COEP `credentialless` i `no-referrer`.

Końcowe artefakty: `verification-summary.json`, `final-railway-deployments.json`, `production-native.json`, `production-elmas-qa.json`, `production-http.json`, `catalog-identity-production-audit-wave176.json` i `deployed-verification.json`. Wszystkie procesy tej partii zakończone; nie ma oczekującego buildu ani testu.

Porównanie dużego remontu pozostaje ograniczone i nie dowodzi globalnego optimum wszystkich sklepów. Niepotwierdzone alternatywy nadal są widoczne. Starszy test całego remontu bez nowej taśmy na zimnym przebiegu zwrócił 2485,75 zł; jeden ponowny odczyt potwierdził 2478,98 zł. Nie zmieniono oczekiwanych kwot, aby ukryć tę różnicę.

Oddzielny następny temat: sprawdzić jawnie proponowane dodatkowe opakowanie przy progu darmowej dostawy. Powyższy natywny przykład pokazuje, że 9 rolek może kosztować z transportem mniej niż 8. Obecny dobór nie dokłada zbędnych opakowań wyłącznie do progów; nie wolno potajemnie zwiększać zapotrzebowania użytkownika. Potencjalna propozycja musi pokazywać dodatkową ilość, rzeczywistą nową wycenę i różnicę całkowitego kosztu.

Nie zmieniono migracji, zależności, formuł robót, 66 identyfikatorów prac ani obcych zmian w mapowaniach, nakładce EAN i lockfile. Nie uruchomiono zamówień, płatności ani monetyzacji. Stały cel rozwoju pozostaje aktywny.
