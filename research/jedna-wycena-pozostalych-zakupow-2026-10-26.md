# Jedna wycena pozostałych zakupów w projekcie — 2026-10-26

Problem potwierdzony podczas korzystania z aplikacji: Plan i Zakupy pokazywały 1076 zł według cen zapisanych w przepisie, a porównanie wybranego Atlantic New — 964,84 zł. Użytkownik nie widział wyraźnie, że są to inne źródła kwot i modele. Ponadto pojedynczy projekt wyceniał ponownie materiały oznaczone jako posiadane lub kupione, mimo że wspólny koszyk już je pomijał.

## Zachowanie

Plan, Zakupy i Kosztorys mają kartę **„Koszt zakupów w sklepach”**. Po wykonaniu porównania pokazuje tę samą odpowiedź serwera: wycenione materiały, dostawę albo odbiór, wybrany sklep, modele i czas porównania. Przy braku frachtu nie powstaje pełna suma. Przy brakujących produktach kwota pozostaje częściowa. Karta kieruje bezpośrednio do pełnego porównania.

Szacunki z przepisu i zapisanej listy mają jawne etykiety. Zapisana lista może zawierać własne ceny i już kupione pozycje; jej suma nie jest ceną pozostałego zestawu z transportem. Narzędzia bez ceny mają kreskę i „Cena do uzupełnienia”, a podsumowanie jest niepełne. Dotyczy to również tekstu do udostępnienia. Wyraźne własne zero pozostaje wartością użytkownika; domyślne zero bez wyceny nie udaje darmowego produktu. Nie wysłano żadnej wiadomości ani udostępnienia.

Nowa karta używa ostatniego porównania tylko w bieżącym otwarciu projektu. Zmiana obmiarów, poziomu, regionu lub listy zakupowej unieważnia pasującą sumę. Nie zapisuje się jej na dysku i nie przywraca po reloadzie. Termin ważności to najwcześniejszy z terminów dostaw, ręcznych potwierdzeń użytych ofert i lokalnego limitu sesji 10 minut. Ten limit jest decyzją aplikacji, nie deklaracją polityki sklepu. Karta sprawdza czas także po powrocie na ekran; testy obejmują wygaśnięcie. Rzeczywistego 10-minutowego oczekiwania nie powtarzano w UI.

## Wspólny zakres materiałów

`applyProjectShopping` jest współdzielone przez projekt i cały remont. Pomija pełne wymagania oznaczone „Mam”/„Kupione”, zachowuje dodatkowe wiersze z Zakupów oraz pozycje o nieznanej ilości. Nie usuwa materiału przy sprzecznych duplikatach, oznaczeniu z innego projektu lub niewystarczającej ilości. Starszy JSON jest aktualizowany odczytowo przed sprawdzeniem posiadania, także przy bezpośrednim wywołaniu pomocnika. Dane źródłowe nie są mutowane.

Naprawiono również rzeczywisty brak podłączenia obsługi ilości umywalki: poprzedni handler potwierdzał aktualne zapotrzebowanie wyłącznie dla EPS. Teraz wspólna decyzja `shoppingQuantityAction` obsługuje EPS i sink. Starsze posiadane dwa zawory nie pokrywają czterech; poprawna aktualna ilość jest zapisywana przed oznaczeniem całej pozycji. Niezgodna własna ilość lub ilość nieustalona blokuje oznaczenie. Zmiana „Kupione” nie pozostawia równoległego oznaczenia „Mam” dla tych prac. Przypadki historyczne potwierdzono testami reguły używanej przez handler, bez sztucznego zmieniania JSON użytkownika w przeglądarce.

## Weryfikacja rzeczywista

Użyto wyłącznie własnego projektu `proj_mvps3mo96r5yibhgr`, utworzonego w poprzedniej iteracji. Nie utworzono ani nie usunięto projektu w tej zmianie. Wybrany Atlantic New i domyślne zero dodatkowych wężyków pozostały zapisane.

