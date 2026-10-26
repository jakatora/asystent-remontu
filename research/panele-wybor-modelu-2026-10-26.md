# Wybór modelu paneli w wycenie — 2026-10-26

Użytkownik może wybrać konkretny model paneli w kosztorysie projektu oraz w koszyku całego remontu. Dostępne są trzy istniejące referencje: Oakland 2,51 m², Kronospan Toledo 2,22 m² i Classen Dąb Niasa 1,973 m². Każda zachowuje własny kod EAN, opis, zdjęcie, parametry i źródło. Karta nie podaje historycznych cen referencyjnych jako aktualnych ofert. Po zatwierdzeniu wyboru serwer ponownie sprawdza oferty, pełne paczki, sprzedawcę i dostawy.

Źródła parametrów: [Oakland](https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472), [pierwotne Toledo](https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd), [Classen Niasa](https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535). To różne produkty: użytkownik sprawdza dekor, zamek, grubość i warunki montażu, a następnie jawnie zatwierdza zmianę. UI ostrzega przed mieszaniem modeli w jednej podłodze.

## Zachowanie wyboru i obmiarów

Zmiana zachowuje surowy metraż, identyfikatory materiałów i etapów, obmiary oraz pozostałe materiały. Usuwa stare dane pomocnicze o paczkach i zastępuje tożsamość produktu wybranym EAN. Nie przenosi starej ceny, nie przelicza kosztów lokalnie i nie zaokrągla każdego pomieszczenia osobno. Wielkość rzeczywistych opakowań i kwoty w groszach pochodzą z API.

Wybór jest zapisany lokalnie pod `remont.laminate-choice.v1:<projectId>`. Wspólny koszyk odczytuje wybory poszczególnych projektów i stosuje je po wykluczeniu materiałów posiadanych lub kupionych. Osobny wybór w koszyku nie nadpisuje decyzji w projektach. Zmiany stosuje się jednokrotnie do pierwotnej tożsamości materiału; nie tworzą łańcucha automatycznych zamienników. Użytkownik może przywrócić poprzedni produkt.

Nieprawidłowy zapis, obcy produkt lub konflikt EAN/GTIN wstrzymuje wybór/wycenę. Nie wolno cicho wrócić do innego produktu i pokazać go jako pełny zakup. Odczyt i zapis są odrębnie komunikowane; błąd zapisu nie usuwa wyboru z bieżącej wyceny. Wybory są izolowane po projekcie. Zmiana modelu lub obmiarów unieważnia poprzedni wynik i wycenę dostawy. Historia zmian cen zachowuje tożsamość ofert: zmiana modelu nie oznacza podwyżki tego samego produktu.

## Walidacja

**420 testów PASS, 0 skip**: kalkulatory, pricing, API i siedem nowych sprawdzeń wyboru paneli. Typecheck mobile/API PASS. Walidacja chronionych identyfikatorów przeszła, a negatywne mutacje usunięcia ID/eksportu i wyczyszczenia rejestru zostały wykryte. Pierwszy nowy test HTTP używał nieistniejącego pola `quantity` skonsolidowanej pozycji; poprawiono go do rzeczywistego kontraktu `totalQuantity`, bez zmiany obliczeń.

Rzeczywisty HTTP lokalnego serwisu potwierdził, że pierwotne Toledo pozostaje bez oferty, a jawny wybór Niasa daje właściwy EAN 4003992571974, sumę metrażu i pełne opakowania. Przywrócenie produktu odtwarza brak oferty, bez fikcyjnej ceny. Przetestowano również niezmienność obmiarów, GTIN, nieznane identyfikatory, niezgodne jednostki, duplikaty zapisu, brak kaskadowania wyborów i przekazanie decyzji projektu do wspólnego koszyka po filtrze „Mam/Kupione”.

