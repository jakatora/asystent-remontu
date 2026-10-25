# Wspólny koszyk i rozszerzenie katalogu — 2026-10-25

## Nowe produkty i rzeczywiste fotografie

Ceny brutto i stan magazynowy odczytano z dokładnych kart, z mikrodata Product/Offer i potwierdzonym EAN. Każda obserwacja ma własny czas i SHA256 w `deploy/shared-backend/verified-offers.json`. Fotografie są z tych kart; brak pobranych binariów w repo. Drugi URL identyfikacji pochodzi z istniejącego katalogu referencyjnego.

| Produkt | EAN | Cena brutto z odczytu | Karta ze zdjęciem | Druga identyfikacja |
|---|---|---|---|---|
| Atlas Uni-Grunt 5 kg | 5905400520026 | 38,50 zł | https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772 | https://www.abud.pl/product-pol-1121-Preparat-gruntujacy-Atlas-Uni-Grunt-5kg.html |
| Acryl-Putz FS20 Finisz 27 kg | 5903973104544 | 66,44 zł | https://sklep.sewera.pl/acryl-putz-fs20-finisz-27kg-p6114 | https://mrowka.com.pl/produkt/gladz-szpachlowa-finisz-fs20-27-kg-acryl-putz-5903973104544.html |
| Atlas SAM 100 25 kg | 5905400279245 | 41,41 zł | https://sklep.sewera.pl/atlas-sam-100-25kg-szybkowiazacy-samopoziomujacy-podklad-podlogowy-p9811 | https://www.bricomarche.pl/szybkowiazacy-samopoziomujacy-podklad-podlogowy-sam-100-25-kg-atlas |
| Atlas SAM 200 25 kg | 5905400279269 | 30,15 zł | https://sklep.sewera.pl/atlas-sam-200-25kg-samopoziomujacy-podklad-podlogowy-p9795 | https://b2c.makchemia.pl/wylewki-samopoziomujace/5233-atlas-sam-200-25kg-2560mm-folia-5905400279269.html |
| Atlas Cerplast 15 kg | 5905400530032 | 120,00 zł | https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884 | https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html |

Katalog po rozszerzeniu: 19 ofert / 12 produktów / 7 sklepów. Nie dodano CN72 z Sewery: karta zwróciła OutOfStock. Nie podmieniono CM11 na CM11 Plus o innym EAN ani worków Goldband25 na30kg.

## Zasady wspólnego koszyka

Wybór do20 istniejących projektów jest jawny i lokalny (`remont.renovation-basket.v1`). Nie łączymy automatycznie wszystkich remontów. Osobny kod i historia ostatnio widzianych cen nie zmieniają ustawień pojedynczych projektów. Usunięte projekty nie są wysyłane do API, brak obmiaru blokuje pełny wynik. Każdy etap przechodzi przez istniejący adapter; backend sumuje ten sam produkt przed doborem opakowań. Dwa etapy z zapotrzebowaniem po2,5l kupują jedno opakowanie5l, nie dwa.

Cała pozycja „Mam”/„Kupione” pomijana jest tylko dla swojego projektu i stabilnego materialId. Sprzeczne zduplikowane wpisy nie usuwają zapotrzebowania. Częściowe zapasy i ręcznie dodane materiały pozostają do osobnej implementacji. UI pokazuje ich wyłączenie; narzędzia i robocizna poza sumą.

Mniejsze koszyki: pełne rozdziały potrzebnych opakowań, do4096kombinacji/80wycen. Większe: do24 wybranych pełnych zestawów i80 unikalnych koszyków sklepowych. Warianty obejmują podzbiory sklepów, alternatywnych sprzedawców i wybrane podziały sztuk (1, połowa, wszystkie poza1). Bez dodatkowych, niepotrzebnych opakowań i bez mieszania rozmiarów tego samego EAN. `searchLimited` i liczba uzyskanych wycen są jawne; nie jest to gwarancja minimum wszystkich kombinacji. Castorama/OBI pozostają widoczne jako niedostępne i nie zajmują miejsc działających integracji. Brak transportu nigdy nie staje się zerem.

## Pułapki wykryte w rzeczywistym odbiorze

Sewera pokazała w koszyku4 puszki farby i poprawną sumę, ale jednocześnie ostrzeżenie „w magazynie jedynie2SZT”. Samo pole ilości i suma nie potwierdzają dostępności. Adapter odrzuca taki koszyk jako `insufficient_stock`, z przyczyną w UI.

Starszy kalkulator self-leveling miał niezarejestrowany `byThickness`, więc masa stale wynosiła1kg. Dodano formułę powierzchnia×grubość×zużycie×rezerwa oraz odtworzenie zapotrzebowania ze starych zapisanych obmiarów. SAM100: aktualna strona producenta https://www.atlas.com.pl/produkt/atlas-sam-100/ podaje1,6kg/m²/mm i5–30mm; historyczne karty w katalogu zawierają2kg, więc parametr na kupowanym worku wymaga potwierdzenia. SAM200: https://www.atlas.com.pl/produkt/atlas-sam-200/ podaje2kg/m²/mm i25–60mm. Adapter odrzuca niezgodny zakres grubości; nie zamienia litrów gruntu na kilogramy. Brakujące oferty nadal są jawne. Pozostałe legacy założenia zużycia wymagają dalszego audytu; nowy koszyk nie gwarantuje pełnego pokrycia wszystkich prac w katalogu.

## Odbiór

219 testów logiki i HTTP,55 regresji istniejących tras, typecheck mobile/API/silnika oraz743ID/15plików. Test HTTP potwierdza konsolidację powtarzanego jobId, jedną dostawę za zamówienie i blokadę pełnej sumy przy nierozpoznanej pozycji w drugim etapie. Testy wyboru materiałów sprawdzają stare zapisy, „Mam/Kupione”, usunięte projekty i rozdzielenie zapotrzebowania od opakowań. Przy zmianie sygnatury biblioteki TypeScript najpierw odbudowano deklaracje zależności; samo typecheck API czytało wcześniejszy plik .d.ts.

Rzeczywiste wyceny5 nowych produktów z kodem00-001: odpowiednio19,90/125,00/37,90/37,90/37,90zł transportu. To różne koszyki, nie wspólny zamówiony transport. Nie składano zamówień. Wyniki aktualne na czas odczytu, nie stały cennik.
