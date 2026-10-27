# E-Kowalczyk, KIM24 i wspólne dostawy — 2026-10-27

Wcześniej pełny plan sufitu wymagał dostawy ABUD, której serwer produkcyjny nie potrafił potwierdzić. Dodano cztery aktualne oferty tych samych dwóch produktów w sklepach z działającymi koszykami. Plan zakupów porównuje również łączenie materiałów w jednym sklepie, gdy niektóre inne dostawy pozostają nieznane. Minimalnie tańszy kołek w drugim sklepie nie powinien powodować większej dopłaty za kolejną paczkę.

## Produkty, ceny i pochodzenie

| Oferta | Dokładne opakowanie | EAN | Cena brutto przy odczycie |
|---|---|---|---:|
| [E-Kowalczyk WS-3595](https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html) | 1000 wkrętów 3,5×9,5 mm | 5906675303024 | 43,33 zł |
| [E-Kowalczyk FX-06K040](https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html) | 200 kołków 6×40 mm | 5906675107622 | 21,87 zł |
| [KIM24 FX-06K040](https://kim24.pl/Kolek-szybki-montaz-kolnierz-6x40-KOELNER) | 200 kołków 6×40 mm | 5906675107622 | 19,90 zł |
| [Z prądem WS-3595](https://zpradem.pl/wkret-fosfatowany-samowiercacy-35x95-ws-3595-1000szt/798230) | 1000 wkrętów 3,5×9,5 mm | 5906675303024 | 56,30 zł |

To cztery nowe oferty dwóch istniejących produktów, bez zwiększania liczby unikalnych pozycji katalogu. Cena netto 35,23/17,78 zł z Magento ani 16,18/45,77 zł z Shoper nie zastępuje ceny brutto opakowania. Starszy wynik wyszukiwania dla WS wskazywał inną cenę; przyjęto dopiero aktualną kartę i zgodny koszyk.

Zdjęcia E-Kowalczyk mają końcówki odpowiadające dokładnym EAN. Dwa źródła Shoper używają zdjęć tych samych produktów z E-Kowalczyk. Oba URL zwróciły HTTP 200 z typem image/png lub image/jpeg. Nie pobierano plików graficznych do repo. Ceny online nie potwierdzają cen ani stanów konkretnego oddziału; wszystkie cztery źródła wymagają osobnego potwierdzenia odbioru.

## Natywna wycena Magento

Adapter E-Kowalczyk wiąże główny tytuł, zgodne canonical, formularz produktu, identyfikator, EAN/SKU, opakowanie i cenę. Otwiera własny anonimowy koszyk, sprawdza pusty stan, dodaje całe opakowania i potwierdza wynikowe pozycje. Następnie kontroluje PLN, ceny brutto, netto/VAT, sumy wierszy, rabaty, opcje i dodatkowe opłaty.

Wysłane miejsce dostawy zawiera wyłącznie kraj PL i kod pocztowy QA. Z natywnych metod wybierany jest InPost Kurier standard z przedpłatą. Odbiór osobisty, paczkomat, pobranie i indywidualna wycena z technicznym zerem nie stają się kurierem. Endpoint totals-information przelicza ofertę; nie tworzy zamówienia. Po wyborze przedpłaty adapter ponownie odczytuje metodę i przelicza końcowe sumy. Dokumentacja: [anonimowe API Adobe](https://developer.adobe.com/commerce/webapi/rest/use-rest/anonymous-api-security), [przygotowanie koszyka](https://developer.adobe.com/commerce/webapi/rest/tutorials/orders/order-prepare-checkout), [kod przeliczania totals-information](https://raw.githubusercontent.com/magento/magento2/2.4-develop/app/code/Magento/Checkout/Model/TotalsInformationManagement.php).

Transport dopuszcza wyłącznie przejrzane operacje koszyka i dwa SKU. Identyfikator anonimowej sesji pozostaje prywatny. Nie ma przesyłania imienia, nazwiska, e-maila, pełnego adresu, zgód ani zamówień. Przekierowania API, także 307 do innej ścieżki tego samego sklepu, są odrzucane. Błąd natywnej dostępności nie jest zerową dostawą.

Rzeczywisty koszyk E-Kowalczyk potwierdził dla obu testowych kodów 00-001 i 80-001: **65,20 + 16,99 = 82,19 zł**. Osobny odczyt dwóch kartonów WS i jednego FX potwierdził **108,53 + 16,99 = 125,52 zł**, wraz z zaokrągleniami netto/VAT. To dowody tych koszyków i momentów, bez założenia identycznej taryfy dla całej Polski lub dowolnych ilości. KIM24 potwierdził jeden karton **19,90 + 16 = 35,90 zł**, a Z prądem **56,30 + 27 = 83,30 zł**; te dwie taryfy są krajowe PL.

## Wybór planu przy nieznanych dostawach

Zamiast jednego najtańszego podziału cen materiałów serwer tworzy ograniczony zestaw pełnych planów, w tym preferowanie sklepu mogącego dostarczyć kilka produktów. Zachowuje konsolidację potrzeb wszystkich pomieszczeń przed doborem opakowań, stan magazynowy, minimum i wielokrotności zakupu. Maksymalnie 12 preferowanych sklepów, deduplikacja zamówień, 80 wycen, współbieżność 3 i istniejący deadline ograniczają odczyty. Podział jednego sklepu na osobne zamówienia nadal wymaga jawnego allowSeparateOrders.

Pole purchasePlan wybiera najmniej niepotwierdzonych sklepów, potem najniższą sumę materiałów i znanych opłat. Dotychczasowe lowerBound nadal opisuje dolne ograniczenie, a nie proponowany plan. Interfejs wyjaśnia kryterium i możliwość tańszego innego podziału po potwierdzeniu opłat. Nie nazywa częściowego planu najtańszym pełnym zestawem. Podsumowanie projektu i wygaśnięcie oferty używają tego samego wybranego planu.

## Rzeczywisty wynik produkcyjny

Produkcja 2026-10-27T12:45:55.097Z, ten sam jawny sufit 10 m², 13 produktów, kod QA 00-001:

| Sklep | Materiały | Dostawa | Razem w sklepie |
|---|---:|---:|---:|
| Buduj24 | 24,89 zł | 15,00 zł | 39,89 zł |
| E-Kowalczyk | 65,20 zł | 16,99 zł | 82,19 zł |
| Elektro-Hurt | 49,54 zł | 21,00 zł | 70,54 zł |
| HIPPER | 111,62 zł | 18,90 zł | 130,52 zł |
| IRBUD | 148,85 zł | 52,00 zł | 200,85 zł |
| Leroy Merlin | 309,59 zł | do potwierdzenia | brak pełnej kwoty |
| Marbet24 | 96,28 zł | do potwierdzenia | brak pełnej kwoty |

Materiały **805,97 zł**, pięć potwierdzonych dostaw **123,89 zł**, dwie nieznane. Pełne deliveryGrosze/totalGrosze i best pozostają null. Wcześniej produkcja miała cztery potwierdzone dostawy i nieznane ABUD/Leroy/Marbet. Nie naprawiono połączenia ABUD przez osłabianie TLS czy podmianę adresu IP; dodano potwierdzoną alternatywę tych samych produktów.

Lokalny odczyt sklepów zwrócił inny korzystniejszy plan, bo ABUD odpowiada z komputera: trzy produkty w ABUD, sześć sklepów, materiały 820,78 zł i cztery znane dostawy 104,90 zł. Znana część 925,68 zł jest niższa niż w wariancie E-Kowalczyk + Buduj24. Pierwszy probe błędnie oczekiwał tych samych materiałów 805,97 zł lokalnie; zachowano go w catalog-wave59-local-initial-proof.json. Osobna walidacja potwierdziła rzeczywisty plan oraz przyczynę różnicy. Nie przedstawia się lokalnego ABUD jako działającego na Railway.

Dowody w katalogu sesji work: catalog-wave59-production-proof.json, catalog-wave59-local-validation-proof.json, catalog-wave59-two-cartons-proof.json, catalog-wave59-research/verified-offers.json. Fixture zawiera 48 użytych odpowiedzi z placeholderami identyfikatorów sesji i bez danych klienta.

## Testy, wdrożenie i odbiór

- 644 testy core/calculator/pricing/API i 1054 testy wspólnego backendu PASS, 0 skip. Osobny rzeczywisty runner tsx: 7 testów nowej integracji PASS. Typecheck mobile/API PASS.
- Mutacje EAN, opakowania, głównej karty, ceny, VAT, waluty, dodatkowej opłaty, kuponu, opcji, ilości i pobrania są odrzucane. Nieobsługiwane SKU, dane kontaktowe, inny origin i przekierowania do zamówień nie są wysyłane. Wybrany niepełny sklep oraz nieustalone ilości nie tworzą pełnego planu.
- Legacy validator: 66 prac oraz trzy negatywne mutacje PASS. Walidacja czterech URL nowego adaptera: HTTP 200, 0 ostrzeżeń. Nie zmieniono job IDs, identyfikatorów obmiarów ani migracji 001–014.
- PR [60](https://github.com/jakatora/przetargai/pull/60), head 645296ce550a8c6ea74c694d44637c46c2570af3, merge b3d1c2c0cf83ee7a28b2d4faf6335ed546c01136. Brak workflow/statusów GitHub nie jest dowodem zielonego CI.
- Świeży snapshot 188 obserwacji / 148 plików, SHA-256 5182fc3ede4989fb244164bce42af2a8f59693feac55188a36feeb58364919fe. Wszystkie 188 starych obserwacji zachowano i dodano 4. Zmieniono bundle cenowy oraz seed; 146 pozostałych plików wspólnego serwera zachowano.
- Railway 5fb87706-8a50-4d43-b39f-e79b2278048a: SUCCESS, 2026-10-27T12:45:01.416Z. Wszystkie 148 SHA produkcji zgodne z przygotowanym wydaniem.
- Odbiór w dotychczasowym własnym projekcie QA proj_mvqj35dlrykdtbczn: plan 805,97 zł / 123,89 zł / 5 z 7; rozwinięcie E-Kowalczyk pokazuje zdjęcia i 1×1000 wkrętów oraz 1×200 kołków. Jawny wybór sklepu pokazuje 65,20 zł dostępnych materiałów i 11 brakujących pozycji. Przywrócono najtańszy zestaw. Nie tworzono kolejnego projektu ani nie restartowano Expo 8082.

## Pozostały zakres

Świeży audyt tych samych 65 obmiarów potwierdza **84/240 wycenionych wierszy, 156 bez wyceny, 8 kompletnych scenariuszy materiałowych**. Katalog ma **151 produktów ze zdjęciami, 127 z aktywną ofertą, 24 braki**, 171 aktywnych ofert, 48 zarejestrowanych i 45 aktywnych sklepów. Cztery dodane oferty nie zmniejszają 24 braków. Wiersze kosztorysów zawierają również materiały o nieustalonych parametrach lub ilościach; nie są liczbą unikalnych brakujących SKU. Zakresy katalogu i kosztorysów nakładają się.

Pełny cel nadal wymaga aktualnych ofert wszystkich materiałów, domknięcia pozostałych przepisów i doboru ilości, kompletnych dostaw oraz rzeczywistych cen i stanów w wybranych pobliskich oddziałach. To wdrożenie nie dowodzi ukończenia całej aplikacji.
