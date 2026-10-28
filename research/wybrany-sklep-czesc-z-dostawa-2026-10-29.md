# Koszt dostępnej części zakupów w wybranym sklepie

Wdrożenie rozpoczęte 2026-10-28, kontrola UI zakończona 2026-10-29 czasu Europe/Warsaw. Wave74 jest postępem aktywnego celu; nie kończy uzupełniania katalogu i receptur.

## Zmiana dla użytkownika

Gdy wybrany sklep ma tylko część materiałów, aplikacja pokazywała dotąd ich cenę bez transportu. Teraz pokazuje osobną kartę „Dostępna część zakupów”: materiały, dostawę tej części i sumę do zapłaty. Braki są nadal widoczne. Część nie staje się ceną całego remontu ani najtańszym pełnym zestawem.

Ta sama informacja jest dostępna w zakładce porównania, we wspólnym koszyku oraz w podsumowaniu pojedynczego projektu. Po zmianie sklepu, trybu lub kodu poprzednia wycena nie przechodzi na inny wybór. Niepełny kod usuwa wycenę dostawy. Termin ważności wymusza ponowne sprawdzenie.

## Potwierdzone przykłady

Dwa własne projekty QA z wave71/73: po 10 m², Goldband 15 mm, zapas 10%, siatka 2 i 3 m²; pierwszy pokój ma Betokontakt, drugi Grundiermittel 60. Nie kupują narożników. Kod testowy 00-001.

| Wybrany sklep | Produkty dostępne w tej części | Materiały brutto | Ich dostawa | Razem za tę część | Pozostałe produkty |
| --- | ---: | ---: | ---: | ---: | ---: |
| BMB Technologie | 1 (Grundiermittel 60) | 198,99 zł | 308,00 zł | **506,99 zł** | 3 |
| LiderzyCen | 1 (12 worków Goldband) | 364,56 zł | 230,00 zł | **594,56 zł** | 3 |
| Realbud | 2 (Betokontakt i Profix) | 293,79 zł | 25,00 zł | **318,79 zł** | 2 |

To różne części zakupów, więc ich kwot nie należy traktować jako rankingu ceny tego samego pełnego zestawu. Dostawy są aktualnymi potwierdzonymi taryfami krajowymi PL. BMB obejmuje przewóz 210 zł oraz obowiązkową paletę KN-WO 98 zł. Kod pocztowy nie zmienia tych taryf w indywidualną wycenę adresu.

Po powrocie do wszystkich sklepów pełny wskazany zestaw nadal kosztuje **857,34 zł materiałów + 563 zł dostaw = 1 420,34 zł**. Kwoty nie obejmują innych materiałów poza wybranym scenariuszem, narzędzi ani robocizny.

## Zasady liczenia

- Nowy `compareDeliveryWithAvailablePart` najpierw wykonuje dotychczasowe porównanie całego zestawu. Tylko przy jawnie wybranym sklepie, niepełnym zestawie, automatycznej dostawie i poprawnym kodzie próbuje osobno wycenić dostępną część.
- API dodaje `availablePart`; pełne `status: partial`, `best: null`, `lowerBound: null` oraz puste alternatywy pozostają bez zmian. Starszy klient może zignorować nowe pole.
- Ilości tego samego produktu są sumowane ze wszystkich pokojów przed doborem opakowań. Produkt musi mieć zapas na całe wymagane zapotrzebowanie. Nie redukujemy go do dostępnej liczby sztuk i nie pomijamy pokoju z nierozpoznaną pozycją tego samego EAN lub tej samej dokładnej nazwy i kategorii.
- Nowo ujawniony limit zapasu z koszyka sklepu unieważnia wycenę części. Pozostaje informacja o niewystarczającym zapasie. Nie zastępujemy tego fikcyjnym bezpłatnym transportem.
- Nie zmieniono zachowania pełnych zestawów, odbioru, ręcznych stawek, pustego kodu i nieznanych sklepów. Wyceny pochodzą z tych samych adapterów rzeczywistych koszyków, z minimalnymi partiami, opłatami i istniejącym limitem zewnętrznych żądań.
- Mobile sprawdza wybrany sklep, zakres kodu, pakiety, sumy brutto i aktualność. Kwota części nigdy nie jest kopiowana do pełnego `totalGrosze` w podsumowaniu projektu.
- Test produkcyjny wykrył ukrywanie świeżej wyceny przez niewielką różnicę zegarów klienta i serwera. Kontrola dopuszcza maksymalnie 5 sekund przyszłego znacznika sprawdzenia, wymaga oryginalnego okresu ważności do 10 minut i nie przedłuża `expiresAt`. Przyszłość poza tolerancją, wygasła wycena i niespójne kwoty są odrzucane.
- Ogólny komunikat o pozostałych sklepach mówi teraz także o niedostatecznej ilości, zamiast sugerować, że każda niewyceniona oferta może pokryć zakup taniej.

## Dowód wykonania

- 742 testy kalkulatora, cen i adapterów oraz 1054 istniejące testy współdzielonego backendu: zero błędów, pominięć i anulowań. W tym 11 nowych testów, rozszerzone testy Express dla wyboru Sewery i koszyka BMB oraz regresje sumy zapasu między pokojami i różnicy zegarów.
- Build deklaracji pricing-service i typecheck mobile/API poprawne. Kontrola historycznych ID z negatywnymi mutacjami również poprawna.
- 10 rzeczywistych produkcyjnych żądań HTTP: BMB, LiderzyCen, Realbud, nieznany sklep, za mały zapas Krasny, brak kodu, odbiór, zmieniony kod, nieznana wydajność i pełny zestaw. Klient poprawnie interpretuje produkcyjne dane części jako `partial`, bez pełnej sumy.
- Native UI w browser2/tab11: trzy wybrane sklepy i powyższe kwoty, lista braków, wycofanie wyceny po niepełnym kodzie i ponowienie dla 42-209, powrót do 00-001, poprawna karta podsumowania jednego projektu. Brak tworzenia i edycji projektów; testowano tylko ustawienia porównania i nawigację. Przywrócono najtańszy pełny zestaw.
- Zrzut nowej karty: `work/catalog-wave74-czesc-bmb.jpg` w katalogu pomocniczym. Nie wykorzystano zrzutu z poprzedniej wersji jako dowodu tej zmiany.
- [PR 74](https://github.com/jakatora/przetargai/pull/74) scalony: `8d11ae55279d2703986393d8f0fd4adb1102a6ad`, head `9ba765379ea385ecbb08a8e9d218ac4d2d05c81f`. Brak uruchomień GitHub Actions; wymienione testy wykonano lokalnie.
- Railway `7227f778-c61e-439b-8d29-481f4e54b4e8`: SUCCESS 2026-10-28T22:55:54.150Z. Wszystkie 148 plików produkcji pasują do przygotowanego wydania przy kontroli 22:57:08.912Z. Zmienił się tylko bundle API; zachowano wszystkie 215 obserwacji oraz 147 innych plików. Poprawka tolerancji zegara dotyczy wyłącznie mobile i nie wymagała ponownego wdrożenia backendu.

Katalog bez zmian w tej iteracji: 170 referencji, 163 z aktywną ofertą, 209 ofert, 49 aktywnych kanałów sklepowych. Nadal pozostają 7 wcześniejszych dokładnych referencji i 167 wymagań z audytowanych scenariuszy. Te 167 pozycji nie jest liczbą unikalnych produktów. Następny kierunek: kolejne konkretne materiały i warianty zgodne z zastosowaniem, konkurencyjne oferty oraz potwierdzone dane odbioru i transportu. Cel pozostaje aktywny.
