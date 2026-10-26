# Płytki: wybór powierzchni, pełne paczki i ilość fugi — 2026-10-26

## Wynik i zakres

W wycenie projektu i wspólnym koszyku można jawnie wybrać model płytek, osobno na ścianę i podłogę. Potrzebne m² z zapasem pozostają bez zmian, a backend łączy zapotrzebowanie przed zaokrągleniem do pełnych paczek. Wybór koszyka nie nadpisuje projektu. Dodatek samych płytek nie tworzy automatycznie obmiarów ani chemii budowlanej.

Nowy produkt: `mat-tile-wall-tamara-white-25x40`, EAN `5907518303911`. Odczyt przeglądarką 2026-10-26T19:58:26.512Z potwierdził **59,97 zł brutto za paczkę 1,5 m² / 15 sztuk**, aktywną sprzedaż wysyłkową i zdjęcie. To cena paczki; 39,98 zł/m² nie jest ceną opakowania. Ręczne potwierdzenie wygasa 2026-10-27T19:58:26.512Z. Nie przeniesiono lokalnego stanu oddziału do ogólnopolskiej dostępności. Nie rozstrzygnięto sprzecznych mas w karcie; nie użyto ich do transportu.

Produkcja, potwierdzenie 2026-10-26T20:18:13.989Z: **101/107 referencji z co najmniej jedną ofertą, 128 aktywnych ofert, 38 sklepów/punktów, 22 obserwacje ręczne, 20 integracji dostaw**. 130 zarejestrowanych obserwacji zawiera 2 wcześniej wyłączone Rodimax. Sześć starych modeli nadal bez aktualnej potwierdzonej oferty: Facile 50, Toledo 2,22 m², Diall PE 20 m², Petro Grey gat. 2, Nati Bianco struktura, stare Archi 80 lewe. Nowe modele nie są aliasami tych produktów. 107 metadanych zdjęć oznacza zarejestrowane URL-e, nie sprawdzenie ładowania wszystkich zdjęć jednocześnie.

## Źródła i granice potwierdzenia

