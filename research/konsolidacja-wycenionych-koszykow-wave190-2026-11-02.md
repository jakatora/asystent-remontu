# Łączenie potwierdzonych koszyków sklepów — 2026-11-02

Status: kandydat w walidacji, jeszcze bez publikacji. Poprzednia tura celu przyniosła postęp: opublikowane nowe produkty/oferty i zapisany przypadek pomijanej oszczędności.

## Dowód problemu

Historyczne dane wave189-sewera-20261102: 16 wymagań / 15 grup produktów, wynik 3340,43 zł. Z rzeczywistych, wówczas ważnych koszyków można było złożyć identyczne zakupy za 3296,81 zł. Odtworzenie starego kodu w izolowanym procesie, z zegarem 2026-11-02 02:31:00 UTC i oryginalnymi datami: wynik 334043 gr, 80 wywołań kontrolowanego quoter-a. Pełny WinBud został wyceniony, ale nie połączony z tanimi pozostałymi sklepami. RED: red-historical.log i historical-baseline.json.

Fixture zawiera wybrane rzeczywiste obserwacje i wyceny z wcześniejszego odczytu, a nie bieżące ceny. Sześć prób odświeżenia cen zostało odrzuconych stubem; nie wysłano żadnego zapytania do sklepu i nie wytworzono nowej daty rzeczywistej wyceny. Nie traktować kontrolowanego replay jako dowodu aktualnych cen.

## Zasada zmiany

Ograniczone wyszukiwanie może połączyć już potwierdzone, pełne koszyki różnych sklepów. Nie przenosi kosztu dostawy na inne produkty lub ilości i wybiera co najwyżej jeden koszyk danego sklepu. Liczby fizycznych produktów, rozmiary i cięcia muszą odpowiadać oryginalnej pełnej alokacji. Nadal obowiązują stock, minimum, wielokrotność, zablokowane rozmiary i brak niepotrzebnych opakowań. Nie wykonuje dodatkowych zapytań do sklepu. CPU ma osobne granice stanów, operacji i pamięci. Zachowuje dotychczasowe poprawne warianty oraz wariant z mniejszą liczbą sklepów.

Wspólna reguła pokrycia i nieredukowalności opakowań została wyodrębniona z dotychczasowego mixedPackagePlans. Ta funkcja jest używana także przez lokalny kalkulator V33, dlatego wymagane są regresje mobile i opublikowanie zgodnych zasobów WWW. Nie zmieniono zużycia, produktów, GTIN, stawek ani dat.

Artefakty: G:/Projekty/asystent-remontu-work/wave190-20261102. Cel całej aplikacji pozostaje aktywny; ta poprawka nie dowodzi globalnego minimum wszystkich sklepów.
