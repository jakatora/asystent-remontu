# Rzeczywisty rabat całego koszyka ABUD — 2026-10-31, wave150

Wdrożono porównywanie rzeczywistych cen materiałów po rabacie koszykowym, razem z dostawą. Rozwiązuje to przypadek z wave149, w którym poprawny większy koszyk kończył się `price_changed`. Cel rozwoju pozostaje aktywny; katalog nie zmienił się: 216 referencji i wpisów zdjęć, 309 źródeł, 274 aktywne oferty dla 183 produktów, 33 wcześniejsze braki.

## Wynik dla użytkownika

Rzeczywiste anonimowe koszyki ABUD oraz publiczny interfejs potwierdziły:

| Zawartość | Ceny kart | Rabat koszyka | Materiały po rabacie | Dostawa | Razem |
| --- | --- | --- | --- | --- | --- |
| Po jednej z ośmiu rolek AKS | 2043,10 zł | 20,44 zł | 2022,66 zł | 0,00 zł | **2022,66 zł** |
| Po dwie z tych samych ośmiu rolek | 4086,20 zł | 61,28 zł | 4024,92 zł | 0,00 zł | **4024,92 zł** |
| Jedna rolka 3×2,5 mm², 5 m | 42,70 zł | — | 42,70 zł | 13,00 zł | **55,70 zł** |
| Cztery nowe warianty wave149 | 777,00 zł | — | 777,00 zł | 0,00 zł | **777,00 zł** |

Osiem rolek to osobno wybrane warianty 3×1,5 mm² oraz 3×2,5 mm², każdy o długości 5/25/50/100 m. Nie zmieniamy przekroju instalacji ani nie aliasujemy ich EAN-ów. Dostawa Pocztex Kurier 24 została potwierdzona dla kodu testowego 30-001. To odczyty z 2026-10-31, bez stałego procentu rabatu lub progu wysyłki wpisanego do kodu. Nie złożono zamówienia, nie uruchomiono płatności ani nie przekazano danych kontaktowych.

UI pokazuje „Rabat sklepu na ten koszyk”, cenę przed rabatem i wyjaśnienie, że rabat jest już wliczony w sumę i ceny pozycji. Pozycje sumują się dokładnie do płatnej kwoty materiałów. Rabat jest oznaczony także przy alternatywnych koszykach. Warianty osobnych zamówień pokazują całkowitą oszczędność, obejmującą materiały i dostawy.

## Kontrakt i sprawdzanie kwot

`DeliveryQuote.cartPricing` zawiera walutę PLN, bazową sumę świeżych kart, płatną sumę materiałów, rabat i każdą pozycję: offerId, count, baseUnitPriceGrosze, unitPriceGrosze oraz lineCostGrosze. Obsługa jest przypięta do sprawdzonego ABUD i jego natywnego koszyka. Adapter przed dodaniem do anonimowego koszyka ponownie odczytuje każdą kartę i porównuje jej cenę z bazą wyceny.

Walidowane są ID/EAN/wariant/jednostka, opakowania, ilości i zapas, wartości brutto i ich sformatowane odpowiedniki, suma pozycji, suma koszyka, brak kaucji, dodatkowych produktów, subskrypcji i pakietów. Cena płatna musi być dodatnia i nie wyższa od świeżo potwierdzonej ceny karty. Podwyżka lub zmiana kart nadal daje `price_changed`. Pozostałe sklepy IdoSell zachowują dotychczasowe ścisłe sprawdzanie cen.

Nowy natywny odczyt wykazał, że `prices.base_price` dla zakupu po dwie rolki może być inny niż cena jednej rolki na publicznej karcie. Nie podstawiamy tego pola do katalogu i nie wnioskujemy z niego procentu rabatu. Kwoty płatne pochodzą z `prices.gros`/`worth_gros` i sumy całego koszyka. Cena odniesienia jest osobnym, rzeczywistym odczytem karty. Dla tej ilości suma materiałów wynosi 402492 gr, nie wartość odtworzona z procentu lub zaokrąglenia całego zamówienia.

