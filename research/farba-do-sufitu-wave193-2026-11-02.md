# Jawny wybór farby do sufitu — 2026-11-02

## Problem i zakres
Audyt obecnych kalkulatorów oraz publicznego katalogu wykazał brak potwierdzonych ofert dla dwóch historycznych farb sufitu: mat-paint-economy-white-10l i mat-paint-standard-white-10l. Biała matowa Śnieżka EKO Plus 10 l (EAN 5903973205982), już w katalogu jako mat-paint-better-white-10l, ma oferty Rab-Dom i Sewera. Dostępność materiału nie jest dowodem potwierdzonej dostawy.

Dodano świadomy wybór tej farby przy obu dotychczasowych wariantach sufitu. Bez wyboru produkt pozostaje oryginalny. Zachowujemy litry, obmiary, warstwy i wydajność, a API ponownie liczy pełne wiadra oraz rzeczywiste dostawy. Nie utożsamiamy różnych EAN, nie zmieniamy automatycznie kolorów, składu ani parametrów. UI kieruje do karty producenta i przypomina o dostosowaniu wydajności do podłoża.

Wybór projektu przenosi się do wspólnego koszyka i listy zakupów. Osobny wybór we wspólnym koszyku nie nadpisuje projektu. Inne prace, ręczne materiały, ilości nieznane i niezgodne kody nie są podmieniane. Stan posiadania dotyczy konkretnego produktu. Zapis jest kolejkowany; eksport czeka na zapis, a uszkodzone preferencje wstrzymują wycenę i mają odzyskiwanie z zachowaniem oryginału.

## Źródła sprawdzone 2026-11-02
- https://www.sniezka.pl/produkt/sniezka-eko-plus — producent: biała matowa farba do ścian i sufitów wewnątrz, maksymalna deklarowana wydajność do 14 m²/l przy jednej warstwie. Nie podnosimy automatycznie przyjętej wydajności z obmiarów.
- https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089 — karta natywna: 10 l, kod 5903973205982, zgodne zastosowanie. Ceny i dostępność są odczytywane przez istniejący adapter, nie kopiowane do nowej reguły.

## Walidacja
W toku. Dowody robocze: G:/Projekty/asystent-remontu-work/wave193-20261102.

Nie dodano nowych produktów, zdjęć ani ofert. Nie zamknięto 32 historycznych braków katalogu: użytkownik może świadomie wybrać istniejący produkt z ofertami zamiast dwóch brakujących farb sufitu. Nie zmieniono API, taryf, historii cen, migracji, zależności ani innych aplikacji.
