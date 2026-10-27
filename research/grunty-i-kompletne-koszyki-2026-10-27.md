# Grunty w siedmiu pracach i rzeczywiste koszyki — 2026-10-27

Cel pozostaje pełny: potrzebne produkty, zdjęcia, wybór sklepów, kompletne sumy z rzeczywistą dostawą, pobliski odbiór z potwierdzonymi cenami i stanami oraz łatwy interfejs. Ta iteracja poprawia siedem receptur, nie kończy całej aplikacji.

## Materiały połączone z ofertami

| Praca | Dokładny produkt | Jednostka i widoczne założenie |
|---|---|---|
| Gruntowanie ścian | Ceresit CT 17 10 l, EAN5900089617081 | Wydajność2–10m²/l, domyślnie10; zgodna z zakresem0,10–0,50l/m² |
| Naprawa ścian | Knauf Universalgrund5l, EAN5901793357737 | Cała podana powierzchnia ściany ×0,15l/m²; zużycie edytowalne |
| Tapetowanie, historyczny IDwallpaper | Ten sam Knauf5l | Powierzchnia ×0,15l/m² |
| Tapetowanie, IDwallpaper-install | Ten sam Knauf5l | Powierzchnia ×0,15l/m² |
| Zrywanie tapet | Ten sam Knauf5l | Powierzchnia ×0,15l/m² |
| Płytki podłogowe | Ceresit CT17 10l | Jawne założenie0,20l/m², edytowalne0,10–0,50 |
| Wylewka samopoziomująca | ATLAS UNI-GRUNT5kg, EAN5905400520026 | Kilogramy kupowanej emulsji; założenie0,20kg/m², zakres0,05–0,20; bez utożsamiania litrów, kilogramów i dodanej wody |

Grunt nadaje się do wskazanych chłonnych podłoży; inne podłoże wymaga doboru. Wydajność jest założeniem do weryfikacji próbą na budowie, nie gwarancją. Wszystkie trzy poziomy cenowe zachowują ten sam sprawdzony typ gruntu. Nie dodano nowych SKU ani ofert; wykorzystano trzy już istniejące produkty, ich rzeczywiste oferty i zdjęcia. Ceny referencyjne kalkulatora są odrębne od bieżących sum sklepów.

Wylewka nie pytała wcześniej o obwód, mimo że receptura używała go do taśmy brzegowej. W rezultacie taśma mogła zniknąć jako0mb. Dodano wymagane poleperimeter; długość z obmiaru +jawny5% zapas. Brak obwodu pozostaje nieznaną pozycją, nigdy darmową taśmą.10m² pokoju2×5m daje14m obwodu i14,7mb zapotrzebowania, jedno opakowanie50mb. Powierzchnia nie wyznacza obwodu.

Nowy modelsubstrate-primer-v1 zachowuje surowe zapotrzebowanie do6miejsc i dobiera pełne kanistry dopiero przy zakupie. Próg25,00001m² ×0,20kg/m² =5,000002kg wymaga dwóch5kg opakowań. Rejestr formuł, oba kalkulatory i adapter cen korzystają z tych samych reguł. Błędne zużycie/obmiar pozostaje nieznane, a nie0zł.

Starsze zapisane kalkulacje nie określały jednoznacznie produktu/zużycia, czasem zawierały litry przy referencji wkg albo stałą1. Nie przepisano tych danych. Projekcja oznacza grunt jako wymagający przeliczenia w edycji projektu. Oznaczenie starej nieznanej ilości jakoMam/Kupione nie usuwa jej z koszyka. Nowa kalkulacja z potwierdzonym obmiarem może wyłączyć posiadany materiał. Narzędzia i własne pozycje nie są przepisywane.

## Rzeczywisty serwer i koszyki

Świeży kalkulator został połączony przez HTTPS z produkcyjnym/api/remont/pricing/project. Dla kodu testowego00-001 gruntowanie40m² wymaga4lCT17, jednego kanistra10l. Rab-Dom:109,00zł materiał +17,99zł InPostKurier =**126,99zł**. Tańszy produkt92,00złRealbud nie ma potwierdzonej dostawy tego koszyka (no_home_delivery), zatem nie jest przedstawiany jako tańszy pełny zakup. Nie podstawiono ogólnej stawki25zł z innego produktu.

