# Katalog 61 produktów i kurier Eelektryki — 2026-10-25

**61/103 produktów ma zweryfikowane oferty. Pozostały 42 produkty. Katalog zawiera 87 aktywnych ofert w 28 sklepach, zdjęcia 103/103 i 15 automatycznych integracji dostawy.** Liczby dotyczą obecnego katalogu aplikacji, nie całego rynku budowlanego.

## Dodane oferty

| Produkt | Cena brutto | Źródło |
|---|---:|---|
| Simon Basic BMGZ1Z.01/11, biały, z uziemieniem i przesłonami; jedna sztuka do ramki | 16,56 zł | [Eelektryka](https://www.eelektryka.com/simon-basic/3975-simon-basic-gniazdo-pojedyncze-zu-i-przes%C5%82onami-do-ramki-bia%C5%82e-bmgz1z0111-5902787568238.html), EAN 5902787568238, produkt 3975, SKU SI427 |
| Ferro One BFO7, bateria natryskowa chrom, bez zestawu natryskowego | 194,80 zł | [Northbud](https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291), EAN 5902194954525 |

Rzeczywiste odczyty cen: Simon 2026-10-25T18:41:40.632Z, Ferro 2026-10-25T18:43:42.347Z. Zdjęcia z tych samych kart zwróciły HEAD 200 image/*. Daty i treść wcześniejszych 87 obserwacji zachowano dokładnie. Zmiana historycznej ceny referencyjnej z innego sklepu nie jest zmianą ceny tej samej oferty.

Nowy czytnik PrestaShop wiąże główny formularz, EAN, SKU, ID produktu, cenę brutto, PLN, zakup jednej sztuki i stan magazynowy. Tańsze rekomendacje w tym samym zakresie Product oraz cena netto 13,46 zł nie mogą dostarczyć ceny gniazda. Gniazdo wymaga osobno ramki Simon Basic; nie zmieniono go na komplet z ramką ani nie dopisano niezweryfikowanej ceny akcesorium.

## Automatyczna dostawa

Eelektryka otrzymała osobny adapter anonimowego koszyka. Potwierdza ilości, jednostkowe ceny brutto, SKU, dostępny zapas i sumę wszystkich produktów. Wybiera kuriera z grupy przedpłaty, a następnie uzyskuje z frontendowej akcji `assignDelivery` rzeczywistą sumę dostawy i całego koszyka. Nie wysyła danych klienta, zgód ani zamówienia. Prywatne ciasteczka i token formularza nie trafiają do odpowiedzi aplikacji ani dowodu wyceny.

- Jedno gniazdo: 16,56 zł + Pocztex Kurier 17,49 zł = **34,05 zł**.
- Dwa gniazda: 33,12 zł + jedna dostawa 17,49 zł = **50,61 zł**.
- Domyślne 7,49 zł dotyczy punktu lub automatu, więc nie jest porównywane jako kurier do domu.

Zakres wyceny jest jawny: `retailer_basket_national`, Polska. Kod użytkownika rozdziela cache, ale nie jest przesyłany do sklepu jako rzekome żądanie lokalnej taryfy. Integracje dla konkretnego kodu nadal obejmują Sewerę i Cezar; pozostałe mają jawny zakres krajowy lub brak potwierdzonej dostawy.

Koszyk Northbud pozwala kupić jedną baterię i przejść do formularza bez konta. Pokazuje także zero przy metodzie „PRZESYŁKA do 5kg”, ale nie wdrożono czytnika tego koszyka ani nie potwierdzono warunków tej metody dla aplikacji. Northbud pozostaje bez automatycznej dostawy. Dodanie baterii do zestawu z gniazdem poprawnie blokuje pełną sumę z dostawą zamiast pominąć transport baterii.

## Cały katalog w jednym kosztorysie

Endpoint wcześniej odrzucał pracę ze 101–103 materiałami, mimo limitu 200 produktów w silniku. Ujednolicono limit przez `DELIVERY_LIMITS.products`. Rzeczywiste lokalne HTTP sprawdza 103 i 200 pozycji oraz odrzucenie 201. Produkcyjne HTTPS potwierdza zachowanie wszystkich 103 wierszy: 61 rozpoznanych i 42 bez ofert. Pełna suma nie jest pokazywana przy brakujących produktach.

## Weryfikacja i wdrożenie

265 testów logiki aplikacji/API, 20 seedów i 55 regresji pozostałych tras wspólnego backendu PASS, bez pominięć. Typecheck API i mobile PASS. Nowe testy korzystają z zarejestrowanych fragmentów szablonu sklepu z zastąpionym anonimowym tokenem; każda mutacja wejścia musi rzeczywiście zmienić badane pole. Testy odrzucają obcy EAN, SKU i walutę, inną partię, za mały zapas, rozbieżne ceny i sumy, punkt odbioru oraz pobranie.

Świeży snapshot produkcji f87fb941: 965269 B, SHA256 f37b81f79e2ea70b65397529d632c8d7592f94e8ade2410d014d4ea46fd0580a. Release zmienia wyłącznie moduł remontu i dwie obserwacje bootstrap. [PR15](https://github.com/jakatora/przetargai/pull/15) scalony: source 15ec444302e7aaf348097cb74b78edabf1382cbe, main 2d2274d6313456768c54b6b6b653b5c37db94146.

Railway **68837246-a236-44b1-bc4e-6f6a7578e9ca SUCCESS**, 2026-10-25T18:52:02.356Z, czyli 19:52 Warszawa. Prawdziwe HTTPS po wdrożeniu potwierdziło 61 produktów, 87 ofert, 28 sklepów, 15 integracji, 50,61 zł za dwa gniazda z dwóch pomieszczeń, 61 dostępnych produktów w jednym koszyku z odbiorem oraz 103 zachowane pozycje katalogu. Dotychczasowe trzy prace nadal kosztują 790,83 zł z dostawą. Health 200, auth 401. Nie potwierdzono wysyłki wszystkich 61 produktów jednocześnie.

Odbiór UI web 1280 × 720: widoczne 28 sklepów, zachowane trzy prace, kod 00-001, jedna posiadana pozycja, pięć pełnych wycen i 790,83 zł. Nowe zdjęcia sprawdzono przez HEAD i w odpowiedzi HTTP; nie oglądano ich w projekcie użytkownika z tymi produktami. Oba własne koszyki sklepów opróżniono i zamknięto karty testowe. Karta aplikacji pozostaje otwarta. Nie wydano nowych buildów Android/iOS.

Dowody w katalogu roboczym rozmowy: `catalog-wave5-production-proof.json`, `catalog-wave5-local-live-proof.json`, `eelektryka-live-delivery-proof.json`, `eelektryka-courier-ui.txt`, `catalog-wave5-tests.log`, `catalog-wave5-shared-regressions.log`. Wynik HTTPS: `outputs/asystent-remontu-katalog-61-dowod-20261025.json`. Zrzuty: `asystent-remontu-koszyk-61-20261025.png`, `asystent-remontu-koszyk-61-suma-20261025.png`, `eelektryka-dostawa-kurier-20261025.png`.

## Dalsza praca

Pozostały 42 produkty, dalsze koszty transportu, dostęp do wycen Castorama/OBI, zgodność materiałów, uwzględnienie ręcznych pozycji i częściowo posiadanych zapasów. Cel pozostaje aktywny.

Następny sprawdzony kandydat: Kronodom, Arbiton Secura Thermo Aquastop Smart, EAN 5905167826942. Rzeczywiste HTTP 200: karta publikuje **10,33 zł za m²**, paczka ma 6 m². Nie importować ceny m² jako ceny paczki; JSON-LD bez gtin nie wystarcza do powiązania zakupu. „Dostawa od 69 zł” pozostaje zapowiedzią, nie wyceną koszyka. Auroks dla BFO7 ma `can_buy=false`, ZielonaŁazienka OutOfStock, Onninen HTTP 403; nie zastępują dostępnej oferty Northbud. Megawat wymaga zamówienia około 500 zł brutto, więc nie rekomendować pojedynczej baterii z pominięciem minimum.
