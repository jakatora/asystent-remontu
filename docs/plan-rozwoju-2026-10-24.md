# Plan rozwoju Asystenta Remontu

Aktualizacja: 2026-10-25. Cel właściciela: użytkownik ma wiedzieć, ile materiałów potrzebuje i gdzie kupi je najtaniej. Aplikacja ma być prosta w obsłudze i pokazywać zdjęcia rzeczywistych produktów.

## 1. Wiarygodne ilości i porównanie zakupów — backend podłączony, pierwszy katalog rzeczywistych ofert działa

- [x] Wspólna podstawa ilości dla kalkulatora, budżetu i porównania sklepów. Nie traktować metrów kwadratowych jako litrów lub kilogramów. Pozycje bez pewnego dopasowania pokazane jako niewycenione.
- [x] Rozdzielić zapotrzebowanie od ilości zaokrąglonej do opakowań. Do API przekazywać zapotrzebowanie, aby nie zaokrąglać go drugi raz.
- [x] Poprawnie odczytywać liczby z przecinkiem i egzekwować zakresy pomiarów.
- [ ] Jawnie rozróżnić cenę jednostki i opakowania, zachowując zgodność istniejących danych.
- [x] Najtańszy pełny koszyk i zakup w kilku sklepach dostępne z głównej nawigacji; algorytm uwzględnia mieszane wielkości opakowań.
- [x] Niepełna, demonstracyjna, niedostępna lub nieaktualna oferta nie może wygrywać jako najtańsza aktualna oferta. Próg aktualności: 7 dni; nie oznacza gwarancji ceny na kasie.
- [x] Przy porównaniu pokazać zakres: porównane sklepy, daty cen, kompletność koszyka i nieuwzględnioną dostawę/dojazd.
- [x] Podłączyć mobilne porównanie do istniejącego backendu i rzeczywistych cen. Stan 2026-10-25: 14 ofert 7 produktów z Castoramy, OBI, Sewery, Realbudu, Rab-Dom, Buduj24 i Zino; jawne daty i linki. Wszystkie cztery materiały przykładowego malowania mają ofertę. Bez cen demonstracyjnych.
- [x] Uruchomić automatyczny odczyt dostępnych kart przy starcie i co 6 godzin oraz ręczne odświeżenie. Obecnie serwer potwierdza 11 ofert; 3 źródła Castoramy/OBI pozostają niedostępne. Cena brutto i dokładny wariant wymagane. Wygaśnięcie lub potwierdzony brak dostępności usuwa ofertę, także po restarcie.
- [ ] Poszerzyć katalog i zapewnić stabilne feedy/API sklepów. Castorama/OBI nadal blokują bezpośredni odczyt serwerowy. Błąd nie zmienia ceny ani daty; po 7 dniach oferta wypada z porównania.
- [x] Umożliwić wybór liczby rolek taśmy 50 m i opakowań folii 20 m² w nowym projekcie; 0 oznacza brak potrzeby zakupu. Starsze projekty zachowują liczbę rolek i opakowanie folii po przeliczeniu jednostek.
- [x] Porównać cały zestaw z kosztami dostaw podanymi przez użytkownika. Jedna opłata za zamówienie w sklepie; sprawdzane kombinacje sklepów, również mieszane opakowania. Pusty koszt dostawy nie oznacza 0 zł.
- [x] Kod pocztowy wprowadza osoba korzystająca z aplikacji. Zmiana kodu czyści wcześniejsze stawki. Ustawienia zapisane osobno dla projektu; zmiana obmiarów, regionu lub jakości wymaga ponownego sprawdzenia stawek.
- [x] Automatyczna wycena konkretnych koszyków Rab-Dom, Realbud i Zino po wpisaniu kodu; ilości, dostępność, ceny brutto, kurier i płatność z góry potwierdzane w anonimowym koszyku. Taryfa krajowa PL jest jawnie opisana. Ręczne opłaty usunięte z głównej ścieżki.
- [x] Sewera: wycena rzeczywistego koszyka dla kodu, magazyn Katowice, potwierdzony kurier/paleta i płatność z góry. Buduj24: krajowa taryfa koszyka, z progami darmowej dostawy.
- [x] Po odświeżeniu informować o podwyżce lub obniżce za opakowanie tego samego produktu w tym samym sklepie. Zachować lokalny punkt odniesienia i nie udawać aktualizacji po błędzie odczytu.
- [ ] Castorama i OBI: uzyskać działający dostęp serwerowy do kalkulatorów dostaw. Nie udawać, że taryfa krajowa potwierdza obsługę każdego adresu. Koszty dojazdu poza sumą.
- [ ] Zweryfikować zakres lokalizacji, dostawy i ceny brutto oraz porównanie tej samej specyfikacji produktu. Uwzględnić stan „mam już” i „kupione”.

