# Łączniki krzyżowe — 2026-10-27

Do koszyka sufitu dodano dwa odrębne produkty ze zdjęciami. Nowe pole obmiarów `gypsumCrossConnector` pozwala wybrać Norgips (0, domyślnie) lub Budmat (1). Jest dostępne w kreatorze i edycji projektu. Inna marka wymaga potwierdzenia zgodności z projektem; aplikacja nie podmienia jej automatycznie dla niższej ceny. Ilości nadal wynikają z dotychczasowej normy wybranego rusztu dwupoziomowego. Nie zadeklarowano klasy ogniowej/akustycznej całej konstrukcji.

## Źródła i jednostki

- Norgips: EAN5907651696468, karton100szt., HIPPER produkt3071669325, jednostka3072059634, cena89,99zł brutto. Natywne `stockUnit=szt`, `quantityUnits=1` i stan3 dotyczą trzech kartonów, a nie trzech łączników. [Karta sprzedawcy](https://hipper.pl/lacznik-krzyzowy-60-x-145-mm-100-szt-norgips-3071669325), [karta producenta](https://norgips.pl/produkty/lacznik-krzyzowy-72.html), [zastosowanie w systemie dwupoziomowym](https://norgips.pl/rozwiazania/sufity-podwieszane/sufity-podwieszane-z-jednokrotnym-poszyciem-z-plyt-g-k-na-ruszcie-dwupoziomowym/sp-1x125-gkb-acd-60-es/). Katalog producenta indeksowany w wyszukiwarce rozróżnia GTIN kartonu100szt.6468 i jednostkowy9612. Bezpośrednie stare linki PDF obecnie404; nie są działającymi odsyłaczami. Opis HIPPER mówi błędnie o ruszcie jednopoziomowym, podczas gdy producent wskazuje dwupoziomowy. Karty podają też różną grubość0,7/0,8mm, więc nie zadeklarowano jej w nazwie nowej referencji. Guard jest ograniczony do sprawdzonego EAN/identyfikatorów/natywnej jednostki i wariantu100.
- Budmat: EAN5901323043369, jedno opakowanie sprzedawcy100szt., eBardo Shoper produkt138/stock138, SKU68-02, cena49zł brutto (nie39,84netto). [Karta sprzedawcy](https://ebardo.pl/pl/p/Lacznik-krzyzowy-GK-do-profil-CD60-100szt-BUDMAT-0%2C8mm/138), [producent —100szt.](https://www.budmat.com/pl/produkt/lacznik-krzyzowy-152), [niezależna karta tego EAN](https://dilbud.pl/sklep/systemy-mocowan/sucha-zabudowa/laczniki-do-profili-cd/budmat-lacznik-krzyzowy-do-profili-cd60-10szt/). Ostatnia strona oferuje10szt., nie100: ten sam EAN nie uprawnia do przeniesienia ceny/opakowania z innego sklepu. Tutaj używamy wyłącznie potwierdzonego opakowania eBardo100szt. Obraz obu produktów sprawdzony HTTP200 image.

## Dowód rzeczywistych zakupów bez składania zamówienia

Lokalny bundle i wdrożony API wykonują działania anonimowego koszyka. Nie przesyłają danych klienta, nie akceptują regulaminu, nie składają zamówienia i nie płacą. Kod00-001 jest przykładem QA. Koszyki sklepów zwracają stawki krajowe PL; nie opisujemy ich jako indywidualnej geograficznej taryfy dla kodu.

- Dwa sufity po10m²: zapotrzebowanie28+28=56łączników →1opakowanie100szt. Norgips89,99+kurier18,90=108,89zł. Budmat49+GLS25=74zł. W eBardo pominięto zajawkę paczkomatu18zł przy wycenie dostawy do domu.
- Różne marki w dwóch pomieszczeniach pozostają dwiema pozycjami; każda ma własne opakowanie i transport.
- Sufit120m² wymaga330łączników/4kartonów Norgips; przy natywnym stanie3 brak rekomendacji zakupu. Nie dzielimy tego samego SKU na zamówienia w celu obejścia magazynu.
- Wskazanie HIPPER dla wybranego Budmat pozostawia brak oferty. Aplikacja nie zmienia marki.
- Pełny sufit10m² ma nadal2braki: NorgipsCD600,6mm3m (brak aktywnej oferty) oraz stalowe kotwy stropowe (dobór/produkt do uzupełnienia). API `best=null`; UI jawnie komunikuje niepełną listę zamiast fikcyjnego pełnego kosztu.

Dowody: `work/catalog-wave56-local-proof.json`, `work/catalog-wave56-production-proof.json`, przechwycone natywne koszyki w `work/catalog-wave56-research/`. Aktualny audyt tych samych65obmiarów:84/240pozycje wycenione,156bezwyceny,8pełnych scenariuszy materiałowych. Katalog149produktów/zdjęć,125zofertą,164aktywneoferty,24braki. Wiersze kosztorysu nie są liczbą unikalnych SKU ani procentem gotowości aplikacji.

## Walidacja i wydanie

618testów core/calculator/API i1054testy backendu PASS,0skip. Typecheck mobile/API PASS; legacy66prac i3negatywne mutacje PASS. Nowe testy importują produkcyjny parser/kalkulator i rzeczywiste fixtures: karton kontra sztuka, cena brutto,100vs10, odmienne EAN/SKU, stan kartonów, anonimowe transporty, wybór marki w każdym tierze, oznaczenie „Mam” i nieprawidłowy wybór. Cztery nowe aktywne źródła HTTP200 bez ostrzeżeń. Błąd starego URL katalogu PDF poprawiony na działającą stronę producenta; komentarze są usuwane z bundla, bez zmiany wdrożonego kodu.

PR56 https://github.com/jakatora/przetargai/pull/56, head4fa26be117ee3a106bc06a0d62f59ff3f215b51b, merge9d04f52ab105f614b40f193e4972b8fbee445976. Railway4860962b-f1a1-4fdd-b5a1-83b0f5f93f9a SUCCESS. Świeży snapshot183obserwacji/148plików; zachowane183stareobserwacje i146pozostałychplików,185po dodaniu ofert.148/148wdrożonychplików ma SHA zgodne z review. GitHub nie zwrócił workflow/statusów CI; lokalne testy są odrębnym dowodem.

Cel wszystkich materiałów, pełnych zestawów z dostawą i rzeczywistej lokalnej dostępności pozostaje aktywny. Kolejne priorytety: profilCD60 i stalowe kotwy,24braki obecnego katalogu, pozostałe156wierszy i pełne wyposażenie winylu. Nie odnawiamy dat niepotwierdzonych cen.

## Odbiór interfejsu

Własny projekt QA `proj_mvqj35dlrykdtbczn` „Test kompletu — sufit 10 m², łączniki 100 szt.” utworzony przez kreator (19projektów,18pozostałych zachowane). Kreator i edycja pokazują wybór marki z opisem różnic. Jawny Budmat pojawił się w „Gdzie najtaniej” ze zdjęciem,49zł i1×100szt. Zmiana na Norgips przeliczyła kartę do89,99zł,1×100szt. i pokazała stan3opakowania. Po przeładowaniu wybór Norgips pozostał zapisany. Kod QA00-001 zachowany. Przy obu markach pełna wycena nadal sygnalizuje2braki. Nie zmieniano innych projektów ani wyboru projektów we wspólnym koszyku; Expo8082 nie restartowane.

Zrzuty `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/outputs/catalog56-budmat-product-20261027.png` i `catalog56-norgips-product-20261027.png`; AX `work/catalog56-budmat-product-ax.txt` i `catalog56-persisted-norgips-ax.txt`. Przeglądarka2/karta14 oznaczona deliverable. `/auth/me` bez tokena nadal401.
