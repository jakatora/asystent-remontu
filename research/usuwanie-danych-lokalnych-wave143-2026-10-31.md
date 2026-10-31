# Usuwanie danych lokalnych bez częściowego kasowania — 2026-10-31

Przycisk w Ustawieniach wcześniej wykonywał serię DELETE poza transakcją i używał nieistniejących nazw tabel. Rzeczywisty kod z commita `c2f9586`, uruchomiony wyłącznie na SQLite `:memory:` z istniejącymi migracjami, skasował historię i własne ceny, po czym zwrócił `no such table: checklist_items`. Projekt pozostał w bazie. Dowód: `work/old-reset-proof-wave143.json`. Nie wykonywano tej starej operacji na danych użytkownika.

## Poprawione działanie

Ekran mówi teraz „Usuń dane z tego urządzenia”. Zamiast menu Alert, które nie działało w RNWeb, używa dostępnego modalu z anulowaniem, przejściem do kopii remontów i wpisaniem słowa USUŃ. Zakres obejmuje wszystkie lokalne projekty remontu i budowy domu, zdjęcia, zakupy, lokalne dane wykonawców oraz ustawienia. Nie usuwa kont ani zamówień w innych usługach i nie kasuje pobranych wcześniej plików kopii. Kopia remontów z wave142 nie obejmuje budowy domu i wykonawców; informacja jest widoczna przed przejściem do niej.

Nowy `resetLocalData` korzysta z rzeczywistego schematu lokalnej bazy, sprawdza bezpieczne nazwy tabel, zachowuje `schema_versions` i usuwa dane z pozostałych tabel jednym batchem w transakcji. Obejmuje także tabele z migracji późniejszych niż pierwotny ekran Ustawień. Odroczone klucze obce są sprawdzane przy COMMIT. Nie edytowano migracji001–014 ani istniejących ID prac.

Odczyt kontrolny potwierdza puste tabele i zachowane metadane migracji. Utracona odpowiedź po COMMIT nie powoduje ponowienia DELETE. Dopiero po potwierdzeniu SQL czyszczone i sprawdzane są ustawienia AsyncStorage. Brak potwierdzenia ustawień ma osobny komunikat częściowego wyniku; nie jest sukcesem pełnego usunięcia. Ponowny odczyt SQL wykrywa dane zapisane w międzyczasie przez inną kartę. Interfejs prosi o zamknięcie innych kart przed usunięciem. Po potwierdzonym wyniku aplikacja przeładowuje się, aby usunąć także stare dane z pamięci komponentów.

Operacja dotyczy wyłącznie lokalnego SQLite i AsyncStorage. Nie wywołuje API kasowania kont, płatności, anulowania subskrypcji, zwrotów ani zamówień. Lokalne wpisy historii rozliczeń wykonawców są lokalnymi danymi aplikacji, a nie operacjami na zewnętrznym koncie płatniczym.

## Weryfikacja

Sześć nowych testów używa prawdziwego SQLite oraz wszystkich14 migracji. Każda istniejąca tabela ma dane przed resetem, a metadane migracji pozostają bez zmian. Sprawdzono późny błąd SQL z całkowitym rollbackiem, zachowanie preferencji przy takim błędzie, utracone odpowiedzi SQL i storage bez powtórzenia operacji, odmowę wyczyszczenia ustawień, nieczytelny odczyt kontrolny, nowe dane z innej karty oraz niebezpieczną nazwę tabeli. Pełny mobile **404/404 PASS**, zero skipów, także w czystym checkout; typecheck mobile clean PASS, 4 testy hosta PASS, 66 wpisów rejestru i stare ID zachowane.

## Odbiór i wdrożenie

Kod aplikacji `8589a1128b52a73ca9948e738ba59fb7d553585e` wypchnięty na gałąź `codex/remont-zakupy-20261024`. Railway web `b768c89d-15dd-4c58-98b1-c94644fef099` **SUCCESS**, 2026-10-31T10:02:25Z; publiczne źródło wydania odpowiada temu commitowi. Adres: https://asystent-remontu-web-production.up.railway.app . Wspólnego backendu nie wdrażano.

