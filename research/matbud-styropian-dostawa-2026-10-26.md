# Centrum Matbud: Yetico Gamma i dostawa — 2026-10-26

Produkcja ma teraz **77/103 produkty z ofertą, 26 braków, 103 aktywne oferty,
35 sklepów i 20 integracji dostawy**. Zdjęcia pozostają dostępne dla 103/103.
To postęp, a nie zakończenie pełnego celu.

## Tożsamość i jednostka

[Główna karta sklepu](https://centrummatbud.pl/Styropian-elewacyjny-10-cm-Yetico-Gamma-Fasada-044-3m2-op-p96729):
produkt 96729, SKU `FASADA 044 10CM`, Yetico Gamma Fasada 044, biały,
grubość 10 cm, 100 × 50 cm, 6 płyt, 0,3 m³, 3 m²/opakowanie.
Cena potwierdzona w natywnym API i koszyku: **69,74 zł brutto za OP**.

Sklep nie publikuje GTIN. Powiązanie z referencją 5902578301976 jest
udokumentowanym powiązaniem producenta, a nie rzekomym odczytem kodu z API:

- [Tabela EAN producenta](https://yetico.com/wp-content/uploads/2026/01/ecommerce_regulamin-programu-motywacyjnego_jubileuszowa-ekstraklasa-yetico_aktualizacja.pdf),
  strona PDF 32, wiersz 682: ten EAN odpowiada GAMMA FASADA 10×50×100.
- [Aktualnie podlinkowana karta techniczna PL](https://yetico.com/wp-content/uploads/2022/06/karta_tech_gamma_fasada_pl.pdf),
  strona drukowana/PDF 4: dla 100 mm paczka gładka ma 6 płyt, 0,3 m³ i 3 m²;
  frezowana ma 0,287 m³ i 2,87 m². Obie strony wyrenderowano i odczytano wizualnie.

Rozstrzygnięcie wariantu opiera się na kompletnych fizycznych danych paczki
w karcie sklepu oraz natywnym warunku **50 OP = 15 m³**. Ogólne zdanie
„proste / frezowane” nie zastępuje tych warunków. Parser wymaga dokładnych
wymiarów, objętości, powierzchni, liczby płyt, producenta, modelu i jednego
produktu w natywnym API. Podmiana na 2,87 m² lub 15 cm jest odrzucana.

Ogólne zdanie o cenie za m² w opisie sklepu jest sprzeczne z operacyjną
jednostką OP. Rozstrzyga natywne API, licznik, informacja 50 OP = 15 m³
i rzeczywisty koszyk: cena 50 OP wynosi 3487,00 zł. Nie dzielimy kwoty
za paczkę i nie zmieniamy fizycznego rozmiaru referencji.

## Minimum, stan i dostawa

Minimum wynosi **50 opakowań**, przyrost **1**. Minimum nie oznacza kolejnej
partii po 50. Zsumowanie dwóch potrzeb 75 + 78 m² daje 51 paczek raz dla
całego remontu. Wdrożenie zawiera również wcześniejszy commit 1320325
rozróżniający minimum i przyrost w optymalizatorze oraz porównaniach.

Rzeczywiste świeże anonimowe koszyki i kalkulator transportu:

| Paczki | Materiały brutto | Transport | Razem |
| --- | ---: | ---: | ---: |
| 50 | 3487,00 zł | 0,00 zł | 3487,00 zł |
| 51 | 3556,74 zł | 0,00 zł | 3556,74 zł |
| 120 | 8368,80 zł | 0,00 zł | 8368,80 zł |

Natomiast próba 121 została przez sklep samodzielnie zmniejszona do 120,
mimo `canBuy=true`. Adapter sprawdza rzeczywistą ilość oraz aktualny stan
i zwraca `insufficient_stock`, nie tańszy niepełny koszyk.

Wybrana konkretna metoda to transport styropianu, nie odbiór osobisty.
Płatność: wpłata na konto bankowe, bez dopłaty. Potwierdzono podsumowanie
brutto, dokładny produkt i ilość, kraj PLN/PL, brak kuponu i prezentów.
Wycena jest oznaczona jako krajowa PL, potwierdzona koszykiem; nie udaje
wyceny pełnego adresu. HTTPS serwisu sprawdził 00-001 i 80-001.

Publiczne ścieżki pochodzą z [opublikowanego skryptu sklepu](https://centrummatbud.pl/view/new/userContent/bum/script.js?v=699).
Nowa metoda transportowa dopuszcza wyłącznie odczyt tego produktu, własny
świeży koszyk, dodanie tego produktu i wyliczenie dostawy przez `json=1`.
Nie ma operacji danych klienta, regulaminu, płatności ani wysłania zamówienia.
Nie używa ciasteczek przeglądarki użytkownika. Nie wolno pomijać natywnego
GET `/cart` przed kalkulatorem: synchronizuje on koszyk i zapobiega odczytowi
pustego starego formularza. Sam ogólny `free-delivery` nie jest dowodem.

## Odbiór i interfejs

Sklep oferuje metodę odbioru, ale podaje wysyłkę na zamówienie; bez terminu
i potwierdzonego stanu lokalnego nie oznaczamy tego jako gotowego odbioru.
`pickupRequiresConfirmation` wyklucza go z pełnego rankingu odbioru.
Mapa prowadzi do jednej rzeczywistej lokalizacji: Pokrzywno 21,
61-315 Poznań; nie tworzy fikcyjnych placówek przy kodzie użytkownika.

UI potwierdził 51 × 3 m², 3556,74 zł, transport 0 zł i opis minimum
50 opakowań/150 m². Wspólny koszyk z pierwotnymi trzema pracami wyniósł
4347,57 zł. Poprawiono znalezioną w UI sprzeczność: informacja o odbiorze
wymagającym uzgodnienia nie twierdzi już, że transport zawsze wymaga
indywidualnej wyceny. Koszt transportu jest osobno w porównaniu.

Po odświeżeniu przeglądarki zachowano produkt, 153 m² i wycenę 51 paczek.
Zmiana dodatku na 363 m² blokuje pełną sumę. Wykryto i poprawiono jeszcze
prezentację awaryjnej listy materiałów: przy braku całej wymaganej ilości
karta nie reklamuje już 121 paczek jako najtańszego zakupu. Pokazuje brak
potwierdzenia dostępności. Nie dotyczy to częściowo odrzuconych innych
koszyków sklepu, dla którego istnieją też potwierdzone wyceny.
Własny dodatek usunięto; pierwotne trzy prace, jedna posiadana pozycja,
Standard, kod 00-001 oraz 790,83 zł przywrócone.

## Weryfikacja i wdrożenie

- 353 testy aplikacji/API/wycen oraz 1054 testy wspólnego backendu PASS, 0 skip.
- Mobile/API typecheck oraz 66 chronionych ID z negatywnymi mutacjami PASS.
- Rzeczywisty zbudowany backend i produkcyjny HTTPS: minimum 50,
  51 po konsolidacji, dwa kody, niedostateczny stan, brak potwierdzonego odbioru.
- Pełne 103 referencje: 77 pozycji z ofertą, 26 braków i pełna suma null.
- Oryginalny koszyk regresyjny nadal 790,83 zł.
- Snapshot wspólnej produkcji SHA256
  `f51bd21357aefe8ce00d6a7444e44cc80e564a98cc77e761e810c11b3a047970`.
  Przed wdrożeniem zgodne wszystkie 148 plików; zmienione wyłącznie
  `src/services/remont-pricing.cjs` i `src/data/remont-verified-offers.json`.
  Wszystkie 104 stare obserwacje zachowane, teraz 105/2 wyłączone.
- [PR 26](https://github.com/jakatora/przetargai/pull/26) merged.
  Source `9870803968a5ab0f7aae440a41da2398bc214491`,
  merge `191774a796b41232033df9c85a8d006e2d8548b9`.
- Railway `b02f72e3-21ea-4e9c-ba13-d946d1603e04`: SUCCESS
  2026-10-26T03:17:30.074Z. Health 200, auth/me 401.
  Kolektor sam odświeżył nową ofertę o 03:18:06.230Z, active true/error null;
  pełny przebieg zakończony. Nie tylko seed.

Dowody w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz`:
`work/catalog-wave19-{local-live,production,collector,predeploy-baseline}-proof.json`,
`work/catalog-wave19-research/matbud-{delivery-native,live-adapter}-proof.json`,
`outputs/matbud-selected-delivery-50-20261026.*`,
`outputs/matbud-51-caly-remont-20261026.*`,
`outputs/matbud-51-po-odswiezeniu-20261026.txt`,
`outputs/matbud-insufficient-stock-20261026.txt`.

Dodatkowe badanie Castoramy: trzy aktualne publiczne pliki aplikacji odczytane
z DOM karty GW180 w przeglądarce zwróciły zwykłym HTTP 503/HTML, nie JS.
Nie zbudowano na nich fikcyjnego adaptera. Własne 50 paczek testowych Matbud
usunięto z przeglądarkowego koszyka; załadowany koszyk pusty, karta zamknięta.
