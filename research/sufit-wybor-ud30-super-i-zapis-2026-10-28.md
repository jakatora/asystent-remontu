# Sufit: wybór UD30 SUPER C3 i potwierdzanie zapisu — 28.10.2026

Użytkownik istniejącego projektu sufitu miał oferty 12 z 13 materiałów. Brakował profil Norgips UD30 o EAN 5907651698905. Obecna karta Leroy Merlin 44604343 opisuje inny EAN: **5907651691197**. Dodano ten aktualny model jako osobny, jawny wybór w obmiarach i edytorze, bez zmiany historycznego produktu.

## Źródła, cena i zdjęcie

- [Norgips: UD30 SUPER C3](https://norgips.pl/produkty/profil-ud-30-super-o-gr-blachy-06-mm-c3-26.html) przypisuje GTIN 5907651691197 do profilu 3 m o grubości 0,6 mm. Karta starszego [UD30 C2](https://norgips.pl/produkty/profil-ud-30-o-gr-blachy-06-mm-34.html) i dawny kod pozostają odrębną tożsamością. Tekst marketingowy producenta SUPER zawiera niespójny opis szerokości; do identyfikacji konkretnego zakupu wykorzystano dokładny GTIN oraz widoczną tabelę sklepu: 30 mm, 3 m, grubość 0,6 ± 0,05 mm.
- [Leroy Merlin 44604343](https://www.leroymerlin.pl/produkty/profil-sufitowy-ud30-3-m-b-super-norgips-44604343.html): aktualny Product JSON-LD i specyfikacja potwierdzają nowy EAN. Cena **11,19 zł brutto za cały profil 3 m** zgadza się z rzeczywistą pozycją anonimowego koszyka. Nie jest to cena metra ani wiązki 20 sztuk.
- Dodano oddzielny wpis zdjęcia [z aktualnej karty produktu](https://media.adeo.com/media/3196086/media.png). Nie zmieniano dawnego EAN w istniejących obserwacjach.
- Dowody sesji: `catalog-wave70-research/leroy-ud-super-c3-browser.json`, `leroy-cart.json`, `reviewed-observation.json`. Aktualne potwierdzenie ma termin ważności 24 h; nie stanowi deklaracji zapasu krajowego, lokalnej rezerwacji ani wyceny dostawy.

## Wybór i ilości

Dotychczasowy wybór C2 jest zachowany. SUPER C3 użytkownik wybiera oddzielnie i potwierdza dopasowanie do projektu, wybranego CD60 i pozostałych elementów konstrukcji. Zmiana UD lub CD usuwa poprzednie potwierdzenie. Bez niego ilość pozostaje nieustalona; brak nie daje darmowego materiału ani pełnej sumy.

Zestaw nadal dotyczy suchego wnętrza z płytą GKB i wskazanego rusztu. Wybór jednego profilu C3 nie potwierdza klasy całego systemu, odporności ogniowej ani projektu pomieszczenia mokrego. Oznaczenia „Mam” i „Kupione” starego profilu nie pokrywają nowego modelu.

Produkcja, 7 przypadków HTTP:

- 15,4 mb wymaga 6 profili po 3 m: **67,14 zł**.
- Dwa sufity po 15,4 mb dają wspólne 30,8 mb: **11 profili za 123,09 zł**, zamiast zaokrąglania osobno do 12 sztuk.
- Wybrany kompletny zestaw 13 wymagań materiałowych sufitu ma aktualne oferty. Dostawa pozostaje niepotwierdzona, więc nie prezentujemy go jako kompletnej ceny z transportem.
- Stary C2, niepotwierdzone dopasowanie i odbiór bez wybranej placówki nie dostają pełnej wyceny. Wybór samego Leroy Merlin zachowuje brakujące pozostałe produkty.

## Problem zapisu wykryty w rzeczywistej aplikacji

Pierwszy zapis w istniejącym projekcie QA zwrócił `database_request_timeout_check_saved_changes`. Po odświeżeniu rzeczywista baza zawierała nowy wybór C3: zapis był wykonany mimo utraconego potwierdzenia. Nie powtarzano tej mutacji automatycznie i nie restartowano serwera.

`saveProjectWithReadback` wykonuje pojedynczą próbę zapisu i odczytuje rzeczywisty rekord. Porównuje treść żądanych danych, a metadane czasu pobiera z bazy. Jeżeli po błędzie zapisu odczyt dokładnie potwierdza zmiany, aplikacja pokazuje zapisany projekt. Brak zgodności lub nieudany odczyt pozostawia formularz i widoczny komunikat niepewnego zapisu. Nie jest to naprawa wszystkich możliwych przyczyn opóźnień komunikacji między kartami.

Przycisk zapisu ma blokadę natychmiastową oraz stan disabled. Nie można rozpocząć kolejnego zapisu ani zamknąć formularza, gdy trwa operacja. Błąd opcjonalnego dziennika aktywności nie zamienia już potwierdzonego zapisu projektu w fałszywy błąd. Pusta nazwa i błędne obmiary pokazują tekst w formularzu również w przeglądarce.

Test z rzeczywistą bazą SQLite potwierdza: pojedynczy zapis zatwierdzony przed symulowaną utratą odpowiedzi, jeden odczyt, brak drugiego zapisu; inne dane, brak rekordu i błąd odczytu nie są sukcesem. Łącznie 13 testów zapisu/połączenia współdzielonego PASS. Ponadto 703 testy kalkulatora/koszyka/API oraz 1054 testy współdzielonego backendu PASS, bez pominiętych testów; TypeScript aplikacji i API PASS.

## Stan katalogu i wdrożenia

Obecnie 167 referencji, 160 produktów z aktywną ofertą, 205 aktywnych ofert, 211 źródeł, 48 aktywnych sklepów/kanałów. Dodano 1 produkt, 1 ofertę i 1 wpis zdjęcia (168 wpisów dla 167 referencji). Zachowano 210 wcześniejszych obserwacji bez zmiany dat.

**7 dawnych referencji nadal nie ma aktywnej dokładnej oferty**. Dodanie jawnie wybieranego C3 rozwiązuje brak w wybranym koszyku sufitu; nie oznacza dostępności starego C2. Te same 65 historycznych map obmiarów nadal mają 85/250 wycenionych wymagań i 11 kompletnych scenariuszy materiałowych. Nowe świadome wybory i 7 przypadków HTTP są sprawdzone osobno.

Backend: [PR70](https://github.com/jakatora/przetargai/pull/70), merge `8ad9a3be262d3a3c26518b1536d260ec4d9e02a0`. Railway `ec865eb7-ef86-4432-8fbf-86b0161b9f57`, SUCCESS. Dwa zmienione pliki backendu; 146 innych zachowanych. Wszystkie 148 plików produkcyjnych zgodne z pakietem. Zmiany sposobu zapisu dotyczą aplikacji i nie wymagały kolejnego wdrożenia backendu.

Kontrola UI: istniejący własny projekt QA „Test kompletu — sufit 10 m², łączniki 100 szt.” ma po jawnym wyborze 13 zamiast 12 materiałów z ofertami. Profil: 6 × 3 mb za 67,14 zł; zdjęcie załadowane 3333×2500. Po nowym zapisie i odświeżeniu zachowane są C3, potwierdzenie dopasowania i notatka QA. Pusta nazwa daje widoczny komunikat; przy zapisie przyciski są zablokowane. Zrzut sesji: catalog-wave70-ud30-prices.jpg (1280×720). Nowych projektów nie tworzono (nadal 23), pozostałych projektów nie edytowano. Plan obejmuje materiały 836,80 zł i 139,89 zł za 6 z 8 dostaw; brakujące opłaty Leroy Merlin/Marbet24 są jawne, pełna suma pozostaje nieznana. Walidacja nowych URL-i: 0 błędów, 1 ostrzeżenie antybotowe Leroy; tam zakup potwierdzono natywnie. Kontrola zachowania ID i próby negatywne PASS. Cały cel pozostaje aktywny: pozostałe referencje, wymagania receptur, automatyczne wyceny transportu i rzeczywiste ceny/zapasy pobliskich placówek nadal wymagają pracy.
