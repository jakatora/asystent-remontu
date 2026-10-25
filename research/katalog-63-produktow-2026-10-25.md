# Katalog 63 produktów i dostawa HIPPER — 2026-10-25

**63/103 produktów ma zweryfikowane oferty; pozostało 40.** Aktualny katalog zawiera 89 aktywnych ofert w 30 sklepach, zdjęcia 103/103 i 16 automatycznych integracji dostawy. Cel pełnego katalogu oraz dalszego rozwoju aplikacji pozostaje aktywny.

## Nowa oferta

[HIPPER: złota klamka Schaffner Lucy na okrągłej rozecie](https://hipper.pl/klamka-do-drzwi-wewnetrznych-lucy-zlota-r-schaffner-3069808860), EAN **5907467760698**, produkt 3069808860, jednostka sklepu 3069809346, kosztuje **57,99 zł za jeden komplet klamki**. Ten sam EAN i wariant opisuje [pierwotna karta Castoramy](https://www.castorama.pl/klamka-drzwiowa-schaffner-lucy-na-rozecie-zlota/5907467760698_CAPL.prd). Nie jest to osobno sprzedawany szyld dolny ani czarna wersja.

Czytnik Certusoft parsuje publiczny JSON SSR oraz główną widoczną kartę. Sprawdza EAN, ID produktu i jednostki, producenta, trasę, nazwę, ilość jednej sztuki, stan, PLN, zgodność cen oraz widocznego formularza. Nie wykonuje skryptu strony. Zdjęcie pochodzi z tej samej karty i zwraca HEAD 200 image/*. URI zdjęcia jest kodowane również dla natywnego ładowania obrazów.

Zmiana historycznej ceny referencyjnej z Castoramy na dostępną ofertę HIPPER nie jest zmianą ceny tej samej oferty. Historia zmian ceny nadal dotyczy konkretnego źródła. Wszystkie wcześniejsze 90 obserwacji bootstrap zachowano wraz z pierwotnymi datami.

## Automatyczna wycena całego koszyka

Adapter tworzy osobny anonimowy koszyk i korzysta z tych samych publicznych akcji co frontend: `cartAdd` oraz zmiana przewoźnika w `csNGOnCFB2BCartHeader`. Ponownie odczytuje koszyk, sprawdza wszystkie pozycje, jednostki, ilości, zapas, ceny jednostkowe, kwoty produktów, dostawy, płatności i widoczną pełną należność. Zmiana ceny lub za mały zapas przerywa wycenę.

Metoda transportowa dopuszcza wyłącznie te akcje i ich wąski zestaw pól. Odrzuca `order`, `nextStep`, `anonymousUsrCartSave`, dane klienta, akceptację regulaminu i obcą przestrzeń aplikacji. Ciasteczka oraz identyfikator anonimowej sesji pozostają prywatne dla jednego wywołania; nie trafiają do publicznej odpowiedzi ani dowodu wyceny.

Rzeczywisty HTTP oraz zwykły koszyk przeglądarkowy potwierdziły:

| Koszyk | Produkty | Kurier do domu | Łącznie |
|---|---:|---:|---:|
| Jedna klamka | 57,99 zł | InPost 18,90 zł | **76,89 zł** |
| Dwie klamki | 115,98 zł | jedna dostawa 18,90 zł | **134,88 zł** |

Zapowiedź „od 17,90 zł” dotyczy paczkomatu. Nie jest stosowana jako koszt kuriera. [Tabela transportu](https://hipper.pl/czas-koszty-dostawy) i [regulamin, §8.2](https://hipper.pl/regulamin) opisują dostawy w Polsce. Wynik ma jawny zakres `retailer_basket_national` / PL, nie udaje żądania dla konkretnego kodu pocztowego. Kod rozdziela cache aplikacji; integracje rzeczywiście przesyłające kod nadal obejmują Sewerę i Cezar.

Nie dopisano stałej taryfy ani uniwersalnej darmowej dostawy do aplikacji. Wyborowi przewoźnika musi towarzyszyć zgodna należność z aktualnego koszyka. Nowy czytnik obsługuje zweryfikowaną pojedynczą sztukę; inne jednostki i wielkości paczek wymagają osobnej weryfikacji.

## Walidacja i wdrożenie

274 testy logiki aplikacji/API, 20 seedów i 55 regresji wspólnego backendu PASS, razem **349 bez pominięć**. Typecheck API/mobile PASS. Testy mutują tożsamość, jednostkę, ceny, walutę, zapas, liczbę pozycji, kwoty koszyka, przewoźnika i niedozwolone akcje. Fragmenty rzeczywistych odpowiedzi mają zastąpiony identyfikator sesji i usunięte niewykorzystywane pola klienta. Nowe źródła 6/6 HTTP 200; chronione ID i 66 wpisów rejestru bez zmian.

Snapshot live 888bfb18: 970496 B, SHA256 `cd6700cd8858ac71c37c34b9b07bb409012e9cbb7de6d396c195bb8402095453`. Release zmienia wyłącznie `backend/src/services/remont-pricing.cjs` oraz jedną obserwację w `backend/src/data/remont-verified-offers.json`.

[PR17](https://github.com/jakatora/przetargai/pull/17) scalony: source `d87e2b21c3d5db799f3db86d24ebe6c1b2e37e97`, main `41a5b0abad31178c088d3185aa7ee4b387ea2cab`. Railway **57c6d06b-6ee7-4bb3-90af-454d54a3c790 SUCCESS**, 2026-10-25T19:53:40.591Z, czyli **20:53 Warszawa**.

Produkcyjne HTTPS potwierdziło 63 produkty, 89 ofert, 30 sklepów, 16 integracji oraz wyceny 76,89 i 134,88 zł. Dwie pozycje z różnych pomieszczeń zostały połączone w dwie sztuki i jedną dostawę. Nowe źródło odświeżono rzeczywistym GET na produkcji 2026-10-25T19:54:06.010Z (`active=true`, `error=null`), więc odbiór nie opiera się wyłącznie na bootstrap.

Wszystkie 63 produkty z ofertami przechodzą razem do koszyka odbioru. Pełny katalog zachowuje 103 wiersze: 63 rozpoznane, 40 bez ofert i `best=null` przy brakach. Nie jest to dowód wysyłki wszystkich 63 produktów naraz. Dotychczasowe trzy prace nadal kosztują 790,83 zł z dostawą, health 200, auth 401. UI po przeładowaniu pokazuje 30 sklepów wraz z HIPPER, trzy prace, kod 00-001, jedną posiadaną pozycję i pięć pełnych wycen. Własny koszyk HIPPER opróżniono i zamknięto kartę. Nie składano zamówienia ani płatności. Nie wydano nowych buildów Android/iOS.

Dowody w katalogu roboczym rozmowy: `work/hipper-live-delivery-proof.json`, `catalog-wave7-local-live-proof.json`, `catalog-wave7-production-proof.json`, logi testów i walidacji. W `outputs/`: `asystent-remontu-katalog-63-dowod-20261025.json`, `hipper-lucy-kurier-20261025.png`, `asystent-remontu-koszyk-63-20261025.png`, `asystent-remontu-koszyk-63-suma-20261025.png`.

## Pozostałe prace

40 produktów, dalsze integracje transportu, dostęp do wycen Castorama/OBI, liczbowy zapas w optymalizatorze odbioru, zgodność materiałów, ręczne pozycje i częściowo posiadane zapasy nadal wymagają pracy.

Odrzucono MyBudio UD30: karta pod EAN 5907738940163 opisuje 4 m i Hanbud/Pruszyński, zamiast referencyjnego Budmat 3 m. OBI UD27 zwrócił w rzeczywistym odczycie HTTP 404; Castorama Invena HTTP 503. Sześć wyszukiwań EAN w HIPPER zwróciło puste wyniki SSR — nie dowodzi to braku tych produktów w całym sklepie. Dalszy kandydat to Cersanit Seno w sklepie SuperZakupy / sklep473140.shoparena.pl; nazwa 3/6 l i opis 3/5 l są rozbieżne, więc nie zaimportowano oferty z samego wyniku wyszukiwania. Rodimax pozostaje wyłączony do potwierdzenia działającego zakupu.
