# W200 — dokładne ilości malowania i druga oferta farby

Stan 2026-11-02: W200 wdrożona i odebrana. API: 0d448bb / f9998b84-c3dd-46f3-a6b1-7fe7e5390a6c SUCCESS; WWW: ba7d745 / f1b36f56-a8f3-4465-b185-399a86b07789 SUCCESS. Kwoty niżej są historycznym dowodem odbioru, nie aktualną ofertą po wygaśnięciu wyceny.

## Korekta diagnozy W199

Lokalne dwa braki farby i gruntu były skutkiem przeterminowanego seeda, bez aktualnego cache ani odświeżenia. Produkcja rozpoznaje wszystkie cztery pozycje tego samego żądania. Oryginalny odczyt publiczny W200: 26354 gr materiałów + 4890 gr dostaw = 31244 gr, status needs_delivery_costs z powodu niepotwierdzonych alternatyw. To historyczna kalkulacja przed poprawką ilości gruntu. W199 nie ujawniła rzeczywistych dwóch braków katalogu; nie zastępować istniejących produktów innymi wariantami.

## Problem ilości, nie ceny

- Dla 23,81 m², dwóch warstw i wydajności 10 m²/l potrzeba 5,0001 l farby wraz z istniejącym zapasem 5%. Poprzednia formuła obcinała to do 5 l, przez co brakowało drugiej puszki.
- Dwa pokoje po 11,91 m² wymagają razem 5,0022 l. Sumowanie uprzednio obciętych ilości ponownie ukrywało drugą puszkę.
- Grunt miał zużycie zależne od wydajności farby. Universalgrund wymaga osobnego zużycia oraz liczby aplikacji: domyślnie 0,15 l/m², jedna aplikacja; dla bardzo chłonnego podłoża producent opisuje dwukrotną aplikację. 40,5 m² daje 6,075 l przy jednej aplikacji.
- Nowy model wall-painting-v2 zachowuje dokładne litry przed doborem puszek. Historyczne wyliczenia i deklaracje posiadania wymagają jawnego przeliczenia/potwierdzenia; zapisane JSON nie są nadpisywane.
- Nie zmieniono globalnego formulaBuilder ani pozostałych identyfikatorów prac i pól. Pozostałe formuły wymagają osobnego audytu.

