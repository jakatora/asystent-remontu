# Katalog 62 produktów — 2026-10-25

**62/103 produktów ma zweryfikowaną ofertę; pozostało 41.** Katalog obejmuje 88 aktywnych ofert w 29 sklepach, zdjęcia 103/103 oraz 15 automatycznych integracji dostawy. Liczby dotyczą obecnego katalogu aplikacji. Uzupełnienie cen wszystkich produktów i pełna obsługa transportu pozostają aktywnymi zadaniami.

## Nowa oferta i jednostka zakupu

[Kronodom: Arbiton Secura Thermo Aquastop Smart 1,6 mm, EAN 5905167826942](https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka) sprzedaje podkład po **10,33 zł brutto/m² w paczkach 6 m²**, czyli **61,98 zł za paczkę**. [Producent Arbiton](https://arbiton.com/pl/podklady-pod-panele/podklady-pod-panele-laminowane/arbiton-secura-thermo-aquastop-smart-podklady-pod-panele-laminowane) potwierdza serię podkładu.

Rzeczywisty odczyt do bootstrap: 2026-10-25T19:11:03.326Z. Zdjęcie z tej samej karty zwróciło HEAD 200 image/*. Zachowano wszystkie wcześniejsze 89 obserwacji i ich daty; dwie oferty Rodimax nadal są wyłączone. Zastąpienie historycznej ceny referencyjnej Rodimax ceną dostępnej oferty Kronodom nie jest zmianą ceny tej samej oferty sklepu.

Nowy czytnik publicznej karty ABStore używa wyłącznie GET. Łączy EAN katalogowy, ID produktu i pozycji 423, SKU/MPN, producenta, kanoniczny URL, dane formularza, m², min/step 6, cenę brutto i widoczną cenę głównej karty. Dane skryptu są parsowane jako JSON, bez wykonywania JavaScript. Odrzuca ceny warunkowe, ukryte, walutę inną niż PLN, niewłaściwy zapas i zmienione zasady zakupu. Nie obsługuje ułamkowej wielkości paczki na podstawie samego przemnożenia zaokrąglonej ceny jednostkowej.

Koszyk całego remontu sumuje zapotrzebowanie przed zaokrągleniem: 3 m² + 3 m² = jedna paczka 61,98 zł; 3 m² + 4 m² = dwie paczki 123,96 zł. Cena 10,33 zł/m² ani kwota netto nie mogą wycenić całej paczki.

## Transport Kronodom wymaga dalszej integracji

W zwykłym anonimowym koszyku przeglądarkowym potwierdzono jedną paczkę 61,98 zł + kurier 69,00 zł = 130,98 zł. [Zasady dostawy](https://kronodom.pl/opcje-i-koszty-dostawy) uzależniają koszt od wymiarów, wagi i zamówienia. Powyższa kwota jest dowodem konkretnego koszyka, a nie uniwersalną stawką dla każdego zamówienia lub kodu.

Próba użycia zwykłego frontendowego żądania koszyka z backendu nie dała potwierdzonej wyceny; dodatkowe mechanizmy ochronne nie były odtwarzane. Produkcyjny czytnik pozostaje GET-only. Kronodom zwraca `integration_unavailable`, a zestaw wymagający tej dostawy ma `best=null`. Nie dodano sztywnej stawki 69 zł ani darmowej dostawy. Integracji automatycznych pozostaje 15.

Zapas karty potwierdzał 108 m², czyli 18 paczek. Obecny wspólny model oferty nie przenosi liczbowego limitu zapasu do optymalizatora odbioru. Odczyt potwierdza możliwość kupienia co najmniej jednej paczki; nie dowodzi dostępności dowolnie dużego zamówienia. Docelowa obsługa limitów musi uwzględniać dzielenie zakupów między oferty i sklepy.

## Walidacja

- 269 testów logiki aplikacji/API, 20 testów seedów i 55 regresji wspólnego backendu PASS, bez pominięć; razem 344. Typecheck mobile i API PASS.
- Nowe testy korzystają z fragmentów rzeczywistej karty. Mutacje EAN, ID, waluty, ceny netto/brutto, jednostki, zapasu, minimum i kroku zakupu są odrzucane.
- Nowe źródła: karta sklepu, zdjęcie i karta producenta — 3/3 HTTP 200, bez ostrzeżeń. Nie jest to ponowna kontrola wszystkich historycznych URL-i.
- Naprawiono stary `scripts/check-legacy-ids.sh`: mylił kategorię `high-risk` z istniejącym ID pracy `high-risk-overview` i oczekiwał dawnego formatu rejestru. Nie zmieniono żadnego ID ani rejestru. Poprawny skrypt wykrywa 66 wpisów i chronioną kategorię.
- Regresja na osobnej kopii danych: poprawne dane PASS; usunięcie chronionego ID FAIL; usunięcie eksportu FAIL; pusty rejestr FAIL; przywrócenie danych PASS. Dane aplikacji pozostawały nietknięte.

## Wdrożenie i rzeczywisty odbiór

Świeży snapshot produkcji 68837246: 968599 B, SHA256 `9cc882854d3b44212761a15d1d5c99c2cafff2d20005371f865dc2c9d703aa0f`. Zmieniły się wyłącznie `backend/src/services/remont-pricing.cjs` i jedna nowa obserwacja bootstrap.

[PR16](https://github.com/jakatora/przetargai/pull/16) scalony: source `1c1c15ed8ff864ec3f20c6a4e60b21e18b8e3250`, main `5ac42b72821e1e379a160b116f5e54a3efb1f8e8`. Railway **888bfb18-8a2c-483c-b292-38c2358b5f22 SUCCESS**, 2026-10-25T19:23:35.939Z, czyli 20:23 Warszawa.

Produkcyjne HTTPS potwierdziło 62 produkty, 88 ofert, 29 sklepów, 15 integracji, obie wyceny paczek oraz brak pełnej sumy przy niepotwierdzonej dostawie Kronodom. Automatyczny odczyt nowej karty na produkcji: 2026-10-25T19:24:07.129Z, `active=true`, `error=null`; jest to świeży GET, nie tylko odtworzenie bootstrap.

Wszystkie 62 produkty z ofertami przechodzą razem do koszyka odbioru. Wszystkie 103 wiersze katalogu pozostają w odpowiedzi: 62 rozpoznane, 41 bez oferty, pełna suma z dostawą zablokowana. Nie potwierdzono jednoczesnej wysyłki całego katalogu. Dotychczasowe trzy prace nadal kosztują 790,83 zł z dostawą: 637,43 zł materiały + 153,40 zł transport. Health 200, auth 401.

UI web po przeładowaniu potwierdza 29 sklepów wraz z Kronodom, trzy prace, kod 00-001, jedną już posiadaną pozycję, pięć pełnych wycen oraz 790,83 zł. Własny koszyk Kronodom opróżniono, potwierdzono zero i zamknięto kartę. Nie wysyłano danych klienta, zamówienia ani płatności. Karta aplikacji pozostaje otwarta. Nie wydano buildów Android/iOS.

Dowody w katalogu roboczym rozmowy: `work/catalog-wave6-production-proof.json`, `catalog-wave6-local-live-proof.json`, `catalog-wave6-legacy-mutation-proof.json`, logi testów i walidacji źródeł. W `outputs/`: `asystent-remontu-katalog-62-dowod-20261025.json`, `asystent-remontu-koszyk-62-20261025.png`, `asystent-remontu-koszyk-62-suma-20261025.png`, `kronodom-paczka-6m2-dostawa-20261025.png`.

## Kolejne prace

Pozostałe 41 pozycji wymaga aktywnej oferty dokładnego wariantu, ceny brutto, jednostki i dostępności. Castorama dla Fola 5906725207227 wymaga wyboru sklepu/kodu; ceny regionalnej nie traktować jako ogólnopolskiej dostępnej oferty. JapiBud Atlas Stopter K20 i znalezione karty Paradyż Nati były niedostępne. IRBUD CD60 nie potwierdził EAN. Nie zastępować Norgips CD60 0,6 mm profilem 0,5 mm ani Knauf MP75 25 kg innym MP75L 30 kg.

Nadal do wykonania: pozostałe produkty i dostawy, dostęp do wycen Castorama/OBI, liczbowy zapas, zgodność materiałów, ręcznie dopisane pozycje oraz częściowo posiadane zapasy. Cel pozostaje aktywny.
