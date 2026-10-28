# INDO: automatyczny zestaw, kartusze i wspólne pary zakończeń

Wersja wave65, rozpoczęta 2026-10-27 i zweryfikowana przez produkcyjne HTTP 2026-10-28. Cały cel rozbudowy katalogu i aplikacji pozostaje otwarty.

## Problem użytkownika i wynik

Sam obwód pokoju nie określa liczby narożników, połączeń ani stron zakończeń. Starsza receptura mogła też sugerować materiały montażowe bez potwierdzenia podłoża. Obecny formularz pozwala wybrać dokładny system INDO 70 mm, biały połysk 01. Po wyborze pokazuje potrzebne pola, zamiast wymagać ich dla nieznanego modelu.

Użytkownik podaje długość netto po odjęciu drzwi, liczbę narożników wewnętrznych i zewnętrznych, połączeń prostych oraz osobno lewych i prawych zakończeń. Wpisane zero świadomie pomija dany dodatek. Brak danych pozostaje widocznym brakiem wyceny. Pokazujemy liczbę pełnych listew 2,5 m z zapasem przed potwierdzeniem planu docinek; sklep dodatkowo stosuje rzeczywistą partię po 10 sztuk.

Wspólny koszyk łączy strony zakończeń między pracami: dla 1 lewego w pokoju A i 1 prawego w pokoju B kupuje 1 komplet L+P. Ogólna reguła to `max(suma lewych, suma prawych)`. Ręcznie wybrane gotowe komplety są dodawane niezależnie. Metadane stron działają wyłącznie dla dokładnego EAN i opakowania, z ilością zgodną z podanym zapotrzebowaniem; zmiana ręcznej ilości odłącza te metadane.

## Źródła techniczne i zakres doboru

