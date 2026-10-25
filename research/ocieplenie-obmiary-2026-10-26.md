# Ocieplenie — rzeczywiste ilości, lista zakupów i partie — 2026-10-26

Katalog nadal ma **74/103 produktów z ofertami; pozostało 29**. Ta zmiana poprawia użycie istniejącego K20 w kalkulatorze i wspólnym koszyku. Nie dodaje produktów ani wyceny transportu Betterial. Produkcja: 100 aktywnych ofert, 32 sklepy, 17 integracji automatycznej dostawy. Pełny cel użytkownika pozostaje aktywny.

## Zachowanie kalkulatora

Praca `eps-insulation-bso` zachowuje identyfikatory, dotychczasowe jednostki i model legacy. Dla 30 m² przy jawnych domyślnych założeniach liczy 33 m² płyt, 165 kg K20, 115,5 kg K50 i 34,5 m² siatki. Dla 60 m² ilości się podwajają. Zapas płyt/klejów 10% i siatki 15% to edytowalne założenia do zakupów, osobne od zużycia producenta. Surowe zapotrzebowanie jest sumowane między pracami; opakowania zaokrągla dopiero backend.

Zużycie K20 do klejenia EPS: 4–5 kg/m². K50 do warstwy zbrojonej na EPS: 3–3,5 kg/m². Powiązany jest wyłącznie dokładny Atlas Stopter K-20 25 kg, EAN 5905400160253; K50 nie dostaje tego samego kodu.

Źródła producenta:

- https://www.atlas.com.pl/produkt/atlas-stopter-k-20/
- https://www.atlas.com.pl/wp-content/uploads/2025/11/poradnik_11_2025_200dpi_c_pop.pdf
- https://www.atlas.com.pl/wp-content/uploads/2026/10/atlas_cerplast_plik_karta-techniczna.pdf

Liczba łączników, litry wybranego gruntu, kilogramy wybranego tynku i długość listew wymagają osobnych danych. Puste pola pozostają „do ustalenia”; świadomie podane 0 pozostaje zerem. Nie przeliczamy kilogramów CERPLAST na litry, nie projektujemy mocowania, grubości izolacji ani zgodności mieszanego systemu. Karta CERPLAST podaje zużycie w kg i nie uzasadnia przypisania go do pozycji w litrach. Siedem pozostałych ogólnych materiałów tej pracy wciąż wymaga doboru konkretnych produktów/ofert.

Stare obliczenia JSON z ilością 1 i sumą 95,90 zł są przeliczane w widoku, bez destrukcyjnej migracji. Dla 30 m² i czterech pustych pól częściowy szacunek według lokalnych cen referencyjnych wynosi 2 406,75 zł. To nie jest cena detalicznego zamówienia. Materiały, Zakupy, Plan i tekst udostępnienia odróżniają szacunek częściowy od pełnej sumy. Cztery nieznane pozycje pozostają w żądaniu wyceny jako nierozpoznane wymagania; nie znikają jako pozycje o koszcie zero.

UI ma przejście z „Gdzie najtaniej” do obmiarów. Zapis aktualizuje obmiary główne i wynik kalkulatora. Posiadanie/kupienie materiału musi pokrywać aktualną ilość w tej samej jednostce. Dawne 1 kg albo 165 kg nie usuwa całego zapotrzebowania 330 kg. Własne wiersze i wartości pozostają w bazie.

Wybór „Zatrudnię fachowca” przechodzi do obmiarów i pozwala zapisać projekt; wskazówki dotyczące wykonawcy są dostępne w projekcie. Rzeczywisty kreator 2–9 przeszedł do końca: utworzono `proj_mvogmxhftnzrhzxj1`, „Test obmiarów — fachowiec, 30 m²”, z 17 pozycjami zakupów, czterema nieznanymi ilościami, właściwym K20 i częściowym szacunkiem 2 406,75 zł. Nowy projekt pozostaje poza wyborem trzech prac w koszyku. Bezpośrednie otwarcie edytora również wraca po zapisie do projektu, gdy nie ma historii nawigacji.

## Naprawiony błąd zachowania danych

Rzeczywisty test UI wykazał, że istniejące `INSERT OR REPLACE INTO projects` usuwało wiersz projektu i przez `ON DELETE CASCADE` kasowało jego zakupy oraz historię. `projects.repo.update` używa teraz `ON CONFLICT(id) DO UPDATE`, zachowując dane podrzędne i datę utworzenia. Nie zmieniono migracji ani działania jawnego usunięcia projektu.

