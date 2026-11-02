# W201 — pojedyncze narożniki Rigips i poprawny opis transportu

Stan roboczy 2026-11-02: dwa nowe produkty, fotografie i obsługa przyczyny niepotwierdzonego transportu przygotowane. Natywne odczyty i cztery regresje PASS; pełny odbiór WWW/API i wdrożenie pozostają przed nami. Zgłoszona do Google/Apple wersja 1.2.0/10 ma zamrożone źródło 86208e3 i nie jest zmieniana przez tę partię.

## Potrzeba użytkownika i zakres

W katalogu można dopisać do wspólnego koszyka dokładny narożnik do płyt g-k w długości 2,5 lub 3 m. Nie utożsamiamy go z profilem do mokrego tynku ani z wariantem Budmat, którego obecna oferta wymaga minimum 25 listew. Produkty mają różne GTIN i pozostają oddzielnymi pozycjami; opakowanie zbiorcze producenta 50 sztuk nie jest detaliczną jednostką zakupu Sewery.

Źródła niezależne: [fabryczny katalog Rigips, strona 43, numery 11511804/11511805](https://www.rigips.pl/sites/default/files/2025-06/cennik_24-06-2025.pdf), [Sewera 2,5 m](https://sklep.sewera.pl/naroznik-aluminiowy-23-5x23-5mm-2-5m-rigips-p7501), [Sewera 3 m](https://sklep.sewera.pl/naroznik-aluminiowy-23-5x23-5mm-3m-rigips-p7500). Cennik fabryczny potwierdza tożsamość i wymiary, nie aktualną cenę detaliczną. Nie zmieniono receptur ani zapisanych wyborów użytkownika.

| Produkt | GTIN | Cena jednej listwy w odczycie | Sprawdzenie UTC |
|---|---|---:|---|
| Rigips 23,5×23,5 mm / 2,5 m | 5905637118041 | 8,09 PLN | 2026-11-02 12:49:49 |
| Rigips 23,5×23,5 mm / 3 m | 5905637118058 | 9,67 PLN | 2026-11-02 12:49:55 |

Fotografie pochodzą z tych samych kart, obie HTTP 200 image/*. Nowe źródła i czytnik sprawdzają odrębny kod producenta, GTIN, dokładną długość, jednostkę SZT i cenę pełnej listwy. Inna długość, metr zamiast listwy, wiązka 50 sztuk, inna marka lub zdjęcie nie są akceptowane jako ta sama oferta.

## Rzeczywisty transport

Dwie niezależne sesje anonimowe, po pięć rzeczywistych żądań, potwierdziły zakup jednej listwy w Katowicach i otwarcie formularza dostawy. Sklep oferuje `Transport Sewera do 50km` (metoda 12) oraz `Transport HDS wycena indywidualna` (162), oba z natywnym typem `data-personal-collection=3`. Brak zwykłego kuriera. Nie wysłano danych klienta, pełnego adresu, zgód ani zamówienia; nie wywołano kalkulatora kuriera dla nieobsługiwanej metody.

Dotychczas taki przypadek kończył się `no_home_delivery`, co pomijało dostępny transport na indywidualne zapytanie. Po poprawce jest `retailer_transport_quote_required`, a istniejący polski interfejs wyjaśnia, że koszt materiałów nie obejmuje tej opłaty. Żadna kwota całego remontu nie może uznać nieznanego transportu za zero.

Cztery regresje sprawdzają rzeczywiste karty, zmiany tożsamości/jednostek, dostępne i wyłączone metody oraz pięć odpowiedzi całego adaptera. Pierwszy test samego klasyfikatora przeszedł, lecz rzeczywiste wywołanie wspólnego quotera ujawniło utratę przyczyny w filtrze wyjątków (`quote_unavailable`). Poprawiono zwracanie istniejącego typu wyniku bez wyjątku i dodano regresję pełnego adaptera. Końcowe rzeczywiste sesje otrzymały właściwą przyczynę dla obu produktów. Nie utożsamia się zielonego unitu z działaniem całej ścieżki.

## Katalog i wcześniejsze tropy

Przed zmianą świeży publiczny odczyt: 251 referencji, 219 potwierdzonych, 32 luki. Nie zaliczono starych braków do rozwiązanych. Papierowa taśma Norgips 50×75 m w [Elmas](https://sklep-elmas.pl/p/tasma-spoinowa-papierowa-norgips-50x75mb-g-k) ma natywnie count=0; akustyczna 30×30 m w [Adamex](https://eadamex.pl/tasmy-i-siatki/16585-tasma-akustyczna-piankowa-30mm-30m-norgips-5907651698851.html) także jest na zamówienie. Inne kody pianki HIPPER nie zostały przypisane do tych GTIN. Nie importowano niedostępnych kart do rankingu.

Seed 374→376: poprzednie 374 obserwacje pozostawione w identycznej kolejności i treści, dwie rzeczywiste obserwacje z 12:44 UTC. Nie dopisano fikcyjnej obniżki ani historii ceny nowego produktu. Pięć zastanych plików WIP, migracje, identyfikatory prac, konta i płatności pozostają poza zakresem.

Artefakty i dalszy odbiór: `G:/Projekty/asystent-remontu-work/wave201-20261102`. Następne: czyste źródło i wymagane kontrole, rzeczywisty formularz katalogu/wspólny koszyk, brak końcowej sumy przy indywidualnym transporcie, aktualny wspólny backend, wdrożenie i publiczny odbiór. Cel ciągłego rozwoju pozostaje aktywny.
