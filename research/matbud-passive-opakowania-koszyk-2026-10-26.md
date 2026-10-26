# Yetico Passive 15 cm: paczki, cena i cały koszyk Matbud

Stan badania: 2026-10-26. Nowa oferta i adapter potwierdzone prawdziwym anonimowym HTTP, zbudowanym backendem lokalnym i działającą produkcją.

## Produkt i jednostka sprzedaży

- Karta: https://centrummatbud.pl/Styropian-grafitowy-15cm-Yetico-Gama-Passive-Fasada-033-p131345
- `sourceId=matbud-yetico-gamma-passive-033-15cm`, produkt `131345`, symbol `FASADA 033 15CM`, producent `982` Yetico.
- Sklep nie publikuje GTIN. Zatwierdzone powiązanie producenta: EAN `5902578307268`, Gamma Passive Fasada 15 × 50 × 100 cm, wiersz 752, strona PDF 34. Frezowane 15 cm ma inny EAN `5902578307442`, wiersz 769.
- Źródło EAN: https://yetico.com/wp-content/uploads/2026/01/ecommerce_regulamin-programu-motywacyjnego_jubileuszowa-ekstraklasa-yetico_aktualizacja.pdf
- Aktualnie podlinkowana karta techniczna PL: https://yetico.com/wp-content/uploads/2022/09/karta_tech_gamma_passive_fasada.pdf, strona 5. Obejrzano wyrenderowaną tabelę: 150 mm, 4 płyty, 0,3 m³, 2 m² dla gładkich; frezowane 0,287 m³ / 1,91 m². Obejrzano również stronę 34 tabeli EAN.
- Szczegółowy opis sklepu potwierdza grafit, λ 0,033, 15 cm, 100 × 50 cm, 4 płyty / 0,3 m³ / 2 m². Ogólne zdanie „proste / frezowane” nie zastępuje tych wymaganych faktów opakowania.
- Natywne API: `M2`, cena **29,99 zł brutto/m²**, minimum 100 m², krok / box 2 m², stan 360 m². Cena fizycznej paczki **59,98 zł / 2 m²**, minimum **50 paczek**, krok **1 paczka**, dostępne 180 paczek. Kwoty brutto w groszach; nie przeliczamy netto przez VAT.
- Zdjęcie tej karty `307747` jest przypięte do odczytanego wariantu. Natywny kod jednostki, krok, pudełko, minimum, tytuł, producent i SKU muszą pasować przy każdym odświeżeniu. Rozbieżności odrzucają ofertę.

## Rzeczywisty koszyk i dostawa

Każda sesja HTTP ma własny pusty anonimowy koszyk; bez cookies użytkownika, danych klienta, zgód, płatności i zamówienia. Odczytano ponownie ten sam identyfikator koszyka, sprawdzono wszystkie pozycje, ilości i ceny, a następnie natywny kalkulator dostawy.

| Zakup | Natywna ilość | Materiały brutto | Potwierdzona dostawa |
|---|---:|---:|---:|
| 50 paczek Passive | 100 m² | 2 999,00 zł | 0,00 zł |
| 51 paczek Passive | 102 m² | 3 058,98 zł | 0,00 zł |
| 180 paczek Passive | 360 m² | 10 796,40 zł | brak metody dostawy do domu |
| 181 paczek Passive | żądane 362 m² | brak pełnej wyceny | `insufficient_stock` |
| 50 paczek białego Gamma + 51 paczek Passive | 50 OP + 102 m² | 6 545,98 zł | 0,00 zł za jeden wspólny koszyk |

Sklep cicho obcina żądane 362 do 360 m² mimo `canBuy=true`; adapter nie uznaje tego za możliwość kupienia 181 paczek. Dla dostępnych 180 paczek rzeczywista lista metod nie zawiera transportu do domu. Nie wyprowadzamy reguły bezpłatnej dostawy z samego tekstu karty ani nie zgadujemy przyczyny ograniczenia.

Potwierdzony transport to `s182be0c5c`, „Styropian, DARMOWA DOSTAWA !”, `personal=no`, płatność przelewem bez dopłaty, kraj PL. Widoczny jako krajowa wycena koszyka, nie jako sprawdzenie pełnego adresu. Sprawdzono 00-001 i 80-001. Wysyłka „na zamówienie”; anonimowa metoda odbioru nie potwierdza lokalnego zapasu ani terminu, dlatego `pickupRequiresConfirmation=true` pozostaje w mocy.

## Implementacja i weryfikacja

