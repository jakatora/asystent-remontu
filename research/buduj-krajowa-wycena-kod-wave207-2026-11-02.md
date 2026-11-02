# W207 — zachowanie krajowej wyceny przy zmianie kodu

W206 poprawił dostęp do Buduj24 przez istniejący podpisany serwis WWW. Publiczny test ponownie wykazał jednak brak wyceny po zmianie kodu pocztowego: sklep czasowo nie odpowiadał także przy nowym połączeniu. Zachowano nieudany przebieg W206 i diagnostykę. Nie oznaczono jego całego publicznego UI jako PASS.

Natywny koszyk Buduj24 wybiera kraj PL i nie przyjmuje kodu pocztowego. Mimo to dotychczas cache tej wyceny był rozdzielony według kodu. Identyczny pełny koszyk miał ważną, potwierdzoną stawkę dla całej Polski, ale po zmianie samego kodu API nie mogło jej wykorzystać. Taki krajowy cache istniał już dla dwóch produktów Elmas.

W207 dodaje do niego Buduj24 z osobnym, rygorystycznym kluczem: przypięte źródła, GTIN, adres karty, fizyczny rozmiar i jednostka, ilości, ceny brutto, pełna suma oraz reguły zakupu. Nie powstaje taryfa wpisana na sztywno. Zmieniona cena, ilość, produkt, adres, jednostka, cięcie lub niewystarczający zapas nie pożyczają starej wyceny.

Wykorzystywana jest wyłącznie rzeczywiście potwierdzona taryfa krajowa PL bez pola postalCode, z poprawnym źródłem, kwotą, skrótem dowodu i czasem. Data sprawdzenia i ważności nie są przedłużane. Dotychczasowy minutowy margines bezpieczeństwa i limit 64 zapisów pozostają. Wycena ABUD nadal wymaga osobnego potwierdzenia nowego kodu; nie pożycza stawki z innego miejsca.

Trzy testy odtworzyły problem (2 FAIL, 1 PASS na W206) i przechodzą po poprawce. Sprawdzają rzeczywisty historyczny koszyk po wyłączeniu połączenia, odwrócenie kolejności linii, odrzucenie dziesięciu zmian oraz koniec ważności bez zmiany oryginalnych dat. Wspólnie z ośmioma testami Elmas: 11 PASS; typy API PASS. Pełną walidację i produkcyjne ograniczenia opisano poniżej. Zmienia się tylko API; zgodna usługa WWW pozostaje na źródle 7362f72880a3e6ff7f64da62d84a5763f2fc7780. Cel rozwoju ACTIVE.


## Końcowa walidacja i wdrożenie