Nowy test `node --test db/repositories/projects.repo.test.cjs` (katalog mobile) uruchamia prawdziwy kod repozytorium oraz migracje 001–004 na SQLite z włączonymi kluczami obcymi. Przed poprawką był czerwony: `shopping_items must survive project editing`. Po poprawce zachowuje dokładnie zakupy, ilości/ceny użytkownika, zdjęcia, checklistę, aktywności, nadpisane ceny i snapshoty; jawne usunięcie nadal kaskaduje. Commit naprawy: `9723cb9`.

W UI wygenerowano wyłącznie wcześniej pustą listę projektu testowego `proj_mvoewpq1eurced6nm`. Następnie oznaczono 165 kg K20 jako „Mam”, zapisano 60 m² i potwierdzono zachowane 17 pozycji (8 materiałów + 9 narzędzi), K20 330 kg oraz ponowne wymaganie potwierdzenia ilości. Przywrócono 30 m², cztery puste pola i brak testowych oznaczeń „Mam”/„Kupione”. Nie odświeżano list innych projektów. Pierwsza próba na starym zapisie usuwała wyłącznie dane tego własnego projektu testowego.

## Partia zakupowa — backend i produkcja

Serializer zachowuje `purchaseMultiple` w ofercie, opakowaniach pracy i opakowaniach wspólnego koszyka. UI wyjaśnia zakup w partiach po 42 op. Betterial nadal wymaga wyceny transportu i uzgodnienia miejsca/terminu odbioru. Dla 165 kg oraz 330 kg z dwóch prac trzeba kupić 42 worki po 25 kg, czyli 2 207,10 zł materiałów. Suma z dostawą pozostaje nieznana. Nie wysłano zamówienia ani zapytania do sklepu.

Backend PR23 https://github.com/jakatora/przetargai/pull/23 merged. Źródło `46d341896db94f065111196a4a1aaecfee32637e`, merge `62b6d1627ef1e6be6c47fb27618118cdc6932991`. Railway `fe217e12-2161-4f6d-96b8-0d45952a2b50`: SUCCESS; healthcheck 2026-10-25T23:20:58.946Z (2026-10-26 00:20:58 Europe/Warsaw).

Świeży snapshot wdrożenia de9261e2 miał SHA256 `34617d705b16945abf71808b394e61bf311181bbf55a7f98b4639b98b36d0220`. Różnica wydania to tylko 3 linie `src/services/remont-pricing.cjs`. Zachowano 102 zarejestrowane obserwacje, cały seed, reguły dostaw i pozostałe pliki współdzielonego backendu.

## Weryfikacja i dalsze ograniczenia

- 312 testów logiki aplikacji/API, 1 test rzeczywistego SQLite i 1 054 testy wspólnego backendu: PASS, bez pominięć. Typecheck mobile i API: PASS.
- Rzeczywisty lokalny HTTP i produkcyjny HTTPS: 165 kg K20, 8 wymagań, jedna rozpoznana pozycja, 7 brakujących; suma materiałów K20 220710 gr i partia 42 w trzech miejscach JSON. Dwie prace dają 330 kg przed doborem opakowań. Pełna suma pozostaje null.
- Test HTTP ładuje mapowania z commita HEAD, niezależnie od zachowanego obcego WIP w `mappings.ts`. K20 działa bez tamtego niezatwierdzonego wpisu.
- Wspólny koszyk UI po dołączeniu ocieplenia pokazuje 4 prace, K20 z partią 42, siedem braków i brak pełnej sumy. Po odznaczeniu testu zachowane 3 prace, jedna posiadana pozycja, kod 00-001 oraz 790,83 zł = 637,43 zł materiałów + 153,40 zł dostaw. Nie deklaruje globalnego minimum dla niepotwierdzonych kombinacji.
- Health wspólnego backendu 200, auth/me 401. Walidator 66 chronionych ID i mutacje negatywne: PASS.

Dowody poza repo: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/eps-flow-local-proof-20261026.json`, `eps-flow-production-proof-20261026.json`, `eps-calc-tests-20261026.log`, `eps-project-persistence-tests-20261026.log`, `eps-shared-tests-20261026.log`. Zrzuty w sąsiednim `outputs/`.

Pozostaje 29 produktów, automatyczna dostawa Castorama/OBI i lokalna dostępność, pełny dobór kompatybilnych materiałów, ręczne pozycje i częściowo posiadane ilości we wspólnym koszyku oraz inne kalkulatory. Frontend działa lokalnie w Expo; nie wykonano nowego wydania Android/iOS. Obcy WIP w ean-overlay.ts, mappings.ts, pnpm-lock.yaml, .atlas i PROPOZYCJE zachowany.
