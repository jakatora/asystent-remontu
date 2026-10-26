# Budmat: cena internetowa i konkretny punkt odbioru — 2026-10-26

Potwierdzono dwa kanały zakupu profilu Budmat UD27, EAN **5907738940163**, długość 3 m, grubość 0,5 mm. W [Castoramie](https://www.castorama.pl/profil-sufitowy-budmat-ud27-3-m/5907738940163_CAPL.prd) cała sztuka kosztuje **5,98 zł brutto**. [Bricomarché](https://www.bricomarche.pl/ksztaltownik-sufitowy-ud30-300-cm-srebrny) ma ten sam kod jako „Kształtownik sufitowy UD30 300 cm srebrny”: cena **9,99 zł brutto za sztukę** została potwierdzona dla **Bricomarché Poznań (Al. Solidarności)**. Nie jest przypisana do całej sieci.

Odczyty rzeczywistego DOM/AX pochodzą odpowiednio z `2026-10-26T07:56:16.087Z` i `2026-10-26T07:58:28.431Z`. Oba są jawnie ręcznymi potwierdzeniami ważnymi dokładnie 24 godziny. Ponowny import nie przedłuża dat. Nie są dowodem gotowego automatycznego adaptera cen ani transportu.

## Cena całego produktu

W Castoramie reklama 1,99 zł/m nie jest ceną całej trzymetrowej sztuki. Pierwotna tabela potwierdza długość 3000 mm, jedną sztukę i kod. Zbiorcza paczka 192 sztuk nie zastępuje jednostki zakupu. Semantyczne m/mb w tytule jest akceptowane wyłącznie wraz z takim dowodem długości i jednej sztuki. Lokalny zapas Wola nie został przeniesiony na sprzedaż krajową.

Obserwacja Bricomarché wymaga nazwy wybranego oddziału w nagłówku i sekcji dostępności, dokładnego EAN, marki BUDMAT, 3000 mm, 0,5 mm, aktywnego przycisku zakupu i widocznej ceny całej sztuki. Tożsamość pierwotnego JSON-LD obejmuje `productID: 000000001000032973`. Ogólny HTTP nie potwierdza oddziału i nie może odświeżyć lokalnej ceny; zwraca `browser_location_review_required`.

## Dostawa, odbiór i mapa

Cena 9,99 zł należy wyłącznie do odbioru w zweryfikowanym punkcie. Źródło `pickupOnly` jest wykluczone z porównań dostawy do domu. [Oficjalna strona placówki](https://www.bricomarche.pl/sklep/bricomarche-poznan-al-solidarnosci) opisuje transport wyceniany indywidualnie zależnie od odległości i wartości zakupu. Brak potwierdzonej stawki nie oznacza darmowej dostawy; wynik to `retailer_transport_quote_required`.

Dodano jedenasty potwierdzony adres odbioru: Al. Solidarności 47, 61-696 Poznań, tel. +48 789 449 743; poniedziałek–sobota 07:00–21:00, niedziele **handlowe** 10:00–20:00. Mapa wskazuje oficjalny CID `17648745300175614963`. Pole geo w JSON-LD placówki ma odwrócone współrzędne i zostało odrzucone. Użyto środka oficjalnej mapy: 52.43741982323261, 16.908150942554535; nie udaje on pomiaru wejścia do sklepu. Dystans jest orientacyjny w linii prostej, bez kosztu i czasu jazdy.

Wybór tego punktu w aplikacji przełącza na odbiór; wybór sprzedawcy oferującego tylko wysyłkę przełącza na dostawę. Zachowany jest kod pocztowy użytkownika, nie stare ręczne stawki. Lista porównania zapamiętuje również tryb zakupu, więc ponowne otwarcie nie miesza cen z innego kanału. Wyszukiwanie sklepów pomija akcenty, np. `bricomarche` i `poznan`. Kod do orientacyjnej odległości można podać także przy jednym punkcie z mapą.

## Zakres i walidacja

Katalog obejmuje **97/103 referencje**, 6 braków, 124 aktywne oferty i 38 nazw sklepów/punktów. Zdjęcia mają wszystkie 103 referencje. Zachowano 124 wcześniejsze obserwacje i dopisano dwie: 126 rekordów, w tym 2 wyłączone Rodimax. 19 cen to ręczne potwierdzenia z terminem wygaśnięcia. Liczniki są stanem weryfikacji, nie bezterminową gwarancją dostępności. Automatycznych integracji dostawy nadal 20; pełna automatyzacja Castoramy i OBI pozostaje otwarta.

413 testów aplikacji/kalkulatorów/pricing/API i 1054 wspólnego backendu uruchomionych szeregowo: **1467 PASS, 0 skip**. Typecheck API/mobile i walidacja 66 chronionych ID z negatywnymi mutacjami PASS. Testy obejmują natywne karty, pełne sztuki, obcy oddział, brak dostępności, błędne parametry, wygaszanie, niepotwierdzony HTTP, oddzielne kanały zakupu i brak fikcyjnego transportu.

Rzeczywisty HTTP gotowego bundle potwierdził: 11 mb wymaga 4 sztuk po 3 mb; materiały kosztują 23,92 zł w Castoramie lub 39,96 zł w wskazanym Bricomarché. Dwa pomieszczenia po 1,4 mb konsolidują się do jednej sztuki za 9,99 zł w punkcie. Lokalna cena nie wycenia wysyłki. Niepotwierdzony transport pozostawia pełną sumę pustą. Pierwotny koszyk nadal kosztuje 790,83 zł, w tym 637,43 zł materiałów i 153,40 zł dostaw.

Świeży snapshot 148 plików wspólnego serwera ma SHA256 `785351e3c42ab386906a997df0c9bd0ceb42bd1a04949f8c62759a5fa235bb7d`. Dwie kontrole braku driftu, ostatnia `2026-10-26T08:27:42.543Z`. Zmiany produkcyjne ograniczono do bundle pricing i pliku obserwacji; pozostałe pliki, manifesty i obcy WIP zachowano. Nie ma nowego wydania binarnego iOS/Android.

Dowody w katalogu czatu: `work/catalog-wave27-research/{budmat-browser,bricomarche-browser,bricomarche-branch,reviewed-observations}.json`, `bricomarche-delivery-details.txt`, `catalog-wave27-{core-tests,shared-tests}.log`, `catalog-wave27-local-live-proof.json` i `catalog-wave27-predeploy-baseline-proof.json`.

Pozostałe sześć referencji: Facile 50 (5907720650025), Toledo 2,22 m² (5907555422774), Diall PE 20 m² (5059340141428), Petro Grey G2 (5904584161544), Nati Bianco Struktura (5902610507960) i Archi 80 lewe (5903917782364). Nie potwierdzono ich jako dostępnych ofert. Podobne warianty nie są tym samym produktem. Cel pełnego katalogu, rzeczywistej dostawy i pobliskich sklepów pozostaje aktywny.

## Wdrożenie i potwierdzenie produkcji

[PR33](https://github.com/jakatora/przetargai/pull/33) scalono i przypięto do zadania: źródło `d83b9b379002ac1e3433862e25247ab354fb87c4`, merge `c9e7e036b0db93854b1fdc2c06c97bb94978dbfc`. GitHub checks/statuses były puste; walidację stanowią wykonane testy i rzeczywiste odczyty. Railway `fa6e304b-808a-4423-9302-2e401c68e267` osiągnął SUCCESS `2026-10-26T08:28:57.725Z`.

Rzeczywisty HTTPS produkcji potwierdził 97/103 produktów, 6 braków, 124 aktywne oferty, 38 sklepów/punktów i 19 ręcznych obserwacji. Potwierdzono pełne sztuki oraz ceny 23,92 zł online i 39,96 zł w wybranym punkcie dla 11 mb. Lokalna cena nie obejmuje wysyłki; brak potwierdzonego transportu pozostawia best=null. Koszyk regresyjny nadal 790,83 zł. Dowód `work/catalog-wave27-production-proof.json`.

Kolektor po wdrożeniu (`lastAttemptAt: 2026-10-26T08:28:54.428Z`, `running: false`) otrzymał dla Castoramy HTTP 503 i dla Bricomarché HTTP 403. Zachował oryginalne ceny, daty i terminy ręcznego potwierdzenia. Nie jest to udany automatyczny odczyt. `/health` zwraca 200, `/auth/me` bez sesji 401. Dowód `work/catalog-wave27-collector-proof.json`.

Interfejs potwierdził wyszukanie `bricomarche` bez akcentów, samoczynne przejście na odbiór i 39,96 zł jako dostępny fragment całego koszyka, a nie cenę pełnego remontu. Pokazał prawdziwy adres, telefon, godziny i ręczną ważność do 2026-10-27, 08:58 czasu polskiego. Dla publicznego kodu placówki 61-696 rozpoznał Poznań i pokazał około 5 km od środka miejscowości, z wyraźnym opisem ograniczenia. Dowody `outputs/catalog27-selected-bricomarche-20261026.{png,txt}`.

Po ponownym otwarciu podgląd zachował punkt, odbiór oraz cenę 39,96 zł (`catalog27-selected-bricomarche-reloaded-20261026.txt`). Kod do mapy nie nadpisał kodu dostawy. Usunięto wyłącznie własną dodatkową pozycję, wybrano „Najtańszy zestaw” i przywrócono dostawę do domu: 3 prace, Standard, 1 posiadana pozycja, kod 00-001, bez dodatków, 637,43 + 153,40 = 790,83 zł. Dowód `outputs/catalog27-original-basket-restored-20261026.txt`. Pomocniczą kartę sklepu zamknięto, podgląd aplikacji pozostawiono otwarty.
