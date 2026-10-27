# Tapetowanie: dokładny model, cięcie pasów i wspólny koszyk

Stan na 2026-10-27. Dodano jeden nowy produkt i jedną ofertę istniejącego sklepu, z rzeczywistym zdjęciem. Nie jest to ukończenie całego katalogu.

## Produkt i zakres zastosowania

Erismann RollOver 3333-5, EAN 4002790333357: biała, gładka flizelina podkładowa 150 g/m², rolka 0,75 × 25 m, bez pasowania wzoru. To podłoże do dalszego malowania lub tapetowania. Farba/dekoracyjna tapeta, narzędzia i robocizna są osobnymi pozycjami prac.

- Producent, dokładny numer i wymiary: https://www.erismann.de/en/collection/rollover-27
- Producent, docinanie pasów: https://www.erismann.de/en/service/wallpapering-tips
- Zweryfikowana oferta Plejady: https://plejadatapet.pl/pl/p/Gladka-tapeta-flizelinowa-150gm2-25m-0%2C75m-3333-5-Erismann-RollOver/23972
- Niezależne powiązanie EAN i rozmiaru: https://www.hartman.fi/fi/hc34

Natywne dane sklepu wiążą produkt 23972, stock 24027, SKU ER 3333-5, EAN, opakowanie „szt.” i opis 25,00 m × 0,75 m. Cena 227,90 zł brutto dotyczy całej rolki; nie m². Zdjęcie HTTP 200 image/jpeg. Zachowano 196 wcześniejszych obserwacji bez zmiany dat; dopisano jedną (197 łącznie). Odbiór w Plejadzie wymaga indywidualnego potwierdzenia.

Nie dodano kandydatów o sprzecznych wymiarach ani tapet z raportem 64/32 cm jako produktów bez pasowania. W szczególności wcześniejszy konflikt 100/106 cm dla AS 2000-13 pozostaje nierozstrzygnięty.

## Ilości i istniejące projekty

Użytkownik jawnie wybiera model, wysokość, szerokości do czterech ścian oraz naddatek na docinanie (domyślnie 10 cm). Bez modelu lub wymiarów pozycja pozostaje niewyceniona. Każdą ścianę zaokrąglamy do pełnych pasów o szerokości 75 cm. Otwory nie skracają pełnych pasów; powierzchnia netto nie może przekraczać wynikającej z wymiarów powierzchni brutto. Inne wysokości można rozdzielić na prace i połączyć w koszyku.

Wspólny kalkulator używa całkowitych milimetrów i rzeczywistych długości pasów. Łączy pasy z wielu prac tego samego dokładnego produktu. Nie dzieli tylko sumy powierzchni przez powierzchnię rolki ani nie sumuje niezależnych zaokrągleń małych ścian. Dwie ściany 3 × 2,5 m, po 10 cm naddatku, dają 8 pasów po 2,6 m: jedna rolka, 4,2 m pozostałych odcinków.

Plan startuje od wykonalnego układu. Dokładne szukanie lepszego układu ma limit 80 pasów, 10 różnych długości i 50 tys. węzłów. Jeśli minimum nie zostało udowodnione, API zwraca optimal:false, a UI ostrzega o możliwości lepszego cięcia. Łączny limit wejścia to 100 ścian i 2000 pasów. Po przekroczeniu limitu wspólnego planowania system zachowuje bezpieczną sumę osobnych ilości; nie obiecuje globalnego minimum.

Nowy model wallpaper-rolls-v1 zachowuje kontrolę kleju, taśmy i gruntu. Papierowy klej Normal nie dostaje automatycznie zgodności z tą flizeliną. Stare projekty wymagają wyboru i potwierdzenia ilości. Ręcznie zmieniona liczba rolek odłącza nieaktualny plan cięcia; dodatkowe ręczne rolki pozostają dodatkowymi zakupami. ID prac, obmiarów i migracje 001–014 pozostają zachowane.

## Rzeczywiste koszyki i dostawy

Lokalny skompilowany serwis i wdrożony backend przeszły osiem rzeczywistych przypadków HTTP z natywnymi koszykami sklepów. Kod 00-001 jest kodem kontrolnym, nie lokalizacją użytkownika. W poniższych wycenach transport pochodzi z krajowych taryf PL odczytanych dla koszyka, a nie z taryfy zależnej od konkretnego kodu.

| Zakup do dwóch ścian | Materiały | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Jedna wspólna rolka, Plejada | 227,90 zł | 21,90 zł | 249,80 zł |
| Rolka + Direct 200 g, Plejada | 259,80 zł | 21,90 zł | 281,70 zł |
| Rolka, klej, grunt 5 l, taśma 50 m | 315,71 zł | 57,40 zł | 373,11 zł |

