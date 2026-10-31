# Wykładzina na wymiar, klej i rzeczywista dostawa — 2026-10-31

## Problem i zmiana

Praca `vinyl-glued` zachowuje istniejący identyfikator. Jej stary model powierzchniowy wymaga ponownego obmiaru: nie można zastąpić wykładziny rolkowej panelami samoprzylepnymi ani kupować zaokrąglonych paczek 1 m². Nowy model `rolled-vinyl-v1` liczy pełną szerokość i długość odcinka; brak wymiarów, doboru kleju, przygotowania podłoża lub zakończeń pozostawia wycenę niepełną.

Dwie szerokości Lentex Orion 514-05 w eWinyl (2 m i 4 m) mają jawne identyfikatory SKU sklepu, bez wymyślonego EAN. Stary adres i SKU sklepu zawierają „3m 4m”, ale formularz zakupu i tytuł deklarują 2 m / 4 m. Nie dodano szerokości 3 m. Cena 55 zł dotyczy m² rozliczeniowego, a nie gotowej paczki. Dodano zdjęcie dekoru, wspólne dla obu szerokości, oraz zdjęcie i ofertę wiadra Tytan Osakryl 4 kg, EAN 5903518039515, 55,45 zł. W sumie trzy nowe źródła/obserwacje; ziarno 283 → 286.

## Obmiar i tożsamość

- Instrukcja Lentex podaje 10 cm dodatku do każdego wymiaru. Pasy w szerszym pomieszczeniu wymagają rzeczywistego planu, uwzględniającego wzór i zakładki, oraz potwierdzenia przygotowanych materiałów/usługi spawania. Orion jest wykładziną obiektową z połączeniami spawanymi na gorąco.
- Limit 25 m na zamawiany odcinek to zachowawcza granica aplikacji, bez deklarowania dostępności dowolnej długości w sklepie. Zachowujemy potrzebne odcinki pomieszczeń i pokazujemy plan podziału zakupionego kawałka. Nie zakładamy wykorzystania odpadów z szerokości.
- Zapotrzebowanie kleju liczone jest od powierzchni pomieszczenia, ze wskazanym zapasem, przed zaokrągleniem wspólnych wiader. Soudal 26A: 400–600 g/m² według TDS; Tytan Osakryl: 0,3–1,7 kg/m² według aktualnego TDS. Dla Tytanu użytkownik wskazuje dobrane zużycie, bez cichego podstawienia dolnego zakresu czy zużycia innego kleju. Produkty nie są automatycznymi zamiennikami.
- Zmiana wymiarów/produktu ponownie otwiera potwierdzenia dopasowania; stara lub zmieniona tożsamość produktu nie zachowuje statusu kupione/posiadane. Dotychczasowe `floorArea`/`perimeter` pozostają rozpoznawane, lecz nie zastępują nowego obmiaru. Brak migracji danych i zmian starych identyfikatorów.

## Rzeczywisty dowód HTTP

Lokalny serwis z produkcyjnym silnikiem i adapterami wykonywał anonimowe koszyki sklepów 2026-10-31 ok. 08:02 UTC. Nie złożono zamówienia, nie wysłano danych klienta i nie zaakceptowano regulaminu.

Przykład: pokoje 3 × 1,8 m i 2,2 × 1,8 m, Orion 2 m, Osakryl dobrany na 400 g/m² + 5% zapasu, przygotowanie podłoża/zakończenia już zapewnione:

| Zakup | Materiały | Dostawa | Potwierdzenie |
|---|---:|---:|---|
| eWinyl: 1 odcinek 2 × 5,4 m, podział 3,1 + 2,3 m | 594,00 zł | 199,00 zł | Koszyk, kod 00-001, kurier, wybrany przelew bankowy i zgodna suma w odczycie checkout |
| Sewera: 1 wiadro Osakryl 4 kg; wymagane 3,9312 kg | 55,45 zł | 19,90 zł | Koszyk, kod 00-001, InPost do 5 kg, płatność online, oddział Tarnowskie Góry |
| Razem | 649,45 zł | 218,90 zł | **868,35 zł**, brak brakujących produktów |

