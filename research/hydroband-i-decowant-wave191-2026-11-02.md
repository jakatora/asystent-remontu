# Hydroband i nowy sklep Decowant — 2026-11-02

Status: kandydat do walidacji i publikacji. Poprzednia tura przyniosła postęp: wave190 opublikowana. Ciągły cel obejmuje nadal katalog, dostawy, zmiany cen, UX, testy i wdrożenia.

## Zadanie użytkownika

Użytkownik powinien kupić właściwą taśmę i narożniki do Woder E, razem z wybranymi opakowaniami folii i rzeczywistą dostawą. Dodajemy trzy pozycje do wspólnego koszyka oraz sklep Decowant z pięcioma sprawdzonymi ofertami. Nie zmieniamy dotychczasowego kalkulatora Mapei ani nie podstawiamy materiałów Atlas do jego systemu.

## Źródła i tożsamości

- [Atlas Hydroband 3G](https://www.atlas.com.pl/produkt/atlas-hydroband-3g/) i [narożniki producenta](https://www.atlas.com.pl/produkt/atlas-narozniki-uszczelniajace-hydroband-3g/): zgodność z hydroizolacjami Woder, rozdzielenie taśmy i narożników.
- [Rolka Decowant](https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-tasma-uszczelniajaca-125-mm-10-m/370), native product 370: EAN 5905400602807, jedna rolka 125 mm × 10 m. Tożsamość niezależnie potwierdzona przez [PSB](https://www.grupapsb.com.pl/produkt/tasma-izolacyjna-szerokosc-125-mm-10-mb-hydroband-3g-atlas-5905400602807.html).
- [Narożnik wewnętrzny Decowant](https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-WEWNETRZNY/318), product 318: EAN 4260112880754, opis i native jednostka potwierdzają sprzedaż jednej sztuki. Kod potwierdza [Trops](https://trops.pl/pl/products/naroznik-hydroband-3g-wewnetrzny-atlas-5533.html).
- [Narożnik zewnętrzny Decowant](https://www.sklepdecowant.pl/pl/p/ATLAS-HYDROBAND-3G-NAROZNIK-ZEWNETRZNY/319), product 319: EAN 4260112880761, jedna sztuka. Kod i cenę za sztukę pokazuje także [Trops](https://trops.pl/produkt/naroznik-zewnetrzny-hydroband-3g-atlas/).
- Woder E [5 kg](https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-5-KG/317) i [15 kg](https://www.sklepdecowant.pl/pl/p/ATLAS-WODER-E-FOLIA-IZOLACYJNA-15-KG/367): istniejące dokładne GTIN 5905400514490 i 5905400514506. Zachowana dotychczasowa rodzina opakowań, bez Woder W/Duo lub niepotwierdzonych rewizji.

Nie zakładamy równoważności kodów narożników 4260112880754/761 z kartami 5905400601459/442. Natomiast opis pojedynczej jednostki Decowant jest weryfikowany osobno od kodu opakowania zbiorczego. Dane produktu, kod sklepu, producent, jednostka, liczba sztuk, URL i native product ID mają ścisłe potwierdzenie przed ceną i transportem.

Odczyty natywne cen z 03:40:35 UTC: rolka 119,99 zł, narożnik wewnętrzny 12,87 zł, zewnętrzny 12,18 zł, Woder 5 kg 119,99 zł i 15 kg 329,87 zł; wszystkie możliwe do dodania do koszyka. To ceny konkretnego odczytu. Do seed dodano tylko pięć rzeczywistych obserwacji, zachowując poprzednie 356; brak wymyślonej wcześniejszej ceny.

## Rzeczywisty koszyk i transport

Trzy anonimowe koszyki z 03:37 UTC potwierdziły produkty, ilości, sumy, kraj Polska i DPD Kurier / Autopay 19,99 zł: jeden narożnik, dwie rolki + cztery narożniki wewnętrzne + jeden zewnętrzny, a następnie te akcesoria z dwoma wiadrami Woder E 5 kg. Nie składano zamówienia, nie wysyłano danych kontaktowych i nie wykonywano płatności. To wycena krajowa, nie deklaracja indywidualnej stawki dla kodu pocztowego.

Stare indeksowane karty Lobo przekierowały do kategorii. API Dam-Bud product 876 zwróciło can_buy=false mimo starszego wyniku wyszukiwarki. Nie dodano ich jako aktywnych ofert. Sewera ma dodatkowe warianty na metry i z kodami magazynowymi; nie przypisano im na podstawie podobnej nazwy GTIN ani zawartości pudełka.

Artefakty: G:/Projekty/asystent-remontu-work/wave191-20261102. Surowe publiczne odpowiedzi pozostają poza repo; fixture testowy zawiera wyłącznie potrzebne dane, bez sesji i pól kontaktowych. Dalsze etapy: czyste testy, rzeczywiste HTTP aplikacji, fotografie, UI, snapshot wspólnego backendu i publikacja.
