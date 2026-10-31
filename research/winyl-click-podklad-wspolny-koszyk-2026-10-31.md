# Podłoga winylowa click: rzeczywiste paczki i wspólny koszyk

Sprawdzenie 2026-10-31. Naprawiono brak mapowania zatwierdzonego kodu podłogi winylowej i przygotowano jawny dobór materiałów. Dawny test `vinylArea` przechodził jedynie z obcym, niezatwierdzonym mapowaniem. Ten obcy WIP pozostaje poza zmianą.

## Źródła

// source: https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-winylowe-Volden-XPS-LVT-pod-panele-winylowe-1-mm-6%2C25-m2/32891
// source: https://liderzycen.pl/webapi/front/pl_PL/products/PLN/32891
// source: https://liderzycen.pl/environment/cache/images/productGfx_53817_500_500/9772c302db12f1d82525f11644d6fe42.jpg
// source: https://www.castorama.pl/podklad-podlogowy-volden-xps-lvt-pod-panele-winylowe-1-mm-6-25-m2/5063022038326_CAPL.prd
// source: https://www.diy.com/departments/volden-1mm-xps-foam-vinyl-underlay-panels-6m-/5063022038326_BQ.prd
// source: https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474
// source: https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m
// source: https://arbiton.com/pl/podklad-pod-panele/akcesoria/tasma
// source: https://conkret.com.pl/conkret-products/folia-budowlana-conpar/

Volden XPS LVT 1 mm, EAN **5063022038326**, kod sklepu `ctma_5063022038326`, produkt32891. Aktualny publiczny API LiderzyCen: producent Volden, jednostka całkowita `szt.`, możliwość zakupu, **113,88 zł brutto za paczkę 6,25 m²**. Nie jest to cena za 1 m². Castorama i B&Q potwierdzają tożsamość, grubość i przeznaczenie do click/LVT; pole pokrycia zaokrąglają do6 m². Dla oferty LiderzyCen wiążemy cenę z dokładną nazwą6,25m², EAN, SKU i całkowitą jednostką szt. Nie zamieniamy paczki na6m² ani podkład XPS Smart do laminatu. Nie publikujemy pobranej z indeksu wyszukiwarki ceny Castoramy jako aktualnej oferty z dostawą.

Zdjęcie sklepu: HTTP200, `image/jpeg`,32331 bajtów, SHA256 `21e82ff177e882db0e4942e102b7a0ea02b1c4c3aec04da0010ae6d9f8a922c9`. W repo jest URL, nie plik binarny. Obserwacja produktu `2026-10-31T05:53:34.296Z`, SHA256 odpowiedzi `a3d41552876f6ddd6c3b5a2c8e98a4028acbdf1dc33d792f8463471437702a96`.

## Zachowanie kalkulatora i formularza

Etap `vinyl-flooring` ma jawny wybór Marvo2,235m², Arilla Dark Grey2,5m² albo innego produktu do ustalenia. Model nie zmienia się automatycznie przy zmianie poziomu cenowego. Podkład: nowy Volden6,25m², istniejący Corksystem6m², potwierdzone posiadanie całej ilości albo pozycja do doboru. Użytkownik wybiera po sprawdzeniu instrukcji konkretnego panela; nie deklarujemy uniwersalnej zgodności zamków ani kompletnych parametrów całej podłogi.

Folia/bariera nie jest dodawana automatycznie na podstawie odporności podkładu na wilgoć. Wybór zakupu Conpar100m² albo potwierdzenie, że zakup bariery nie jest potrzebny, jest osobny. Metry taśmy i liczba całych profili progowych pochodzą z obmiaru; pustego pola nie zamieniamy na0 ani nie zakładamy jednego progu. Dopasowanie i mocowania profili pojawiają się dopiero przy dodatniej liczbie odcinków. Zmiana panela/podkładu cofa wcześniejsze potwierdzenia zgodności. Stare pole `panelPackCoverageM2` zachowuje ID dla zapisów, lecz jest ukryte i nie zmienia rzeczywistej paczki znanego modelu; ukryte wartości nie blokują walidacji.

Zachowano istniejący zapas zakupowy10%. Dwa pomieszczenia po5m² dają razem11m² paneli i11m² podkładu. Kalkulator osobnego pokoju pokazuje3 paczki Marvo, ale wspólny koszyk zamawia **5 paczek Marvo, nie6**, oraz2 paczki podkładu Volden. Pozycje bez doboru pozostają widoczne jako niepełna wycena. Starszy zapis bez modelu ilości wymaga ponownego sprawdzenia, nie dostaje automatycznie nowego EAN. Wcześniejsze posiadanie innego modelu nie wyłącza zakupu nowego.

Etap `vinyl-glued` zachowuje wykładzinę rolową i swoje ID. Nie przypisuje do niej samoprzylepnych płytek Ragga ani materiałów click z obcego mapowania. Konkretny produkt rolki oraz jego szerokość, układ i komplet montażowy nadal wymagają osobnego opracowania.

## Rzeczywiste koszyki sklepu

Anonimowy publiczny checkout LiderzyCen, bez zamówień, płatności i danych kontaktowych. Krajowa taryfaPL; przekazany aplikacji kod testowy00-001 nie jest wysyłany do tego sklepu i nie nazywamy taryfy wyceną konkretnego kodu. Cytaty mają ważność10 minut.

| Zamówienie | Materiały | Rzeczywista dostawa | Razem |
|---|---:|---:|---:|
| 1 paczka Volden | 113,88 zł | 16,50 zł | 130,38 zł |
| 2 paczki Volden | 227,76 zł | 20,00 zł | 247,76 zł |
| 5 paczek Marvo | 754,10 zł | 110,00 zł | 864,10 zł |
| 5 Marvo + 2 Volden razem | 981,86 zł | 600,00 zł | 1581,86 zł |
| Te same produkty w dwóch odrębnych zamówieniach | 981,86 zł | 130,00 zł | **1111,86 zł** |

Sklep udostępnia w połączonym koszyku tylko `Kurier Drzwi`600zł. Osobne koszyki mają odpowiednio `Kurier P2`110zł oraz `Kurier Standard`20zł. Różnica470zł wynika z czterech rzeczywistych koszyków, bez dzielenia jednej taryfy lub zgadywania wagi. To potwierdzony wariant opisanych produktów, nie minimum rynku ani kompletny zakup wszystkich prac podłogowych.

## Sprawdzenie i wydanie

Nowe testy importują rzeczywiste funkcje kalkulatora, walidatora, mapowania API i podziału zamówień. Obejmują m.in. EAN/SKU, pełną jednostkę i paczkę, zmienioną cenę i ilość, dwa pokoje, brak automatycznej zamiany modeli, jawne zera, stare zapisy, cofnięcie posiadania, ukryte pola i odrębność wykładziny rolowej. Dowód lokalnego i produkcyjnego HTTP oraz wynik wydania dopisany po zakończeniu.
