# 12 bieżących ofert Castoramy z jawną weryfikacją — 2026-10-26

Zweryfikowano dokładne karty brakujących produktów w rzeczywistej przeglądarce. Odczytano opublikowane w DOM dane Product/Offer, nagłówek, kod produktu, widoczną cenę za zakupione opakowanie i aktywny przycisk koszyka. Nie korzystano z cen indeksu wyszukiwarki ani jego daty pobrania. Dodanie tych pozycji daje **91/103 produkty z ofertą, 12 brakujących, 117 aktywnych ofert, 36 sklepów**. Zdjęcia pozostają 103/103; 119 obserwacji, z których dwie Rodimax są nadal wyłączone.

To **12 ręcznych odczytów kart**, z ważnością dokładnie 24 godzin od rzeczywistego pobrania. Nie jest to ukończona integracja automatycznego odświeżania Castoramy. Zwykły odczyt HTTP z serwera nadal zwraca 503; źródła zachowują odpowiedni błąd i pierwotną datę ręcznego potwierdzenia. Nieudana próba ani restart nie przedłużają ważności. Udany późniejszy odczyt HTTP zastępuje obserwację i usuwa oznaczenie ręczne.

| Produkt / fizyczne opakowanie | EAN | Cena widoczna za opakowanie |
|---|---|---:|
| [Farba biała, 10 l](https://www.castorama.pl/farba-biala-mat-10-l/3663602567240_CAPL.prd) | 3663602567240 | 54,98 zł |
| [GoodHome biały mat, 10 l](https://www.castorama.pl/farba-goodhome-sciany-i-sufit-bialy-mat-10-l/5059340271620_CAPL.prd) | 5059340271620 | 79,98 zł |
| [Kreisel GW180, 20 kg](https://www.castorama.pl/gladz-pod-walek-gw180-20-kg/5907418038791_CAPL.prd) | 5907418038791 | 38,48 zł |
| [Atlas Plus promocja, 25 kg](https://www.castorama.pl/klej-wysokoelastyczny-atlas-plus-odksztalcalny-25-kg/5905400658866_CAPL.prd) | 5905400658866 | 63,98 zł |
| [Norgips CD60, 0,6 mm, 3 mb](https://www.castorama.pl/profil-sufitowy-norgips-cd60-0-6-mm-3-mb/5907651698899_CAPL.prd) | 5907651698899 | 20,98 zł |
| [Cersanit Seno, jeden WC z deską](https://www.castorama.pl/kompakt-wc-cersanit-seno-bezkolnierzowy-3-5-l-z-deska-wolnoopadajaca/5902115720833_CAPL.prd) | 5902115720833 | 488,00 zł |
| [AKS YDYp 3×1,5, krąg 100 mb](https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-1-5-mm2-450-750-v-100-mb/5904617573771_CAPL.prd) | 5904617573771 | 388,00 zł |
| [AKS YDYp 3×2,5, krąg 100 mb](https://www.castorama.pl/przewod-aks-zielonka-ydyp-3-x-2-5-mm2-450-750-v-100-mb/5904617573764_CAPL.prd) | 5904617573764 | 598,00 zł |
| [Elektro-Plast, paczka 10 puszek](https://www.castorama.pl/puszka-podtynkowa-elektro-plast-60-gleboka-laczeniowa-z-wkretem-10-szt-/5901752637337_CAPL.prd) | 5901752637337 | 15,24 zł |
| [Knauf MP75, 25 kg](https://www.castorama.pl/tynk-maszynowy-knauf-mp-75-25-kg/5902367206352_CAPL.prd) | 5902367206352 | 25,48 zł |
| [OPP Klasyk, skrzydło 70 prawe](https://www.castorama.pl/drzwi-z-podcieciem-opp-klasyk-70-prawe-biale/5063022524034_CAPL.prd) | 5063022524034 | 208,00 zł |
| [PerfectDoor, baza 80–100 mm prawa, sonoma](https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd) | 5902659279118 | 418,00 zł |

Stan opublikowano między 2026-10-26T06:04:22Z i 06:34:36Z. Te same chwile określają ważność do 2026-10-27, bez przesuwania terminu przy ponownym uruchomieniu skryptu importu. Zmieniono odpowiednie ceny referencyjne i daty, zachowując ID, wielkości opakowań i jednostki. Nie porównuje się nowych cen z dawną ceną referencyjną jako rzekomą zmianą rynku — alert wymaga wcześniejszej obserwacji tej samej oferty.

## Zakres i zabezpieczenia

Przeglądarka miała kontekst demonstracyjny 00-001 / Castorama Warszawa 5 Wola. Do ceny użyto wyłącznie oferty `Home Delivery` z PLN i `InStock`, bez `availableAtOrFrom`. Odrzucono ceny/stany `Click and Collect` oraz `In-Store Purchase`. Lokalnych 70/102/90 sztuk nie zapisano jako krajowego zapasu. Nie potwierdzono kosztu dostawy dla innych kodów ani dostępności lokalnego oddziału użytkownika. Interfejs pokazuje ręczną weryfikację, jej datę wygaśnięcia oraz potrzebę potwierdzenia dostępności i transportu dla własnego kodu.

Hasło „dostawa za 1 zł”, kupon do kolejnych zakupów, cena netto lub stawka za litr/metr/sztukę wewnątrz paczki nie są kosztem transportu ani ceną pełnego opakowania. Wiążąca cena obserwacji musi zgadzać się z widoczną ceną zakupu. 11 puszek wymaga dwóch paczek po 10; 110 mb przewodu wymaga dwóch kręgów po 100. SKU Atlas 25 kg nie jest zamienione na zwykły 20 kg, MP75 nie na MP75L, a skrzydło 70 prawe nie zastępuje wariantu 80 lewego wybranego przez użytkownika. Cena bazy ościeżnicy nie udaje kompletnej ościeżnicy z osobnymi opaskami.

Na karcie farby ekonomicznej nie ma zadeklarowanej marki. Jawnie przejrzane powiązanie dotyczy tylko tego konkretnego EAN/nagłówka; marka i producent pozostają nieznane. Inne puste konfiguracje marki są odrzucane. Import jest lokalną operacją operatora na dowodzie odczytu, bez publicznego endpointu przesyłania obserwacji lub dowolnych URL. Podpis dowodu obejmuje rzeczywiście pobrany rekord, a nie spreparowaną odpowiedź HTTP.

Nie dodano cen powierzchniowych za m² jako cen całych paczek. Pozostałe 12 referencji nadal wymaga oddzielnego potwierdzenia: Budmat UD27 3 m, Facile 50, Toledo 2,22 m², Diall PE20 m², Petro G2, Nati Bianco struktura, Fola 50 mb, parapet Form 216 cm, Archi 80 lewe, Arilla SPC 2,5 m², Ragga LVT 1,3 m² i Corksystem 6 m². Nie zmieniono kodów ani nie podstawiono podobnych wariantów dla licznika. Automatyczna dostawa obejmuje nadal 20 integracji; Castorama/OBI pozostają `retailer_access_required`.

## Weryfikacja

389 testów aplikacji/kalkulatorów/pricing/API PASS, 0 skip. Osiem nowych przypadków obejmuje 12 natywnych kart, kontrolę pełnego opakowania, waluty, kodu, wariantu, aktywnej sprzedaży wysyłkowej, wygaszanie, restart, nieudane odświeżenie i udane przejście na HTTP. Testy negatywne nie pozwalają zamienić ceny lokalnej, obcej marki, innego EAN, niepotwierdzonej powierzchni lub ceny jednej puszki na porównywalną pełną ofertę. Typecheck API/mobile i 66 chronionych ID z negatywnymi mutacjami PASS.

Rzeczywisty HTTP gotowego bundle potwierdził 91/103 i 12 brakujących, wszystkie nowe ceny/jednostki i oznaczenia. Wspólny koszyk 110 mb przewodu 3×1,5 + 11 puszek + 2 WC = 1782,48 zł materiałów, bez potwierdzonej wysyłki. Tryb odbioru ma 0 zł transportu, bez kosztu własnego dojazdu i gwarancji lokalnej ceny/zapasu. Z wysyłką pełna suma pozostaje pusta. Pierwotny koszyk nadal 790,83 zł.

Dowody czatu: `work/catalog-wave24-research/*-browser.json`, `reviewed-observations.json`, `http-proof.json`, `work/catalog-wave24-local-live-proof.json`, `catalog-wave24-core-tests.log`. Nowy snapshot 148 plików produkcji ma SHA256 `13dd6886fc058671514be4c9ae40e381353f4f790c5b3bf8a621f4df6d0aae16`; zachowano wszystkie 107 dotychczasowych obserwacji i dołożono 12. Cel pozostaje aktywny.

## Wdrożenie i sprawdzenie rzeczywistego interfejsu

Wspólny backend: dodatkowo 1054 testy uruchomione szeregowo PASS, 0 skip. Razem z 389 testami aplikacji daje to **1443 testy PASS, 0 skip**. Nie doliczano powtórnego przebiegu ośmiu testów po usunięciu zbędnych opisów marketingowych z fixture. Kontrole typów i chronionych ID zakończyły się pomyślnie.

[PR30](https://github.com/jakatora/przetargai/pull/30) scalono: źródło `514dc14db79a6c83b7555f1dd1401d5a4673c22f`, merge `7552ae8430d586c76e229b56ff51f775ff16ef37`. Wdrożenie Railway `d22fdcc3-d82d-4d1c-95eb-6d219e2b2a62` ma status SUCCESS od `2026-10-26T06:54:31.765Z`. Zmieniono dwa pliki backendu: bundle pricing i katalog obserwacji; dwukrotnie sprawdzono brak rozbieżności pozostałych 148 plików produkcji. Lista GitHub checks/statuses była pusta i nie stanowi potwierdzenia CI.

Rzeczywisty HTTPS produkcji potwierdził 91/103 ofert, 12 braków, 117 aktywnych ofert, ceny wszystkich nowych opakowań i ich daty ważności. Koszyk 110 mb przewodu, 11 puszek i 2 WC ma 1782,48 zł materiałów; dostawa Castoramy pozostaje niepotwierdzona i nie jest pokazywana jako pełna suma. `/health` zwraca 200, `/auth/me` bez sesji 401. Kolektor uruchomiony po wdrożeniu zwrócił dla wszystkich 12 nowych kart `retailer_http_503`; zachował pierwotne daty i ważność ręcznego odczytu. Nie jest to udany automatyczny odczyt cen. Dowody: `work/catalog-wave24-production-proof.json` i `work/catalog-wave24-collector-proof.json`.

W rzeczywistym UI dodanie 15 l farby GoodHome wymagało dwóch opakowań po 10 l za 159,96 zł. Widoczne były zdjęcie, opis ręcznej weryfikacji i ważność do 27.10, 07:06 czasu polskiego. Wybór Castoramy pokazał 702,92 zł rozpoznanych materiałów jako niepełny koszyk, bez domyślnego dopisania dostawy. Następnie usunięto wyłącznie własną dodatkową pozycję i przywrócono „Najtańszy zestaw”. Stan końcowy: 3 prace, Standard, 1 pozycja posiadana, kod 00-001, brak dodatkowych pozycji, 637,43 zł materiałów + 153,40 zł dostaw = **790,83 zł**. Dowody: `outputs/catalog24-manual-goodhome-20261026.{png,txt}`, `catalog24-selected-castorama-20261026.txt`, `catalog24-original-basket-restored-20261026.txt` w katalogu czatu.

Nie publikowano nowego binarnego wydania iOS/Android. Obce zmiany w `ean-overlay.ts`, `mappings.ts`, `pnpm-lock.yaml`, `.atlas/` i `PROPOZYCJE-COCKPIT.md` pozostawiono poza zakresem. Nadal trzeba potwierdzić pozostałe 12 produktów oraz dokończyć rzeczywiste automatyczne wyceny dostawy i odświeżanie blokowanych sklepów.
