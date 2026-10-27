# Silikon: pełny zestaw, przekrój spoiny i wybór sklepu — 2026-10-27

Naprawiono rzeczywisty błąd pracy silicone-refresh: formularz zapisywał siliconeLength, a stara formuła czytała linearMeters/perimeter. Nowy silikon potrafił mieć 0 i znikał z zakupów. Teraz zarówno silicone-refresh, jak i silicone-sealing mają 3 pozycje materiałów: wybrany biały silikon, niezależnie zadeklarowany żel do usuwania resztek i wybraną taśmę. Taśma w silicone-sealing nie jest dodatkowo udawanym narzędziem.

## Produkty i źródła

- Soudal Silicone Remover 100 ml, EAN5411183041899: [Rab-Dom45,00zł](https://www.rabdom.pl/pl/p/SOUDAL-SRODEK-DO-USUWANIA-SILIKONU-100ml/12481) i [Sewera54,86zł](https://sklep.sewera.pl/srodek-do-usuwania-silikonu-silicone-remover-100ml-soudal-p21277). Rzeczywiste odczyty HTML/API, główny EAN, wielkość i producent. [Producent](https://www.soudal.pl/diy/produkty/pistolety-i-materialy-pomocnicze/srodki-czyszczace/silicone-remover) potwierdza żel100ml, użycie po usunięciu starej spoiny i10–15min na resztki. Nie pomylono z aerozolem Sealant Remover400ml. Zdjęcie z karty Rab-Dom zwraca200image/webp.
- Soudal Sanitarny STOP biały280ml, EAN5411183200326: [Realbud23,00zł](https://realbud.com/pl/p/SOUDAL-SILIKON-SANITARNY-KUCHNIA-LAZIENKA-PLESN-STOP-BIALY-280ml/75056922). [Producent](https://www.soudal.pl/diy/produkty/masy-uszczelniajace/silikony/silikon-sanitarny-stop) i [GrupaPSB](https://www.grupapsb.com.pl/produkt/silikon-sanitarny-stop-bialy-280-ml-soudal-5411183200326.html) potwierdzają produkt. Foto tej samej karty Realbud200image/jpeg.
- Rab-Dom17798 reklamuje biały STOP, ale rzeczywiste API podało inny EAN; adapter prawidłowo odrzucił product_ean_not_confirmed. Nie dodano tej oferty i nie zmieniano walidacji, żeby ją przepchnąć.
- [Zwykły sanitarny Soudal](https://www.soudal.pl/diy/produkty/masy-uszczelniajace/silikony/silikon-sanitarny) EAN5411183157064 pozostaje innym produktem. Taśmy BlueDolphin30mm EAN5907758515952 i38mm EAN5907758507285 również zachowują osobną tożsamość.

## Obmiar i wybór

Objętość w ml = długość[m] × szerokość[mm] × głębokość[mm] × (1+zapas/100), dla jawnie opisanego prostokątnego przekroju. Domyślne5×5mm i10% zapasu są widoczne i edytowalne. Rzeczywisty przekrój/dobór podłoża potwierdza użytkownik zgodnie z kartą. Taśma: obie krawędzie, czyli2×długość×ten sam zapas. Żelu nie przeliczamy z długości: osobna liczba opakowań100ml, domyślnie1, jawne0 pozwala pominąć zakup.

Karta [STOP](https://www.soudal.pl/sites/default/files/soudal_api/document/TDS_silikon_sanitarny_STOP_2025.pdf) określa minimalne wymiary5mm, zalecane2:1 i konsultację powyżej30mm szerokości, pozwala na akryl i wyklucza m.in.kamień naturalny. UI wyjaśnia wybór standardowego modelu do ceramiki/szkła/emalii lub STOP również do akrylu. To nie jest zamiana na najtańszy dowolny silikon. Instrukcje poprawiono: mechaniczne usunięcie spoiny przed żelem, szpachelka zamiast bezpośredniego kontaktu skóry, pełne utwardzenie według karty zamiast obietnicy gotowości każdej spoiny po24h.

Nie zaokrąglamy ml i metrów do całych kartuszy/rolek przed wspólnym koszykiem. Surowe ilości zachowuje engine, pricing adapter i getRequiredQuantity. Model sanitary-sealant-v1 działa w obu kalkulatorach i we wszystkich trzech wariantach cenowych, z tym samym wybranym modelem produktów. Nieznane/nieprawidłowe wartości nie stają się darmowym materiałem.

Starszy JSON bez tego modelu jest tylko projekcją odczytu:3materiały wymagają potwierdzenia w obmiarach, również dawny silikon0. Nie zmieniono zapisanych danych ani migracji. Edytor projektu obsługuje teraz obie prace. Własna resztka120ml tego samego silikonu pokrywa110ml,100ml nie pokrywa; obcy model/jednostka nie usuwa zakupu. Ilości i tożsamość muszą pasować, a zmiana modelu wymaga ponownego Mam/Kupione.

Dodatkowo podłączono istniejące, już jawnie oznaczone kartusze Soudal280ml w wall-tiles-bathroom, grout-only, toilet-installation i kitchen-countertop: ścisła kontrola job/ID/marki/jednostki/ref pozwala przeliczyć ich zapisane liczby kartuszy na ml. Nie dotyczy dowolnego silikonu ani kartusza310ml. Wybrany Soudal zachowany we wszystkich trzech poziomach. Nie wyliczano nowych długości narożników z powierzchni ścian.

## Rzeczywiste koszyki

ProductionHTTPS2026-10-27T02:47:53.945Z, kod testowy00-001; bez zamówień/płatności. Rab-Dom/Realbud podają stawki krajowe realnego koszyka, Sewera sprawdza kod. Pełny adres jest nadal potwierdzany u sprzedawcy.

| Przykład4m spoiny5×5mm,+10%,1opakowanieżelu | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Zwykły Soudal, Rab-Dom |73,49zł|10,50złPocztex|83,99zł|
| Te same produkty, Sewera |96,79zł|19,90złInPost|116,69zł|
| Dwie takie prace, wspólny koszyk Rab-Dom |118,49zł|10,50zł|128,99zł|
| Wybrany STOP, Rab-Dom+Realbud |79,99zł|35,50zł|115,49zł|

Jeden zestaw potrzebuje110ml silikonu,8,8m taśmy i100ml żelu; kupuje1kartusz280ml,1rolkę50m i1opakowanie100ml. Dwa zestawy potrzebują220ml,17,6m i2opakowańżelu; wspólne kartusz/rolka i jedna dostawa oszczędzają38,99zł względem167,98zł za dwa oddzielne zamówienia. Żelu nie uznano za wystarczający na dwie prace bez decyzji użytkownika. Jest to potwierdzone porównanie znalezionych ofert, nie minimum całego rynku.

Wariant bez taśmy i żelu jest jawną decyzją w formularzu; sam silikon do8m spoiny=16,50+10,50=27,00zł. Historyczna kalkulacja bez modelu pozostaje z3brakami i bez pełnej sumy. Regresje wylewka417,20zł i gruntowanie126,99zł zachowane. Ceny są kwotami brutto; brak wyceny nie staje się0.

## Weryfikacja i dalszy zakres

540testów kalkulatora/wycenPASS0skip,1054testy nowego przygotowanego checkoutu backenduPASS0skip,oba typechecki,66legacyID i negatywne mutacjePASS. Pierwszy przebieg shared omyłkowo wykonano w poprzednim katalogu; przed wdrożeniem powtórzono we właściwym remont-shared-catalog-wave46-20261027 i tylko ten wynik jest dowodem tej wersji.

PR45https://github.com/jakatora/przetargai/pull/45,merge b0796dcc437f695898c45b4057850ed909a8f17e. Railway85f2953e-655e-4517-a22c-d90ff3f4f60cSUCCESS2026-10-27T02:46:08.856Z. Nowa migawka148plików,139starychobserwacji zachowanych, tylko2plikiRemontu zmienione i146pozostałych/manifesty zachowane. /auth/me401 bez tokenu. Brak Stripe/płatnegoAI/ruchu pieniędzy.

Katalog110/116 z ofertą,140aktywnych ofert,142obserwacje,2wyłączone,38sklepów,116URLzdjęć. Osobny audyt65niepustychStandard w66pracach:69/230wierszy wycenionych,161bez oferty,9w pełni wycenionych scenariuszy. Poprzednio59/228,169bez,6pełnych. Dodano2wcześniej pomijane/przeniesione materiały.161wierszy to nie161unikalnych produktów. Narzędzia, warunkowe akcesoria i inne wymiary/tiery nadal wymagają pełnego pokrycia; nie ogłaszać całego celu zakończonym. Dalej pozostałe receptury, lokalne stany/ceny, Castorama/OBI/ABUD i łatwiejsza obsługa.

Dowody w katalogu czatu work/catalog-wave46-{production,local,collector,legacy-mutation,predeploy-baseline}-proof.json,core/shared-tests.log i work/catalog-wave46-research/. Projekt QA proj_mvq31d4lrokw1xw5f „Test kompletu — wymiana silikonu4m,spoina5×5mm” utworzono osobno; poprzednie12projektów pozostają. Po utworzeniu6pozycji zakupów(3materiały+3narzędzia),0kupionych.
