# Najniższy potwierdzony koszt i zakupy w jednym sklepie — wave168 R2, 2026-11-01

Użytkownik może teraz porównać dwa sposoby zakupu pełnego zestawu z dostawą: najniższy potwierdzony koszt oraz wszystko w jednym sklepie. Widzi nazwy sklepów, liczbę zamówień i dokładną dopłatę za jeden sklep. Wybór zmienia produkty, opakowania, sumę, podsumowanie projektu i kopiowany plan zakupów. Nie zmienia obmiarów, zapasu ani wyniku kalkulatora.

## Potwierdzone przykłady

Obserwacje z 2026-11-01, ceny brutto przy płatności z góry. W przykładzie automatycznego doboru opakowań Mapegum WPS dla 21 kg zapotrzebowania:

| Wariant | Materiały | Dostawy | Razem |
| --- | ---: | ---: | ---: |
| Rab-Dom + WinBud, dwa zamówienia | 447,60 zł | 30,00 zł | **477,60 zł** |
| Rab-Dom, jedno zamówienie | 464,90 zł | 21,00 zł | **485,90 zł** |

Dopłata za jeden sklep wynosi **8,30 zł**. Plan dla dwóch sklepów obejmuje opakowanie 3 kg z Rab-Dom i 20 kg z WinBud. Plan jednego sklepu obejmuje 3 kg i 20 kg z Rab-Dom. To konkretne porównanie ma ograniczone przeszukiwanie, o czym informują interfejs i kopia planu; nie jest dowodem globalnego minimum. Dostawy Rab-Dom/WinBud opierają się na aktualnej taryfie krajowej PL, co jest jawnie opisane także po podaniu kodu. Osobne próby Sewery dotyczą rzeczywistej wyceny dla 30-001.

Gdy jeden sklep jest już najtańszy (potwierdzony przykład 6 kg za 170,30 zł), aplikacja nie dubluje identycznej propozycji. Gdy żaden sklep nie ma potwierdzonego pełnego zestawu (Primer G Pro 1 l + CE 40 biała 2 kg, dwa sklepy za 100,78 zł), pokazuje brak takiego wariantu bez wymyślonej ceny dostawy i bez aktywnego wyboru.

## Zasady wyliczania i wyboru

- Backend zachowuje `cheapestSingleStore` niezależnie od trzech pozostałych alternatyw. `best` nadal oznacza najniższy potwierdzony koszt. Pełne koszyki jednego sklepu są sprawdzane także wtedy, gdy ich same materiały przekraczają koszt tańszego wariantu wielosklepowego. Zachowano limit 80 wycen i dotychczasowy deadline.
- Wariant jednego sklepu wymaga pełnego koszyka i potwierdzonej dostawy. Niepełna dostępność, błędna/nieznana dostawa lub przekroczona ważność nie stają się zerowym kosztem ani zwycięzcą. Klient sprawdza także tożsamość koszyka, źródło, kod/podstawę dostawy oraz zgodność sum w groszach, rabatów i opakowań. Ręcznie wpisana stawka nie jest przedstawiana jako automatyczne potwierdzenie sklepu.
- Wybór dotyczy wyłącznie bieżącej odpowiedzi. Zmiana kodu, produktów lub odświeżenie porównania przywraca najniższy potwierdzony koszt. Samo przełączenie wariantu nie uruchamia kolejnej wyceny. Wcześniej skopiowany tekst znika po zmianie wyboru.
- Podsumowanie projektu pokazuje wybraną kwotę i sklep. Nieaktualny cytat dostawy, także z wewnętrznego zamówienia wariantu jednosklepowego, wymaga odświeżenia. Wybór nie jest trwałą preferencją ani częścią kopii remontu. Dotychczasowe wybory rodzin opakowań i dane projektu zachowano.
- Karty układają się obok siebie na szerokim ekranie i pionowo na telefonie. Kontrola R1 wykazała, że `Pressable` z rolą radio w RN Web nie reagował na spację. R2 używa rzeczywistych kontrolowanych pól HTML radio na WWW oraz komponentu natywnego w RN. Spacja, strzałka w lewo, widoczny fokus i zmiana wybranej sumy zostały sprawdzone w przeglądarce.

## Weryfikacja

