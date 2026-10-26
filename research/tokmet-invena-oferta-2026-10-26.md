# Invena WS-20-030-G w TOK-MET — 2026-10-26

Dodano zweryfikowaną ofertę brakującego wężyka, zdjęcie z jego własnej karty i potwierdzony punkt odbioru w Bielsku-Białej. Katalog po włączeniu oferty: **79/103 produkty, 24 braki, 105 aktywnych ofert, 36 sklepów**. Liczba automatycznych integracji dostawy pozostaje **20**; TOK-MET nie otrzymuje wymyślonej stawki transportu.

## Tożsamość produktu

TOK-MET nie publikuje natywnego EAN na tej karcie. Jawnie przejrzany crosswalk wiąże jego pozycję 2806 / SKU WS-20-030-G z referencją EAN 5907798716258. Nie należy przedstawiać tego jako kodu odczytanego ze sklepu.

- [Własna lista TOK-MET](https://sklep.tokmet.pl/94,wezyki_w_oplocie_stalowym.html) wiąże dokładnie link `-2806i` z WS-20-030-G, nazwą długiej końcówki 30 cm i pojedynczą sztuką. Inny wiersz WS-21-030-G opisuje końcówkę krótką i jest odrzucany.
- [Producent Invena, produkt 3559](https://invena.pl/produkt/wezyk-do-bat-w-opl-stal-3-8-dl-konc-30cm-3559) oraz jego publiczna odpowiedź `/api/products/pl/wezyk-do-bat-w-opl-stal-3-8-dl-konc-30cm-3559?lang=pl` potwierdzają WS-20-030-G, 30 cm, 3/8 GW i M10. [Katalog producenta](https://api.invena.pl/storage/7748/Katalog-Instalacje-2025-Invena.pdf), s.60, rozróżnia długą końcówkę WS-20 od krótkiej WS-21.
- Niezależna [główna karta sprzedawcy CS Megastore](https://www.csmegastore.se/i/5469388/invena-anslutningsslang-f%C3%B6r-kranar-l%C3%A5ng-%C3%A4nde-3-8-x-m10-ws-20-030) została pobrana rzeczywistym HTTP 200. W jej głównym nagłówku danych producent Invena, model WS-20-030, opis długiej końcówki i `itemprop=gtin13` 5907798716258 są powiązane z jednym produktem. Zagraniczna cena ani dostawa nie są importowane.
- Referencyjne karty [Castoramy](https://www.castorama.pl/departments/w-w-yk-przy-czeniowy-do-baterii-gw-gz-3-8-x-m10-30-cm-oplot-invena-1-szt-/5907798716258_CAPL.prd) i [OBI](https://www.obi.pl/weze-elastyczne-flex/invena-wezyk-w-oplocie-z-gw-gz-3-8-w-x-m10-30-cm/p/4355574) pozostają źródłami referencji, bez importowania cen z indeksu wyszukiwarki.

CentroBud nadal ma sprzeczny EAN 8429343054242: nie zaimportowano tej oferty ani nie nadpisano jej kodu. API producenta zwraca cenę 12,57 zł, ale rzeczywisty interfejs zgłasza ograniczenie regionu kupującego, więc nie dodano kolejnego sklepu producenta na podstawie samego `available=true`.

## Rzeczywista cena i koszyk

[Karta TOK-MET](https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i), ukryte pole ceny i właściwy wiersz katalogu potwierdzają **11,14 zł brutto/szt.**, VAT 23%, 9,06 zł netto i deklarowane 54 szt. Dostępność nie stanowi rezerwacji dla konkretnej ilości.

Z nowej, izolowanej sesji odczytano pusty `/cart.php`, wykonano wyłącznie opublikowaną operację dodania jednej sztuki 2806, po czym ponownie odczytano cały koszyk. Właściwa pozycja, liczba 1, cena i suma brutto wynosiły 11,14 zł. Odpowiedź operacji dodania zawiera niepowiązane reklamowe 154,66 PLN: parser jej nie używa. Nie podano danych klienta, nie zaakceptowano regulaminu i nie złożono zamówienia.

Kodowanie sklepu to rzeczywiste ISO-8859-2 ogłoszone w HTML przy ogólnym `Content-Type: text/html`. Dekodowanie tego wariantu jest ograniczone do dokładnego origin TOK-MET; inne istniejące integracje zachowują dotychczasowe UTF-8.

## Dostawa i odbiór

Rzeczywisty odczyt dalszego formularza `/buyall.php` pokazał pola danych osoby/adresu oraz dopiero późniejszy wybór wysyłki. Nie uzupełniono tego formularza. Ogólne 16 zł przedpłata / 21 zł pobranie w stopce nie potwierdzają kosztu tego koszyka dla kodu użytkownika. API zwraca `address_required`; nowa oferta może wyceniać materiały, lecz nie tworzy pełnej sumy z dostawą ani dodatkowej automatycznej integracji.

Późniejszy odczyt oficjalnej [tabeli wysyłek](https://sklep.tokmet.pl/tabela_wysylek.html) wykazał wręcz sprzeczność ze stopką: DHL w Polsce 0–30 kg = 20 zł, 31–200 kg = 175 zł, dopłata pobraniowa 10 zł. Nie potwierdzono natywnej masy paczki wężyka ani wyboru metody dla jego koszyka, więc także tych kwot nie podstawiono do porównania. Publiczny `_js/_cart.js?version=1.0.0` pokazuje wysyłanie danych klienta przez formularz przed następnym etapem; nie uruchamiano tych operacji.

Ta sama główna karta jednoznacznie wskazuje wydawanie zakupionych towarów: **ul. Bystrzańska 106A, 43-300 Bielsko-Biała**, tel. +48 33 821 57 31, pn–pt 7–19, sob. 8–13. Adres dodano do aplikacji jako jeden punkt sklepu. Bez wymyślonych współrzędnych, odległości czy lokalnych oddziałów. Przed wyjazdem użytkownik potwierdza cenę, stan i gotowość odbioru. Łącznie katalog punktów ma teraz 10 potwierdzonych adresów.

## Weryfikacja

Pięć nowych testów sprawdza konkretny wariant, wiązanie SKU, walutę, cenę brutto, właściwy koszyk, awarie i izolację sesji. Testy importują produkcyjną logikę. Rzeczywisty odczyt kolektora zapisał 11,14 zł, właściwy EAN, link i zdjęcie; HEAD zdjęcia zwrócił 200 image/jpeg. Zmiana chronionego ID, ceny, wariantu, ilości lub dołożenie cudzej pozycji prowadzi do odmowy.

Pełny lokalny bundle HTTP: 79 rozpoznanych / 24 brakujące, dwie sztuki wężyka 22,28 zł; brak pełnej sumy wysyłkowej i `address_required`. Odbiór dwóch sztuk: 22,28 zł, transport 0, dojazd wyłączony. Pierwotny koszyk nadal 790,83 zł. 373 testy aplikacji/API PASS, 0 skip, typecheck API/mobile oraz kontrola 66 chronionych ID z negatywnymi mutacjami PASS.

Wspólny backend: 1054 testy PASS, 0 skip, uruchomione szeregowo po ujawnieniu kolizji blokady SQLite przy domyślnej równoległości. Razem 1427 sprawdzonych testów. PR [28](https://github.com/jakatora/przetargai/pull/28) scalony i dołączony do zadania, źródło `2eb6d0d2bf34fe079a6e4e073087e521ba6f20a4`, merge `2ab356eabac96159b4c988bf75978fdfb24ecad6`. Railway `57e4a262-cfff-4829-9f0f-64f944391b98` SUCCESS 2026-10-26T05:06:09.475Z. Produkcyjny HTTPS potwierdził te same wyniki i pierwotne 790,83 zł. Nowy kolektor sam odczytał ofertę 2026-10-26T05:06:45.122Z; active=true, error=null, running=false. GitHub nie miał zdefiniowanych checks/statuses — nie jest to zielone CI.

Dowody w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave22-research/{tokmet-live-observation,tokmet-native-cart-proof,tokmet-contract-proof,invena-products-proof}.json`, `work/catalog-wave22-local-live-proof.json`, logi `catalog-wave22-*.log`. Pozostałe próby Bricoman MP75 zakończyły się rzeczywistym 403; MyBudio ma sprzeczne 4 m / marka przy EAN profilu 3 m, a gładkie Nati to inny kod niż struktura. Nie dopisano ich do licznika.

Rzeczywisty interfejs Expo po odświeżeniu zachował wybrane TOK-MET i dwie sztuki wężyka: 22,28 zł jako jawna suma części materiałów, bez niepotwierdzonej dostawy. Zdjęcie sklepu załadowało się w obu kartach (712 × 673); widoczne były pełny adres odbioru i godziny. Dowody: `outputs/tokmet-product-confirmed-20261026.png` i `outputs/tokmet-selected-price-address-20261026.png`. Po teście usunięto wyłącznie dopisane dwie sztuki i przywrócono „Najtańszy zestaw”: 3 prace, Standard, 1 posiadana pozycja, kod 00-001, bez dodatkowych materiałów. Widoczna suma wróciła do 637,43 zł materiałów + 153,40 zł dostawy = 790,83 zł (`outputs/tokmet-original-basket-restored-20261026.txt`). Karty projektu użytkownika nie zmieniano. Nie wykonano nowego wydania iOS/Android. Pełny cel pozostaje aktywny: 24 brakujące referencje, Castorama/OBI i uwzględnianie ilościowego stanu w planowaniu zakupów nadal wymagają pracy.
