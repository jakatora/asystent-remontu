# Asystent Remontu — Ceresit CT17, zdjęcia i pełny koszt zakupów

Stan po wdrożeniu i publicznym sprawdzeniu: 2026-11-01.

## Co otrzymuje użytkownik

W katalogu wspólnego koszyka dostępne są trzy nowe produkty ze zdjęciami:

| Produkt | EAN | Sprawdzona cena kanistra w Buduj24 |
| --- | --- | ---: |
| Ceresit CT17 PROFI 5 l | 5900089617050 | 50,64 zł |
| Ceresit CT17 Transparent 5 l | 5900089218653 | 43,15 zł |
| Ceresit CT17 Transparent 10 l | 5900089218677 | 84,48 zł |

Dodano również ofertę Buduj24 dla istniejącego CT17 PROFI 10 l, EAN 5900089617081, za 91,99 zł. To cztery nowe oferty i trzy nowe produkty. Nie dodano nowego sklepu w tej partii.

Produkty można znaleźć po nazwie lub dokładnym EAN przez „Dodaj produkt do koszyka”. Wpisuje się potrzebne litry; serwer dobiera pełne opakowania wybranego produktu i porównuje koszt całego zamówienia. PROFI, Transparent oraz kanistry 5 i 10 l pozostają oddzielnymi tożsamościami. Nie włączono automatycznego mieszania tych opakowań ani podmiany gruntów w zapisanych pracach.

## Dowody rzeczywistych cen i dostawy

Natywny koszyk sklepu potwierdził:

- Po jednym kanistrze każdego z czterech wariantów: 270,26 zł materiałów + 15,00 zł dostawy = **285,26 zł**.
- Po dwa kanistry obu wariantów 5 l: 187,58 zł + 15,00 zł = **202,58 zł**.
- Publiczny interfejs aplikacji, po 6 l zapotrzebowania na każdy z trzech nowych produktów: dwa kanistry PROFI 5 l, dwa Transparent 5 l i jeden Transparent 10 l; 272,06 zł + jedna dostawa 15,00 zł = **287,06 zł**.
- Trzy rzeczywiste projekty formularzy: malowanie 35 m², podłoga 20 m² z Oakland i podkładem Arbiton, hydroizolacja 12 m² ścian + 5 m² podłogi; do tego trzy nowe pozycje po 6 l. Pełny potwierdzony plan ma **13 produktów, 2214,52 zł materiałów + 316,90 zł dostaw = 2531,42 zł**. Buduj24 występuje raz, z jednym kosztem dostawy 15 zł, również dla pozostałej pozycji kupowanej tam w tym planie.

Kod w testach: 30-001. Buduj24 potwierdza koszyk dla Polski (`retailer_basket_national`, `destinationScope: PL`), bez indywidualnej taryfy kodu pocztowego. Interfejs pokazuje tę różnicę. Sewera w całym remoncie potwierdza wskazany kod. Nie wykorzystano kwot „od”, promocji Smart ani odbioru osobistego jako ceny dostawy do domu.

Wynik ma `searchLimited: true`. W ostatnim publicznym porównaniu całego remontu status `needs_delivery_costs` dotyczył niepotwierdzonych alternatyw; istniał kompletny plan z potwierdzonymi dostawami wszystkich jego sklepów i zerem brakujących produktów. Ostrzeżenia pozostały widoczne. Nie jest to dowód minimum we wszystkich możliwych podziałach zakupów.

## Katalog przed i po

| Zakres | Przed | Po |
| --- | ---: | ---: |
| Referencje klienta | 236 | 239 |
| Produkty z potwierdzonymi ofertami | 203 | 206 |
| Oferty | 302 | 306 |
| Starsze referencje bez potwierdzonej oferty | 33 | 33 |

Zbiór identyfikatorów 33 starszych braków jest identyczny. Nie przedstawiamy dodania nowych produktów jako zamknięcia tych braków. Audyt wszystkich 239 referencji potwierdził dokładne dopasowanie EAN/SKU, kategorii, jednostki i wielkości opakowania: 206 oczekiwanych i 206 potwierdzonych, zero brakujących oznaczeń i zero fałszywych potwierdzeń. Zachowano cztery wcześniejsze produkty identyfikowane kodami sklepów bez EAN; nie dodano nowych aliasów.

## Weryfikacja

- 519 testów mobile, 189 silnika wycen, 85 testów źródeł/parserów, 116 regresji adapterów i 1064 testy wspólnego backendu PASS, bez pominiętych. Zestawy częściowo pokrywają ten sam kod, więc nie sumujemy ich jako unikalnych testów.
- Typy mobile/API, build i 66 chronionych identyfikatorów PASS. Wzory, obmiary, migracje 001–014, zależności i mapowania prac nie były zmieniane.
- 12 lokalnych i 12 publicznych prób przeglądarkowych PASS: wyszukiwanie trzech EAN, surowe litry i pełne kanistry, trzy załadowane fotografie, plan z nazwami i dokładnymi linkami, 320/390 px, eksport/import, ponowne otwarcie i wspólny remont. Zero błędów strony i odpowiedzi 429. Publiczny test bez przechwytywania API.
- Dwa rzeczywiste zestawy zakupów potwierdzone osobno na końcowym przygotowanym module oraz publicznym API.
- Szerszy historyczny zestaw 104 plików testów API uruchomiony bezpośrednio przez tsx nadal ma **28 niepowodzeń**, identycznych przed i po zmianie. Porównanie z poprzednim commitem 3af622a wykazało zero nowych i zero usuniętych niepowodzeń. Obejmują m.in. konfigurację ESM/CJS i starsze fixture. Nie przedstawiamy tego zestawu jako zielonego. Ustalony osobny runner regresji adapterów przechodzi.