- **1870 odrębnych testów PASS, 0 FAIL, 0 SKIP:** 506 aplikacji, 189 pricingu, 111 adapterów/API/relay i 1064 współdzielonego backendu. Nowe przypadki obejmują walidację opcji, zachowanie wariantu jednego sklepu poza top 3 i pominięcie niepotwierdzonych dostaw. Testy aplikacji i pricingu, typy mobile/API oraz build pricingu przeszły także w czystym checkoutcie. Backend i biblioteka pricingu mają identyczne bajty między commitami R1 i R2.
- **77 scenariuszy lokalnych i 77 publicznych:** 31 regresji koszyka, trzy rzeczywistego kalkulatora hydroizolacji, 28 przywracania ustawień i 15 nowego wyboru sposobu zakupów. Nowe próby obejmują klawiaturę bez dodatkowego żądania pricingu, oba dokładne plany kopiowania, zmianę kodu, odświeżenie, brak jednego sklepu oraz sumę i sklep na ekranie projektu. Eksport potwierdza zachowanie obmiarów i obliczeń rzeczywistego kalkulatora przy zapotrzebowaniu 21 kg.
- Siedem natywnych prób integracyjnych i siedem prób publicznego API: 6/11/21/31 kg Mapegum, dwie automatyczne rodziny, Sewera dla 30-001 oraz brak jednego sklepu. Bez podmiany odpowiedzi sklepów i bez składania zamówień.
- Własne profile i syntetyczne projekty; użytkownikowy localhost:8082 i jego dane pozostały nietknięte. Kontrolowane błędy istniejących prób przywracania dotyczą wyłącznie własnego localStorage. Zero błędów JS i HTTP429, język PL, izolacja przeglądarki, 390 px bez poziomego overflow. Zdjęcia produktów rzeczywiście załadowane. Publiczne zrzuty nowego porównania sprawdzono wizualnie na telefonie i komputerze.
- Publiczna kontrola SHA256 wszystkich **63 plików**, dziewięciu tras i WASM przeszła. Nagłówki COOP `same-origin`, COEP `credentialless`, referrer `no-referrer`; prywatne pliki 404, niepodpisany relay 401. Skan 76 wartości vaulta bez wycieku. 17 232 959 bajtów WWW; wszystkie siedem plików serwera/config zachowano. SHA relay: `e7fd129b0ddf9eec9efe32a9b0aea6070b25e5e86086f42804d0525208a1bfe8`.

## Źródła i publikacja

Kod funkcji: `b6e3380e74a49c0bd17732c312000a7d0312a559`. Poprawka klawiatury, układu i nazwy wybranego sklepu: `f08d4d25612940b8bd00448ab075459873a972a0`. Oba wypchnięte. WWW health wskazuje R2. [Publiczny koszyk remontu](https://asystent-remontu-web-production.up.railway.app/renovation-basket).

Współdzielony backend: źródło `026d281bda3a77b1c1eee3409bfd8f5a06ebaaed`, tylko 10 dodanych linii wygenerowanego `backend/src/services/remont-pricing.cjs`. [PR157](https://github.com/jakatora/przetargai/pull/157) scalony 2026-11-01 o 14:39:15 UTC, merge `370f07f1de4bf4f9f083f305f39ee2c74fa3c620`. Przed publikacją ponownie porównano 150 plików z działającym API. Po publikacji wszystkie 150 odpowiada przygotowanej paczce; zachowano pozostałe 149 plików oraz 333 obserwacje startowe. Package JSON/lock z nowszego main różnią się od wcześniejszej migawki bajtami, ale ich sparsowane dane są identyczne; nie dodano zależności.

- API: **`01e8f20a-c44e-4c43-b378-d0e61c64f169` SUCCESS**. Runtime SHA256 `279d3075708c9cd4746024064ee5902fb12847ffc55e96c6834ec941fc26afae`.
- WWW: **`447c7333-9ffe-4291-90e9-8769d7ecc46e` SUCCESS**.

Dowody API i testów współdzielonych: `G:/Projekty/asystent-remontu-work/wave168-20261101`. Dowody finalnego WWW: `G:/Projekty/asystent-remontu-work/wave168-r2-20261101`, pliki `{local,production}-{qa,rich-qa,recovery-qa,options-qa}.json`, `production-options-{lowest,one-store}-plan.txt`, `production-options-project-backup-r1.json`, `production-options-{desktop,mobile}.png`, `production-http.json`, `catalog-identity-production-audit-wave168.json`, `web-integrity.json` i logi. Dowód błędu klawiatury R1 zachowano w katalogu API jako `local-options-attempt-r1.json` oraz zrzut/tekst błędu.

## Pozostałe ograniczenia

Publiczny audyt nadal obejmuje 232 referencje: **199 z aktualną ofertą i 295 aktywnych ofert**, cztery odrębne SKU bez EAN, zero pominięć i fałszywych potwierdzeń. W tej partii nie dodano produktu ani sklepu. Pozostają 33 wcześniejsze braki ceny. Pełne dostawy Castoramy/OBI zależne od kodu oraz eTak/ABUD nadal nie mają nowego pozytywnego potwierdzenia. Ograniczenia przeszukiwania i rozróżnienie taryfy krajowej od wyceny kodowej pozostają widoczne.

Nie zmieniano receptur, 66 identyfikatorów prac, obmiarów, migracji 001–014, zależności ani lockfile. Brak próby na fizycznym Androidzie/iOS i badań z klientami. Obcy WIP `ean-overlay.ts`, `mappings.ts`, `pnpm-lock.yaml`, `.atlas/`, `PROPOZYCJE-COCKPIT.md` nietknięty. Bez nowego serwera, klucza, płatnego AI, konta, billing, harmonogramu i zamówienia. Cel ciągłego rozwoju pozostaje ACTIVE; ta partia jest zweryfikowanym postępem.