W pierwszym pakiecie rozdzielono cenę jednostki i opakowania w modelu oraz poprawiono farbę i grunt w malowaniu ścian. Pozostałe dane cenowe wymagają osobnego przeglądu; nie przeliczano całego katalogu automatycznym mnożnikiem.

Odbiór: regresja malowania 40 m² / 1, 2 i 3 warstwy; liczby 2,5 i 0,8; koszt wymaganej liczby opakowań, a nie wyłącznie najniższa cena puszki; niepełny koszyk nie wygrywa z pełnym. Brak ceny pozostaje widoczny. Testy rzeczywistych modułów i kontrola typów.

## 2. Prostszy wygląd i fotografie produktów — rozpoczęcie razem z etapem 1

- [x] Czytelne główne akcje projektu: plan, zakupy i porównanie cen, wykonanie.
- [x] Dodatkowe materiały, narzędzia, budżet i zdjęcia uporządkowane jako drugorzędne widoki, bez utraty funkcji.
- [x] Karta produktu w porównaniu: rzeczywiste zdjęcie z wiarygodnego źródła, pełna nazwa, wielkość opakowania, liczba opakowań, koszt i link do oferty. Pierwszy zakres: cztery materiały malowania.
- [x] Większe pola dotykowe głównych akcji i zakupów, czytelne etykiety oraz ciemniejszy akcent i tekst; zachowane PL/EN.
- [x] Pierwsze 5 fotografii konkretnych produktów, dopasowywanych po ID, EAN lub dokładnym URL źródła. Brak zdjęcia i błąd pobrania mają widok zastępczy.
- [ ] Uzupełnić fotografie pozostałych produktów i sprawdzić rzeczywisty build na telefonie.

Odbiór: kontrola na szerokości telefonu; widoczność ceny, opakowań i głównej akcji; przejście do właściwego sklepu; brak nieprawidłowych fotografii i rozjechanego układu po błędzie obrazu.

## 3. Krótszy kreator i pomiary

- [ ] Start od celu, np. „Odświeżam pokój”, zamiast wymagania znajomości branżowej nazwy pracy.
- [ ] Pytania o stan i efekt faktycznie zmieniają plan. Zapis odpowiedzi oraz wariantu jakości per projekt.
- [ ] Obliczanie ścian z wymiarów pokoju, z odjęciem okien i drzwi; możliwość podania znanego metrażu.
- [ ] Użyteczny wynik przed opcjonalnymi szczegółami; zachowanie i wznowienie szkicu.

Odbiór: dwa różne stany powierzchni dają odpowiedni zakres; budżet i pomieszczenie zachowane po ponownym otwarciu; testy pomiarów oraz startu z wybranego rodzaju pracy.

## 4. Wspólne zakupy dla całego remontu

- [x] Wspólny koszyk z jawnie wybranych prac i pomieszczeń, dostępny z listy projektów. Wybór zachowany po ponownym otwarciu.
- [x] Użyć istniejącej konsolidacji backendu, przekazując wszystkie etapy i ilości przed zaokrągleniem. Pokazać nierozpoznane materiały ze wszystkich etapów.
- [x] Pominąć całe pozycje oznaczone „Mam” lub „Kupione”, osobno dla projektu. Narzędzia i ręcznie dopisane pozycje poza porównaniem, z jawną informacją i liczbą ręcznych pozycji.
- [ ] Obsłużyć częściowo posiadane ilości, ręczne pozycje i narzędzia we wspólnej liście. Nie zastępować ich wymyślonym dopasowaniem.
- [x] Porównać ten sam kompletny koszyk w sklepach; oddzielić materiały i dostawy. Dla dużych remontów jawnie oznaczyć wybór ograniczonej liczby wariantów zamiast gwarantować wynik pełnego przeszukania.

