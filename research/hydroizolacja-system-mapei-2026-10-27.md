# Hydroizolacja: spójny system Mapei i dostawa całego zestawu

Stan na 2026-10-27. Dodano siedem dokładnych produktów/ofert ze zdjęciami oraz pełny model ilości do pracy bathroom-waterproofing. WinBud i Rab-Dom były już zarejestrowane; nie dodano nowego sklepu. Jest to ukończenie jednego wybranego wariantu hydroizolacji, a nie całego katalogu remontowego.

## Produkty i zgodność

| Produkt | EAN | Opakowanie | Cena brutto |
| --- | --- | --- | ---: |
| Mapegum WPS, WinBud | 8022452002113 | 5 kg | 104,00 zł |
| Mapegum WPS, WinBud | 8022452002120 | 10 kg | 198,97 zł |
| Mapegum WPS, WinBud | 8022452242502 | 20 kg | 367,70 zł |
| Mapeband W, WinBud | 8022452113932 | 10 m | 102,70 zł |
| Mankiet podłogowy Mapeband W, WinBud | 8022452113895 | 300 × 300 mm, 1 szt. | 19,97 zł |
| Primer G Pro, Rab-Dom | 8022452241123 | 1 l | 37,90 zł |
| Primer G Pro, Rab-Dom | 8022452241130 | 5 l | 79,90 zł |

Dokładne adresy ofert, fotografie i EAN znajdują się w materials.ts, photos.ts oraz retail-catalog.ts. Natywne API sklepu wiąże EAN, product/stock ID, SKU i całe opakowanie kupowane jako sztuka. Primer G Pro w litrach nie jest utożsamiany ze starszym Primer G w kilogramach. Rolka „10mb” ma fizycznie 10 m. Wszystkie siedem nowych fotografii zwróciło HTTP 200 i typ obrazu. W seedzie zachowano 197 wcześniejszych obserwacji i ich daty; dopisano siedem, do 204.

Wykorzystano także wcześniej dodane narożniki Mapeband W wewnętrzne/zewnętrzne oraz mankiety ścienne 120 × 120 mm sprzedawane po dwie sztuki. Nie zastępujemy ich elementami innego systemu na podstawie samej nazwy kategorii. Wymiary zewnętrzne mankietu nie określają średnicy rury. Użytkownik potwierdza dopasowanie i sposób połączenia z rurą lub kołnierzem odpływu; mankiet nie zastępuje kompletnego odpływu.

Przeczytano aktualne karty producenta, a odpowiednie strony PDF wyrenderowano i obejrzano:

