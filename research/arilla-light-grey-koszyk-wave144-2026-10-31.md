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

Cztery nowe testy API korzystają z przejrzanego natywnego produktu i czterech rzeczywistych koszyków, z minimalnymi danymi bez cookies i sesji. Sprawdzają EAN, kolor, pełną paczkę, brutto, jednostkę, możliwość zakupu, opis zawartości, ilości i sumy koszyka oraz podział zamówień. Siedem testów razem z wcześniejszym Volden/Marvo PASS. Mobile405/405 PASS, w tym nowe sprawdzenie wyboru, własności i sumowania pokoi. Końcowe typecheck, odbiór publicznego HTTP/interfejsu i wdrożenia zostaną zapisane po wykonaniu.

Źródła:
- https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Arilla-Light-Grey-2%2C5-m2/33716
- https://liderzycen.pl/webapi/front/pl_PL/products/PLN/33716
- https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-light-grey-2-5-m2/5059340969732_CAPL.prd
- https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-winylowe-Volden-XPS-LVT-pod-panele-winylowe-1-mm-6%2C25-m2/32891

Dowody sesji: `work/arilla-*-wave144.json`, `work/arilla-native-carts-wave144.json`, `work/arilla-registered-native-wave144.json`. Cel dalszego rozwoju pozostaje aktywny.