Odbiór: wspólny grunt/farba dla dwóch pomieszczeń zaokrąglone raz; własne materiały zmniejszają zakup; zmiana wymiaru aktualizuje wszystkie widoki bez kasowania ręcznych oznaczeń zakupów.

## 5. Prowadzenie przez pracę i kontakt z fachowcem

- [ ] Następna czynność, przygotowanie, lista potrzebnych produktów i kontrola zakończenia etapu.
- [ ] Czas schnięcia zgodny z wybranym produktem; istniejące checklisty i ostrzeżenia wykorzystane w kontekście zadania.
- [ ] Koszt robocizny z obmiaru i stawki, bez mnożnika ceny materiałów.
- [ ] Status zapytania do fachowca odzwierciedla rzeczywiste doręczenie; do tego czasu możliwość udostępnienia przygotowanej treści do własnego wykonawcy.

## 6. Kontrola kosztów, trwałość i weryfikacja z użytkownikami

- [ ] Planowane, wydane i pozostałe; rzeczywiste wydatki i zdjęcia rachunków.
- [ ] Kopia i odtworzenie projektów ze zdjęciami oraz opcjonalne współdzielenie listy.
- [ ] Pięć testów użyteczności i wywiady o rzeczywistych remontach.
- [ ] Mierzyć czas do poprawnej listy, kompletność cen, przejścia do ofert, ukończenie zakupów i powroty do kolejnego etapu.

Publikacja aktualizacji dopiero po sprawdzeniu nowego buildu: utworzenie projektu, porównanie cen, otwarcie oferty, zakupy offline i ponowne uruchomienie. iOS przez Codemagic.

## Weryfikacja pierwszego pakietu 2026-10-24

100 testów logiki i HTTP przeszło, bez pominięć. Kontrolowane ceny i DAO w testach HTTP nie są dowodem aktualnych cen produkcyjnych sklepów. W rzeczywistej aplikacji Expo uruchomionej lokalnie sprawdzono utworzenie projektu z powierzchnią 40,5 m², zapis, ponowne wejście, nawigację, zdjęcia i opakowania. Kontrola typów mobile, pricing-service oraz API przeszła.

Kontrola zachowania identyfikatorów: `node scripts/check-content-identifiers.cjs` — 741 ID zachowanych w 15 plikach. Stary skrypt bash nie działa na tym komputerze z powodu braku dystrybucji WSL; przenośna kontrola porównuje identyfikatory z HEAD.

Pierwszy pakiet był lokalny. Wcześniejsze niezacommitowane zmiany mapowań, EAN i lockfile pozostawiono poza nim. Aktualny stan integracji poniżej.

## Podłączenie rzeczywistych ofert — 2026-10-24

Istniejący wspólny backend otrzymał moduł `/api/remont/*`, bez nowego serwera i bez zmian baz pozostałych aplikacji. Deployment Railway `4ce626e9-6bac-4331-925a-3c09d542ef53` ma status SUCCESS. Mobilny klient domyślnie wskazuje ten moduł.

Pierwsze obserwacje pochodzą z faktycznego odczytu kart 2026-10-24: farba Śnieżka Barwy Natury biała 5 l w Castoramie i OBI oraz grunt Knauf 5 l w Castoramie. Każda ma oryginalny czas, URL i skrót treści źródła. Skrypty testowe i demonstracyjne feedy są jawnie oznaczone i nie mogą odświeżać się jako rzeczywiste oferty. Próba pobrania co 6 godzin nie gwarantuje odświeżenia: obecnie sklepy blokują fetch serwera. Nadal potrzebna stabilna integracja sklepowa.

Dowód produkcyjny przez rzeczywistego klienta aplikacji: `/health` 200, `/auth/me` bez tokenu 401, 3 oferty dostępne. Dla malowania 40,5 m² wyceniona część zakupów kosztuje 255,46 zł w dwóch sklepach wobec 271,48 zł w Castoramie — różnica 16,02 zł, bez dostaw. Taśma i folia pozostają jawnie niewycenione. Nie jest to pełny koszt remontu ani dowód najniższej ceny na całym rynku.

162 testy kalkulacji, kolektora, parsera, serializacji i HTTP PASS (0 pominiętych), dodatkowo 68 testów dotychczasowych tras wspólnego backendu PASS. Typecheck mobile, API i price-collector PASS. Podgląd porównania uproszczono do materiałów: bez powtórzonych sum robocizny i podwójnych kart produktów. Kosztorys pozostaje oddzielnym widokiem. Aktualizacja Android/iOS nie została jeszcze opublikowana.

