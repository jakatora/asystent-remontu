# Pełny zestaw Mapei — wybór wiader i drugi dostawca akcesoriów, 2026-11-02

Audyt istniejącej hydroizolacji: kalkulator potrafił wybrać 5 i 10 kg ze wcześniejszymi GTIN oraz 20 kg. Katalog i backend obsługują też 3 kg (8022452249266), 5 kg 124805PL (8022452242489) i 10 kg 124810PL (8022452242496); brakowało bezpośredniego wyboru w kreatorze i edycji.

Dodano jawne wartości hydroSystem 4/5/6 dla tych trzech opakowań. Wcześniejsze 1/2/3 oraz model ilości waterproofing-mapei-v1 pozostają zachowane. Nowy formularz pokazuje potwierdzone opakowania 3/5/10/20 kg, a edycja zapisanego starszego wariantu pozwala go zachować lub przywrócić przed zapisem. Przypisanie nowszego GTIN wymaga wyboru użytkownika. Potrzebne kg, grunt, taśma, narożniki i mankiety są liczone tak samo; wszystkie siedem produktów pozostaje w systemie Mapei. Zmiana tożsamości folii wymaga ponownego potwierdzenia posiadanego zapasu.

## Źródła i sprawdzenie

Rzeczywisty odczyt 2026-11-02 potwierdził Rab-Dom: 3 kg 79,90 zł, 5 kg 112,90 zł, 10 kg 199,90 zł oraz 20 kg 385,00 zł. WinBud: wcześniejsze 5 kg 104,00 zł, 10 kg 198,97 zł i 20 kg 367,70 zł. Starsze warianty nadal mają oferty; nie nazywać ich nieaktualnymi lub automatycznie nie zamieniać na droższy nowszy kod. Dowody current-mapegum-products.json poza repo.

- https://www.rabdom.pl/pl/p/Folia-w-plynie-hydroizolacyjna-MAPEI-Mapegum-WPS-3kg/16590
- https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-5kg-HYDROIZOLACJA-PLYNNA-FOLIA/1906
- https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-10kg-HYDROIZOLACJA-PLYNNA-FOLIA/9873
- https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131
- https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419

Wcześniejszy przegląd dwóch źródeł, fotografii, kart technicznych oraz pełnych koszyków: research/mapegum-opakowania-dostawy-wave165-2026-11-01.md, research/mapegum-dobor-opakowan-wave166-2026-11-01.md i research/hydroizolacja-system-mapei-2026-10-27.md. W drugim etapie tej samej zmiany dodano sklep FUGI.PL dla pięciu identycznych istniejących akcesoriów.

8 testów kalkulatora i dopasowania wariantów PASS, bez skip, typy mobile PASS. Pięć nowych testów sprawdza pełne siedem produktów, dokładne GTIN i opakowania, surowe kg, zachowanie starych danych, formularze i reset posiadanego zapasu po zmianie produktu. Pełny odbiór czystej kopii, rzeczywiste HTTP całych zestawów, UI i publikacja pozostają do wykonania.

## Osobny audyt ATLAS — nie publikowano niepełnego systemu

Przejrzano bieżące karty producenta ATLAS Woder E (2026-09) i Hydroband 3G (2026-08):

- https://www.atlas.com.pl/wp-content/uploads/2026/09/atlas_szybkoschnaca_folia_w_plynie_woder_e_plik_karta-techniczna.pdf
- https://www.atlas.com.pl/wp-content/uploads/2026/08/plik_karta-techniczna-1.pdf
- https://www.atlas.com.pl/produkt/atlas-szybkoschnaca-folia-w-plynie-woder-e/
- https://www.atlas.com.pl/produkt/atlas-hydroband-3g/

Woder E ma odrębne wymagania zużycia/grubości według rodzaju zabezpieczenia, nie wolno przenosić na niego jednej formuły 1,2 kg/m² z Mapei ani dobierać przypadkowych mankietów. Przygotowanie podłoża, rodzaj zabezpieczenia ścian/podłogi, zapas i właściwe akcesoria wymagają osobnego modelu oraz dalszego przeglądu.

Natywne API e-adams.pl potwierdziło pierścień ścienny Hydroband 3G 120×120 mm SKU20003, id13565, brak na stanie (0); podłogowy 425×425 mm SKU20002, id13564, 31,90 zł i tylko 1 sztukę. Sam is_purchasable=true nie wystarcza przy is_in_stock=false. Budom ma ofertę pierścienia podłogowego id1264; to jeszcze nie potwierdzona tożsamość i pełny koszyk. Nie dodano fikcyjnego GTIN, dostawy, dostępności pierścienia ściennego lub kompletnego zestawu ATLAS. Źródła kandydackie zachowano w G:/Projekty/asystent-remontu-work/wave196-20261102.

