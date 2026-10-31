# Arilla Light Grey: rzeczywista oferta, zdjęcie i cały koszyk — 2026-10-31

Dodano dokładny jasnoszary wariant GoodHome SPC Arilla Light Grey, EAN **5059340969732**: jedna paczka9 paneli pokrywa **2,5m²**. Oferta LiderzyCen33716 kosztuje **164,45zł brutto za paczkę**, a natywne API potwierdza możliwość zakupu i jednostkę `szt.` oznaczającą pełne opakowanie. Zdjęcie z karty tego samego produktu: HTTP200 image/jpeg,87810B, SHA256 `77b4a58d27f76362ec946a60da31e5893eacb04af6a09fd3709997ff9bc3f5bf`.

To nowa referencja i świadomy wybór koloru. Stary Dark Grey, EAN5059340969756, zachowuje ID i wartość wyboru1; nie zastąpiono go innym produktem. Wartość2 nadal oznacza „Inny model — produkt do ustalenia”, nowy Light Grey ma wartość3. Nie zmieniono ID pracy, pomiarów ani migracji. Model pozostaje ten sam na każdym poziomie cenowym. Zmiana produktu ponownie otwiera decyzje o podkładzie i barierze, a posiadanie starego koloru nie jest posiadaniem nowego.

Karta techniczna produktu potwierdza SPC4mm, montaż pływający Drop Click, brak zintegrowanego podkładu oraz wyłączenie pomieszczeń wilgotnych. Informacja jest widoczna przy wyborze i w notatce produktu. Podkład i barierę użytkownik dobiera jawnie; nie przypisano automatycznie zgodności każdego podkładu do tych zamków. Rezerwa10% na docinki to dotychczasowe założenie aplikacji, a nie deklaracja producenta.

## Koszyki sklepu

Rzeczywiste anonimowe koszyki2026-10-31:

| Zakup | Materiały | Dostawa do domu | Razem |
|---|---:|---:|---:|
| 1 paczka Arilla |164,45zł|22zł, Kurier P2|186,45zł|
| 5 paczek Arilla |822,25zł|110zł, Kurier P2|932,25zł|
| 2 paczki Volden XPS LVT6,25m² |227,76zł|20zł, Kurier Standard|247,76zł|
| Arilla5 + Volden2 w jednym zamówieniu |1050,01zł|600zł, Kurier Drzwi|1650,01zł|

Rzeczywisty produkcyjny moduł lokalnie potwierdził dwa osobne zamówienia z tymi samymi materiałami: dostawy **130zł** i cały zestaw **1180,01zł**, o **470zł** mniej niż jeden wspólny koszyk sklepu. Nie dzielimy zmyślonej taryfy i nie wpisujemy stałych kosztów do katalogu. Każda opłata pochodzi z całego natywnego koszyka, z przedpłatą. Sklep publikuje zakres krajowy PL; nie jest to indywidualna kalkulacja dla kodu pocztowego, mimo że użytkownik podaje kod do porównania innych sklepów.

Dwa pokoje po5m² dają po5,5m² zapotrzebowania z rezerwą. Po zsumowaniu11m² potrzeba5 paczek paneli2,5m² oraz2 podkładu6,25m². Nie sumujemy sześciu paczek z osobno zaokrąglonych pomieszczeń. Pozostałe wymagania przykładu są jawnie zapewnione poza zakupem; nie jest to cena wszystkich możliwych prac podłogowych.

Źródła Natural32004/EAN5059340969763, Brown32195/EAN5059340969749 i Dark Grey138153/EAN5059340969756 mają w aktualnym natywnym API `can_buy:false`. Wynik indeksu kategorii lub wyszukiwarki sugerujący zakup nie wystarcza do dodania aktywnej oferty. Nie dodano tych trzech jako dostępnych. Różnica nowego koloru/sklepu względem ceny historycznej Dark Grey nie jest podwyżką ani obniżką tego samego produktu.

## Weryfikacja

Cztery nowe testy API korzystają z przejrzanego natywnego produktu i czterech rzeczywistych koszyków, z minimalnymi danymi bez cookies i sesji. Sprawdzają EAN, kolor, pełną paczkę, brutto, jednostkę, możliwość zakupu, opis zawartości, ilości i sumy koszyka oraz podział zamówień. Siedem testów razem z wcześniejszym Volden/Marvo PASS. Mobile **405/405 PASS** z czystego commitu, w tym wybór modelu, własność produktu i sumowanie pokoi. Typecheck mobile, API i wspólne typy PASS; kontrola 66 dawnych prac i ID PASS. Pełny przygotowany współdzielony backend **1063/1063 PASS**. Nie oznacza to uruchomienia wszystkich testów samodzielnego API w jego innym środowisku.

