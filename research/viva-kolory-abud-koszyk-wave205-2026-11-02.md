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


## W205: rzeczywiste oferty i ograniczenie produkcyjne

Dodano 4 referencje ze zdjęciami oraz 7 ofert: Buduj24 Grey07/Manhattan10 w wiadrach 2/4 kg i ABUD White2/4 kg oraz Manhattan2 kg. To dodatkowe oferty istniejących sklepów, nie siedem nowych sklepów. Potwierdzono karty, jednostki i natywne koszyki. Miniatury Grey/Manhattan mają około 11 KB zamiast około 1,4 MB, bez binarnych zdjęć w repo. Obraz pokazuje kolor; fizyczną masę określa opis i GTIN.

Każdy kolor ma odrębną rodzinę. Jawny wybór dobiera opakowania wyłącznie tego samego koloru i formuły, zachowując surowe kilogramy. Stary CE40 nie zmienia się automatycznie w Viva; brak oferty pozostaje widoczny. Zalecenie jednej partii produkcyjnej danego koloru w pomieszczeniu pochodzi z instrukcji producenta. Nie użyto gęstości jako zużycia ani nie zmieniono receptur.

Rzeczywisty UI wykrył dwa pominięte tańsze warianty po włączeniu wszystkich rozmiarów: 510,63→503,14 zł i 503,14→502,09 zł. Cztery testy odtworzyły problemy i przechodzą po dodaniu ograniczonych wariantów pojedynczego rozmiaru oraz niezależnych mieszanek rozmiarów/sprzedawców. Limit 80 natywnych wycen nie wzrósł. Progów darmowej dostawy nie wpisano do kodu; porównanie pozostaje ograniczone i tak jest opisane w UI.

W205 wdrożono ze źródła315d6bb przez [PR185](https://github.com/jakatora/przetargai/pull/185). Lokalnie przeszło 12 UI, 2 kopie/odtworzenia i 12 HTTP; publicznie 8 nowych HTTP i 4 wcześniejsze. Cały publiczny UI nie przeszedł na tym źródle: po 9 przypadkach przy nowym kodzie zabrakło połączenia Buduj24. Pierwsza próba po samym API nie wyceniła też nowych ABUD, dopóki nie zaktualizowano zgodnego modułu WWW. Odpowiedzi i nieudane przebiegi zachowano w wave205-release-20261102; nie ma dla nich fałszywego zielonego final-proof. Kolejne poprawki opisano w W206 i W207.

## Wynik końcowy po W207

Stan 2026-11-02T16:33:08.287Z; API 3aeffe511df0920bfc812c94b0221b8dcd0fba1f, WWW 7362f72880a3e6ff7f64da62d84a5763f2fc7780. [PR186](https://github.com/jakatora/przetargai/pull/186) dodał podpisaną ścieżkę do istniejącej usługi, a [PR187](https://github.com/jakatora/przetargai/pull/187) wykorzystuje ważną krajową wycenę identycznego koszyka przy zmianie kodu, bez przedłużania jej terminu.

Potwierdzony przykład: zapotrzebowanie Grey5 kg + Manhattan5 kg + White20 kg, fizyczny zakup 6+6+20 kg, łącznie 502,09 zł z dostawą. ABUD: Manhattan2 kg×1 i White4 kg×2 —169,70 zł, kurier0 zł dla wskazanego kodu. Buduj24: Grey2 kg×1 i4 kg×1, Manhattan4 kg×1, White4 kg×3 —332,39 zł, kurier0 zł jako taryfa krajowa PL bez osobnej wyceny kodu. Są to jawne stawki nazwanych kurierów z faktycznych koszyków, nie zamiana braku danych na zero.

Pierwsze ograniczone zapytanie W207 potwierdziło inny plan za 510,63 zł i zgłosiło niepełne porównanie po timeoutach. Następne potwierdziło 502,09 zł. Po wygaśnięciu wcześniejszej wyceny odnowiony plan ponownie kosztował 510,63 zł; późniejszy aktualny plan i odtworzenie kopii potwierdziły 502,09 zł. To różne potwierdzone alokacje sklepów i zakresy porównania. Nie wykazano zmiany jednostkowych cen produktów. Wszystkie pierwsze odpowiedzi zachowano; nie obiecuje się globalnego minimum ani jednakowego wyniku każdego zimnego zapytania.

Końcowo W207 przeszło lokalnie i publicznie po 12 UI, 10 rzeczywistych odpowiedzi API i 2 kopie/odtworzenia. Lokalnie 12 HTTP, publicznie 7 HTTP. Sprawdzono 320/390 px, rzeczywiście załadowane zdjęcia, niezależne kolory, surowe ilości, odświeżenie, zmianę kodu i reload. Szczegóły w W207 oraz G:/Projekty/asystent-remontu-work/wave207-20261102/final-proof.json.

Katalog: 259 referencji / 226 z potwierdzoną ofertą / 343 oferty / 33 wcześniejsze luki. Mapeband W10 m FUGI nadal wycofany; ten sam produkt ma ofertę WinBud. Nowe UI i referencje są na WWW. Google Play1.2.0(10) opublikowane; iOS1.2.0(10) WAITING_FOR_REVIEW, release AFTER_APPROVAL. Nie przerywano oceny ani nie wysyłano ponownie binariów. Cel rozwoju ACTIVE.