Katalog pozostaje 249 referencji / 217 potwierdzonych / 330 ofert po integracji FUGI; 32 stare luki nadal otwarte. Backend otrzymuje integrację FUGI.PL. Seed zachowuje wszystkie 364 wcześniejsze obserwacje i dodaje 5 rzeczywistych nowych (łącznie 369). Cel rozwoju pozostaje aktywny.

## FUGI.PL — alternatywa dla pełnego zestawu akcesoriów

Próby pełnej aplikacji na dotychczasowym API zatrzymały się na retailer_connection_unavailable dla WinBud. Nie podstawiono kosztu 0 ani nie zmieniano sieci, TLS, DNS lub proxy. Bezpośrednia lokalna wycena tych samych pięciu akcesoriów dała kuriera 22,50 PLN; z produkcyjnego kontenera jeden odczyt WinBud dał HTTP 200, późniejsza próba skończyła się UND_ERR_CONNECT_TIMEOUT przed odpowiedzią. Potwierdza to zmienną dostępność połączenia. Brak API/transportu jednego sklepu nie powinien blokować kompletnej listy, gdy inny sklep oferuje dokładnie te same produkty.

Nowy sklep FUGI.PL ma pięć natywnie potwierdzonych ofert i autentyczne fotografie, z tymi samymi GTIN co dotychczasowy katalog:

| Produkt / native ID | GTIN | Cena brutto / opakowanie |
|---|---|---:|
| Mapeband W 10 m / 12115 | 8022452113932 | 93,50 zł |
| Narożnik wewnętrzny 90° / 3792 | 8022452113802 | 13,30 zł |
| Narożnik zewnętrzny 270° / 3793 | 8022452113789 | 13,30 zł |
| Mankiety 120×120 mm, pakiet 2 szt. / 3797 | 8022452113925 | 26,90 zł |
| Mankiet podłogowy 300×300 mm, 1 szt. / 3798 | 8022452113895 | 21,90 zł |

Źródła pierwotne są przypięte w fugi-sources.ts: każda podstawowa sekcja summary produktu potwierdza ID, GTIN, SKU, nazwę, cenę z VAT, dostępność i całkowity krok zakupu, a native Store API potwierdza tę samą sztukę handlową, cenę i zdjęcie. Rekomendacje innych produktów nie są źródłem danych. URL zewnętrznego narożnika ma mylące zakończenie -90/, lecz jego GTIN i nazwa jednoznacznie oznaczają profil 270°. Nie zmieniać modelu na podstawie slugu.

Rzeczywisty adapter wykonał 67 HTTP: odczyt pięciu produktów i trzy pełne koszyki. Mały zestaw (1 rolka, 4 wewnętrzne, 1 zewnętrzny, 1 pakiet dwóch mankietów ściennych i 1 podłogowy) 208,80 PLN + 13,99 PLN kurier = 222,79 PLN, osobno potwierdzony dla kodów 30-001 i 00-001. Większy zestaw: 2 rolki, 12 wewnętrznych, 3 zewnętrzne, 2 pakiety po dwa mankiety ścienne, 3 podłogowe — 506,00 + 13,99 = 519,99 PLN. To rzeczywiste koszyki, nie stawki wpisane ręcznie. Nie używano checkout/order, danych kontaktowych ani płatności.

Natywny koszyk domyślnie wybiera paczkomat 11,99 PLN. Integracja dopuszcza wyłącznie dwie sprawdzone pozycje z przedpłatą: Kurier Inpost (flexible_shipping_single:22) i Kurier GLS (:15), a następnie wybiera tańszą rzeczywistą ofertę, ustawia ją i ponownie odczytuje cały koszyk. Paczkomaty i pobranie są wykluczone. Potwierdza PLN, VAT, wszystkie ilości, brak rabatów warunkowych i dopłat, pełne sumy, kraj PL i echo wpisanego kodu oraz dostępną płatność bacs. Polityka https://fugi.pl/dostawa-i-platnosc/ opisuje taryfę krajową zależną od wagi; UI oznacza ją jako krajową PL, bez udawanej personalizacji adresu. Nie przyjęto stawki „od” ani pustej lub zerowej opłaty jako potwierdzonej dostawy.

FUGI wymaga zarówno Cart-Token, jak i publicznego Nonce z tej samej świeżej anonimowej sesji. Sam token dał 401 missing_nonce w zachowanej próbie. Nie obchodzono kontroli — użyto wymaganego nagłówka z normalnej odpowiedzi GET koszyka i izolowanych cookies. Transport ograniczono dla tego origin do pięciu przypiętych ID, dwóch kurierów i adresu zawierającego tylko PL oraz kod pocztowy. Ta sama ścieżka z produkcyjnego kontenera dała GET 200 / GET 200 / POST 201 i dokładnie 1 rolkę 10 m za 93,50 PLN. Nonce/cookies/tokeny nie trafiają do fixture lub logów użytkownika.