- [Castorama — dokładny EAN Tamara](https://www.castorama.pl/glazura-tamara-25-x-40-cm-white-1-5-m2/5907518303911_CAPL.prd): bieżąca oferta, opakowanie, przeznaczenie ścienne do wnętrz, format 25×40 cm, grubość 7,7 mm, biała gładka powierzchnia z połyskiem, brak rektyfikacji. Baza przeglądarkowa zachowuje niezmienione schema, AX i tabelę tego samego EAN.
- [Płoszaj — Tamara White Ceramika Color 25×40, gatunek 2](https://ploszaj-lazienki.pl/CERAMIKA-COLOR-Ps-TAMARA-WHITE-25x40-g-2-CC-PROMOCJA-p127859): niezależne potwierdzenie nazwy, marki i formatu kolekcji. **To nie jest potwierdzenie tego samego EAN ani gatunku**. Nie dodano jego ceny, stanu, palety 81 m² ani dostawy do naszego SKU. TODO: drugie niezależne źródło dokładnego EAN i parametrów; obecnie nie deklarujemy dwóch niezależnych kart technicznych dokładnego SKU.
- [Historyczny regulamin Castoramy](https://media.castorama.pl/media/regulaminy/2026/Regulamin%20200%20z%C5%82%20na%20kupon%20za%201000%20z%C5%82%20wydane%20na%20p%C5%82ytki%2018-23.02.pdf) potwierdza powiązanie EAN/nazwy/opakowania, ale nie jest niezależnym sprzedawcą ani aktualną ofertą.
- [Guigliano](https://www.castorama.pl/gres-guigliano-goodhome-18-5-x-59-8-cm-beige-1-m2/3663602870821_CAPL.prd), [Paradyż U117](https://www.castorama.pl/gres-play-paradyz-59-8-x-59-8-cm-grey-1-43-m2/5904584158261_CAPL.prd), [Petro Grey G2](https://taniaplytka.pl/produkty/paradyz-petro-grey-struktura-mat-600x600-2), [Nati Bianco](https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/): dane powierzchni, formatów i paczek do wyboru. Poprawiono historyczne paczki Petro na 1,44 m² / 4 szt. i Nati na 1,2 m² / 12 szt. Dawna cena za m² została przeliczona na paczkę z zachowaniem starej daty — nie powstała aktualna oferta.

Natywne JSON-LD Tamary nie zawiera marki. Import przeglądarkowy używa wtedy marki z osobno sprawdzonej tabeli tego samego EAN i odpowiadającego jej AX. Zachowuje oryginalne dowody. Jawna sprzeczna marka, brak tabeli lub zmodyfikowana tabela nadal odrzucają obserwację. Ogólnego parsera sklepów nie osłabiono.

## Materiały pomocnicze i poprawka fugi

Przed zatwierdzeniem UI opisuje zestaw **ATLAS PLUS oraz białą fugę ceramiczną ATLAS 001**. Po zatwierdzeniu w pracy przelicza tylko obecne pozycje kleju, fugi i krzyżyków według nowego formatu. Filtr „Mam/Kupione” działa wcześniej; nie przywracamy usuniętych z zakupu pozycji. Zgodność posiadanych produktów, profili i hydroizolacji nadal wymaga sprawdzenia.

- [ATLAS PLUS](https://www.atlas.com.pl/produkt/atlas-plus/): szacowanie dla równego podłoża według tabeli 25×40 / 60×60. Dla pośrednich rozmiarów stosujemy wyższą sprawdzoną kategorię, co jest naszym założeniem wyceny. Nierówności i metoda kombinowana mogą wymagać więcej kleju. Nie deklarujemy uniwersalnej zgodności każdego podłoża.
- [Fuga ceramiczna ATLAS](https://www.atlas.com.pl/produkt/atlas-fuga-ceramiczna-2/): geometria i gęstość 1650 kg/m³. Nowy helper sprowadza cm/mm do metrów. Usunięto błąd jednostek i zastępowanie większości wyników stałą 0,5 kg/m². Dla innej fugi potrzebna jej gęstość i karta. Domyślne 9 mm głębokości i 3 mm szerokości są jawnie nazwanymi założeniami.
- [Ceresit CM11 Plus](https://www.ceresit.com/products/tiling/product.html/ceresit-cm-11-plus/SAP_0201SAC013S4.html): nie utożsamiamy go ze zwykłym CM11 ani nie pozostawiamy nieweryfikowanego kleju przy dowolnym dużym formacie. Jawny wybór zestawu stosuje ATLAS PLUS.

Przykład bez zapasu: 10 m², płytki 30×30 cm, spoina 9×3 mm, 1650 kg/m³ daje **2,97 kg**, a 60×60 cm przy pozostałych danych bez zmian — **1,485 kg**. Surowe zapotrzebowanie nie jest zaokrąglane przed doborem paczek.

Wycenę starszych zapisanych wyników naprawia `getRequiredQuantity`, przeliczając fugę z zapisanych obmiarów. **Nie wykonano migracji historycznych wierszy zakupowych ani wszystkich lokalnych widoków starych obliczeń**; mogą wymagać ponownego przeliczenia projektu. Zapisane JSON i obmiary nie są mutowane.

Sprawdzony krzyżyk ma 2 mm. Dla innej szerokości UI/wycena pozostawia pozycję bez ceny z podaną szerokością. **Brakuje jeszcze zweryfikowanego produktu 3 mm**; nie podmieniamy go na 2 mm dla uzyskania pozornie kompletnej sumy.

## Walidacja

- 1506 testów PASS, 0 skip: 452 core/kalkulator/pricing/API + 1054 wspólnego backendu szeregowo. Nie doliczamy 10 testów DB z wave31, których ponownie nie uruchamiano.
- Mobile i API typecheck PASS; 66 chronionych ID oraz negatywne mutacje PASS. Bez zmian ID prac, pól pomiarów, migracji, rich/legacy i manifestów.
- Rzeczywisty HTTP gotowego bundle i produkcji: 4,8 m² Tamary → 4 paczki / 6 m² → 23988 gr. Test dwóch pomieszczeń 4,8+1,2 m² również kupuje 4 paczki, zamiast osobnego zaokrąglenia każdego pokoju. Historyczna Nati pozostaje nierozwiązana.
- Dostawa Tamary do 00-001: `needs_delivery_costs`, `best:null`, `retailer_access_required`. Automatyczny kolektor dostał HTTP 503; data ręcznej obserwacji nie została odmłodzona. Ceny produktu nie przedstawiamy jako potwierdzenia dostawy/odbioru.
- Prawdziwy UI: własny dodatek 4,8 m² Nati → jawny wybór Tamary → 239,88 zł / 4 paczki, rzeczywiste zdjęcie 501×800. Pełny reload zachował model i kwotę. Przywrócono wcześniejszy wybór i usunięto wyłącznie własny dodatek. Końcowy koszyk: 3 prace, Standard, 1 posiadana pozycja, 00-001, dostawa, bez dodatków/preferowanego sklepu, **637,43+153,40=790,83 zł**. Bez tworzenia/usuwania projektów lub zmiany obmiarów. Przeglądarka testowała wspólny koszyk; projektowy przepływ, dobór powierzchni i materiały pomocnicze sprawdzają testy kalkulatora.
- Odczytano logi po reloadzie. Nadal istnieją wcześniejsze ostrzeżenia rejestru i błąd konfiguracji dark mode; nie deklarujemy konsoli bez błędów ani ich naprawienia w tej zmianie.

Dowody pomocnicze: `work/catalog-wave33-{local-live,production,collector}-proof.json`, `work/catalog-wave33-{core-tests,shared-tests}.log`, `outputs/catalog33-{tile-before,tile-applied,tile-reloaded,basket-restored}-20261026.txt`, `outputs/catalog33-tile-price-20261026.png`. Są w katalogu roboczym rozmowy, nie w repo.

## Wdrożenie i dalsza praca

Świeża migawka 148 plików wspólnego serwera, SHA256 `b739dbc395e6994fbfabc9fdeec9153f3e4b44a083be5cc90c96bd49d899f5b3`. Zmieniono wyłącznie bundle cen remontu i jego obserwacje. Wszystkie 129 wcześniejszych obserwacji zachowano dokładnie. Brak driftu przed wdrożeniem: 2026-10-26T20:12:26.052Z.

Source commit `0433ad5aa3a90d6052de42ba994e1030ccc71063`, [PR37](https://github.com/jakatora/przetargai/pull/37), merge `85b0dafc6cefde1c8fe8ba5fa4124bab2473b5d1`. Checks/statuses były puste. Railway `bfe45bcc-dea3-4864-a335-41ff3d045858` SUCCESS, 2026-10-26T20:13:49.624Z. `/health` 200 i `/auth/me` 401 po wdrożeniu. Bez nowego serwera lub binarek mobilnych.

To postęp aktywnego celu. Do domknięcia: krzyżyki 3 mm i inne szerokości, potwierdzenie drugiego dokładnego źródła Tamary, zgodność fugi w kuchennych pracach wymagających epoksydu, komplet instalacyjny umywalki, stare zapisane listy, rzeczywiste dostawy Castoramy/OBI i potwierdzony odbiór w wybranej placówce. 94% pokrycia referencji nie oznacza 94% gotowości całego porównywacza ani kompletności rynku.
