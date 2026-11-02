# Łączenie potwierdzonych koszyków sklepów — 2026-11-02

Status: opublikowane i sprawdzone publicznie 2026-11-02. To postęp w ciągłym celu rozwoju aplikacji, nie zakończenie całego celu.

## Dowód problemu

Historyczne dane wave189-sewera-20261102: 16 wymagań / 15 grup produktów, wynik 3340,43 zł. Z rzeczywistych, wówczas ważnych koszyków można było złożyć identyczne zakupy za 3296,81 zł. Odtworzenie starego kodu w izolowanym procesie, z zegarem 2026-11-02 02:31:00 UTC i oryginalnymi datami: wynik 334043 gr, 80 wywołań kontrolowanego quoter-a. Pełny WinBud został wyceniony, ale nie połączony z tanimi pozostałymi sklepami. RED: red-historical.log i historical-baseline.json.

Fixture zawiera wybrane rzeczywiste obserwacje i wyceny z wcześniejszego odczytu, a nie bieżące ceny. Sześć prób odświeżenia cen zostało odrzuconych stubem; nie wysłano żadnego zapytania do sklepu i nie wytworzono nowej daty rzeczywistej wyceny. Nie traktować kontrolowanego replay jako dowodu aktualnych cen.

## Zasada zmiany

Ograniczone wyszukiwanie może połączyć już potwierdzone, pełne koszyki różnych sklepów. Nie przenosi kosztu dostawy na inne produkty lub ilości i wybiera co najwyżej jeden koszyk danego sklepu. Liczby fizycznych produktów, rozmiary i cięcia muszą odpowiadać oryginalnej pełnej alokacji. Nadal obowiązują stock, minimum, wielokrotność, zablokowane rozmiary i brak niepotrzebnych opakowań. Nie wykonuje dodatkowych zapytań do sklepu. CPU ma osobne granice stanów, operacji i pamięci. Zachowuje dotychczasowe poprawne warianty oraz wariant z mniejszą liczbą sklepów.

Wspólna reguła pokrycia i nieredukowalności opakowań została wyodrębniona z dotychczasowego mixedPackagePlans. Ta funkcja jest używana także przez lokalny kalkulator V33, dlatego wymagane są regresje mobile i opublikowanie zgodnych zasobów WWW. Nie zmieniono zużycia, produktów, GTIN, stawek ani dat.

Artefakty: G:/Projekty/asystent-remontu-work/wave190-20261102. Cel całej aplikacji pozostaje aktywny; ta poprawka nie dowodzi globalnego minimum wszystkich sklepów.

## Wynik i zachowane ograniczenia

Kontrolowany GREEN: 3294,99 zł zamiast 3340,43 zł, oszczędność 45,44 zł, nadal 80 wywołań kontrolowanego quoter-a. Te same oryginalne obserwacje, ilości i daty; bez nowego zapytania do sklepu. `historical-baseline.json` pochodzi ponownie z zachowanego starego pliku wykonywalnego, a `historical-candidate.json` z nowej wersji. Pierwszy helper nadpisał wynik baseline kandydatem; naprawiono sposób zapisu dowodów i odtworzono baseline, bez ręcznej zmiany wyników.

Nowy kod łączy pełne, nadal ważne wyceny sklepów. Nie przenosi stawki na inny koszyk, nie dodaje dwóch różnych koszyków jednego sklepu i nie zamienia nieznanej dostawy na zero. Kwoty są całkowitymi groszami z rzeczywistych odpowiedzi. Zachowane rozmiary i geometria cięć, dostępność, minimum, wielokrotności oraz wymagania dla zablokowanych opakowań. CPU: do 100 000 stanów i 2 000 000 kroków; pamięć kluczy memo ograniczona. Wynik pozostaje najlepszym znalezionym w ograniczonym porównaniu.

## Walidacja lokalna i rzeczywisty HTTP

554 mobile / 237 pricing / 154 API lib / 159 adapters / 1064 shared, typy API/mobile i 66 legacy jobs: PASS, bez fail/skip. Grupy częściowo się pokrywają, nie sumować jako unikalnych testów. Nowe testy obejmują niezależny wyczerpujący oracle dla 20 przykładów, wygaśnięcie, obcy kod pocztowy, stock i minimum, ponad 32 sklepy, cięcia oraz kontrolowany HTTP pełnego remontu. GitHub zwrócił puste statusy, więc nie jest to deklaracja zielonego CI.

Lokalnie i publicznie: 15 scenariuszy rzeczywistego API oraz 38 UI (16 opakowań Woder, 8 całego remontu, 8 PEX, 6 mniej sklepów). Import i eksport kopii zachowują 16 potrzeb oraz jawny wybór modelu/opakowania; serwer konsoliduje je do 15 produktów, łącząc dwa zapotrzebowania CT17 Transparent. Sprawdzone fotografie rzeczywistych wiader, widoki 320/390 px, klawiatura, kopiowanie linków i sumy, nawigacja oraz reload. Publiczne UI: zero błędów stron i odpowiedzi 429.