Playwright + Edge sprawdził pełen interfejs na lokalnym wydaniu i na produkcji. Każdy przebieg tworzy nowy, pusty profil QA, importuje wyłącznie dwa wcześniejsze syntetyczne projekty SOUDAL i dodaje testowe wiersze do pozostałych tabel. Przed usunięciem **wszystkie46 tabel danych** zawierały wiersze; metadane migracji stanowiły osobną tabelę z14 wpisami. Dane użytkownika z jego przeglądarki nie były odczytywane ani kasowane.

Potwierdzono: anulowanie i przejście do kopii bez usunięcia danych; nieaktywne usuwanie przy pustym lub błędnym słowie; wykonanie dopiero po wpisaniu USUŃ; usunięcie wszystkich znaczników QA i danych osobistych po przeładowaniu; puste projekty remontu/budowy domu, zdjęcia, zakupy i lokalne rozliczenia; usunięte ustawienia zakupów i drafty;14 metadanych migracji zachowanych. Standardowe referencje aplikacji mogą zostać ponownie zasiane przy starcie — nie są odtworzeniem usuniętych projektów. Ponowny start przeglądarki potwierdził trwałość wyniku.

Plik pobranej kopii zachował identyczny SHA i pozwolił przywrócić dwa projekty oraz jedno zdjęcie. Następnie rzeczywisty publiczny backend wycenił odtworzony koszyk na **993,00 zł z dostawą dla30-001**. Nie użyto podstawionych odpowiedzi API ani dawnej taryfy jako aktualnej wyceny. W fazie resetu nie wystąpiło żadne zewnętrzne żądanie mutacji. Zero błędów JS i poziomego przepełnienia przy390px. Widok modalu obejrzano po zakończeniu animacji, aby nie oceniać zrzutu z częściową przezroczystością w trakcie fade.

Test interfejsu dotyczy WWW. Ścieżka natywna korzysta z istniejącego SDK i przeszła typecheck; nie wykonywano jej na fizycznym telefonie. Równoległa druga karta jest jawnym ograniczeniem: przed resetem należy ją zamknąć, a wykryty zapis nowych danych powoduje wynik niepotwierdzony zamiast sukcesu. Nie deklarujemy atomowości między SQLite i AsyncStorage — częściowy błąd ustawień jest jawny i można ponowić operację.

Wydanie przygotowano z czystego checkout w `work/remont-web-wave143-release-20261031` z archiwum `web-build.tar.gz`. **63/63** publicznych plików zgodne z SHA, **17 110 101 bajtów**, skan76 długich wartości vaulta bez wycieku. Prywatny moduł dostaw zachowany poza bundle przeglądarki, health `quoteRelayReady:true`, `missingAssetCount:0`. Dziewięć tras HTTP200, brakujące assety i prywatne pliki HTTP404, prywatny POST bez podpisu HTTP401. Backend:252 aktywne oferty dla171 produktów. Ta fala nie zmienia katalogu204 referencji/204 zdjęć/287 źródeł;33 pozycje nadal wymagają aktywnej oferty.

Dowody sesji: `work/old-reset-proof-wave143.json`, `work/local-reset-{local,production}-qa-wave143.json`, `work/local-reset-production-{desktop,mobile}-wave143.png`, `work/mobile-clean-tests-wave143.log`, `work/web-production-http-wave143.json`, `work/web-release-integrity-wave143.json`. Helper `qa-local-reset-wave143.cjs` ma sprawdzenie nowego profilu i nazw źródłowych projektów QA przed wykonaniem akcji kasowania.

Źródła techniczne: https://www.sqlite.org/lang_transaction.html , https://www.sqlite.org/pragma.html#pragma_defer_foreign_keys , https://docs.expo.dev/versions/v54.0.0/sdk/expo/ . Funkcja `reloadAppAsync` jest eksportowana przez zainstalowany SDK54; web korzysta z przejścia na początek aplikacji.

Cel rozwoju pozostaje aktywny. Trwają poszukiwania stabilnych źródeł dla brakujących produktów Norgips. Nie dodano oferty o stanie „na zamówienie” jako dostępnego magazynowo produktu ani stawki „dostawa od…” jako wyceny całego koszyka.
