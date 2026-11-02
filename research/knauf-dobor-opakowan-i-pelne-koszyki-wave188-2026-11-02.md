# Dobór opakowań i pełne koszyki remontu — wave188, 2026-11-02

Opublikowano jawny dobór dostępnych rozmiarów tego samego produktu we wspólnym koszyku. Dla Knauf Super Finish aplikacja porównuje teraz zweryfikowane oferty wiader 5,4 i 28 kg, łącznie z rzeczywistą dostawą. Fabryczne 20 kg znajduje się w zamkniętej definicji rodziny, ale nie ma aktywnej oferty w sprawdzonych sklepach i nie otrzymuje wymyślonej ceny lub dostępności.

Poprawiono także kolejność wycen dużego remontu: pełne koszyki sklepów są sprawdzane przed opcjonalnym dzieleniem ich na osobne zamówienia. Zmiana usuwa odtworzony przypadek, w którym podziały zużywały limit przed potwierdzeniem całego zestawu.

## Wybór użytkownika i interfejs

- Wybranie produktu z katalogu domyślnie zachowuje dokładny rozmiar oraz EAN. Użytkownik może jawnie włączyć „Dobierz dostępne opakowania”.
- Kontrolka jest dostępna wyłącznie dla dokładnego GTIN, rozmiaru, kategorii i jednostki należących do jednej z wcześniej zweryfikowanych rodzin. Inna marka, model, kolor, jednostka lub własna pozycja nie dziedziczą wyboru.
- Zapis pozostawia pierwotną referencję, potrzebną ilość i opcjonalny klucz rodziny. Przełączenie na dobór usuwa EAN wyłącznie z projekcji żądania; powrót odtwarza dokładny wariant. Nie zapisuje cen, liczby opakowań ani taryf transportu jako zapotrzebowania.
- Kopia remontu, nawigacja i przeładowanie zachowują ten wybór. Uszkodzony lub sprzeczny klucz zatrzymuje wycenę zamiast po cichu wybierać inne opakowanie.
- Space włącza wybór, Enter pozwala wrócić do wybranego wariantu. Kontrolki mają minimum 48 px, widoczny stan i fokus. Sprawdzono szerokości 320 i 390 px.
- Długie nazwy produktów mają osobny wiersz ze zdjęciem i ilością. Podpisane akcje „Edytuj” i „Usuń” są pod nimi. Nie zmieniono palety lub fontów.
- Odświeżenie ceny w formularzu nadal dotyczy wskazanego konkretnego opakowania. Tekst wyjaśnia, że pozostałe rozmiary są sprawdzane przy porównaniu koszyka.

Mechanizm korzysta z istniejących rodzin V33, Primer G Pro, Mapegum WPS, CT17 PROFI i CT17 Transparent oraz nowej rodziny Super Finish. Nie wprowadzono aliasu Super Finish do Fill & Finish Light, Kreisel lub Norgipsa. Nie zmieniono obmiarów, formuł, identyfikatorów prac, migracji lub zależności.

## Rzeczywiste porównania produkcyjne

Poniższe kwoty pochodzą z konkretnych anonimowych koszyków z 2026-11-02. Każda potwierdzona opłata ma własny termin ważności oraz dowód sklepu. Są to najtańsze spośród potwierdzonych, sprawdzonych wariantów, nie deklaracja globalnego optimum lub stałej taryfy.

| Potrzeba i wybór | Kod | Zakup | Materiały | Dostawa | Całość |
| --- | --- | --- | ---: | ---: | ---: |
| 29 kg, wybrane opakowanie 28 kg | 30-001 | 2 × 28 kg | 198,00 zł | 90,00 zł | 288,00 zł |
| 29 kg, jawny dobór rozmiarów | 30-001 | 28 + 5,4 kg | 143,70 zł | 90,00 zł | 233,70 zł |
| 5,5 kg, jawny dobór rozmiarów | 30-001 | 2 × 5,4 kg | 89,40 zł | 19,99 zł | 109,39 zł |
| 10,9 kg, jawny dobór rozmiarów | 30-001 | 3 × 5,4 kg | 134,10 zł | 32,99 zł | 167,09 zł |
| 33,4 kg, jawny dobór rozmiarów | 30-001 | 28 + 5,4 kg | 143,70 zł | 90,00 zł | 233,70 zł |
| 33,400001 kg, jawny dobór rozmiarów | 30-001 | 28 + 2 × 5,4 kg | 188,40 zł | 90,00 zł | 278,40 zł |
| 29 kg, jawny dobór rozmiarów | 00-001 | 6 × 5,4 kg | 268,20 zł | 0,00 zł | 268,20 zł |

