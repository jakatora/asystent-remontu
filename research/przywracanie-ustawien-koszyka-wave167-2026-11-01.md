# Przywracanie ustawień koszyka — wave167 R2, 2026-11-01

Trwale uszkodzony zapis zapasu lub opakowań wcześniej blokował wycenę bez możliwości poprawy w aplikacji. Dodano przywracanie trzech ustawień: zapasu projektu oraz rodzin Primer G Pro i Mapegum WPS w projekcie i wspólnym koszyku. Wspólny koszyk wskazuje teraz konkretne prace z błędem, pozwala ponowić odczyt i otworzyć ich wycenę. Pracę wymagającą poprawy można też odznaczyć w wyborze koszyka; błąd zaznaczonej pracy nadal blokuje pełną sumę.

## Przywracanie i kopie danych

Przywracanie wymaga osobnego potwierdzenia w interfejsie i ma przycisk anulowania. Najpierw zachowuje dokładny błędny zapis w lokalnym archiwum, sprawdza jego odczyt i ponownie porównuje oryginalne ustawienie. Dopiero potem zapisuje wartość domyślną i potwierdza jej odczyt. Prawidłowy lub już poprawiony zapis jest jedynie odczytywany. Błąd archiwizacji, zmiana wartości w trakcie operacji i brak potwierdzenia zapisu nie stają się udanym przywróceniem.

Przywrócony zapas jest pusty: wycena obejmuje pełne zapotrzebowanie, dopóki użytkownik ponownie nie wpisze posiadanych ilości. Rodzina opakowań wraca do wybranych pojemności; automat można włączyć ponownie. Obmiary, oznaczenia „Mam”/„Kupione”, inne rodziny i pozostałe projekty pozostają zachowane. Archiwum nigdy nie jest używane jako wejście do wyceny.

Prefix archiwów: `remont.preference-recovery.v1:` z pełnym kluczem źródłowego ustawienia. Lista obsługiwanych przestrzeni jest zamknięta. Dokładne kopie przechodzą przez eksport/import remontu, także sam wspólny koszyk bez projektu. Eksport czeka na kolejkę archiwizacji i przywracania. Duplikaty tego samego błędnego zapisu są zachowywane jeden raz. Maksymalnie 20 rekordów i 1 000 000 znaków na archiwum; przekroczenie limitu wstrzymuje operację zamiast usuwać wcześniejsze kopie. Uszkodzone archiwum lub niedostępna pamięć również wstrzymują przywrócenie. Kolejka dotyczy jednego kontekstu JavaScript; nie dodano atomowej transakcji ani synchronizacji ustawień między kartami.

## Ważna poprawka R2

Pierwsze wydanie przeszło 58 lokalnych i publicznych scenariuszy. Dodatkowa próba na publicznym R1 wykazała, że uszkodzony wybór Primera w projekcie bez bieżących produktów tej rodziny blokował wspólny koszyk, ale wycena projektu nie pokazywała przywracania. Dowód: `unused-family-public-before.json` w katalogu R1; blokada koszyka, cena projektu nadal 90,40 zł i zero przycisków przywracania.

R2 odczytuje oba ustawienia rodzin także po zmianie produktów projektu. Interfejs pokazuje błąd rodziny nawet bez bieżących referencji. Cztery nowe próby potwierdzają identyfikację projektu, widoczną blokadę i przywracanie, zachowanie aktywnego Mapegum/zapasu i ponowną wycenę wspólnego koszyka. Kopia tej nieużywanej rodziny również przechodzi przez eksport/import.

## Weryfikacja