Drugi rzeczywisty koszyk: Orion 2 × 3,1 m i 4 × 3,1 m razem w eWinyl — materiały 1023 zł + jedna dostawa 199 zł = 1222 zł. Obie szerokości sprawdzono w natywnym koszyku. Osakryl potwierdzono również dla dwóch wiader: materiały 110,90 zł + dostawa 19,90 zł. Inne oddziały Sewery nie dziedziczą stanu Tarnowskich Gór. Wyceny mają ważność 10 minut i zakres kodu pocztowego; kosztu 199 zł nie zakodowano jako taryfy dla dowolnego koszyka/adresu.

Silnik nie generuje fikcyjnych wariantów paczek 1 m². Ceny całych odcinków są zaokrąglane raz, w całkowitych groszach i mm². Zmiana 55 → 55,99 zł/m² dla 6,2 m² oznacza +6,14 zł na odcinku; komunikat nie mnoży zmiany ceny m² przez samą liczbę kawałków. Cache rozróżnia szerokość, długość i listę docinek.

## Weryfikacja i granice

163 testy silnika cen PASS; 390 testów mobile PASS; 13 testów źródeł/adapterów i istniejącego parsera PASS; typecheck mobile/API PASS. Rzeczywisty HTTP potwierdził obie kompletne listy oraz niepełny status bez nowego obmiaru i bez wymaganych wymiarów odcinka. Ogólny runner testów API TSX ma wcześniejszy problem importów ESM/CJS modułów mobile (potwierdzony także w czystym wcześniejszym commicie) i starsze nieaktualne fixture ofert; nie jest raportowany jako zielony. Wdrożenie wymaga osobnych testów wspólnego backendu oraz publicznego interfejsu.

Nie obiecujemy minimum całego rynku, uniwersalnego dopasowania kleju ani kosztu nieznanej usługi spawania. Porównanie obejmuje sprawdzone oferty i potwierdzone warianty zakupu; duże plany zachowują oznaczenie ograniczonego porównania. Castorama/OBI nadal wymagają dostępu do ich wycen, gdy integracja nie może ich potwierdzić.

## Źródła pierwotne

- Produkt i formularz eWinyl: https://ewinyl.pl/produkt/orion-514-05-wykladzina-winylowy-3m-4m/
- Koszyk i odczyt wybranego sposobu płatności: https://ewinyl.pl/koszyk/ oraz https://ewinyl.pl/zamowienie/
- Producent Orion: https://www.lentexflooring.com/wykladziny-obiektowe/orion/
- Instrukcja Lentex: https://www.lentexflooring.com/wp-content/uploads/2016/04/Instrukcja-montazu-i-uzytkowania-wykladziny-2026-PL.pdf
- Osakryl, tożsamość i oddziały: https://sklep.sewera.pl/klej-do-wykladzin-osakryl-uniwersalny-4kg-tytan-p21233
- TDS Osakryl: https://tytan-cdn.tytan.com/uploads/sites/53/2025/11/NO20NAME20OSAKRYL20Uniwersalny20Klej20do20WykC582adzin_04-03-2025_TDS_pl.pdf
- TDS Soudal: https://www.soudal.pl/sites/default/files/soudal_api/document/F0039177_0001.pdf

