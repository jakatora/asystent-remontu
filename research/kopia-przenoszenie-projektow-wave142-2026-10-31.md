# Kopia i przenoszenie projektów remontu — 2026-10-31

Nowa funkcja rozwiązuje problem lokalnych zapisów przypisanych do przeglądarki i adresu aplikacji. Ustawienia → Kopia i przenoszenie projektów pozwala pobrać plik i obejrzeć zawartość przed wczytaniem go w innej przeglądarce. Nie jest to synchronizacja chmurowa.

## Zakres i zachowanie

Format `asystent-remontu-projects` v1: siedem istniejących tabel remontu (`projects`, `shopping_items`, `project_photos`, `project_checklist`, `project_activities`, `price_overrides`, `project_price_snapshots`) i przejrzane lokalne klucze wyborów produktów, dostawy, poprzednio widzianych cen oraz wspólnego koszyka. Zachowane są identyfikatory, obmiary, notatki, własne ilości/ceny i oznaczenia posiadane/kupione. Moduł budowy domu oraz dane kont i wykonawców mają osobny zakres i nie są częścią tej kopii; interfejs mówi o tym przed eksportem. Nie zmieniono migracji ani definicji istniejących prac.

Eksport pobiera spójny obraz tabel jednym zapytaniem SQLite i sprawdza stabilność danych oraz preferencji przed pobraniem. Zdjęcia są osadzone w pliku, bez odwołań do tymczasowego adresu starej przeglądarki. Limit pliku 20 MB jest widoczny. Nieczytelne zdjęcie blokuje utworzenie pozornie kompletnej kopii. Dodawanie nowych zdjęć przez WWW otwiera teraz prawdziwy wybór pliku zamiast nieobsługiwanego menu `Alert` i zapisuje ich zawartość, tak aby działały po przeładowaniu.

Import waliduje wersję, wszystkie tabele, dozwolone kolumny, typy, duplikaty, powiązania projektów, wybory produktów i osadzone zdjęcia. Nie wykonuje SQL pochodzącego z pliku. Dodaje całe projekty; konflikt identyfikatora zatrzymuje import przed zapisem zamiast nadpisywania istniejących danych. Zachowuje ustawienia i dodatki wspólnego koszyka, jeżeli docelowa przeglądarka ma już projekty. Na pustym koncie lokalnym przenosi także wspólny koszyk. Projekt usunięty wcześniej, którego ID zostało w starym zaznaczeniu koszyka, nie blokuje kopii pozostałych prac.

Zapisy preferencji są odczytywane kontrolnie przed udostępnieniem nowych projektów; SQL zapisuje się jednym atomowym batchem. Błąd powoduje rollback i odtworzenie poprzednich wartości lokalnych. Utracona odpowiedź po COMMIT jest rozstrzygana odczytem rzeczywistych wierszy bez ponawiania zapisu. Niepewny wynik wymaga sprawdzenia projektów po ponownym otwarciu — nie jest pokazywany jako sukces.

Stare ceny mogą pozostać bazą lokalnej historii zmian. Ręczne taryfy i dawne potwierdzenia dostawy nie są przenoszone jako aktualne wyceny; ustawienia dostawy wracają w trybie automatycznym i ceny/dostawy wymagają ponownego sprawdzenia. Plik nie trafia na serwer aplikacji. Prywatność i pomoc zostały uzupełnione o opis tej funkcji.

## Weryfikacja

Osiem testów nowej funkcji używa prawdziwego SQLite, istniejących migracji 001–004 i rzeczywistego wyniku kalkulatora. Obejmuje wszystkie siedem tabel, oznaczenia zakupowe, własne ilości, wybory produktów, zdjęcia, daty starych snapshotów, duplikaty, uszkodzone pliki, błędy preferencji, przerwanie SQL po części zapisów oraz utraconą odpowiedź po COMMIT. Pełny mobile: **398/398 PASS**, zero skipów, także w czystym checkout końcowego commita. Typecheck mobile PASS, 4 testy serwera webowego PASS, 66 wpisów rejestru i stare identyfikatory zachowane. Odczyt kontrolny importu używa map po ID, aby nie porównywać każdej pary wierszy przy dużej kopii.

## Wdrożenie i rzeczywiste przeniesienie

