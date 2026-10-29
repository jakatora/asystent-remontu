# Arkusze Klingspor P180/P220 i czytelniejsze dodawanie materiałów — 2026-10-29

## Problem użytkownika

Przy kompletowaniu remontu trudno znaleźć konkretną gradację papieru ściernego w długim katalogu. Sam koszt pojedynczych arkuszy jest mylący, jeśli sklep nalicza dostawę dla całego zamówienia. Wyszukiwarka dodatkowych materiałów wcześniej pokazywała przypadkowe pierwsze produkty przy pustym polu i tylko osiem wyników bez możliwości przejścia dalej.

## Zmiana

- Dodano dokładne, osobne arkusze Klingspor PL 28 C [P180](https://sklep.sewera.pl/papier-scierny-gr-180-arkusz-230x280mm-p6901), EAN `5907560023560`, 1,54 zł/szt. oraz [P220](https://sklep.sewera.pl/papier-scierny-gr-220-arkusz-230x280mm-p6902), EAN `5907560027483`, 1,67 zł/szt. Oba są pojedynczymi arkuszami 230 × 280 mm, nie opakowaniami zbiorczymi. Nazwa, gradacja, EAN, cena brutto i dostępność pochodzą z dokładnych kart sklepu.
- Zdjęcia powiązano z odpowiadającymi im EAN i kartami Sewery. Oba pliki WebP zwróciły HTTP 200. Obraz ilustruje serię PL 28 C; samą gradację potwierdza karta produktu i EAN. Audyt wszystkich adresów zdjęć: 192/192.
- Wyszukiwanie dodatkowych materiałów przyjmuje słowa w dowolnej kolejności oraz EAN, pokazuje liczbę wyników i przycisk „Pokaż kolejne”. Puste pole podpowiada sposób wyszukiwania. Ceny i dostawa są sprawdzane dopiero po dodaniu do koszyka.
- Dwie nowe obserwacje cen zwiększają liczbę zapisanych obserwacji z 260 do 262, bez zmiany wcześniejszych 260 rekordów. Aktualizacja nie tworzy sztucznej stawki dostawy.

## Koszyk kontrolny

Dla kodu `00-001` i jednej sztuki każdej gradacji anonimowy koszyk Sewery zwrócił: produkty **3,21 zł** + jedna dostawa kurierem **19,90 zł** = **23,11 zł**. API zwróciło `compared`, zero braków i jeden sklep zarówno po wybraniu Sewery, jak i w rankingu globalnym dostępnych ofert. Inny kod pocztowy oraz późniejsze odświeżenie mogą dać inną cenę. To porównanie potwierdzonych ofert, bez obietnicy najniższej ceny całego rynku.

## Dowody i testy

- Odczyty sklepowe: P180 `2026-10-29T18:53:03.968Z`, 154 gr, SHA `87bf9380ba1e45f1f0ed32446b69b1d010a97dedddcb5f0e54eed3d9c4547586`; P220 `2026-10-29T18:53:05.517Z`, 167 gr, SHA `04b13843c90e6a5a34195e92f2a19efba243609409dbd324dbccbcf67bceb1df`.
- Nowy test HTTP rozróżnia oba EAN i sprawdza wspólną dostawę oraz sumę 2311 gr. Mobile 369/369, pricing 149/149, backend wspólny 1054/1054, mobile i API typecheck, eksport Expo Web, audyt zdjęć 192/192 i kontrola starych ID przechodzą.
- Szerszy historyczny zestaw testów API w izolowanej kopii ma błędy ładowania importów TypeScript pod Node 24 oraz jeden niezwiązany test współbieżnego odczytu Sewery. Nowy test HTTP, używany kod i paczka wdrożeniowa przechodzą swoje kontrole; ten starszy zestaw wymaga osobnej naprawy środowiska/testu.
- Paczka backendu zachowuje 146 z 148 plików migawki bez zmian; różnią się tylko seed obserwacji i wygenerowany moduł cenowy. SHA nowego modułu: `e7e17e70b84ec131c67ade9e6b66e27fff6ed2e719f03f2875e039554dc3b3fa`.

## Dalsza praca

Rozszerzać katalog i sklepy z dokładnym EAN, jednostką zakupu i zdjęciem, a dla pełnego koszyka potwierdzać dostawę pod kod użytkownika. Przy braku wiążącej stawki aplikacja powinna nadal pokazywać brak wyceny, zamiast sugerować najtańszy zestaw.
