# Tapetowanie: taśma z obmiaru i cena całego zamówienia

Wave61, 2026-10-27. Dodano wycenę wcześniej nierozpoznawanej pozycji taśmy w recepturze tapetowania. To wykorzystanie istniejącego, dokładnego produktu i trzech ofert; liczba SKU nie wzrosła.

## Problem i zmiana

Dotychczas ogólna formuła przypisywała trzy rolki do 10 m² ścian. Powierzchnia nie mówi, jak długie są listwy, ościeżnice i inne krawędzie wymagające zabezpieczenia. Nowe pole „Taśma do zabezpieczenia — łączna długość” przyjmuje obmiar w metrach. Rolka Blue Dolphin niebieska 30 mm × 50 m, EAN5907758515952, jest dobierana po zsumowaniu długości z kilku prac. Dwa pomieszczenia po 20 m wymagają jednej rolki; 51 m dwóch.

Brak długości pozostawia pozycję niewycenioną. Jawne 0 oznacza brak potrzeby zakupu i usuwa tę pozycję z zapytania. Kalkulator nie podstawia zera za niewiadomą. Taśma wymaga zgodności z zabezpieczaną powierzchnią; nie jest automatycznym wyborem do świeżej lub delikatnej tapety.

Źródła wymiarów i zastosowania: [producent Blue Dolphin](https://sklep.bluedolphin.pl/pl/p/Tasma-malarska-Blue-Dolphin-niebieska-30mm-x-50m/631), [niezależna oferta Sewery](https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966). Oba adresy zwróciły HTTP200. Usunięto odziedziczone odsyłacze do innej taśmy Tesa25mm z tej konkretnej pozycji, zachowując właściwą tożsamość, zdjęcie i ofertę 30mm.

## Potwierdzone rzeczywiste koszyki

Produkcja HTTP i natywne anonimowe koszyki, testowy kod00-001. Kwoty brutto odczytane 2026-10-27; nie są stałą obietnicą przyszłej ceny.

| Zakres | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| 40m taśmy, jedna rolka, Rab-Dom | 11,99 zł | 10,50 zł | 22,49 zł |
| Jedna rolka, wybrany Buduj24 | 11,35 zł | 15,00 zł | 26,35 zł |
| Jedna rolka, wybrana Sewera | 14,72 zł | 19,90 zł | 34,62 zł |
| 51m taśmy, dwie rolki, Rab-Dom | 23,98 zł | 10,50 zł | 34,48 zł |
| Dwa pokoje: 40m taśmy i 200g Direct, po jednej paczce | 36,93 zł | 29,50 zł | 66,43 zł |

Tańsza sama rolka w Buduj24 daje droższe zamówienie niż Rab-Dom: różnica 3,86 zł po dostawie. W mieszanym koszyku taśmę kupuje Rab-Dom, klej Świat Się Klei. Taryfy Rab-Dom, Buduj24 i Świata są krajowe PL; Sewera potwierdziła koszyk dla00-001. Żadnych danych kontaktowych, pełnego adresu ani zamówienia.

Pełne tapetowanie z obmiarem taśmy i dobranym klejem ma nadal jedną niewycenioną pozycję: samą tapetę. Pełna suma pozostaje null. Bez długości taśmy są dwa braki. Nie ogłaszamy zamknięcia całego remontu na podstawie koszyka dwóch produktów.

## Czytelność i zachowanie danych

Etykiety przy produktach mówią teraz „Cena materiału” i „najtaniej za materiał”, a rozwinięte oferty odsyłają do podsumowania koszyka w sprawie całej dostawy. Wybrany sklep z najniższą ceną produktu nie jest w ten sposób przedstawiany jako zwycięzca z dostawą. Zaktualizowano PL/EN i wskazówkę edycji obmiarów.

Model wallpaper-supplies-v1 zachowuje poprawne gramy kleju i zużycie gruntu z poprzedniego modelu, ale historyczne rolki taśmy pozostawia do potwierdzenia. Podczas testu znaleziono błąd kolejności projekcji: ogólny przegląd gruntu mógł zmienić jednostkę przed porównaniem oryginalnego zapisu przez przegląd kleju/taśmy. Przeglądy tych materiałów otrzymują teraz oryginalną tożsamość i jednostkę. Nie przenoszą oznaczenia „Mam” między kg/g lub rolką/mb i zachowują wymóg potwierdzenia przy kolejnych odczytach. JSON w bazie pozostaje niezmieniony do edycji użytkownika. Migracje001–014 i identyfikatory prac/obmiarów zachowane.

## Walidacja

658 testów kalkulatora/pricing/API przeszło bez skipów, w tym rzeczywisty lokalny ExpressHTTP dla dwóch pomieszczeń, jednego opakowania i zachowanego wyboru Rab-Dom. Test wyceny adaptera w tym konkretnym regresyjnym przypadku używa zapisanej kwoty; niezależnie wykonano osiem rzeczywistych produkcyjnych wycen z natywnymi sklepami. Mobile/API typecheck oraz walidator66legacyjobs z trzema negatywnymi mutacjami przeszły.

Pierwszy produkcyjny probe błędnie oczekiwał zwycięstwa Buduj24 na podstawie niższej ceny produktu. Prawdziwe koszyki wykazały Rab-Dom22,49zł. Poprawiono oczekiwanie probe, zachowano dowód pierwotnej porażki; nie zmieniano algorytmu do oczekiwanej nazwy sklepu.

W aplikacji użyto istniejącego własnego QAprojektu proj_mvqqwfr7dc4ee0yxk: pole20m, zdjęcie konkretnej taśmy, trzy oferty, jedna rolka i tylko jeden brak. Jawne0 pomija taśmę. Przywrócono20m. Bez tworzenia nowych projektów, edycji cudzych projektów i restartu Expo8082.

Backend bundle po zbudowaniu ma ten sam SHA co wdrożona wave60; nowe obmiary korzystają z istniejącego kontraktu i ofert. Railway nadal57ce355c-c148-486d-a88a-3704c51f358d SUCCESS. Nie wykonywano zbędnego wdrożenia ani ponownego kompletu1054testów współdzielonego serwera.

Świeży audyt zachował153referencje/129aktywnychproduktów/24luki,175ofert i47aktywnychsklepów. Te same65zapisane mapy obmiarów nadal84/240wycenione,156niewycenionych i8pełnychscenariuszy materiałowych: starym danym nie dopisano nowej długości. Przykłady z rzeczywistym obmiarem zapisano osobno.

## Nadal otwarte

Pełny katalog i pozostałe receptury, dostawy Leroy/Marbet oraz rzeczywiste pobliskie stany/ceny nie są zakończone. Dla tapety podkładowej AS2000-13/EAN4000776200013 nadal występuje rozbieżność100/106cm. [HORNBACH](https://www.hornbach.de/p/renoviervlies-malervlies-2000-13-meistervlies-proprotect-145-g-m-25-m-x-1-m/5750755/) nazywa wariant1×25m; [aktualny opis grup produktów producenta](https://www.as-creation.com/rat-hilfe/tapetenberatung/ueberstreichbare-tapeten) wymienia między innymi1,06×25m, lecz nie rozstrzyga dokładnego EAN. Nie utożsamiamy ogólnej grupy z konkretną rolką. Wskazany PDFtechniczny media.hornbach.de/hb/technicaldatasheet/as.46504113.pdf jest obecnie niedostępny także przy bezpośrednim pobraniu; nie został przeczytany i nie jest dowodem rozstrzygającym. Trzeba wybrać spójnie udokumentowany wariant oraz policzyć pasy z wysokością i docinaniem.
