# Fugowanie płytek: dokładne ilości, opcjonalny SZOP i cały koszyk

Data: 2026-10-29, Europe/Warsaw. Etap 75, postęp; cel rozwoju aplikacji pozostaje aktywny.

Użytkownik wybiera konkretną białą fugę Atlas 001 2 kg i podaje rzeczywistą głębokość oczyszczonej spoiny. Zużycie wynika z powierzchni, formatu płytki, szerokości i głębokości spoiny oraz gęstości gotowej spoiny 1650 kg/m³. Zapas zakupowy jest jawny i edytowalny. Silikon liczymy w ml z długości i prostokątnego przekroju, a nie z powierzchni płytek lub domyślnego obwodu. Długość 0 świadomie pomija zakup. Wariant octowy i neutralny STOP są osobnymi produktami; poziom cen nie zmienia chemii ani koloru.

## Nowy produkt i oferty

Atlas SZOP, butelka **1 kg**, EAN 5905400990010; nowa referencja `mat-grout-cleaner-atlas-szop-1kg`. Rzeczywiste zdjęcie butelki z Sewery. Dwie oferty:

| Sklep | Produkt brutto | Dostawa jednej/dwóch butelek | Podstawa |
|---|---:|---:|---|
| Sewera | 16,06 zł | 19,90 zł | anonimowy koszyk dla 00-001, wysyłka z Katowic |
| KIM24 | 15,00 zł | 16,00 zł | anonimowy koszyk, krajowa taryfa PL |

