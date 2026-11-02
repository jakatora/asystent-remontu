# W205 — osobne kolory Viva i dodatkowe koszyki ABUD

W204 był postępem: więcej sprawdzonych podziałów dostawy w tym samym limicie, bez udowodnionego przyspieszenia. W205 rozszerza konkretne produkty, zdjęcia i rzeczywisty koszt wspólnych zakupów.

Dodano cztery odrębne referencje: Viva Grey 07 i Manhattan 10 w wiadrach 2/4 kg. Automatyczny dobór wymaga jawnego wyboru i łączy wyłącznie ten sam kolor/formułę. White 01, Grey 07, Manhattan 10, grunty CT17 i stary CE40 pozostają odrębne; surowe kg i identyfikatory pozycji nie są zmieniane.

## Tożsamość i oferty

- [Buduj24 — CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 2KG Grey 07](https://buduj24.pl/produkt/19544,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-grey-07): GTIN 9000101173499, 2 kg, kod 314155.
- [Buduj24 — CERESIT Fuga VIVA elastyczna CEMENTOWA 1-8 MM 4KG Grey 07](https://buduj24.pl/produkt/19562,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-grey-07): GTIN 9000101174854, 4 kg, kod 3147084.
- [Buduj24 — CERESIT FUGA VIVA ELASTYCZNA CEMENTOWA 1-8 MM 2KG MANHATTAN 10](https://buduj24.pl/produkt/19516,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-manhattan-10): GTIN 9000101173536, 2 kg, kod 3141558.
- [Buduj24 — CERESIT FUGA VIVA ELASTYCZNA CEMENTOWA 1-8 MM 4KG MANHATTAN 10](https://buduj24.pl/produkt/19561,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-manhattan-10): GTIN 9000101174991, 4 kg, kod 3147168.
- [ABUD — Fuga elastyczna Viva 1-8mm 2kg Ceresit Kolor: 01 White](https://www.abud.pl/product-pol-67336-Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-01-White.html): GTIN 9000101173451, 2 kg, kod 3141510.
- [ABUD — Fuga elastyczna Viva 1-8mm 4kg Ceresit Kolor: 01 White](https://www.abud.pl/product-pol-67395-Fuga-elastyczna-Viva-1-8mm-4kg-Ceresit-Kolor-01-White.html): GTIN 9000101175134, 4 kg, kod 3147322.
- [ABUD — Fuga elastyczna Viva 1-8mm 2kg Ceresit Kolor: 10 Manhattan](https://www.abud.pl/product-pol-67342-Fuga-elastyczna-Viva-1-8mm-2kg-Ceresit-Kolor-10-Manhattan.html): GTIN 9000101173536, 2 kg, kod 3141558.

Niezależne potwierdzenie odmian i opakowań: [producent](https://www.ceresit.pl/produkty/kleje-i-fugi/fugi/produkt.html/ceresit-fuga-viva/SAP_0201SGC014Y0.html), [karta techniczna](https://datasheets.tdx.henkel.com/CERESIT-Fuga-Viva-pl_PL.pdf) oraz cztery karty PSB:

- https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-grey-2-kg-ceresit-9000101173499.html
- https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-grey-4-kg-ceresit-9000101174854.html
- https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-manhattan-2-kg-ceresit-9000101173536.html
- https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-manhattan-4-kg-ceresit-9000101174991.html

Odczyt natywny 2026-11-02 14:45 UTC: Buduj24 35,44/59,39 zł za pełne wiadra 2/4 kg; skończone stany Grey 2/3 i Manhattan 3/3 wiadra. Nie użyto dawnych indeksowanych 36,52/61,87 zł. ABUD White 2/4 i Manhattan 2 kg: 39,90/64,90/39,90 zł. Ogólny opis magazynu ABUD nie zamienia się w wymyśloną liczbę sztuk; każdą żądaną ilość potwierdza realny koszyk.

Pięć rzeczywistych anonimowych koszyków: Grey2+4 i Manhattan2+4 w Buduj24 — Kurier InPost15 zł, taryfa krajowaPL; ABUD White2+4 dla30-001 — Pocztex13 zł; ABUD5×4kg dla30-001 — wyraźna stawka kuriera0 zł (nie placeholder); Manhattan3×2kg dla00-001 — Pocztex13 zł. Każde ABUD potwierdzenie kodu wykonano natywnie. Nie podawano kontaktu/adresu, nie składano zamówienia ani płatności.

Zdjęcia pochodzą z tych samych kart; Grey07, Manhattan10 i obie masy White obejrzano. UI katalogu używa miniatur90×90 po około11KB zamiast1,4MB, bez binarnych obrazów w repo. Zdjęcie to ilustracja koloru; masę wskazuje opis.

## Walidacja w toku

8 nowych testów: API4 (tożsamość, masa/kolor/GTIN, replay5natywnych koszyków i odrzucenie nieznanego zera dostawy), pricing2 (osobne kolory i jedna faktyczna dostawa wspólnego zamówienia), mobile2 (jawny wybór/backup/izolacja). API i mobile typy przed zamrożeniem PASS. Błędne początkowe założenie testu o2liniach fizycznych poprawiono: dwa kolory po2rozmiary mają4odrębne GTIN, nie2.

Nie rozwiązano pozostałych33starych luk przez podmianę modeli. Norgips w Adamex/Elmas, dawne Facile i prywatne marki marketów nadal wymagają dostępnej dokładnej oferty; historyczne badania potwierdziły nieaktywne koszyki lub brak stanu. Nowe kolory nie zwiększają licznika rozwiązanych starych braków. Cel rozwoju ACTIVE. Pełne czyste testy, HTTP/UI i wdrożenie następują po zamrożeniu.