Instrukcja odtworzenia integracji i granice danych: `deploy/shared-backend/README.md`.

## Pełne materiały malowania i odświeżanie — 2026-10-25

Dodano rzeczywiste oferty farby, taśmy i folii w Sewerze oraz gruntu w Realbudzie. Katalog obejmuje 7 ofert, 4 produkty i 4 sklepy. Nowe źródła zostały odczytane automatycznie na serwerze 2026-10-25 o 09:54:26–09:54:30 UTC, po wdrożeniu `48d46563-366d-43bf-ae4c-f877c7e21091` (SUCCESS). Zachowano aktualny backend PrzetargAI 1.1.6 z deploymentu `28e56cec-c10a-4735-8d08-f3008c09c138`. Nie wdrażano starego lokalnego checkoutu.

Odbiór przez rzeczywisty klient mobilny po HTTPS: wspólne `/health` 200, `/auth/me` bez tokenu 401. Dla 40,5 m², 2 warstw, wydajności 10 m²/l, 1 rolki taśmy 50 m i 1 folii 20 m² wszystkie 4 materiały mają ofertę, brak niewycenionych pozycji. Znaleziony zestaw: 2 puszki farby 197,00 zł, grunt 35,48 zł, taśma 14,72 zł, folia 8,45 zł; razem **255,65 zł** (Sewera 220,17 zł i Castorama 35,48 zł). Żaden pojedynczy sklep nie pokrywa całej listy. Dostawy, narzędzia i robocizna są poza sumą; to zakres pilotażowy, nie dowód najniższej ceny na całym rynku.

W podglądzie 390 × 844 sprawdzono nowy projekt `proj_mvnnone1288u42uor`, polski przecinek, nowe liczby taśmy/folii, zapis i ponowne otwarcie, wszystkie cztery karty oraz faktycznie załadowane zdjęcia taśmy i folii. Sumę z rozbiciem po sklepach przeniesiono nad tabelę; daty pokazują zakres 24–25.10.2026. Natywne wydanie Android/iOS nadal wymaga odbioru i publikacji.

169 testów modułów kalkulatora, kolektora, parserów, cache, serializacji i HTTP PASS, 0 pominiętych; 68 regresji dotychczasowego backendu PASS. Typecheck API i mobile oraz kontrola 741 ID w 15 plikach PASS. Dodano przypadki cen netto/brutto, różnych wymiarów produktu, wygaśnięcia w strefie Warszawy, niedostępności i restartu cache, materiałów posiadanych oraz zgodności starych projektów.

Następne kroki: rozszerzyć realny katalog i liczbę ofert dla każdego produktu, uwzględnić koszt dostaw/lokalny odbiór, edycję pomiarów istniejącego projektu oraz posiadane ilości wszystkich materiałów. Potem wspólny koszyk wielu prac i pomieszczeń zgodnie z etapem 4.

## Więcej sklepów i cały zestaw z dostawą — 2026-10-25

Użytkownik doprecyzował, że miejsce dostawy zależy od osoby korzystającej z aplikacji. Kod pocztowy jest polem projektu, a nie globalną lokalizacją właściciela. Przyjmuje zapis 00-000 lub pięć cyfr. Zmiana kodu usuwa wpisane koszty dostaw. Kwoty i kod wracają po ponownym uruchomieniu widoku; nie przechodzą do innych projektów ani zapytań innych użytkowników.

Dodano Rab-Dom (taśma 30 mm × 50 m i gruba folia 4 × 5 m), Buduj24 (taśma) oraz produkty Sewery: Dulux EasyCare 9 l, Atlas GTA 18 kg i Acryl-Putz ST10 20 kg. Razem **13 obserwowanych ofert / 7 produktów / 6 sklepów**. Produkty są dopasowane po dokładnym EAN i wariancie; zdjęcia pochodzą z kart produktów. Wszystkie 10 źródeł z działającym odczytem serwerowym odświeżyło ceny po ostatecznym wdrożeniu 2026-10-25, 10:39:18–10:39:27 UTC. Trzy wcześniejsze obserwacje Castorama/OBI pozostają ze swoją rzeczywistą datą i limitem 7 dni.