- Rozszerzono restrykcyjny adapter Sky-Shop wyłącznie o zrecenzowany `131345`; `133024` i pozostałe ID nie są dopuszczone. Karta 133024 ma ten sam symbol, ale inną cenę/minimum, więc nie może być automatycznie zamieniana po SKU.
- Ceny ofert i liczby paczek są fizyczne. Do koszyka sklepu trafiają właściwe natywne jednostki: 51 paczek → 102 m². Mieszany koszyk OP/M2 sprawdzany w całości, bez sumowania niepotwierdzonych dostaw częściowych.
- 362 testy aplikacji/kalkulatora/API i 1054 wspólnego backendu PASS, 0 skip. Typecheck API/mobile i kontrola chronionych 66 ID z negatywnymi mutacjami PASS.
- Lokalny rzeczywisty HTTP zbudowanego backendu: 78/103 referencje, 25 braków, 104 aktywne oferty, 35 sklepów, 20 integracji dostawy. Wszystkie 103 referencje wysłane do API; pełna suma pozostaje null przy brakach. Zdjęcia 103/103.
- Minimum 50 obowiązuje po konsolidacji pomieszczeń: 50 + 52 m² → 51 paczek, nie 100. Oryginalny koszyk trzech prac nadal 790,83 zł.
- Poprzednie 105 obserwacji pozostawiono bez zmian; dodano jedną. Cudzy WIP, manifesty/lockfile, migracje i identyfikatory prac zachowane.

Badanie wyszukiwarki: stary endpoint `/search?action=quick_search&json=1` zwraca puste wyniki także dla znanej istniejącej Gamma. Nie dowodzi braku produktów. Aktualne wyszukiwanie UI `/category/?q=Passive` zwróciło 98 wyników i nowe karty. Następne badania Matbud powinny używać aktualnej ścieżki; nie powtarzać pozornie negatywnych testów starego endpointu.

Dowody w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave20-research/passive-delivery-native-proof.json`, `passive-live-adapter-proof.json`, `yetico-ean-p34.png`, `yetico-passive-packing-p5.png`; `work/catalog-wave20-local-live-proof.json`, `catalog-wave20-core-tests.log`, `catalog-wave20-shared-tests.log`, `catalog-wave20-api-typecheck.log`, `catalog-wave20-mobile-typecheck.log`.

Pełny cel nadal aktywny: pozostałe 25 referencji, szersze porównanie ofert i potwierdzone dostawy Castorama/OBI oraz ceny/stany lokalne. Liczba produktów z ofertami nie oznacza dostawy każdego koszyka ani całego rynku materiałów budowlanych.

## Wdrożenie i dowód produkcyjny

- PR https://github.com/jakatora/przetargai/pull/27, merged; source `fa0d6cebf1a4843356f9b339d5e4358449398668`, merge `306818aa9428b4be0756a72660968a07559fed73`.
- Railway `b6217628-14e5-45fb-9f95-b43dd1ec8b74`, SUCCESS 2026-10-26T03:54:45.222Z. Zachowano wszystkie pliki istniejącego serwera; zmieniły się tylko `src/services/remont-pricing.cjs` i `src/data/remont-verified-offers.json`. Świeży snapshot SHA256 `6e4ca2439925afd0209c04e5caa7d24ba0a11b1f075b8ead62fcdc69ba527700`; przed wdrożeniem porównano ponownie wszystkie 148 plików.
- Produkcyjny HTTPS potwierdził **78/103 referencje, 25 braków, 104 aktywne oferty, 35 sklepów, 20 integracji dostawy**, wszystkie wcześniejsze obserwacje zachowane. Dokładne wyniki kwot i odrzuceń jak w tabeli powyżej; 103 referencje wysłane w jednym żądaniu, brak pełnej sumy dla niekompletnego zestawu. Health 200, bramka `/auth/me` 401 zachowana.
- Kolektor sam ponownie odczytał nową ofertę 2026-10-26T03:55:24.979Z, później niż seed; `active=true`, `error=null`, przebieg zakończony (`running=false`). CI GitHub nie wystawiło checks/statusów; nie nazywamy tego zielonym CI. Dowód testów to lokalny rzeczywisty bundle i działający serwer.
- UI `/renovation-basket`: 102 m² → 51 × 2 m², 3 058,98 zł + 0 zł dostawy, minimum 50 paczek / 100 m², zdjęcie i link. Z trzema pierwotnymi pracami pełny koszt 3 849,81 zł = 3 696,41 + 153,40. Reload zachowuje ilość i cenę.
- Dla 360 m² UI pokazuje brak pełnej wyceny i „Brak potwierdzonej dostawy kurierskiej” dla Matbud, pozostawiając osobno samą cenę materiałów. Brak darmowej pełnej wyceny przy braku natywnej metody.
- Dla 362 m² UI pokazuje brak pełnej wyceny i „Sprawdź dostępność”; nie reklamuje niedostępnych 181 paczek jako najtańszego zakupu. Dowód `outputs/passive-181-insufficient-stock-20261026.txt`. Własną pozycję kontrolną usunięto po testach.
- Dowody: `work/catalog-wave20-production-proof.json`, `catalog-wave20-collector-proof.json`, `catalog-wave20-predeploy-baseline-proof.json`; `outputs/passive-51-caly-remont-20261026.png`, `passive-51-po-odswiezeniu-20261026.txt`, `passive-180-brak-dostawy-20261026.txt` w katalogu czatu. Frontend lokalny Expo; bez nowego wydania mobilnego.
