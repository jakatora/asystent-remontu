# Historia zweryfikowanych odczytów cen — 2026-10-31, wave147

Cel rozwoju pozostaje aktywny. Ta fala dodaje trwałą historię cen, bez nowych produktów ani ofert. Katalog nadal ma 208 referencji i wpisów zdjęć, 300 źródeł, 265 aktywnych ofert dla 175 produktów oraz 33 wcześniejsze braki.

## Zachowanie dla użytkownika

Poprzednio produkcyjny `/pricing/history` zawsze zwracał `404 verified_history_unavailable`. Nowy odczyt pokazuje historię zaakceptowanych obserwacji, oddzielnie dla konkretnej oferty sklepu, wariantu, placówki i jednostki zakupu. Przełączenie z 6 m² na zestaw 12 m² nie tworzy zmiany ceny między tymi opakowaniami.

Przy historii są nazwa sklepu i jednostka, zapisana kwota różnicy w złotych, data i godzina odczytu oraz możliwość wyboru oferty. Po odświeżeniu ceny panel pobiera aktualną historię. Różnica 1 grosza pozostaje widoczna nawet przy procencie zaokrąglonym do zera. Procent ma polski separator dziesiętny. Pierwszy zapis nie udaje obniżki, pełnej historii sklepu ani potwierdzonej promocji.

Widok wyjaśnia zakres: są to zarejestrowane odczyty, bez dostawy, a nie pełna historia sklepu. Najniższa cena jest opisana jako **najniższa zapisana**. Automatyczne `isRealPromo` jest wyłączone. Średnia próbek nie służy do sugerowania promocji ani nie jest pokazywana w nowym widoku. Brak bieżącej ważnej oferty daje `current:null` oraz brak bieżącej zmiany; wcześniejsze odczyty pozostają historią.

## Dane, bezpieczeństwo i pieniądze

Cache Remontu przechodzi z wersji 2 do 3 w tym samym pliku `/data/remont-prices.json`. Obsługiwany jest także stary format tablicowy. Historia zachowuje rzeczywiste daty i SHA dowodu; nie interpoluje, nie wypełnia dni, nie przesuwa daty po błędzie sklepu. Maksimum to 60 odczytów na ofertę z ostatnich 90 dni, bez obietnicy kompletnego pokrycia tego okresu.

Odcisk tożsamości obejmuje EAN/SKU, sklep, URL, placówkę, wariant, fizyczne opakowanie, jednostkę, identyfikatory produktu i reguły zamawiania. Zmiana tych pól nie może ponownie użyć dawnej serii. Konflikt ceny przy tym samym czasie jest wykluczany. Dane bez prawidłowego dowodu, starsze niż zakres lub nadmiernie przyszłe nie są punktami historii. Kwoty to całkowite grosze; średnia używa sumy BigInt. Wycofane i nieaktualne oferty nie stają się ceną bieżącą.

Zapis nadal korzysta z pliku tymczasowego i atomowego rename. Historia nie zawiera adresów, kodów pocztowych, cookies ani koszyków klientów. Publiczny endpoint nie pozwala dopisywać punktów. Nie zmieniono obliczeń opakowań, rankingu dostaw, TTL wycen, migracji SQLite, płatności ani płatnych API. Lokalna historia kolejnych odświeżeń użytkownika pozostaje zachowana.

Przed migracją zapisano osobną kopię produkcyjnego cache v2: 298 obserwacji, SHA256 `772302a663c9c3975325487c68504469c590ada8250d0b2d5b39831a59065df3`. Po rzeczywistym odświeżeniu powstał cache v3 z 298 obserwacjami i 809 punktami historii, SHA256 `1d324bdb5f70b8515e3ea2b1393fb4a74d0580428385a89c9b9ef724b6fd697f`. Kopię faktycznego v3 uruchomiono w izolowanym restarcie modułu: cztery odczyty Arilli odtworzyły się identycznie. Nie restartowano produkcji dla tego testu. Przy cofnięciu do starego kodu należy zachować kopię historii: stary zapis cache nie obsługuje v3.

## Weryfikacja