- [Instrukcja producenta INDO](https://topboden.pl/files/0PeVEtM3BdxD3EXs.pdf): obejrzane obie strony instrukcji; mocowanie szyny do ściany, sposoby montażu i akcesoria.
- [Karta techniczna INDO](https://topboden.pl/files/gLzn06xW67cMmUsA.pdf): 2500 × 70 × 26 mm, wskazany klej Strongman.
- [Arbiton Strongman 300 ml](https://arbiton.com/pl/klej-montazowy-strongman-300ml): dokładny produkt i pojemność.
- [Pierwotna karta TopBoden](https://topboden.pl/listwy-przypodlogowe/klej-montazowy-strongman-300ml): EAN 5905167788264, zdjęcie, zwykła cena brutto i dostępność.

Instrukcja dopuszcza klej, kołki, taśmę i zszywki. Ta wersja daje zakup wskazanego kleju albo jawną deklarację posiadania kompletu kompatybilnych materiałów montażowych. Inne mocowanie pozostaje do doboru. Przy zakupie Strongmana użytkownik określa sprawdzoną liczbę kartuszy 300 ml; brak pewnej uniwersalnej wydajności w dostępnej karcie, więc nie wprowadzono domyślnego zużycia. Odstęp 30–40 cm na rysunku instrukcji dotyczy punktów kleju, nie rozstawu wkrętów.

Plan docinek wymaga potwierdzenia. To zestawienie pełnych sztuk dla każdej pracy z widocznym zapasem, a nie automatyczna optymalizacja cięć ani wykorzystywania resztek między pokojami. Połączenie zakupów nie zmniejsza liczby wcześniej policzonych pełnych listew.

Stare wyniki pozostają zapisane bez migracji. Odczyt oznacza niepotwierdzoną starą recepturę i brakujące role do przeliczenia. Oznaczenia „Mam” i „Kupione” nie przechodzą automatycznie na niepotwierdzoną ilość lub inny produkt.

## Cena, zdjęcie i dostawa

Dodano jeden dokładny SKU: Strongman 300 ml, EAN 5905167788264, TopBoden UUID `9cc774ed-c24b-4f3b-a863-a935a86383f4`. Natywna jednostka zamówienia to sztuka/kartusz, fizyczna pojemność to 300 ml; masa logistyczna nie jest przeliczana na pojemność. Zdjęcie produktu pochodzi z pierwotnej karty; HEAD potwierdził HTTP 200, `image/webp`.

Zwykła cena karty podczas odczytu wynosiła 31,89 zł brutto. Karta osobno pokazuje cenę warunkową z kodem EXTRA20. Wycena nie stosuje tego kodu. Odczyt dopuszcza wyłącznie sprawdzony stan zwykłej ceny, bez prezentów i aktywnego rabatu w polach ceny; zmienione warunki są odrzucane. Ekran porównania informuje o wyłączeniu opcjonalnych kodów i rabatów lojalnościowych.

Większy limit odpowiedzi 2 MiB jest przypięty do dwóch dokładnych adresów GET Strongmana (API UUID oraz pierwotna karta), bez query. Inne żądania zachowują limit 1 MiB. Identyfikacja łączy UUID/EAN, markę, opakowanie, jednostki, zdjęcie i zgodne ceny API/karty/JSON-LD.

Dostawa TopBoden jest potwierdzona jako krajowa taryfa dla Polski, liczona dla całego wynikowego zamówienia. Kod `00-001` użyto wyłącznie w próbach QA. Nie wysyłano danych klienta, nie tworzono zamówienia ani płatności. Dostępność i cena w pobliskim oddziale nie zostały tym potwierdzone.

## Weryfikacja

- 683 testy kalkulatora, API, kolektora i wycen: PASS, 0 pominięć.
- 1054 testy wspólnego backendu: PASS, 0 pominięć.
- Typy mobile i API: PASS; deklaracje pricing-service zbudowane przez `exec tsc -b`.
- Identyfikatory legacy: 66 zachowane; usunięcie chronionego ID, eksportu i wyczyszczenie rejestru poprawnie odrzucone w osobnym katalogu kontrolnym.
- Walidatory źródeł dla flooring.ts i finishing.ts: PASS, 0 ostrzeżeń.
- Dziesięć świeżych prób lokalnego i produkcyjnego HTTP z bieżącym kalkulatorem oraz publicznymi taryfami: PASS.
- Przeliczenie końcowego źródła backendu ma identyczny SHA256 jak wdrożony pakiet: `44efba2fff28135a0a03169e2f21610fcbc68b3fac89c144ea12ddbe3068d746`.

Przykłady HTTP:

| Przypadek | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| 18 mb netto, 5 narożników wewn., 3 zewn., 5 łączników, 3 lewe/1 prawe zakończenie, 2 kartusze | 477,58 zł | 29,99 zł | 507,57 zł |
| Dwa pokoje po 4 mb, łącznie 4 narożniki wewn., 1 lewe + 1 prawe zakończenie, 2 kartusze | 407,58 zł | 29,99 zł | 437,57 zł |
| Powyższe dwa pokoje i dodatkowe 3 ręcznie wybrane pary | 431,58 zł | 29,99 zł | 461,57 zł |

Wybrany WinBud pokazuje brak sześciu produktów zamiast sumy z ofert innego sklepu. Brak modelu, potwierdzenia mocowania, planu docinek lub kodu dostawy nie daje pozornie kompletnej sumy.

## Wdrożenie i kontrola interfejsu

Backend: [PR #66](https://github.com/jakatora/przetargai/pull/66), squash `87cb4be2fdfd7422f8f7e5f026b15c8742a88fd9`. Zachowano 146 innych plików i wszystkie 208 starych obserwacji; dopisano 1. Brak uruchomionych workflow GitHub nie jest wynikiem zielonego CI.

Pierwszy deploy `4b570f0d-47d8-45a5-afe3-89f89e3c7b71` zakończył się błędem infrastruktury BuildKit przed uruchomieniem. Ponowne wysłanie tego samego pakietu: `038de86f-1e47-4e5f-b9bc-5ee1e44cd54b`, SUCCESS. Sprawdzenie 148 SHA plików na produkcji 2026-10-28 potwierdziło zgodność z ocenionym wydaniem.

Kontrola UI jest częściowa: 2026-10-27 rzeczywista aplikacja otworzyła kalkulator, model INDO i progresywne pola z obmiarem 18 mb. Nie utworzono nowego projektu ani nie zmieniono dotychczasowych projektów. Po aktualizacji narzędzi 2026-10-28 sterowanie lokalną przeglądarką jest wyłączone w ustawieniach Work. Gotowy ekran koszyka, nowe zdjęcie i nowy podgląd liczby listew wymagają jeszcze kontroli wizualnej; nie ogłaszamy jej jako wykonanej. Expo na 8082 nie było restartowane.

## Aktualny zakres braków

Świeży audyt 2026-10-28: 166 referencji, 131 z aktywną ofertą, 176 aktywnych ofert, 209 źródeł, 45 aktywnych sklepów. Wszystkie 166 referencji mają przypisane zdjęcie (167 rekordów zdjęć ze starszym duplikatem źródła).

Pozostało 35 referencji: 28 z wygasłym potwierdzeniem, 6 bez potwierdzonej oferty, 1 niedostępna. Wzrost z 24 wynika z dziesięciu kolejnych wygasłych potwierdzeń i niedostępnej taśmy Soudal SWS, nie z dopisania jedenastu nowych materiałów.

Te same 65 starych map obmiarów daje 73/247 wycenionych wierszy, 174 niewycenione (84 no-query, 76 no-product, 14 no-offer), 8 pełnych scenariuszy materiałowych. Nowych wyborów INDO nie uzupełniano za użytkownika. Te wiersze powtarzają materiały i nakładają się z brakami katalogu; nie są liczbą unikalnych SKU i nie należy dodawać ich do 35. Pełne przykłady INDO są odrębnie zapisane w explicitMeasurementChecks.wave65.

Następne prace: aktualne automatyczne źródła brakujących produktów, dalsze pełne receptury, pełniejsze dostawy wybranych sklepów, sprawdzalne ceny i zapas rzeczywistych pobliskich oddziałów, końcowy test UI po odblokowaniu przeglądarki.