Rzeczywisty HTTPS działającej produkcji potwierdził sumowanie 1,1 + 1,1 = 2,2 m², dwie paczki Niasa po 1,973 m², 224,84 zł materiałów oraz 44 zł dostawy — razem **268,84 zł**. Wycena transportu pochodzi z rzeczywistego koszyka LiderzyCen, `Kurier P2 / Przelewy24`, podstawa `retailer_basket_national`, zakres PL. Zapytanie zawierało publiczny kod demonstracyjny 00-001; wynik nie udaje wyceny pod pełny adres. Wybrany LiderzyCen w trybie odbioru dał 224,84 zł materiałów, z obowiązkiem potwierdzenia lokalnego odbioru. Przywrócenie Toledo odtworzyło brak oferty. Koszyk regresyjny potwierdzono ponownie na 790,83 zł. Dowód `work/catalog-wave28-production-proof.json`.

UI dla własnego dodatku 3,3 m² Toledo pokazał po wyborze Niasa dwie paczki za 224,84 zł oraz 44 zł dostawy. Wraz z wcześniejszym koszykiem całkowita suma wyniosła **1059,67 zł**: 862,27 zł materiałów i 197,40 zł dostaw. Wybór poprzedza wyraźna informacja o innym produkcie. Dowody `outputs/catalog28-niasa-selected-20261026.txt`, `catalog28-niasa-choice-20261026.png` i `catalog28-niasa-total-20261026.png`.

Ponowne otwarcie zachowało model Niasa, 3,3 m² surowego zapotrzebowania oraz sumę 1059,67 zł (`catalog28-niasa-reloaded-20261026.txt`). Przywrócenie poprzedniego produktu natychmiast odtworzyło brak oferty Toledo, bez starego wyniku z dostawą (`catalog28-original-model-restored-20261026.txt`). Następnie usunięto wyłącznie własny dodatek, pozostawiając 3 prace, Standard, 1 posiadaną pozycję, kod 00-001, brak wybranego sklepu i ponownie 637,43 + 153,40 = 790,83 zł (`catalog28-original-basket-restored-20261026.txt`). Pomocniczą kartę badania zamknięto, a podgląd aplikacji pozostawiono otwarty. Dane użytkownika i wcześniejsze wybory projektów zachowano.

## Dalsze sprawdzanie katalogu

Zidentyfikowano [GoodHome Toledo 2,22 m²](https://www.castorama.pl/panele-podlogowe-laminowane-goodhome-toledo-ac4-2-22-m2/5059340809854_CAPL.prd) pod innym EAN 5059340809854. Bezpośredni DOM/AX i pierwotne JSON-LD potwierdziły obecnie `SoldOut`, bez aktywnego zakupu i bez zapasu w wybranej Warszawie Wola. Nie dodano go jako dostępnej oferty, mimo że indeks wyszukiwarki pokazuje dawny przycisk zakupu. Nie utożsamiono go z pierwotnym EAN 5907555422774. Dowód `work/catalog-wave28-research/goodhome-toledo-unavailable-browser.json`.

Świeży HTTP mapy Eurosan zwrócił 200, ale nie potwierdził obecności ani dostępności Facile 50. Indeks wyszukiwarki z ceną 143,50 zł nie został użyty jako oferta. Buy365 nadal wymaga potwierdzenia rzeczywistego stanu i terminu, a pozostałe stare warianty pozostają otwarte.

Pokrycie dotychczasowego katalogu nadal wynosi **97/103 produktów, 6 braków**, zdjęcia 103/103. W tej zmianie nie dodano nowych obserwacji cen ani źródeł backendu. Celem pozostaje pełny katalog, rzeczywiste dostawy i lokalne ceny/odbiór, także dla pozostałych materiałów. Nowy wybór paneli umożliwia zakup innego wskazanego produktu bez fałszowania dostępności starego SKU. Wspólny backend i jego pozostałe aplikacje nie wymagają wdrożenia tej zmiany; działa ona w aplikacji na istniejącym kontrakcie.
