# Małe worki Goldband i wspólna dostawa — W198, 2026-11-02

Status: implementacja i testy adaptera zakończone; pełny odbiór kandydata oraz publikacja jeszcze przed nami.

## Problem użytkownika

Mała praca tynkarska nie zawsze uzasadnia zakup worka 25 lub 30 kg. Dodano jawny wybór Goldband 5 i 10 kg, bez zmiany wcześniejszych wyborów, wymagań gruntu, siatki i narożników. Ilości pozostają w surowych kilogramach; pełne worki zaokrągla dopiero porównanie zakupów całego remontu. Dodatkowa oferta Betokontakt pozwala porównać wspólną dostawę tynku i gruntu z zakupami w innych sklepach.

## Źródła pierwotne i identyfikacja

- [Knauf Goldband](https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120): 5 kg GTIN 5901793354729, 10 kg GTIN 5901793351162. Liczba worków na palecie nie oznacza minimalnego zakupu.
- [Karta techniczna P131](https://knauf.com/api/download-center/v1/assets/2c71e1e0-2050-4334-a0ef-712579cd9dc9?country=pl&download=true): 13 kg/m² przy 15 mm, zachowane zużycie dla pozostałych worków Goldband.
- [Knauf Betokontakt](https://knauf.com/pl-PL/p/produkt/knauf-betokontakt-10251_0120): 5 kg GTIN 4006379051014. Istniejąca receptura dla gładkiego niechłonnego betonu i konieczność doboru podłoża pozostają.
- [Goldband 5 kg E-Kowalczyk](https://sklep-kowalczyk.pl/knauf-goldband-gipsowa-zaprawa-tynkarska-5kg-507331-52455-52455.html): produkt 33872, 13,35 PLN brutto.
- [Goldband 10 kg E-Kowalczyk](https://sklep-kowalczyk.pl/knauf-goldband-gipsowa-zaprawa-tynkarska-10-kg-94713-52454-52454.html): produkt 33873, 21,55 PLN brutto.
- [Betokontakt 5 kg E-Kowalczyk](https://sklep-kowalczyk.pl/knauf-grunt-betokontakt-5kg.html): produkt 36040, 65,88 PLN brutto.

Ceny i dokładne zdjęcia odczytano przez prawdziwy adapter 2026-11-02 o 07:52:44–46 UTC. Potwierdzono canonical, nagłówek, natywny identyfikator i SKU formularza, cenę brutto, galerię, zaakceptowaną sztukę oraz sumy koszyka z VAT. Obserwacje mają własne oryginalne daty i skróty dowodów; nie tworzono wcześniejszej ceny ani promocji.

## Rzeczywiste anonimowe koszyki

| Zestaw | Kod | Materiały | Potwierdzona dostawa | Razem |
| --- | --- | ---: | ---: | ---: |
| Goldband 5 kg × 1 | 30-001 | 13,35 | 16,99 | 30,34 |
| Goldband 10 kg × 2 | 00-001 | 43,10 | 16,99 | 60,09 |
| Goldband 5 kg, 10 kg i Betokontakt 5 kg, po jednym | 30-001 | 100,78 | 16,99 | 117,77 |
| Goldband 10 kg × 2 i Betokontakt 5 kg × 1 | 30-001 | 108,98 | 16,99 | 125,97 |
| Goldband 10 kg × 3 i Betokontakt 5 kg × 1 | 30-001 | 130,53 | niepotwierdzona | nieznane |
| Goldband 5 kg × 3 | 30-001 | 40,05 | 16,99 | 57,04 |

Kwoty w PLN brutto. To dowody konkretnych koszyków w czasie sprawdzenia, nie taryfa dla dowolnej masy. Oryginalne wyceny obowiązują 10 minut. Transport domowy: `inpostcourier/standard`, InPost Kurier, przedpłata tradycyjnym przelewem. Końcowe sumy sprawdzono po wyborze metody płatności; nie składano zamówienia ani nie przekazywano danych kontaktowych.

Cięższy koszyk zwrócił odbiór osobisty oraz `Wycena / Usługa transportowa` z wartością 0. Żadna z tych metod nie jest darmową dostawą do domu. Punkt odbioru, paczkomat i pobranie nie zastępują sprawdzanej dostawy domowej z przedpłatą.

Pułapka weryfikacji: karta pokazywała liczbowy stan 2 małych worków, lecz rzeczywisty koszyk zaakceptował trzy i potwierdził całą sumę z transportem. Pierwsze oczekiwanie narzędzia badawczego o odrzuceniu trzech sztuk było błędne. Nie wprowadzono tego limitu do aplikacji i nie przedstawia się go jako potwierdzonego braku towaru.

## Zachowane ograniczenia i testy

Pięć nowych testów kalkulatora potwierdza: oddzielne GTIN i opakowania, wszystkie cztery dodatnie pozycje receptury, surowe 14,3 kg tynku oraz 0,2475 kg gruntu dla ściany 1 m² / 15 mm / 10% zapasu, 1,1 m² siatki i 2,5 m narożnika. Dodatkowo: stary model i wybory 1–5, minimalna grubość, brak automatycznego dopasowania do nieznanego podłoża i ponowne potwierdzenie posiadanego zapasu po zmianie produktu.

Siedem nowych testów API oraz jedenaście wcześniejszych testów Kowalczyk/Cerplast: 18 PASS, 0 skip. Testy odtwarzają rzeczywiste odpowiedzi dla trzech ofert i sześciu koszyków, a mutacje sprawdzają zmianę GTIN, opakowania, zdjęcia, ceny, ilości, rabatu, dopłat, transportu i płatności. Jeden test przechodzi przez prawdziwy HTTP `/pricing/project` na lokalnym serwisie z odtwarzanymi odpowiedziami sklepu. To regresja; pełna ścieżka aplikacji na żywych sklepach jest odrębnym wymaganym odbiorem.

Fixture zawiera wyłącznie wybrane oryginalne fragmenty kart i odpowiedzi anonimowego API, z zamaskowanymi identyfikatorami sesji. Brak cookies, kluczy formularzy, kontaktów, zamówień i płatności. Nie poluzowano zamkniętej listy originów, SKU, operacji ani kontroli groszy i VAT.

Seed: zachowano pierwsze 369 obserwacji i dopisano trzy prawdziwe odczyty nowych ofert oraz ponowne sprawdzenie istniejącego narożnika Unimet (łącznie 373). Przewidywany katalog po odbiorze: 251 referencji, 219 potwierdzonych, 333 oferty; wcześniejsze 32 luki pozostają. Nie utożsamia się innego worka lub sprzedawcy z uzupełnieniem starego brakującego GTIN.

MP 75 L 30 kg z tej samej hurtowni pozostaje wykluczony: niejednoznaczność zdjęcia/identyfikacji oraz niepotwierdzony transport domowy. Nie zastępuje on brakującego MP 75 25 kg. ATLAS Hydroband nadal wymaga potwierdzenia kompletu akcesoriów; nie przyjęto oferty zbiorczej rolki jako ceny mankietu.

## Wykryte minimum narożników i rzeczywista dostawa dłużycy Unimet

Pierwszy odbiór pełnej czteropozycyjnej receptury wykrył brak integracji transportu narożnika, więc całkowita kwota prawidłowo pozostawała nieznana. Kontrola pierwotnej karty i formularza sklepu ujawniła istotniejszy problem: narożnik 2,5 m kosztuje 6,35 PLN za sztukę, lecz minimalny zakup wynosi 25 sztuk. Dotychczasowa oferta nie uwzględniała tego minimum. Nie zwiększono fizycznego opakowania do 62,5 m ani nie przyjęto wielokrotności 25: rzeczywisty koszyk przyjmuje również 26 sztuk, natomiast odrzuca jedną.

Dodano `minimumPackages:25`, niezależną kontrolę pierwotnego formularza i informacje w notatce produktu. Zmiana minimum na karcie unieważnia ofertę zamiast zachowywać dawną regułę w cache. Cena jednostkowa pozostaje 6,35 PLN; minimum stosujemy raz do połączonych prac, bez fałszywej zmiany ceny jednostkowej.

Nowy adapter transportu jest ograniczony do tego dokładnego GTIN, produktu 262771 i odrębnej sesji anonimowej. Potwierdzono na rzeczywistych świeżych koszykach:

| Ilość | Kod przekazany sklepowi | Materiały | Transport GABARYT | Razem |
| --- | --- | ---: | ---: | ---: |
| 25 listew | 30-001 | 158,75 | 91,02 | 249,77 |
| 26 listew | 00-001 | 165,10 | 91,02 | 256,12 |

Wybrano natywną metodę 381 `GABARYT`, z odrzuceniem odbioru 387 i pobrania 382. `loadCarriers` otrzymuje wyłącznie Polskę i kod pocztowy, następnie potwierdzamy wybór przewoźnika, odświeżony koszyk, ilości, kwoty brutto i kwotę do zapłaty przy przelewie tradycyjnym. Nie wysłano formularza klienta, adresu, zgód, walidacji płatności ani zamówienia. Zero kosztów w koszyku przed wyborem przewoźnika pozostaje wartością wstępną.

Sześć regresji transportu i trzy minimum zakupowego sprawdzają oryginalne odpowiedzi, błędne ilości/ceny, rabaty, kwoty końcowe, pobranie, odbiór, zmianę płatności i zamknięte operacje HTTP. Fixture usuwa kontakty, dane rachunku firmy i zbędną zawartość strony, maskuje tokeny oraz klucze tymczasowego adresu. Rzeczywiste dowody pozostają poza repo w katalogu W198 na G.

Pułapki badawcze: łączny `Accept: text/html, application/json` daje w tym sklepie pustą odpowiedź, dlatego dla tego originu używamy `text/html`. Natywny endpoint AJAX wymaga pełnego, zaobserwowanego query `fc=module&module=supercheckout&controller=supercheckout`; sam pathname zwraca 404. Pierwsza próba kliknięcia ukrytego radia została zastąpiona zwykłym kliknięciem jego widocznej etykiety, bez wymuszania i obchodzenia nakładek. Wszystkie te nieudane próby były narzędziami badawczymi, nie opublikowanym zachowaniem aplikacji.

## Odbiór całej receptury i rozszerzona regresja czytnika

Siedem rzeczywistych żądań lokalnego HTTP na źródle `0fa6f95ee2d3ec0386345d4141c7fc8e79cff631` zakończono bez podstawiania wycen:

- mała naprawa, 7,62666667 surowych kg: dwa worki 5 kg i grunt — 92,58 + 16,99 = 109,57 PLN;
- pełna ściana 1 m² / 15 mm: 14,3 kg tynku, 0,2475 kg gruntu, 1,1 m² siatki i 2,5 m narożnika — 494,73 materiałów + 133,01 transportu = 627,74 PLN;
- dwie pełne prace, 28,6 kg tynku, 0,495 kg gruntu, 2,2 m² siatki i 5 m narożnika: trzy worki 10 kg, jedno wiadro gruntu Realbud, jedna rolka siatki i minimum 25 narożników — 517,19 + 133,01 = 650,20 PLN. Minimum narożników zastosowano raz, nie po 25 na pomieszczenie. Ten wynik ma status `needs_delivery_costs`, bo konkurencyjny tańszy materiałowo wariant E-Kowalczyk z gruntem nie ma potwierdzonej dostawy. Kwota 650,20 PLN jest pełnym potwierdzonym wariantem, nie dowodem minimum wśród nieznanych transportów;
- wybór wyłącznie E-Kowalczyk dla jednej pełnej ściany: dwa brakujące produkty, bez całkowitej ceny remontu, potwierdzona część tynk + grunt 125,97 PLN;
- cięższa część w tym sklepie bez podziału zamówień: `no_home_delivery`, brak wycenionego koszyka części; nie zamieniono tego na zero;
- drugi kod 00-001: osobna wycena części koszyka;
- rzeczywiste odświeżenie: pełna receptura i akcesoria zachowane, nadal 627,74 PLN w tej kontroli.

Szersza kontrola czytnika wykryła stare założenia testów o pierwszej pozycji katalogu i wersji cache 2. Testy wiążą teraz właściwy szablon JSON-LD oraz aktualny cache 3; uruchamiamy je przez bundler tak samo jak inne testy API, aby poprawnie obsłużyć import modułu mobile. Nie osłabiono reguł produkcyjnych dla dopasowania tych fixture. Test konfliktu marki dodatkowo ujawnił prawdziwą lukę: nazwa zawierająca oczekiwaną markę mogła przeważyć nad jawnie sprzecznym `Brand` w JSON-LD. Czytnik odrzuca teraz tę sprzeczność, pozostawiając dozwolone uzupełnienie brakującej marki przez producenta. Ta kontrola nie obejmuje syntetycznego pola marki w czytnikach natywnych, gdzie sklep może wskazywać producenta korporacyjnego (np. Selena dla Tytan). Początkowe rozszerzenie na wszystkie szablony odrzuciło poprawną fixture Osakryl; ograniczono kontrolę do rzeczywistego `Brand` w JSON-LD, bez ogólnych wyjątków dla producentów. Wszystkie 16 rozszerzonych regresji czytnika przechodziło przed końcowym zawężeniem; wymagane jest ponowne uruchomienie na finalnym źródle.

Poza powyższymi testami przed tą korektą potwierdzono 586 testów mobile, 237 obliczeń cen, 165 API-lib, 223 adapterów, 30 dodatkowych transportu i 1064 współdzielonego backendu, bez pominięć. Grupy częściowo się pokrywają; nie sumować ich jako liczby unikalnych testów. Po końcowej korekcie wymagane jest ponowne sprawdzenie odpowiednich grup i finalnego artefaktu. Odbiór UI i publikacja nadal pozostają do wykonania.

Pierwszy pełny odbiór lokalnego UI na źródle `cefe523cbe833edf113165b5b550810e911de401`: 18 scenariuszy PASS, 8 rzeczywistych odpowiedzi API, 0 błędów strony i 0 odpowiedzi 429. Sprawdzono import/eksport czterech projektów, edytor 5/10 kg i zachowanie 30 kg, ponowny dobór gruntu po zmianie worka, pełną recepturę i wspólny koszyk, minimum 25 listew widoczne w planie, prawdziwe zdjęcia obu nowych worków, dokładny link narożnika, kopię planu zakupów, 320/390 px, drugi kod pocztowy, odświeżenie cen oraz brak dwóch akcesoriów w pojedynczym sklepie. Intercept lokalnego UI przekazywał niezmienione rzeczywiste odpowiedzi lokalnego API; nie podstawiano ofert ani transportu. Fotografia 10 kg pojawia się po rozwinięciu karty produktów sklepu — pierwszy test błędnie oczekiwał jej przy zwiniętej karcie. Finalny build wymaga ponownego odbioru po zawężeniu kontroli JSON-LD.