Dla potrzeby 29 kg i kodu 30-001 oszczędność wyniosła **54,30 zł**. Przy 10,9 kg wygrywa zakup o droższym materiale: trzy małe wiadra z kurierem są tańsze od dużego wiadra z paletą. Potwierdzone zero dla 00-001 pochodzi z rzeczywistej wyceny tego koszyka, nie z banera lub braku opłaty. Nie przeniesiono stawki między kodami.

Dwa pomieszczenia o potrzebach 20 + 9 kg połączono w 29 kg i ten sam zakup 28 + 5,4 kg. W odrębnym przypadku stała potrzeba 29 kg w opakowaniu 28 kg i automatyczne 5,4 kg nadal wymagają dwóch dużych wiader: zgoda na dobór w jednej pozycji nie usuwa ograniczenia rozmiaru z drugiej. Realbud dla 29 kg pozostał z ceną materiałów 206,10 zł i nieznanym transportem; nie wszedł do rankingu jako darmowa dostawa.

### Ten sam remont z 15 pozycjami

Zapotrzebowanie na pozostałe materiały, kod i zgoda na porównanie osobnych zamówień pozostały takie same. Zmieniono wyłącznie zgodę na dobór opakowań Super Finish przy potrzebie 29 kg.

| Wariant | Materiały | Dostawy | Suma | Sklepy |
| --- | ---: | ---: | ---: | ---: |
| Stałe wiadra 28 kg | 2543,20 zł | 456,90 zł | 3000,10 zł | 9 |
| Dobór rozmiarów Super Finish | 2489,38 zł | 477,90 zł | 2967,28 zł | 10 |

Oszczędność pełnego zestawu wyniosła **32,82 zł**, a liczba sklepów wzrosła. Pokazuje to potrzebę zachowania istniejącego wariantu „Mniej sklepów”. Nie przypisuje się całemu remontowi oszczędności wyliczonej wyłącznie dla jednego produktu.

Ta sama rzeczywista odpowiedź zawierała opcję **2940,17 zł** po świadomym dokupieniu jednej rolki Norgips 50 mm × 30 m w Elmas: materiały 2512,27 zł, dostawy 427,90 zł, dalsza oszczędność 27,11 zł. Importowana funkcja `extraPackageAdditions` potwierdziła dokładnie jedną zmianę: zakup 8 → 9 rolek. Potrzeba pozostaje 240 m. Nadwyżki nie dodaje się automatycznie do potrzeb użytkownika.

Pierwsza publiczna próba dużego koszyka trwała około 35,8 s; wariant z doborem, po wykorzystaniu nadal ważnych danych sklepów, około 3,2 s. To pojedyncze próby z różnym stanem cache, nie p95 ani dowód takiego przyspieszenia każdego remontu.

## Kolejność wycen i odtworzony błąd

Pierwszy kandydat `f42f272` potwierdził małe koszyki, ale dla dużego zestawu zabrakło pełnego wyniku: limit został zużyty przez opcjonalne podziały, a niektóre potrzebne koszyki miały `quote_limit`. Zachowano odpowiedź. Diagnostyczne wyłączenie opcjonalnych podziałów, przy tych samych materiałach, potwierdziło kompletne zestawy; nie potraktowano tego jako końcowej naprawy.