Commity aplikacji `f7988c8e10488ecc499741ca0827348da891cbc3` oraz `1240780399e86c2e2fa109fdc5caabddd0fd24bf` wypchnięte na `codex/remont-zakupy-20261024`. Publiczne źródło wydania: `1240780399e86c2e2fa109fdc5caabddd0fd24bf`. Railway web `cf559853-b43e-4575-a994-9548dac7ec20` **SUCCESS**, 2026-10-31T09:46:30Z; ten sam serwis i adres https://asystent-remontu-web-production.up.railway.app . Wspólnego backendu nie wdrażano w tej fali.

Playwright + Edge odebrał najpierw dwa różne lokalne originy, potem rzeczywiste przeniesienie z `http://127.0.0.1:4193` na publiczny adres. Źródłem był wyłącznie osobny profil QA, zawierający dwa projekty utworzone wcześniej przez wizard. W interfejsie dodano syntetyczne zdjęcie PNG 80×60 px, a po przeładowaniu nadal było dostępne. Eksport pobrano przyciskiem, przeniesiono przez wybór pliku i jawne potwierdzenie zawartości. Wszystkie siedem tabel i preferencje źródła oraz ponownego eksportu są identyczne. Zachowano prywatną notatkę testową, własne ilości/ceny i flagi mam/kupione. Zdjęcie działa po zamknięciu źródłowej przeglądarki, przeładowaniu docelowej strony i ponownym uruchomieniu docelowej przeglądarki.

Uszkodzony plik i anulowanie podglądu nie wykonały zapisów. Ponowny import jest zablokowany i zachowuje wszystkie wiersze. Przycisk „Otwórz moje projekty” prowadzi do zapisanych prac. Widok 390 px nie ma poziomego przepełnienia; zero błędów JavaScript. Podczas obu przebiegów nie wysłano kopii, zdjęcia ani znacznika prywatnej notatki do API. Jedyny POST wyceny dotyczył materiałów i kodu.

Po imporcie publiczny koszyk dwóch prac odtworzył **993,00 zł z dostawą dla 30-001**, bez przechowywania starej potwierdzonej taryfy. To rzeczywisty produkcyjny HTTP, bez podmiany odpowiedzi. Zakres ceny pozostaje ograniczony do opisanych produktów i potwierdzonych dostaw z wave141; brakujące dostawy nadal są jawne. Nie zmieniono cen, nie realizowano płatności ani zamówień. Kopiowane własne ceny i stare obserwacje pozostają danymi historycznymi użytkownika.

Wydanie z czystego checkout: `work/remont-web-wave142-r2-release-20261031`, archiwum `web-build.tar.gz`, osobny prywatny moduł dostaw zachowany poza browser bundle. **63/63** publicznych plików zgodne z SHA, **17 097 627 bajtów**. Skan 76 długich wartości vaulta: zero wycieków. Health `missingAssetCount:0`, `quoteRelayReady:true`. Dziewięć tras HTTP200, brakujące pliki i prywatne pliki serwera HTTP404, prywatny POST bez podpisu HTTP401. Publiczna pomoc i prywatność zawierają opis kopii. Backend health: 252 aktywne oferty / 171 produktów; katalog bez nowych referencji w tej fali.

Dowody sesji: `work/project-backup-local-qa-wave142.json`, `work/project-backup-production-qa-wave142.json`, `work/project-backup-{source,restored}-{local,production}-wave142.json`, `work/project-backup-production-{desktop,mobile}-wave142.png`, `work/web-production-http-wave142.json`, `work/web-release-integrity-wave142.json`, `work/mobile-clean-tests-wave142-r2.log`. Pliki kopii i profile zawierają wyłącznie dane QA, nie dane przeglądarki użytkownika.

## Dostęp do sieci handlowych

Nowa przesłanka z wave141 uzasadniała próbę odczytu z istniejącego serwera webowego. Wynik 2026-10-31T09:31:55Z: Castorama home i konkretna karta CD60/EAN5907651698899 oba **HTTP503**, identyczna treść bez danych produktu; OBI home i karta Śnieżki **puste HTTP404**; Leroy Norgips30×30 **HTTP403**. Dowód `work/retail-web-access-wave142.json`. Ten kanał nie umożliwia obecnie podłączenia tych sklepów. Nie uznano blokady odczytu za brak produktu i nie dodano fikcyjnych stawek dostawy.

Źródła techniczne: https://www.sqlite.org/isolation.html , https://www.sqlite.org/lang_transaction.html , https://developer.mozilla.org/en-US/docs/Web/API/Blob , https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL . Cel dalszego rozwoju pozostaje aktywny; 33 brakujące aktywne oferty i pełne dostawy Castorama/OBI pozostają do wykonania.
