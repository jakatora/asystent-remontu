# Ennis: dwa nowe kolory i rzeczywiste rozliczenie koszyka

Stan historyczny wave79: 29 października 2026. Opisuje brak dostawy kleju przed dodaniem odrębnego wyboru opakowania. Aktualna kompletna wycena jest w [raporcie ATLAS PLUS](./atlas-plus-standard-kompletny-koszyk-2026-10-29.md).

## Produkty i świadomy wybór

Dodano dwa odrębne warianty Paradyż U117: [Light Grey](https://modnalazienka.pl/u117-light-grey-gres-szkl-rekt-mat-598x598-34155), EAN 5904584158285, oraz [Light Beige](https://modnalazienka.pl/u117-light-beige-gres-szkl-rekt-mat-598x598-34162), EAN 5904584158247. Oba mają rzeczywiste zdjęcia, format 59,8 × 59,8 cm, grubość 8 mm, wykończenie matowe i gatunek 1. Paczka zawiera cztery płytki, 1,43 m². Karty sklepu potwierdzają 75,03 zł/m² i 107,29 zł/paczkę. Starsza cena z wyników wyszukiwania nie została użyta ani przedstawiona jako zmiana ceny.

[Producent — Light Grey](https://www.paradyz.com/pl/produkty/p39069-u117-light-grey-gres-szkl-rekt-mat-598x598-g1) i [Light Beige](https://www.paradyz.com/pl/produkty/p39162-u117-light-beige-gres-szkl-rekt-mat-598x598-g1) zaleca we wnętrzu spoinę minimum 1,5 mm. Aplikacja pokazuje tę informację. Przy 1 mm pozostawia fugę i krzyżyki do weryfikacji; przy 1,5 mm nie podmienia brakujących krzyżyków na 2 mm. Wybór nie zmienia samoczynnie obmiaru spoiny ani starego modelu Petro Grey G2. Nie potwierdzamy odbioru lokalnego bez sprawdzenia zapasu placówki.

## Ilości i koszty

Dla podłogi 10 m², zapasu 15% i spoiny 3 mm jawny wybór nowego koloru zachowuje 11,5 m² zapotrzebowania. Po połączeniu etapów dobiera paczki. Obecny przepis zestawu przelicza 47,3 kg ATLAS PLUS, około 1,457 kg białej fugi Atlas 001 i 56 krzyżyków 3 mm; grunt wynika z obmiaru i założonego zużycia. Zużycie kleju i fugi pozostaje założeniem kosztorysowym — należy sprawdzić metodę układania, podłoże i instrukcje produktów.

Rzeczywiste anonimowe koszyki Modnej Łazienki potwierdziły:

| Zakup samych płytek | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| 9 paczek jednego koloru, 12,87 m² | 965,63 zł | 229,00 zł | 1194,63 zł |
| 17 paczek jednego koloru dla dwóch pomieszczeń, 24,31 m² | 1823,98 zł | 229,00 zł | 2052,98 zł |
| Po 9 paczek obu kolorów | 1931,26 zł | 229,00 zł | 2160,26 zł |

Cena paczki jest zaokrąglona, dlatego proste mnożenie daje różnice odpowiednio 2, 5 i 4 gr. Adapter odczytuje dokładną wartość każdej pozycji i sprawdza jej zgodność z przedziałem precyzji niezależnie odczytanych cen paczki i m². Sprawdza również tożsamość, ilość paczek i m², stan, niezmienioną cenę karty, sumę koszyka, palety, dostawę do Polski i bezpłatną metodę przedpłaty. Rozbieżność poza tym zakresem odrzuca wycenę. Koszt materiałów w rankingu uwzględnia potwierdzoną różnicę; interfejs opisuje ją oddzielnie od dostawy. Po wygaśnięciu wyceny różnica nie zostaje w niepotwierdzonym planie.

Podział takich koszyków na osobne zamówienia pozostaje ograniczony: rozliczenie materiałów za m² nie jest addytywne. Zachowujemy sprawdzony wspólny koszyk i oznaczenie ograniczonego porównania. Mechanizm podziału innych koszyków, w tym Kronodomu, pozostaje dostępny.

## Pełny zestaw: pozostała luka

Wszystkie pięć materiałów podłogi ma ofertę. Dla kodu 00-001 sprawdzony plan zawiera materiały za 1232,95 zł oraz trzy potwierdzone dostawy za 266,89 zł. **Nie jest to pełna suma do zapłaty:** brakuje kosztu dostawy kleju ATLAS PLUS o EAN 5905400658866 z Castoramy. Aplikacja pokazuje brak potwierdzenia i nie wybiera zwycięzcy dla całego remontu. Dostawa Realbudu również nie była dostępna w tym wariancie; dla gruntu istnieje wyceniony wariant Rab-Dom.

ATLAS PLUS Podwójna Moc w Sewerze ma inny EAN 5905400488579. Nie wolno scalić go z promocyjnym opakowaniem Castoramy. Kolejny krok: odrębna weryfikacja produktu, zdjęcia, zużycia i dostawy oraz jawny wybór kompatybilnego kleju.

## Weryfikacja i wdrożenie

- 786 testów kalkulatorów, cen, koszyka i API; 1054 testy wspólnego backendu; zero błędów i pominięć. Kontrole TypeScript dla mobile, API i pricing-service zakończone poprawnie.
- 13 rzeczywistych prób produkcyjnego HTTP: oba kolory, dwa pomieszczenia i dwa kolory łącznie, drugi kod, wybrany sklep i część dostępna, stary model, spoina 1 i 1,5 mm. Cztery kompletne zakupy samych płytek mają potwierdzony transport. Pięć pełnych zestawów prawidłowo pozostaje bez zwycięzcy z powodu dostawy kleju.
- Natywny koszyk sklepu potwierdził 9 paczek / 12,87 m² / 965,63 zł + 229 zł. Widok aplikacji sprawdzono na własnym projekcie QA `proj_mvsurv5360t3o9ddl`.
- Backend: [PR 79](https://github.com/jakatora/przetargai/pull/79), doprecyzowanie większych koszyków [PR 80](https://github.com/jakatora/przetargai/pull/80). Ostateczny merge `070786c0164e7ba28af17f8e5197b74c1a88be36`. Railway `b9c0dcef-e0c0-47cd-aefc-9313f2947189` SUCCESS; wszystkie 148 plików zgodne z przygotowanym wydaniem. Zachowano 219 dawnych obserwacji, dodano dwie; doprecyzowanie zachowało wszystkie 221 obserwacji i 147 pozostałych plików.

Katalog: 174 pozycje ze zdjęciami, 167 z aktywnymi ofertami, 215 ofert, 221 zarejestrowanych źródeł, 49 aktywnych kanałów sklepów. Siedem historycznych modeli nadal bez oferty. Te same 65 historycznych map obmiaru daje 81/251 wycenionych wymagań; 170 braków to wymagania i decyzje, a nie 170 odrębnych produktów. Nowe kolory wymagają wyboru użytkownika, dlatego nie zmieniają automatycznie historycznych scenariuszy.
