# Kopia i przenoszenie projektów remontu — 2026-10-31

Nowa funkcja rozwiązuje problem lokalnych zapisów przypisanych do przeglądarki i adresu aplikacji. Ustawienia → Kopia i przenoszenie projektów pozwala pobrać plik i obejrzeć zawartość przed wczytaniem go w innej przeglądarce. Nie jest to synchronizacja chmurowa.

## Zakres i zachowanie

Format `asystent-remontu-projects` v1: siedem istniejących tabel remontu (`projects`, `shopping_items`, `project_photos`, `project_checklist`, `project_activities`, `price_overrides`, `project_price_snapshots`) i przejrzane lokalne klucze wyborów produktów, dostawy, poprzednio widzianych cen oraz wspólnego koszyka. Zachowane są identyfikatory, obmiary, notatki, własne ilości/ceny i oznaczenia posiadane/kupione. Moduł budowy domu oraz dane kont i wykonawców mają osobny zakres i nie są częścią tej kopii; interfejs mówi o tym przed eksportem. Nie zmieniono migracji ani definicji istniejących prac.

Eksport pobiera spójny obraz tabel jednym zapytaniem SQLite i sprawdza stabilność danych oraz preferencji przed pobraniem. Zdjęcia są osadzone w pliku, bez odwołań do tymczasowego adresu starej przeglądarki. Limit pliku 20 MB jest widoczny. Nieczytelne zdjęcie blokuje utworzenie pozornie kompletnej kopii. Dodawanie nowych zdjęć przez WWW otwiera teraz prawdziwy wybór pliku zamiast nieobsługiwanego menu `Alert` i zapisuje ich zawartość, tak aby działały po przeładowaniu.

Import waliduje wersję, wszystkie tabele, dozwolone kolumny, typy, duplikaty, powiązania projektów, wybory produktów i osadzone zdjęcia. Nie wykonuje SQL pochodzącego z pliku. Dodaje całe projekty; konflikt identyfikatora zatrzymuje import przed zapisem zamiast nadpisywania istniejących danych. Zachowuje ustawienia i dodatki wspólnego koszyka, jeżeli docelowa przeglądarka ma już projekty. Na pustym koncie lokalnym przenosi także wspólny koszyk. Projekt usunięty wcześniej, którego ID zostało w starym zaznaczeniu koszyka, nie blokuje kopii pozostałych prac.

Zapisy preferencji są odczytywane kontrolnie przed udostępnieniem nowych projektów; SQL zapisuje się jednym atomowym batchem. Błąd powoduje rollback i odtworzenie poprzednich wartości lokalnych. Utracona odpowiedź po COMMIT jest rozstrzygana odczytem rzeczywistych wierszy bez ponawiania zapisu. Niepewny wynik wymaga sprawdzenia projektów po ponownym otwarciu — nie jest pokazywany jako sukces.

Stare ceny mogą pozostać bazą lokalnej historii zmian. Ręczne taryfy i dawne potwierdzenia dostawy nie są przenoszone jako aktualne wyceny; ustawienia dostawy wracają w trybie automatycznym i ceny/dostawy wymagają ponownego sprawdzenia. Plik nie trafia na serwer aplikacji. Prywatność i pomoc zostały uzupełnione o opis tej funkcji.

## Weryfikacja

Osiem testów nowej funkcji używa prawdziwego SQLite, istniejących migracji 001–004 i rzeczywistego wyniku kalkulatora. Obejmuje wszystkie siedem tabel, oznaczenia zakupowe, własne ilości, wybory produktów, zdjęcia, daty starych snapshotów, duplikaty, uszkodzone pliki, błędy preferencji, przerwanie SQL po części zapisów oraz utraconą odpowiedź po COMMIT. Pełny mobile: **398/398 PASS**, zero skipów. Końcowy odbiór eksportu przeglądarki, przeniesienia między profilami i wdrożenia zostanie dopisany po wykonaniu.

## Dostęp do sieci handlowych

Nowa przesłanka z wave141 uzasadniała próbę odczytu z istniejącego serwera webowego. Wynik 2026-10-31T09:31:55Z: Castorama home i konkretna karta CD60/EAN5907651698899 oba **HTTP503**, identyczna treść bez danych produktu; OBI home i karta Śnieżki **puste HTTP404**; Leroy Norgips30×30 **HTTP403**. Dowód `work/retail-web-access-wave142.json`. Ten kanał nie umożliwia obecnie podłączenia tych sklepów. Nie uznano blokady odczytu za brak produktu i nie dodano fikcyjnych stawek dostawy.

Źródła techniczne: https://www.sqlite.org/isolation.html , https://www.sqlite.org/lang_transaction.html , https://developer.mozilla.org/en-US/docs/Web/API/Blob , https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL . Cel dalszego rozwoju pozostaje aktywny; 33 brakujące aktywne oferty i pełne dostawy Castorama/OBI pozostają do wykonania.
