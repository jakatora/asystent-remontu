# Jeden brakujący produkt dla wielu prac — 2026-10-26

Problem potwierdzony podczas używania aplikacji: po wybraniu Sewery ten sam grunt Knauf 5 l pojawiał się dwukrotnie jako brakujący, ponieważ pochodził z dwóch prac. Liczba wierszy nie odpowiadała liczbie różnych produktów do znalezienia. Kupujący nie widział też łącznej potrzebnej ilości.

Teraz karta pokazuje **jeden brakujący produkt, łącznie 8,2 l z dwóch prac**. Liczniki w ostrzeżeniu, sekcji dostaw i liście braków używają tej samej liczby. Przy wyborze Sewery kwota **539,53 zł za dostępną część (4 z 5 produktów)** pozostaje bez zmian. Nie przedstawiamy jej jako kosztu pełnego zestawu.

## Granice łączenia

`groupUnpricedLines` służy wyłącznie prezentacji. Łączy dokładną tożsamość katalogową lub jednoznaczny kod, zgodną jednostkę, dodatnią znaną ilość i ten sam obsługiwany powód braku. Dodaje ilości z precyzją kalkulatora i liczbę prac. Nie oblicza ceny ani opakowań. Nie mutuje odpowiedzi serwera, obmiarów, kosztów, ofert lub danych użytkownika.

Nie łączy różnych EAN/GTIN, sprzecznych kodów, kategorii lub jednostek. Przy nieznanym produkcie nie zgaduje na podstawie ogólnej nazwy. Nie skleja niewystarczającego zapasu z brakiem oferty ani pozycji o nieznanej ilości. Nierozpoznane pozycje nadal pozostają widoczne. `partial` i `best:null` pozostają stanami serwera; mniejsza liczba kart nie tworzy pełnego kosztu.

Łączna ilość jest prezentowana do ośmiu miejsc po przecinku, bez przedwczesnego zaokrąglenia małego dodatniego zapotrzebowania do zera. Liczba prac odnosi się do odrębnych etapów odpowiedzi, a nie do różnych nazw jobów.

## Weryfikacja

- **465 bieżących testów core/kalkulator/pricing/API PASS, 0 skip**. Pięć nowych testów sprawdza sumowanie i niezmienność odpowiedzi, dwa wpisy w jednej pracy, rozdzielenie różnych tożsamości/jednostek/powodów, dokładne dopasowanie katalogowe oraz ułamki. Testy korzystają z tej samej funkcji co UI.
- Mobile typecheck PASS. Wspólny backend nie został zmieniony ani ponownie wdrożony. Jego **1054 testy PASS** z wcześniejszej części tej tury (wave34) nie były powtarzane dla samej zmiany prezentacji. Łącznie aktualny core i sprawdzony niezmieniony backend to 1519 testów; nie sumować wcześniejszych powtórzeń.
- Rzeczywisty HTTP produkcji, 2026-10-26T20:55:17.091Z: serwer zwraca dwa brakujące wiersze, `partial`, `best:null` i 53953 gr dostępnych materiałów. Grupowanie daje jedną pozycję 8,2 l z dwóch prac. Porównanie pełnego JSON przed/po potwierdza brak mutacji. Kod EAN pochodzi z dokładnie rozpoznanej referencji; nie wpisujemy go do oryginalnego `query.ean`, które w tej odpowiedzi jest null.
- Prawdziwy UI w przeglądarce: wybór Sewery, jeden brak w trzech miejscach, jedna karta Knaufa z 8,2 l i dwiema pracami. Po pełnym reloadzie wynik zachowany. Przywrócono „Najtańszy zestaw”; stan kontrolny 3 prace, Standard, 1 posiadana pozycja, 00-001, shipping, bez dodatków/sklepu, **637,43+153,40=790,83 zł**. Bez tworzenia/usuwania projektów, zakupów lub zmiany obmiarów.

Przy końcowej walidacji poprawiono również metadane źródeł zdjęć krzyżyków: `sourceUrl` wskazuje kartę dostarczającą rzeczywiste zdjęcie woreczka, a `identitySourceUrl` dokładny produkt Sewery ze zweryfikowanym EAN. Wcześniejsze odwrócenie tych ról dla zdjęcia z Plus-Market wykrył test powiązania katalogu ze źródłem. Zachowano ten test bez osłabienia; po korekcie wszystkie 465 testów przechodzi. URL-e samych zdjęć, ceny i obserwacje sklepu nie zostały zmienione w tej poprawce.

Dowody w katalogu rozmowy: `work/catalog-wave35-http-proof.json`, `work/catalog-wave35-core-tests.log`, `outputs/catalog35-sewera-one-missing-20261026.txt`, `outputs/catalog35-one-missing-reloaded-20261026.txt`, `outputs/catalog35-one-missing-after-20261026.png`, `outputs/catalog35-basket-restored-20261026.txt`. Stan przed zmianą: `outputs/catalog34-duplicate-unpriced-before-20261026.png`. Kontrola wizualna dotyczyła przeglądarki desktop; nie deklarujemy nowego testu binarki iOS/Android.

## Dalsza praca

Cel użytkownika pozostaje aktywny i obejmuje pełne uzupełnienie produktów, rzeczywisty koszt potrzebnego zestawu w wybranym sklepie, dostawę/pobliskie zakupy oraz łatwą obsługę. Ta poprawka usuwa konkretną przeszkodę w zrozumieniu koszyka. Nie rozwiązuje jeszcze dostaw Castoramy/OBI, sześciu historycznych braków ani całej zgodności zestawów montażowych. Kolejny kierunek UX: krótsze podsumowanie porównania sklepów i mniej szczegółów naraz, przy zachowaniu jasnego rozróżnienia pełnej i częściowej wyceny.