20 testów FUGI i poprzednich adapterów ALNAR/Dekorator/HTTP PASS bez skip, typy API PASS. Pierwszy test błędnie oczekiwał od samego parsera karty odrzucenia prawidłowo sformatowanej zmienionej ceny; właściwa kontrola wiąże bieżącą cenę karty z native API. Poprawiony test sprawdza rzeczywistą ścieżkę obu funkcji. Pełna walidacja czystej kopii, lokalne i publiczne koszyki całej aplikacji, końcowy UI oraz publikacja wciąż do wykonania. Produkcja pozostaje W195 do ukończenia odbioru.

## Błąd wykryty w rzeczywistym UI przed publikacją

Pierwszy odbiór przeglądarki potwierdził utworzenie projektu 3 kg, lecz zapisany projekt hydroizolacji nie wyświetlał edytora obmiarów: lista obsługiwanych prac nie zawierała bathroom-waterproofing. Dodano tę pracę oraz właściwy polski opis edytora. Test samej funkcji wyboru wariantów nie wystarczył do wykrycia nieosiągalnego formularza. Wyniki nieudanych prób zachowano; pełny odbiór poprawionej wersji zostanie wykonany ponownie.

## Odbiór czystej kopii — przed publikacją WWW

Źródło API: cdaf9078bdd6b55fd4b6e12a6184072fedd5f74a. Źródło interfejsu po naprawie rzeczywiście wykrytego braku edytora: 61f64ecd0a830b8ebfdac7a9c50267aa827b1c96. Ponowne zbudowanie modułu z poprawionego UI daje identyczny bundle API 7d0155ccfd79a1c56bfa2e5db7103357ddaa6916a3cf45e5019afa8a08e17236.

576 mobile, 237 pricing, 165 API lib, 196 adapterów, dodatkowe 30 regresji transportu WooCommerce i 1064 shared PASS bez skip (grupy częściowo się pokrywają); typy API/mobile/pricing i 66 ID zachowane. 8 lokalnych scenariuszy HTTP oraz 19 lokalnych scenariuszy rzeczywistej przeglądarki PASS bez podstawiania wycen dostaw. UI sprawdził utworzenie projektu, pełne siedem materiałów, stare GTIN i undo, zapis edytora, trzy prace, surowe 19,8 kg, dwa pakiety po dwa mankiety zamiast trzech osobnych pakietów, kopię i przywrócenie ustawień, jawny dobór wiader 3/5/10/20 kg, odświeżenie, częściowy koszyk, wszystkie pięć istniejących zdjęć dopasowanych po GTIN, natywny link produktu, 320 i 390 px.

Nieudane próby testów zachowano. Po wykryciu rzeczywistego braku edytora poprawiono aplikację. Pozostałe poprawki dotyczyły automatyzacji: nazwa projektu ma placeholder, odnośnik React Native otwiera adres przez Linking bez href, w kopii ilość zakupowa 9 kg jest prawidłowym zaokrągleniem trzech wiader 3 kg przy surowym zapotrzebowaniu 6,6 kg, a odpowiedzi pośrednie przy trzech zmianach opakowań nie są odpowiedzią dla końcowego wyboru. Wspólne prace wybrano faktycznymi checkboxami zamiast zakładać automatyczny wybór przy imporcie kopii do używanej sesji.

WWW: 63 zasoby / 17 312 142 B, 77 wartości vaulta sprawdzonych / 0 wycieków. 8 z 9 plików hostingu identycznych z W195; zmienia się tylko wygenerowany prywatny relay z nowym adapterem. PR177 merged, head 54f934f4e79849d9ca306e36693da43caed64898, merge 9d507e4c37a8bf05a3d433d47e0737b3714f990e. GitHub statuses=[]; nie jest to deklaracja zielonego CI.

API deployment 08817aa8-dde0-4eb5-9219-ef2a6d482f8f SUCCESS 2026-11-02T07:11:27.247Z. Snapshot z działającego kontenera potwierdził wszystkie 150 plików, seed 369 i identyczny bundle. Publiczne HTTP i publikacja WWW pozostają w toku; końcowy stan będzie dopisany osobno.

## Końcowy stan publiczny — 2026-11-02

