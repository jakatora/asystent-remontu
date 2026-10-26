# Brak oferty odbioru a brak produktu — 2026-10-26

Naprawiono rzeczywisty błąd kontraktu aplikacji: serwer zwraca `no-query`, `no-product`, `no-offer`, a klient rozpoznawał wyłącznie stare wartości `empty_query`, `not_found`, `no_offer`. Każdy aktualny status trafiał więc do komunikatu „Nie znaleziono produktu w katalogu”, również gdy produkt był znany, lecz nie miał oferty odbioru własnego.

Klient importuje aktualny typ powodów z serwisu wycen, zachowując obsługę starszych odpowiedzi. Rozróżnia brak kryteriów, produktu i oferty. Nieznany status ma neutralny komunikat. Sekcja nazywa się „Pozycje bez wyceny”; brak oferty nie oznacza nierozpoznanego produktu.

Przy braku oferty odbioru użytkownik dostaje wyjaśnienie i przycisk „Porównaj z dostawą do domu”. Przycisk korzysta z istniejącego mechanizmu wyceny i zapisu ustawień, zachowuje kod pocztowy oraz wybrany sklep. Nie dopisuje ceny ani nie uznaje brakującego zakupu za darmowy. Kwoty nadal pochodzą z serwera, a niepełny zestaw ma `best: null`.

338 testów PASS, 0 pominiętych; typecheck mobile i API oraz chronione identyfikatory z negatywnymi mutacjami PASS. Nowy test uruchamia prawdziwy HTTP serwera dla wszystkich trzech statusów i sprawdza komunikat klienta; nie testuje przepisanej kopii statusów. Produkcyjny HTTPS również zwrócił te trzy statusy i trzy pełne sumy `null`.

W rzeczywistym UI: dodana listwa LK100F 2,4 mb → odbiór bez pełnej wyceny i poprawne wyjaśnienie → nowy przycisk → dostawa dla 00-001, 31,99 + 87,49 = 119,48 zł. Usunięto własny dodatek testowy i przywrócono oryginalne trzy prace, Standard, jedną posiadaną pozycję oraz 790,83 zł z dostawą. Zmiana frontendu lokalnie Expo, bez nowego wydania mobilnego; backendu i innych aplikacji serwera nie zmieniano.

Dowody w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/pickup-reason-production-proof-20261026.json`, `work/pickup-reason-core-tests-20261026.log`, `work/pickup-reason-typecheck-20261026.log`, `outputs/pickup-reason-explained-20261026.{txt,png}`, `outputs/pickup-reason-back-to-shipping-20261026.txt`.

## Kolejne sprawdzone źródła, bez zawyżania liczby produktów

- Fola 5906725207227: https://sklepdecor.pl/pl/p/Tasma-brzegowa-5-mm-x-100-mm-x-50-mb/2484. Prawdziwy HTTP 200 i zgodny GTIN, ale karta ma „towar niedostępny” oraz ukryty formularz. Nie zaimportowano jako dostępnej oferty.
- Norgips CD60 3 m / 0,6: https://irbudsklep.pl/produkt/profil-glowny-sufitowy-cd60-3-mb-06/. HTTP 200, online 11,45 zł brutto, lokalny produkt 10911, ale brak GTIN / jednoznacznego SKU producenta. Katalog Norgips https://norgips.pl/media/repository/1/1827/b97f005d39bb4ca8aa069b96b5e4dbc5/Katalog_produkt%C3%B3w_NORGIPS_2026.pdf wiąże 5907651698899 z wariantem System C2. Sklep opisuje C1/C2, a samo podobieństwo parametrów nie jest potwierdzonym powiązaniem SKU. Nie zaimportowano przybliżenia.
- Budmat: https://sklep.sewera.pl/profil-sufitowy-przyscienny-ud-27-l-3m-gr-0-5mm-budmat-p11764 podaje lokalny kod 114176. Ten sam kod producenta `23SUBUUD2750300` występuje również przy 3 m / 0,45 mm (p14698, inny EAN 5901323069086) i 4 m / 0,6 mm (p14703). Nie wolno traktować tego kodu jako jednoznacznego powiązania z katalogowym EAN 5907738940163.
- Gotronik: https://www.gotronik.pl/przewod-aks-zielonka-ydyp-3-x-1-5mm2-450750-v-100mb-p-9372.html ma właściwy EAN 5904617573771, ale „Chwilowo niedostępny”. Stare ceny PDF nie są aktualną ofertą.
- Castorama Kreisel GW180: zwykła karta w przeglądarce działa. Dla testowego kodu 00-001 natywny UI pokazał cenę internetową 38,48 zł/szt. i 90 szt. w Warszawa 5 Wola, z zastrzeżeniem możliwej różnicy ceny stacjonarnej. Bezpośredni HTTP tej samej karty zwrócił 503. Nie jest to dowód automatycznego odczytu przez backend. Panel dostaw pokazuje taryfy „od”; sama kwota 8,99 zł nie jest wyceną całego zamówienia. Dowody `outputs/castorama-gw180-availability-20261026.*`. Źródło: https://www.castorama.pl/gladz-pod-walek-kreisel-gw180-gotowa-polimerowa-20-kg/5907418038791_CAPL.prd.

Katalog produkcyjny pozostaje 76/103 z ofertami, 27 brakujących, 102 oferty, 34 sklepy, 19 automatycznych integracji dostawy. Pełny cel uzupełnienia i porównania całego remontu nadal aktywny.
