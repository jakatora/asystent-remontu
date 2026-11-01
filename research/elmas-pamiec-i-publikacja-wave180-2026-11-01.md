# Elmas: wspólna dostawa i ponowne użycie wyceny krajowej — 2026-11-01

**Wdrożone i publicznie zweryfikowane.** Źródło aplikacji `a9eecd9396ac2aa0e5401918d14371df80b379f0`. API `8efe1806-9f3b-4584-8ea4-9cc59aab2160` i WWW `aaa2b2cb-6b4e-4b97-939b-a7e9bf78c30c` mają SUCCESS. [PR 163](https://github.com/jakatora/przetargai/pull/163), head `3de3a498ecc1663fd4ff5d1f310e1151456750b5`, scalono jako `415e4ff57e3bec545e1575dfe759e30fc5c265a8`. Końcowy audyt z **2026-11-01 21:16:51 UTC** potwierdził ważność 79 zwycięskich publicznych wycen z zachowanych odpowiedzi.

## Efekt dla użytkownika

Opublikowano przygotowany w [wave179](./elmas-wspolna-dostawa-wave179-2026-11-01.md) osobny produkt Norgips 75 mm × 30 m, GTIN `5907651698011`, z właściwym zdjęciem i potwierdzoną ofertą Elmas. Nadal jest świadomie dodawanym materiałem; nie zastępuje taśm 30 lub 50 mm w istniejących obmiarach. Wspólny koszyk Elmas obejmuje obie przejrzane szerokości i jedną rzeczywistą dostawę całego zestawu.

Źródła produktu: [Elmas](https://sklep-elmas.pl/p/tasma-akustyczna-norgips-3-mm-x-0075-m), [karta producenta, wrzesień 2025](https://norgips.pl/media/repository/0/153/62d06729868d42beae6969cc0297c047/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf). Model, GTIN, pełna rolka 30 m, opis wymiarów i fotografia są sprawdzane niezależnie od mylącego importowanego pola długości `0.075`. Natywne wagi rolek to 0,3 kg dla 50 mm i 0,4 kg dla 75 mm. Cena 75 mm podczas prób wynosiła 32 zł brutto, stan 46 rolek; kolejne odczyty muszą ponownie potwierdzać dostępność i cenę.

| Potrzeba lub zakup | Rzeczywista suma z kurierem |
| --- | --- |
| Jedna rolka 75 mm | 82,00 zł |
| Po jednej rolce 50 i 75 mm | 104,89 zł |
| 30 m taśmy 50 mm i 150 m taśmy 75 mm | 232,89 zł |
| Ten sam zakres + jawnie wybrana dodatkowa rolka 50 mm | 205,78 zł |

Oszczędność ostatniego wariantu wynosi **27,11 zł**. Materiały kosztują więcej, ale rzeczywisty kalkulator potwierdza kuriera za 0 zł. Wymagania nadal wynoszą 30 m i 150 m. Interfejs, kopiowany plan, kopia i import zachowują tę różnicę. Kwoty są dowodem konkretnych prób, nie wpisanymi stawkami ani obietnicą przyszłej ceny.

## Mniej powtarzanych odczytów

Kalkulator Elmas dostaje kraj `pl`, bez kodu pocztowego. Jego wynik jest jawnie prezentowany jako wycena krajowa PL. Po potwierdzeniu takiego wyniku kolejny poprawny polski kod może wykorzystać tę samą nadal ważną wycenę **identycznego koszyka**.

Osobna pamięć obejmuje najwyżej 64 koszyki i tylko dwa przejrzane SKU Elmas. Przed odczytem pamięci sprawdzane są produkt, właściwa szerokość, jednostka, URL, liczby i pełne koszty opakowań, brak duplikatów oraz suma materiałów. Zmiana ceny, ilości lub tożsamości nie może pożyczyć poprzedniej wyceny. Kolejność linii nie zmienia tożsamości tego samego kompletnego koszyka.

Do pamięci trafia wyłącznie potwierdzona kwota z właściwego kalkulatora, `destinationScope: PL`, `basis: retailer_basket_national`, bez pola `postalCode`, z poprawnym dowodem i terminem. Zachowany jest wcześniejszy margines 60 s oraz oryginalne `checkedAt` i `expiresAt`. Daty nie są przedłużane. Błędny kraj, zakres zależny od kodu, nieważny dowód, niepotwierdzony wynik i HTTP 429 nie tworzą wyceny krajowej. Pozostałe sklepy nadal zachowują dotychczasową izolację kodów; istniejący test Rab-Dom pozostał bez zmian i przeszedł.

Rzeczywista lokalna próba tej samej potrzeby ośmiu rolek 50 mm, z opcjonalną dziewiątą:

| Kod | Żądania HTTP do sklepu | Wynik |
| --- | --- | --- |
| 30-001, pierwsza wycena | 8 | 233,12 zł standard / 206,01 zł z dodatkową rolką |
| 00-001, ten sam koszyk | 0 | Ta sama suma, dowód i termin ważności |
| 42-209, ten sam koszyk | 0 | Ta sama suma, dowód i termin ważności |

Publiczna wersja również potwierdziła te trzy kody i niezmienione dowody oraz terminy. Liczby wewnętrznych HTTP produkcji nie instrumentowano — w artefaktach wynoszą `null`, nie pozorne zero.

## Walidacja i granice dowodów

| Grupa | Wynik |
| --- | --- |
| Mobile, te same źródła co wave179 | 535 PASS |
| Pricing | 207 PASS |
| API lib | 116 PASS |
| Adaptery sklepów | 147 PASS |
| Wspólny backend | 1064 PASS |
| Typy mobile/API, build pricing, 66 legacy IDs | PASS |
| Rzeczywiste lokalne / publiczne porównania | 15 / 15 PASS |
| Lokalne / publiczne scenariusze UI | 26 / 26 PASS |
| Dodatkowe lokalne / publiczne próby pamięci krajowej | 3 / 3 PASS |

Grupy częściowo się pokrywają, bez fail/skip. Osiem nowych testów pamięci sprawdza m.in. kraj, zakres, kwoty, dowód, daty, zmianę ilości/ceny, błędny koszyk, wygaśnięcie i ograniczenie pamięci. Mobile i jego typy/legacy sprawdzono w wave179; pusty diff Git od `fb4cb3189157658317e45fe49282bb92da917c36` potwierdza identyczność źródeł mobile. Obecną wersję przeglądarkową dodatkowo sprawdzono w 52 rzeczywistych scenariuszach lokalnych i publicznych.

Testy UI obejmują faktycznie załadowane zdjęcie, 31 m → dwie pełne rolki 75 mm, obie szerokości i jeden transport, wybór i rezygnację z nadwyżki, klawiaturę, 320/390 px, zmianę kodu, eksport/import/reload oraz usunięcie jednej pozycji bez zmiany drugiej. Brak błędów strony i odpowiedzi 429 API aplikacji.

Lokalne native i UI korzystały z jednej rzeczywistej instancji przygotowanego API. Wczytano istniejącą pamięć obserwacji cen bez przedłużania dat; **nie wstrzykiwano wycen transportu**. Cały przebieg miał 539 żądań do sklepów, w tym Elmas 111 HTTP / 46 POST, zero merchant HTTP 429 i zero `/order/new`. To nie dowód dowolnego obciążenia. Wcześniejszą blokadę wave179 potwierdzono, a ponowną serię rozpoczęto dopiero po udanej pojedynczej rzeczywistej próbie. Nie obchodzono blokady inną tożsamością.

Pełny zachowany remont nadal dał **2712,10 → 2684,99 zł**. Pierwszy lokalny przebieg pełnego remontu trwał około 37,6 s / 441 HTTP po wcześniejszym sprawdzeniu Elmas; publiczny około 35,8 s, także po próbie krajowej. Nie są to zimne pomiary całego systemu, p95 ani dowód gotowości na duży ruch. Koszt pierwszych złożonych porównań nadal wymaga poprawy. Ograniczone wyszukiwanie i niepotwierdzone alternatywy pozostają jawne.

## Publikacja i pokrycie katalogu

Powdrożeniowy SSH snapshot API z 2026-11-01 21:12:59 UTC potwierdził identyczność wszystkich 150 plików z przygotowanym wydaniem. Zmieniono moduł remontowy i seed, pozostałe 148 zachowano. Wszystkie 346 wcześniejszych obserwacji pozostały identyczne, dodano jedną — 347 łącznie. SHA modułu: `2ce6e14c6ddaec3a2b94a4bd44daddbb6dd7cee86a3442848c3ce22be30a2656`.

API ma SUCCESS od 21:12:33 UTC, WWW od 21:14:35 UTC. Przed WWW przeszły publiczne native i próby pamięci; po WWW pełne 26 scenariuszy UI. Publiczne 63 zasoby / 17 268 932 B zgodne SHA, kontrola 77 wartości vaulta bez wycieku. Dziewięć tras HTTP 200, pięć kontrolnych 404, prywatny POST 401, zachowane PL/WASM/COOP `same-origin`/COEP `credentialless`/`no-referrer`. Spośród dziewięciu wspólnych plików hosta i konfiguracji osiem jest identycznych z wave177; zmieniony prywatny bundle relay objęto weryfikacją kodu i publiczną ochroną endpointu.

Publiczny katalog: **240 referencji / 207 potwierdzonych / 307 ofert / 33 braki**. Audyt 240 referencji i 226 wierszy snapshotu nie znalazł błędnych potwierdzeń ani pominięć; cztery tożsamości sklepowe bez EAN zachowane. Na tej samej rzeczywistej pamięci cen poprzednia wersja ma 239 / 206 / 306 / 33, zatem nowy produkt dodaje jedną potwierdzoną pozycję. Oferta PEX Tycner 16×2 wygasła w obu wersjach względem starszego audytu wave177; nie zamieniono jej w pozorne potwierdzenie ani nie cofnięto czasu.

Artefakty końcowe: `G:/Projekty/asystent-remontu-work/wave180-20261101/verification-summary.json`, `final-railway-deployments.json`, `national-native.json`, `production-national-native.json`, oba zestawy `*-native.json`, `*-surplus-qa.json`, `*-mixed-qa.json`, `production-http.json`, `deployed-verification.json`, `catalog-audit-after.json` i `catalog-identity-production-audit-wave180.json`. Pełny zakres stałego celu pozostaje aktywny: brakujące produkty, zdjęcia i dostawy, zmiany cen, wygoda zakupów, szybkość i walidacja rzeczywistych remontów. Nie uruchamiano płatności, zamówień, analityki, reklam ani kontaktowania się z osobami trzecimi.
