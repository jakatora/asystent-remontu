# Wylewka: osobne modele taśmy, magazyn i dostawa paletowa — 2026-10-27

## Co otrzymuje użytkownik

Pełny zestaw materiałów do wylewki ma teraz realną wycenę dostawy: masa SAM 100, grunt Atlas Uni-Grunt i wybrana taśma Pack-Center. W formularzu są dwa jawne modele: Pack-Center TB-FB00202 i Fola. Pozostają różnymi produktami. Starszy zapis bez pola wyboru zachowuje Fola jako projekcję odczytu; nowe obliczenia zapisują wybór Pack-Center (0), a świadomy wybór Fola (1) jest respektowany we wszystkich trzech wariantach cenowych. Zapisane JSON i migracje bazy pozostają nietknięte.

Własna końcówka rolki lub gruntu pokrywa faktyczne zużycie, bez konieczności posiadania całego nowego opakowania: 20 m tej samej taśmy wystarcza na 14,7 m, 10 m nie wystarcza. Inny model/nazwa, jednostka lub niedostateczna ilość wymaga potwierdzenia i nie znika z koszyka. Surowe potrzeby agregowane są przed doborem opakowań.

## Zweryfikowane źródła i tożsamość

- [Sewera, Pack-Center 5 mm × 10 cm × 50 m](https://sklep.sewera.pl/tasma-dylatacyjna-5mm-x-10cm-x-50m-p23282): cena brutto 14,06 zł za rolkę 50 m, producent PACK-CENTER, kod TB-FB00202, zdjęcie z głównej karty.
- [Katalog producenta Goldflex](https://tape.pl/marki/31-goldflex): wcześniejszy odczyt indeksowanego katalogu potwierdzał TB-FB00202 i wymiary. Świeży HTTP daje 403; nie jest dowodem bieżącej ceny ani dostępności.
- [Fola w Bricomarché](https://www.bricomarche.pl/tasma-brzegowa-5-mm-x-100-mm-x-50-m) i [Fola w Castoramie](https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd) pozostają odrębnym modelem.

Kod sklepu 465325 ma sześć cyfr i NIE jest EAN. Publiczny produkt remont-sku-sewera-465325 ma ean/gtin=null. Ścisła lista przejrzanych źródeł wymaga zgodności adresu, głównego Product, producenta, kodu producenta, kodu sklepu, formularza dodawania i opakowania; dane rekomendacji nie mogą podmienić głównego produktu. Pusty EAN poza tym zdefiniowanym źródłem jest odrzucany.

## Rzeczywisty magazyn i transport

Karta bez wybranego magazynu pokazuje 46 rolek łącznie, lecz Katowice miały 0. Publiczne setDepartment zwraca wybrane ID (np. 3), nie zawsze 1. Odczyt siedmiu oddziałów zapisano w branch-stock.json: Gliwice miały 10 rolek Pack-Center, 130 SAM100 i 20 Uni-Grunt. To stany w chwili odczytu, nie gwarancja realizacji.

Dla koszyka zawierającego ten konkretny SKU wybieramy sprawdzony magazyn Gliwice; pozostałe dotychczasowe koszyki zachowują Katowice. Każda karta ma właściwy oddział, świeżą cenę, a cały rzeczywisty koszyk potwierdza oddział, SKU, liczbę opakowań, ceny brutto i sumę. Pamięć kart rozdzielono według oddziału. Limity stanu i wycena podają rzeczywiste miejsce wysyłki.

Ciężkie materiały miały w sklepie metody DHL - Paleta do 200 kg i Raben - Paleta do 200kg, pomijane przez stary filtr wymagający słowa Kurier. Dodano rozpoznanie tych przewoźników; cena nadal pochodzi z rzeczywistego kalkulatora koszyka dla kodu pocztowego. Odbiór, indywidualny transport, nieznany przewoźnik i wyłączone metody nie są akceptowane jako wyceniona dostawa. block_order=1 z kwotą 0 nadal oznacza brak dostawy.

## Dowód na produkcji

Odczyt 2026-10-27T02:14:46.386Z, HTTPS aktualnego backendu, kod testowy 00-001. Bez zamówienia/płatności.

| Zestaw | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Wylewka 10 m², 5 mm, obwód 14 m | 218,20 zł | 199,00 zł Raben/paleta 200 kg | 417,20 zł |
| Dwie takie wylewki, jeden koszyk | 383,84 zł | 199,00 zł Raben/paleta 300 kg | 582,84 zł |
| Sama rolka Pack-Center | 14,06 zł | 19,90 zł InPost | 33,96 zł |

Jedna wylewka: potrzeba 88 kg SAM100 → 4 worki po 25 kg (165,64 zł), 2 kg Uni-Grunt → 1 kanister 5 kg (38,50 zł), 14,7 m taśmy → 1 rolka 50 m (14,06 zł). Dwa pomieszczenia zużywają 176 kg masy, 4 kg gruntu i 29,4 m taśmy. Jeden koszyk oszczędza 251,56 zł wobec 834,40 zł za dwa osobne zamówienia. To potwierdzone porównanie obecnych ofert, nie gwarancja najniższej ceny całego rynku.

Wariant Fola nadal nie ma potwierdzonej dostawy Castoramy. Starsza kalkulacja bez modelu gruntu nadal ma brak ilości i nie uzyskuje fałszywie kompletnej sumy. Dawny request HTTP 790,83 zł przechodzi jako regresja techniczna, nie dowód aktualnej kompletności starszych projektów.

## Walidacja i zakres

531 testów kalkulatora/wycen PASS, 0 pominięć; 1054 testy współdzielonego serwera PASS, 0 pominięć; typecheck API/mobile; 66 ID prac i negatywne próby usunięcia ID/eksportu/rejestru PASS. Dane pieniężne w groszach, rzeczywiste ceny brutto, pełne koszyki i potwierdzone stany; nie wywoływano płatnego AI, Stripe ani ruchu pieniędzy.

Backend PR44: https://github.com/jakatora/przetargai/pull/44, merge b375489e42a97fcec8d9c8bf19d0e356edd72b4c. Railway 9dd18389-269c-46ca-802e-1cb6d916bd98 SUCCESS. W porównaniu ze świeżą migawką zachowano 146 pozostałych plików produkcyjnych i manifesty; zmieniono tylko moduł Remontu i jego obserwacje. /auth/me nadal 401 bez tokenu; zdjęcie zwraca 200 image/webp.

Rzeczywisty UI: własny projekt QA proj_mvq1z09r7nwok6305 „Test kompletu — wylewka 10 m², Pack-Center i paleta”; poprzednie 11 projektów zachowane, 6 pozycji listy (3 materiały i 3 narzędzia), nic nieoznaczone jako kupione. Wybór Fola i powrót Pack-Center sprawdzony w formularzu. Widok pokazuje 417,20 zł, Raben 199,00 zł, Gliwice i zdjęcia trzech produktów. Narzędzia i robocizna nie wchodzą do porównania materiałów.

Katalog: 108/114 referencji z ofertą, 137 aktywnych ofert, 139 obserwacji, 2 wyłączone, 38 sklepów, 114 URL zdjęć. To nie jest pokrycie wszystkich receptur. Audyt 65 niepustych scenariuszy w 66 pracach: nadal 59/228 wierszy wycenionych, 169 niewycenionych i 6 kompletnie wycenionych scenariuszy. 169 to wiersze, nie 169 unikalnych produktów. Dalej pełne receptury, akcesoria/narzędzia, Castorama/OBI/ABUD, lokalne ceny/stany i uproszczenie obsługi. Cel pozostaje aktywny.

Dowody w katalogu roboczym czatu: work/catalog-wave45-{local,production,collector,full-debug,legacy-mutation,predeploy-baseline}-proof.json (full-debug ma nazwę catalog-wave45-full-debug.json), core/shared-tests.log, research/branch-stock.json w work/catalog-wave45-research oraz outputs/catalog45-pallet-complete-20261027.txt/.png.