Pełny wariant podkładowej flizeliny dzieli zakupy na Plejadę (281,70 zł z dostawą), Rab-Dom (22,49 zł) i Realbud (68,92 zł). To najtańszy zestaw spośród potwierdzonych wycen dostawy. Koszt części alternatywnych dostaw pozostaje nieznany, więc nie twierdzimy, że jest to globalnie najtańsza oferta wszystkich sklepów. UI wyświetla to ograniczenie oraz podstawę krajowej taryfy przy sklepach.

Brak wymiarów, niewybrany model i niezgodny papierowy klej pozostawiają brakującą pozycję i nie generują pełnej sumy. Wybór samej Plejady dla dwóch pełnych prac daje 4 niewycenione wiersze, Świata Się Klei 6; są to wiersze dwóch etapów, nie liczby unikalnych SKU.

## Odbiór techniczny i UI

- 667 testów kalkulatora/rdzenia/API oraz 1054 testy współdzielonego backendu: PASS, 0 pominiętych.
- Typecheck biblioteki, mobile i API przeszedł. Po końcowej poprawce widoczności objaśnienia cięcia przeszedł ponownie typecheck mobile.
- 66 historycznych ID prac i trzy negatywne mutacje walidatora: PASS.
- PR https://github.com/jakatora/przetargai/pull/63 scalony do 11732be510489b007ac820097fb3bd78e075d8ed. Repozytorium nie zgłasza workflow/checków CI; nie jest to deklaracja zielonego CI.
- Railway 457eb00e-ce0a-4b84-a222-9302d278bd9f: SUCCESS 2026-10-27T15:00:56.774Z. Wszystkie 148 plików wdrożenia mają SHA zgodne z przejrzanym wydaniem. 146 plików innych usług zachowanych, zmieniono tylko bundle remontu i jego seed. Końcowe zmiany UI nie zmieniły bundle backendu.
- UI na localhost:8082: dwa własne projekty „Test tapetowania — ściana 1” (proj_mvqqwfr7dc4ee0yxk) i „Test tapetowania — ściana 2” (proj_mvqthwes1wtz1wsml), po 7,5 m². Wspólny koszyk rzeczywiście pokazuje 373,11 zł, jedną rolkę, jedno opakowanie kleju, fotografie i 8 pasów. Utworzono jeden nowy projekt QA; inne projekty nie były edytowane.
- Pierwszy odbiór UI ujawnił, że objaśnienie cięcia ukrywało się przy gotowym planie dostawy. Przeniesiono je również pod podsumowanie planu i potwierdzono w działającym UI.
- Przed testem zapisano trzy wcześniejsze zaznaczone prace i ustawienia. Po teście przywrócono wszystkie trzy prace, Standard, dostawę do domu, osobne zamówienia oraz poprzedni kod 00-001. Ponowne wczytanie strony potwierdziło zachowanie wyborów. Dodatkowe produkty koszyka nie były zmieniane.

Dowody robocze: catalog-wave62-production-proof.json, catalog-wave62-deployed-files-proof.json, catalog-wave62-current-audit-proof.json oraz catalog62-basket-confirmed-ax.txt w katalogu roboczym zadania. Zdjęcia ekranu catalog62-koszyk-tapetowanie-20261027.png i catalog62-wspolne-ciecie-20261027.png.

## Ile pozostało

Świeży audyt produkcyjny: 154 wpisy katalogowe, 130 produktów z aktywnymi ofertami, 176 aktywnych ofert, 197 zarejestrowanych źródeł, 50 zarejestrowanych sklepów (47 aktywnych). 154 produkty referencyjne mają przypisane zdjęcie; tabela zdjęć ma 155 wpisów, ponieważ jeden produkt ma więcej niż jedno źródło fotografii. 24 wcześniejsze braki katalogowe nadal obejmują 18 wygasłych weryfikacji oraz 6 pozycji wymagających uzupełnienia.

Ponowne przeliczenie tych samych 65 zapisanych zestawów obmiarów: 84 z 240 wierszy wycenionych, 156 niewycenionych; 70 bez kompletnego zapytania, 80 bez dopasowanego produktu, 6 bez aktualnej oferty. 8 scenariuszy ma pełną wycenę materiałów. Brakujących wyborów w dawnych danych nie uzupełniono arbitralnie. Nowy jawny wariant dwóch ścian jest osobnym dowodem kompletnej receptury i transportu.

24 wpisów i 156 wierszy nie należy dodawać: zakresy nakładają się, a wiersze powtarzają materiały. Pozostają kolejne modele i receptury, pełniejsze dostawy (m.in. Leroy Merlin/Marbet) i rzeczywiste ceny oraz stany najbliższych placówek. Goal pozostaje ACTIVE.
