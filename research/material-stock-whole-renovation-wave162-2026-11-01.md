# Posiadana część materiału i koszt dokupienia — 2026-11-01

W projekcie można podać użyteczną ilość materiału już przeznaczoną do tej pracy. Porównanie odlicza ją od zapotrzebowania, dobiera opakowania dla brakującej części i sprawdza dostawy rzeczywistego koszyka. Wcześniejsze oznaczenia „Mam” i „Kupione” obejmowały całą pozycję i pozostają dostępne.

Nowa sekcja „Mam część materiałów” zapisuje ilość w jednostce produktu, np. jeden worek30 kg jako30 kg. Zapas jest związany z projektem, pozycją, dokładnym EAN i jednostką. Zmiana produktu nie przenosi go na inny model. Powrót do poprzedniego produktu przywraca jego przydział. Pełne oznaczenie pozycji jako posiadanej ma pierwszeństwo, więc ilości nie odejmuje się drugi raz.

## Wspólny koszyk i zapis

Odliczenie następuje po wyborze produktu i sprawdzeniu pełnych oznaczeń zakupów, przed łączeniem pomieszczeń i doborem opakowań. Dane obmiaru, zapisany kalkulator i wiersze zakupów nie są przepisywane. Projekt i wspólny koszyk używają tego samego przeliczenia. Warianty zestawów płytek i środków do frontów zachowują przydział wyłącznie przy zgodnej tożsamości.

Przydział dotyczy jednej pracy. Nadwyżka nie przepływa automatycznie między projektami; użytkownik rozdziela zapas i wpisuje każdą ilość raz. Obsługiwane są kg, l, ml i całe sztuki z dokładnym EAN13. Nominalna powierzchnia lub długość pozostałości nie zastępuje planu cięcia rolek, paneli, płytek lub profili. Takie ilości nie są automatycznie odejmowane.

Zapis przechodzi do kalkulacji po potwierdzeniu trwałego zapisu. Nawigacja do wspólnego koszyka i eksport kopii czekają na ten sam zapis. Błąd zapisu zachowuje poprzedni zapas i odpowiadającą mu wycenę, a pole pozwala ponowić próbę. Błędny odczyt lub uszkodzony rekord blokuje porównanie zamiast udawać pusty zapas. Przycisk ponawia odczyt; w teście trwałe uszkodzenie naprawiono kontrolnie w danych własnego profilu. Nie dodano funkcji automatycznego usuwania uszkodzonego zapisu.

Całkowite pokrycie materiałów daje komunikat o braku zakupów. Nadal można zmienić lub wyczyścić przydział. Nie powstaje fikcyjny koszyk ani dostawa za0zł. Narzędzia i robocizna pozostają osobne. Nowe preferencje remont.material-stock.v1:<projectId> są walidowane i przenoszone w kopii projektu; nie dodano migracji SQLite. Archiwum ze stanem uszkodzonym, obcym projektem lub wspólnym nieprzydzielonym magazynem jest odrzucane bez cichej utraty ilości.

## Rzeczywiste kwoty

Ściana4m²,10mm MP75L,10% zapasu:35,2kg. Kodeks testów używa30-001, a metody Shoper zwracają jawne taryfy krajowePL, bez osobnej wyceny adresu.

| Zakupy | Brakujące kg | Materiały | Dostawa | Razem |
|---|---:|---:|---:|---:|
| Projekt bez posiadanego tynku,2 worki | 35,2 | 77,98 zł | 75,00 zł | 152,98 zł |
| Ten projekt z posiadanym workiem30kg,1 worek do kupienia | 5,2 | 38,99 zł | 55,00 zł | 93,99 zł |
| Dwa takie pokoje,30kg przydzielone tylko pierwszemu,2 worki | 40,4 | 77,98 zł | 75,00 zł | 152,98 zł |
| Zmiana na Goldband30kg, bez przenoszenia starego MP75L,2 worki | 38,13333333 | 94,00 zł | 42,00 zł | 136,00 zł |

Kwoty pochodzą z czterech nowych rzeczywistych wycen publicznego API i natywnych koszyków z2026-11-01. Nie odejmowano wartości posiadanego worka od starego rachunku. Sklep wycenił nowe opakowania i inny transport. Dowód work/material-stock-native-proof-wave162.json.

## Weryfikacja i publikacja

461 testów aplikacji i171 porównywania cen: PASS,0 błędów i pominięć także na czystym zatwierdzonym źródle.12 nowych testów: odliczanie, tożsamość, izolacja pomieszczeń, brak podwójnego odjęcia, jednostki/cięcie, uszkodzone dane, kolejka zapisu, ponowienie oraz rzeczywiste kopie na SQLite i warianty przygotowania frontów. Poprawne typy aplikacji i66 identyfikatorów prac. Nie zmieniono backendu, więc jego1064 testów z wave159 nie powtarzano.

Lokalny i publiczny Playwright, po13 scenariuszy: kreator dwóch projektów, częściowy i pełny zapas, wspólny koszyk, eksport/import do drugiego własnego profilu, zmiana produktu i powrót, wyczyszczenie ilości, odmowa zapisu i ponowienie, uszkodzenie odczytu i wznowienie po przywróceniu poprawnych danych. Błędy wymuszono wyłącznie w pamięci własnej przeglądarki. Publiczne odpowiedzi cenowe nie były podmieniane.390px bez przepełnienia, językPL, izolacja przeglądarki,0 błędów JS i429. Dowody work/material-stock-{local,production}-qa-wave162.json; oba końcowe r1 przeszły. Pierwsze błędne założenia testów jednostkowych dotyczyły dokładnej równości float i wybrania rodziny farby bezEAN; poprawiono testy i typ fixture, zachowując ochronę tożsamości.

Źródło306baf9b75ce9e2eda6b5373c0d4ac745b8309d3. WWW7271c5ac-aa9b-488a-a4ca-93ec268f067d SUCCESS: [aplikacja](https://asystent-remontu-web-production.up.railway.app). Czysty eksport63 plików/17186454B; publiczne63SHA,9 tras,WASM,nagłówki izolacji, prywatne pliki404 i niepodpisany relay401 poprawne. Brak76 kluczy vaulta w zasobach. Siedem plików serwera/prywatnego adaptera/konfiguracji identycznych z wave161.

API nadal1d840f52-35a4-4e19-8545-98e6d13d2884, runtime500690270c9ed04d3211e0e0068582f5bc609b3e27960da1990ed2b8504fede7. Nie dodano źródeł cen ani produktów. Health podczas kontroli pokazywał194 produkty/287 ofert; w wave161 było290 ofert. Ten licznik nie potwierdza dostawy wszystkich pozycji. eTak/ABUD nadal bez nowego pozytywnego potwierdzenia stabilności. Nie wykonano testu urządzenia natywnego. Usunięto też mylącą instrukcję kopiowania z ogólnego błędu wyceny, gdy plan może nie istnieć. Pełny cel rozwoju pozostaje aktywny.