- **411/411 mobile**, także na końcowym `ae734f2`; **34/34 scoped API** (6 nowych przypadków historii i 28 przypadków źródeł/opakowań/przeglądarkowych dowodów), bez skipów.
- Typecheck API/mobile oraz **66 chronionych job ID PASS**.
- Pełny przygotowany współdzielony backend **1063/1063 PASS**, bez skipów, izolowana testowa baza.
- Rzeczywisty lokalny HTTP: walidowany odczyt z kontrolowanego upstream, 12000→12500gr, różnica +500gr, migracja v2→v3, restart i brak nowego punktu po błędzie. To kontrolowane kwoty testu, nie nowa cena sklepu produkcyjnego.
- Starszy samodzielny `shared-backend.test.ts` ma 4 błędy zarówno na bazowym `fd8983a`, jak i po zmianie. Oddzielny dowód bazowy to `api-shared-baseline-wave147.log`. Nie zaliczamy tego zestawu jako zielonego ani nie zmieniamy jego starych oczekiwań tylko dla uzyskania zieleni.
- Kontrolowany Edge używa własnych profili `web-history-{local,production}-profile-wave147-r2` i projektu QA HISTORY. Upstream i wcześniejsze punkty są kontrolowane, a API przechwytywane wyłącznie w tych profilach. Wzrost +100gr dla 6 m², spadek −100gr dla 12 m², następnie rzeczywisty przycisk odświeżenia → produkcyjny parser kontrolowanego DTO → nowy punkt i −100gr dla 6 m². Dziesięć serii pozostaje rozdzielonych. To test interfejsu, nie zmiana cen w produkcji.
- Widok 1250 px i 390 px, brak poziomego przepełnienia i błędów JS, projekt po przeładowaniu zachowany. Zrzuty obejrzane. Początkowe błędy helpera (oczekiwanie na onboarding, twarda spacja kwoty, asynchroniczna lista projektów) poprawiono; nie były dowodem awarii aplikacji.
- Pierwszy test HTTP ujawnił przekazanie indeksu przez `filter(isComparableOffer)` jako parametru czasu. Przed wdrożeniem poprawiono na jawne wywołanie z jednym argumentem; kontrola prawdziwego bieżącego HTTP i testy restartu przechodzą.

Rzeczywista produkcja `2026-10-31T12:05:27Z`: historie Professional (10 oddzielnych serii), SilverLux, GoldLux i Arilla zwróciły 200, `Cache-Control:no-store`, spójne daty i kwoty, bez oznaczeń promocji. Rzeczywiste odświeżenie Arilli `2026-10-31T12:06:36.727Z` zwiększyło liczbę odczytów 3→4. Cena przed i po wynosiła 16445gr, **zmiana 0gr**. Nie przedstawiamy kontrolowanej podwyżki jako zdarzenia w prawdziwym sklepie.

Osobna próba publicznego interfejsu **bez przechwytywania API** korzystała z dwóch projektów QA MODELS we własnym profilu `web-production-models-profile-wave147`. Po 5 m² podłogi, 10% zapasu: 5 paczek Arilli 2,5 m² oraz po jednej rolce SilverLux i GoldLux 10 m². Materiały 114523gr + dostawy 12799gr = **127322gr (1273,22 zł)**. Dekork 340,97 zł zawiera jedną wspólną dostawę 17,99 zł; LiderzyCen 932,25 zł zawiera dostawę krajową 110 zł. Dekork potwierdza kod 30-001, Liderzy taryfę PL — interfejs jawnie odróżnia te zakresy. Bariera była jawnie zapewniona, taśma i progi 0; przykład nie obejmuje wszystkich prac i narzędzi.

Zdjęcia Arilli 500 px i obu podkładów 1000 px zostały załadowane. Projekty i kod przetrwały reload, 1250/390 px bez przepełnienia, 0 błędów JS i nieudanych żądań. Następnie na stronie własnego projektu Salon rozwinięto rzeczywiste historie z produkcyjnego API: Arilla 4 odczyty po 164,45 zł, SilverLux 3 odczyty po 152,99 zł, oba z różnicą 0 zł. Widać daty z godzinami i właściwą jednostkę. Oba publiczne zrzuty historii i koszyka obejrzano. Dowody `web-models-production-qa-wave147.json`, `web-history-live-qa-wave147.json`; nie używano profilów użytkownika ani nie wpisywano sztucznych cen na serwerze produkcyjnym.

## Wdrożenia

Źródło backendu: `a65d9742fb436e26446019d84f68dbf6417bf19e`. Końcowy interfejs i dodatkowy test grosza: `ae734f245c69aa5d0f879dec993d1ba8a64ceeae`. Drugi commit nie zmienia źródła backendu, seeda ani silnika wycen.

