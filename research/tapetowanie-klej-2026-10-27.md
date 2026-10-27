# Kleje do tapet: właściwy produkt, pełne opakowania i wspólna dostawa

Stan sprawdzony 2026-10-27. Wave60 dodaje dwa nowe produkty, cztery oferty i dwa sklepy. Nie zamyka całego tapetowania ani katalogu remontowego.

## Problem użytkownika i zmiana

Ogólny „klej do tapet” w kilogramach nie wskazywał, jaki produkt kupić ani jaką masę suchego proszku rzeczywiście zużyć. Teraz użytkownik wybiera rodzaj tapety w kreatorze lub edycji obmiarów. Gładka/tłoczona flizelina wybiera Metylan Direct 200 g; cienka/zwykła/gruba tapeta papierowa wybiera Metylan Normal 125 g. Domyślne „jeszcze nie wiem” pozostawia dobór i ilość do ustalenia oraz niepełną wycenę. Tapety specjalne wymagają osobnego sprawdzenia zgodności.

Zużycie liczymy w gramach suchego proszku, z jawnym zapasem domyślnym 10%. Identyczny produkt sumuje się między pomieszczeniami przed zaokrągleniem do pełnych opakowań. Woda używana do przygotowania kleju nie staje się kupowanym materiałem. Historyczny wynik w kg nie otrzymuje automatycznie nowej ceny w g. Oznaczenia „Mam”/„Kupione” są zachowane wyłącznie dla zgodnego produktu, jednostki i wystarczającej ilości; zmiana wymaga potwierdzenia.

## Źródła techniczne

