# Podsumowanie dostaw i publiczne koszyki — wave187, 2026-11-02

Opublikowano prostszy ekran niepełnej wyceny remontu. Przy braku potwierdzonych opłat pokazuje „Dostawa: Brak wyceny”. Potwierdzona darmowa dostawa nadal jest kwotą 0,00 zł, a potwierdzona płatna część pozostaje oddzielona od brakujących opłat. Całkowita suma nie pojawia się przed potwierdzeniem wszystkich dostaw.

W trakcie weryfikacji ABUD odzyskał łączność z serwerem. Przeprowadzono dodatkowe rzeczywiste próby dostawy, zamiast wymuszać wcześniejszy stan awarii. Nie ustalono przyczyny odzyskania połączenia i nie deklaruje się jego trwałości. Kod prywatnego kanału sklepowego jest bajtowo taki sam jak w wave186.

## Zmiana interfejsu

- Materiały, brakujące dostawy i znana część opłat są na pierwszym planie. Długie wyjaśnienie jest dostępne przez „Jak wybrano plan zakupów”.
- Kontrolka ma minimum 48 px wysokości, obsługuje Enter i Space oraz przekazuje stan rozwinięcia. Zmiana planu lub kodu pocztowego zamyka szczegóły; samo ich rozwijanie nie uruchamia kolejnych wycen.
- W widoku 390 px sprawdzona karta ma 272 px wysokości, a przycisk kopiowania mieści się w ekranie 844 px. Sprawdzono też 320 px. Użyto istniejących fontów, kolorów i ikon.
- Kopiowana lista zachowuje nieznane opłaty, a kopia remontu przechowuje zapotrzebowanie zamiast ilości wynikającej z pełnych opakowań.
- Zachowano teksty PL/EN i dotychczasowe ukrycie przełącznika English. Rzeczywiste scenariusze użytkownika wykonano w domyślnym polskim interfejsie.

Zmiana obejmuje dwa pliki komponentów: nowy `PendingDeliverySummary.tsx` i zastąpienie dotychczasowej karty w `DeliveryComparisonSection.tsx`. Nie zmieniono algorytmu porównania, obliczeń opakowań ani reguł wycen sklepowych.

## Rzeczywiste stany częściowego koszyka

Lokalny kandydat miał 16 poprawnych scenariuszy UI korzystających z rzeczywistego produkcyjnego API. Wówczas ABUD nie odpowiadał, więc brak wyceny transportu dla Super Finish 5,4 kg był prawdziwym stanem. Cztery dodatkowe zapytania API potwierdziły brak opłat, płatną część, darmową część i kompletny koszyk.

Po publikacji pierwsza próba publiczna, która wymagała braku wyceny ABUD, nie przeszła: sklep zwrócił prawidłowe 19,99 zł za dostawę dwóch wiader, a pełna suma wyniosła 109,39 zł. Odpowiedź i nieudane założenie testu zachowano. Nie podmieniono jej na brak dostawy.

Stan nieznanej dostawy sprawdzono następnie na istniejącym, potwierdzonym produkcie Norgips Start & Finish 20 kg z Marbet24. Sklep wymaga danych klienta przed wyborem transportu; sam kod pocztowy nie potwierdza opłaty. To inny rzeczywisty koszyk testowy, bez zmiany produktów użytkownika lub aliasowania Norgipsa do Knaufa.

| Scenariusz publiczny | Materiały w planie | Potwierdzone opłaty | Pełna suma |
| --- | ---: | --- | --- |
| Potrzeba 21 kg Norgips Start & Finish, plan 2 × 20 kg, Marbet24 | 192,56 zł | Brak wyceny | Nieznana |
| Ten sam produkt + potrzeba 12,5 m PEX, zakup 13 m | 244,43 zł | Plus-Market 20,00 zł; Marbet24 do potwierdzenia | Nieznana |
| Norgips Start & Finish + potrzeba 270 m taśmy Norgips 50 mm | 398,57 zł | Elmas 0,00 zł; Marbet24 do potwierdzenia | Nieznana |
| Wyłącznie potrzeba 12,5 m PEX, zakup 13 m | 51,87 zł | Plus-Market 20,00 zł | 71,87 zł |

Publiczne 16 scenariuszy przeszło bez błędów strony i odpowiedzi API 429. Obejmują rzeczywiste stany powyżej, ukrycie pełnej sumy przy brakującej opłacie, kopię tekstową, klawiaturę, zmianę kodu, szerokości 320/390 px, zapotrzebowanie 21 kg i 270 m w backupie oraz pełny koszyk i odtworzenie 12,5 m po przeładowaniu. Żadnych wycen nie wstrzyknięto do odpowiedzi ani cache produkcji.

Pierwsza próba Marbet zakończyła się po czterech poprawnych krokach na porównaniu zwykłej spacji z prawidłową niełamliwą spacją przed „zł” w kopiowanym tekście. Poprawiono wyłącznie normalizację białych znaków w asercji; zachowano pierwotną próbę, dane i daty. Nie zmieniono formatowania kwot w aplikacji.

## Potwierdzone publiczne dostawy ABUD

Przeszły dodatkowe siedem rzeczywistych przypadków koszyków Knauf, dwa odświeżenia ceny dokładnego opakowania i dwa inne kody pocztowe. Kwoty pochodzą z odpowiedzi konkretnych anonimowych koszyków, nie z ręcznie wpisanej taryfy:

