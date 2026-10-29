# Czujnik czadu: konkretny model, ilość, cena i dostawa

29 października 2026, wave82. Dodano Virone DC-11, dwie aktualne oferty oraz rzeczywiste dostawy. Produkt można wybrać w projekcie „Prace kominowe”, edytować jego liczbę i dołączyć do wspólnego koszyka. Ten etap uzupełnia kolejną pozycję użytkownika; rozwój całego katalogu trwa.

## Tożsamość i zdjęcie

Model **Virone DC-11 (ORNO Group)**, EAN **5908254851223**, jedno urządzenie. [Producent](https://www.virone.pl/pl/czujnik-czadu/744-bateryjny-czujnik-tlenku-wegla-czadu-2xaa-zywotnosc-sensora-10-lat-5908254851223.html) potwierdza LCD i dwie baterie AA w zestawie. Zdjęcie pochodzi z pierwotnej karty [Prescot](https://www.prescot.com.pl/pl/p/BATERYJNY-CZUJNIK-TLENKU-WEGLA-CZADU-10-LAT-3V-ORNO/18444), a drugi sklep to [Z prądem](https://zpradem.pl/bateryjny-czujnik-tlenku-wegla-czadu-2xaa-zywotnosc-sensora-10-latdc-11/1089222). Nazwy sklepowe zawierają ORNO; dokładny EAN wiąże je z modelem Virone. To odrębny produkt od sprawdzanego wcześniej Kidde K5CO; nie łączymy kodów.

Instrukcja [DC-11, wydanie 05/2026](https://files.orno.pl/support/ManualsUserPDF/VIRONE/PL-EN-DE/DC-11_manual_PL_EN_DE.pdf) opisuje urządzenie przenośne, bez stałego mocowania, test przyciskiem raz w miesiącu oraz sensor o żywotności 10 lat. Nie utożsamiamy tej wartości z trwałością baterii. Liczbę i rozmieszczenie użytkownik ustala według instrukcji; aplikacja nie ocenia pokrycia domu i nie zastępuje usług kominiarskich. Usunięto wcześniejszą ogólną wskazówkę wysokości 150–160 cm oraz corocznego testu z pozycji materiałowej.

## Rzeczywiste koszty brutto

| Koszyk | Materiały | Kurier krajowy PL | Razem |
|---|---:|---:|---:|
| 1 urządzenie, Prescot | 73,00 zł | 24,60 zł | **97,60 zł** |
| 1 urządzenie, Z prądem | 94,40 zł | 27,00 zł | **121,40 zł** |
| 2 urządzenia, Prescot | 146,00 zł | 24,60 zł | **170,60 zł** |
| 2 urządzenia, Z prądem | 188,80 zł | 27,00 zł | **215,80 zł** |
| 3 urządzenia z dwóch projektów, Prescot | 219,00 zł | 24,60 zł | **243,60 zł** |

Każdy wynik wynika z całego anonimowego koszyka, nie z ceny „dostawa od” na karcie. Dostawy sklepów mają potwierdzony zakres Polska; nie przedstawiamy ich jako taryf wyliczonych indywidualnie dla kodu. Sprawdzono 00-001 i 42-209. Prescot: Transport DPD / Autopay; Z prądem: kurier z przedpłatą/Przelewy24. Ceny netto 59,35 zł i 76,75 zł nie są cenami do porównania konsumenckiego.

Cena i stan lokalnej placówki pozostają niepotwierdzone. Tryb własnego odbioru nie przepisuje automatycznie ceny internetowej. Narzędzia i usługi fachowca są poza ceną tych materiałów.

## Obmiary i zapis projektu

Użytkownik wybiera model i liczbę całych urządzeń 1–100. Nie dodajemy zapasu ani osobnych baterii. Brak modelu/liczby, ułamki i wartości spoza zakresu pozostają nieuzgodnione. Stary projekt z ogólnym „czujnikiem czadu” nie staje się automatycznie ofertą DC-11. Niezgodny zapis EAN, jednostki lub ilości wstrzymuje wycenę tej pozycji.

Nowe pola coDetectorChoice/coDetectorCount zachowują wszystkie istniejące ID prac i materiałów. Jednorodna tablica materiałów pozostaje legacy. Model ilości co-detector-v1 identyfikuje nowy zapis; nie zmieniono migracji bazy. „Mam” i „Kupione” są ponownie oceniane po zmianie modelu lub ilości. Edytor oraz przycisk „Zmień model lub liczbę czujników” umożliwiają uzupełnienie zapisanego projektu.

## Weryfikacja i wydanie

- **805 testów rdzenia i 1054 testy wspólnego backendu: 0 błędów, 0 pominięć.** TypeScript mobile/API oraz ochrona 66 wpisów rejestru poprawne. Nowe testy sprawdzają całe urządzenia, ilości, stare zapisy, oznaczenia posiadania, EAN/SKU/jednostkę/stan oraz cenę brutto.
- **6 rzeczywistych koszyków sklepów** oraz **8 wywołań produkcyjnego SDK**: pięć kompletnych dostarczonych zestawów, brak modelu, brak kodu i niepotwierdzony odbiór. Dwa projekty kupują 3 urządzenia z jedną dostawą.
- Expo web localhost:8082: kreator utworzył własny projekt QA z 2 urządzeniami; wycena 170,60 zł. Edycja do 1 szt. przeliczyła 97,60 zł, potem przywrócono 2 szt.. Wspólny koszyk czujników z projektem podkładu wykazał **485,04 zł** (398,45 zł materiałów, 86,59 zł dostaw). Po próbie przywrócono poprzedni wybór 3 własnych prac QA. To nie jest test na fizycznym Androidzie/iPhonie.
- Przegląd ścieżki pieniędzy: całkowite grosze z faktycznych koszyków, pełny fracht zamówienia, dokładny kod produktu i jednostka, lokalny zapis per projekt. Dowód stanowią powyższe rzeczywiste HTTP i przejścia interfejsu. Bez zamówień, danych klienta, płatności i płatnego AI.

Backend: [PR 82](https://github.com/jakatora/przetargai/pull/82), merge 04e76d4b56bb6da7c90a02dde3779f90588928cc. Railway ddb9410b-c20d-4a18-8976-970ba6f385b9 **SUCCESS** 2026-10-29T03:03:09.228Z, wszystkie 148 plików zgodne z przygotowanym wydaniem. Zachowano 222 wcześniejsze obserwacje i 146 pozostałych plików, dodano 2 obserwacje. Bez nowego serwera i nowego adaptera sklepów.

Katalog: **176 pozycji ze zdjęciami,169 z aktywnymi ofertami,218 ofert, 224 źródła, 49 aktywnych kanałów sklepów**. Siedem historycznych modeli nadal bez oferty. Te same 65 historyczne mapy bez jawnych nowych wyborów pozostają przy 81/251 wycenionych wymaganiach i 170 brakach — to nie 170 różnych produktów. Konkretny model czujnika i ilość są sprawdzone osobno, bez zawyżania ogólnej kompletności.