- [Mapegum WPS](https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_02014_mapegum-wps_pl-pl_6ff17f2c535848d99d22681a305a079c.pdf?sfvrsn=eb49cbd6_0): do wnętrz pod okładzinę, bez stałego zanurzenia i podciągania wilgoci; zużycie około 1,2 kg/m² łącznie dla dwóch warstw. Nie podwajamy go ponownie.
- [Mapeband W](https://cdnmedia.mapei.com/docs/librariesprovider24/products-documents/1_07657_mapeband-w_pl-pl_bd946808daf84ab9b92e29950ceddef5.pdf?sfvrsn=51f52cb3_0): zgodność z Mapegum WPS i co najmniej 5 cm zakładu przy łączeniu.
- [Primer G Pro](https://cdnmedia.mapei.com/docs/librariesprovider24/dokumenty---landing-pages/2949-primergpro-pl.pdf?sfvrsn=a9bbe175_7): zużycie 0,10–0,20 l produktu/m². Model przyjmuje jawnie 0,20 l/m²; wodę do rozcieńczania pozostawia poza zakupem koncentratu. Grunt dobiera się do podłoża i pozostawia do wyschnięcia przed hydroizolacją.

## Ilości i formularz

Nowy model waterproofing-mapei-v1 liczy folię, grunt, taśmę, narożniki wewnętrzne, zewnętrzne, mankiety ścienne i podłogowe. Zapas folii wynosi domyślnie 10% i jest widoczny w założeniach. Do zmierzonej długości wszystkich połączeń doliczamy 5 cm za każdy podany zakład taśmy. Liczby narożników, przejść i zakładów wymagają wpisania; brak wartości nie staje się automatycznie zerem. Jawne zero usuwa zbędny element.

Szczegóły pojawiają się po wyborze systemu. Opakowanie gruntu jest widoczne dla właściwego podłoża, potwierdzenie mankietów przy dodatniej liczbie przejść, a własne zużycie po rozwinięciu założeń. Kreator, edycja i podsumowanie obsługują również wartości wpisane jako tekst. Ukrywanie pól nie usuwa zapisanych danych.

Użytkownik wybiera opakowanie folii 5/10/20 kg i gruntu 1/5 l. Automatyczny wybór kombinacji różnych EAN tych wielkości nie jest jeszcze zaimplementowany. Porównanie sklepów dotyczy wybranego opakowania. Surowe ilości z wielu prac łączą się przed zaokrągleniem do pełnych opakowań.

Stare obliczenia z mieszanymi produktami wymagają ponownego wyboru i potwierdzenia. Odczyt nie zapisuje zmian do projektu. Nieaktualne oznaczenia „Mam”/„Kupione” nie pokrywają automatycznie nowego systemu. Zachowano ID prac, istniejących obmiarów i migracje 001–014.

## Rzeczywiste wyceny

Dziesięć przypadków rzeczywistego HTTP przeszło zarówno na lokalnym skompilowanym serwisie, jak i na produkcji. Dodatkowo zapisano 29 zanonimizowanych odpowiedzi natywnych API produktów i koszyków. Nie podawano danych klienta i nie składano zamówienia. Kod 00-001 jest kodem kontrolnym. Poniższe opłaty pochodzą z krajowych taryf PL natywnego koszyka, nie z taryfy zależnej od konkretnego kodu.

Przykład: 10 m² ścian + 5 m² podłogi, 10 m połączeń, 8 zakładów, 4 narożniki wewnętrzne, 1 zewnętrzny, 3 mankiety ścienne i 1 podłogowy; dopasowanie potwierdzone. Zużycie folii z zapasem wynosi 19,8 kg, koncentratu 3 l, taśmy 10,4 m. Kupowane są dwa opakowania po dwa mankiety ścienne.

| Wariant tej samej receptury | Materiały | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Folia 1 × 20 kg, grunt 5 l | 786,32 zł | 10,50 zł | 796,82 zł |
| Folia 2 × 10 kg, grunt 5 l | 816,56 zł | 10,50 zł | 827,06 zł |
| Folia 4 × 5 kg, grunt 5 l | 834,62 zł | 10,50 zł | 845,12 zł |
| Dwie takie prace, wspólne opakowania | 1445,44 zł | 17,99 zł | 1463,43 zł |

W pierwszym wariancie WinBud: 706,42 zł materiałów i 0 zł dostawy tego konkretnego koszyka; Rab-Dom: 79,90 zł materiałów i 10,50 zł dostawy. Zerowego transportu nie przypisujemy każdemu produktowi ani dowolnemu przyszłemu zamówieniu. Dla dwóch prac wspólne zapotrzebowanie folii to 39,6 kg, więc kupujemy dwa wiadra 20 kg. Ten wynik jest najtańszy wśród potwierdzonych wycen; część alternatywnych dostaw pozostaje niewyceniona.

Pozostałe przypadki potwierdzają usunięcie elementów z jawną liczbą zero oraz brak pełnej sumy przy niepotwierdzonych mankietach (2 braki), innym podłożu (1), niewybranym systemie (7), zakupie tylko w WinBud (1) lub tylko w Rab-Dom (6).

## Testy i wdrożenie

- 672 testy rdzenia/kalkulatora/API i 1054 testy współdzielonego backendu: PASS, 0 pominiętych. Typecheck mobile/API przeszedł; po końcowej zmianie widoczności pól ponownie przeszedł mobile. 66 historycznych prac oraz 3 negatywne mutacje walidatora: PASS.
- [PR 64](https://github.com/jakatora/przetargai/pull/64), scalony do 763d65283c2d134c31aec89640f7d2d67af17f76. Repozytorium nie zgłasza workflow/statusów CI; nie deklarujemy zielonego CI.
- Railway 80e50b1d-14fa-4c0a-beae-9760b915e1e2: SUCCESS, 2026-10-27T15:44:20.826Z. Wszystkie 148 plików produkcji zgodne SHA z przejrzanym wydaniem; zmieniono bundle remontu i seed, zachowano 146 innych plików. Snapshot przed wdrożeniem: 92f82121ec34509b29d1f277ea28cf9080b2fb4d80d675cb9af047298dd98d32.
- Działające UI localhost:8082: utworzono jeden własny projekt QA proj_mvqux9ge8j8hlecp2 „Test kompletu — hydroizolacja 15 m², system Mapei”. W formularzu kontrolnym jest 16 zakładów (10,8 m taśmy), co nadal daje 2 rolki i ten sam wynik 796,82 zł. Fotografie oraz pełna suma zostały sprawdzone na ekranie.
- Wybór WinBud pokazuje 6/7 produktów, kwotę dostępną bez dostawy i brakujący grunt, bez pełnej sumy. Przywrócono „Najtańszy zestaw”. Nie zmieniano innych projektów, dodatkowych zakupów ani wcześniejszego wyboru trzech prac we wspólnym koszyku.

Dowody robocze: catalog-wave63-production-proof.json, catalog-wave63-deployed-files-proof.json, catalog-wave63-current-audit-proof.json, catalog-wave63-audit-update-proof.json, catalog63-selected-winbud-ax.txt i catalog63-confirmed-ax.txt. Zrzuty: catalog63-hydroizolacja-plan-20261027.png oraz catalog63-hydroizolacja-produkty-20261027.png w outputs zadania.

## Pozostały zakres

Aktualny katalog: 161 referencji, 137 produktów z aktywnymi ofertami, 183 aktywne oferty, 204 źródła, 50 zarejestrowanych sklepów (47 aktywnych). Wszystkie 161 referencji mają zdjęcie; 162 rekordy fotografii obejmują jeden wcześniejszy produkt z dodatkowym źródłem obrazu. Pozostają 24 wcześniejsze braki katalogowe: 18 wygasłych potwierdzeń i 6 pozycji wymagających oferty.

Te same 65 zestawów dawnych obmiarów: 82/244 wiersze wycenione, 162 niewycenione (77 bez pełnego zapytania, 79 bez produktu, 6 bez oferty), 8 kompletnych scenariuszy materiałowych. Poprzednio 84/240 i 156 braków: dwa stare mieszane wiersze hydroizolacji nie są już wyceniane przed wymaganym doborem, a cztery potrzebne role akcesoriów są teraz jawne. Nie dopisano brakujących danych użytkownika, by pozornie polepszyć wynik. Kompletny nowy wariant jest osobnym sprawdzonym scenariuszem.

24 i 162 nie sumują się: zakresy nakładają się, a wiersze powtarzają produkty. Do zrobienia pozostają pozostałe receptury i warianty, dobór najtańszych wielkości opakowań, pełniejsze wyceny dostaw oraz rzeczywiste ceny i stany pobliskich placówek. Goal pozostaje ACTIVE.
