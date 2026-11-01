# Mapegum WPS: dobór opakowań dla całego remontu — 2026-11-01

## Zmiana dla użytkownika

Projekt i wspólny koszyk pozwalają świadomie wybrać automatyczny dobór wiader Mapegum WPS 3/5/10/20 kg. Domyślnie zachowują wybraną pojemność. Zapasy pomniejszają surowe zapotrzebowanie przed doborem; kilka pomieszczeń może współdzielić zakupione opakowania. Wybór wspólnego koszyka nie nadpisuje decyzji w projektach. Można niezależnie włączyć automat gruntu Primer G Pro.

Rodzina `mapei-mapegum-wps-kg-v1` obejmuje dokładnie GTIN: 3 kg `8022452249266`, 5 kg `8022452242489`, 10 kg `8022452242496`, 20 kg `8022452242502`. Starsze GTIN 5/10 kg `8022452002113`/`8022452002120` nie są aliasami. Ich projekty nie zostały automatycznie przepisane. [Karta techniczna producenta](https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0) i [broszura systemów hydroizolacji](https://cdnmedia.mapei.com/docs/librariesprovider24/line-technical-documentation-documents/systemy-i-rozwiazania-mapei-360-hydroizolacji_www.pdf?sfvrsn=7bfb308b_11) potwierdzają rodzinę i cztery pojemności. Nie zmieniano zużycia, wzorów ani obmiarów.

Siedem źródeł cen tej rodziny jest automatycznie sprawdzanych także przy zwykłej wycenie: Rab-Dom 3/5/10/20 kg, Sewera 5/10 kg i WinBud 20 kg. Obowiązuje istniejący ograniczony cache. Każde wiadro ma własny produkt, GTIN, zdjęcie, cenę i link; identyfikator rodziny nie staje się produktem do kupienia. Ta partia nie dodaje produktów ani sklepu.

## Sprawdzone koszyki

Kwoty brutto zaobserwowane 2026-11-01; nie są stałymi stawek transportu.

| Zapotrzebowanie i wybór | Zakup | Razem z dostawą |
|---|---|---|
| 6 kg, zachowaj 5 kg | 2 × 5 kg, Rab-Dom | 236,30 zł |
| 6 kg, automat | 2 × 3 kg, Rab-Dom | 170,30 zł |
| 11 kg, zachowaj 10 kg | 2 × 10 kg, Rab-Dom | 420,80 zł |
| 11 kg, automat | 5 kg + 2 × 3 kg, Rab-Dom | 283,20 zł |
| 21 kg, automat | 20 kg WinBud + 3 kg Rab-Dom | 477,60 zł |
| 6 kg Mapegum i 6 l Primer, oba automaty | 2 × 3 kg oraz 5 + 1 l, Rab-Dom | 295,59 zł |
| 6 kg, automat tylko Sewery | 2 × 5 kg | 248,60 zł |

11/21 kg i dwie automatyczne rodziny mają `searchLimited=true`: sprawdzono wybrane pełne zestawy, inne podziały mogą być tańsze. Ostrzeżenie widoczne w UI i kopiowanym planie. Nie jest to dowód globalnego minimum.

Sewera potwierdza natywny koszyk dla konkretnego kodu (`retailer_basket_postcode`); UI sprawdzono osobno dla 30-001 i 00-001. Rab-Dom i WinBud podają krajową taryfę PL (`retailer_basket_national`), bez indywidualnej wyceny kodu. Plan zakupów zachowuje tę różnicę, datę i ważność wyceny, rzeczywiste ilości oraz linki. Nie składa zamówienia.

## Weryfikacja i ochrona danych

- **1843 PASS, 0 FAIL, 0 SKIP**: 111 adapter/API/relay, 482 mobile, 186 pricing, 1064 współdzielony backend. Czysty checkout, pricing build i typy mobile/API przechodzą. Zachowano 66 chronionych job IDs, rich/legacy oraz migracje 001–014. Brak zmian zależności i lockfile.
- 13 natywnych wycen przygotowanego runtime, siedem publicznych wycen API przed publikacją WWW. Aktualne ceny wszystkich siedmiu źródeł Mapegum, a dla dwóch rodzin jedenastu; puste listy błędów odświeżania. Dodatnie zapotrzebowanie 1e-8 kg wymaga opakowania; pełny zapas nie tworzy zakupu.
- **34 lokalne i 34 publiczne scenariusze UI**: wybór opakowań, dwie rodziny, dwa pokoje, niezależność projektów i koszyka, zapasy częściowe/pełne/minimalna reszta, błąd zapisu i odczytu, eksport/import do trzeciego własnego profilu, reload. Trzy scenariusze dotyczą produkcyjnego kalkulatora `bathroom-waterproofing`: rzeczywiste 6 kg dla 5 m², zachowanie 20 kg → automat 2 × 3 kg → przywrócenie 20 kg. Eksport potwierdza niezmienione obliczenia.
- Dwa rzeczywiste zdjęcia załadowane; PL, szerokość 390 px bez overflow, izolacja przeglądarki aktywna, zero błędów JS i HTTP429. Własne syntetyczne projekty i profile; publiczne odpowiedzi sklepów/API bez podmiany. Kontrolowane błędy dotyczą tylko własnego localStorage.
- Wspólny model/komponent/kolejka zapisu obsługuje Primer i Mapegum, zachowując stary interfejs i prefix Primera. Mapegum: `remont.mapegum-package-choice.v1:`. Błąd zapisu zachowuje poprzedni wybór; błąd odczytu wstrzymuje pełną wycenę. Kopia remontu czeka na oczekujące zapisy obu rodzin.

Pierwsze dwa uruchomienia testów współdzielonych wykazały brak sąsiednich katalogów mobile/firebase w nowym katalogu roboczym. Dodano junctions do istniejącego checkoutu, bez zmiany kodu produkcji. Autorytatywny pełny wynik to `shared-tests-r3.log`: 1064 PASS. Wcześniejsze błędne oczekiwania cen w nowych testach poprawiono według niezależnej enumeracji; nie osłabiono walidacji produkcyjnej.

## Publikacja i dowody

Kod aplikacji `f0830177c22cb63466c909dd2de50aaaf604f81b`, wypchnięty. [PR156](https://github.com/jakatora/przetargai/pull/156) MERGED, źródło `02c9a3aabef8a81b26d1dd15a45b5b3eb58c750d`, merge `05e6eca9555e89a61af3e1a00195932a265d2291`. Współdzielony backend ma zmieniony tylko wygenerowany moduł; routes/package/tests identyczne z aktualnym main.

API `4c594958-70c1-4eeb-a41b-0aac8f026df5` i WWW `6636179e-19fb-4494-bfc6-6b99f73958f1`: **SUCCESS**. [Publiczny koszyk](https://asystent-remontu-web-production.up.railway.app/renovation-basket), health wskazuje `f083017`. Świeży snapshot/preflight: 150 plików, zmieniony tylko `remont-pricing.cjs`, pozostałe 149 i 333 obserwacje zachowane. Po wdrożeniu wszystkie 150 identyczne z przygotowanym wydaniem. SHA modułu `c9548f499d99ebc83211c73cf186bcba93a53199e585ab4f2d0f9778e34ffe8f`.

WWW: 63 pliki, 17 210 073 bajty; publiczna weryfikacja wszystkich SHA256, dziewięciu tras, WASM i nagłówków izolacji. Prywatne pliki 404, niepodpisane wywołanie relay 401. Skan 76 wartości vaulta bez wycieków. Wszystkie siedem plików server/config WWW identycznych z wave165; SHA relay `e7fd129b0ddf9eec9efe32a9b0aea6070b25e5e86086f42804d0525208a1bfe8`.

Publiczny audyt: **232 referencje, 199 z aktualną ofertą, 295 aktywnych ofert**, cztery osobne SKU bez EAN, zero pominięć/fałszywych potwierdzeń. Audyt samego początkowego seed również ma zero błędów, lecz 186 dostępnych referencji; nie przedstawia aktualności publicznych odświeżeń. Nadal 33 starsze braki ceny. eTak/ABUD oraz pełne kodowe dostawy Castoramy/OBI bez nowego pozytywnego potwierdzenia. Brak testu fizycznego Androida/iOS, badań z klientami i włączonej afiliacji/płatności.

Wszystkie nowe duże pliki robocze zgodnie z instrukcją właściciela znajdują się w `G:/Projekty/asystent-remontu-work/wave166-20261101`: `native-proof.json`, `cloud-proof.json`, `{local,production}-qa.json`, `{local,production}-rich-qa.json`, `production-purchase-plan.txt`, `production-http.json`, `catalog-identity-production-audit-wave166.json`, snapshoty i logi. Istniejące repo D oraz czyste checkouty C pozostawiono w miejscu. Junctions `mobile`/`firebase` wskazują aktywny istniejący checkout; nie usuwać rekurencyjnie ich celów. Katalogi wydań i profile są initializerami.

Obcy WIP `ean-overlay.ts`, `mappings.ts`, `pnpm-lock.yaml`, `.atlas/`, `PROPOZYCJE-COCKPIT.md` nietknięty. Bez nowego serwera, klucza, płatnego AI, konta, harmonogramu, kontaktu lub zamówienia. Cel ciągłego rozwoju pozostaje ACTIVE; ta partia jest ukończonym postępem.