[Sewera](https://sklep.sewera.pl/atlas-szop-srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-1kg-p9798), [KIM24](https://kim24.pl/Srodek-do-usuwania-zabrudzen-cementowych-i-wapiennych-Atlas-Szop-1-Kg). KIM24: product13906, stock16055, SKU BSZA1IMSZOP01, jednostka szt. bez ułamków, potwierdzone EAN/producent/cena brutto/can_buy. Cztery rzeczywiste koszyki potwierdziły cenę i dostawę; bez zamówień, zgód handlowych, danych klienta i płatności.

KIM24 oferuje również białą fugę Atlas 2 kg za 28 zł, ale publiczne dane produktu7235 nie zawierają EAN. Nie dodano jej jako oferty dla konkretnego kodu kreskowego. RabDom SZOP1805 ma API404; nie dodano usuniętej oferty. Odrzucono niejednoznaczne oferty opisane jako 1 litr. Nie utożsamiamy litra z kilogramem.

## Bezpieczniejsza receptura

[Aktualna karta Atlas Fuga Ceramiczna](https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_fuga_ceramiczna_plik_karta-techniczna.pdf) i [karta Atlas SZOP](https://www.atlas.com.pl/wp-content/uploads/2026/08/atlas_szop_plik_karta-techniczna.pdf), dodatkowo [produkt producenta](https://www.atlas.com.pl/produkt/atlas-fuga-ceramiczna-2/). Karta SZOP ma aktualizację treści 2022-10-17; data katalogu uploadu 2026/08 nie jest datą nowej wersji instrukcji.

Usunięto automatyczne zalecenie kwaśnego preparatu po24h i uniwersalne minimum24h dla każdego kleju. Atlas wskazuje zmywanie wodą wstępnie około10–30min i końcowo4–8h, detergent dopiero po14dniach. Termin rozpoczęcia fugowania zależy od kleju. SZOP tylko na powierzchnie odporne na kwasy, po próbie i z właściwym rozcieńczeniem, przy ochronie cementowych spoin. Może wymyć lub przebarwić zaprawę; długie działanie kwasu osłabia hydrofobowość fugi. Nie podajemy uniwersalnego bezpiecznego terminu użycia kwasu. Liczbę butelek wskazuje użytkownik po ocenie zabrudzenia; brak zmyślonej wydajności na m².

## Dowód całego koszyka

Pomiar kontrolny:10m², płytki30×30cm, spoina3×8mm, zapas10%,4m silikonu5×5mm, świadomie wybrana jedna butelka SZOP.

- Fuga2,904kg →2opakowania po2kg. Silikon110ml →1kartusz280ml. SZOP1kg →1butelka.
- Najtańszy spośród potwierdzonych koszyków: materiały86,36zł + dostawy30,40zł = **116,76zł** (Rab-Dom + Sewera).
- Wszystkie te produkty w Sewerze:97,07zł +19,90zł = **116,97zł**. Wygoda jednego sklepu kosztuje tu21groszy więcej.
- KIM24 ma tylko część zestawu: SZOP15zł +16zł dostawy =31zł. Pozostałe dwa produkty są brakami;31zł nie jest ceną pełnego kompletu.
- Dwie takie prace:5,808kg fugi →3opakowania,220ml silikonu →1kartusz,2butelki SZOP. Koszyk z dostawą **159,72zł**, po sumowaniu surowych ilości.
- Bez zakupu preparatu:100,70zł. Bez zakupu silikonu:89,76zł. Głębokość4mm zamiast8mm zmniejsza fugę do1,452kg/1opakowania i całość do89,86zł.

Wspólny remont potwierdzono dodatkowym rzeczywistym HTTP i w interfejsie: dwa wcześniejsze pokoje z tynkiem oraz nowe fugowanie, łącznie 7 produktów. Materiały 948,20 zł + dostawy 582,90 zł = **1531,10 zł**. Silikon za 21 zł z Realbud trafia do już opłacanej dostawy 25 zł, zamiast osobnego zakupu w Rab-Dom. To 6 zł mniej niż suma niezależnego zakupu tych etapów (1537,10 zł). Nie używamy w tym obliczeniu ceny referencyjnej silikonu 19,98 zł. Potwierdzono cztery koszyki: BMB, LiderzyCen, Realbud i Sewera; inne niepotwierdzone kombinacje pozostają odpowiednio oznaczone.

Wysyłka dla innego kodu42-209 również wyceniona. Taryfa krajowa nie staje się indywidualną wyceną dla adresu. Odbiór własny pozostaje modelem samych materiałów bez kosztu dojazdu; interfejs wymaga potwierdzenia dostępności placówki. Pierwszy skrypt kontrolny błędnie oczekiwał null dla istniejącego modelu odbioru; skorygowano oczekiwanie, zachowując surowe odpowiedzi HTTP. Nie deklarujemy potwierdzonego lokalnego odbioru.

## Spójność i weryfikacja

Nowy model ilości `grout-only-v1`, stabilne job/material/measurement IDs; materiały są jednorodną tablicą legacy. Kreator i edytor pokazują pola warunkowo, walidują głębokość i całe butelki. Stare ogólne ilości, uszkodzone bieżące zapisy, zmieniony EAN i zbyt małe deklaracje „Mam/Kupione” nie usuwają wymagań ze wspólnego koszyka. Opakowania dobierane po sumowaniu między pracami. Inne receptury płytek pozostawione bez zmiany.

754 testy kalkulatora/pricing/API i 1054 testy wspólnego backendu, 0 błędów i 0 pominięć; mobile/API TypeScript. 12 rzeczywistych przypadków HTTP produkcji plus dodatkowy pełny remont (13 razem), 4 anonimowe koszyki detaliczne. Kontrola stabilnych ID i negatywnych mutacji fixture przeszła. Brak uruchomień GitHub Actions dla tego commitu — testy backendu były lokalne. Native UI: kreator, opcja bez silikonu, zapis własnego projektu, zdjęcia, pełna cena, blokada 0 mm i przeliczenie po edycji. Utworzono tylko własny projekt kontrolny `proj_mvsqxm428ke2d6olg`; po próbie przywrócono spoinę 3×8 mm. Teraz jest 26 projektów, w koszyku wybrano trzy własne etapy kontrolne. Żadnych innych projektów nie edytowano.

Backend PR[75](https://github.com/jakatora/przetargai/pull/75), head e19e3c55cb0f31ffa1afe3dbae16e80bfe44ee68, merged513b506ba69eddb338c20e53a1cd248e4df23433. Railway11a33745-fd0f-41ca-92c4-1b5f90b31921 SUCCESS2026-10-28T23:28:47.927Z. Wszystkie148 plików wdrożenia porównano SHA z recenzowanym wydaniem o23:30:04Z; zmieniono wyłącznie bundle i seed,146 innych plików i215 poprzednich obserwacji zachowane. Dodano2obserwacje, razem217. Następne wdrożenie wymaga świeżego snapshotu217 oraz świeżego main.

Katalog: **171referencji,164z aktywnymi ofertami,211ofert,217źródeł,49aktywnych kanałów sklepów;171referencji ma zdjęcie**. Nadal7historycznych dokładnych referencji bez aktywnej oferty. Te same65historycznych map pomiarów dają82/251wycenionych wymagań i169nierozwiązanych; to nie169unikalnych produktów. Dwa dawne założenia fugowania wymagają teraz prawdziwego obmiaru i doboru, więc nie podtrzymujemy pozornego pokrycia84/251. Nowy kompletny scenariusz fugowania jest zweryfikowany oddzielnie. Dalsze prace: kolejne brakujące wymagania, konkurencyjne oferty i potwierdzone lokalne placówki.
