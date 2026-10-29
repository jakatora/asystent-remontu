# ABUD: wycena dostawy działa lokalnie, ale serwer produkcyjny nie łączy się ze sklepem

Data sprawdzenia: 2026-10-29. Kwoty i stany są migawką; aplikacja powinna pobierać je ponownie przed wskazaniem najtańszego zestawu.

## Dowody

- [Zasady dostawy ABUD](https://www.abud.pl/Dostawa-Towaru-cinfo-pol-24.html) kierują do koszyka i kodu pocztowego po koszt transportu. Dla ciężkich lub wielkogabarytowych produktów sklep może stosować transport własny, więc nie da się przyjąć jednej stawki dla wszystkich materiałów.
- Dwie sprawdzone karty: [Koelner WS-3595, 1000 szt.](https://www.abud.pl/product-pol-63463-Wkret-samowiercacy-3-5x9-5mm-1000-szt.html) i [Koelner FX-06K040, 200 szt.](https://www.abud.pl/product-pol-1452-Kolek-szybki-montaz-kolnierz-6x40-KOELNER-200-szt.html). Odczyt na żywo 2026-10-29 12:53 UTC potwierdził 47,60 zł i 21,90 zł. Anonimowy natywny koszyk zwrócił 13,00 zł za Pocztex Kurier 24 z przedpłatą dla `00-001`. Osiem żądań sklepu zakończyło się HTTP 200, około 6 s łącznie. Nie składano zamówienia.
- Produkcyjny `POST /api/remont/pricing/project` z wybranym ABUD, tymi dwoma produktami i `00-001` zwrócił `status=needs_delivery_costs`, `missingProductCount=0`, `best=null`, `unavailableStores=[{store:ABUD, reason:quote_unavailable}]` po 10,771 s. To nie jest potwierdzona cena dostawy na produkcji.
- Odczyt sieci z kontenera Railway 2026-10-29 12:53:59 UTC: DNS `www.abud.pl` → `5.149.162.35`, połączenie HTTPS zakończyło się `UND_ERR_CONNECT_TIMEOUT` po 10,533 s (`timeout: 10000ms`). Zapis diagnostyczny: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/catalog-wave100-abud-network-proof.json`. Adapter ABUD już obsługuje anonimowy koszyk, kod pocztowy, kontrolę SKU, ceny i usługi kurierskiej; lokalnie działa. Przyczyną tej konkretnej porażki jest osiągalność ABUD z produkcyjnego serwera.

## Zachowanie aplikacji

Na ekranie „Gdzie najtaniej” pełny koszyk z potwierdzonym kosztem dostawy pozostaje dostępny. Gdy alternatywne koszyki nie mają potwierdzonej wyceny, nagłówek mówi „Najtańszy potwierdzony zestaw z dostawą”, a pod sumą jest ostrzeżenie „Porównanie niepełne” i przycisk ponowienia. Aplikacja nie przedstawia takiej kwoty jako gwarantowanego minimum wszystkich sklepów i nie dopisuje ABUD statycznej stawki 13,00 zł z lokalnego pomiaru.

Weryfikacja w żywym ExpoWeb na lokalnym projekcie „Test audytu — malowanie 40,5 m²”, kod `00-001`: początkowo 21 potwierdzonych koszyków, najlepszy 305,37 zł materiałów + 59,40 zł dostawy = 364,77 zł. Ekran pokazał ostrzeżenie o czterech sklepach bez pełnej wyceny: Castorama, OBI oraz inne kombinacje Sewera i Rab-Dom; powody są w rozwijanej liście pod koszykiem. Przycisk „Sprawdź dostawy ponownie” uruchomił nowe porównanie (widoczny stan ładowania), które zakończyło się 42 sprawdzonymi koszykami i nadal najlepszą potwierdzoną kwotą 364,77 zł. Kontrola typów mobile oraz pełny zestaw 903/903 testów aplikacji przeszły.

## Dalszy krok

Sprawdzać osiągalność ABUD z Railway w kolejnych turach i ponawiać natywną wycenę, gdy połączenie wróci. Jeśli problem się powtarza, ustalić z ABUD możliwość stabilnego dostępu serwerowego lub oficjalnego API. Nie obchodzić ograniczeń sieciowych przez podmianę IP ani nie mieszać lokalnej stawki z produkcyjną wyceną konkretnego użytkownika.
