# Jawny wybór farby do sufitu — 2026-11-02

## Problem i zakres
Audyt obecnych kalkulatorów oraz publicznego katalogu wykazał brak potwierdzonych ofert dla dwóch historycznych farb sufitu: mat-paint-economy-white-10l i mat-paint-standard-white-10l. Biała matowa Śnieżka EKO Plus 10 l (EAN 5903973205982), już w katalogu jako mat-paint-better-white-10l, ma oferty Rab-Dom i Sewera. Dostępność materiału nie jest dowodem potwierdzonej dostawy.

Dodano świadomy wybór tej farby przy obu dotychczasowych wariantach sufitu. Bez wyboru produkt pozostaje oryginalny. Zachowujemy litry, obmiary, warstwy i wydajność, a API ponownie liczy pełne wiadra oraz rzeczywiste dostawy. Nie utożsamiamy różnych EAN, nie zmieniamy automatycznie kolorów, składu ani parametrów. UI kieruje do karty producenta i przypomina o dostosowaniu wydajności do podłoża.

Wybór projektu przenosi się do wspólnego koszyka i listy zakupów. Osobny wybór we wspólnym koszyku nie nadpisuje projektu. Inne prace, ręczne materiały, ilości nieznane i niezgodne kody nie są podmieniane. Stan posiadania dotyczy konkretnego produktu. Zapis jest kolejkowany; eksport czeka na zapis, a uszkodzone preferencje wstrzymują wycenę i mają odzyskiwanie z zachowaniem oryginału.

## Źródła sprawdzone 2026-11-02
- https://www.sniezka.pl/produkt/sniezka-eko-plus — producent: biała matowa farba do ścian i sufitów wewnątrz, maksymalna deklarowana wydajność do 14 m²/l przy jednej warstwie. Nie podnosimy automatycznie przyjętej wydajności z obmiarów.
- https://sklep.sewera.pl/sniezka-eko-plus-odporna-na-szorowanie-10l-p6089 — karta natywna: 10 l, kod 5903973205982, zgodne zastosowanie. Ceny i dostępność są odczytywane przez istniejący adapter, nie kopiowane do nowej reguły.

## Walidacja
Zakończono 2026-11-02. Źródło WWW: 51f1817b5a1f64374418e7bd5dabbc7fa8b21fe1. Publiczne wdrożenie aa68d4ed-2222-45cf-a546-95fcc65b4c27 ma status SUCCESS od 04:41:31 UTC. API pozostało na wdrożeniu 6b880c17-ca05-468f-b9eb-30a38ea11364, źródło bd82ac3618c4172d4e48f954fefea361d0ee6a6a; odczyt SSH porównał wszystkie 150 plików i 361 obserwacji seed z poprzednim wydaniem, bez różnic. SHA256 pakietu API: 6d81b33f68d0714e8113d9e4df3119b84e6f1009c0b79d87b5ac77371eca4569.

- 568 testów mobile: 568 PASS, 0 FAIL, 0 SKIP. Typy mobile i 66 historycznych prac PASS.
- 4 realne próby publicznego API: economy/standard przed wyborem mają brak farby i brak pełnej kwoty; po wyborze obie pozycje (4,2 l farby oraz 3 l gruntu dla sufitu 20 m²) mają pełną dostawę 195,91 zł w obserwowanym koszyku.
- 18 scenariuszy lokalnego interfejsu i ponownie 18 na publicznej stronie: zdjęcie, wybór projektu, ponowne otwarcie, dziedziczenie wyboru projektu we wspólnym koszyku, oddzielny wybór koszyka, sumowanie litrów przed wiadrami, rzeczywiste dostawy, kopiowanie, szerokości 320/390 px, pobranie kopii, zachowanie ustawień drugiego projektu, odświeżenie, powrót do oryginału i ponowny wybór, wstrzymanie po celowo uszkodzonym ustawieniu testowym oraz jawne odzyskanie z archiwum.
- Dwa sufity 20 + 30 m²: 4,2 + 6,3 = 10,5 l farby, dwa wiadra po 10 l; 7,5 l gruntu, dwa opakowania po 5 l. Materiały 305,84 zł + dostawy 56,50 zł = 362,34 zł. Rab-Dom 31,50 zł i Realbud 25,00 zł to potwierdzone taryfy krajowe PL, bez osobnej personalizacji dla kodu 30-001. UI i kopiowany plan wyraźnie to opisują. Kwoty są obserwacją z próby, nie stałą obietnicą ceny ani dowodem globalnego minimum.
- Końcowy przegląd o 2026-11-02T04:42:34.726Z: 16 wystąpień cytowanych wycen ważnych w chwili tej kontroli, oryginalne daty bez przedłużania, sumy groszy zgodne z faktycznymi opakowaniami i dostawami. Nie wstrzyknięto cen ani wycen do API/przeglądarki. Osobna próba uszkodzenia dotyczy wyłącznie lokalnego ustawienia w izolowanym profilu testowym.
- 63 publiczne zasoby porównane po SHA256; dokument PL, wszystkie 9 plików hostingu i prywatnego przekaźnika bajtowo zgodne z W192. 77 wartości vault sprawdzonych, 0 wycieków. Strony 200, prywatne pliki 404, anonimowy POST do prywatnego przekaźnika 401.

Pierwsza próba automatyzacji interfejsu (local r1) nawigowała przed zakończeniem importu i nie znalazła projektów. Zachowano ślad; dodano oczekiwanie na faktyczny komunikat ukończenia importu oraz poprawiono asercję identyfikatora serializowanego produktu. Następna pełna lokalna i publiczna próba przeszły bez zmian w aplikacji.

Dowody: G:/Projekty/asystent-remontu-work/wave193-20261102: flow-audit-before.json, remaining-flow-gaps.json, production-ceiling-native.json, local-ceiling-qa.json, production-ceiling-qa.json, production-http.json, final-proof.json, release-state-api-web.json. Własny serwer lokalny zakończony; testowe przeglądarki zamknięte. Nie dotykano localhost:8082 ani projektów użytkownika.

Nie dodano nowych produktów, zdjęć ani ofert. Nie zamknięto 32 historycznych braków katalogu: użytkownik może świadomie wybrać istniejący produkt z ofertami zamiast dwóch brakujących farb sufitu. Nie zmieniono API, taryf, historii cen, migracji, zależności ani innych aplikacji.
