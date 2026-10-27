# Plan zakupów przy brakujących dostawach — 2026-10-27

Gdy wszystkie materiały miały już ceny, ale jeden wymagany sklep nie udostępniał automatycznej dostawy, porównanie kończyło się przed sprawdzeniem pozostałych sklepów. Użytkownik widział pojedyncze produkty, lecz nie dostawał podziału zakupów na koszyki ani sumy w każdym sklepie.

Teraz serwer zachowuje pełny plan materiałów, sumuje potrzeby wszystkich pomieszczeń przed doborem opakowań i sprawdza transport pozostałych sklepów. Interfejs pokazuje sumę materiałów, potwierdzone opłaty oraz nazwy sklepów oczekujących na wycenę. Przy każdym sklepie można rozwinąć zdjęcia, liczbę opakowań, ceny i linki produktów. Brakujące dostawy pozostają `null`; cały zestaw nadal nie dostaje kwoty do zapłaty ani rekomendacji najtańszej dostawy.

## Rzeczywisty koszyk sufitowy — lokalny odczyt sklepów

Jawnie wybrany wcześniejszy wariant sufitu 10 m²: profil IRBUD CD60 3 m / 0,6 mm, 26 kotew R-GS z projektu przed 10% rezerwą oraz właściwe pozostałe założenia g-k. Wszystkie 13 produktów ma oferty, rozdzielone między 7 sklepów.

| Sklep | Materiały | Potwierdzona dostawa | Razem w sklepie |
|---|---:|---:|---:|
| ABUD | 69,50 zł | 13,00 zł | 82,50 zł |
| Buduj24 | 24,89 zł | 15,00 zł | 39,89 zł |
| Elektro-Hurt | 49,54 zł | 21,00 zł | 70,54 zł |
| HIPPER | 111,62 zł | 18,90 zł | 130,52 zł |
| IRBUD | 148,85 zł | 52,00 zł | 200,85 zł |
| Leroy Merlin | 309,59 zł | do potwierdzenia | brak pełnej kwoty |
| Marbet24 | 96,28 zł | do potwierdzenia | brak pełnej kwoty |

Materiały: **810,27 zł**. Potwierdzone dostawy z pięciu sklepów: **119,90 zł**. Te kwoty nie są pełną ceną zestawu z dostawą i nie dowodzą, że podział jest najtańszy po doliczeniu brakujących opłat. `best`, `deliveryGrosze` i `totalGrosze` pełnego planu pozostają `null`. Domat nadal nie udostępnia potwierdzonego transportu jako alternatywna oferta płyt, ale ten konkretny podział kupuje płyty w Leroy Merlin, więc Domat nie jest wymaganą dostawą w tabeli.

Dowody aktualnych odczytów i dokładnych wejść: `work/catalog-wave58-local-proof.json` oraz po wdrożeniu `work/catalog-wave58-production-proof.json` w katalogu roboczym sesji. Kwoty dotyczą konkretnego koszyka i odczytu, nie dowolnego remontu lub przyszłych cen.

### Produkcja: cztery potwierdzone dostawy, ABUD nie odpowiada

Na wdrożonym serwerze materiały nadal kosztują **810,27 zł**, ale potwierdzono **106,90 zł** dostaw z czterech sklepów. Oprócz Leroy Merlin i Marbet24 do potwierdzenia pozostaje ABUD. Niezależny odczyt samego koszyka ABUD także zwrócił brak wyceny. Osobny proces SSH na działającym Railway potwierdził `UND_ERR_CONNECT_TIMEOUT` po około 10,5 s dla pierwotnej karty ABUD; DNS zwrócił jeden adres IPv4. To problem połączenia z produkcji, a nie dowód dostawy za 13 zł w tej lokalizacji serwera. Nie podmieniono IP, nie osłabiono TLS i nie wpisano lokalnej stawki do produkcyjnego koszyka.

Nowy plan pozostaje widoczny mimo tego błędu: 13 produktów, 7 sklepów, 4 potwierdzone dostawy, 3 do potwierdzenia; pełna suma i `best` nadal `null`. Rzeczywisty sam koszyk profili IRBUD nadal potwierdza 148,85 + 52 = 200,85 zł dla kodu QA 00-001. Niekompletny obmiar kotew i wybór tylko Marbet24 nadal nie pokazują fikcyjnego pełnego planu.

Pierwotny probe produkcyjny oczekiwał takiego samego pokrycia dostaw jak lokalnie i **nie przeszedł** z powodu ABUD. Ten dowód zachowano jako `work/catalog-wave58-production-initial-proof.json`. Odrębna walidacja rzeczywistego stanu (`catalog-wave58-production-validation-proof.json`) potwierdza poprawną prezentację niepełnej dostawy, nie sukces wszystkich integracji. Diagnoza: `catalog-wave58-abud-production-proof.json` i `catalog-wave58-abud-network-proof.json`. Kolejna praca powinna rozwiązać połączenie lub dodać potwierdzoną ofertę tych samych produktów w innym sklepie.

## Marbet24 i płyty IRBUD