W pierwszych próbach QA poprawiono oczekiwania samego narzędzia: publiczny minimalny produkt ma `id`, nie pole `ean`, a plan używa nazw katalogowych wybranych przez użytkownika. Końcowe asercje sprawdzają dokładny identyfikator, nazwę, link, opakowania i kwoty. Nie zmieniano odpowiedzi API lub cen, aby dopasować je do testu.

Lokalny statyczny seed z wyłączonym odświeżaniem w tle miał trzy wygasłe wcześniejsze oferty przy ostatniej próbie całego remontu. W istniejącym profilu testowym wykonano rzeczywiste „Odśwież ceny” i dokończono tylko ten przypadek; pierwszych 11 zakończonych prób zachowano. Publiczny przebieg ukończył wszystkie 12 prób w jednym uruchomieniu. Sam lokalny seed nie jest dowodem problemu zimnego startu produkcji.

## Wdrożenie i zakres

- Źródło końcowe: `c7b94571a209314102411ab24d7440fff57d22a9`; dodanie produktów `185e02959e8fae65e535eb56a8c112b46db9a092`, następnie zachowanie dotychczasowej kolejności źródeł sklepów.
- [PR159](https://github.com/jakatora/przetargai/pull/159), head `45e17037c3989ae074d6fe43ac927f76f022f290`, merge `6864af495861252a6022c15f0522c4ba515fc309`, scalony 2026-11-01 18:00:49 UTC.
- API Railway: `2adfd04a-899b-4e61-bdde-64374a7a8c26`, SUCCESS. Moduł SHA256 `d371e18b4c79ced694555b69e00329ef08548c5daff875dae7ec051c23fc70c0`.
- WWW Railway: `5df91c25-c95b-4df8-8310-8de551ceddf7`, SUCCESS. [Publiczna aplikacja](https://asystent-remontu-web-production.up.railway.app).
- Świeży snapshot przed API: 150 plików identycznych z działającą wersją 169. Zmieniono tylko moduł Remontu i seed; 148 pozostałych plików zachowano. Seed 345 zawiera wszystkie 341 wcześniejszych obserwacji oraz cztery nowe. Po wdrożeniu 150 plików zgodnych z przygotowanym wydaniem.
- WWW: 63 publiczne zasoby, 17 256 016 B, SHA zgodne na serwerze; zero wykrytych wycieków 76 sprawdzonych wartości vaulta. PL/WASM, 9 tras 200, 5 kontrolnych 404, prywatny relay 401 bez podpisu, COOP/COEP i `no-referrer` zachowane. Sześć plików serwera/configu identycznych; prywatny relay przebudowany z tym samym zatwierdzonym katalogiem i zabezpieczeniem tożsamości co API.

Obcy WIP `ean-overlay.ts`, `mappings.ts`, `pnpm-lock.yaml`, `.atlas/` i `PROPOZYCJE-COCKPIT.md` nietknięty. Bez nowych usług, kont, opłat, analityki, wiadomości i zamówień. Eksperyment współbieżności z partii 170 pozostaje wstrzymany.

## Źródła i odrzucone kandydatury

[Tabela producenta Henkel, strona 4](https://dm.henkel-dam.com/is/content/henkel/Cennik-Henkel-ACB-17-03-2025) została wyrenderowana i obejrzana. Potwierdza odrębne GTIN, nazwy i litry PROFI oraz Transparent. Cennik producenta wykorzystano do tożsamości, nie jako aktualną cenę detaliczną.

Aktualne karty Buduj24: [PROFI 5 l](https://buduj24.pl/produkt/10217,ceresit-grunt-gleboko-penetrujacy-ct17-profi-primer-5l), [PROFI 10 l](https://buduj24.pl/produkt/10218,ceresit-grunt-gleboko-penetrujacy-ct17-profi-primer-10l), [Transparent 5 l](https://buduj24.pl/produkt/16299,ceresit-grunt-ct17-transparent-gleboko-penetrujacy-5l), [Transparent 10 l](https://buduj24.pl/produkt/15394,ceresit-grunt-gleboko-penetrujacy-ct17-transparent-10l). Cenę brutto i zakup pełnych kanistrów potwierdził również natywny koszyk.

Nie aktywowano Domo-Hurt: karta i koszyk potwierdziły panele K338 po 99,90 zł/paczkę, lecz wybór wysyłki znikał bez poprawnych danych zamówienia, a końcowa suma nie zawierała transportu. Nie utożsamiono tego modelu ze starym EAN Toledo. Knauf Universalgrund Buduj24 i obie znalezione karty Ceresit 5 l w Sewerze zwróciły OutOfStock — ich indeksowane ceny nie stały się ofertami.

Dowody: `G:/Projekty/asystent-remontu-work/wave174-20261101/`, zwłaszcza `production-primers-qa.json`, `production-native-products.json`, `catalogue-delta.json`, `catalog-identity-production-audit-wave174.json`, `api-legacy-test-comparison-r2.json`, `validation.json`, `deployed-verification.json`, kopie remontu i zrzuty ekranów. Cel ciągły pozostaje aktywny: 33 starsze braki oraz pełne dostawy Castoramy i OBI nadal wymagają wiarygodnych źródeł.