Nowy algorytm porównuje kombinacje sklepów, sumuje ilości przed zaokrągleniem do opakowań i dolicza jedną podaną opłatę za całe zamówienie z każdego faktycznie użytego sklepu. Dobiera również mieszane rozmiary opakowań. Najniższa cena pojedynczego produktu nie musi prowadzić do najniższej sumy z dostawami. Niepełne zestawy nie dostają zwycięskiej pełnej kwoty. Jeżeli koszt dostawy nie jest znany, wynik jest niepotwierdzony lub opisany jako najtańszy spośród policzonych wariantów; brak opłaty nie jest traktowany jako darmowa wysyłka. Zakres dokładnego wyszukiwania: do 10 sklepów i 50 rozpoznanych produktów; przekroczenie limitu jest jawne.

**Granica obecnego wdrożenia:** ostateczne kwoty dostaw użytkownik odczytuje z koszyków sklepów dla swojego adresu i wpisuje w aplikacji. Udostępniono źródła warunków oraz jawne stawki początkowe dla Sewery, Rab-Dom i Buduj24. To nie jest automatyczny kalkulator końcowych taryf wszystkich sklepów; stawka „od”, podana cena netto lub próg promocyjny nie stają się domyślną potwierdzoną opłatą. Dostawa liczona w Polsce, w brutto, z kosztów wprowadzonych przez użytkownika. Własny odbiór ma 0 zł opłaty za wysyłkę, z jawnym wyłączeniem dojazdu i koniecznością potwierdzenia dostępności placówki.

Przykład kontrolny dla 40,5 m²: same najtańsze produkty 248,33 zł z 4 sklepów. Po wpisaniu **kontrolnych, niezweryfikowanych w checkoutach** dostaw (Sewera 19,90 zł, Castorama 20 zł, OBI 20 zł, Realbud 30 zł, Rab-Dom 17,99 zł, Buduj24 15 zł) algorytm wybiera 2 sklepy: materiały 255,65 zł + dostawy 39,90 zł = **295,55 zł**. To dowód poprawnego uwzględniania dostaw, nie oferta realnego transportu za tę kwotę. Nowe projekty nie zawierają tych testowych stawek.

Deployment Railway **a1c22f04-4918-452b-a825-625538a265c6 — SUCCESS**. Bazą była świeża kopia działającego backendu 48d46563; zachowano inne aplikacje i ich dane. Rzeczywisty klient mobile po HTTPS potwierdził health 200, auth/me bez tokenu 401, nowy katalog, odświeżone daty, poprawną sumę oraz izolację kosztów i kodów między zapytaniami. 181 testów modułów i HTTP PASS (0 pominiętych), 55 regresji istniejących tras backendu PASS; typecheck mobile/API/pricing-service i 743 ID w 15 plikach PASS. Podgląd web 390 × 844: zapis ustawień, przeładowanie, zmiana kodu z usunięciem stawek, wariant własnego odbioru oraz końcowa suma i zdjęcia. Nowe wydanie natywne pozostaje do publikacji.


## Automatyczne koszyki dostaw — 2026-10-25

Wdrożono główną ścieżkę bez ręcznego wpisywania opłat: po podaniu pięciu cyfr kodu aplikacja automatycznie pobiera wyceny koszyków Rab-Dom, Realbud i Zino. Sprawdza dokładne produkty, liczbę opakowań, dostępność, ceny brutto, kuriera i płatność z góry. Odbiór osobisty, automaty, punkty i transport wyceniany indywidualnie nie są porównywane jako dostawa do domu.

Każda kombinacja zamówień jest liczona z faktyczną dostawą całego koszyka danego sklepu. Uwzględnia to wagę, liczbę paczek i progi bezpłatnej wysyłki. Nie kupujemy dodatkowych, niepotrzebnych opakowań dla rabatów. Przekroczenie zakresu dokładnego porównania jest jawne. Brak ceny transportu nie staje się zerem.

Dodano ofertę Śnieżka Barwy Natury 173 5 l w Zino. Katalog obejmuje 14 obserwacji 7 produktów w 7 sklepach. Trzy sklepy mają automatyczną wycenę transportu. Kod zapisywany jest lokalnie dla projektu; dawne ręczne i kontrolne opłaty nie są przenoszone do automatycznych wycen. Wynik pokazuje kwotę materiałów, dostaw i łączny koszt, przewoźników, czas sprawdzenia, zdjęcia i linki do konkretnych produktów.