API i WWW opublikowane oraz odebrane. API deployment 08817aa8-dde0-4eb5-9219-ef2a6d482f8f SUCCESS 2026-11-02T07:11:27.247Z. WWW deployment 388e45f7-2c16-45d0-bc1f-2dbac26bd837 SUCCESS 2026-11-02T07:15:47.421Z. Źródło UI 61f64ecd0a830b8ebfdac7a9c50267aa827b1c96, źródło API cdaf9078bdd6b55fd4b6e12a6184072fedd5f74a. Wersja https://asystent-remontu-web-production.up.railway.app.

8 publicznych scenariuszy rzeczywistego HTTP i 19 scenariuszy publicznego UI PASS bez błędów strony, 429 lub podstawiania wycen. 63 zasoby zgodne po SHA256, trasy aplikacji 200, brakujące/prywatne pliki 404, anonimowy POST prywatnego relay 401, polski dokument i nagłówki hostingu zachowane. Działający backend ma dokładnie przygotowanych 150 plików, 369 obserwacji seed i właściwy hash bundle. Katalog: 249 referencji / 217 potwierdzonych / 330 ofert, 32 wcześniejsze luki pozostają.

W teście trzech pomieszczeń każde potrzebuje surowych 6,6 kg folii, łącznie 19,8 kg. Przy zachowaniu trzech różnych wybranych GTIN zestaw dziewięciu produktów miał potwierdzoną sumę 1286,46 PLN (779,10 Rab-Dom + 507,36 WinBud; obie dostawy rzeczywiście 0 po sprawdzeniu koszyków). Po jawnym włączeniu doboru wiader w każdym z trzech projektów: siedem grup materiałów, 970,36 PLN materiały + 24,49 PLN dostawy = 994,85 PLN. Wybrano FUGI dla dwóch rolek taśmy 187,00 + 13,99 kurier, Rab-Dom dla 3 l gruntu 113,70 + 10,50 oraz WinBud dla jednego wiadra 20 kg i pozostałych akcesoriów 669,66 + 0. Różnica między tymi wariantami zakupu wynika z doboru opakowań i podziału zakupów. Historia cen pięciu ofert FUGI ma po cztery rzeczywiste punkty i delta 0.

Sam FUGI ma pełny zestaw pięciu akcesoriów: dla trzech prac 506,00 PLN + 13,99 kurier = 519,99 PLN; brakuje mu folii i gruntu. UI zachowuje brak pełnej ceny remontu, pokazuje dostępną część i brakujące pozycje. Taryfa FUGI pozostaje krajowa PL mimo przekazanego i potwierdzonego kodu. Rzeczywiste wyceny pojedynczych nowych wiader i akcesoriów: 3 kg → 510,89 PLN, 5 kg → 504,48 PLN, 10 kg → 471,09 PLN, stary wariant 5 kg → 487,42 PLN. To przykłady dla zapisanych obmiarów i bieżących odczytów, z różnymi wariantami towaru.

Część wcześniejszych odpowiedzi API miała needs_delivery_costs z istniejącym potwierdzonym best: inne konkurencyjne koszyki nie zdążyły się wycenić. UI prawidłowo ostrzega o niepełnym porównaniu; późniejsza końcowa wycena rodziny wiader miała compared. Nie deklarujemy globalnego minimum poza sprawdzonymi ofertami i wariantami. Kontrola końcowa 2026-11-02T07:18:24.733Z potwierdziła 207 wystąpień wycen ważnych w momencie ich obserwacji, a wyceny ostatniego widocznego porównania nadal były wtedy ważne. Nie odnawiano dat ani nie przedłużano ważności starszych zapisów.

Cache produkcyjny: 362 → 367 obserwacji, 12 869 → 13 210 punktów historii. Zachowano 12 862 wcześniejsze punkty; 7 usuniętych jest dokładnym skutkiem istniejącego limitu 60 punktów na ofertę, sprawdzonym odtworzeniem rzeczywistej klasy RetailPriceHistory. Wszystkie 364 wcześniejsze obserwacje seed zachowane; pięć nowych pochodzi z natywnych odczytów. Brak syntetycznej historii. Własny lokalny serwer PID 23312 / session 69824 zamknięty poprawnie (1667 merchant HTTP łącznie we wszystkich lokalnych próbach); wszystkie własne konteksty przeglądarki zakończone.

Dalsze prace: testy z remontującymi i ekipami, czas oczekiwania na niepełne konkurencyjne wyceny, etykieta dostępności nazwy projektu w kreatorze, czytelniejsze scalanie brakujących pozycji rodziny opakowań w wybranym pojedynczym sklepie, 32 wcześniejsze luki oraz oddzielny kompletny model ATLAS po weryfikacji brakujących akcesoriów. Nie włączono płatności, afiliacji ani komunikacji do klientów. Cel rozwoju pozostaje aktywny.