Artefakty sesji w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/`: `roll-http-local-wave140.json`, `roll-payload-wave140.json`, `ewinyl-adapter-native-wave140.json`, `osakryl4-native-1-wave140.json`, `osakryl4-native-2-wave140.json`, `roll-observations-wave140.json`. Dowody opublikowanego wydania opisano poniżej.

## Wdrożenie i odbiór produkcji — 2026-10-31

Kod funkcji: `1b852de`, normalizacja fixture `02763b6`; końcowy kod webu `00ab5b2096b9a4dc78b25ebc2bbf36aa2be72872`. Backend PR [129](https://github.com/jakatora/przetargai/pull/129) został scalony jako `53ea92a338e7720f39e966d894ddbc6206ec5574`. Railway backend `1ea407e3-282d-4a4f-a8e0-999656894e70` **SUCCESS**, web `7e0dce8b-702b-427c-b80c-539158faec41` **SUCCESS**. Wydanie dostępne na https://asystent-remontu-web-production.up.railway.app . Nie publikowano natywnych aplikacji w sklepach.

Fresh snapshot przed wdrożeniem oraz odczyt po wdrożeniu: 149 plików, identyczne 147 pozostałych plików; zmieniono wyłącznie `src/services/remont-pricing.cjs` i ziarno 283 → 286. SHA256 modułu: `852fe9a4c0fe951eba570c5051b86baf631cb1ff20bea491505aa112ae9db04c`. Wspólny backend: **1061/1061 PASS, zero pominiętych**. Nowsze commity innego projektu zachowane.

Publiczny HTTP potwierdził ponownie całe koszyki **868,35 zł** i **1222,00 zł**, zakres kodu 00-001 oraz odrzucenie brakujących wymiarów. Odświeżenie cen zwróciło `updated`, obie oczekiwane oferty potwierdzone, zero błędów i niezmienione rzeczywiste kwoty. Regresja wcześniejszego koszyka click: 981,86 zł materiałów + 130 zł dwóch dostaw = **1111,86 zł**; przy jednym zamówieniu 1581,86 zł. Rabat/delta ceny produktu nie jest mylona z różnicą dostaw ani zmianą sklepu.

Rzeczywisty formularz w publicznej przeglądarce utworzył dwa osobne projekty. Sprawdzono polskie przecinki w wymiarach, ukrycie starych pól, zerowanie poprzedniego zużycia po zmianie Soudal → Osakryl, zakup jednego odcinka 2 × 5,4 m z podziałem 3,1 + 2,3 m, jedno wiadro kleju, 55,45 zł oszczędności na połączeniu wiader i poprawną dostawę. Zdjęcia obu nowych produktów załadowane (600/400 px), zero błędów strony i nieudanych żądań. Widok 1250 px i 390 px bez poziomego przepełnienia. Po przeładowaniu pozostają dwa projekty, kod i wybór koszyka. Osobny wcześniejszy profil z projektami click również zachował dane i poprawną wycenę.

Test przeglądarkowy ujawnił, że eWinyl odrzuca zdjęcie z obcym `Referer` (403 HTML, w przeglądarce `ERR_BLOCKED_BY_ORB`), mimo odpowiedzi 200 przy prostym pobraniu serwerowym. Poprawiono politykę webu na `Referrer-Policy: no-referrer`, bez proxy, kopiowania lub modyfikowania fotografii. Powtórzony rzeczywisty test publiczny potwierdził oba zdjęcia i dalsze działanie izolacji SQLite. Serwer web: 4/4 testy PASS. Wszystkie **63/63** publiczne zasoby mają zgodny SHA, `missingAssetCount: 0`; osiem tras 200, nieistniejące zasoby i pliki serwera 404. Skan paczki nie wykrył żadnej z 75 sprawdzanych długich wartości vaulta.

Końcowy pakiet: `work/remont-web-wave140-r2-release-20261031`, przenoszony jako zweryfikowane `web-build.tar.gz` (wymagane przez wykluczanie ścieżek `node_modules` w CLI Railway). Dowody: `roll-http-production-wave140.json`, `roll-refresh-production-wave140.json`, `web-production-http-wave140.json`, `web-roll-production-qa-wave140.json`, `web-roll-production-products-wave140.png`, `web-production-click-qa-wave140.json`, `mobile-clean-tests-wave140.log`, `shared-tests-wave140.log`. Publiczne 404 endpointu długoterminowej historii są oczekiwanym `verified_history_unavailable`; lokalne porównywanie kolejnych odświeżeń pozostaje dostępne.

Katalog po wdrożeniu: 204 referencje, 204 wpisy zdjęć, 286 źródeł/obserwacji; 251 aktywnych ofert / 171 produktów. 33 referencje nadal bez aktywnej oferty. Cel rozwoju pozostaje aktywny. Kolejne prace: pozostałe nieaktywne oferty i zdjęcia, potwierdzanie dostaw brakujących sieci oraz kopia/przenoszenie lokalnych projektów. Zapisów z localhost nadal nie przenosi się automatycznie na domenę publiczną. Obce WIP w `ean-overlay.ts`, `mappings.ts`, lockfile i katalogu `.atlas` pozostawiono bez zmian.
