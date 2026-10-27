# Naprawa ścian, szpachlowanie i wspólne materiały — 2026-10-27

Naprawiono obliczenia wall-repair i skim-coat. Taśma zbrojąca nie jest już wyliczana z m² ściany, masa naprawcza nie jest stałym 0,5 kg na każdy m² całej ściany, a dwa rodzaje papieru nie są jedną nieokreśloną pozycją. Nowy model wall-finishing-v1 łączy wybrany produkt, fizyczny obmiar i pełne opakowania dopiero na poziomie wspólnego koszyka.

## Produkty i niezależne źródła

- **ACRYL-PUTZ ST10 START 5 kg**, EAN 5903973104414: [Sewera 17,90 zł](https://sklep.sewera.pl/acryl-putz-st10-start-gladz-szpachlowa-sypka-5kg-p13308) i [Rab-Dom 20,80 zł](https://www.rabdom.pl/pl/p/SNIEZKA-ACRYL-PUTZ-ST10-Gladz-szpachlowa-START-FINISZ-5kg/1882). [Producent](https://www.acrylputz.pl/produkty/gladzie-sypkie/acrylputz-st10-start) potwierdza postać sypką, opakowania 2,5/5/20 kg i około 1 kg/m²/mm. Istniejący ST10 20 kg EAN 5903973104421 pozostaje odrębny; użytkownik wybiera 5 lub 20 kg, a wszystkie trzy tiery zachowują ten wybór. Nie udajemy automatycznego porównania wszystkich wielkości opakowań, w tym nadal niepodłączonego 2,5 kg.
- **Klingspor PL 28 C**, pojedyncze suche arkusze 230 × 280 mm: [P120, EAN 5907560017644, 1,67 zł](https://sklep.sewera.pl/papier-scierny-gr-120-arkusz-230x280mm-p6899), [P150, EAN 5907560023553, 1,67 zł](https://sklep.sewera.pl/papier-scierny-gr-150-arkusz-230x280mm-p6900), [P240, EAN 5907560039820, 1,49 zł](https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903). [Karta producenta](https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c) oraz [jego sklep](https://sklep.klingspor.pl/arkusze-na-podlozu-papierowym/57-pl-28-c.html) potwierdzają szlifowanie drewna, farb, lakierów i szpachli, gradacje i wymiary. Nie podmieniono na wodny PS8A, krążek 225 mm K180 ani rolkę sprzedawaną na metry. Sprzedaż Sewery SZT jest potwierdzona osobno od zbiorczego opakowania producenta 50 arkuszy.
- **Blue Dolphin FSH 48 mm × 20 m**, EAN 5907758504369: [Sewera 6,26 zł](https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044), [Realbud 8,00 zł](https://realbud.com/Bandaz-z-wlokna-szklanego-8-cm-x-20-m). [Grupa PSB](https://www.grupapsb.com.pl/produkt/tasma-antyrysowa-48-mm-x-20-m-blue-dolphin-5907758504369.html) potwierdza EAN, 48 mm i 20 m oraz zastosowanie do stabilnych rys/ubytków. Mylący slug Realbud ma 8-cm, ale główne dane i rzeczywiste API produktu 7826 potwierdzają 48 mm, właściwy EAN i 20 m; nie przypisano innej szerokości.
- Klocek do ręcznego szlifowania ma oddzielną pozycję narzędzia, bez zmyślonej ceny. [Bosch](https://www.bosch-professional.com/pl/pl/klocki-szlifierskie-zapiecie-na-rzepy-2868585-ocs-ac/) oraz [karta NTS u dystrybutora](https://intercars.pl/produkty/9e076f-klocek-szlifierski-do-recznego-szlifowania-130-x-70mm-260101) potwierdzają ręczne podparcie/mocowanie papieru. Zwykły PL28C wymaga owijania lub zacisków; sam rzep potrzebuje innego podkładu. Klocek i pozostałe narzędzia nadal wymagają ofert, nie są ukryte w cenie materiałów.

Każda nowa oferta pochodzi z rzeczywistego głównego Product/API, z potwierdzeniem EAN, marki, wariantu, jednostki i brutto. Pierwszy odczyt arkuszy został odrzucony: fizyczne 1 szt. nie występuje w nazwie karty, a PL28C jest w opisie. Użyto jawnej kontroli gradacji/wymiarów oraz packageDescription PL 28 C, bez rozluźniania parsera. Pięć dokładnych zdjęć zwraca 200 image/webp.

## Obmiary i historia projektów

wall-repair zachowuje wallArea jako powierzchnię do gruntowania, dopuszcza także małe naprawy od 0,001 m². Osobne repairArea i średnia repairDepthMm dają suchą masę = m² × mm × 1 kg/m²/mm × zapas. Powierzchnia napraw nie może przekroczyć deklarowanej powierzchni. TapeLength mierzy się osobno, domyślnie 0 dla samych otworów; jawny zapas domyślnie 10% dotyczy masy i taśmy.

skim-coat zachowuje wallArea i layers, dodaje grubość jednej warstwy 1–3 mm. Zamiast mieszać gotowy Atlas GTA z założeniem dla sypkiej masy, porównuje jawnie wybrany ST10. Grunt podłączono do właściwego Knauf Universalgrund 5 l EAN 5901793357737; usunięto mylący opis koncentratu Dragon. Odrębne zużycie gruntu pozostaje edytowalne, domyślnie 0,15 l/m². Nie jest to deklaracja jednego certyfikowanego systemu różnych producentów; podłoże i zgodność wymagają kart produktów.

P120 w naprawie/P150 w szpachlowaniu oraz opcjonalny P240 mają niezależne całkowite liczby arkuszy, w tym 0. Nie wymyślono m²/arkusz. P240 jest domyślnie 0, bo ST10 zaleca gradację 100–150; użytkownik może go dobrać do dalszego wykończenia. Instrukcje podają suche podłoże zamiast zwilżania wodą, typową warstwę 1–3 mm i do 30 mm tylko w pojedynczych ubytkach.

Aktualny PDF ST10 (2026-08-28) ma sprzeczne proporcje wody: tekst 0,47–0,52 l/kg, tabela 0,4 l/kg; starszy poradnik 0,3 l/kg. Dlatego aplikacja nie wybiera jednej sprzecznej proporcji i odsyła do etykiety bieżącej partii. Zużycie suchej masy około 1 kg/m²/mm jest zgodne w źródłach. PDF: https://karty-techniczne.sniezka.pl/pl/%C5%9ANIE%C5%BBKA_ACRYL-PUTZ%C2%AE_ST10_START_G%C5%81AD%C5%B9_SZPACHLOWA_2_W_1_START___FINISZ.pdf

Starszy JSON bez nowego modelu jest jedynie projekcją odczytu: masa, taśma i obie gradacje wymagają potwierdzenia; brakujący drobny papier jest jawny. Nie zmieniono zapisów użytkownika ani migracji. Nowy model rozpoznaje poprawny grunt w obu pracach, bez regresji siedmiu wcześniejszych gruntów. Oba kalkulatory, pricing i getRequiredQuantity zachowują surowe ilości. Mam/Kupione wymaga dokładnego modelu, jednostki i wystarczającej surowej ilości (1,2 kg pokrywa 1,1 kg; 1 kg nie). Inny rozmiar opakowania wymaga ponownego potwierdzenia, nie cichej zamiany. Materiały obu prac pozostają jednorodne legacy; 66 job IDs i istniejące measurement IDs zachowane.

## Rzeczywiste dostawy i wspólny koszyk

Produkcja HTTPS 2026-10-27T03:25:25.781Z, testowy kod 00-001, bez złożenia zamówienia lub płatności.

Sewera: rzeczywisty odczyt oddziałów wykazał taśmę FSH 0 szt. w Katowicach i Gliwicach oraz 32 w Tarnowskich Górach. W Gliwicach pozostałe cztery nowe produkty także miały 0; Katowice i Tarnowskie mają ich odrębne zapasy. Krajowy zbiorczy stan nie staje się dostępnością dowolnej placówki. Dostawę taśmy z Katowic prawidłowo odrzucono; dodana oferta Realbud pozwala zrealizować pełny zakup bez zmiany tego zabezpieczenia.

Przykład naprawy: ściana do gruntowania 10 m², naprawy 0,5 m² × 2 mm, 3 m rys, 10% zapasu, P120 2 arkusze i P240 1 arkusz. Popyt: 1,1 kg ST10, 3,3 m taśmy, 1,5 l gruntu i osobne arkusze. Kupujemy 1×5 kg, 1×20 m, 1×5 l, 2×P120 i 1×P240.

| Koszyk | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Realbud: taśma i grunt | 51,92 zł | 25,00 zł | 76,92 zł |
| Sewera: ST10 5 kg i dwa rodzaje papieru | 22,73 zł | 19,90 zł InPost do 10 kg | 42,63 zł |
| Cała naprawa | 74,65 zł | 44,90 zł | **119,55 zł** |
| Dwie takie naprawy razem | 79,48 zł | 44,90 zł | **124,38 zł** |
| Naprawa + szpachlowanie 10 m², 2×1 mm, wybrane ST10 5 kg | 151,08 zł | 48,90 zł | **199,98 zł** |

Dwie naprawy zużywają 2,2 kg masy i 6,6 m taśmy: nadal po jednym worku/rolce i jednym kanistrze, a arkusze podwajamy. Oszczędność 114,72 zł względem dwóch osobnych 119,55 zł. Dwie różne prace łączą 23,1 kg ST10 w 5 worków po 5 kg, 3 l gruntu w jeden kanister, zachowują odrębne P120/P150 i 2×P240. Osobno kosztują 306,70 zł, razem 199,98 zł; oszczędność **106,72 zł**, również dzięki wspólnej dostawie InPost do 30 kg. ST10 20 kg w tym samym szpachlowaniu daje 2 worki/40 kg i paletę; pełny wynik 356,29 zł. Nie podstawiono 20 kg za świadomie wybrane 5 kg.

Wybór tylko Sewery jest niepełny (brak oferty gruntu): best=null, komunikat o brakującej pozycji; 28,99 zł to część materiałów bez dostawy, a nie pełny koszt. Online pickup 64,47 zł nie jest potwierdzeniem lokalnej ceny, stanu, odległości ani kosztu dojazdu. Realbud podaje aktualną taryfę krajową realnego koszyka, Sewera wycenę dla kodu. Nie wszystkie kombinacje/sklepy mają wycenę, więc 119,55 zł to najlepszy potwierdzony zestaw, nie gwarancja całego rynku.

## Weryfikacja i pozostały zakres

548 testów kalkulatora/pricing/API PASS, 1054 shared-backend PASS, 0 skipped; mobile/API typecheck i legacy66 z negatywnymi mutacjami PASS. Dowód pieniędzy: rzeczywiste natywne koszyki przez przygotowany bundle HTTP i produkcyjny HTTPS, potem UI. Nie wywoływano płatnego AI, Stripe ani płatności.

Backend PR https://github.com/jakatora/przetargai/pull/46; head 2cbc09f3c0b9647d57e8c2cfd0b676cff2b31f53, merge 10773ce78069f62f3eaede89f327d3fca01b0875. Railway b614527e-8c44-455c-88cf-ef5cbb43e9dc SUCCESS 2026-10-27T03:21:37.904Z. Świeży baseline SHA256 31c8e698ccb46971a4131126e244666006d1bfb596d49b3c40ba3ab3d7320c9d. Przed wdrożeniem wszystkie 148 plików produkcji bez driftu, zmieniono tylko 2 pliki Remontu; 142 stare obserwacje zachowane, teraz149. Po wdrożeniu rzeczywiste SHA148 pasują do przygotowanego release. /auth/me401 bez tokenu. GitHub statuses puste, nie jest to potwierdzenie CIgreen.

Katalog115/121 z ofertą, 147 aktywnych ofert, 149 obserwacji, 2 wyłączone, 38 sklepów, 121 URL zdjęć. Audyt tych samych 65 Standard/66 prac: **71/229 wierszy wycenionych, 158 bez wyceny, 10 pełnych scenariuszy**. Poprzednio69/230/161/9. Różnica liczby wierszy: dawny area-based tape pominięty dla jawnego domyślnego0; P240 także domyślnie0, brak repairArea pozostaje do ustalenia. Nie wymyślono powierzchni napraw, żeby podbić wynik audytu. Pełna jawna naprawa5pozycji testowana osobno. 158 to nie liczba unikalnych SKU.

Pełny cel pozostaje aktywny: pozostałe receptury i warunkowe akcesoria/narzędzia, materiały do ościeżnic, poprawne systemy GK (CW/UW nie CD/UD), dalsze wielkości opakowań i wybór całych koszyków, lokalne ceny/stany, Castorama/OBI dostawa, ABUD transport cloud i prostszy kreator. Nie uznawać 115/121 lub10scenariuszy za ukończenie aplikacji.

Dowody w katalogu czatu work/catalog-wave47-{production,local,collector,predeploy-baseline,deployed-files,legacy-mutation}-proof.json oraz core/shared-tests.log, catalog-wave47-research/ z odczytami HTML/API i branch-stock.json. Własny projekt QA proj_mvq4e154y3q85prne, „Test kompletu — naprawa 0,5 m², 3 m rys i dwa papiery”; wcześniejsze13projektów zachowane. UI ma5zdjęć, sumę119,55, dwie dostawy i właściwe produkty sklepów, ostrzeżenie Sewera częściowa i zapisane obmiary w edytorze. Zrzuty outputs/catalog47-repair-{complete,total}-20261027.png i pełne odczytyAX.

## Spójność karty Zakupy i końcowy odczyt UI

Podczas testu znaleziono dodatkowy rzeczywisty błąd: purchaseSummary wymagał status=compared, a backend poprawnie zwraca needs_delivery_costs dla niewycenionych konkurencyjnych kombinacji mimo obecnego pełnego best. Ekran Gdzie najtaniej pokazywał119,55zł, ale Zakupy mówiły o braku dostawy i64,47zł. Podsumowanie teraz akceptuje potwierdzony best przy tym statusie, wymaga braku luk, prawidłowych kwot i bieżących źródeł/terminów; nadal pokazuje ograniczone porównanie rynku. Bez best, przy brakach lub niepotwierdzonym źródle nie ma pełnej sumy. Regresja jednostkowa plus świeży produkcyjny HTTP i rzeczywisty UI potwierdzają74,65+44,90=119,55zł także w Zakupach. Dowody catalog-wave47-purchase-summary-proof.json oraz outputs/catalog47-shopping-total-fixed-20261027.{txt,png}.

Lista własnego QA:5materiałów+3narzędzia,0z8kupionych. Lista projektów potwierdza14łącznie i13poprzednich. Wspólny koszyk nadal ma dokładnie3wcześniej wybrane prace, Standard i00-001; nowa naprawa jest dostępna jako niewybrana opcja. Nie zmieniano tego wyboru. Brakujący obmiar starego gruntu pozostaje jawny. Edytor zachował0,5m²,2mm,3m,5kg,2×P120,1×P240,zużycie0,15; Anuluj bez zapisu. HMR po zmianie modułu wrócił do Start; nie restartowanoExpo, ponownie otwarto zapisany QA. Nie jest to dowód utraty kodu/obmiarów.
