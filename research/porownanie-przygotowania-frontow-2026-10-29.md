# Porównanie środków i kosztu całego zestawu przed wyborem

29 października 2026, wave86. Użytkownik od razu widzi dwa warianty przygotowania frontów: Anser i Chem-Rozlew 500 ml, ze zdjęciami, kosztem wszystkich pozostałych materiałów i faktyczną dostawą. Nie musi zapisywać kolejnych marek w obmiarach, żeby porównać kwoty. Przycisk wybranego wariantu zapisuje tylko tę decyzję w istniejącym projekcie; sam podgląd nie zmienia projektu.

## Zachowane potrzeby użytkownika

Alternatywy powstają z tego samego aktualnego kalkulatora. Zachowują zmierzoną powierzchnię, podłoże, warstwy, wydajność i zapas farby, wybrany rozmiar lub automatyczną rodzinę puszek, liczbę arkuszy i butelek. Nie obejmują nieznanego przygotowania ani posiadanych wszystkich środków jako powodu do dokupywania benzyny. Odpowiedni detergent musi już być jawnie potwierdzony w istniejącej opcji zakupu benzyny. Zastosowanie według [V33 FAQ](https://www.v33.pl/faq/) i [Chem-Rozlew](https://www.chem-rozlew.com/benzyna-ekstrakcyjna/) pozostaje takie samo jak w wave85.

Każdy wariant zachowuje własny dokładny produkt i EAN. Wycena uwzględnia Mam/Kupione, ręcznie dodane pozycje, kod pocztowy użytkownika, preferencję osobnych zamówień i wybrany sklep. Nie odrzuca dodatkowego nieuzgodnionego materiału po to, aby przedstawić sumę jako kompletną. Oznaczenie posiadanego Ansera nie usuwa zakupu Chem-Rozlew. Odwrotnie, wykorzystanie odpowiedniego posiadanego środka może być najtańsze.

## Wartości z działającego serwera

Podstawowy zestaw: 10 m² frontów ze stabilną powłoką, dwie warstwy po 12 m²/l, 10% zapasu, cztery P240 i jedna butelka 500 ml; odpowiedni detergent już posiadany. Farba V33 biały satyna z automatycznym doborem puszek.

| Wariant | Materiały brutto | Dostawy | Razem |
|---|---:|---:|---:|
| Anser, wszystko wskazane do kupienia | 193,13 zł | 135,50 zł | 328,63 zł |
| Chem-Rozlew, wszystko wskazane do kupienia | 190,14 zł | 30,40 zł | 220,54 zł |
| Anser już posiadany, farba i papier do kupienia | 181,24 zł | 30,40 zł | 211,64 zł |

Różnica 108,09 zł dotyczy całego zestawu i dostaw, a nie historii ceny tego samego produktu. Porównanie oznacza tańszy z dwóch faktycznie wycenionych wariantów. Nie obiecuje najniższej ceny wszystkich produktów na rynku. Kiedy Anser jest posiadany, wariant 211,64 zł jest tańszy od zakupu Chem-Rozlew za 220,54 zł.

Dziesięć aktualnych wywołań produkcyjnego SDK dało siedem pełnych podglądów: oba warianty podstawowe, oba z posiadanym Anserem, dwa dla drugiego kodu 42-209 i preferencji jednego zamówienia w sklepie oraz Chem-Rozlew dla laminatu w wybranym Rab-Dom (194,68 zł). Rab-Dom nie ma wskazanego Ansera, więc jego podgląd pozostaje niepełny. Dodatkowy nieuzgodniony materiał blokuje pełną cenę obu wariantów. Podglądy wysyłane są osobno, nie jako koszyk kupujący równocześnie obie marki.

## Zapis i świeżość

Wybór zapisuje decyzję cabinetPreparation 2 lub 3 przez istniejącą ścieżkę zapisu z odczytem potwierdzającym. Aktualizuje równocześnie measurements i calculationResult, zachowując pozostałe dane projektu. Wspólny koszyk czyta tę samą decyzję. Zmiana powierzchni, liczby butelek, kodu, sklepu, zasad zamówień lub listy zakupów unieważnia starszy podgląd. Spóźniona odpowiedź nie zastępuje aktualnej. Przed zapisem ponownie sprawdzany jest identyfikator projektu, bieżący klucz obliczeń i ważność wyceny. Nie ponawiamy niepewnego zapisu automatycznie.

Wspólna walidacja pełnych wycen została wydzielona do deliveredKit.ts; dotychczasowe deliveredFloorKit pozostaje zgodnym aliasem. Sprawdza kompletność pozycji, właściwy kod i zasady osobnych zamówień, sumę brutto w całkowitych groszach, rzeczywiste wyceny sklepów i daty ważności. Dodatkowo podgląd frontów sprawdza identyczność zapytania, ilości, jednostki i dokładnego produktu. Przyszłe lub wygasłe daty nie są akceptowane. Przy bardzo świeżym znaczniku serwera do pięciu sekund przed zegarem urządzenia widok jedynie planuje ponowny odczyt po osiągnięciu tej chwili; nie zwiększa ważności ani nie dopuszcza ceny wcześniej. To samo odświeżenie wspiera istniejące gotowe zestawy podłogi.

## Walidacja i zakres

840 testów aplikacji i usługi: PASS, zero błędów i pominięć. Typecheck mobile: PASS. Dwa źródła HTTP 200 i 66 stabilnych ID: PASS. Testy obejmują rzeczywiste odpowiedzi brutto z wcześniejszej produkcji, pełne zapytania SDK z bieżącym serwerem, posiadane materiały, ręczne pozycje, inny produkt/ilość, wygasły podgląd, zapis i ponowny odczyt przez wspólny koszyk. Wyceny z fixture nie są używane jako ceny w aplikacji.

To zmiana interfejsu i logiki podglądu w mobile/Expo Web. Backend i katalog produktów nie są zmieniane ani ponownie wdrażane w wave86. Pozostaje wydanie PR85 / Railway bb6dbe1e-26f8-4583-8b79-60dd1b3e6c2f. Liczby katalogu zachowano: 179 referencji i zdjęć, 172 produkty z ofertą, 221 aktywnych ofert, 227 zarejestrowanych źródeł, 49 aktywnych kanałów. Nie oznacza to ukończenia wszystkich prac lub produktów. Ceny i dostępność odbioru w lokalnej placówce nadal wymagają potwierdzenia.

## Sprawdzenie interfejsu

Własny projekt proj_mvszta5sohgk4mlgj pokazał obok siebie dwa zdjęcia i ceny pełnego zestawu: Anser 328,63 zł oraz Chem-Rozlew 220,54 zł, z osobnymi materiałami i dostawami oraz różnicą 108,09 zł. Podgląd pozostawił bieżący wybór Chem-Rozlew. Przycisk wyboru Ansera potwierdził zapis, a przeładowanie strony pokazało 328,63 zł. Następnie przez to samo porównanie wybrano Chem-Rozlew; odczyt po przeładowaniu potwierdził 220,54 zł. Nie trzeba było przechodzić do edytora ani ponownie wpisywać obmiarów.

Zmiana kodu z 00-001 na 42-209 natychmiast usunęła wcześniejsze przyciski wyboru wycenionych wariantów. Przywrócono 00-001 i sprawdzono ceny ponownie przed zapisem. Sprawdzono też układ 390 × 844: karty jedna pod drugą, pełne nazwy, kwoty i przyciski w szerokości widoku. Usunięto zbędne rozciąganie wysokości kart na telefonie. Przywrócono domyślny rozmiar przeglądarki; w szerokim widoku karty są obok siebie. Zrzuty work/catalog-wave86-comparison.jpg i work/catalog-wave86-phone.jpg.

Kontrola dotyczy Expo Web na localhost:8082, nie fizycznych urządzeń Android/iOS. Pozostawiono projekt ze środkiem Chem-Rozlew i kodem 00-001. Nie zmieniano innych projektów ani wyboru prac wspólnego koszyka.
