# Katalog 57 produktów — 2026-10-25

**57/103 produktów ma zweryfikowane oferty. Pozostało 46 produktów. Katalog zawiera 82 aktywne oferty w 23 sklepach i zdjęcia 103/103 pozycji. Automatyczna wycena dostaw działa w 13 sklepach.**

Dodano dwa produkty Domatu. Każdy odczyt wiąże główny EAN z ID produktu, SKU, formularzem zakupu, stanem magazynowym i faktyczną pozycją anonimowego koszyka WooCommerce. Kwota brutto to suma wartości netto i VAT, potwierdzona także ceną na karcie. Jedna płyta ma 3,12 m²; kosztorys nadal kupuje całe płyty.

| Produkt | EAN | Cena brutto za płytę | Cena za m² | Niezależne źródła tożsamości |
|---|---|---:|---:|---|
| Norgips GKB, 1200 × 2600 × 12,5 mm | 5907651690442 | 35,90 zł | 11,51 zł | [Domat](https://domat24.pl/produkt/plyta-gipsowa-gkb-12-5-12002600-biala/), [Mrówka](https://mrowka.com.pl/produkt/plyta-gkb-12-5x1200x2600-mm-zwykla-norgips-5907651690442.html) |
| Norgips GKBI H2, 1200 × 2600 × 12,5 mm | 5907651691616 | 57,12 zł | 18,31 zł | [Domat](https://domat24.pl/produkt/plyta-gipsowa-gkbi-12-5-12002600-zielona/), [Mrówka](https://mrowka.com.pl/produkt/plyta-gkbi-12-5x1200x2600-mm-woda-norgips-5907651691616.html) |

Odczyty cen: 2026-10-25T17:15:50–52Z. Oba zdjęcia zwróciły HTTP 200 image/*. Nowa oferta GKB zastępuje brak potwierdzonego zakupu po wcześniejszym wykluczeniu Rodimaxu; nie reaktywowano żadnej z dwóch wyłączonych ofert. Wszystkie wcześniejsze 82 obserwacje zachowały ceny, daty i skróty dowodów.

## Dostawa pozostaje niepotwierdzona

Publiczny koszyk Domatu potwierdził obie płyty i ceny brutto. Zwrócił jednak 0 zł przy metodzie „Transport DOMAT z rozładunkiem HDS”, również po podaniu kodu 00-001. Nie stanowi to dowodu bezpłatnego transportu. Domat nie ma automatycznego adaptera dostawy; aplikacja pokazuje brak potwierdzonej wyceny, a nie pełną cenę z darmową dostawą. Odbiór dwóch płyt kosztuje 93,02 zł.

Token Cart-Token i cookies pozostają prywatne dla jednej instancji koszyka. Czytnik dopuszcza tylko odczyt koszyka i dodanie pozycji; nie wywołuje checkoutu ani nie składa zamówień. Używa [oficjalnego Store API WooCommerce](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/cart/). Niespójność EAN, ID, SKU, ilości, waluty, VAT, sum, kraju lub dostępności odrzuca ofertę.

## Walidacja i wdrożenie

245 testów logiki/HTTP PASS, bez pominięć, w tym izolacja tokenów powiązanych z cookies dwóch równoczesnych sesji. Runner nie obejmuje dwóch osobnych plików seedów ESM. Typecheck mobile/API PASS. 55 regresji pozostałych tras wspólnego backendu PASS. Chronione ID prac, obmiary, rejestr i migracje bez zmian.

Railway **1b02bb9e-25e9-4eef-805a-b4257a7dba40 SUCCESS**, 2026-10-25T17:19:58.255Z, czyli 18:19 Warszawa. Świeży snapshot poprzedniej produkcji 4e2e73c2: 959755 B, SHA256 d88cc0607cbfa2efa398fe6533660a6ea3fd5bd5400c5232c937b318ade6e0dd. Release zmienia wyłącznie moduł remontu i bootstrap ofert. [PR13](https://github.com/jakatora/przetargai/pull/13) scalony: source 1c2949f15a4761f6a3cb48041a0ad8e20280938f, main 7d477cfa3a9c1ca1c0d16289b4769187ea6c366b.

Rzeczywisty HTTPS po SUCCESS potwierdził 57 produktów, 82 oferty, 23 sklepy, 13 integracji dostaw, zdjęcia obu nowych produktów i po jednej całej płycie za łącznie 93,02 zł przy odbiorze. Porównanie z dostawą dla tych płyt nie zwraca kompletnej ceny. Wszystkie 57 dostępnych produktów rozpoznano w jednym koszyku z odbiorem osobistym. Wykluczony Arbiton nadal nie otrzymuje oferty. Dotychczasowe trzy prace zachowały wynik 790,83 zł z dostawą. Health 200, auth 401. Nie potwierdzono wysyłki wszystkich 57 produktów jednocześnie.

Odbiór UI web po odświeżeniu: Domat widoczny jako 23. sklep, zachowane trzy prace, kod 00-001, jedna posiadana pozycja i 790,83 zł za dotychczasowy zestaw. Screenshot w outputs/asystent-remontu-katalog-57-20261025.png. Karta wspólnego koszyka pozostaje otwarta. Nie wydano nowego Android/iOS.

Dowody rozmowy: reviewed-domat-products.json, domat-photo-proof.json, domat-cart-proof.json, domat-delivery-proof.json, domat-local-live-proof.json, domat-production-proof.json, domat-tests.log, domat-shared-regressions.log. Kopie najważniejszych dowodów w outputs.

Cel pozostaje aktywny: pozostałe 46 produktów, dalsze potwierdzanie dostaw, dostęp Castorama/OBI oraz kompletność i zgodność materiałów całego remontu. W TopBoden wykryto rozbieżność między koszykiem przyjmującym jedną listwę a metadanymi minimum 10 i wielokrotność 10; nie dodano jeszcze tej oferty ani fikcyjnej wyceny zakupu jednej sztuki.
