# Usuwanie danych lokalnych bez częściowego kasowania — 2026-10-31

Przycisk w Ustawieniach wcześniej wykonywał serię DELETE poza transakcją i używał nieistniejących nazw tabel. Rzeczywisty kod z commita `c2f9586`, uruchomiony wyłącznie na SQLite `:memory:` z istniejącymi migracjami, skasował historię i własne ceny, po czym zwrócił `no such table: checklist_items`. Projekt pozostał w bazie. Dowód: `work/old-reset-proof-wave143.json`. Nie wykonywano tej starej operacji na danych użytkownika.

## Poprawione działanie

Ekran mówi teraz „Usuń dane z tego urządzenia”. Zamiast menu Alert, które nie działało w RNWeb, używa dostępnego modalu z anulowaniem, przejściem do kopii remontów i wpisaniem słowa USUŃ. Zakres obejmuje wszystkie lokalne projekty remontu i budowy domu, zdjęcia, zakupy, lokalne dane wykonawców oraz ustawienia. Nie usuwa kont ani zamówień w innych usługach i nie kasuje pobranych wcześniej plików kopii. Kopia remontów z wave142 nie obejmuje budowy domu i wykonawców; informacja jest widoczna przed przejściem do niej.

Nowy `resetLocalData` korzysta z rzeczywistego schematu lokalnej bazy, sprawdza bezpieczne nazwy tabel, zachowuje `schema_versions` i usuwa dane z pozostałych tabel jednym batchem w transakcji. Obejmuje także tabele z migracji późniejszych niż pierwotny ekran Ustawień. Odroczone klucze obce są sprawdzane przy COMMIT. Nie edytowano migracji001–014 ani istniejących ID prac.

Odczyt kontrolny potwierdza puste tabele i zachowane metadane migracji. Utracona odpowiedź po COMMIT nie powoduje ponowienia DELETE. Dopiero po potwierdzeniu SQL czyszczone i sprawdzane są ustawienia AsyncStorage. Brak potwierdzenia ustawień ma osobny komunikat częściowego wyniku; nie jest sukcesem pełnego usunięcia. Ponowny odczyt SQL wykrywa dane zapisane w międzyczasie przez inną kartę. Interfejs prosi o zamknięcie innych kart przed usunięciem. Po potwierdzonym wyniku aplikacja przeładowuje się, aby usunąć także stare dane z pamięci komponentów.

Operacja dotyczy wyłącznie lokalnego SQLite i AsyncStorage. Nie wywołuje API kasowania kont, płatności, anulowania subskrypcji, zwrotów ani zamówień. Lokalne wpisy historii rozliczeń wykonawców są lokalnymi danymi aplikacji, a nie operacjami na zewnętrznym koncie płatniczym.

## Weryfikacja

Sześć nowych testów używa prawdziwego SQLite oraz wszystkich14 migracji. Każda istniejąca tabela ma dane przed resetem, a metadane migracji pozostają bez zmian. Sprawdzono późny błąd SQL z całkowitym rollbackiem, zachowanie preferencji przy takim błędzie, utracone odpowiedzi SQL i storage bez powtórzenia operacji, odmowę wyczyszczenia ustawień, nieczytelny odczyt kontrolny, nowe dane z innej karty oraz niebezpieczną nazwę tabeli. Pełny mobile **404/404 PASS**, zero skipów; typecheck mobile PASS. Odbiór rzeczywistego interfejsu i wdrożenia zostanie dopisany po wykonaniu.

Źródła techniczne: https://www.sqlite.org/lang_transaction.html , https://www.sqlite.org/pragma.html#pragma_defer_foreign_keys , https://docs.expo.dev/versions/v54.0.0/sdk/expo/ . Funkcja `reloadAppAsync` jest eksportowana przez zainstalowany SDK54; web korzysta z przejścia na początek aplikacji.

Cel rozwoju pozostaje aktywny. Trwają poszukiwania stabilnych źródeł dla brakujących produktów Norgips. Nie dodano oferty o stanie „na zamówienie” jako dostępnego magazynowo produktu ani stawki „dostawa od…” jako wyceny całego koszyka.
