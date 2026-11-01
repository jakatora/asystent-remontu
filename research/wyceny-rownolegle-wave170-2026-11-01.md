# Wave170 — eksperyment wycen równoległych wstrzymany, 2026-11-01

## Decyzja

**Nie wdrożono eksperymentu na API ani WWW.** Lokalna poprawność obliczeń przeszła kontrole, ale pomiar rzeczywistych koszyków nie wykazał poprawy czasu dla obu sprawdzanych sklepów. Przyspieszenie Rab-Dom towarzyszyło wolniejszemu sprawdzeniu Sewery i większej liczbie jej połączeń. W głównej gałęzi roboczej cofnięto wyłącznie własną zmianę; istniejące obce zmiany pozostały nietknięte.

Kod eksperymentu zachowano w commicie `a73d311984fab84a32c29ffbd3296b9f198b6fb7` na gałęzi `codex/remont-quote-concurrency-experiment-20261101`. Cofnięcie: `1d8b2a70d279c99d6e9a98c27699c88db2751e36`. Porównanie śledzonych plików HEAD po cofnięciu z poprzednim zakończonym etapem `8e2ea0e7daa340fdd5b959c43f0cbdef40eeec35` jest puste. Nie użyto resetu, clean ani usuwania cudzej pracy.

## Co sprawdzano

Wspólny limit trzech równoczesnych natywnych wycen na jedno porównanie i równoległe sprawdzanie niezależnych podziałów koszyka. Kolejność wyników zachowana niezależnie od kolejności zakończenia, zwolnienie miejsca po odrzuceniu, sprawdzenie deadline po kolejce, deduplikacja i dotychczasowy budżet maksymalnie 80 natywnych koszyków. Ilości, fizyczne opakowania, stany, minimalne zakupy, zaokrąglenia i ważność dostawy pozostały sprawdzane. Nie zmieniono katalogu, UI, zależności ani migracji.

## Rzeczywiste pomiary

Nowy lokalny serwis i natywne koszyki sklepów dla każdego wariantu; cztery taśmy, po 51 m zapotrzebowania, łącznie osiem rolek po 50 m. Wyłączono odświeżanie cen produktów wyłącznie w pomiarze A/B, aby porównać koszt sprawdzania koszyka. Nie podstawiano odpowiedzi dostawy.

| Sklep i wariant | Czas | Połączenia HTTP | Najwięcej równocześnie | Pełna suma |
| --- | ---: | ---: | ---: | ---: |
| Rab-Dom, poprzedni kod | 8872 ms | 91 | 1 | 102,06 zł |
| Rab-Dom, eksperyment | 3528 ms | 91 | 3 | 102,06 zł |
| Sewera 30-001, poprzedni kod | 20853 ms | 35 | 3 | 106,48 zł |
| Sewera 30-001, eksperyment | 26839 ms | 81 | 3 | 106,48 zł |

W tych pomiarach wszystkie wywołania miały HTTP 200. Oba warianty uczciwie oznaczały ograniczone przeszukanie i zachowały właściwe pełne ilości oraz kwoty. Sewera wykonała więcej pracy przed wyczerpaniem istniejącego budżetu czasowego rozpoczynania wycen, ale odpowiedź przyszła później. Nie zwiększano deadline ani nie dodawano anulowania trwających wywołań.

Dodatkowy profil Sewery: 24427 ms, 81 połączeń, ta sama suma. Około 23055 ms próbek CPU stanowiło oczekiwanie, więc nie potwierdzono hipotezy o istotnym koszcie parsowania HTML. Nie dodano spekulacyjnego cache parsera.

To mała seria, bez losowania kolejności i bez rozkładu p50/p95; wpływ sieci, połączeń i czasu odpowiedzi sklepu pozostaje. Nie wolno z niej deklarować ogólnego przyspieszenia o 60% ani gotowości na duży ruch. Przed kolejną próbą potrzebne są powtarzane, naprzemienne pomiary, kontrola liczby wywołań i brak pogorszenia pozostałych dostawców.

## Weryfikacja eksperymentu

- **1883 unikalne testy PASS**, zero pominiętych: mobile 508, silnik wycen 194, API/adaptery/relay 117, wspólny backend 1064. Powtórzeń w brudnym/izolowanym checkout i podzbiorów nie doliczano. Typecheck mobile/API i build pricing PASS.
- Sześć nowych regresji obejmowało kolejkę, odrzucenie, stabilną kolejność, współdzielony limit i deduplikację, prawdziwe podziały ilościowe/produktowe oraz produkcyjne sprawdzenie deadline po oczekiwaniu. Są zachowane na gałęzi eksperymentalnej.
- **14 rzeczywistych natywnych przypadków PASS**: cztery taśmy u obu dostawców, dwa kody pocztowe Sewery, porównanie sklepów, łączenie ilości pokoi, próg jednej rolki i wcześniejsze regresje Mapegum/Primer/braku jednego sklepu.
- **62 lokalne scenariusze przeglądarkowe PASS** na przygotowanym eksperymentalnym API i niezmienionym wydaniu WWW: 31 koszyka, 3 rzeczywistego kalkulatora hydroizolacji, 15 wyboru jednego/wielu sklepów, 13 czterech taśm. Brak błędów stron i HTTP 429. Kontrole obejmują zdjęcia, kopiowanie planu, backup/odtworzenie, ilości, klawiaturę oraz mobilny widok PL 390 px bez przepełnienia. To automatyczne QA, nie testy z klientami.
- Snapshot poprzedniej produkcji: 150 plików i 341 obserwacji; przygotowany eksperyment zmieniał wyłącznie bundle, zachowując pozostałe 149 plików i wszystkie obserwacje. Samo przygotowanie paczki nie oznacza wdrożenia.

Nie uruchamiano publicznej pełnej regresji wave170, ponieważ nie wdrożono tej wersji. Nie przypisywać do niej publicznych wyników wave169.

## Produkcja pozostaje na wave169

[Aplikacja](https://asystent-remontu-web-production.up.railway.app). WWW `42fd74d2f6a5fdf7e7e73e996292142512141918`, wdrożenie `36f2c4f6-c455-4a79-bd3d-fe1f26bfbd4e`. API `955a75a0-0d30-468c-a256-5ef2fc56e91f` nadal SUCCESS w odczycie Railway; SHA256 bundle `abb59a21eb271540d799607605ed31bd20df508811a3ff9ac51e39f77b7cf4e7` potwierdzony snapshotem o 15:56 UTC / 16:56 czasu Warszawy. O 16:02 UTC / 17:02 czasu Warszawy oba endpointy zdrowia miały HTTP 200, WWW zwróciło oczekiwany commit. Nie tworzono PR wspólnego backendu ani nowego wdrożenia wave170.

## Stan do kontynuacji

Dowody i zamrożone artefakty: `G:/Projekty/asystent-remontu-work/wave170-20261101`. `DO_NOT_DEPLOY.txt` i `disposition.json` oznaczają eksperyment wstrzymany. Nie uruchamiać ponownie initializerów ani publikować katalogu prepared jako kolejnego wydania.

Nowy kierunek po pytaniu właściciela opisuje [plan biznesowy i walidacja](kierunek-biznesowy-i-walidacja-2026-11-01.md): kompletne ścieżki, pomiar zakupów, rzeczywiste badania klientów, afiliacja i osobny pilotaż wykonawców. Stały cel rozwoju aplikacji pozostaje aktywny. Brak nowych produktów i sklepów w tej partii; wcześniejsze 33 braki katalogowe i ograniczenia pełnych wycen Castorama/OBI nie zostały usunięte.