Stan 2026-11-02T16:33:08.287Z. API źródło 3aeffe511df0920bfc812c94b0221b8dcd0fba1f; [PR187](https://github.com/jakatora/przetargai/pull/187), merge 9043b964f5d1a4fb51b9db6f979f3515d1b157b9; deployment 87088847-348b-4b1b-8390-e89a26e9664f SUCCESS. Bundle SHA-256 e87f36413fe5525fba845f9cb1c6c04ed3fd9d0dfed18511c4203cb03faca403. WWW źródło 7362f72880a3e6ff7f64da62d84a5763f2fc7780, deployment 42e5725a-d055-44cb-8590-47019a42c625 SUCCESS, zgodna wcześniejsza wersja bez nowego wdrożenia. Odczyt 150 plików API i63 zasobów WWW zgodny; 149 pozostałych plików API i385 seed wpisów identyczne.

| Zestaw czystych testów | PASS | FAIL / SKIP |
|---|---:|---:|
| Pricing |252|0 /0|
| API lib |179|0 /0|
| Mobile |596|0 /0|
| Adaptery |262|0 /0|
| Wspólny backend |1064|0 /0|

Zestawy częściowo się pokrywają. Typy API/mobile, build pricing i66 dawnych prac PASS. GitHub statuses[] — nie ogłaszamy zielonego CI.

Lokalnie i publicznie po12 UI /10 rzeczywistych odpowiedzi API /2 kopie i odtworzenia. Lokalnie12 HTTP; publicznie7 HTTP (3 zmiany kodu i4 wcześniejsze scenariusze). Zero pageerror i429; żadnych wstrzykniętych wycen. Lokalna ścieżka API do Buduj24 była celowo niedostępna, a osobny proces WWW pobierał faktyczne karty i koszyki. Publiczny test używał nowego profilu i wdrożonych usług. Dodatkowe sprawdzenie dowiodło identycznego skrótu, czasu sprawdzenia i terminu wyceny dla tego samego zwycięskiego koszyka po00-001→30-001, z osobnym potwierdzeniem ABUD dla30-001.

Wycena Buduj24 potwierdzona 2026-11-02T16:15:31.142Z, ważna do 2026-11-02T16:25:31.142Z, była użyta bez wydłużania dat. To historyczny dowód testu, nie bieżąca ważna oferta po tym terminie. Pierwszy plan510,63 zł miał niepełny zakres sprawdzenia; późniejszy502,09 zł używał innej alokacji sklepów. Pierwszy zbyt ścisły test zakładał natychmiastowy wynik502,09 zł, a drugi stałą cenę po eksporcie kopii. Oba nieudane założenia oraz surowe odpowiedzi zachowano. Odrębny test tego samego koszyka potwierdził reuse bez zmiany czasu. Po wygaśnięciu wyceny kopia ma ponownie obliczać ceny i dostawy, nie utrwalać dawny koszt.

Kopia z pustego profilu zachowuje3 referencje, surowe ilości5/5/20 kg,3 jawne wybory automatyczne i kod00-001. Nie eksportuje dowodów automatycznych wycen jako bieżących opłat. Aktualne kopiowanie i odtworzenie zakończyły się potwierdzonym502,09 zł. Przejściowy odnowiony plan510,63 zł jest zachowany w production-shades-purchase-plan.txt. Nie ustalono zmiany jednostkowych cen towarów — zmieniały się potwierdzone układy zakupów.

Remont malowania nadal356,36 zł z dostawą. Sześć materiałów z długimi profilami zachowuje pełne zapotrzebowanie i nieznany indywidualny transport. Niemożliwe1000 kg Grey, niezgodna nazwa koloru i stary niewycenionyCE40 nie dostają fikcyjnej ceny ani podmiany produktu. Katalog pozostaje259 /226 /343 /33; W207 nie dodaje SKU. W całej tej partii dodano4 referencje ze zdjęciami i7 ofert W205.

Cache 382→382, wszystkie 382 starsze lub nowsze obserwacje zachowane. Historia 15997→16344; zachowano 15969, usunięto 28 wyłącznie przez retencję {"60_point_retention":28}, nieoczekiwana utrata0. Wszystkie5 obcych plików roboczych mają niezmienione hashe. Paczki i fixture przeskanowano względem vaulta; brak ujawnionych sekretów. Publiczny adres wsparcia pozostaje publiczny.

Przegląd ścieżki pieniędzy: rzeczywiste kwoty brutto pełnych opakowań, komplet materiałów i osobno potwierdzona dostawa, prawidłowy zakres PL lub kodu, brak przedłużania dat i przenoszenia opłat na zmienione produkty/ceny/ilości. Brak wyceny nie jest zerem; brak produktu nie znika z koszyka. Nie składano zamówień, nie podawano kontaktu, nie wykonywano płatności, zwrotów ani płatnego AI. Dowód rzeczywisty: karty, natywne koszyki, publiczne HTTP i UI oraz świeże odtworzenie kopii.

Artefakty: G:/Projekty/asystent-remontu-work/wave207-20261102/final-proof.json, validation.json, production-country-cases.json, production-country-return.json, production-country-proof.json, production-shades-qa.json, production-shades-backup-proof.json, production-purchase-plan-live.txt, production-price-cache-after-final.json. Nieudane przebiegi W205/W206 oraz wstępne asercje W207 pozostają dostępne w poprzednich katalogach.

Następne priorytety: odświeżać poprzednio najtańszy poprawny plan przed poszukiwaniem dalszych wariantów, aby nie gubić go po wygaśnięciu; rozróżnić w UI zmianę planu/dostaw od zmiany ceny pojedynczego produktu; uzupełniać33 luki i alternatywnych dostawców; przygotować kolejną wersję mobilną z nowym katalogiem. Sprzedawca może okresowo nie odpowiedzieć, a ograniczone wyszukiwanie nie gwarantuje globalnego minimum ani natychmiastowej wyceny. Google Play1.2.0(10) opublikowane, iOS WAITING_FOR_REVIEW według odczytu 2026-11-02T16:33:04.535Z; binaria bez ponownej wysyłki. Cel rozwoju ACTIVE.
