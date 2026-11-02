# Jedna wycena wybranego sklepu — 2026-11-02

Status: kandydat w walidacji. Poprzednia tura = postęp, wave191 opublikowana. Cel całej aplikacji pozostaje aktywny.

## Problem potwierdzony w rzeczywistości

Publiczna wave191, dwa wejścia do koszyka czterech materiałów z zapisaną preferencją Decowant: cztery POST pricing/project, kolejno wszystkie sklepy / Decowant / wszystkie sklepy / Decowant. Kontrolny rzeczywisty UI RED w wave192 zakończył się 4 != 2; ceny, zdjęcia, kopia i wynik wybranego sklepu były poprawne. Artefakt production-hydroband-attempt-red-r1.json zachowuje żądania i odpowiedzi.

Pierwsza hipoteza o braku bariery odczytu preferencji była nieprawidłowa. CostEstimateTab już sprawdza loadedScope i gotowość wyborów. Dodatkowe zapytanie jest celowym pobraniem porównania innych sklepów przed wyceną wskazanego sklepu. Używa jednak tego samego kosztownego porównania transportu wszystkich sklepów, którego wynik nie służy do tego wyboru.

## Zmiana

Opcjonalne includeStoreChoices pozwala w jednym żądaniu wybranego sklepu otrzymać pomocnicze storeChoiceComparison: ceny materiałów, dostępność, braki i pełne alternatywy obliczone z tego samego snapshotu katalogu. Backend nie wywołuje dla nich wyceny transportu. Główna wycena zachowuje wybrany sklep, ilości, grosze i potwierdzone dostawy. Dodatkowe dane nie stają się koszykiem do zakupu ani historią cen widzianych w wybranym sklepie.

Wybór innego sklepu, najtańszego zestawu, odbioru, odświeżenie i anulowanie starszej odpowiedzi pozostają wymagane. Starszy serwer bez opcjonalnego pola zachowuje ograniczony fallback dwóch żądań. Nie zmieniamy cen, dat obserwacji, katalogu, seed, opakowań lub wymagań projektu.

Kontrolowany test HTTP używa oryginalnej wyceny Decowant z 03:54:14.037 UTC i zegara 03:58:00 UTC, bez odnowienia dat i bez sieci sklepów. Porównuje główny wynik z dotychczasowym kontraktem, pomocnicze dane z niezależną pełną wyceną materiałów i potwierdza brak wycen innych sprzedawców. Siedem testów klienta obejmuje jeden request, odświeżanie, brak potrzeby nowych alternatyw, zgodność ze starszym API, anulowanie, obcy sklep i izolację historii cen.

Artefakty G:/Projekty/asystent-remontu-work/wave192-20261102. Do ukończenia walidacja, rzeczywiste zmiany sklepu w UI, pomiar liczby żądań, publikacja oraz publiczny dowód. Nie traktować pojedynczej poprawki jako końca ciągłego celu.