Biblioteka cenowa sprawdza kontrakt, zgodność wszystkich cen i liczebności oraz dowód, czas, zakres kodu i TTL. Nie przyjmuje rabatu dla innego sklepu, kodu, liczby opakowań, ceny bazowej ani wygasłej wyceny. Ceny wejściowych opakowań do sygnatur, cache i historii pozostają niezmienione. Dopiero serializowany wynik zakupowy dostaje rzeczywiste ceny płatne; po wygaśnięciu rabat i potwierdzona dostawa są usuwane.

HMAC prywatnego relaya obejmuje cały nowy payload. Sprawdzone są podpis odpowiedzi, requestDigest, nonce, rozmiar, czas i TTL; klient dodatkowo potwierdza zgodność korekty z całym zamówieniem. Nowe pola nie rozszerzają listy sklepów lub dozwolonych akcji relaya. Klucz cache nadal obejmuje kod, sklep, pełną zawartość i ceny bazowe.

## Ranking i osobne zamówienia

Wyższa cena katalogowa ABUD nie jest już używana jako dolna granica pozwalająca pominąć nieodczytany koszyk tego sklepu. Potwierdzony rabat może odwrócić wynik porównania. Osobne zamówienia są porównywane według sumy rzeczywistych materiałów i dostaw, zachowując każdą sztukę i zasady zakupu. Algorytm potrafi wybrać niższą sumę mimo wyższej dostawy lub zachować wspólny koszyk, gdy podział traci większy rabat. Sama darmowa wysyłka nie dowodzi już najniższego kosztu sklepu z rabatami koszykowymi.

Duże porównania nadal mają budżet i ograniczony zakres wyszukiwania. W potwierdzonym publicznym przykładzie `searchLimited=true`; pokazujemy najtańszy potwierdzony wariant w sprawdzonym zakresie, nie obietnicę wyczerpującego optimum wszystkich sklepów i podziałów.

## Walidacja

- 170/170 testów biblioteki cenowej, w tym 7 nowych: rabat w rankingu, błędne korekty, przycinanie kandydatów, wygaśnięcie, podziały ilości, wyższy koszt dostawy przy niższej sumie i utrata rabatu przy podziale.
- 44/44 scoped API: rzeczywiste zanonimizowane koszyki obu poziomów rabatu, brak rabatu, błędne kwoty/jednostki/ilości/stock, oddzielny ścisły IdoSell, cache i podmiana podpisanego rabatu. HTTP uruchamia rzeczywisty moduł i potwierdza ceny pozycji oraz niezmienioną historię karty.
- 412/412 mobile, typecheck API/mobile i 66 legacy ID; przygotowany współdzielony backend 1063/1063 PASS, bez pominięć. Cztery znane wcześniejsze błędy starego samodzielnego zestawu API nie są zaliczane jako zielone.
- Rzeczywisty HTTP przygotowanego modułu oraz lokalny i publiczny Edge bez wstrzykiwania cen potwierdziły kwoty 55,70 / 2022,66 / 4024,92 zł. Osiem zapisanych pozycji, zdjęcia wszystkich wariantów, PL/COI, 390 px bez overflow, brak błędów JavaScript. Screenshoty obejrzane.
- Publiczne QA finalnego UI 48b83fe potwierdziło osiem pozycji z ilością dwóch rolek i rabat 61,28 zł. Historia zwykłej ceny rolki 100 m 3×1,5 mm² przed i po wycenie zachowała 41360 gr i identyczną liczbę punktów; koszyk pokazuje niższą płatną cenę bez dopisywania sztucznego punktu lub „promocji” do historii produktu.

