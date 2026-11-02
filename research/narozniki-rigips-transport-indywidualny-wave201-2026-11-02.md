# W201 — pojedyncze narożniki Rigips i poprawny opis transportu

Wdrożono 2026-11-02: dwa nowe produkty, fotografie i właściwy opis transportu wymagającego indywidualnej wyceny. Publiczny odbiór WWW obejmuje 14 scenariuszy i 8 rzeczywistych odpowiedzi wyceny, a API dwa dodatkowe koszyki. Nie potwierdzono kosztu dostawy narożników ani najtańszej ceny całego remontu z ich transportem. Zgłoszona do Google/Apple wersja 1.2.0/10 zachowuje zamrożone źródło 86208e3.

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

## Wdrożenie i odbiór publiczny

Źródło aplikacji `94568bf88ada8f559a33e7c2980b695409c73d6b`, wysłane do repozytorium. [PR 181 wspólnego backendu](https://github.com/jakatora/przetargai/pull/181) scalony jako `a523ae20037b32e50be0c09d26bceb3c7b780ba3`. Lista statusów GitHub była pusta; nie traktujemy jej jako zielonego CI. Kontrole wykonano na czystym źródle: 592 mobile, 248 adapterów (w tym 4 nowe), 237 pricing, 165 API-lib oraz 1064 shared PASS, 0 skip. Grupy częściowo się pokrywają i nie należy ich sumować. Typy mobile/API PASS; zachowano 66 identyfikatorów prac.

- Railway API `9877f5f1-5857-424e-b385-bbfc93137eda`: SUCCESS 2026-11-02 13:03:49 UTC. Odczyt wszystkich 150 wdrożonych plików identyczny z przygotowaną paczką; 148 plików innych usług zachowanych. Bundle SHA-256 `7d04404e90ab99136e0d8bcd54a31f74879ef04ad0c4ff252999ce3682f77b5f`.
- Railway WWW `a562e53e-b7e6-44b0-8ec0-496047c43144`: SUCCESS 2026-11-02 13:08:13 UTC. Publiczny manifest i wszystkie 63 pliki, 17 321 849 bajtów, zgodne z lokalnymi SHA-256; relay gotowy. Zachowano opublikowane strony prawne.
- Lokalnie i publicznie po 14 scenariuszy UI / 8 prawdziwych odpowiedzi API / 0 błędów strony / 0 HTTP 429. Sprawdzono wybór po GTIN, obie fotografie, zmianę ilości, osobne długości, kopiowanie planu, reload, szerokości 320/390 px, dwa kody pocztowe, prawdziwe odświeżenie cen i usuwanie pozycji. Osobny bazowy koszyk malowania nadal otrzymuje pełną rzeczywistą wycenę z dostawą.
- Publiczne dwa bezpośrednie koszyki HTTP: jedna listwa 2,5 m = 8,09 PLN materiałów; dwie listwy 2,5 m i jedna 3 m = 25,85 PLN materiałów. W obu poprawna przyczyna transportu indywidualnego, brak końcowej kwoty i brak fałszywego zwycięzcy z dostawą. Nie wstrzykiwano fikcyjnych wycen.

## Aktualna dostępność i zachowanie historii

Katalog lokalny przed uruchomieniem odświeżania: 253 referencje, 221 potwierdzonych produktów, 336 ofert, te same 32 wcześniejsze luki. Publiczne odświeżanie 2026-11-02 ujawniło dodatkowy rzeczywisty brak: [Ceresit CE40 01 biały 2 kg, GTIN 5900089140015](https://sklep.sewera.pl/ceresit-fuga-ce40-01-wodoodporna-elastyczna-2kg-p9147) ma stan 0 SZT. Czytnik zwraca `retailer_out_of_stock`, a API wycofało ofertę o 13:04:16 UTC. Pierwotna kontrola stałej liczby 32 luk nie przeszła; weryfikacja rzeczywistej karty potwierdziła zmianę stanu sklepu. Oferty nie przywrócono sztucznie.

Publiczny stan 13:10:45 UTC: **253 referencje / 220 potwierdzonych produktów / 335 ofert / 33 luki**. Oba nowe narożniki potwierdzone. Liczby dostępności są migawką i mogą się zmieniać wraz ze sklepami.

Cache po wdrożeniu: 371→373 obserwacje, wszystkie wcześniejsze źródła zachowane z datami nie starszymi niż przed wdrożeniem. Historia 14 143→14 454 punktów; zachowano 14 133 wcześniejsze punkty, 10 najstarszych usunęła istniejąca retencja 60 punktów na źródło. Brak nieoczekiwanej utraty. Dwa rzeczywiście zarejestrowane wzrosty: Arena Carina K98-0069 283,70→283,79 PLN (+0,09), mŁazienka Ovida 50 256,99→257,00 PLN (+0,01). Nie generowano sztucznej historii ani zmian ceny.

## Pozostałe ograniczenie i następny krok

Większy koszyk czterech materiałów malowania oraz dwóch długości narożnika zachował wszystkie sześć wymagań i poprawne liczby listew (2+1), bez brakujących produktów i bez fałszywej sumy z dostawą. Rzeczywiste żądanie zakończyło się jednak `quote_timeout` dla Sewery i częściowych planów innych sklepów. Oczekiwanie szczegółowej przyczyny indywidualnego transportu w tym większym scenariuszu **nie przeszło**. Osobno potwierdzono bezpieczeństwo niepełnej wyceny; nie utożsamiamy tego z pełnym działaniem transportu.

Kolejny priorytet: czas odpowiedzi i kolejność wycen dużych koszyków, z zachowaniem zakazu uznawania nieznanego transportu za zero. To ograniczenie nie zostało ukryte przez ponowienie ani osłabienie testu źródłowego. Oryginalna odpowiedź i osobny dowód zachowania wszystkich pozycji są w artefaktach.

Stan sklepów 2026-11-02 13:11 UTC: Google Play 1.2.0/10 `IN_REVIEW`, Apple `WAITING_FOR_REVIEW`, publikacja Apple `AFTER_APPROVAL`. Nie wysyłano ponownie zamrożonych buildów dla W201.

Artefakty: `G:/Projekty/asystent-remontu-work/wave201-20261102`, m.in. `final-proof.json`, `production-corners-qa.json`, `production-corners-http.json`, `production-web-verification.json`, `confirmed-new-gap.json` i `local-whole-renovation-safety-proof.json`. Pięć zastanych plików WIP ma niezmienione SHA-256. Cel ciągłego rozwoju pozostaje aktywny.
