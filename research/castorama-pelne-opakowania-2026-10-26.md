# Pełne opakowania i długości: cztery nowe oferty — 2026-10-26

Zweryfikowano w rzeczywistej przeglądarce cztery dokładne karty Castoramy: aktualną widoczną cenę brutto zakupu, EAN, wariant, pełną jednostkę handlową i aktywną sprzedaż wysyłkową. To zwiększa pokrycie obecnej listy do **95/103 produktów**, z **8 brakami**, **121 aktywnymi ofertami**, 36 sklepami i 20 automatycznymi integracjami dostawy. Katalog zawiera 123 obserwacje, w tym dwie wyłączone Rodimax. Zdjęcia pozostają 103/103.

| Dokładny produkt | EAN | Fizyczny zakup i cena brutto |
|---|---|---|
| [GoodHome Arilla Dark Grey](https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd) | 5059340969756 | paczka 9 sztuk, 2,5 m², 132,45 zł |
| [GoodHome Ragga Ele Marble](https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-ragga-ele-marble-1-3-m2/5059340802435_CAPL.prd) | 5059340802435 | paczka 7 sztuk, 1,3 m², 64,97 zł |
| [Fola 5 mm × 10 cm × 50 mb](https://www.castorama.pl/tasma-brzegowa-fola-5-mm-x-10-cm-x-50-mb-5-m2/5906725207227_CAPL.prd) | 5906725207227 | jedna rolka 50 mb, 35,48 zł |
| [Form PCV 30 × 216 cm biały](https://www.castorama.pl/parapet-wewnetrzny-pcv-form-30-x-216-cm-bialy/5906725219640_CAPL.prd) | 5906725219640 | jedna cała deska 2,16 m, 178 zł |

Odczyty odpowiednio: `2026-10-26T07:12:02.842Z`, `07:12:15.709Z`, `07:16:15.115Z`, `07:14:35.197Z`. Ważność ręcznego potwierdzenia wynosi dokładnie 24 godziny od przechwycenia każdej karty; ponowne uruchomienie importu nie przesuwa terminu. Są to obserwacje operatora, nie ukończone automatyczne odświeżanie Castoramy. Kontekst przeglądarki był demonstracyjny 00-001 / Warszawa 5 Wola. Nie zaimportowano ceny ani zapasu placówki do oferty krajowej i nie potwierdzono dostawy pod inne kody.

## Dlaczego cena opakowania wymaga osobnego potwierdzenia

Dla Arilla 52,98 zł/m² jest reklamowaną ceną powierzchni, a 132,45 zł ceną zakupu pełnej paczki. Dla Ragga widoczne są 49,98 zł/m² i 64,97 zł/opak.; nie odtwarza się ceny opakowania przez mnożenie i zaokrąglanie. Odczytuje się rzeczywistą kwotę zakupu. Pierwotna tabela techniczna tej samej karty musi potwierdzać powierzchnię, liczbę elementów, markę i kod. Te dane są dodatkowo wiązane z widoczną tabelą AX. Podmieniona lub zduplikowana tabela, inne pokrycie, brak kodu albo sama reklama za m² nie wystarczają.

Parapet kosztuje 178 zł za całą sztukę długości 216 cm. 82,41 zł/m nie jest ceną tej sztuki. Długość paczki 2,16 m musi zgadzać się z wymiarem w dokładnym nagłówku. Taśma Fola ma 50 mb w rolce; 5 m² i 7,10 zł/m² nie zastępują długości i ceny rolki. Ilości z pomieszczeń sumuje się przed zaokrągleniem do pełnych zakupów. Dla parapetów należy nadal dopasować rozkroje do osobnych okien; suma długości nie jest szczegółowym planem cięcia.

Zwykły HTTP wszystkich czterech kart zwrócił 503, co zapisano w `work/catalog-wave25-research/http-proof.json`. Dla złożonych jednostek powierzchniowych i długości brak odrębnego dowodu widocznej pełnej ceny przy przyszłym HTTP 200 daje `browser_package_review_required`; sama cena JSON-LD nie zdejmuje ręcznej proweniencji. Zmiany jednostek nie osłabiają istniejącego importu zwykłych opakowań.

## Pozostałe produkty i sprzedawcy

[Diall 20 m²](https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd), [Toledo 2,22 m²](https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd) i [Archi 80 lewe](https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd) mają obecnie na sprawdzonych kartach status `SoldOut` i brak potwierdzonej oferty wysyłkowej. Nie dopisano ich jako dostępnych ofert tylko dlatego, że widoczna jest dawna cena lub informacja o sprzedaży stacjonarnej.

[Corksystem LVT 6 m²](https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd) za 73,99 zł sprzedaje przedsiębiorca Corksystem przez platformę. Nie jest to koszyk Castoramy Polska. Ta karta wymaga odrębnego przypisania sprzedawcy i wyceny jego wysyłki; hasło o darmowej dostawie nie zostało taryfą całego remontu. Import dodatkowo odrzuca obcego sprzedawcę przypisanego do Castoramy.

Nadal wymagają potwierdzenia: Budmat UD27 3 m 0,5 mm, Cersanit Facile 50, Toledo 2,22 m², Diall 20 m², Paradyż Petro Grey G2, Nati Bianco struktura, Archi 80 lewe i Corksystem 6 m². Nie zmieniono ID ani nie podstawiono podobnych dostępnych produktów. Castorama i OBI nadal wymagają potwierdzenia dostawy. Pełny cel rozwoju pozostaje aktywny.

## Kontrole

396 testów aplikacji, kalkulatorów, pricing i API oraz 1054 wspólnego backendu uruchomione szeregowo PASS: **1450 testów, 0 skip**. Nowe przypadki sprawdzają pełne ceny, ułamkowe powierzchnie/długości, tabelę techniczną, odrębnych sprzedawców i brak udawanej wysyłki. Typecheck API/mobile i kontrola 66 chronionych ID z negatywnymi mutacjami PASS.

Rzeczywisty HTTP gotowego lokalnego bundle: 95/103, 8 braków, 121 ofert, 16 obserwacji z ręczną ważnością. Koszyk 2,6 m² Arilla + 1,31 m² Ragga + 51 mb Fola + 2,17 m parapetu wymaga po dwóch fizycznych opakowaniach/sztukach i kosztuje **821,80 zł materiałów**. Pełna suma z niepotwierdzoną dostawą pozostaje pusta. Pierwotny koszyk nadal 790,83 zł.

Źródła dowodowe w katalogu czatu: `work/catalog-wave25-research/*-browser.json`, `reviewed-observations.json`, `http-proof.json`, `catalog-wave25-core-tests.log`, `catalog-wave25-local-live-proof.json`, `catalog-wave25-predeploy-baseline-proof.json`. Snapshot 148 plików produkcji ma SHA256 `dd3f33b1cbb0213e3829481271b964edbfb5c357ca94910a7db136ca5c6ee9d4`; zachowano 119 dotychczasowych obserwacji i dołożono 4. Obcy WIP i migracje pozostały poza zakresem. Nie wydano binariów iOS/Android.

## Potwierdzone wdrożenie

[PR31](https://github.com/jakatora/przetargai/pull/31) scalono i przypięto do zadania. Źródło `6dfa837137f2cacf62d99b23eb25e1e221325b75`, merge `413afee68588f8921cfcda7170a6db011791f76f`. Railway `124819b5-2b80-48ba-b9cc-260674478246` ma status SUCCESS od `2026-10-26T07:27:22.443Z`. Dwukrotnie sprawdzono brak zmian 148 plików produkcji przed wdrożeniem; zmieniono tylko bundle pricing i katalog obserwacji. GitHub checks/statuses były puste, nie oznaczono ich jako zielonego CI.

Rzeczywisty HTTPS produkcji potwierdził 95/103, 8 braków, 121 ofert, 16 ręcznych obserwacji oraz 821,80 zł materiałów testowego koszyka z pełnych opakowań. Dostawa nie była dopisana jako 0 zł w trybie wysyłki. Kolektor po wdrożeniu (`lastAttemptAt: 2026-10-26T07:27:19.274Z`, `running: false`) dla czterech nowych kart otrzymał HTTP 503. Obserwacje zachowały pierwotną datę i termin wygaśnięcia. `/health` zwraca 200, `/auth/me` bez sesji 401. Dowody: `work/catalog-wave25-production-proof.json` i `catalog-wave25-collector-proof.json`.

Rzeczywisty interfejs poprawnie pokazał 2,6 m² Arilla jako 2 × 2,5 m² za 264,90 zł, z właściwym zdjęciem i ręczną ważnością do 27.10, 08:12 czasu polskiego. Wybór Castoramy dał 807,86 zł jako dostępną część materiałów, a nie pełny remont. Po sprawdzeniu usunięto wyłącznie własną dodatkową pozycję i przywrócono „Najtańszy zestaw”: 3 prace, Standard, 1 posiadana pozycja, 00-001, brak dodatków, 637,43 + 153,40 = 790,83 zł. Dowody `outputs/catalog25-arilla-whole-packs-20261026.{png,txt}`, `catalog25-selected-castorama-20261026.txt`, `catalog25-original-basket-restored-20261026.txt`.
