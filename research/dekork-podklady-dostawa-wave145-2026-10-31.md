# Dekork: trzy podkłady, zestawy paczek i dostawa — 2026-10-31

Dodano oddzielne, jawnie wybierane podkłady ze sklepu Dekork: Professional LVT 1,5 mm / 6 m² (EAN 3067088472737), SilverLux 1,5 mm / 10 m² (4000543672678) i GoldLux 1,5 mm / 10 m² (4006149126867). Nie zastępują dawnego Corksystem 5061092900925 ani Volden. Native vendor to Dekork, dlatego tak są nazwane w aplikacji. Tożsamość kodów i podstawowe wymiary niezależnie potwierdzają karty B&Q i Homebase; nie przenoszono sprzecznych wartości akustycznych między sklepami. Każdy podkład nadal wymaga doboru do zamków i instrukcji paneli. Membrana nie wyłącza automatycznie decyzji o barierze i spoinach.

## Źródła

- [Professional, natywne warianty 1–10 paczek](https://dekork.pl/products/profesjonalny-podklad-lvt-1-5mm-wysoka-gestosc-6m2-do-60m2)
- [Professional: niezależne potwierdzenie EAN, 6 m² i wymiarów](https://www.diy.com/departments/professional-lvt-underlay-1-5mm-6m2-64-58-sqft-20-denser-uk-brand-high-density-vinyl-flooring-base/3067088472737_BQ.prd)
- [SilverLux w Dekork](https://dekork.pl/products/srebrnylux-podklad-lvt-1-5-mm-ze-srebrna-membrana-wysoka-gestosc-najwyzsza-jakosc), [Homebase: kod i format](https://www.homebase.co.uk/en-uk/corksystem-silverlux-15mm-high-density-lvt-underlay-for-vinyl-spc-click-flooring/p/0865688)
- [GoldLux w Dekork](https://dekork.pl/products/goldlux-podklad-lvt-1-5-mm-z-zlota-membrana-wysoka-gestosc-najwyzsza-jakosc), [Homebase: kod i format](https://www.homebase.co.uk/en-uk/corksystem-goldlux-15mm-high-density-lvt-underlay-for-vinyl-spc-click-flooring/p/0865687)
- [Polityka wysyłki](https://dekork.pl/policies/shipping-policy), [natywne API koszyka Shopify](https://shopify.dev/docs/api/ajax/reference/cart)

## Cena i jednostka zakupu

Professional: 1 paczka 68,99 zł, zestawy 2/3/4/5/6/7/8/9/10 paczek kosztują odpowiednio 130,99 / 189,99 / 245,99 / 302,99 / 359,99 / 413,99 / 467,99 / 521,99 / 575,99 zł brutto. Każdy wariant ma przypięty native variant ID i liczbę rzeczywistych paczek. Dwie paczki to 12 m² i 130,99 zł; nie dwie sztuki droższej pojedynczej oferty za 137,98 zł. Bazowy EAN identyfikuje podkład; nie twierdzimy, że zestawy mają ten sam GTIN opakowania zbiorczego. Native barcode niektórych zestawów jest null i musi pozostać null. Sprawdzamy też oryginalny kod i opis pojedynczej paczki. Link zakupu zawiera wybrany variant ID.

SilverLux: 152,99 zł za rolkę 10 m², GoldLux: 169,99 zł za rolkę 10 m². Nie używamy `product.price` jako ceny wszystkich wariantów; liczy się cena wskazanego dostępnego wariantu. Walidujemy producenta/vendor, nazwę, kod, jednostkę, ilość w opakowaniu, cenę całkowitą, jawne wliczenie podatków i PLN koszyka.

## Dostawa

Rzeczywiste anonimowe koszyki potwierdziły 17,99 zł w taryfie Standardowa dla kodu 30-001: każdy z 10 wariantów Professional, dwie pojedyncze paczki, SilverLux, GoldLux i ich wspólny koszyk. Pierwsza paczka także dla 00-001. Do sklepu wysyłamy tylko kraj Polska i kod, bez danych kontaktowych, pełnego adresu, zamówień i zgód. Suma pełnego koszyka, ceny, rzeczywiste native variant IDs i ilości muszą się zgadzać przed użyciem dostawy. To kalkulacja koszyka dla kodu, nie stawka przepisana z regulaminu. Koszt nie jest zakodowany na stałe; brak lub zmiana taryfy daje jawny brak wyceny. Ostateczne doręczenie pełnego adresu potwierdza sklep. Brak potwierdzonej opcji odbioru własnego nie staje się darmową dostawą.

## Weryfikacja

Cztery nowe testy API korzystają z trzech prawdziwych DTO produktów, 15 zapisanych koszyków i natywnych komunikatów o podatkach. Sprawdzają wszystkie warianty, kody, wielkości i ceny, kraj/kod, całą zawartość koszyka oraz odrzucenie zmian ceny, waluty, ilości, sumy, marki, dostępności i taryfy. Osobny test kalkulatora sprawdza trzy modele na wszystkich poziomach, sumowanie dwóch pokoi, stare znaczenia wyborów i brak przenoszenia „Mam” z innego podkładu. Pierwszy pełny mobile: 406/406 PASS. Odbiór czystego wydania, rzeczywisty HTTP, przeglądarka i wdrożenia zostaną dopisane po wykonaniu.

Dowody task/work: dekork-product-{0,1,2}-wave145.json, dekork-native-carts-wave145.json, dekork-bundle-carts-wave145.json, dekork-gross-photos-wave145.json, dekork-observations-wave145.json. Zdjęcia pochodzą z dokładnych produktów CDN Shopify, HTTP 200 image/png; nie dodano binarnych plików do repo. Cel dalszego rozwoju pozostaje aktywny.
