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

## Wdrożenie i dowód końcowy

Stan 2026-11-02T14:16:36.084Z. Source 970b77dbe2156d24aaa275ac952778f9c9a3f678; [PR 183](https://github.com/jakatora/przetargai/pull/183), merge 26a62ef1b99656b03c391bdb70c2c1b9249cf6f9. GitHub nie miał zgłoszonych statusów CI; dowody pochodzą z jawnych lokalnych testów i rzeczywistego HTTP/UI.

- Czyste testy: pricing 242, API lib 168, mobile 594, integracje adapterów 251, wspólny backend 1064 — wszystkie PASS, zero skip/fail. Typy API/mobile, build pricing i 66 dawnych identyfikatorów PASS. Zestawy częściowo pokrywają się, nie sumować ich jako unikalnych testów.
- API 5196b461-316a-4329-864e-d62912b139b9 SUCCESS; WWW 2e70d9ce-e2f5-479f-9ebd-365ed4ffc52d SUCCESS. Bundle SHA-256 f9d1c5091d0a6e5c1b20a5b53b584b1e3056331b988b3cf911f25ebf128a2c70. Odczytano z produkcji 150 plików identycznych z paczką, 148 pozostałych plików zachowanych. Seed 376→378 zachowuje wszystkie starsze obserwacje. Wszystkie 63 publiczne pliki WWW mają zgodne hashe. Skan 82 wartości vaulta bez ujawnionych sekretów; pojedynczy zamierzony publiczny e-mail wsparcia opisany w web-integrity.json.
- Lokalnie i publicznie: po 8 przypadków głównego UI + 2 kopii/planu, 6 odpowiedzi API w głównym UI i 9 przypadków HTTP. Zero pageerror i 429. Rzeczywiste koszyki sklepów, bez wstrzykniętych wycen.
- 5 kg Viva: stałe opakowanie 4 kg oznacza 2 wiadra, 118,78 zł + 15 zł = 133,78 zł. Dobór 2/4 kg: 1+1, 94,83 zł + 15 zł = 109,83 zł, różnica 23,95 zł. Potwierdzone ponownie na produkcji; jest to wynik aktualnych cen i stanów, nie stała obietnica. Zapas 15 kg i stary CE40 nie otrzymały fałszywej ceny całego koszyka.
- Edycja CE40→Viva była jawną decyzją użytkownika testowego, bez automatycznego zamiennika. Zachowano 5 kg po zmianie opakowań, refreshu i kodu 30-001→00-001 oraz restarcie. Rzeczywisty pobrany backup koszyka bez projektów przywraca wybór Viva, opakowania i kod w pustej aplikacji. Skopiowany plan zawiera oba wiadra, źródła i pełną dostawę. Widoki 320/390 px sprawdzone wizualnie.
- Regresja malowania: 4 produkty, 307,46 zł + 48,90 zł = 356,36 zł. Remont z 6 produktami i długimi profilami zachowuje komplet pozycji; indywidualny transport Sewery nadal pozostaje nieznany zamiast fałszywej sumy.
- Katalog: 255 referencji / 222 z potwierdzoną ofertą / 337 ofert; poprzednie 33 luki pozostają jawne.
- Cache ofert 373→375, wcześniejsze 373 zachowane lub odświeżone; historia 14765→15066, zachowano 14743, usunięto 22 wyłącznie zgodnie z istniejącą retencją {"60_point_retention":22}. Nieoczekiwana utrata 0.

Przegląd ścieżki pieniędzy: kwoty brutto pełnych kupowanych wiader i faktyczna wycena kuriera; sumy w całkowitych groszach; dostępne sztuki ograniczają plan; brak wyceny nie oznacza 0 zł. Wybór produktu/opakowań jest jawny i odseparowany dla projektu oraz wspólnego koszyka. Nie ma tu płatności, zlecenia zakupu, zwrotów ani wywołań płatnego AI. Dowód rzeczywisty: 10983 gr z dostawą zamiast 13378 gr dla 5 kg, a nie tylko zielony unit.

Artefakty: G:/Projekty/asystent-remontu-work/wave203-20261102/final-proof.json, validation.json, production-viva-qa.json, production-viva-http.json, production-viva-backup-proof.json, production-viva-purchase-plan.txt, production-web-verification.json i production-catalog-audit.json. Pięć obcych zmian roboczych niezmienionych. Dalszy cel rozwoju ACTIVE; ta fala nie usuwa pozostałych luk ani potrzeby kolejnego mobilnego wydania dla nowego UI.
