# Zapas produktu w koszyku całego remontu — 2026-10-26

Dotychczas odczyt potwierdzał dostępność produktu, lecz gubił konkretną ilość po przejściu do planera. Ten sam zapas można było traktować jako wystarczający niezależnie dla każdego pomieszczenia. Zmieniono planowanie opakowań, sumowanie etapów, porównanie sklepów i dostawy: potwierdzony stan ogranicza cały zakup, a brak pozostaje widoczny zamiast tworzyć pełną, zaniżoną wycenę.

Katalog nadal ma **79/103 produkty z ofertami, 24 braki, 105 aktywnych ofert i 36 sklepów**. Zdjęcia: 103/103. Automatyczne integracje dostawy: 20; Castorama i OBI nadal wymagają dostępu sprzedawcy. Nie podniesiono licznika produktów na podstawie tej poprawki.

## Dane ze sklepów

Rzeczywiste odczyty HTTPS i izolowanych koszyków, 2026-10-26T05:36:31–35Z:

- [TOK-MET Invena WS-20-030-G](https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i): 54 pojedyncze sztuki, cena 11,14 zł brutto/szt.
- [Matbud Gamma Fasada 044, 100 mm](https://centrummatbud.pl/Styropian-elewacyjny-10-cm-Yetico-Gamma-Fasada-044-3m2-op-p96729): 120 OP = 120 paczek po 3 m².
- [Matbud Gama Passive Fasada 033, 150 mm](https://centrummatbud.pl/Styropian-grafitowy-15cm-Yetico-Gama-Passive-Fasada-033-p131345): 360 natywnych M2 = 180 pełnych paczek po 2 m². Nie potraktowano 360 jako liczby paczek.

To stan opublikowany przy sprawdzeniu, bez rezerwacji i bez gwarancji lokalnego stanu oddziału. Pozostałe oferty bez ilościowego źródła zachowują stan nieznany; nie przypisuje się im wymyślonych limitów. Koszyk TOK-MET nadal nie ma potwierdzonej wysyłki dla kodu: `address_required`.

## Reguły i interfejs

Obserwacja `stockPackages` jest przechowywana razem z czasem ceny i dowodem odczytu. Nowszy, mniejszy stan zastępuje poprzedni również po restarcie. Nieprawidłowe liczby są odrzucane, zamiast znosić ograniczenie. `maxPackages` w planowaniu i odpowiedzi HTTP dotyczy fizycznych paczek; pozostaje zgodny z wielokrotnością i minimum zakupu.

Ograniczone stany kilku sklepów można łączyć. Nie wolno wyrzucić droższej oferty o tym samym opakowaniu, jeżeli jej zapas uzupełnia tańszą. Optymalizacja z limitami korzysta z ograniczonych grup binarnych, w ramach istniejącego budżetu obliczeń; przekroczenie budżetu nie daje wymyślonej taniej sumy. Duży wybór koszyków dostaw nadal jest oznaczany jako ograniczone wyszukiwanie.

Wspólny popyt przekraczający zapas wycofuje wyceny dotkniętych etapów. Zachowane są ID etapu, obmiary, robocizna i pozostałe produkty. Interfejs pokazuje „Potwierdzony zapas nie wystarcza na cały zakup” także po wyborze konkretnego sklepu; właściwy powód ma pierwszeństwo przed ogólnym brakiem oferty. Przy znanym stanie widać ilość i informację o braku rezerwacji.

## Weryfikacja

381 testów rdzenia/kalkulatorów/pricing/API PASS, 0 skip. Nowe przypadki obejmują 350 niezależnie wyliczonych, wyczerpujących porównań kombinacji opakowań, minimum, wielokrotności i ograniczonych stanów; mały i duży podział zakupu między sklepy; wspólny zapas dwóch pomieszczeń; rzeczywisty HTTP i restart z mniejszym zapasem. Istniejące testy Matbudu nadal weryfikują natywną odmowę lub przycięcie ilości; wycena HTTP zatrzymuje znany nadmiar jeszcze przed dodatkowym koszykiem sklepu. Typecheck API/mobile i kontrola 66 chronionych ID z negatywnymi mutacjami PASS.

Rzeczywisty HTTP lokalnego bundle: 54 wężyki = 601,56 zł przy odbiorze; 55 oraz dwa pomieszczenia po 30 = brak pełnej sumy i jawny `insufficient-stock`. Biały styropian 121 paczek i grafitowy 181 paczek również pozostają bez pełnej sumy. Poprawny wspólny koszyk Matbudu nadal daje 6545,98 zł z potwierdzoną dostawą 0 zł; pierwotny koszyk nadal 790,83 zł. Wszystkie 103 referencje: 79 wycenionych / 24 brakujące.

Dowody czatu: `work/stock-wave23-research/native-stock-proof.json`, `work/stock-wave23-local-live-proof.json`, `work/stock-wave23-core-tests.log`. Przed wdrożeniem pobrano i porównano komplet 148 plików produkcji; zmiana obejmuje tylko bundle remontu i jego trzy odświeżone obserwacje, pozostałe 104 zachowane. SHA256 archiwum bazowego: `440dcf0abc12eb47fd18d740b6c037f8944f7467588466a5aa0702d50fd1e9cb`.

Ponowny rzeczywisty HTTP 200 [listy Buy365](https://www.buy365.pl/umywalki-i-postumenty,c56.html) potwierdził stary SKU K30-002 i 117,15 zł, lecz link produktu to `#`, czas 7–10 dni, bez potwierdzonego stanu. Nie uznano tego za nową dostępną ofertę Facile. Cel uzupełnienia pozostałych 24 produktów i pełnego porównania remontu pozostaje aktywny.

Wspólny backend: 1054 testy PASS, 0 skip, uruchomione szeregowo; razem z 381 testami aplikacji to **1435 PASS**. PR [29](https://github.com/jakatora/przetargai/pull/29) scalony i dołączony do zadania; źródło `5bd6512da34b80eb673e1755b4763921b09985af`, merge `63936293280ccdab3dbd511fd0ae2c1901fd715c`. Railway `12a99142-f8f0-49bc-acbf-436055b52fef` SUCCESS 2026-10-26T05:45:44.828Z. Ponownie sprawdzono wszystkie 148 plików przed wdrożeniem. GitHub nie definiował checks/statuses; nie przedstawia się tego jako zielonego CI.

Rzeczywisty produkcyjny HTTPS potwierdził komplet powyższych przypadków, 79/103 referencje i pierwotne 790,83 zł (`work/stock-wave23-production-proof.json`). Kolektor samodzielnie odczytał stany 2026-10-26T05:46:21–23Z, po seedach i po wdrożeniu: 120/180/54, active=true, error=null, running=false. `/health` 200 i `/auth/me` 401 bez zmian (`work/stock-wave23-collector-proof.json`). Nie wykonano nowego wydania iOS/Android.

Rzeczywisty podgląd aplikacji potwierdził komunikat przy 55 sztukach również po wybraniu TOK-MET, a po zmianie na 54 sztuki: 601,56 zł jako jawna część materiałów, prawdziwe zdjęcie i „zapas przy sprawdzeniu 54 op. Nie jest to rezerwacja”. Dowody: `outputs/stock23-shortage-confirmed-20261026.png` i `outputs/stock23-available-54-20261026.png`. Usunięto wyłącznie własną pozycję testową i przywrócono „Najtańszy zestaw”: 3 prace, Standard, 1 posiadana pozycja, kod 00-001, bez dodatkowych materiałów, ponownie 637,43 + 153,40 = 790,83 zł (`outputs/stock23-original-basket-restored-20261026.txt`). Nie zmieniano karty projektu użytkownika.

Pułapka lokalnego podglądu: poprzedni Expo był uruchomiony z `CI=1`; sam log potwierdzał wyłączone śledzenie zmian. Odświeżenie przeglądarki nadal ładowało starą wersję komunikatów. Zweryfikowano drzewo wyłącznie własnego procesu i ponownie uruchomiono Expo w tle bez CI, z `--clear --max-workers 2`, port 8082, parent PID 15860 / Metro PID 29636. Po rzeczywistym przebudowaniu sprawdzono poprawny nowy interfejs. Podgląd pozostawiono działający; nie aktualizowano zależności ani manifestów.