**Rzeczywisty odbiór 2026-10-25:** komplet do malowania 40,5 m², 2 warstwy, 1 taśma i 1 folia: materiały 274,03 zł + dostawy 75,50 zł = **349,53 zł**. Rab-Dom 26,99 zł z dostawą Pocztex, Realbud 68,92 zł z kurierem, Zino 253,62 zł z DPD. Zmniejszenie farby z dwóch puszek do jednej obniżyło dostawę Zino z 40 do 20 zł. Są to rzeczywiste wyceny koszyków, a nie dawne opłaty kontrolne. Najtańszy wynik dotyczy uzyskanych wycen.

**Granica aktualnej integracji:** te sklepy zwracają taryfę dla Polski, nie ostateczną wycenę zależną wyłącznie od kodu. UI opisuje ten zakres. Dostępność konkretnego adresu potwierdza sklep przy zakupie. Sewera wymaga oddziału i pełnego adresu; Castorama, OBI i Buduj24 nie mają jeszcze automatycznej integracji dostaw. Nie przedstawiamy stawki „od” ani braku transportu jako potwierdzonej ceny.

187 testów logiki/HTTP i 55 regresji istniejących tras PASS, bez pominięć. Kontrole typów i 743 ID w 15 plikach PASS. Dodatkowo rzeczywisty HTTPS: dwa kody, brak/błąd kodu, ignorowanie dawnych ręcznych opłat, zmiana ilości, health 200 i auth 401. W podglądzie 390 × 844 potwierdzono automatyczne liczenie, zapis kodu po przeładowaniu, zmianę kodu, ukrycie starej sumy przy niepełnym kodzie i alternatywę odbioru własnego.

