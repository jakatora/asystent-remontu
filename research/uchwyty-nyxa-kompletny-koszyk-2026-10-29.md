# Uchwyty szafek — dokładny wariant i koszt całego zamówienia

Zweryfikowano 2026-10-29. Zachowano job kitchen-hardware, input handleCount oraz oba historyczne identyfikatory materiałów. Poprzedni wzór faucets liczył uchwyty według liczby baterii; zastępuje go model cabinet-nyxa-128-v1.

Użytkownik podaje całkowitą liczbę uchwytów, wybiera kolor, mierzy rozstaw między środkami otworów i potwierdza pasowanie śrub. NYXA C-128 ma rozstaw 128 mm i długość całkowitą 138 mm. Te wymiary nie są zamienne. Dwie śruby M4×22 znajdują się w zestawie: nie naliczamy ich drugi raz ani domyślnego zapasu 10%. Inny rozstaw, gałka, nieznana długość śrub lub śruby do dokupienia pozostają do doboru. Poprawiono kierunek montażu: śruby od wnętrza frontu do gwintów uchwytu na zewnątrz.

## Produkty i źródła

| Produkt | EAN | Cena brutto za uchwyt | Potwierdzony zapas |
| --- | --- | ---: | ---: |
| NYXA 128 mm, czarny mat | 5902801422652 | 12,99 zł | 79 szt. |
| NYXA 128 mm, złoto szczotkowane | 5902801422737 | 13,50 zł | 5 szt. |

To stan odczytu, bez rezerwacji. Każdy wariant ma własne zdjęcie i EAN. Ceny brutto i EAN potwierdzono w osobnych anonimowych koszykach Integry; sam adres URL nie jest dowodem kodu. Aktualizacje cen korzystają ze wspólnego mechanizmu obserwacji i zmian cen. Pola formularza zamówienia, dane klienta i zamówienia nie były wysyłane.

