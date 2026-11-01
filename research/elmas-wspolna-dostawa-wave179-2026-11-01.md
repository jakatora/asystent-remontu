# Taśma Norgips 75 mm i wspólny koszyk Elmas — 2026-11-01

**Status: kandydat przygotowany, publikacja wstrzymana.** Źródło aplikacji `802a2e45505781b493aa6e8113ce6a32ff15cdac` jest wypchnięte na `codex/remont-zakupy-20261024`. [PR 163 wspólnego backendu](https://github.com/jakatora/przetargai/pull/163) pozostaje szkicem, head `bea124c852f16ecc393414598f0b456efaaec4db`. Nie scalono PR ani nie wysłano nowego wdrożenia API/WWW.

## Produkt i zachowanie

Dodano osobną referencję `mat-gypsum-acoustic-norgips-75x30`, GTIN `5907651698011`, jedną rolkę 30 m o szerokości 75 mm i grubości 3 mm. [Strona Elmas](https://sklep-elmas.pl/p/tasma-akustyczna-norgips-3-mm-x-0075-m) potwierdza kod, Norgips, opis wymiarów, 32 zł brutto i zdjęcie. Rzeczywisty stan podczas odczytu: 46 rolek, waga natywnego wariantu 0,4 kg. [Karta producenta, wrzesień 2025](https://norgips.pl/media/repository/0/153/62d06729868d42beae6969cc0297c047/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf) niezależnie wiąże GTIN z szerokością 75 mm i długością 30 m; karton zbiorczy ma 12 rolek, a oferta sprzedaje pojedynczą rolkę.

Nazwa sklepu i pole importowane „Długość: 0.075” są mylące. Reader potwierdza właściwy opis produktu i producenta; nie bierze tego pola jako długości rolki. Tekst „75 mm” jest rozdzielony znacznikiem `<b>` wewnątrz liczby, dlatego odczyt usuwa formatowanie inline przed sprawdzeniem wymiarów. Opis pochodzi z jednego właściwego kontenera produktu. Cena, kod i marka nadal muszą zgadzać się z główną kartą, JSON-LD i natywnym API. Stary zredukowany fixture 50 mm zastąpiono pełnym rzeczywistym HTML, zachowując wcześniejsze zapisane odpowiedzi koszyka i dopisując datę odczytu HTML.

Nowa szerokość jest dostępna jako świadomie dodawany produkt we wspólnym koszyku. Wyszukiwanie EAN, zdjęcie, surowe metry, zaokrąglenie do pełnych rolek i kopia danych zachowują jej tożsamość. Nie zmienia istniejących obmiarów ani domyślnej taśmy 30 lub 50 mm.

Adapter Elmas obejmuje teraz dwa zamknięte, przejrzane SKU. Sprawdza każdą pozycję, aktualną cenę i stan, pełną sumę materiałów, odrębne wagi i metadane wariantów, a następnie jeden rzeczywisty kurier dla kompletnego koszyka. Dozwolone są dokładne publiczne karty/API i kalkulator `/api/public/order/form`; nadal zabronione są obce ścieżki, dane osobowe i `/api/public/order/new`. To krajowa dostawa **PL**, jawnie opisana jako niewyceniana osobno dla kodu.

## Rzeczywiste potwierdzone kwoty

| Zakup | Materiały | Kurier | Razem |
| --- | --- | --- | --- |
| 1 rolka 75 mm | 32,00 zł | 50,00 zł | 82,00 zł |
| Po jednej rolce 50 i 75 mm | 54,89 zł | 50,00 zł | 104,89 zł |
| 1 rolka 50 mm + 5 rolek 75 mm | 182,89 zł | 50,00 zł | 232,89 zł |
| 1 rolka 50 mm + 6 rolek 75 mm | 214,89 zł | 0,00 zł | 214,89 zł |
| 2 rolki 50 mm + 5 rolek 75 mm | 205,78 zł | 0,00 zł | 205,78 zł |

Dla potrzeby 30 m taśmy 50 mm i 150 m taśmy 75 mm jawnie wybierany dodatkowy materiał obniża pełną sumę o **27,11 zł**. Aplikacja wybiera dodatkową rolkę 50 mm; nie zastępuje nią wymaganych rolek 75 mm. Kopia danych nadal ma 30 m i 150 m. Kwoty pochodzą z konkretnych rzeczywistych prób, nie są wpisanymi stawkami ani gwarancją ceny przyszłych zakupów.

Osiem nowych rzeczywistych porównań API przygotowanego modułu i siedem wcześniejszych przypadków native przeszło. Pełny zachowany remont nadal dał 2712,10 → 2684,99 zł, w pierwszej odpowiedzi po około 36,9 s i przy 449 żądaniach do sklepów łącznie z odświeżaniem. Ta partia nie rozwiązała kosztu dużych porównań; to pojedynczy pomiar, nie p95.

## Weryfikacja i ograniczenie publikacji

- 535 mobile, 207 pricing, 108 API lib, 139 adapterów, 1064 wspólny backend PASS, bez fail/skip. Grupy częściowo się pokrywają. Typy mobile/API, build pricing i 66 legacy IDs PASS. Po walidacji mobile/adapterów zmieniły się tylko seed i fixture zegara w teście pricing.
- Test stanu magazynowego używa teraz jednego odczytu zegara dla `checkedAt` i `expiresAt`. Poprzednio dwa odczyty mogły przekroczyć dozwolone 600000 ms o 1 ms. Walidacja czasu i oczekiwania nie zostały rozluźnione; pełne 207 testów ponownie przeszło.
- 12/12 nowych lokalnych scenariuszy UI PASS: rzeczywiście załadowane zdjęcie, 31 m → dwie rolki, dwa SKU i jeden transport, wybór nadwyżki, klawiatura, 320/390 px, zmiana kodu, eksport/import/reload i usuwanie jednej szerokości. Brak pageerror/429 na poziomie API aplikacji.
- Regresja dotychczasowego UI wykonała 5/14 przypadków. Po zmianie kodu nie uzyskała oczekiwanej świeżej nadwyżki; próba zakończyła się błędem, nie PASS. Bezpośrednia diagnostyka wykazała **HTTP 429** kalkulatora sklepu, komunikat `too_many_attempts_account_blocked`, bez nagłówka `Retry-After` (2026-11-01 20:56:21 UTC). Nie ponawiano serii ani nie obchodzono ograniczenia inną tożsamością. Brak nadwyżki przy niepotwierdzonej dostawie jest bezpiecznym zachowaniem, lecz nie zastępuje brakującej pozytywnej weryfikacji.
- 63 zasoby WWW / 17 268 932 B sprawdzone SHA i względem 77 wartości vaulta, bez wycieku. Prywatny bundle relay zmienił się z katalogiem; pozostałe wspólne pliki hosta/konfiguracji są identyczne. Publiczne kontrole nowego wydania nie zostały wykonane.
- Backend ma 150 plików; zmieniają się moduł remontowy i seed, pozostałe 148 zachowano. Wszystkie 346 wcześniejszych obserwacji pozostały identyczne; dodana jedna daje 347. SHA modułu: `2e4bf8cd2631dfe1d1ccfa4009069234ead81cc90b76717896f906602bde4245`.

Audyt 2026-11-01 20:59:24 UTC porównał obie wersje na tej samej rzeczywistej pamięci cen pobranej przez SSH z produkcji, bez przedłużania dat i bez wstrzykiwania transportu: poprzednia wersja **239 referencji / 206 potwierdzonych / 306 ofert / 33 braki**, kandydat **240 / 207 / 307 / 33**. Zmienia się wyłącznie nowy produkt. Względem wcześniejszego audytu wave177 wygasła oferta PEX Tycner 16×2 w obu wersjach; nie jest to regresja kandydata. Surowe stare seedy i lokalna pamięć samych testowanych koszyków nie wystarczają do audytu całego katalogu. Początkowe próby takiego audytu prawidłowo odrzucono.

Artefakty: `G:/Projekty/asystent-remontu-work/wave179-20261101`, zwłaszcza `source.json`, `preparation.json`, `shared-source.json`, oba `*-native.json`, `local-mixed-qa.json`, `local-surplus-attempt-r1.json`, `merchant-rate-limit.json`, `local-catalog-audit.json` i `production-cache-provenance.json`. `pre-seed-*` i `pre-fixture-*` są zastąpionymi buildami, nie końcowym kandydatem.

Następny krok: ograniczyć powtarzane wyceny tego samego koszyka dla potwierdzonej krajowej dostawy PL w Elmas, bez przenoszenia ofert zależnych od kodu i bez przedłużania ważności; po ustąpieniu ograniczenia dokończyć dotychczasową regresję, ponownie sprawdzić aktualny stan, PR i dopiero opublikować API/WWW z pełną publiczną weryfikacją. Stały cel pozostaje aktywny.