Pierwsza lokalna próba „Mniej sklepów” nie przeszła: start ze starszych obserwacji seed dał 152 aktywne produkty i komunikat `price_changed` dla Lobo, bez pełnego planu. Zachowano `local-fewer-attempt-r1.json` i diagnostykę katalogu. Powtórzenie na rzeczywistym cache cen pobranym z produkcji, bez zmiany dat i bez dostaw w cache: PASS 6/6; audyt 212 produktów / 317 ofert. Własne serwery PID 16988 i 11416 zatrzymano, wszystkie przeglądarki QA zamknięto. Projektów użytkownika na localhost:8082 nie modyfikowano.

Publiczne przykłady z konkretnych chwil testu, nie prognoza cen ani oszczędność prawdziwego klienta:

- 7 kg Woder: stałe 15 kg 294,90 zł, świadomy dobór 5 + 2 kg 170,80 zł.
- Native pełnego remontu: stałe opakowanie 3357,37 zł (2815,37 materiały + 542,00 dostawy, 8 sklepów); dobór opakowań 3266,84 zł (2703,84 + 563,00, 9 sklepów). Pozostałe wymagania i wspólne ceny wybranych ofert nie zmieniły się.
- Osobny publiczny import pełnego koszyka przez UI: 3294,99 zł (2792,19 + 502,80), 10 sklepów / 11 zamówień. Dwie wyceny dla kodu i osiem krajowych, jawne niepełne porównanie z powodu innego niepotwierdzonego koszyka Realbud. Różnych rzeczywistych wywołań nie porównywać jako kontrolowanego dowodu wpływu algorytmu.
- Wariant wygody: trzy potrzeby za 321,35 zł w trzech sklepach; świadomy wybór dwóch sklepów 432,04 zł. Dopłata i lista zamówień są widoczne.

## Publikacja i dane

Źródło runtime/WWW `9f03c209d05fe02e340fddab27d2a083b81e0539`. PR [172](https://github.com/jakatora/przetargai/pull/172), head `fc1a86dc81d0f62c4fc77a456349502743bb6680`, scalony jako `7a54faedb16cc5e6b58aea7c8d778a72e45b076a` z kontrolą head SHA.

API Railway `61bf0d16-c942-4067-8746-8e8fd8d1e28f` SUCCESS 03:22:31.297 UTC; WWW `f48e20b2-a5e5-45c6-9cd9-a82d645b44c2` SUCCESS 03:26:35.689 UTC. Rzeczywisty snapshot po wdrożeniu: 150 zgodnych plików, jedyna zmiana `remont-pricing.cjs`, SHA256 `4cde9f70c1def811a3197b69a2a4cb8fff406e9664268385df0f26988bfba81f`. Pozostałe 149 plików i seed 356 obserwacji zachowane bajtowo. Bez nowych produktów, migracji, zależności i płatności; pozostałe aplikacje współdzielonego backendu zachowane.

WWW: wszystkie 63 zasoby sprawdzone SHA256, 17 293 730 B, 77 wartości vaulta bez wycieku. Dziewięć plików hostingu/relay bajtowo niezmienionych. Trasy aplikacji i dokumentów HTTP 200, prywatne pliki 404, anonimowy POST do relay 401. Audyt publiczny: 244 referencje, 212 potwierdzonych, 317 ofert, 32 dawne braki, cztery tożsamości merchant SKU, zero fałszywych potwierdzeń.

Końcowy `final-proof.json` z 03:30:41.464 UTC potwierdza 470 wystąpień nadal ważnych wycen w zapisanych publicznych odpowiedziach. Daty nie zostały zmienione. Pierwszy agregator porównywał datę serwera z lokalnym czasem zapisu pliku: ostatnia pomocnicza wycena była o 133 ms późniejsza. Zachowano ten diagnostyczny wynik; końcowy dowód stosuje wspólny rzeczywisty czas końcowej weryfikacji, bez przedłużania ważności wycen. Dowód nie oznacza ich ważności w przyszłości.

Cache przed publikacją: 354 obserwacje / 11 233 punkty historii; po wszystkich próbach: 354 / 11 578. Zachowane 11 230 starych punktów, trzy poprawnie usunięte przez istniejącą retencję 60 na ofertę. Stan historii dokładnie odtworzony rzeczywistą klasą aplikacji. Sześć kontrolowanych nowych wcześniej ofert ma rzeczywistą zmianę 0 gr, bez wymyślonej podwyżki, obniżki lub promocji.

## Dalszy rozwój

Priorytet: domykać 32 braki potrzebne do rzeczywistych zadań, pełny zgodny system hydroizolacji, stabilne dane oraz dostawy Castoramy/OBI, szybkość i koszt ukończonej wyceny. Dalej pilotaż trzech scenariuszy i pomiar rzeczywistych zakupów. Programy afiliacyjne ponownie sprawdzone w źródłach 2026-11-02; ich obecność nie jest akceptacją aplikacji ani dostępem do wycen transportu. Prowizja nie może zmieniać rankingu. Nie uruchomiono płatności, reklam ani kontaktów z osobami trzecimi. Ciągły cel pozostaje ACTIVE.