Źródło techniczne: [Knauf Universalgrund K451c, 08/2026](https://knauf.com/api/download-center/v1/assets/3ed7306f-27be-4d9d-a14d-388477a68c24?country=pl&download=true). Źródło produktu: [Realbud 5 l, GTIN 5901793357737](https://realbud.com/pl/p/Grunt-KNAUF-Universalgrund-5-L-Srodek-gleboko-gruntujacy/75056675). Cena referencyjna 43,92 PLN pochodzi z odczytu 2026-11-02T09:37:21.218Z; nie jest fikcyjną podwyżką względem innego sklepu.

## HIPPER — ten sam wariant, dodatkowa oferta

[Śnieżka Barwy Natury 173, 5 l](https://hipper.pl/sniezka-barwy-natury-bialy-173-5l-farba-lateksowa-956234361): GTIN 5903973139188, produkt 956234361, jednostka sklepu 956413761. Jest to ta sama tożsamość co [dotychczasowa Sewera](https://sklep.sewera.pl/barwy-natury-173-majowa-konwalia-5l-p7136), nie nowy odcień ani nowy produkt referencyjny. Natywna sztuka oznacza całą puszkę 5 l. Fotografia pochodzi z natywnej karty, bez generowania ani kopiowania pliku obrazu do repozytorium.

Odczyt 2026-11-02T09:59:22.030Z: 9999 gr brutto. Dwie niezależne sesje anonimowe po pięć rzeczywistych żądań potwierdziły:

| Liczba puszek | Materiały | Kurier InPost | Do zapłaty | Sprawdzenie UTC |
| --- | ---: | ---: | ---: | --- |
| 1 | 99,99 PLN | 18,90 PLN | 118,89 PLN | 09:59:26.724 |
| 2 | 199,98 PLN | 18,90 PLN | 218,88 PLN | 09:59:32.842 |

To taryfa krajowa PL z rzeczywistego całego koszyka, a nie wycena indywidualna dla kodu pocztowego. Zajawka „od 17,90” dotyczy innej formy dostawy i nie została wykorzystana. Wybrane PayU bez opłaty; sprawdzono końcowe wiersze, jednostki, ilości i widoczną sumę. Nie złożono zamówienia, nie podano danych klienta i nie akceptowano regulaminów. Oryginalne ważności skończą się o 10:09:26.724 / 10:09:32.842 UTC i nie są przedłużane przez raport.

Seed 373 → 374: poprzednie 373 obserwacje zachowane w identycznej kolejności i treści, jedna nowa rzeczywista obserwacja. Nie dopisano historii ani zmyślonej zmiany ceny. To rozszerzenie liczby ofert, nie liczby odrębnych produktów.

## Walidacja i pozostałe kroki

Lokalne źródła D: 592 testy mobile PASS (6 nowych, wcześniej 6 RED), 244 testy adapterów PASS (6 nowych HIPPER), 0 skip. Typy mobile i API sprawdzone; wyniki i logi w artefaktach. Fixture powstała z dziesięciu natywnych żądań, identyfikator sesji zamaskowany; usunięto nieużywane metadane i dekoracje bez zmiany kwot. Pierwszy runner CJS nie obsługiwał import.meta w nowym teście: poprawiono statyczny import fixture JSON, następnie pełne 244 PASS. Dwa wcześniejsze błędy asercji dotyczyły nieistniejącego pola obserwacji i dokładniejszej przyczyny odrzucenia SKU; poprawiono testy, bez osłabienia walidatora.

Przed wdrożeniem: zamrozić i sprawdzić czysty checkout bez cudzego WIP, zbudować nowy WWW i API, sprawdzić rzeczywisty formularz zużycia/liczby aplikacji, starą kalkulację wymagającą przeliczenia oraz wspólny koszyk dwóch pomieszczeń. Kandydat musi korzystać z aktualnych obserwacji cen; nie powtarzać błędu starego seeda. Następnie świeży snapshot wspólnego backendu, pełne regresje, PR i deployment oraz publiczny odbiór prawdziwych wycen i zachowania historii. Cudze zmiany ean-overlay, mappings, lockfile, .atlas i PROPOZYCJE pozostają poza zakresem.

Artefakty: G:/Projekty/asystent-remontu-work/wave200-20261102. Ważne pliki: public-paint-initial.json, existing-paint-reads.json, painting-red.log, painting-green.log, mobile-work-tests.log, adapter-regression.log, hipper-paint-observation.json, hipper-paint-records.json i hipper-paint-native.json. Cel rozwoju pozostaje aktywny.


## Odbiór wdrożenia — 2026-11-02

Finalny dowód 2026-11-02T10:30:26.749Z: lokalnie i publicznie 17 scenariuszy malowania/10 rzeczywistych odpowiedzi API oraz 18 scenariuszy tynkowania/8 odpowiedzi, po 5+7 rzeczywistych HTTP. Bez podmiany wycen, błędów strony i HTTP429. Dodano jasny komunikat potwierdzenia ilości farby/gruntu z przyciskiem Przelicz ilości materiałów; rzeczywiste kliknięcie prowadzi do obmiarów, zapis usuwa ostrzeżenie i odtwarza pełną kalkulację. UI-only ba7d745 różni się od 0d448bb wyłącznie tym ekranem; typy czystego checkoutu PASS.

Native odczyty potwierdziły pełne malowanie40,5m²:30746+4890=35636gr; dwa pokoje po11,91m²:27688+5440=33128gr (HIPPER/Rab-Dom/Realbud). Są to różne wymagania i koszyki; różnicy nie oznaczać jako zmiany ceny. Zmienione zużycie gruntu0,2l/m²×2aplikacje daje16,2l i widoczną pełną kwotę44420gr. Wybór samego HIPPER pokazuje21888gr za farbę z dostawą oraz trzy brakujące materiały, bez udawania kompletnego remontu. Fotografia w interfejsie korzysta ze zweryfikowanego obrazu katalogowego tego samego GTIN; początkowy test błędnie oczekiwał nadpisania jej URL-em HIPPER i został poprawiony po inspekcji DOM.

Katalog251referencji/219potwierdzonych/334oferty/32luki,0fałszywych potwierdzeń. Seed373→374, cały poprzedni prefix zachowany; pozostałe148/150plików API identyczne. Cache370→371, wszystkie stare obserwacje zachowane. Historia13831→14143,13817 dawnych zachowanych,14 usunięto wyłącznie przez limit60punktów na serię,0niewyjaśnionych strat. Brak rzeczywistych zmian cen w najnowszych odczytach; nie dopisano fikcyjnych spadków. Pierwszy verifier czasu odpadł na różnicy zegarów142ms (serwer przed zegarem lokalnym); sprawdzono ją i zastosowano istniejącą granicę klienta5000ms bez zmiany oryginalnych dat.

PR180 https://github.com/jakatora/przetargai/pull/180: head29a0e870927f617e1bfdf20168cd59bf2a044252, base2b5e3a90a3150c464f4d1e94d02b30e5b46fcbc6, merge5153399e5d0407511512758e19933ae2bd826675. StatusyGitHub puste, nie deklarować zielonegoCI; lokalne237pricing/165APIlib/244adapter/16reader/30transport/1064shared/592mobilePASS,0skip. BundleSHA256 5986148738aea781d75f38c4bd7a2c8dff501ab29de2bd669b11ccedb4f26184. WWW63zweryfikowanepliki/17319524B,82wartości vaulta sprawdzone,0wycieków.

Własne serwery kandydata zatrzymane39193/61651exit0; Edgekonteksty QA zamknięte, publiczne QA73385/97253exit0. Oryginalne wyceny końcowe ważne do10:32:54–10:38:36UTC (malowanie) i10:32:57–59UTC (tynkowanie), nie odnawiać plików. Następne polecenie użytkownika: build i publikacjaAndroid/iOS; osobny worktreeG:/Projekty/asystent-remontu-release-20261102, źródło startoweba7d745, artefaktynative-release-20261102. To nie wydanie natywne; budowa i zgłoszenia do sklepów w toku. Cel aktywny.
