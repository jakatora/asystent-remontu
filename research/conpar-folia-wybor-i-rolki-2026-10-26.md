# Conpar: osobny produkt, wybór folii i pełne rolki — 2026-10-26

Dodano [Conkret Conpar 0,20 mm](https://folnet.pl/pl/products/paroizolacje-i-hydroizolacje/folie-paroizolacyjne/folie-paroizolacyjne-z-polietylenu-pe/folia-paroizolacyjna-zolta-conpar-0-20-mm-10288.html), EAN **5902096430103**, jako osobną referencję. Fizyczna rolka 2 × 50 m ma **100 m²**, grubość 0,20 mm z tolerancją ±30%. Cena całej rolki to **119,50 zł brutto**, a pierwotny stan wynosił **124 rolki**. Dane pochodzą z rzeczywistego HTTP `2026-10-26T17:28:08.834Z`; dodanie do aplikacji nie przesuwa tej daty.

Zastosowanie pod podłogi drewniane i panele potwierdza [producent Conkret](https://conkret.com.pl/conkret-products/folia-budowlana-conpar/). [Parotec](https://parotec.pl/product-pol-18078-Folia-paroizolacyjna-zolta-CONPAR-0-2-mm-T30.html) niezależnie wiąże kod EAN, wariant T30 i rozmiar 100 m². Zdjęcie Parotec pomimo odpowiedzi HEAD 200 nie ładowało się w aplikacji; nie uznano samego HEAD za dowód. Ostatecznie użyto udostępnionej na oficjalnej karcie ilustracji żółtej rolki Conpar (`Conpar-148mm-nowy.png`). To ilustracja opakowania rodziny Conpar, a dokładny rozmiar i tolerancja pochodzą z rekordu SKU. Rzeczywisty ekran oraz DOM aplikacji potwierdziły załadowany obraz 823 × 905, również po ponownym otwarciu koszyka. Nie zastąpiono go zdjęciem Eurovent ani Conpar Plus.

## Tożsamość, jednostki i zapas

Adapter Folnet rozróżnia natywną `rolka` od `szt.` dla wcześniej obsługiwanej puszki pianki. Dla Conpar przypina produkt 10288, kod sklepu 12-021, EAN, markę, rozmiar 2 × 50 m i grubość ±30%. Wymaga spójnej ceny brutto w formularzu, `product_data` i pierwotnej ofercie JSON-LD. Jedna jednostka zamówienia oznacza całą rolkę, nie 1 m² i nie paletę. Jawny stan jest przekazywany jako liczba fizycznych opakowań; dotyczy to również już obsługiwanej pianki Folnet.

Koszyk wysyła do natywnego kalkulatora liczbę rolek. Nie pobiera opłaty z banneru „od 13,99 zł” i nie uznaje pustej odpowiedzi kuriera za darmową wysyłkę. Przekroczenie 124 rolek jest odrzucane przed zapytaniem o transport. Obmiary z pomieszczeń łączą się przed dobraniem opakowania: 49 + 49 m² to jedna rolka za 119,50 zł, a 100,1 m² wymaga dwóch za 239 zł. Pierwszy wariant oszczędza 119,50 zł względem osobnego zaokrąglania pomieszczeń.

## Jawny wybór produktu

W kosztorysie i wspólnym koszyku pojawia się sekcja „Wybierz folię paroizolacyjną”. Użytkownik może zachować Diall 20 m² albo wskazać Conpar 100 m², sprawdzić parametry i zatwierdzić zmianę. Różnią się kodem, grubością, tolerancją i rozmiarem. UI opisuje te różnice oraz konieczność dobrania produktu do instrukcji podłogi/podkładu; nie podmienia automatycznie starego EAN.

Wybór przechowuje się osobno dla każdego projektu pod `remont.foil-choice.v1:<projectId>`. Wspólny koszyk odczytuje decyzje projektów po wykluczeniu pozycji „Mam/Kupione”. Własna decyzja w koszyku nie nadpisuje projektów. Zachowane są metraż, obmiary, ID i inne materiały; cenę i pełne paczki ponownie liczy API. Uszkodzony zapis lub niewłaściwy produkt wstrzymuje wycenę. Wybór folii współistnieje z wyborem paneli; dotychczasowy zapis modeli paneli nie był migrowany ani zmieniany.

## Weryfikacja i granice potwierdzenia

**1482 testy PASS, 0 skip**: 428 aplikacji/kalkulatorów/pricing/API i 1054 wspólnego backendu uruchomionych szeregowo. Typecheck mobile/API PASS. Walidator 66 chronionych identyfikatorów przeszedł i odrzucił negatywne mutacje usunięcia ID/eksportu oraz wyczyszczenia rejestru. Nowe osiem testów obejmuje natywną kartę, kod, jednostki, cenę brutto, wymiary, stan, żądane liczby rolek, limit zapasu, wybór produktu, przenoszenie z projektu do koszyka oraz rzeczywisty HTTP konsolidacji i odmowy niepotwierdzonego transportu.

Test adaptera metod dostawy używa zapisanej odpowiedzi kuriera do sprawdzenia parsowania i przekazywanych ilości; nie jest dowodem dzisiejszej taryfy Conpar. Bezpośrednia próba natywnej dostawy nie zakończyła się sukcesem: po potwierdzonym odczycie ceny o 17:28 UTC serwer Folnet zaczął przekraczać limit połączenia lokalnie i z Railway (`UND_ERR_CONNECT_TIMEOUT`). Nie dopisano ręcznej stawki ani udanej wyceny. Poprawiono nazwę testowego parametru na rzeczywisty `basketQuoter` i dodano licznik dowodzący jego wywołania, aby test kontrolował zamierzony scenariusz błędu.

Rzeczywisty HTTP gotowego lokalnego bundle oraz HTTPS produkcji potwierdziły **98/104 produkty z ofertą, 6 starszych wariantów bez potwierdzenia, 125 aktywnych ofert, 38 sklepów/punktów i 104 produkty z zapisanym adresem zdjęcia**. Liczba adresów nie dowodzi jednoczesnego działania wszystkich zewnętrznych serwerów obrazów. Jedna rolka kosztowała 119,50 zł, dwie 239 zł; limit zapasu zablokował za duży zakup. Przywrócenie Diall odtworzyło brak jego oferty. Dla wysyłki Conpar serwer zwrócił `needs_delivery_costs`, `quote_unavailable`, `best=null`; koszt materiałów 119,50 zł nie był pełną sumą z dostawą. Pierwotny koszyk nadal kosztuje 790,83 zł. Dowody `work/catalog-wave29-{local-live,production}-proof.json`.

W rzeczywistym UI dodano własną testową pozycję Diall 98 m², wybrano jawnie Conpar i ponownie otwarto stronę. Zachowano metraż i wybór; aplikacja pokazała jedną rolkę za 119,50 zł oraz brak pełnej wyceny dostawy. Dla Folnet widniało też prawidłowe zastrzeżenie: magazyn odbiera zamówienia internetowe po potwierdzeniu, bez sprzedaży stacjonarnej. Przywrócenie Diall ponownie pokazało brak oferty zamiast ceny Conpar. Następnie usunięto wyłącznie własny dodatek testowy. Przywrócony koszyk ma 3 prace, 1 pominiętą posiadaną pozycję, kod 00-001, tryb dostawy do domu i brak wybranego sklepu: 637,43 zł materiałów + 153,40 zł dostaw = 790,83 zł. Dowody UI: `outputs/catalog29-conpar-reloaded-20261026.txt`, `catalog29-diall-restored-20261026.txt`, `catalog29-basket-restored-20261026.txt` oraz zrzut `catalog29-conpar-confirmed-20261026.png`.

Sprawdzano także Volden 20 m² pod innym EAN 5063022038333: API sklepu potwierdziło ofertę 69,18 zł, ale opisy grubości są sprzeczne (nazwa 0,15 mm, tabela 15 µm). Nie został przedstawiony jako równoważny technicznie produkt. Wybrano Conpar z jednoznaczną kartą producenta i tolerancją. Pozostałe sześć starych referencji nadal wymaga własnej dostępnej oferty albo jawnej decyzji użytkownika o innym produkcie.

## Wdrożenie

Zachowano 126 wcześniejszych obserwacji i dopisano jedną: 127 rekordów, w tym 2 wyłączone Rodimax. 19 wcześniejszych cen pozostaje ręcznie potwierdzonych z pierwotnymi terminami wygaśnięcia; nowa obserwacja pochodzi z HTTP. Automatycznych integracji dostawy nadal 20. Ich obecność nie oznacza, że każdy sklep w tej chwili zwraca wycenę.

Świeży snapshot 148 plików ma SHA256 `d1a030189eb7b008277f5b9d85ff5f96c91526f307613357c312f41dbf4d8e0e`. Dwie kontrole braku driftu, ostatnia `2026-10-26T17:54:10.252Z`. Zmiany wspólnego serwera obejmują wyłącznie bundle pricing i plik obserwacji. [PR34](https://github.com/jakatora/przetargai/pull/34) scalono i przypięto: źródło `88496b0635f2c49ac15fd4c6a10230b4e6fbadf2`, merge `a8093c3a7e7b1334b3d49ddf11dc8b8b841305cd`. GitHub checks/statuses były puste; dowodem walidacji są wykonane testy i odczyty.

Railway `231a2f92-b181-421a-9348-1aeecd99f910` osiągnął SUCCESS `2026-10-26T17:56:02.581Z`. Kolektor zakończył pracę (`lastAttemptAt: 2026-10-26T17:55:54.895Z`, `running:false`), zachowując dla Conpar cenę i stan z 17:28 oraz jawny błąd timeoutu. `/health` zwraca 200, `/auth/me` bez sesji 401. Dowód `work/catalog-wave29-collector-proof.json`.

Nie zmieniono chronionych ID/obmiarów, rich/legacy, migracji, manifestów ani obcego WIP. Nie ma nowego wydania binarnego iOS/Android. Cel pełnego katalogu, rzeczywistych dostaw i pobliskich sklepów pozostaje aktywny.