- Porównanie, Plan i Zakupy: **964,84 zł** wycenionych materiałów z opcją odbioru, bez dojazdu, z koniecznością potwierdzenia lokalnego zapasu. Ceny referencyjne 1076 zł są osobno opisanym szacunkiem.
- Po oznaczeniu czterech zaworów jako posiadanych stara karta od razu traci ważność. Nowa wycena i Plan pokazują **826,68 zł**. To samo sprawdzono przy oznaczeniu zaworów jako kupionych.
- Wszystkie pięć materiałów oznaczono tymczasowo „Mam”: porównanie i Plan pokazują brak materiałów do dokupienia, bez komunikatu o darmowym remoncie. Narzędzia i robocizna są osobno.
- Wybór TGS: **259,96 zł dostępnych materiałów, cztery braki, pełna suma niedostępna**. Plan zachowuje nazwę wybranego sklepu i ograniczenie kwoty.
- Dostawa bez pełnej wyceny: w Planie jest 964,84 zł samych materiałów i wyraźny brak łącznego kosztu z transportem. Nie dopisano opłaty 0 zł.
- Pełny reload nie przywraca starej kwoty; użytkownik otwiera nowe porównanie. Przywrócono wszystkie 10 checkboxów własnego projektu do false, brak oznaczeń posiadania, Najtańszy zestaw, odbiór i zapisany Atlantic New. Nie zmieniano własnych cen ani ilości podczas testu.
- Telefon 375×812: karta mieści się w ekranie, brak poziomego overflow. Test ujawnił ucinanie długiej etykiety i kwoty w starym SummaryRow; naprawiono zawijanie etykiety i wyrównanie kwot. Końcowe 1076 zł i zakres robocizny są czytelne. Przywrócono viewport 1280×720.

Rzeczywisty produkcyjny HTTPS, z wejścia bieżącego kalkulatora i wspólnego filtra: po wyłączeniu posiadanych zaworów serwer zwraca **82668 gr**, bez pozycji zaworów. `purchaseSummary` pokazuje tę samą sumę. Wysyłka do 00-001 daje `shipping_unknown` i `totalGrosze:null`. Pięć posiadanych materiałów daje zerową liczbę pozostałych pozycji, odrębny stan od oferty „0 zł”. Backend nie został zmieniony ani wdrożony.

## Walidacja i granice

**479 testów core/kalkulator/pricing/API PASS, 0 skip**. Dziewięć nowych testów sprawdza serwerowe kwoty, oddzielny fracht, częściową odpowiedź, wygasanie, błędne daty/kwoty, wspólny zakres projektu i remontu, posiadanie/kupienie, dane historyczne, niezmienność oraz nieznane ceny narzędzi. Mobile typecheck PASS, kontrola 66 chronionych ID wraz z negatywnymi mutacjami PASS, diff check PASS. Nie powtarzano 1054 testów niezmienionego wspólnego backendu i nie budowano binarek mobilnych.

Ścieżka pieniędzy: kwoty serwera w groszach, bez przeliczania ceny z lokalnego szacunku; nieznany fracht lub brak produktu nie staje się zerem w pełnej sumie; zakres jest izolowany po projekcie i aktualnych danych. Brak płatności, zamówień lub wywołań płatnego AI. Dowód poza unitami: produkcyjny HTTP oraz przejścia między rzeczywistymi ekranami i ich reakcje na oznaczenia zakupowe.

Dowody w katalogu rozmowy: `work/catalog-wave38-production-proof.json`, `work/catalog-wave38-core-tests.log`, `work/catalog-wave38-legacy-mutation-proof.json`, `work/catalog-wave38-ui-proof.json`; `outputs/catalog38-{plan-live-summary,owned-valves-plan,all-owned,purchased-valves,shipping-unknown,selected-store-partial,shopping-restored,after-reload,basket-restored}-20261026.txt`; obrazy `catalog38-owned-valves-plan`, `catalog38-mobile-reference-costs`, `catalog38-mobile-purchase-summary`, `catalog38-desktop-purchase-summary-20261026.png`.

Cel pozostaje aktywny: sześć historycznych modeli, pełna dostawa Castorama/OBI, dobór i wycena mocowań/podejść oraz lokalne ceny/stany nadal wymagają pracy. Karta obejmuje wycenione pozycje; nie potwierdza kompletności wszystkich elementów montażu. W tej iteracji nie dodano SKU ani ofert.
