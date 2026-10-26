# Corksystem: osobny sprzedawca i koszyk — 2026-10-26

Zweryfikowano aktualną [kartę Corksystem LVT 1,5 mm, 6 m², 1 opakowanie](https://www.castorama.pl/departments/podk-ad-pod-ogowy-corksystem-lvt-1-5-mm-pod-panele-winylowe-6-m2-1-op-/5061092900925_CAPL.prd). EAN 5061092900925, cena brutto pełnej paczki 73,99 zł. Sprzedawcą jest **Corksystem**, profil [2601](https://www.castorama.pl/verified-sellers/seller/2601), nie Castorama Polska. Dlatego oferta ma osobną nazwę sklepu **Corksystem (Castorama)** i nie łączy się z koszykiem, dostawą ani placówkami Castoramy.

Odczyt rzeczywistego DOM/AX `2026-10-26T07:36:19.342Z`, ważność dokładnie do `2026-10-27T07:36:19.342Z`. To jawne ręczne potwierdzenie na 24 godziny, a nie automatyczny adapter. Odczyt zawiera Home Delivery/PLN/InStock, natywnego sprzedawcę, aktywną sprzedaż, link do jego profilu oraz tabelę pokrycia 6 m², jednego opakowania, marki i kodu. Pierwotne obserwacje 123 źródeł zachowano bez zmian; dopisano jedną.

Pokrycie katalogu wzrasta do **96/103 produktów, 7 braków, 122 aktywnych ofert, 37 sklepów**. Zdjęcia 103/103, 124 obserwacje / 2 wyłączone Rodimax, 20 automatycznych integracji dostawy. 17 obserwacji ma ręczne potwierdzenie z terminem wygaśnięcia; liczby nie oznaczają bezterminowej dostępności ani dostawy pod każdy kod.

## Dostawa i odbiór

W rzeczywistym panelu „Sprawdź ceny i opcje dostawy” sklep podaje, że dostawę organizuje zewnętrzny sprzedawca, a ostateczne opłaty są ustalane w toku zakupu. Nie ma podstaw, aby hasło „darmowa dostawa” lub promocję Castoramy przeliczyć jako taryfę koszyka Corksystem dla kodu użytkownika. Dopóki nie ma potwierdzonej wyceny transportu, pełna suma pozostaje pusta, z powodem `retailer_access_required`.

Karta oferuje wyłącznie sprzedaż internetową. Oferty odbioru mają OutOfStock. Źródło ma `pickupUnavailable: true`; tryb odbioru nie wycenia go na 0 zł dostawy i nie kieruje użytkownika do sieci marketów Castorama. Możliwość zakupu własnej oferty Castoramy pozostaje odrębna. Kontekst przeglądarki był demonstracyjny 00-001 / Warszawa 5 Wola; nie podawano danych klienta, nie składano zamówień ani nie akceptowano umów.

## Powiązanie produktu i ceny

Obserwacja wymaga sprawdzonej konfiguracji konkretnego sprzedawcy, EAN, adresu karty, nazwy i profilu 2601. Nazwa sprzedawcy w natywnym Home Delivery musi zgadzać się z widocznym linkiem. Dla ceny bez etykiety szt./opak. wymagane są dodatkowo pierwotna tabela i jedno opakowanie w nagłówku. Nie jest to oferta 10 paczek/60 m² ani cena za pojedynczy metr kwadratowy.

Usunięcie ręcznej proweniencji z zapisanego rekordu nie pozwala ominąć wygaśnięcia. Dotyczy to także wcześniej dodanych złożonych jednostek Castoramy m²/m, których automatyczny HTTP nie potwierdza jeszcze jako pełnych opakowań. Odczyt zwykłych jednostek pozostaje bez zmian. Sukces HTTP bez dowodu pełnej jednostki nie zmienia takiej ceny w automatycznie potwierdzoną.

## Inne sprawdzone kierunki

Odkryto rzeczywisty sklep [Dekork, kolekcja LVT/SPC](https://dekork.pl/collections/pod-lvt-spc), działający na Shopify. Publiczny odczyt kolekcji 200 i produktu wskazuje dostępny podkład Dekork 6 m² za 68,99 zł, ale nie potwierdza EAN Corksystem 5061092900925: inne SKU, brak zgodnego kodu i marka Dekork. Nie przypisano go jako tej samej oferty wyłącznie na podstawie podobnej grubości i powierzchni. Może stanowić osobny, jawnie dobrany wariant po weryfikacji parametrów.

[Budmat UD27 w OBI](https://www.obi.pl/p/5874144/budmat-profil-sufitowy-ud-27-3-m) jest kolejnym dokładnym źródłem EAN 5907738940163. Odczyt strony przez wyszukiwarkę wskazał brak dostawy do domu; nie jest to bieżąca bezpośrednia obserwacja i nie dopisano dostępnej oferty. [TaniaPłytka Petro Grey G2](https://taniaplytka.pl/produkty/paradyz-petro-grey-struktura-mat-600x600-2) potwierdza paczkę 1,44 m², ale pokazuje towar niedostępny w indeksie. Nie importowano dawnej ceny ani podobnego wariantu.

Pozostałe siedem referencji: Budmat UD27 3 m, Facile 50, Toledo 2,22 m², Diall 20 m², Petro Grey G2, Nati Bianco struktura i Archi 80 lewe. Pełne automatyczne dostawy i aktualne ceny blokowanych sklepów oraz lokalne ceny/zapasy nadal należą do celu.

## Weryfikacja

403 testy aplikacji/kalkulatorów/pricing/API i 1054 wspólnego backendu uruchomione szeregowo PASS: **1457 testów, 0 skip**. Nowe siedem testów sprawdza prawdziwe dane karty, odrębność sprzedawców, jednostkę fizycznej paczki, wygaszanie, cache, brak map/odbioru, rzeczywisty HTTP koszyków i brak fikcyjnej darmowej dostawy. Typecheck API/mobile oraz 66 chronionych ID z negatywnymi mutacjami PASS.

Rzeczywisty HTTP lokalnego gotowego bundle potwierdził 96/103, 7 braków, 122 oferty, 37 sklepów i 17 ręcznych potwierdzeń. 6,1 m² Corksystem wymaga dwóch paczek za 147,98 zł. Wraz z 2,6 m² Arilla koszt materiałów wynosi 412,88 zł, ale pozycje należą do dwóch odrębnych koszyków sprzedawców. Pełna suma z wysyłką pozostaje pusta; wybór odbioru nie wycenia Corksystem. Wybór samej Castoramy nie obejmuje oferty Corksystem. Pierwotny koszyk nadal 790,83 zł.

Dowody w katalogu czatu: `work/catalog-wave26-research/corksystem-browser.json`, `corksystem-delivery-dialog.txt`, `reviewed-observations.json`, `dekork-products.json`, `dekork-collection.html`, `catalog-wave26-core-tests.log`. Świeży snapshot 148 plików produkcji ma SHA256 `0ad3958a090c898f9ce742afcd87a2554a3f89c4a1eb3f3c0a00cee93bbd8973`. Wspólny serwer zachowuje wszystkie pozostałe pliki. Obcy WIP, chronione identyfikatory i migracje pozostają poza zakresem; nie ma nowego binarnego wydania iOS/Android.

## Wdrożenie i dowody produkcyjne

[PR32](https://github.com/jakatora/przetargai/pull/32) scalono i przypięto do zadania. Źródło `b5de8307bc1327a75c7846366b19d467085f28a7`, merge `7189def484f6e717b95671bbc6746a12800a6ce7`. Railway `1fb25073-0e2e-4cdc-bf1d-eca871b56188` osiągnął SUCCESS `2026-10-26T07:48:52.670Z`. Dwie kontrole braku driftu 148 plików przed wdrożeniem; zmieniono tylko bundle pricing i katalog obserwacji. GitHub checks/statuses były puste, nie stanowiły zielonego CI.

Rzeczywisty HTTPS produkcji potwierdził 96/103, 7 braków, 122 oferty, 37 sklepów, 17 ręcznych obserwacji. Oddzielny koszyk Corksystem kosztował 147,98 zł materiałów; mieszany z Arilla 412,88 zł w dwóch koszykach sprzedawców. Brak potwierdzonej dostawy pozostawił best=null. Tryb odbioru wykluczył Corksystem. Wybór Castoramy nie przyjął oferty zewnętrznego sprzedawcy. Pierwotny koszyk nadal 790,83 zł. Dowód `work/catalog-wave26-production-proof.json`.

Kolektor po wdrożeniu (`lastAttemptAt: 2026-10-26T07:48:49.438Z`, `running: false`) otrzymał dla Corksystem HTTP 503. Zachował cenę, datę i pierwotny termin ręcznej weryfikacji. `/health` zwraca 200, `/auth/me` bez sesji 401. Dowód `work/catalog-wave26-collector-proof.json`. Nie jest to udany automatyczny odczyt.

Rzeczywisty interfejs pokazał dodatkowe 6,1 m² jako dwie paczki po 6 m² za 147,98 zł, z właściwym zdjęciem, sklepem Corksystem (Castorama) i ważnością do 27.10, 08:36 czasu polskiego. Wybór tego sprzedawcy pokazał wyłącznie jego ofertę i brak możliwości odbioru własnego, bez kierowania do placówek Castoramy. Dowody `outputs/catalog26-corksystem-20261026.{png,txt}` i `catalog26-selected-corksystem-20261026.txt`.

Dodatkowe bezpośrednie sprawdzenie HTTP: Corksystem 503, Budmat OBI 404 bez treści, Petro Neoceramik 404; TaniaPłytka 200 z natywną ofertą `OutOfStock` i ceną 49,81 zł, której nie zaimportowano jako dostępnej. Dowód `work/catalog-wave26-research/http-proof.json`. Te aktualne wyniki są silniejszym dowodem dalszego kierunku niż wcześniejsze indeksy wyszukiwarki.

Po sprawdzeniu UI usunięto wyłącznie własną dodatkową pozycję i przywrócono „Najtańszy zestaw”: 3 prace, Standard, 1 posiadana pozycja, 00-001, brak dodatków, 637,43 zł materiałów + 153,40 zł dostaw = 790,83 zł. Dowód `outputs/catalog26-original-basket-restored-20261026.txt`. Pomocniczą kartę sklepu zamknięto; podgląd aplikacji pozostawiono otwarty.