- [Henkel: karta Metylan Direct](https://datasheets.tdx.henkel.com/METYLAN-Direct-pl_PL.pdf), tabela na stronie 2: opakowanie 200 g na 22–26 m² flizeliny gładkiej albo 18–20 m² tłoczonej. Kalkulator używa odpowiednio 22 i 18 m². Przygotowanie 3–5 minut.
- [Henkel: karta Metylan Normal](https://datasheets.tdx.henkel.com/METYLAN-Normal-pl_PL.pdf), tabela na stronie 2: opakowanie 125 g na 50/40/30 m² tapety papierowej cienkiej/zwykłej/grubej. Przygotowanie 20 minut.

Obie strony tabel wyrenderowano i obejrzano. Pojedynczy sprzeczny zapis „750 g / 3,5 m²” w ogólnej części karty Direct nie jest podstawą obliczeń; użyto tabeli zastosowań dla opakowania 200 g. Należy stosować zalecenia producenta konkretnej tapety i warunki z kart.

## Dokładne produkty i ceny brutto

| Produkt | EAN | Świat Się Klei | Plejada Tapet |
|---|---|---:|---:|
| Metylan Direct 200 g | 4015000402019 | 24,94 zł | 31,90 zł |
| Metylan Normal 125 g | 4015000095266 | 16,98 zł | 20,00 zł |

Źródła niezależnych ofert:

- [Świat Się Klei: Direct](https://swiatsieklei.pl/pl/p/METYLAN-Direct-200g-klej-do-tapet-24119/104), Shoper product104/stock181/SKU N-29.
- [Świat Się Klei: Normal](https://swiatsieklei.pl/pl/p/METYLAN-Normal-125g-klej-do-tapet-24122/101), product101/stock178/SKU N-26.
- [Plejada: Direct](https://plejadatapet.pl/pl/p/Klej-do-tapet-Direct-200g-Metylan/825), product825/stock872/SKU MT DIR200.
- [Plejada: Normal](https://plejadatapet.pl/pl/p/Klej-do-tapet-Normal-125g-Metylan/824), product824/stock871/SKU MT NOR125.

Natywna jednostka zakupu to całe „szt.”, nie gram sprzedawany luzem. Czytnik wiąże dokładny EAN, nazwę, SKU, masę i jednostkę. Porównuje kwoty brutto i odrzuca cenę netto, błędny wariant, ułamkową jednostkę lub niespójną sumę. Dodano dokładne zdjęcia obu produktów z publicznych kart sklepów; cztery adresy obrazów zwróciły HTTP200 i typ image/jpeg lub image/webp. Nowe źródła, referencje i zdjęcia są dopisane po wcześniejszych wpisach.

## Rzeczywiste koszyki z dostawą

Produkcja HTTP sprawdzona 2026-10-27 około 14:55 czasu Europe/Warsaw. Dla testowego kodu 00-001 natywne anonimowe koszyki zwróciły taryfy krajowe PL, z terminem ważności 10 minut. Nie opisujemy ich jako ceny zależnej od konkretnego kodu.

| Sprawdzony zakres | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Direct: dwa pomieszczenia po 10 m², razem 200 g, jedna paczka | 24,94 zł | 19,00 zł | 43,94 zł |
| Normal: dwa pomieszczenia po 15 m², razem 103,125 g, jedna paczka | 16,98 zł | 19,00 zł | 35,98 zł |
| Oba kleje dla czterech pomieszczeń, Świat Się Klei | 41,92 zł | 19,00 zł | 60,92 zł |
| Te same dwa kleje, wybrana Plejada Tapet | 51,90 zł | 21,90 zł | 73,80 zł |

To wyceny kompletnego koszyka **tych klejów**. Pełna receptura tapetowania nadal ma dwie niewycenione pozycje: tapetę i taśmę; przy nieznanym rodzaju tapety również klej. Wtedy pełna suma z dostawą pozostaje null. Własny odbiór w nowych sklepach wymaga potwierdzenia placówki i dostępności; nie jest domyślnie darmową, potwierdzoną rezerwacją.

Nie wysyłano danych kontaktowych, pełnego adresu ani zamówienia. Fixture zawiera wyłącznie publiczne odczyty i zanonimizowany rzut koszyka: 26 zapisów. Kontrola mutacyjna sprawdza między innymi ilość, jednostkę, cenę brutto i sumę koszyka.

## Odbiór w aplikacji i walidacja

Własny projekt QA `proj_mvqqwfr7dc4ee0yxk`, „Test kleju — tapetowanie 10 m²”, utworzony przez normalny kreator. Sprawdzono Direct 200 g / 24,94 zł / prawdziwe zdjęcie, zmianę na Normal 125 g / 16,98 zł / inne zdjęcie, wybór nieznanego rodzaju oraz powrót do Direct. W porównaniu widoczne obie ceny 24,94/31,90 zł. Ręczny wybór Plejady pokazuje koszt dostępnej części i trzy braki; „Najtańszy zestaw” dwa braki. Nie edytowano innych projektów ani migracji; nie restartowano Expo8082.

654 testy kalkulatora/pricing/API i 1054 testy współdzielonego backendu przeszły, bez skipów. Mobile i API typecheck przeszły; po zmianie wyłącznie dwóch opisów ponowny mobile typecheck również przeszedł. Legacy66jobs i trzy negatywne mutacje ID przeszły. Dwa źródłowe PDF-y zwróciły HTTP200 bez ostrzeżeń. Rzeczywisty lokalny i produkcyjny HTTP: siedem przypadków, wszystkie oczekiwane wyceny i braki potwierdzone. Pierwszy lokalny probe miał błędne założenie o serializowanym `materialId`; skorygowano sprawdzanie rzeczywistego query i zachowano dowód pierwotnej porażki, bez zmiany kodu produkcyjnego dla testu.

## Wdrożenie i pokrycie

- Backend [PR62](https://github.com/jakatora/przetargai/pull/62), head `ad8d0a25de90ac16bda3245fa33a5a37100c20e8`, merge `e979402bd677fb2ab3a926281fc8519cd687cd77`. Brak workflow/statusów GitHub; wyniki testów są lokalne, nie oznaczają zielonego CI.
- Railway deployment `57ce355c-c148-486d-a88a-3704c51f358d`, SUCCESS 2026-10-27T13:54:56.043Z. Porównano SHA wszystkich 148 plików. Zmieniono wyłącznie seed i skompilowaną usługę Remont; zachowano 146 innych plików i wszystkie 192 wcześniejsze obserwacje. Edycja opisów mobilnych nie zmieniła ponownie zbudowanego bundle backendu.
- Świeży audyt produkcyjny: 153 referencje ze zdjęciami, 129 z aktywnymi ofertami, 24 bez aktualnego potwierdzenia (18 wygasłych weryfikacji i 6 bez oferty), 175 aktywnych ofert, 196 obserwacji, 50 zarejestrowanych sklepów / 47 z aktywnymi ofertami. 30 adapterów automatycznej dostawy nie oznacza dostawy dla wszystkich produktów.
- Kalkulator ponownie przeliczył te same 65 zapisanych obmiarów: 84/240 pozycji wycenionych, 156 niewycenionych, 8 pełnych scenariuszy materiałowych. Nie dopisano automatycznie rodzaju tapety do wcześniejszych danych. Nowe przykłady z jawnym doborem znajdują się osobno w audycie receptur.

## Dalsza praca

Do uzupełnienia pozostają stare 24 luki, niewycenione materiały/parametry receptur, pełne dostawy między innymi Leroy/Marbet oraz rzeczywiste ceny i stany pobliskich placówek. Liczby 24 i 156 nakładają się; 156 to wiersze receptur, nie odrębne brakujące produkty.

Nie dodano jeszcze podkładowej tapety MEISTERVLIES/MakuVlies: ten sam EAN4000776200013 ma u sprzedawców sprzeczną szerokość 100/106 cm, a opis wariantu 75 cm (inny EAN4000776865519) zawiera EAN wariantu 100 cm. Bez rozstrzygnięcia tożsamości i wymiarów nie łączymy ich w jeden produkt ani nie liczymy z nich rolek. Zachowano odczyty w roboczym researchu, żeby kontynuować od konkretnej rozbieżności.
