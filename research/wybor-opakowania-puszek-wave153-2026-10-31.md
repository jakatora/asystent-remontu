# Wybór sprzedaży puszek na sztuki — 2026-10-31, wave153

Wspólny koszyk pozwala jawnie wybrać sprzedaż puszek PRO na sztuki zamiast niedostępnego dziesięciopaku. Potrzebnej pozycji nie trzeba usuwać i wprowadzać ponownie. Oryginalne materiały i zapisane projekty pozostają bez zmiany. Wybór ma własną preferencję wspólnego koszyka, zachowywaną także w kopii zapasowej.

Zakres jest ścisły: `mat-flush-box-elektroplast-pk60-10`, GTIN 5901752637337 / 0285-01L, do `mat-epn-pk60-pro-0285-01`, GTIN 5901752632141 / 0285-01. Są to puszki głębokie PRO z wkrętami do ścian murowanych. Dokument [producenta EPN, strona 6](https://www.elektro-plast.com.pl/download/EPN_CENNIK_2024_05.02.2024.pdf) potwierdza oba indeksy i odrębne GTIN-y. Puszki LUX i pierścienie dystansowe są wykluczone. Różne kody nie są aliasowane; zmienia się dopiero jawnie wybrany produkt w żądaniu wyceny.

## Zachowanie i dowody

- Przeliczanie zachowuje surową liczbę sztuk oraz ID pozycji. Usuwa zaokrągloną wcześniej liczbę dziesięciopaków. Nie mnoży i nie dzieli potrzebnej liczby przez 10.
- Przykład rzeczywistego publicznego API: 11 potrzebnych puszek w starej pozycji + 3 sztuki dodane osobno po wyborze łączą się w **14 × 1,39 zł = 19,46 zł**. Dwa pierścienie 12 mm kosztują 4,58 zł. Cały zestaw: **24,04 zł materiały + 18,90 zł dostawy = 42,94 zł**, HIPPER, Kurier InPost, taryfa krajowa dla Polski. API dopiero po faktycznym sprawdzeniu sklepu potwierdza tę kwotę.
- Przed wyborem i po przywróceniu oryginalnego dziesięciopaku brak jego aktywnej oferty nadal blokuje pełną sumę. Wcześniejszy potwierdzony koszt nie pozostaje aktualną kwotą zakupów.
- Wybór jest ograniczony do wspólnego koszyka i zapisywany pod `remont.flush-box-choice.v1:renovation-basket`. Odczyt niepoprawnej preferencji wstrzymuje wycenę. UI udostępnia ponowny odczyt. W teście przeglądarkowym po uszkodzeniu własnej preferencji nie wysłano żadnego żądania wyceny; po naprawie i przycisku ponowienia rzeczywista wycena 42,94 zł wróciła.
- 421/421 testów aplikacji, bez pominięć; typecheck w głównym i czystym checkout, 66 legacy IDs PASS. Nowe testy obejmują zachowanie ilości między pracami, odrębność LUX/pierścieni i sprzeczne GTIN-y. Rzeczywisty test SQLite eksport→import→eksport zachowuje wybraną sprzedaż na sztuki.
- Lokalny gotowy pakiet web z publicznym API i natywnymi sklepami, bez przechwytywania cen lub dostaw: potwierdzone 14 sztuk, suma 42,94 zł, zachowanie po przeładowaniu, powrót do oryginału i odzyskanie preferencji po błędzie. Trzy dodatkowe pozycje i 30-001 zapisane. PL, 390 px bez przepełnienia, crossOriginIsolated=true, brak błędów strony i 429.

Nie zmieniono serwera, modułu cen, katalogu, stawek dostawy ani reguł grupowania produktów po stronie API. Porównanie Git do źródła wave152 dla `artifacts/api-server`, `lib/pricing-service` i `deploy/shared-backend` jest puste. Prywatny relay pakietów web152 i web153 ma identyczny SHA256 `d0ef651bd57cb9a565e42b1ac4625cf6d2687dc46fd6841ca6eb24c9f8b2e8ad`. Backend pozostaje na wdrożeniu wave152 `2b17206f-9f05-440d-9ef8-ad88af96e1ca`.

Source aplikacji `1a8639db497da602933fd7f99a615d313b22dbec`. Pakiet web: 63 zasoby / 17144829 B; zgodne SHA, 76 wartości vaulta bez wycieku, prywatny relay poza publicznym archiwum. Web deployment `2ee0c8ad-21e4-4e70-acc5-d875ddfd31d7` SUCCESS, utworzony 2026-10-31T15:23:43.748Z.

Publiczny test na tym wdrożeniu, bez przechwytywania żądań API: identyczna cena 42,94 zł, 14 puszek, zachowany wybór i 30-001 po przeładowaniu, usunięta pełna suma po przywróceniu niedostępnego pakietu, brak żądań wyceny przy uszkodzonej preferencji, poprawne odzyskanie po ponownym odczycie. Zero błędów strony i 429. HTTP: 63/63 SHA zasobów zgodnych, 9 tras 200, pliki prywatne 404, niepodpisany relay 401, relayReady=true, missingAssetCount=0, poprawne COOP/COEP/no-referrer.

Dowody: `work/box-choice-{local,production}-qa-wave153.json`, `box-choice-{local,production}-mobile-wave153.png`, `box-choice-{local,production}-read-failure-wave153.png`, `mobile-final-tests-wave153.log`, `typecheck-final-wave153.log`, `web-release-integrity-wave153.json`, `web-production-http-wave153.json`.

## Sprawdzone braki ofert

W tej turze nie dodano kolejnej aktywnej oferty dla wcześniejszych 33 pozycji. Sprawdzono nowe przesłanki, zachowując ostrożność tożsamości i dostępności:

- Eadamex, Norgips taśma 50×30 m / 5907651698004: bieżące HTTP 200, główny produkt `OutOfStock`, „Produkt na zamówienie”, `availability=unavailable`. Teksty „W magazynie” należały do innych kart na stronie.
- Tupo: odnaleziono prawidłowy schemat `/p/...`, lecz bieżący odczyt serwerowy trzech kart zwraca HTTP 500. Dostępny odczyt wieszaka ES 60/75 / 5907651699650 wskazuje „Niedostępny”. PDF i cena na karcie nie dowodzą możliwości zakupu.
- MyBudio ES: GTIN 5907651699650, wymagany wariant długości, minimum i wielokrotność 100 sztuk, marka w danych karty Budujto. Nie potwierdzono zgodności z aktualnym Norgips w tym konkretnym koszyku ani dostawy; nie dopisano go jako dostępnej oferty Norgips po 1 sztuce.
- Bricoman MP 75 25 kg: pojawia się w bieżącej kategorii z koniecznym wyborem sklepu, natywne HTTP 403; brak potwierdzonej automatycznej ceny i dostawy dla koszyka.
- Sklep producenta EPN: dostępny katalog, bez znalezionej potwierdzonej oferty dziesięciopaku 0285-01L. Nie użyto samego formularza katalogowego jako potwierdzenia stanu.

Katalog pozostaje 220 referencji / 220 wpisów zdjęć, 313 źródeł, 278 aktywnych ofert dla 187 produktów, 33 wcześniejsze pozycje bez aktywnej oferty. Ta zmiana daje użytkownikowi świadomy wybór innej jednostki sprzedaży przy kompletowaniu koszyka; nie zmienia statusu brakującego GTIN-u. Cel dalszego rozwoju pozostaje ACTIVE.
