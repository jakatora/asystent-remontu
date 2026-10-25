# Zdjęcia katalogu i kolejne sklepy — 2026-10-25

Katalog referencyjny ma 103 produkty. Zdjęcia mają wszystkie 103; zweryfikowane oferty cenowe ma 40. Pozostają 63 produkty bez potwierdzonej oferty. Liczba ofert wynosi 63 w 11 sklepach. Obecność oferty nie potwierdza automatycznej dostawy ani zgodności z każdym kalkulatorem.

Dodano 68 adresów rzeczywistych zdjęć z kart produktów. Dla 48 kart Castoramy odczytano dokładny EAN i zdjęcie w zwykłej przeglądarce. Cena lub stan wymagający wyboru sklepu/kodu nie staje się potwierdzoną ofertą ogólnopolską. Cztery karty bez oferty online otrzymały odrębny komunikat. Dowody robocze: `reference-photos-all-proof.json`, `reference-photo-assets-repaired-proof.json`, `new-stores-and-photos-live-proof.json`.

| Produkt | Sklep | EAN | Opakowanie | Zaobserwowana cena brutto |
|---|---|---|---|---|
| [Fix All High Tack biały](https://www.unimet.pl/uszczelniacze-58/259045-uszczelniacz-hybrydowy-fix-all-high-tack-bialy-290ml-5411183045620.html) | Unimet | 5411183045620 | 290 ml | 31,50 zł |
| [Zestaw przyłączeniowo-mocujący WC](https://www.unimet.pl/pozostale-18/3744291-zestaw-przylaczeniowo-mocujacy-wc-5901095514395.html) | Unimet | 5901095514395 | 1 szt. | 49,95 zł |
| [SWS Basic Plus Inside](https://bestbudowa.pl/tasmy-uszczelniajace-/8055-soudal-tasma-okienna-sws-basic-plus-90-inside-90mmx30m-5411183151178.html) | BestBudowa | 5411183151178 | 90 mm × 30 m | 171,60 zł |
| [Wago 221-413](https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-413-3X4mm-LINKADRUT-NO-WA/11528) | Prescot | 4050821808442 | 1 szt. | 2,75 zł |
| [Profil narożny Cezar](https://cezar.eu/products/profil-do-glazury-narozny-aluminiowy-8mm-cezar-tytan-szczotkowany-mat-2-5m) | Cezar | 5904584853500 | 2,5 mb | 27,32 zł |

Fix All otrzymał poprawny EAN opakowania 290 ml; poprzedni kod dotyczył 125 ml. Źródło producenta: https://media.soudal.pl/katalogi/Katalog_DIY_Soudal_2025_new.pdf . Wago sprzedawane na sztuki nie jest paczką 12 sztuk. Profil Cezara ma długość 2,5 metra, nie 2,5 sztuki. Petro Grey EAN 5904584161544 ma jawnie oznaczony gatunek 2 i nie otrzymał oferty, gdy źródło wskazywało niedostępność.

## Dostawa i walidacja

Prescot korzysta z rzeczywistego koszyka Shoper; metoda „Transport DPD” za 24,60 zł jest kurierem, a nie pomijanym rodzajem transportu. Cezar używa potwierdzonego wariantu Shopify, waluty PLN, ilości i sumy koszyka. Dopiero potem odpytuje stawki dla kodu pocztowego. Metoda „Gratis” wymaga rzeczywistej odpowiedzi sklepu 0,00 zł i spełnionego progu; brak stawki nigdy nie staje się zerem. Dokumentacja: https://shopify.dev/docs/api/ajax/reference/cart i https://shopify.dev/docs/api/ajax/reference/product . Stawki brutto: https://cezar.eu/pages/dostawa-produktow .

Rzeczywiste odczyty kontrolne 2026-10-25: Prescot 12 złączek = 33,00 + 24,60 = 57,60 zł; Cezar dwa profile (5 mb), kod 00-001 = 54,64 + 29,99 = 84,63 zł; 19 profili, kod 30-001 = 519,08 + 0,00 = 519,08 zł. Są to konkretne koszyki i chwile odczytu. Prescot zwraca taryfę krajową, Cezar wycenę dla kodu. Unimet i BestBudowa nie mają jeszcze automatycznej wyceny dostawy.

Walidacja przed wdrożeniem: 228 testów logiki/HTTP bez pominięć, 55 regresji wspólnego backendu, typecheck mobile/API i zachowane 743 identyfikatory treści. Wszystkie 68 nowych URL zdjęć przeszły sprawdzenie typu obrazu. Nowe źródła ofert zweryfikowano rzeczywistymi odczytami. Nie wydano nowego Android/iOS.

## Pozostała praca

- Potwierdzone oferty dla pozostałych 63 produktów oraz działający dostęp serwerowy do Castoramy i OBI.
- Dostawy sklepów bez integracji i materiałów dostępnych lokalnie.
- Zgodność fizycznych jednostek, grubości i zużycia materiałów z kalkulatorami.
- Duże koszyki: obecny limit automatycznego porównania to 20 produktów i 10 sklepów; ograniczony zakres szukania musi być widoczny.
- Ręcznie dodane materiały, narzędzia, częściowo posiadane ilości i utrwalenie wyboru jakości.

Cały cel pozostaje otwarty. Zdjęcia dla 103 pozycji nie oznaczają gotowego porównania cen i dostaw dla wszystkich pozycji.

Odbiór produkcji: Railway `b72fbae4-07a5-43b1-ac29-bafaf20f9c46` SUCCESS 2026-10-25T14:56:51.913Z. Rzeczywisty HTTPS potwierdził 40 produktów, 63 oferty, pięć nowych dokładnych pozycji i trzy powyższe koszyki z dostawą. Backend [PR9](https://github.com/jakatora/przetargai/pull/9) scalony do `0ccace95af89d8348ec68c6521c17a6c9e3fb721`. Naprawiono również zapis literalnego `$&` w 48 URL zdjęć i porównano wszystkie 68 nowych adresów odczytywanych przez aplikację z dowodem źródłowym.