[PR138](https://github.com/jakatora/przetargai/pull/138) scalono `2026-10-31T12:03:35Z`, head `db0a4da130f9400925aa349bbd605388b1e0552e`, merge `4157eba279282ebaa4b9666e410b00e23d682a28`. Świeży origin/main i snapshot produkcji przed deploy bez driftu. Zmieniono tylko moduł Remontu; 149 innych plików i seed 300 są identyczne. Po wdrożeniu 150/150 plików zgodnych, SHA modułu `dce221c4667f38a8235ff6deae66266fc983a33611b7549b9fbca3a152c49ef7`.

API Railway: `e55f8f1f-231d-4f31-93ce-629cffd33662` **SUCCESS**, utworzone `2026-10-31T12:03:58.456Z`. WWW: `6031d860-7176-4e71-a26d-a5adaeb66477` **SUCCESS**, utworzone `2026-10-31T12:07:07.897Z`. [Publiczna aplikacja](https://asystent-remontu-web-production.up.railway.app) pokazuje źródło `ae734f2`.

Web release `work/remont-web-wave147-r2-release-20261031`: 63 publiczne pliki, 17119810 B, wszystkie SHA zgodne, skan 76 wartości vaulta bez wycieku. Prywatny relay jest poza archiwum publicznym. Health ready, missing0, 9 tras 200, brakujące assety i pliki serwera 404, niepodpisany POST relay 401. Zachowano COOP/COEP i `no-referrer`. Nadal pakujemy web przez `web-build.tar.gz`, ponieważ Railway CLI wyklucza ścieżki `node_modules` również w assetach Expo.

Bez nowych usług, zależności, binarnego iOS/Android ani zmian w obcym WIP. Nie wysyłano testowej bazy lub testów z przygotowanego katalogu backendu; release zawiera tylko pliki produkcyjne.

## Równoległe rozpoznanie brakujących produktów

[Domo-Hurt Toledo/Credenza K338](https://www.domo-hurt.pl/panele-podlogowe/krono-original/variostep-classic/panele-podlogowe-dab-toledo-dab-credenza-k338-8mm-ac4-v-fuga) ma bezpośrednie HTTP200, deklarowane 9 desek/2,22 m², 1285×192×8 mm i zakup pełnej paczki. Natywny koszyk potwierdził 5 paczek po 99,90 zł = 499,50 zł. Karta nie publikuje EAN starej referencji 5907555422774. Odczyt [starej karty Castoramy przez wyszukiwarkę](https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd) wskazuje wycofanie, inne wymiary i nazwę zamka. Nie uznano tych ofert za ten sam wariant.

Domo pokazuje koszt palety „od”; ograniczona próba przejścia natywnym linkiem do kasy nie potwierdziła końcowej taryfy pod kod. Nie dodano aktywnej oferty ani nie podstawiono kosztu kuriera z ogólnej listy. Może to być osobny model po pełnej identyfikacji i sprawdzeniu właściwej kasy. [Taśma brzegowa 5906725207227 w Bricomarché](https://www.bricomarche.pl/tasma-brzegowa-5-mm-x-100-mm-x-50-m) jest nowym tropem z indeksu; bezpośredni odczyt zwrócił 403. Nie obchodzono tej blokady. Indeksowane oferty Gotronik dla przewodu AKS oraz Tupo dla GW180 wskazują niedostępność; same dawne ceny i ogólne „dostawa od” nie stały się ofertami.

Nie przypisano innego EAN, nie dodano towaru „na zamówienie” jako magazynowego ani nie sięgano po fałszywe domeny klonujące sklepy. Dalszy priorytet: brakujące dokładne oferty, jawnie dobrane dostępne modele z prawdziwymi zdjęciami oraz pełne natywne koszyki z dostawą.

Dowody w katalogu czatu `work`: `history-preparation-wave147.json`, `history-http-production-wave147.json`, `history-native-refresh-production-wave147.json`, `history-production-cache-{before,after}-wave147.json`, `history-production-cache-replay-wave147.json`, `api-clean-tests-wave147-r2.log`, `mobile-clean-tests-wave147-r2.log`, `shared-tests-wave147.log`, `web-history-{local,production}-qa-wave147-r2.json`, `web-production-http-wave147-r2.json`, `web-release-integrity-wave147-r2.json`. Cel pozostaje ACTIVE.