- **497 testów aplikacji PASS, 0 FAIL, 0 SKIP**, także w czystym checkoutcie; 15 nowych testów protokołu i kopii remontu. Typy mobile przechodzą w obu checkoutach. Testy używają produkcyjnych funkcji i rzeczywistego SQLite. Obejmują m.in. ignorowany zapis, błąd archiwum, zmianę oryginału, kolejki i przeniesienie kopii. Nie zmieniano backendu, formuł, definicji prac, migracji, zależności ani lockfile.
- **62 lokalne i 62 publiczne scenariusze przeglądarki**: 31 wcześniejszych regresji koszyka, trzy rzeczywistego kalkulatora hydroizolacji i 28 przywracania ustawień. Cztery dokładne archiwa oraz obliczenia dwóch projektów zachowane po eksporcie/importowaniu do odrębnego profilu i przeładowaniu. Anulowanie nie zmienia danych. Zapis wykonany z utraconą odpowiedzią nadal blokuje wycenę do potwierdzenia ponownym odczytem; operacja nie jest automatycznie ponawiana.
- Przykład dwóch pokoi: net 2 + 3 kg daje jedno wiadro 5 kg za 123,40 zł z dostawą. Przywrócenie pustego zapasu zwiększa potrzebę do 3 + 3 kg i koszt do 170,30 zł; ponowne wpisanie 1 kg zapasu przywraca 123,40 zł. Zachowane wymaganie 5 kg w pierwszym pokoju może pokryć także pozostałe automatyczne 3 kg, więc nadal wystarcza jedno wiadro. Dwie automatyczne rodziny kosztują 295,59 zł; przywrócenie stałego Primera daje 340,60 zł, ponowne włączenie automatu 295,59 zł. Są to obserwacje z 2026-11-01, z krajową taryfą PL Rab-Dom, bez osobnej wyceny kodu. Regresje Sewery obejmują osobno 30-001 i 00-001.
- Wszystkie próby na własnych profilach i syntetycznych projektach. Publiczne ceny/API bez podmiany odpowiedzi; awarie dotyczą wyłącznie własnego localStorage. Zero błędów JS i HTTP429, PL, izolacja przeglądarki, 390 px bez poziomego overflow, dwa rzeczywiste zdjęcia załadowane. Brak próby na fizycznym Androidzie/iOS i badań z klientami.

## Publikacja i dowody

Kod R1 `d5c51ef3e5534efee0844678062601451370dfa1`, poprawka R2 `cd65ede645ccd9d5765114c63f8989b8735ce6d1`, oba wypchnięte. Finalne WWW **`378f0d86-2515-4b06-aba7-047848dd5bec` SUCCESS**, health wskazuje R2. Zastępuje R1 `46057782-d582-4825-91fc-14cb30f00b38`. [Publiczny koszyk](https://asystent-remontu-web-production.up.railway.app/renovation-basket). API pozostaje na zweryfikowanym wydaniu wave166 `4c594958-70c1-4eeb-a41b-0aac8f026df5` SUCCESS; nie wymagało ponownej publikacji.

63 pliki WWW, 17 220 638 bajtów; publiczne SHA256 wszystkich plików, dziewięć tras, WASM i nagłówki izolacji sprawdzone. Prywatne pliki 404, niepodpisany relay 401. Skan 76 wartości vaulta bez wycieków. Wszystkie siedem plików serwera/config identycznych z poprzednim wydaniem; SHA relay `e7fd129b0ddf9eec9efe32a9b0aea6070b25e5e86086f42804d0525208a1bfe8`.

Publiczny audyt nadal: 232 referencje, 199 z aktualną ofertą, 295 aktywnych ofert, cztery odrębne SKU bez EAN; zero pominięć i fałszywych potwierdzeń. Nie dodano produktu ani sklepu. 33 wcześniejsze braki ceny oraz ograniczenia pełnych kodowych dostaw Castoramy/OBI i eTak/ABUD pozostają bez nowego pozytywnego potwierdzenia. Nie zmieniono sposobu określania minimum ani ostrzeżeń o ograniczonym porównaniu zestawów.

Finalne dowody: `G:/Projekty/asystent-remontu-work/wave167-r2-20261101`, pliki `{local,production}-{qa,rich-qa,recovery-qa}.json`, `production-recovery-backup-r1.json`, `production-http.json`, `catalog-identity-production-audit-wave167.json`, `web-integrity.json`, logi testów i typów. R1 i dowód wykrytej pułapki w sąsiednim `wave167-20261101`. Profile i wydania są initializerami. W pierwszych helperach poprawiono błędny fixture zapasu/automatu i oczekiwanie dwóch wiader dla łącznych 5 kg; natywna wycena potwierdziła jedno wiadro. Zasady produkcyjnego pricingu zachowano.

Obcy WIP `ean-overlay.ts`, `mappings.ts`, `pnpm-lock.yaml`, `.atlas/`, `PROPOZYCJE-COCKPIT.md` nietknięty. Bez nowego serwera, klucza, płatnego AI, konta, billing, harmonogramu i zamówienia. Cel ciągłego rozwoju pozostaje ACTIVE; ta partia jest zweryfikowanym postępem.