- [GTV: aktualna karta NYXA 128 czarny i zawartość zestawu](https://gtv.com.pl/produkt/UZ-NYXA-128-20M/).
- [GTV: tabela wariantów i kodów EAN, s. 15](https://gtv.com.pl/wp-content/uploads/2024/05/Regulamin_konkursu_SolidnaEkipa.pdf).
- [GTV: karta wymiarowa rodziny NYXA](https://api2.gtv.com.pl/pimcore/assets/attachments/karta_produktowa/UZ-NYXA__PL-EN-UA-HU__uchwyt__KP.pdf).
- [Integra: czarny 128 mm](https://integra-bielinscy.pl/uchwyty/1614-uchwyt-meblowy-nyxa-c-128-l-138-czarny-mat-5902801422652.html).
- [Integra: złoty 128 mm](https://integra-bielinscy.pl/uchwyty/1613-uchwyt-meblowy-nyxa-c-128-l-138-zloto-szczotkowane-5902801422737.html).
- [Integra: koszty dostawy](https://integra-bielinscy.pl/content/1-koszty-dostawy).

Oferta Art-Meb 8834 została odrzucona: nazwa i symbol czarnego uchwytu, lecz EAN złotego wariantu. Bimeb ma poprawny EAN, ale próby odczytu kalkulatora dostawy zakończyły się timeoutem przed dodaniem koszyka; sklepu nie aktywowano.

## Dostawa całego koszyka

Integra publikuje osobno kuriera InPost i paczkomaty. Wybieramy kuriera, przedpłatę i kraj PL, nie odbiór ani pobranie. Bieżąca karta czarnego uchwytu podaje wagę 0,120 kg. Oba warianty mają długość 138 mm; obliczona masa całego zamówienia musi mieścić się w limicie 30 kg. Niepodana masa złotego wariantu nie może oznaczać zera: jego cena materiałów jest dostępna, ale komplet z automatyczną dostawą pozostaje niepotwierdzony.

Taryfa kuriera: do 49,99 zł = 14,95 zł, 50–99,99 zł = 8,95 zł, 100–149,00 zł = 4,95 zł, od 150 zł = 0 zł. Niejednoznaczna luka 149,01–149,99 zł jest odrzucana. Zmiana tekstu taryfy wymaga ponownego przeglądu; parser nie zgaduje nowych stawek. Potwierdzamy cały koszyk, ceny, ilości, EAN i zapas; po każdej zmianie powstaje nowa wycena. Kwota dostawy z koszyka bez adresu nie jest samodzielnym dowodem dostawy do domu. Wynik oznaczamy „taryfa Polska”, bez deklarowania wyceny konkretnego kodu.

| Czarne uchwyty | Materiały | Kurier | Razem |
| ---: | ---: | ---: | ---: |
| 1 | 12,99 zł | 14,95 zł | 27,94 zł |
| 4 | 51,96 zł | 8,95 zł | 60,91 zł |
| 8 | 103,92 zł | 4,95 zł | 108,87 zł |
| 12 | 155,88 zł | 0,00 zł | 155,88 zł |
| 15 | 194,85 zł | 0,00 zł | 194,85 zł |
| 79 | 1026,21 zł | 0,00 zł | 1026,21 zł |

80 sztuk odrzucono przy zapasie 79, przed dodaniem do koszyka. 5 + 10 sztuk z dwóch pomieszczeń jest łączone w jedno zamówienie 15 sztuk. Realny SDK potwierdził 15 scenariuszy, z czego 9 pełnych koszyków; wybrany sklep, dwa kody i brak kodu, inny rozstaw, niepotwierdzone śruby, niedostateczny zapas i brak masy złotego wariantu są rozróżniane.

Wspólny remont: fronty 10 m², automatyczne opakowania V33 biały satyna, 4 arkusze P240 i Chem-Rozlew 500 ml, plus 4 czarne uchwyty. Materiały 242,10 zł + dostawy 39,35 zł = 281,45 zł. To komplet materiałów tego wariantu przy posiadanym odpowiednim detergencie i potwierdzonym pasowaniu śrub; robocizna i narzędzia są poza kwotą.

## Sprawdzenie i granice

855 testów rdzenia i 1054 współdzielonego backendu: PASS, 0 błędów, 0 pominięć. Typecheck mobile/API: PASS. Dwa podstawowe źródła HTTP 200; 66 identyfikatorów prac zachowane. Sześć rzeczywistych anonimowych koszyków z taryfą oraz odmowa dla 80 sztuk. Backend PR86: https://github.com/jakatora/przetargai/pull/86, Railway b07c023a-958a-4094-b482-ed813dd3cd54 SUCCESS; 148 plików odczytano po wdrożeniu i zgadza się z wydaniem. Zachowano 227 wcześniejszych obserwacji i 146 pozostałych plików produkcyjnych.

Katalog: 181 referencji i zdjęć, 174 produkty z aktywną ofertą, 223 oferty, 229 obserwacji źródłowych, 50 aktywnych kanałów sklepów. Nadal 7 starszych dokładnych referencji nie ma aktywnej oferty. Na tych samych 65 historycznych mapach obmiarów nadal 81/252 pozycji jest wycenionych, 171 wymaga doprecyzowania lub ofert, 11 scenariuszy ma wszystkie ceny materiałów. To nie jest 171 unikalnych produktów ani twierdzenie o gotowości wszystkich kompletów. Nowy zestaw uchwytów wymaga nowych jawnych odpowiedzi, więc nie podnosimy pokrycia starych projektów automatycznym przypisaniem produktu. Cel pozostaje aktywny.

## Interfejs i zapis projektu

Własny projekt proj_mvt3zx0l2wtqgn532 utworzono przez kreator. Wybrano 15 czarnych uchwytów, zmierzony rozstaw 128 mm i potwierdzone śruby M4×22. Porównanie pokazało 194,85 zł materiałów + 0,00 zł dostawy oraz zdjęcie produktu i zapas 79 sztuk. Następnie w edytorze zmieniono liczbę na 4 i nazwę na „Test kompletu — 4 uchwyty NYXA z dostawą”. Zapis przeliczył 51,96 zł + 8,95 zł = 60,91 zł. Przeładowanie i ponowne otwarcie porównania potwierdziło 4 sztuki, ten sam kod 00-001 i kwotę 60,91 zł. Przy zmianie nie pozostawiono starego wyniku 194,85 zł; pokazano sprawdzanie koszyków.

Dowody: work/catalog-wave87-fifteen.jpg i work/catalog-wave87-four.jpg oraz pełne odczyty AX. Sprawdzono Expo Web na localhost:8082 w widoku 1280×720, nie fizyczny telefon. Nie zmieniano innych projektów ani wyboru prac wspólnego koszyka. Pozostawiono 4 czarne uchwyty i kod 00-001.

Ścieżka pieniędzy: źródłem są aktualne kwoty brutto z natywnego koszyka i jawna taryfa kuriera. Kwoty są sumowane w całkowitych groszach, z pełną liczbą sztuk i jedną dostawą na zamówienie. Kontrole Mam/Kupione są ograniczone do właściwego projektu, wariantu i wystarczającej ilości. Rzeczywisty HTTP do sklepu, produkcyjny SDK i interfejs potwierdzają działanie; same testy jednostkowe nie stanowią jedynego dowodu.
