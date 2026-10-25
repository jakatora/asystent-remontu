# Katalog 59 produktów i partie zakupu — 2026-10-25

**59/103 produktów ma zweryfikowane oferty; pozostały 44 produkty. 85 aktywnych ofert w 26 sklepach, zdjęcia 103/103, 14 integracji dostaw.** Są to pozycje obecnego katalogu, a nie wszystkie produkty dostępne na rynku.

| Produkt i fizyczne opakowanie | Cena brutto | Sprzedawca i potwierdzenie tożsamości |
|---|---:|---|
| Arbiton INDO biały połysk 01, jedna listwa 2,5 mb | 31,98 zł | [TopBoden](https://topboden.pl/listwy-przypodlogowe/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1), [producent Arbiton](https://arbiton.com/pl/listwy-przypodlogowe/listwy-przypodlogowe-biale/listwa-przypodlogowa-arbiton-indo-bialy-polysk-1), EAN 5905167725719 |
| Soudal 26A, 5 kg | 93,50 zł | [ChemiaDoParkietu25](https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html), [Bricoman](https://www.bricoman.pl/produkty/klej-do-wykladzin-soudal-26a-5kg-20484681.html), EAN 5411183028395 |
| Ten sam Soudal 26A, 5 kg | 117,00 zł | [Bricoman](https://www.bricoman.pl/produkty/klej-do-wykladzin-soudal-26a-5kg-20484681.html), druga oferta tego samego produktu |

ChemiaDoParkietu25 zwróciła rzeczywiste HTTP 200 o **2026-10-25T17:30:57.007Z**. Surowy zapis i SHA256 zachowano. Ścisły parser potwierdził główny formularz ID 25914, EAN, cenę brutto, zakup jednej sztuki i opakowanie. Późniejsze odczyty sklepu i hosta zdjęć kończyły się timeoutem, więc **nie odmłodzono daty ceny**. Fotografia z potwierdzonej karty Bricomana dotyczy dokładnie tego samego EAN; jej HEAD zwrócił HTTP 200 image/*. Zagraniczne koszty w metadanych IdoSell nie są polską wyceną dostawy. Żaden z tych dwóch sklepów nie dostał automatycznego adaptera transportu.

Arbiton był błędnie przypisany w nakładce EAN do białego matu 5905167781685. Materiał od początku linkował biały połysk; poprawiono tylko tę pozycję, wariant i test. Nazwa referencji precyzuje połysk. Zachowano alias dawnej nazwy, aby starsze kalkulacje nadal rozpoznawały produkt. Cudzego rozszerzenia winyli w tym samym pliku nie włączono do zmiany.

## Partia zamówienia a pojedyncza sztuka

Publiczne dane TopBoden wskazują `minOrderQuantity=10`, `multiple=10`, jedną sztukę 2,5 mb oraz 31,98 zł brutto za sztukę. Nie zamieniono EAN jednej listwy w fikcyjny kod dziesięciopaku. Osobne pole `purchaseMultiple` trafia do planów, liczby fizycznych opakowań i budżetu referencyjnego. Dwa pomieszczenia są sumowane przed zaokrągleniem. Dobór opakowań zachowuje również droższe jednostkowo oferty bez dużej partii, jeżeli cały zakup wychodzi taniej. Test z niezależnym przeglądem dopuszczalnych liczebności potwierdza wynik.

**Rozbieżność sklepu pozostaje jawna:** formularz przyjmuje jedną sztukę, natomiast opublikowane dane handlowe wskazują partie po dziesięć. Wycena stosuje opublikowane ograniczenie; opis w aplikacji mówi, że mniejszy zakup wymaga potwierdzenia w sklepie. Nie składano zamówienia i nie potwierdzono finalnej możliwości kupienia jednej sztuki. Potwierdzono koszyk oraz ekran dostawy dla dziesięciu sztuk.

Koszyk oraz ekran dostawy TopBoden pokazały **10 × 2,5 mb = 25 mb: 319,80 zł produktów + 29,99 zł wysyłki = 349,79 zł**. Kraj to zablokowane pole Polska. Nie wpisywano nazwiska, adresu ani danych kontaktowych i nie przechodzono do płatności. Własną pozycję testową usunięto, potwierdzając pusty koszyk.

Odczytujący ofertę porównuje UUID, EAN, markę, ilość i jednostkę, partię, dostępny stan i cenę brutto z główną kartą w PLN. Zdjęcia względne są serwowane przez topboden.pl; próba pod adresem API zwróciła 404 i została odrzucona. Obecny packshot ma potwierdzone HTTP 200. Jawna zmiana minimum lub wielokrotności wycofuje wcześniejszą ofertę także z cache po restarcie, do czasu poprawnego nowego odczytu.

## Dostawa z aktualnej taryfy

Adapter odczytuje [publiczną taryfę TopBoden](https://api.topboden.pl/api/delivery) i bieżące dane całej kupowanej ilości. [Warunki sklepu](https://topboden.pl/dostawa-i-platnosc) określają koszt jako najdroższą kategorię zamówienia, naliczaną raz, oraz próg darmowej wysyłki. Nie dodaje się oddzielnej stawki do każdej listwy. Darmowe próbki, pusta kategoria i techniczne zera nie wyceniają zwykłych towarów.

Podstawa jest jawna: `retailer_tariff_national`, kraj PL, przelew tradycyjny. To wyliczenie według taryfy krajowej, a nie żądanie koszyka dla konkretnego kodu pocztowego. Kod 00-001 oddziela cache użytkownika, a aplikacja pokazuje zakres PL. Rzeczywisty odczyt danych i lokalne HTTP potwierdziły 349,79 zł za dziesięć sztuk oraz próg darmowego transportu dla 70 sztuk o wartości 2238,60 zł. Nie ma potwierdzenia wysyłki wszystkich 59 produktów jednocześnie.

UI pokazuje partie zakupu, podstawę taryfy i polski zapis cen, np. **349,79 zł**. Brak ceny jest kreską, a nie zerową ceną produktu czy transportu. Arytmetyka nadal używa całkowitych groszy.

## Walidacja

258 testów logiki/HTTP oraz 20 osobnych testów seedów PASS, bez pominięć. Stary test seeda oczekiwał, że referencyjna cena wygra jako bieżąca oferta, wbrew istniejącej zasadzie bezpieczeństwa. Teraz rozróżnia rozpoznany produkt od braku zweryfikowanej oferty, bez obniżania wymagań cenowych. 55 regresji pozostałych tras backendu PASS. Typecheck pricing-service/API/mobile PASS. Chronione ID prac, obmiary, rejestr i migracje nie były zmieniane.

Świeży snapshot produkcji 1b02bb9e: 961618 B, SHA256 09197d7d074c16cba535d2b9390ae33cf94eb5d321a79e03db088a2b9355b6db. Przygotowany release różni się wyłącznie modułem remontu i bootstrapem trzech ofert. [PR14](https://github.com/jakatora/przetargai/pull/14), source 682a690d8f2eeb406baaa4d8b4f81e19fd6a9b25, scalony do main c0cd0d26a35669d7c88b62bef54eac00077b4e5b. Nowsze niezwiązane zmiany main 3aa1549 dotyczyły desktop/mobile/Firebase/runbooków, nie backendu; zostały zachowane przez merge.

Railway **f87fb941-ccb1-4f0e-9f43-0bdb57a848f3 SUCCESS**, 2026-10-25T18:05:13.213Z, czyli 19:05 Warszawa. Prawdziwe HTTPS po SUCCESS potwierdziło 59 produktów, 85 ofert, 26 sklepów, 14 integracji, 10 sztuk listew po konsolidacji dwóch pomieszczeń i 349,79 zł z dostawą. Wszystkie 59 dostępnych produktów rozpoznano w jednym koszyku z odbiorem. Soudal pozostaje bez potwierdzonej dostawy: po dodaniu go do zestawu nie pojawia się fikcyjna pełna suma z samą dostawą listew. Dotychczasowe trzy prace nadal kosztują 790,83 zł z dostawą. Health 200, auth 401. Nie jest to dowód wysyłki wszystkich 59 produktów razem.

Odbiór UI web 1280 × 720 po odświeżeniu: widoczne 26 sklepów, zachowane trzy prace, kod 00-001, jedna posiadana pozycja i pięć pełnych wycen. Kwoty pokazują poprawny polski zapis, w tym **790,83 zł**. Nie oglądano nowego komunikatu o partii na projekcie z listwami; regułę i zwracane pole potwierdzono w testach oraz przez lokalne i produkcyjne HTTP. Zrzuty outputs/asystent-remontu-katalog-59-20261025.png, asystent-remontu-koszyk-59-20261025.png oraz topboden-dostawa-10-listew-20261025.png. Karta 2 aplikacji pozostaje otwarta. Tymczasowa karta 6 sklepu zamknięta po opróżnieniu własnego koszyka. Nowego Android/iOS nie wydano.

Dowody rozmowy: catalog-wave4-research/proof.json, reviewed-catalog-wave4.json, reviewed-cpl-wave4.json, catalog-wave4-photo-proof.json, cpl-wave4-photo-proof.json, topboden-api-proof.json, topboden-cart-10-ui.txt, topboden-checkout-10-ui.txt, catalog-wave4-delivery-proof.json, catalog-wave4-local-live-proof.json, catalog-wave4-tests.log, seed-wave4-tests.log, catalog-wave4-shared-regressions.log. Ceny, daty i skróty wcześniejszych 84 obserwacji zachowano dokładnie.

Nadal do wykonania: 44 produkty, dalsze koszty dostawy (w tym dostęp Castorama/OBI), kompletność i zgodność materiałów, ręczne pozycje oraz częściowe zapasy. Cel pozostaje aktywny. W badaniu są już karty baterii Ferro BFO7 w Megawacie i gniazda Simon w Eelektryce; wymagają własnego potwierdzenia głównej mikrodanej i jednostki, nie są jeszcze zaimportowane.