Próba szybkiej seryjnej edycji wszystkich ośmiu ilości początkowo dostała HTTP 429 i nieukończony helper nie jest zaliczany jako PASS. Wszystkie zmiany ilości zostały zapisane. Po upływie okna limitu finalne publiczne QA odczytało te zapisane ilości i potwierdziło poprawny rabat. Aktualna instancja `apiLimiter` ma 120 żądań / 60 s i jest współdzielona z wybranymi trasami Fitter/SmartSpiżarka. Nie ustalono, ile ruchu pochodziło z każdego modułu; samo zdarzenie nie dowodzi pętli w Remoncie. Nie zwiększano limitów ani nie zmieniano innych aplikacji. Kolejny zakres: pomiar liczby żądań przy edycji, ograniczanie zbędnych odświeżeń i czytelny Retry-After z zachowaniem formularza/kodu.

## Publikacja i zachowane dane

Źródło obliczeń: **dbbf5182562aaf1d6c6912d02be3d7c4e03c743e**. Finalne UI: **48b83fefafd01ba8b87d2d93993b53f7b833b34a** (oznaczenie rabatu alternatyw i stabilne klucze rozdzielonych cen). Pomiędzy nimi backend, seed i silnik cenowy są identyczne.

[PR 141](https://github.com/jakatora/przetargai/pull/141), head eca6b978521dab6cc53858b85aaa6a057ece0c41, scalony jako **705eccee7962e720656fb61352e8a5c38a566c48**. Świeży snapshot/preflight 150 plików, zero dryfu. Zmieniony wyłącznie moduł Remontu, seed 309 i 149 innych plików zachowane bajtowo. Post-SSH 150/150 zgodne; SHA256 modułu **7160c3d7e3e777910430c92f7861fcca6c12170d58cdcd7ef134b7d33d62c43d**.

API Railway **9b9fe6cc-35c9-45e3-a7da-232bf8da5385 SUCCESS**, utworzone 2026-10-31T13:59:05.967Z. Najpierw opublikowano i sprawdzono API z nowym kontraktem, następnie web/relay, aby stary koordynator nie zignorował korekty materiałów. Przy ewentualnym rollbacku starszego kontraktu najpierw wycofać relay/web, dopiero potem API.

Finalne WWW Railway **01eb44ff-7c26-4622-9554-8ca5f7001944 SUCCESS**, utworzone 2026-10-31T14:08:52.996Z, source48b83fe. Pierwszy web150 29ebd40f-ba89-4bda-84d8-5896730cda7f został zastąpiony R2. Finalny release ma 63 pliki / 17 129 845 B; wszystkie publiczne SHA256 zgodne. 76 wartości vaulta bez wycieku, relay ready, missing0, dziewięć tras200, pliki prywatne404, niepodpisanyPOST401, COOPsame-origin/COEPcredentialless/no-referrer. Nadal archiwum web-build.tar.gz ze względu na obsługę ścieżek node_modules przez Railway.

Cache v3: przed wdrożeniem 1344 punkty / 307 obserwacji, po ukończonym odświeżeniu **1608 punktów / 307 obserwacji**. Wszystkie 1344 wcześniejsze punkty zachowane dokładnie. Snapshot 2026-10-31T14:03:04.081Z, SHA256 **f4eeef51a3e395c0a672fd8a57edba3497ff550d2d522c24f99db0e702ae4c27**. Bez nowych usług, zależności, płatnych wywołań AI i zmian w cudzych WIP.

Najważniejsze dowody w katalogu roboczym: `discount-native-carts-wave150.json`, `basket-discount-live-http-wave150.json`, `discount-preparation-wave150.json`, `pricing-clean-tests-wave150.log`, `discount-clean-api-tests-wave150.log`, `mobile-clean-tests-wave150.log`, `shared-tests-wave150.log`, `web-discount-{local,production}-qa-wave150.json`, `web-discount-{local,production}-qa-wave150-r2.json`, `web-discount-production-{final,final-mobile}-wave150-r2.png`, `web-production-http-wave150-r2.json`, `history-cache-preservation-wave150.json`. Nie nadpisano dowodów wcześniejszych fal.