| Zakup | Kod | Materiały | Dostawa | Suma |
| --- | --- | ---: | ---: | ---: |
| 1 × Super Finish 5,4 kg | 30-001 | 44,70 zł | 13,00 zł | 57,70 zł |
| 2 × Super Finish 5,4 kg, potrzeba 5,5 kg | 30-001 | 89,40 zł | 19,99 zł | 109,39 zł |
| Ten sam zakup dwóch wiader | 00-001 | 89,40 zł | 15,00 zł | 104,40 zł |
| Ten sam zakup dwóch wiader | 80-001 | 89,40 zł | 19,99 zł | 109,39 zł |
| 1 × Super Finish 28 kg | 30-001 | 99,00 zł | 90,00 zł | 189,00 zł |
| 2 × Super Finish 28 kg, potrzeba 29 kg | 30-001 | 198,00 zł | 90,00 zł | 288,00 zł |
| Wiadro 5,4 kg + wiadro 28 kg | 30-001 | 143,70 zł | 90,00 zł | 233,70 zł |

Realbud dla Super Finish nadal wymaga indywidualnej wyceny transportu. Cena materiału 103,05 zł nie jest pełną kwotą zakupu z dostawą. Odświeżenie katalogu ponownie potwierdziło ABUD 44,70 zł / 5,4 kg i oferty 28 kg ABUD 99,00 zł oraz Realbud 103,05 zł; zmiana względem faktycznej wcześniejszej obserwacji wynosiła 0. Ceny katalogowej promocji nie użyto jako poprzedniej ceny.

Publiczny test całego remontu: 16 pozycji, oba nowe opakowania Knauf, dziewięć sklepów. Materiały 2488,90 zł + dostawy 456,90 zł = **2945,80 zł** w standardowym zestawie. Próba trwała około 34,1 s; nie jest to p95 ani pomiar obciążenia.

Ta sama rzeczywista odpowiedź z 2026-11-02 00:45:22.640 UTC zawiera opcję **2918,69 zł** po świadomym dokupieniu jednej rolki taśmy Norgips 50 mm × 30 m w Elmas: materiały 2511,79 zł, dostawy 406,90 zł, oszczędność 27,11 zł. Zapotrzebowanie pozostaje 240 m; proponowany zakup rośnie z ośmiu do dziewięciu rolek. Nie jest to automatyczna zmiana potrzeb ani gwarancja najniższej ceny poza sprawdzonymi wariantami.

Końcowa kontrola 2026-11-02 00:52:16.754 UTC: 16 wystąpień wycen sklepów w sprawdzonych standardowych koszykach Knauf było nadal ważnych, bez przesuwania ich dat. Powyższe kwoty są przykładami z konkretnych prób i kodów, z własnym terminem ważności. Dalsze odświeżenia muszą korzystać z aktualnej odpowiedzi sklepu.

## Walidacja i publikacja

- Źródło frontendowe `e31aadd4b2bb1f267151325289d49315b09ab759`. Czyste 547 testów mobile, typecheck i 66 zadań legacy przeszły. Komponent sprawdzono w rzeczywistym renderowaniu; nie dopisano testu powtarzającego jego kod.
- WWW `8d18f402-9744-4ef7-8edd-5ab1a00a443c`, SUCCESS 2026-11-02 00:42:31.142 UTC. Wszystkie 63 publiczne zasoby zgodne z SHA, 17 288 127 B; 77 wartości vaulta sprawdzonych bez wycieku. Prywatny POST bez podpisu zwraca 401.
- API pozostało na źródle `8603f0163ba9dd87e3baf88cac7ae72180b5449b`, wdrożenie `8cb41ddd-62ed-4faf-b59b-02277f17f9dd`. Świeży zrzut wszystkich 150 plików jest bajtowo zgodny z wave186; seed 350 bez zmian. SHA bundla `b9b1ff0eb7240fd9ade66ca6e8390a3969711499a62d1f896a9915c47191eede`. Dziewięć plików hostingu wraz z prywatnym relay identycznych z poprzednim wydaniem. Nie publikowano backendu.
- Katalog bez zmian: 242 referencje, 210 z potwierdzonymi ofertami, 311 ofert, 32 braki. Audyt: cztery wcześniejsze warianty SKU zachowane, zero fałszywie potwierdzonych dopasowań. Zdjęć i materiałów nie podmieniono.
- Pomocnik audytu początkowo wskazywał nieistniejący backend w katalogu fali frontendowej. Po porównaniu SHA użyto rzeczywistego niezmienionego runtime wave186; błąd i poprawkę pomocnika zachowano.

Artefakty: `G:/Projekty/asystent-remontu-work/wave187-20261102`. Osobne pliki przechowują pierwotną niedostępność ABUD, jego prawdziwy powrót, nieudane założenie publicznego testu, próbę Marbet ze spacją walutową, poprawne 16 scenariuszy, fotografie ekranów i kopie potrzeb. Nie przebudowywano API ani jego zależności i nie składano zamówień. Zmiana nie dotyka płatności lub płatnego AI.

Przegląd money-path: nieznana kwota nie jest zerem, potwierdzone zero pozostaje prawidłową kwotą, opłaty częściowe nie stają się pełną sumą, dat i zakresów koszyków nie rozszerzono. Dowód obejmuje rzeczywiste odpowiedzi API i publiczny interfejs, a ograniczenia oraz nieudane próby są jawne.

Cel ciągły pozostaje aktywny. Nadal wymagają pracy brakujące produkty, trwały dostęp do wycen sklepów, Castorama/OBI, kompletność scenariuszy i pilotaż z klientami. Kolejny konkretny kierunek katalogu: zweryfikować Super Finish 20 kg i możliwość świadomego porównania kombinacji opakowań tej samej masy, bez podmiany wybranego modelu.