## Odbiór produkcyjny

Lokalny i publiczny HTTP potwierdziły pięć scenariuszy: cały zestaw z podziałem, jedno zamówienie, wybór LiderzyCen, jedną paczkę oraz ponowne odświeżenie cen. Brak nieudanych źródeł przy odświeżeniu. Publiczne kwoty są identyczne z tabelą i natywnymi koszykami. Nowa oferta ustanawia własną bazę do kolejnych odświeżeń, bez fikcyjnej zmiany ceny względem innego koloru.

Rzeczywista przeglądarka Edge, osobne puste profile lokalny i publiczny: dwa projekty utworzone przez kreator, jawny wybór nowego modelu, wspólny koszyk **1180,01 zł**, 5 + 2 paczki, oszczędność 470 zł, dwie dostawy i jawny zakres krajowy. Zdjęcia paneli i podkładu załadowane po 500 px. Projekty, wybór i kod pozostają po przeładowaniu. Widoki 1250 px i 390 px bez poziomego przepełnienia, zero błędów JS i nieudanych żądań sieciowych. Obejrzano zrzuty publicznego widoku kwot i zdjęć. Historia serwerowa nadal zwraca jawne `verified_history_unavailable`; istniejące lokalne porównania cen pozostają dotychczasową ścieżką zmian. Nie dodano fikcyjnej historii.

Kod app **225a7afe454280ce938593f3dbee51c560529ec9** wypchnięty na `codex/remont-zakupy-20261024`. Współdzielony backend: [PR 133](https://github.com/jakatora/przetargai/pull/133), merge **edbebde5b25ebe42ab2c99a3531df21e8fc22089**. Świeży odczyt przed wdrożeniem potwierdził identyczny produkcyjny punkt wyjścia. Z 150 plików produkcyjnych zmieniono wyłącznie moduł Remontu i seed ofert; pozostałe 148 zachowano bajt w bajt. Po wdrożeniu odczyt wszystkich 150 plików zgodny z przygotowaną wersją. SHA modułu `56c6c9a329eaad7918a9b34d88e15f804addc78b714deaa7d86307489f39948a`.

Railway API **ab63004a-3a08-43b6-bf27-62a41d295c86 SUCCESS**, WWW **07719006-b959-4de5-86fb-3354e291ccda SUCCESS**, 2026-10-31. Publiczna aplikacja: [Asystent Remontu](https://asystent-remontu-web-production.up.railway.app). Nie tworzono nowej usługi. Paczka WWW zawiera 63 pliki, 17 111 663 B; wszystkie 63 publiczne SHA zgodne. Skan 76 długich wartości vaulta: zero wycieków. Prywatny kanał dostaw zachowany poza archiwum przeglądarki, health `quoteRelayReady:true`, brakujących plików 0. Dziewięć tras HTTP 200, prywatne pliki i brakujące zasoby 404, niepodpisany POST kanału dostaw 401. Kopia projektów i potwierdzany reset z poprzednich fal zachowane w wydaniu.

Stan katalogu: **205 referencji, 205 wpisów zdjęć, 288 źródeł, 253 aktywne oferty dla 172 produktów**. Nadal **33 wcześniejsze referencje bez aktywnej oferty**; zbiór ich ID nie zmienił się. Audyt pokrycia jawnie uwzględnia identyfikację SKU bez EAN oraz wcześniejszą kategorię płytek ściennych. Nowy Light Grey zwiększa asortyment, nie zastępuje niedostępnego Dark Grey.

Dowody odbioru task/work: `arilla-http-{local,production}-wave144.json`, `web-arilla-{local,production}-qa-wave144.json`, `web-production-http-wave144.json`, `web-release-integrity-wave144.json`, `catalog-summary-wave144.json`, logi testów i zrzuty ekranu. Cel pozostaje aktywny; kolejnym priorytetem są potwierdzone brakujące oferty i dostawy całego koszyka. Blokad Castoramy/OBI nie ponawiać bez nowej przesłanki.

Źródła:
- https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Arilla-Light-Grey-2%2C5-m2/33716
- https://liderzycen.pl/webapi/front/pl_PL/products/PLN/33716
- https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-light-grey-2-5-m2/5059340969732_CAPL.prd
- https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-winylowe-Volden-XPS-LVT-pod-panele-winylowe-1-mm-6%2C25-m2/32891

Dowody sesji: `work/arilla-*-wave144.json`, `work/arilla-native-carts-wave144.json`, `work/arilla-registered-native-wave144.json`. Cel dalszego rozwoju pozostaje aktywny.
