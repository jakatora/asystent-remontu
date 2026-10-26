# Krzyżyki zgodne ze spoiną i rzeczywistą paczką — 2026-10-26

## Zmiana widoczna dla kupującego

Dodano osobne produkty Hardy 3 mm / 150 sztuk (EAN 5905061016869) i 4 mm / 100 sztuk (EAN 5905061016876), oba po **3,46 zł brutto za woreczek w Sewerze**. Wycena projektu i koszyka dobiera teraz szerokość według obmiarów, także bez zmiany modelu płytek. Zachowano wcześniejszy produkt 2 mm / 200 sztuk z jego osobnym EAN.

Przykład dla 10 m² płytek 30×30 cm: istniejąca formuła szacuje 223 krzyżyki. Dla 3 mm kupuje się 2×150 sztuk za **6,92 zł**, a dla 4 mm — 3×100 sztuk za **10,38 zł**. Pełne opakowania liczone są po zsumowaniu zapotrzebowania remontu. To szacunek ilości według dotychczasowej formuły, nie indywidualny plan rozmieszczenia dystansów.

## Zweryfikowane źródła

| Produkt | Bieżąca oferta / tożsamość | Drugie niezależne źródło dokładnego EAN |
|---|---|---|
| Hardy 3 mm, model 2040-660030, 150 sztuk | [Sewera](https://sklep.sewera.pl/krzyzyki-dystansowe-3mm-150szt--p12505), HTML odczytany 2026-10-26T20:27:17.254Z | [Mrówka](https://mrowka.com.pl/produkt/krzyzyki-dystansowe-3-mm-150-szt-hardy-5905061016869.html) |
| Hardy 4 mm, model 2040-660040, 100 sztuk | [Sewera](https://sklep.sewera.pl/krzyzyki-dystansowe-4mm-100szt--p12506), HTML odczytany 2026-10-26T20:27:18.347Z | [Bricomarché](https://www.bricomarche.pl/krzyzyki-dystansowe-do-glazury-4-mm-biale-woreczek-100-sztuk-hardy), [Plus-Market](https://www.plus-market.pl/pl/p/Krzyzyki-4mm-op.-100szt/15198) |

Nie dodano orientacyjnej ceny Mrówki ani niepotwierdzonej nowej oferty Plus-Market. To niezależne potwierdzenie tożsamości/zdjęć. W Sewerze OPA oznacza całe opakowanie. Parser wymaga zgodnej ceny brutto, dodatniego stanu w OPA, kodu, marki, szerokości i liczby sztuk. Zmiana samego napisu 3 mm na 2 mm jest odrzucana nawet przy pozostawionym EAN. Bez osłabienia ogólnego parsera.

Ogląd rzeczywistych ilustracji wykazał, że zdjęcia Sewery przedstawiają wiaderko. Mobile używa sprawdzonych zdjęć woreczków: 3 mm z karty Mrówki (495×628), 4 mm z karty Plus-Market (288×366, widoczna etykieta 4 mm / 100 sztuk). Oba zdjęcia załadowały się w aplikacji. Obserwacje backendu zachowują oryginalne zdjęcia sklepu jako część dowodu; mobilna warstwa zdjęć preferuje przeglądnięte URL-e dla dokładnego EAN. Nie pobierano plików graficznych do repo ani nie generowano ilustracji produktu.

## Naprawione błędy ilości i zgodności

1. Mapowania prac zawsze wskazywały krzyżyki 2 mm. Wybór referencji teraz uwzględnia `groutWidthMm`, we wszystkich poziomach materiałów. Domyślne 3 mm dla podłóg/ścian wynikają z istniejących pomiarów; kuchenny job jawnie definiuje 2 mm. Nie zmieniono ID prac lub pól.
2. Prace podłogowe i ścienne nazywały wynik formuły `crosses` opakowaniami, choć formuła liczyła sztuki. Poprawiono jednostkę definicji na `szt` i jednostkowy szacunek ceny. W starszym snapshotcie `opak.` jest interpretowane jako wynik w sztukach wyłącznie dla znanej pary job/ID i formuły `crosses`. Nie mnożymy 223 przez arbitralny rozmiar paczki; zapisany JSON pozostaje bez zmian.
3. Dopasowanie po typie `tile-spacer` dociera do wyceny lokalnej i HTTP. Ilość nie jest gubiona przez niezgodną historyczną jednostkę. Poprzednia ręczna cena modelu 2 mm nie przenosi się na nowy EAN.
4. Niezweryfikowana szerokość (np. 2,5 lub 5 mm) pozostaje bez ceny. Niejednoznaczna ilość w opakowaniach bez znanej formuły również nie staje się liczbą sztuk. Pozostaje jawna pozycja do uzupełnienia, bez starego EAN lub GTIN.
5. Zmiana modelu płytek przelicza krzyżyki według nowego formatu i tej samej szerokości spoiny. Nie przywraca pozycji „Mam/Kupione”, nie nadpisuje obmiarów ani dodatkowych pozycji o innym pochodzeniu.

Nie wykonano migracji wszystkich historycznych wierszy Shopping lub starych lokalnych kosztów snapshotów. Wyceny cenowe korzystają z poprawnej ilości; dawne lokalne wyniki mogą wymagać ponownego przeliczenia projektu. Pozostają osobne tematy zgodności kleju/fugi w kuchni i pełnej instalacji umywalki.

## Dowód rzeczywistej dostawy i porównania

Rzeczywisty HTTP produkcji, zapotrzebowanie z aktualnego kalkulatora: po 223 sztuki obu szerokości → 2 paczki 3 mm i 3 paczki 4 mm, materiały **17,30 zł**. Natywny anonimowy koszyk Sewery dla kodu **00-001** potwierdził **19,90 zł** (Kurier InPost do 5 kg, płatność online, wysyłka z Katowic), razem **37,20 zł**. Odczyt 2026-10-26T20:40:02.261Z, ważność do 2026-10-26T20:50:02.261Z. To wycena tego koszyka i kodu, nie ogólna taryfa dla dowolnego remontu. Bez danych klienta i złożenia zamówienia.

W prawdziwym UI dopisano wyłącznie dwie własne pozycje testowe po 223 sztuki. Przy wcześniejszych trzech pracach otrzymano siedem produktów i sumę **654,73 + 153,40 = 808,13 zł** dla najlepszego potwierdzonego podziału zamówień. Część Sewery obejmowała SAM100 i oba nowe produkty: **58,71 + 37,90 = 96,61 zł**. Fracht jest liczony razem z podkładem, nie jako osobna paczka krzyżyków.

Wybranie Sewery jako jedynego sklepu pokazało **556,83 zł za dostępną część** (6 z 7 produktów). Brak Knaufa nie został ukryty ani doliczony po fikcyjnej cenie. Wybór sklepu oraz dodatki przetrwały pełny reload. Przywrócono „Najtańszy zestaw” i usunięto tylko własne dwa dodatki. Końcowy stan kontrolny: trzy prace, Standard, jedna posiadana pozycja, 00-001, dostawa, bez dodatków i preferowanego sklepu, **637,43 + 153,40 = 790,83 zł**. Bez tworzenia/usuwania projektów i zmian obmiarów.

Z perspektywy kupującego zauważono ważny problem UX: brak tego samego Knaufa z dwóch prac jest wyświetlany jako dwie oddzielne karty, mimo porównania siedmiu unikalnych produktów. Dowód `outputs/catalog34-duplicate-unpriced-before-20261026.png`. Kolejny krok: łączyć takie braki wraz z ilością i liczbą prac oraz uprościć pokazanie kosztu zestawu w sklepie. Tego problemu nie przedstawiamy jako już naprawionego.

## Walidacja, wdrożenie i stan celu

**1514 testów PASS, 0 skip**: 460 core/kalkulator/pricing/API + 1054 wspólnego backendu szeregowo (144884,9048 ms). Testy importują aktualny kalkulator, mapowania i kod produkcyjny. Obejmują trzy prace, trzy szerokości, dawne jednostki/GTIN, ręczne ceny, filtr posiadanych produktów, zmianę formatu i rzeczywiste HTTP z łączeniem pomieszczeń. Mobile/API typecheck PASS. 66 chronionych ID i negatywne mutacje PASS. Bez zmian migracji, rich/legacy i manifestów; obce zmiany poza commitem. Nie doliczamy testów DB z poprzednich fal.

Świeża migawka wspólnego backendu: 148 plików, SHA256 `dba0356b2025554e116572672895d2667d9f9aefe8f6fd54cfd32a0ef023a480`. Wszystkie 130 wcześniejszych obserwacji zachowane bez zmian + 2 = 132 (2 Rodimax nadal wyłączone). Zmieniono wyłącznie bundle cen remontu i jego obserwacje. Brak driftu sprawdzony 2026-10-26T20:37:51.222Z. Source `55eee71a2a638b49cc414564c6fee11120abbfd0`, [PR38](https://github.com/jakatora/przetargai/pull/38) scalony i przypięty, merge `825ffec2000fc0a2a40261fbe27954a1328b83c8`. Checks/statuses były puste. Railway `93a12af2-913e-4d4c-8938-5070c42436f3` SUCCESS 2026-10-26T20:39:14.565Z. Bez nowego serwera lub binarek mobilnych.

Produkcja potwierdzona 2026-10-26T20:44:46.795Z: **103/109 referencji z przynajmniej jedną ofertą, 6 wcześniejszych braków, 130 aktywnych ofert, 38 sklepów/punktów, 22 ręczne obserwacje, 20 integracji dostaw**. Nowe produkty automatycznie odczytane poprawnie 20:39:49.614Z i 20:39:50.803Z, bez błędów; collector running:false. `/health` 200 i `/auth/me` 401. 109 zdjęć oznacza URL-e, a nie jednoczesną kontrolę wszystkich. Castorama/OBI nadal wymagają rzeczywistego dostępu do wycen dostawy.

Dowody w katalogu rozmowy: `work/catalog-wave34-{local-live,production,collector}-proof.json`, logi `work/catalog-wave34-{core-tests,shared-tests}.log`, oryginalne HTML w `work/catalog-wave34-research/`, AX `outputs/catalog34-{spacers-before-deploy,spacers-mixed-basket,sewera-selected,sewera-reloaded,basket-restored}-20261026.txt` i screenshot `outputs/catalog34-spacer-prices-20261026.png`.

Cel pozostaje aktywny. Zaktualizowany cel użytkownika szczególnie podkreśla łatwą obsługę i zobaczenie ceny potrzebnego zestawu w każdym wybranym sklepie, z opcją bliskiego odbioru. Pokrycie katalogu nie jest dowodem ukończenia całego tego przepływu.