Świeży anonimowy koszyk [Marbet24 Start & Finish 20 kg](https://marbet24.pl/gladzie/1288-norgips-gotowa-dwufunkcyjna-masa-szpachlowa-start-finish-20-kg-5907651699056.html) potwierdził 96,28 zł materiału. Pokazał również 23,81 zł orientacyjnej wysyłki. Odczyt [etapu zamówienia](https://marbet24.pl/zamowienie) nie potwierdził jednak przewoźnika ani kodu: wymaga imienia, nazwiska, e-maila i zgód klienta przed kolejnymi etapami. Nie przesłano tych pól. Powód w API to teraz `customer_details_required`, a aplikacja wyjaśnia, dlaczego sam kod nie wystarcza. [Strona transportu sklepu](https://marbet24.pl/content/11-transport-i-wysylka) nie zastępuje potwierdzenia koszyka. Zero wcześniejszej sesji ani obecne 23,81 zł nie stały się automatyczną wyceną dostawy.

Sprawdzono też alternatywny koszyk płyt i profili w IRBUD: 4 płyty GKB, produkt sklepu 7429, oraz 13 profili 10911. Po przekazaniu kodu QA 00-001 dostępne były odbiór osobisty i „Transport kalkulowany” za techniczne 0 zł, z informacją o indywidualnej wycenie. To nie jest bezpłatna dostawa. Tego wariantu płyt nie dodano jako rozwiązania brakującej automatycznej dostawy i nie przypisano mu nieopublikowanego EAN. Dowody: `work/catalog-wave58-research/marbet-proof.json`, `marbet-order-readonly.html`, `irbud-board-cart-records.json`. Bez danych klienta, checkout POST, akceptowania warunków, zamówień ani płatności.

## Reguły i testy

- Jeden pełny plan materiałów wykorzystuje istniejący optymalizator opakowań: obowiązują minimalny zakup, wielokrotności, limity stanu i limity wielkości porównania. Nie dokupuje się materiałów dla rabatów.
- Dostawy korzystają ze wspólnego budżetu 80 wycen i dotychczasowego mechanizmu ograniczania oraz ponownego planowania według faktycznego stanu. Sklepów wymagających danych klienta nie odpytuje się przez formularz kontaktowy.
- Zmiana ceny, brak produktu lub ilości oraz zmiana reguł zakupu odrzucają nieaktualny plan. Niepewna dostawa nie jest zerowana. Niekompletna lista produktów nie jest prezentowana jako pełny plan.
- Interfejs ukrywa plan przy zmianie kodu/trybu, po wygaśnięciu cytowanej dostawy lub przy niezgodności sum i zakresu produktów. Potwierdzone opłaty w planie mają ten sam mechanizm odświeżania po wygaśnięciu co pełny zwycięzca.
- 633 testy core/calculator/pricing/API i 1054 testy wspólnego backendu: PASS, 0 skip. Typecheck mobile/API: PASS. Pierwsze wywołanie shared tests bez wymaganego `--env-file=.env.test` nie miało konfiguracji testowej; uruchomiono cały zestaw poprawnym skryptem `npm test -- --test-concurrency=1`, bez pomijania testów.

Nie zmieniono identyfikatorów prac i obmiarów, migracji 001–014, liczby produktów ani dat potwierdzeń ofert. Katalog pozostaje na poprzednio potwierdzonym poziomie 151 produktów/zdjęć, 127 z aktywną ofertą i 24 braków. W bazowych 65 obmiarach nadal 156 niewycenionych wierszy, które mogą powtarzać produkty. Pełny zakres katalogu, dostaw, akcesoriów winylu i lokalnej dostępności/cen pozostaje do wykonania.

## Wydanie

PR [59](https://github.com/jakatora/przetargai/pull/59), head `0d7ce7e8cea30d976b0fb7211d10d7a33de46c0e`, merge `40d5fc012af00b83e9f542b34bb40d42c9b906d9`. GitHub nie ma workflow/statusów CI dla tego commitu; testy lokalne są odrębnym dowodem. Świeży snapshot produkcji: 188 obserwacji, 148 plików, SHA-256 `a9280964a4cd7d936e3d0f5972becf6fa93f9587ad88cb8ae5ea126b269523ca`. Zmieniono tylko bundle cenowy; 147 innych plików i wszystkie 188 obserwacji zachowano. Wdrożenie Railway `c252c42c-7762-497f-9f9b-b38c7dadf4a8`: **SUCCESS**, 2026-10-27T11:31:38.803Z. Odczyt z produkcji potwierdził zgodność SHA wszystkich 148 plików z przygotowanym wydaniem (`catalog-wave58-deployed-files-proof.json`).

## Odbiór aplikacji

Na dotychczasowym własnym projekcie QA `proj_mvqj35dlrykdtbczn` widok z produkcyjnego API pokazał 810,27 zł materiałów i 106,90 zł potwierdzonych dostaw (4 z 7). Rozwinięcie ABUD pokazało zdjęcia oraz po jednym opakowaniu 1000 wkrętów i 200 kołków. Marbet24 pokazuje zdjęcie wiadra 20 kg, 96,28 zł materiału oraz wyjaśnienie potrzeby danych klienta przed wyborem dostawy. Informacje o pięciu ręcznie potwierdzonych ofertach Leroy Merlin mają skrót i najwcześniejszą datę wygaśnięcia; szczegóły pozostają przy rozwiniętych produktach.

Zmiana pola kodu na niepełne `80-00` natychmiast ukryła poprzedni plan. Przywrócenie `00-001` pokazało właściwy plan ponownie. Dowód: `work/catalog58-ui-postcode-proof.json` (3 potwierdzone warunki). Odbiór nie tworzył nowych projektów, nie zmieniał innych projektów ani wspólnego koszyka. Serwer Expo 8082 nie był restartowany. Zrzuty: `outputs/catalog58-plan-zakupow-20261027.png`, `catalog58-abud-materialy-20261027.png`, `catalog58-marbet-materialy-20261027.png` w katalogu sesji. Legacy validator: 66 prac oraz trzy celowe negatywne mutacje PASS (`catalog-wave58-legacy-mutation-proof.json`).