Dwa takie etapy wymagają8l i nadal jednego10l kanistra; **126,99zł z dostawą**, wobec253,98zł przy zakupach osobno. To potwierdzone porównanie dostępnych wariantów, nie minimum całego rynku.

Wylewka10m²/5mm/obwód14m: wszystkie3pozycje materiałowe rozpoznane; **239,62zł w odbiorze** (SeweraSAM100165,64+grunt38,50, Castoramataśma35,48). Dostawa całego zestawu pozostaje **niepotwierdzona**, ponieważ tylko Castorama ma dotychczas potwierdzoną ofertę konkretnej taśmyFola, a jej dostawa wymaga dostępu. Nie zastąpiono jej innym modelem pod tym samym EAN i nie pokazano pickupsumy jako dostarczonej. KandydatSewera23282 to inny producentPack-Center, SKU TB-FB00202, kod sklepu465325 (NIE EAN); Sewera7755 toArtchem/kod136125. Wymagają osobnych tożsamości i dowodu transportu. Zapisany wcześniejszy requestHTTP trzech prac nadal zwraca790,83zł. To regresja samego wcześniejszego payloadu, nie dowód aktualnej kompletności starszych zapisanych projektów. Rzeczywisty wspólny koszyk z tymi samymi3projektami pokazuje teraz1niepotwierdzoną ilość gruntu w starej wylewce i nie deklaruje pełnej sumy. Wybór prac/Standard/00-001 i dane projektów zachowano.

## Pokrycie i ograniczenia

Szerszy audyt65niepustych scenariuszyStandard w66pracach: **59/228wierszy z ceną,169bez,6scenariuszy w pełni wycenionych**. Wcześniej51/227i176bez; nowy wiersz to jawnie dodana taśma wylewki z obmiarem14m. To nadal pojedyncze syntetyczne wymiary; pełna cena scenariusza nie dowodzi kompletności każdej rzeczywistej instalacji, narzędzi ani wszystkich wariantów.169brakującychwierszy nie oznacza169unikalnych produktów. Katalog107/113,136aktywnychofert,38sklepów bez zmian. Castorama/OBI, ABUDcloud, lokalne stany/ceny i dalsze akcesoria nadal otwarte.

## UX i odbiór

Przejście ze szkicu wylewki do linku gruntowania odtwarzało poprzedni rodzaj pracy: asynchroniczny odczyt szkicu nadpisywał wybór. Kreator teraz czeka na odczyt i stosuje jawnyjobId raz, czyści obmiary/nazwę innej pracy, zachowując wspólne preferencje. Zmiana pracy wewnątrz kreatora pozostaje możliwa. Prawdziwy formularz po poprawce pokazuje gruntowanie zamiast wylewki i odrzuca20m²/l;10m²/l przechodzi. Utworzono wyłącznie własny QAprojekt `proj_mvpzkcsubx9y6c2ug`, Testkompletu—gruntowanie40m²,CeresitCT17; poprzednie10projektów zachowane. Lista4pozycji:1materiał+3narzędzia,0kupionych.

521testów core/calculator/pricing/API PASS0skip, mobiletypecheckPASS,66chronionychID i negatywne mutacjePASS. Backend, obserwacje, wspólna infrastruktura i migracje bez zmian, więc nie uruchamiano nowego wdrożenia ani nie przedstawiano poprzednich1054testów backendu jako nowego przebiegu. Dowód cen obejmuje rzeczywisty HTTPS i UI, nie tylko unity. Brak płatności/zamówień/płatnegoAI.

Dowody w katalogu czatu: work/catalog-wave44-production-proof.json, catalog-wave44-core-tests.log, catalog-wave44-legacy-mutation-proof.json; outputs/catalog44-wizard-correct-job-20261027.txt i catalog44-wizard-coverage-rejected-20261027.txt. Pierwsza próba spodziewała się pełnej dostawy wylewki; rzeczywisty brak dostawy konkretnej taśmy zmienił odbiór na jawną lukę. Nie usunięto taśmy w celu uzyskania zielonego wyniku.