Test RED odtworzył wywołanie opcjonalnej części pierwszego sklepu przed ostatnim pełnym sklepem. Poprawka wprowadza dwa przebiegi: pełne koszyki i następnie opcjonalne podziały, korzystające z tych samych wyników. Pozostał łączny limit 80 wycen, izolacja kodu, walidacja stocku, ceny i terminów. Wymagane wysyłki oddziałowe Sewery nie czekają na etap opcjonalny. Osobne zakupy nadal mogą wygrać; potwierdzono to również rzeczywistym PEX: 20 m za 119,80 zł w dwóch zamówieniach zamiast 134,80 zł w jednym.

Limit 80 dotyczy wycen koszyków, nie wszystkich HTTP do sklepów. Duże zestawy nadal korzystają z oznaczonego, ograniczonego wyszukiwania i mogą wymagać potwierdzenia innych wariantów.

## Weryfikacja produktów i dostępności

Fabryczne rozmiary i GTIN potwierdza [Knauf](https://knauf.com/pl-PL/p/produkt/knauf-super-finish-11410_0120): 5,4 kg — 5901793357959; 20 kg — 5901793357942; 28 kg — 5901793357935. Rodzina dopuszcza wyłącznie te tożsamości i jednostkę kg. Dla każdego opakowania nadal wymagany jest właściwy produkt oraz aktualna oferta.

Natywne odczyty kart 2026-11-02 potwierdziły brak możliwości zakupu 20 kg w [BMB](https://bmbtechnologie.pl/produkt/gotowa-masa-szpachlowa-super-finish-knauf-20kg.html), [Germot](https://www.germot.com.pl/pl/products/gotowa-masa-szpachlowa-super-finish-20-kg-knauf-2925) i [Budomiks](https://budomiks.pl/pl/products/gotowa-masa-szpachlowa-knauf-super-finish-20-kg-46262.html). Germot ma ilość 0, `disable` i wyłączone pola zakupu; BMB nie ma formularza dodania. Sama widoczna cena nie stała się ofertą możliwą do kupienia.

[BMB 28 kg](https://bmbtechnologie.pl/produkt/super-finish-gotowa-masa-szpachlowa-knauf-sheetrock-28-kg-nr-kat-503037.html) potwierdziło 41 szt., GTIN i cenę 99,99 zł. Trzy świeże anonimowe koszyki — jedno wiadro, dwa oraz wiadro z Grundiermittel — pokazały wyłącznie odbiór własny i potrzebę indywidualnych ustaleń transportu. Zera za odbiór nie użyto jako dostawy. Nowej oferty BMB nie dodano w tej fali.

Katalog i zdjęcia nie zostały rozszerzone: **242 referencje / 210 z potwierdzonymi ofertami / 311 ofert / 32 braki**. Wykorzystano istniejące prawdziwe fotografie każdego wybranego wiadra. Audyt publiczny: 229 wierszy snapshot, cztery wcześniejsze tożsamości SKU, zero brakujących i fałszywie potwierdzonych dopasowań. Ceny po odświeżeniach nie wykazały rzeczywistej zmiany; nie wytworzono sztucznych podwyżek, obniżek lub historii.

## Testy, publikacja i stan końcowy

- Czyste źródła: **552 mobile / 222 pricing / 147 API lib / 159 adapters / 1064 shared**, zero fail i skip; grupy częściowo się pokrywają. Typy API/mobile i 66 legacy poprawne. Ułamkowe ilości sprawdzono niezależną enumeracją w całkowitych gramach.
- Lokalnie: 12 rzeczywistych przypadków rodziny + jeden „Mniej sklepów”; 30 końcowych UI (16 dobór, osiem PEX, sześć mniej sklepów). Publicznie te same liczby przypadków przeszły, bez błędów stron i odpowiedzi API 429 w sprawdzonych UI. Profile i konteksty zamknięto.
- Pierwsza próba UI nie reagowała na spację. Naprawiono obsługę web; kolejne próby Space/Enter przeszły. Zachowano nieudaną próbę. Dodatkowo poprawiono typy nowych testów oraz odwołanie testu do serializowanego `packages`, bez zmiany cen.
- API: źródło `228b9ed1707211e594dfbf6a8ef65a3c071825f7`, wdrożenie `905b4b8f-a0ef-4872-9e73-bffc8008c3cd`, SUCCESS 2026-11-02 01:36:20.122 UTC. SHA bundla `892710e0c8b3daa82428a6b499e3d848450844620d5855a47100165f568dd8e5`. Świeży zrzut 150 plików zgodny z przygotowanym wydaniem; 149 plików i wszystkie 350 obserwacji seed zachowano.
- WWW: źródło `54ae815d63cafc58549dc441231bfd45e65cb5cc`, wdrożenie `53c65d4b-e5c7-4d75-b71a-2c8b5178a1e6`, SUCCESS 2026-11-02 01:38:49.555 UTC. Wszystkie 63 zasoby zgodne z publicznymi SHA, 17 290 993 B, 77 wartości vaulta bez wycieku. Dziewięć plików hostingu i prywatnego kanału sklepowego bez zmian względem wave187. Archiwum zasobów zmieniło się zgodnie z nowym frontendem; prywatny POST bez podpisu nadal 401.
- [PR 169](https://github.com/jakatora/przetargai/pull/169) merged; head `d2b0b81fa8d3ce71b5badf0b9943d5d75c03889e`, merge `04ca0826a5d268781403f2f2710be3920b085df8`. Zmieniono tylko bundle remontu. GitHub nie zwrócił statusów CI; nie opisuje się tego jako zielonego CI. Testy lokalne mają osobne logi.
- Końcowa kontrola 2026-11-02 01:42:44.466 UTC: **265 wystąpień rzeczywistych wycen** w sprawdzonych odpowiedziach nadal ważnych, bez przesuwania dat. Dotyczy momentu kontroli; kolejne zakupy wymagają aktualnych danych.

Historia cen po publikacji ma 10 576 punktów i 348 bieżących obserwacji. Z 9881 punktów wcześniejszego zrzutu zachowało się 9877. Cztery najstarsze obserwacje Primer G Pro 1 l zostały usunięte zgodnie z istniejącym limitem 60 na ofertę. Odtworzenie niezmienionej klasy `RetailPriceHistory` na starych i nowych punktach dało dokładnie bieżący zbiór. Kod historii nie został zmieniony. Pierwszy pomocnik błędnie wymagał nieograniczonego zachowania wszystkich punktów; jego porażkę zachowano, a poprawiony audyt sprawdza rzeczywistą regułę retencji. Capture nazwany `before` zakończył się dwie sekundy po SUCCESS API i nie stanowi dowodu pomiaru przed wdrożeniem.

Artefakty: `G:/Projekty/asystent-remontu-work/wave188-20261102`. Pozostawiono oba wcześniejsze kandydaty, surowe odpowiedzi sklepów, nieudane próby, diagnostykę retencji, zdjęcia ekranów oraz kopie zapotrzebowania. Pomocnik archiwizacji początkowo zatrzymał się przed przeniesieniem na różnicy separatorów Windows; późniejsze przeniesienia własnych katalogów wykonano po sprawdzeniu ścieżek G. Dodatkowy stary przebieg shared nie był dowodem nowego bundla; końcowy przebieg dotyczy właściwego wydania. Różnice CRLF w 145 plikach roboczych shared odpowiadały zgodnym Git blobom; nie zmieniono ich ani locka.

Przegląd money-path: kwoty wyłącznie z właściwych ofert i koszyków, zgoda na inne opakowania jawna, brakujący transport nie jest zerem, pełna suma wymaga wszystkich opłat, historia i ważność nie są odnawiane przez test. Zachowano zapotrzebowanie, stock, minima, jednostki, kraj i kod. Nie składano zamówień, nie przesyłano danych klienta i nie dotykano płatności lub płatnego AI. Obce WIP pozostały nietknięte.

Cel ciągły pozostaje aktywny. Nadal wymagają pracy brakujące produkty i fotografie, trwałe źródła cen oraz transportu, pełna dostawa Castoramy/OBI, kompletność trzech ścieżek remontu, pomiar kosztu i czasu wycen oraz pilotaż z rzeczywistymi klientami.