Backend Railway bba0472f-2608-40ff-99fb-47e69926494b ma status SUCCESS. Zachowano aktualne moduły i dane innych aplikacji. [PR3 backendu](https://github.com/jakatora/przetargai/pull/3) scalony. Nowa wersja Android/iOS nie jest jeszcze opublikowana.

Następna kolejność prac:

1. Uzyskać stabilną integrację dostaw dla pozostałych czterech sklepów oraz potwierdzenie obsługi kodu/adresu, szczególnie transportu paletowego i lokalnego.
2. Rozszerzać dokładny katalog i fotografie, aby kolejne rodzaje prac miały pełny zestaw z potwierdzonym transportem.
3. Odjąć posiadane materiały i połączyć zakupy wielu prac oraz pomieszczeń.
4. Odebrać rzeczywisty build na telefonie i opublikować nowe wydanie aplikacji.


## Sewera, Buduj24 i zmiany cen — odbiór 2026-10-25

Produkcja: Railway 2e258fae-2d1a-4fb4-bd5f-47f616e3d998 SUCCESS, 2026-10-25 12:21 UTC (13:21 Warszawa). Automatycznie wyceniane są koszyki pięciu sklepów: Rab-Dom, Realbud, Zino, Sewera i Buduj24. Sewera rzeczywiście otrzymuje kod użytkownika i pokazuje wysyłkę z Katowic; Buduj24 i wcześniejsze trzy sklepy zwracają jawnie opisaną taryfę krajową PL. Nie wymagamy ręcznego wpisywania stawek. Nie składamy zamówień ani nie podajemy fikcyjnych danych kontaktowych.

Sewera: publiczny checkout /zamowienie i get_order_delivery_cost pozwalają wycenić konkretnego kuriera/paletę dla kodu bez danych osobowych. Kontrola block_order=1 wyklucza zerową, zablokowaną wycenę. Buduj24: anonimowy koszyk, kraj PL, kurier i płatność z góry; literalne fragmenty HTML z odpowiedzi AJAX dekodowane bez wykonywania JavaScript. Darmowa dostawa dla 27 taśm potwierdzona bezpośrednio w adapterze, nie przez porównanie aplikacji przekraczające limit 80 koszyków. Publiczne karty Sewery cache60s po URL+cenie, osobne sesje koszyków; timeout Sewery20s, pozostałych12s. Najpierw pełny koszyk każdego sklepu, potem pozostałe kombinacje. Częściowy brak wycen jest odróżniany od całkowicie niedostępnego sklepu.

**Rzeczywisty wynik HTTPS i UI:** malowanie40,5m²/2warstwy/1taśma/1folia, materiały264,09+dostawy48,90=**312,99 zł**. Sewera220,17+23,90 InPost30kg=244,07; Realbud43,92+25,00=68,92. W porównaniu z wcześniejszym uzyskanym wynikiem349,53 zł różnica36,54 zł wynika z rozszerzenia wycen, nie ze zmiany ceny produktu. To najtańsza spośród uzyskanych wycen, nie deklaracja najniższej ceny całego rynku. Zmiana ilości farby powoduje nową wycenę. Brak kodu usuwa sumę, błędny kod daje400, dawne ręczne zera nie wpływają na wynik.

Castorama i OBI nadal wymagają działającego dostępu serwerowego: Castorama503 również dla publicznych modułów formularza, OBI404 dla karty i publicznego webinterface. Brak kluczy tych sklepów w vaulcie. UI pokazuje retailer_access_required i nie podstawia opłaty0. Nie kopiowano cookies przeglądarki ani nie obchodzono zabezpieczeń. To otwarte zadanie integracyjne; nie uznawać wszystkich czterech żądanych sklepów za zakończone.

Ręczne Odśwież ceny rzeczywiście pobiera źródła; priceRefresh zwraca potwierdzone i nieodczytane oferty, współdzieli trwający odczyt i ogranicza nowe partie do1/60s. Nieudany odczyt nie zmienia daty starej obserwacji. Mobile zachowuje ostatnio widzianą cenę w remont.price-seen.v1:<projectId>; porównuje ten sam EAN/produkt+ofertę+sklep+opakowanie+jednostkę, wyłącznie nowsze obserwacje. Podrożał/Taniej o kwotę za opakowanie i stara→nowa cena są widoczne przy ofertach oraz w podsumowaniu. Zmiana ilości/sklepu/rozmiaru nie tworzy fałszywej zmiany ceny. Kontrolowane testy HTTP potwierdziły +1,00 i −2,00 zł; rzeczywisty rynek nie zmienił ceny podczas odbioru. UI po prawdziwym odświeżeniu pokazał brak zmian w11 potwierdzonych ofertach,3 bez nowego odczytu. Nie wstrzyknięto fikcyjnych zmian do produkcji.

Walidacja:194 testy logiki/HTTP PASS,0skip;55 regresji istniejących tras PASS; typecheck mobile/API/pricing-service i743ID/15plików PASS. Podgląd Expo web1280×720: pełna suma312,99, zdjęcia, zakres kod/kraj, odświeżenie11/3 i rozwinięte przyczyny braku Castoramy/OBI. Zrzut outputs/asystent-remontu-sewera-zmiany-cen-20261025.png. To odbiór web, nie nowego buildu Android/iOS; wcześniejszy problem NativeWind darkMode pozostaje osobnym punktem odbioru wydania.

Wspólny backend: commit6ea2b80, [PR4](https://github.com/jakatora/przetargai/pull/4) scalony do main61b29607eb05a8aef3649520ac32704ff63a4c1b. Tylko wygenerowany remont-pricing.cjs i bootstrap obserwacji. Świeża baza przed wdrożeniem work/remont-backend-baseline-expanded-20261025.tar.gz,929483B,SHA256 a61de5c16fa88a60510e7136adda18ea28df554b3d6319e9108962c49a90eedd. Release work/remont-shared-expanded-release-20261025/backend. Zachowano pozostałe aplikacje i ich konfigurację; kolejne deploye PrzetargAI muszą zawierać PR4. Źródła aplikacji na lokalnej gałęzi codex/remont-zakupy-20261024; cudzy WIP ean-overlay/mappings/lockfile/.atlas/PROPOZYCJE zachowany poza commitem.

**Pozostałe priorytety:** dostęp API/feed do Castoramy i OBI, szerszy katalog i fotografie, materiały już posiadane/kupione oraz wspólny koszyk wielu prac, odbiór na fizycznym telefonie i wydanie Android/iOS. Nie opublikowano nowego wydania natywnego. Dowód produkcji work/remont-expanded-delivery-production-proof.json, kopia w outputs/asystent-remontu-sewera-buduj24-dowod-20261025.json.