Źródła: [CeresitCT17](https://www.ceresit.pl/produkty/grunty-i-gladzie/grunty/produkt.html/ceresit-ct-17-profi/SAP_0201JAC014F1.html), [KnaufUniversalgrund](https://knauf.com/pl-PL/p/produkt/knauf-universalgrund-22064_0120), [kartaKnauf08/2026](https://knauf.com/api/download-center/v1/assets/3ed7306f-27be-4d9d-a14d-388477a68c24?country=pl&download=true), [ATLASUNI-GRUNT](https://www.atlas.com.pl/produkt/atlas-uni-grunt/), [kartaATLAS08/2026](https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_uni_grunt_plik_karta-techniczna.pdf), [Rab-DomCT17](https://www.rabdom.pl/pl/p/CERESIT-CT-17-Grunt-gleboko-penetrujacy-10L/9787), [RealbudCT17](https://realbud.com/pl/p/Ceresit-CT-17%2C-10-l%2C-gleboko-penetrujacy-grunt-bezrozpuszczalnikowy/75057217), [SeweraUNI-GRUNT](https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772), [Fola50mb](https://www.bricomarche.pl/tasma-brzegowa-5-mm-x-100-mm-x-50-m), [innyPack-Center](https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282).


## Doprowadzenie braków do konkretnej czynności

Wspólny koszyk pokazuje nazwę projektu i materiałów wymagających obmiaru oraz przycisk bezpośrednio do edycji. Pierwszy odczyt ujawnił, że edytor miał formularz obmiarów tylko dlaEPS/umywalek. Rozszerzono go o siedem objętych zmianą prac. Prawdziwy przycisk prowadzi do starej wylewki proj_mvnu6990st2qs3zza; pokazuje zapisane2m²/5mm, pusty nowy obwód i zużycie emulsji wkg/m². WyjścieAnuluj, bez zapisu. Żaden wcześniejszy projekt nie został przeliczony ani przepisany automatycznie. Dowody outputs/catalog44-common-needs-review-20261027.txt i catalog44-legacy-measurements-20261027.txt.

Po świadomym przeliczeniu lista zakupów projektuje nowe ilości; zmiana produktu gruntu, jednostki albo ilości wymaga ponownegoMam/Kupione. Potwierdzenie zapisuje też nazwę/jednostkę w istniejących kolumnach, aby dawny litr nie wracał po ponownym otwarciu jako nowy kilogram. Własne wpisy/ceny/ilości pozostają w zapisie; niezgodna własna ilość wymaga poprawienia do pełnego zapotrzebowania. Ilości innych materiałów także nie są ukrywane przez stary znacznik posiadania. Pierwsza wersja zbyt restrykcyjnie porównywała nazwy również krzyżyków; istniejący test wykrył regresję. Porównanie tożsamości jest ograniczone do zmienianego produktu gruntu, inne nazwy i dotychczasowe znaczniki zgodnych ilości zachowano, testy bez osłabienia.

Rzeczywista metoda shoppingRepo.updateQuantity została wykonana na izolowanej natywnejSQLite: utrwala nowekg/nazwę/customQuantity, zachowuje pierwotnąquantity i inną pozycję, odrzuca ujemne/NaN/Infinity oraz pustą jednostkę. Podmieniono tylko transportgetDb, SQL i metoda z produkcyjnego repo bez kopii reguły; nie dotknięto DBużytkownika. Dowód work/catalog-wave44-shopping-sql-proof.json. To odrębna weryfikacjaSQL, nie zwiększa liczby521testów. Brak migracji.

Końcowy pełny odczytUI z ponownego otwarcia: outputs/catalog44-primer-reloaded-20261027.txt, kod00-001,109+17,99=126,99zł; zdjęcie widoczne w outputs/catalog44-primer-shipping-20261027.png. Odczyty wspólnego koszyka i starszego edytora zapisano ponownie jako pełne drzewa po wykryciu, że domyślny zapisAX zwrócił tylko „bez zmian”. Plikcatalog44-wizard-coverage-rejected-20261027.txt nadal zawiera tylko taki diff; właściwy widoczny błąd20m²/l i przejście po poprawie do10 są w transkrypcie narzędzia, nie w tym pliku. Pierwszy nieudany, prawie pusty zrzut po nadmiernej zmianie viewportu zastąpiono prawdziwym odczytem1280×1000; viewport przywrócono do1280×720.
