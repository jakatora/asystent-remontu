# Profile CD60 i kotwy stropowe — 2026-10-27

Dodano dwa produkty ze zdjęciami, trzy sklepy i rzeczywiste wyceny dostawy. Wybrany wariant sufitu10m² ma oferty wszystkich13materiałów. Pełna dostawa tego sufitu nadal nie jest potwierdzona w pozostałych sklepach: Domat, Leroy Merlin i Marbet24. API zwraca `best:null`, a interfejs pokazuje tę przyczynę. To postęp w pokryciu potrzeb remontu, nie ukończenie całej aplikacji.

## Kotwy: jeden karton100szt., dwie oferty

- [Producent Rawlplug R-GS-06040](https://rawlplug.com/global/en/p/r-gs-06040) potwierdza EAN5906675169347 i karton100szt. Jest to kotwa stalowa z klinem, nie gwintowana tuleja R-DCA ani kołek z tworzywa.
- [Elektro-Hurt](https://sklep.ehw.com.pl/osprzet-laczeniowy/rawlplug-r-gs-06040-kotwa-do-sufitow-podwieszanych-6x40-mm): produkt6807/stock6816, SKU RAWLPLUG-304145, natywna jednostka`szt.` bez ułamków, cena49,54zł brutto (nie40,28netto). Pierwotna zajawka wyszukiwarki44zł nie została użyta. W tytule brak liczby100; liczbę w kartonie wiążemy z dokładnym EAN producenta, kodem R-GS-06040 oraz potwierdzonym opisem „opakowanie kartonowe”. Zmiana jednostki, SKU, opakowania lub wymiarów wycofuje wycenę. Nie podajemy ceny49,54 jako jednej kotwy.
- [Z prądem](https://zpradem.pl/kotwa-do-sufitow-podwieszanych-6x40mm-r-gs-06040-100szt/836377): produkt836377/stock836308, SKU0001-00012-27895, nazwa jawnie`100szt.`, cena113,10zł brutto (nie91,95netto). Fotografia obu ofert dotyczy tego samego EAN, z dokładnej karty Elektro-Hurt.
- Rzeczywisty anonimowy koszyk: Elektro-Hurt49,54+kurier21=70,54zł; Z prądem113,10+kurier27=140,10zł. Różnica69,56zł obejmuje dostawę, dla jednego kartonu. Zajawka paczkomatu lub gotówka przy odbiorze nie jest kurierem do domu. Stawki Shoper są krajowePL; nie opisujemy ich jako indywidualnej taryfy geograficznej.

## Dobór i ilość kotew

[Karta producenta](https://rawlplug.com/media/catalog/reference_object/d/c/d/9/dcd99de317a157ac2c93d052079dcf0b80755dbc/1999.RAWLPLUG.EN.GS_CEILING_WEDGE_ANCHOR.pdf) określa beton C20/25–C50/60, min.100mm podłoża, otwór6mm/głębokość40mm, osadzenie32mm, rozstaw200mm i krawędź150mm. [Specification Design Guide producenta](https://rawlplug.com/media/catalog/reference_object/1/5/3/0/15304a9130204135b83107ad15b6cdd4327e576e_Rawlplug_Specification_Design_Guide.pdf) podaje dla R-GS-06040 maksymalną grubość mocowanego elementu4,5mm. Warstwy wykończenia także wymagają uwzględnienia przy doborze. Długość marketingowa6×40 nie uprawnia do dowolnej grubości mocowania.

Nowy wybór`gypsumCeilingAnchors=1` oznacza R-GS po potwierdzeniu warunków, a`gypsumAnchorCount` jest liczbą z projektu na konkretne pomieszczenie przed zapasem. Wymaga także`gypsumCeilingSubstrate=1`. Przykład26+10%→29kotew→1karton100szt. Dwa pomieszczenia po29→58, nadal1karton. Bez dodatniej całkowitej liczby, dla innego stropu lub nieprawidłowego wyboru pozostaje pozycja do ustalenia. Nie obliczamy nośności ani liczby mocowań z samej powierzchni. Odczyt starego JSON również oznacza brakujące dane jako niepotwierdzone, zamiast usuwać zakup z listy.

## Profil IRBUD: odrębna tożsamość bez wymyślonego EAN

[Karta IRBUD](https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/) deklaruje Norgips CD60,3m,0,6mm i60mm szerokości. [Karta producenta](https://norgips.pl/produkty/profil-cd-60-o-gr-blachy-06-mm-33.html) jest niezależnym źródłem specyfikacji tego typu. Sklep nie publikuje EAN ani SKU producenta. Identyfikator produktu sklepu10911 nie stał się GTIN: `remont-sku-irbud-10911` jest osobną przestrzenią od produktu Castoramy EAN5907651698899. Nie łączymy ich automatycznie. Nowy wybór`gypsumCdProfile=1` jest jawny;0zachowuje poprzedni produkt. Stare identyfikatory prac, obmiary i migracje pozostają.

Jedna jednostka koszyka IRBUD to jeden profil3m. Cena11,45zł brutto zgadza się między główną kartą a natywnym koszykiem WooCommerce (9,31netto+2,14VAT). Cena regularna12,90 jest oddzielona od aktualnej11,45. Zduplikowane przez motyw nagłówki, formularze i ceny muszą być zgodne, nie pobieramy ceny produktu polecanego.

Norma wskazanego rusztu:10m²→36,3mb z dotychczasowym10%zapasem→13profili/39mb. Koszyk potwierdził148,85+52=200,85zł. Dwa sufity po5m² sumują się do tych samych13profili, zamiast dwukrotnego zaokrąglenia po7. Referencja przetrwała JSON bez polaEAN, a zapis z niezgodnym EAN jest odrzucany jako tożsamość tej oferty.

## Dostawa IRBUD do kodu użytkownika

Po sprawdzeniu StoreAPI podłączono rzeczywiste przeliczenie kodu, nie tylko domyślną stawkę kraju. W tej izolowanej anonimowej sesji adapter dodaje dokładną liczbę profili, przesyła wyłącznie`shipping_address:{country:'PL',postcode}`, wybiera kuriera i potwierdza ponownie kod, produkty, kwoty brutto/VAT, brak dopłat oraz wybrany transport. Odpowiedź ma`basis:retailer_basket_postcode`, właściwy`postalCode` i ważność10minut. Dla QA00-001 i80-001 sklep faktycznie zwrócił52zł. Nie zakładamy, że każdy przyszły kod i koszyk ma tę samą taryfę.

Transport dopuszcza te operacje wyłącznie dla sprawdzonego IRBUD i dokładnych pól. Imię, e-mail, telefon, ulica, billing, inne kraje, checkout i zamówienia nie są przesyłane. Token anonimowego koszyka jest prywatny dla sesji. Zero odbioru osobistego ani pobranie70zł nie stają się wyceną dostawy prepaid. Zmiana kodu w finalnej odpowiedzi lub zmiana ceny powoduje odmowę rekomendacji. Publiczna [dokumentacja WooCommerce](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/) opisuje wykorzystane operacje.

## Testy, produkcja i ograniczenia

624core/calculator/API i1054sharedbackend PASS,0skip, finalny mobile/API typecheck PASS. Siedem nowych źródeł zweryfikowanych HTTP200/0ostrzeżeń; legacy66prac i3negatywne mutacje PASS. Błędy znalezione w weryfikacji zostały poprawione: HTML opisu opakowania jest czytany jako tekst, sprzeczny wymiar R-GS jest odrzucany, a brak liczby kotew w starym JSON nie usuwa pozycji. `quantity.ts` zachowuje dotychczasowy rygor EAN innych produktów; obsługa braku GTIN dotyczy nazwy i źródła wybranego profilu IRBUD. Inne założenia prac nie są podmieniane.

Rzeczywisty finalny HTTP: `work/catalog-wave57b-production-proof.json`; natywne sesje i karty w`work/catalog-wave57-research/`; audyt`work/catalog-wave57-current-audit-proof.json`. Te same65obmiarów nadal84/240wycenione,156bezwyceny i8pełnychscenariuszy MATERIAŁÓW, bo nie dopisujemy automatycznie nowych decyzji konstrukcyjnych do starych obmiarów. Osobny jawny wariant sufitu ma13ofert/0braków produktów, lecz`best:null` dla całej dostawy. Katalog151produktów/zdjęć,127zofertą,167aktywnychofert,46sklepów/43aktywnych,24braki wcześniejszych referencji. Wiersze scenariuszy nie są unikalnymi SKU ani procentem ukończenia.

PR57 https://github.com/jakatora/przetargai/pull/57: head0b7542aeaec042e1778ea60ac721a2ae73d1524c, mergebbbb32fb0b9a4ed41b2131ce4e2326df4dfac850, Railwaye07f78b1-0962-4399-8389-e1beae4a7ab2 SUCCESS. Snapshot185obserwacji/148plików, zachowano185starych i146pozostałychplików.

PR58 https://github.com/jakatora/przetargai/pull/58: head3168b7f723c1ac32439e2fbf2db8d05316e9edc2, merge7aff6d249f4b973b5d0bf4efc4b80e5fa8b9c0c9, Railway393dc179-7683-4009-9187-ffc988e1978e SUCCESS. Świeży snapshot188obserwacji/148plików; zmieniono tylko bundle, pozostałe147plików i188obserwacji zachowane. Finalnie148/148SHA produkcji zgodne z review. Brak GitHubworkflow/statusów CI; lokalne testy to odrębny dowód. `/auth/me` bez tokena nadal401.

Pełny cel pozostaje aktywny: do uzupełnienia nadal24referencje bez aktualnych ofert,156wierszy pozostałych prac, integracje transportu wskazanych sklepów, komplet winylu i rzeczywista lokalna dostępność/cena. Kolejne działania powinny zmniejszać te braki, a nie jedynie zwiększać liczbę SKU. Nie odnawiamy dat wygasłych potwierdzeń bez odczytu sklepu i nie podmieniamy wycofanych modeli bez wyboru użytkownika.

## Odbiór interfejsu i końcowe kontrole

Na własnym projekcie QA `proj_mvqj35dlrykdtbczn` sprawdzono zdjęcia, wybór profilu IRBUD, wybór kotew R-GS i porównanie dwóch sklepów sprzedających ten sam karton 100 sztuk. Po przeładowaniu zapisane wybory i liczba 26 kotew z projektu pozostały w formularzu. Kod pocztowy i lista 13 wycenionych materiałów również przetrwały przeładowanie. Nie zmieniono pozostałych 18 projektów, preferencji wspólnego koszyka ani serwera Expo na porcie 8082.

Zrzuty: `outputs/catalog57-anchor-stores-20261027.png` i `outputs/catalog57-irbud-profile-20261027.png` w katalogu roboczym sesji. Dowody zapisu: `work/catalog57-ui-preferences-proof.json` i `work/catalog57-persisted-ceiling-ax.txt`.

Dodatkowy odczyt produkcyjny dla kodu QA 80-001 potwierdził przesłanie tego kodu do wyceny: 13 profili, 148,85 zł materiałów, 52 zł dostawy, 200,85 zł łącznie; `basis: retailer_basket_postcode`. Dowód: `work/catalog-wave57b-postcode80-proof.json`. To wynik tego koszyka i odczytu, bez założenia stałej stawki dla innych kodów lub przyszłych zakupów.

Fixtures testów nie zawierają niepustych prywatnych pól kontaktowych ani tokenów/cookies. Rejestr zachowuje 66 prac; materiały `gypsum-wall` (10) i `gypsum-ceiling` (13) są jednorodne, bez nowych ostrzeżeń tych prac. Pozostałe 8 wcześniejszych ostrzeżeń rejestru pozostaje. Dowody: `work/catalog-wave57-fixture-safety-proof.json` i `work/catalog-wave57-registry-proof.json`.
