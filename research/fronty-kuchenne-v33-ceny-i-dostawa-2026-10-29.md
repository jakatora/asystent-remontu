# Fronty kuchenne: obmiar, farba i pełny koszt dostawy

29 października 2026, wave83. Zaktualizowano istniejącą pracę kitchen-cabinet-paint. Dodano dwa rzeczywiste opakowania farby ze zdjęciami, pomiar powierzchni, przygotowanie podłoża i pełny koszt zakupów z dostawą. Rozwój katalogu i pozostałych zestawów trwa.

## Produkty i źródła

- [V33 Easy Renowacja Kuchnia — aktualna karta producenta](https://www.v33.pl/v33-product/easy-renowacja-kuchnia/): około 12 m²/l na jedną warstwę, minimum dwie warstwy, około 6 h między warstwami, pełna odporność po 20 dniach. Dodatek Additiv System spod pokrywki jest w komplecie, całość mieszać 5 minut; zużyć zmieszaną farbę w ciągu 10 dni. Nie używamy czasu 12 h ze starej ulotki linii Renowacja jako czasu aktualnej Easy.
- [V33 — przygotowanie powierzchni i FAQ](https://v33-renowacja.pl/): odpowiedni detergent bez nabłyszczaczy i tłustej warstwy, odtłuszczenie np. benzyną ekstrakcyjną, dokładne płukanie. Wałek flokowy lub welurowy. Na stabilnych malowanych/lakierowanych powierzchniach drewna lub melaminy wskazano P240; dla laminatu mycie i płukanie.
- [Rab-Dom: biała satyna 0,75 l](https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-0%2C75L/7607), EAN3153895149044, native7607, SKU30668: **85,41 zł brutto** za całą puszkę750ml.
- [Rab-Dom: biała satyna 2 l](https://www.rabdom.pl/pl/p/V33-Easy-Renowacja-Kuchnia-Farba-do-mebli-kuchennych-i-plytek-sciennych-bialy-satyna-2L/7613), EAN3153895149228, native7613, SKU23708: **175,28 zł brutto** za całą puszkę2000ml.
- [Sewera: Anser500ml](https://sklep.sewera.pl/benzyna-ekstrakcyjna-0-5l-anser-p13691), EAN5903231606117,11,89zł i [KlingsporPL28C P240](https://sklep.sewera.pl/papier-scierny-gr-240-arkusz-230x280mm-p6903), EAN5907560039820,1,49zł/arkusz: istniejące potwierdzone referencje i zdjęcia.

Publiczne API Rab-Dom potwierdziło zakup całych sztuk, dostępność, kod produktu, EAN i cenę brutto. Starsze opisy w wynikach wyszukiwania zawierały poprzednie nazwy/adresy i nieaktualną dostępność; używamy aktualnego API oraz prawdziwego koszyka. Nazwa, wariant, SKU, wielkość i jednostka są kontrolowane przed przyjęciem oferty. Zdjęcia pochodzą z aktualnych kart dokładnych produktów.

## Obmiary i zakres

Ilość farby w ml = łączna powierzchnia wszystkich malowanych stron i krawędzi × warstwy ÷ wydajność ×1000 ×(1+zapas/100). Domyślnie2 warstwy,12 m²/l,10% jawnego zapasu zakupowego. Dopuszczalna wydajność1–12,2–3 warstwy,0–30%zapas. Liczba frontów doorCount pozostaje pomocnicza i nie tworzy fikcyjnej powierzchni. Surowe ml identycznego EAN sumujemy między pracami przed zaokrągleniem do puszek.

Wariant obejmuje wskazane stabilne powłoki na drewnie lub melaminie i laminat. Tu grunt ma świadomie ilość0. Surowy dąb/kasztan, wosk, olej, uszkodzona okleina i poziome blaty wymagają osobnego doboru; nie oznaczamy ich jako pełnego zestawu. Producent wymaga dodatkowego lakieru na poziomych blatach.

Użytkownik podaje liczbę arkuszy P240 i butelek Anser, bez wymyślonych przeliczników na m². Wybór środków rozróżnia nieustalony zestaw, posiadanie właściwego detergentu i środka odtłuszczającego albo posiadanie detergentu i zakup Anser. Nieustalony detergent nie staje się darmowym brakującym produktem. Benzyna jest środkiem przygotowującym, nie rozcieńczalnikiem tej wodnej farby; obowiązują etykieta, wentylacja i brak źródeł zapłonu.

Wszystkie cztery ID materiałów, dotychczasowe ID pomiaru i pracy oraz migracje bazy są zachowane. Materiały pozostają jednorodną tablicą legacy. Model cabinet-v33-easy-v1 odróżnia nowy przelicznik. Stare ogólne lub zmienione zapisy wymagają ponownego przeglądu. Brak wymaganej pozycji w zapisanym zestawie pozostaje nieuzgodniony. Zmiana puszki lub ilości wymaga sprawdzenia oznaczeń Mam/Kupione. Przycisk w porównaniu otwiera edytor powierzchni i produktów.

## Sprawdzone koszyki brutto

| Zakres | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
|10 m²,2 warstwy,10%zapasu,1×2l +4 P240 +1 Anser, kod00-001|193,13 zł|135,50 zł|**328,63 zł**|
|Ten sam zakres,3×0,75l +4 P240 +1 Anser|274,08 zł|135,50 zł|**409,58 zł**|
|6 m² laminatu, środki przygotowujące posiadane,2×0,75l|170,82 zł|10,50 zł|**181,32 zł**|
|Ten sam zakres6 m²,1×2l|175,28 zł|10,50 zł|**185,78 zł**|
|Dwa projekty po5 m² laminatu, środki posiadane, wspólnie1×2l|175,28 zł|10,50 zł|**185,78 zł**|

Przy10 m² większe opakowanie oszczędza80,95 zł. Przy6 m² dwie małe puszki są tańsze o4,46 zł. Są to sprawdzone scenariusze z jawnym wyborem opakowania; bieżący selektor nie jest automatycznym optymalizatorem zamieniania różnych EAN w całym remoncie.

Rab-Dom zwrócił krajową taryfę PL:10,50 zł dla1lub2małych puszek,3małych puszek i1dużej, ale17,99 zł dla2dużych. Nie kopiujemy jednej stawki na dowolny koszyk ani nie przedstawiamy jej jako indywidualnej taryfy kodu. Sewera dla4arkuszy+1 Anser zwróciła **125,00 zł**, Raben półpaleta do50 kg, wycena dla00-001, wysyłka zKatowic. Wartości nie zmniejszano na podstawie samej wagi. Cena i stan lokalnego punktu wymagają potwierdzenia. Narzędzia i robocizna są poza tą kwotą materiałów.

## Kontrola wydania

816 testów kalkulatora/pricingu/adapterów oraz1054testy wspólnego backendu:0 błędów,0 pominięć. Oba sprawdzenia TypeScript poprawne,2 źródła techniczneHTTP200,66 wpisów rejestru zachowane.5 rzeczywistych anonimowych koszyków sklepowych i11 produkcyjnych scenariuszy SDK, w tym6 pełnych z dostawą. Sprawdzono2kody pocztowe, sumowanie2 pomieszczeń przed puszkami, nieznane przygotowanie/podłoże, brak kodu, niepełny pojedynczy sklep i niepotwierdzony odbiór. Nie składano zamówień ani nie podawano danych klienta.

Backend: świeży snapshot224obserwacji; zachowano je wszystkie, dodano2=226;146pozostałych plików niezmienionych. [PR83](https://github.com/jakatora/przetargai/pull/83) połączony jako a459c9650b626d2bd45bb53d4dfdee77b716fd0d. Railway a03f3542-0fc7-4312-be6d-b81f03878270 SUCCESS; wszystkie148plików produkcyjnych zgodne z przejrzanym wydaniem.

Katalog po aktualnym odczycie produkcji: **171/178 referencji z ofertami,220 ofert,226 źródeł,178 zdjęć,49 kanałów**.7starych dokładnych tożsamości nadal bez oferty. Historyczne65 map pomiarów ma81/252wycenione wymagania i171 nieuzgodnionych; to wymagania prac, a nie171unikalnych SKU. Zwiększenie liczby wymagań o1 wynika z jawnego nieustalonego przygotowania zamiast wcześniejszego pominięcia. Nowy wybrany zestaw frontów zweryfikowano osobno.

Dalszy priorytet: więcej pełnych zestawów i alternatywnych sklepów dla środków pomocniczych, automatyczna porównywarka dopasowanych opakowań oraz potwierdzanie cen i zapasu w lokalnych punktach. Cel całej aplikacji pozostaje aktywny.

## Sprawdzenie interfejsu

Własny projekt kontrolny `proj_mvszta5sohgk4 mlgj` utworzono przez kreator Expo Web na localhost:8082. Wybrano stabilną powłokę, 10 m², dwie warstwy, 12 m²/l, 10% zapasu, cztery arkusze P240, posiadany detergent i jedną butelkę Anser. Aplikacja pokazała 328,63 zł z dostawą, a po zmianie opakowania na 0,75 l — 409,58 zł. Przywrócono 2 l i potwierdzono wynik po odświeżeniu. Zdjęcia wszystkich trzech produktów są widoczne. Przycisk zmiany materiałów otwiera właściwy edytor.

We wspólnym koszyku sprawdzono ten zestaw wraz z dwoma Virone DC-11: 339,13 zł materiały +160,10 zł dostawy =499,23 zł. Po teście przywrócono wcześniejszy wybór trzech własnych projektów QA. Nie zmieniano innych projektów. To kontrola Expo Web, bez twierdzenia o wykonaniu testu na fizycznym Androidzie lub iOS. Zrzut: `work/catalog-wave83-product-and-prices.jpg`.
