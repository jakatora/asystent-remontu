# Katalog 55 produktów — 2026-10-25

**55/103 produktów ze zweryfikowanymi ofertami, 80 aktywnych ofert w 22 sklepach, 103/103 zdjęć. Do uzupełnienia pozostaje 48 produktów.** Dodano sześć produktów i wykluczono dwie wcześniejsze oferty Rodimaxu z rekomendacji zakupu. Ceny pochodzą z rzeczywistych odczytów, a nie z wyników wyszukiwania.

| Produkt i opakowanie | Cena brutto | Źródła tożsamości i oferty |
|---|---:|---|
| Cezar klipsy Master Line, 25 szt. | 38,00 zł | [KELOT](https://listwy.sklep.pl/pl/p/Klips-montazowy-z-podkladka-dystansowa-do-montazu-listew-1opak25szt-MASTER-LINE-CEZAR/687), [OBI](https://www.obi.pl/p/7146277/cezar-klipsy-montazowe-do-listew-przypodlogowych-podklad-opak-25-sztuk) |
| Floorpol kliny 30 × 150 mm, 10 szt. | 18,98 zł | [LiderzyCen](https://liderzycen.pl/pl/p/Kliny-montazowe-Floorpol-30-x-150-mm-10-szt./31651), [Castorama](https://www.castorama.pl/kliny-montazowe-floorpol-30-x-150-mm-10-szt-/5907508719289_CAPL.prd) |
| Ferro Stillo BSL2 chrom, 1 szt. | 129,98 zł | [TGS](https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44), [karta producenta](https://ferro.pl/wp-content/uploads/pim/product/ferro_product_card_bsl2_pl_2025-07-05.pdf?md=1751679592), [PSB](https://mrowka.com.pl/produkt/bateria-umywalkowa-stillo-stojaca-ferro-5902194929837.html) |
| Cezar profil progowy owalny, srebrny mat, 40 mm × 1 m | 19,55 zł | [Producent Cezar](https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m), [Castorama](https://www.castorama.pl/departments/profil-progowy-cezar-40mm-srebrny-1m-aluminiowy-1-szt-/5904584845215_CAPL.prd) |
| Budmat narożnik aluminiowy z siatką, 2,5 m | 6,35 zł | [Unimet](https://www.unimet.pl/narozniki-6/262771-naroznik-aluminiowy-z-siatka-7070-250cm-5900308102411.html), [Bricomarché](https://www.bricomarche.pl/naroznik-aluminiowy-20-x-20-z-siatka-7-x-7-l-2-5-mb) |
| Knauf Goldband, 25 kg | 49,89 zł | [Krasny](https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383), [producent Knauf](https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120) |

KELOT pokazuje obok siebie **30,89 zł netto i 38,00 zł brutto**. Porównanie używa 38,00 zł za całe opakowanie 25 sztuk. LiderzyCen podczas rzeczywistego odczytu pokazywali 18,98 zł; historyczny wynik wyszukiwarki 19,58 zł nie został użyty. Goldband ma EAN 5902367206383 dla 25 kg; producent rozróżnia również 20 i 30 kg. W JSON-LD Krasnego producent KNAUF jest w polu `manufacturer`, przy pustym `brand`. Czytnik korzysta z producenta wyłącznie przy braku jawnej marki, zachowując weryfikację EAN, nazwy, wariantu i oferty PLN.

## Dostawy z rzeczywistych koszyków

| Zamówienie po jednym opakowaniu | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| KELOT: 25 klipsów | 38,00 zł | 20,00 zł | 58,00 zł |
| LiderzyCen: 10 klinów | 18,98 zł | 14,99 zł | 33,97 zł |
| TGS: bateria Ferro | 129,98 zł | 19,00 zł | 148,98 zł |
| Cezar: profil 1 m | 19,55 zł | 24,99 zł | 44,54 zł |
| Wspólny zestaw tych czterech produktów | **206,51 zł** | **78,98 zł** | **285,49 zł** |

Trzy nowe integracje Shoper używają odizolowanych anonimowych koszyków, sprawdzają EAN, ID produktu, ilości, PLN, sumy i płatność z góry. Są to stawki krajowe PL. Cezar odpytywany jest dla kodu pocztowego 00-001. Kwota „od 14,99” w metadanych produktu nie zastępuje rzeczywistej odpowiedzi koszyka: profil Cezara otrzymał 24,99 zł. Nie składano zamówienia. Unimet i Krasny nadal bez automatycznej dostawy. Łącznie **13 integracji**, nie 22. Metadane zdrowia backendu pochodzą teraz z tej samej konfiguracji co działające integracje; wcześniejsza lista pięciu sklepów była niepełna.

## Wykluczenie niepotwierdzonych zakupów

[Strona Rodimaxu](https://rodimax.pl/) wyświetla komunikat o niemożności realizacji usług do lokalizacji. [Kod przycisku koszyka](https://rodimax.pl/js/main.min.js) otwiera komunikat szablonu, a nie potwierdza rzeczywistego koszyka; [koszyk](https://rodimax.pl/koszyk.html) nie dostarczył potwierdzenia zamówionego produktu. Nie przesądza to o przyczynie ani statusie przedsiębiorcy. Oznacza brak wystarczającego dowodu, że użytkownik kupi wskazany produkt za odczytaną cenę.

Oferty Norgips GKB i Arbiton Aquastop zostały oznaczone `retailer_checkout_unconfirmed`. Nie mogą wrócić z wcześniejszego bootstrapu ani cache i nie wchodzą do sum koszyka. Zachowano historyczne dowody oraz fotografie dokładnego EAN. Karty referencyjne pokazują brak potwierdzonej oferty internetowej. Nie dodano dwóch znalezionych tam nowych produktów tylko po to, aby zwiększyć licznik katalogu.

## Walidacja i dalsza praca

242 testy logiki/HTTP PASS, bez pominięć; typecheck mobile/API PASS. Rzeczywiste koszyki nowych czterech integracji oraz wspólny zestaw 285,49 zł potwierdzono przez HTTP. Wszystkie sześć zdjęć zwróciło HTTP 200 `image/*`. Dotychczasowe obserwacje zachowały ceny, daty i skróty dowodów. Chronione ID prac, obmiary i migracje nie były zmieniane.

Dowody rozmowy: `reviewed-catalog-wave3.json`, `catalog-wave3-photo-proof.json`, `catalog-wave3-delivery-proof.json`, `catalog-wave3-local-live-proof.json`, `catalog-wave3-tests.log`. Wdrożenie musi zachować świeżą bazę produkcji i przejść odbiór HTTPS po SUCCESS konkretnego deploymentu.

Pozostało 48 produktów, pełne pokrycie dostaw oraz zgodność i kompletność potrzeb materiałowych. Dostęp Castorama/OBI pozostaje niepotwierdzony. Następna możliwa integracja: Domat/WooCommerce — karta Norgips GKBI potwierdza ID 29071 i EAN, ale wymaga osobnego, sprawdzonego czytnika cen brutto i koszyka. Nie podłączono jej na podstawie samego wyniku wyszukiwania.

## Odbiór wdrożenia

Railway **4e2e73c2-c8d8-4c12-8736-182bf83cfde3 SUCCESS**, 2026-10-25T16:49:57.202Z (17:49 Warszawa). Świeża baza 3ce54580: archiwum 957416 B, SHA256 `c87c1410afd66da57128e4ccb2a03ed6ec44dd14f8ff340acc477a75e3117ded`. Zmieniły się tylko wygenerowany moduł remontu oraz bootstrap sześciu ofert. 55 regresji pozostałych tras: PASS bez pominięć. [PR12](https://github.com/jakatora/przetargai/pull/12) scalony: source `f51eb89a139f8e843beb9d9b05f150ad8726cf4e`, main `f3d7762ddf72971a11d5332582fb25aded6a423f`.

Rzeczywisty HTTPS po SUCCESS potwierdził 55 produktów/80 ofert/22 sklepy/13 integracji, rozpoznanie wszystkich sześciu nowych pozycji z fotografiami, kompletny koszyk 55 produktów z odbiorem osobistym, 285,49 zł za cztery nowe produkty z dostawą oraz brak wyceny dwóch wykluczonych pozycji. Dotychczasowe trzy prace remontowe: nadal 790,83 zł z dostawą. Health 200, auth 401. Dowód `catalog-wave3-production-proof.json`; kopia w `outputs`. Nie jest to potwierdzenie dostawy wszystkich 55 produktów jednocześnie.

Odbiór UI web 1280×720: zachowane trzy prace, kod 00-001, jedna posiadana pozycja, 790,83 zł i pięć pełnych wycen. Lista sklepów pokazuje 22 aktualne sklepy bez Rodimaxu. Zrzuty `outputs/asystent-remontu-55-produktow-20261025.png` oraz `outputs/asystent-remontu-koszyk-55-produktow-20261025.png`. Kartę wspólnego koszyka pozostawiono otwartą. Nowego Android/iOS nie wydano.
