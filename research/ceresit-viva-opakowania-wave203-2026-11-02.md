# Viva White 01 — pełne wiadra i dostawa, W203

Dwa nowe produkty są odrębne od starszej fugi CE40 i innych odcieni bieli. Wybór automatyczny jest dobrowolny i zachowuje surowe zapotrzebowanie w kg. Wspólny koszyk może łączyć wiadra 2 i 4 kg tego samego produktu i koloru z dostawą całego zamówienia, do granicy potwierdzonych stanów. W jednym pomieszczeniu należy użyć jednej partii produkcyjnej. Istniejące grunty CT17 pozostają osobnymi rodzinami w litrach.

## Źródła i tożsamość

- [Producent](https://www.ceresit.pl/produkty/kleje-i-fugi/fugi/produkt.html/ceresit-fuga-viva/SAP_0201SGC014Y0.html), [karta techniczna 07/2026](https://datasheets.tdx.henkel.com/CERESIT-Fuga-Viva-pl_PL.pdf): opakowania 2/4 kg, White 01; nie podmieniamy receptur ani nie wyliczamy kg z gęstości nasypowej.
- [Buduj24 2 kg](https://buduj24.pl/produkt/19506,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-2kg-white-01): GTIN 9000101173451 / CER-3141510.
- [Buduj24 4 kg](https://buduj24.pl/produkt/19564,ceresit-fuga-viva-elastyczna-cementowa-1-8-mm-4kg-white-01): GTIN 9000101175134 / 3147322.
- Niezależne potwierdzenie kodów i opakowań: [PSB 2 kg](https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-white-2-kg-ceresit-9000101173451.html), [PSB 4 kg](https://www.grupapsb.com.pl/produkt/fuga-viva-elastyczna-cementowa-1-8-mm-white-4-kg-ceresit-9000101175134.html).

2 listopada 2026 o 13:54 UTC sklep potwierdził 35,44 zł/2 kg i 59,39 zł/4 kg, odpowiednio 1 i 3 wiadra. Rzeczywisty anonimowy koszyk 1+1: 94,83 zł materiałów + 15 zł Kurier InPost / Przelewy24 = 109,83 zł. Stawka ma potwierdzony zakres krajowy PL; nie przedstawiamy jej jako indywidualnej stawki dla kodu pocztowego. Ceny i stany wymagają ponownego sprawdzenia przy zakupie. Nie składano zamówienia i nie wpisywano danych klientów.

Zdjęcia White 01 pochodzą z tych samych kart, są ilustracją wiadra bez oznaczenia masy. Frontend używa zatwierdzonych miniatur 90×90, 11 KB zamiast plików 1,38 MB. Nazwy i masy widoczne są osobno.

Nie dodano niepotwierdzonego Fach-Bud (sprzeczne stare GTIN/Viva), Viverto „na zamówienie”, niedostępnego ABUD ani sztywnej stawki z cennika transportu. Starsza luka CE40 nie została ukryta jako rzekomo rozwiązana przez Viva. 253 referencje + 2 nowe = 255; wcześniejsze 33 luki pozostają jawne, bieżące liczby potwierdzimy po wdrożeniu.

## Walidacja i wydanie

Rzeczywiste karty, trzy koszyki i odmowa ponad stan: `G:/Projekty/asystent-remontu-work/wave203-20261102/viva-native-final.json`. Fixture zawiera tylko oczyszczone bloki produktu/formularza i koszyka, bez danych klientów ani tokenów. Nowe testy: tożsamość, jednostka szt./kg, skończone stany, brak zamiany CE40/koloru, opt-in, istniejący zapis/backup oraz pełna cena z dostawą. Pricing 242 PASS i focused 7 PASS przed zamrożeniem; czyste pełne testy, przegląd ścieżki pieniędzy, HTTP, UI i publikacja WWW/API w toku.

Nie zmieniono 66 identyfikatorów robót, obliczeń pomiarów, receptur, migracji ani zależności. Binarne aplikacje sklepowe pozostają 1.2.0 (10): Android PUBLISHED, Apple WAITING_FOR_REVIEW; nowe UI w tej fali dotyczy WWW.
