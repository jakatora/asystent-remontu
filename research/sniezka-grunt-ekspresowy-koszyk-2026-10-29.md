# Śnieżka Grunt Ekspresowy 5 l w koszyku remontu (2026-10-29)

## Potrzeba użytkownika

Grunt jest częścią przygotowania ścian. Użytkownik potrzebuje konkretnego opakowania ze zdjęciem, aktualną ceną i kosztem dostawy, a przy większym remoncie musi zobaczyć koszt wspólnego koszyka z farbą i gładzią.

## Potwierdzenie produktu

- [Lobo — Śnieżka Grunt Ekspresowy 5 l](https://lobo.pl/sniezka-grunt-ekspresowy-gleboko-penetrujacy-5l): EAN `5903973228905`, Shoper ID `58470`, kod `q62980003228905`, `can_buy=true`, cena brutto **42,90 zł**, opakowanie 5 l. Odczyt `2026-10-29T17:03:54.644Z`, SHA-256 odpowiedzi API `ff66b66d4890f4711ad2812c5aca6d2cb47e5ab0daed21b903bfc35ca153ebe1`.
- [Sewera — ten sam EAN](https://sklep.sewera.pl/sniezka-grunt-ekspresowy-5l-gleboko-penetrujacy-p14581) stanowi niezależne potwierdzenie tożsamości produktu. W tej partii nie dodano aktywnej oferty Sewery.
- Zdjęcie Lobo zwróciło `image/webp` (HTTP 200, 22 843 bajty). Audyt wszystkich referencji zdjęć po dodaniu: **189/189 dostępnych**.
- Nowy produkt otrzymał źródło katalogowe, referencję materiału i mapowanie zdjęcia po dokładnym EAN. Nie zmieniono mapowań już używanych zadań remontowych.

## Rzeczywista dostawa

- Anonimowy koszyk Lobo: grunt 42,90 zł + **kurier InPost 22,90 zł = 65,80 zł**. Paczkomat 18,99 zł nie jest porównywalną dostawą do domu; lokalnej dostawy na terenie Poznania nie stosowano do ogólnopolskiego porównania.
- Wspólny koszyk Lobo: Dulux EasyCare 9 l + Atlas GTA 18 kg + Śnieżka Grunt Ekspresowy 5 l = **274,70 zł materiałów + 66,90 zł kurier = 341,60 zł**. Jest to natywna taryfa sklepu dla Polski (`retailer_basket_national`), nie indywidualna wycena kodu `00-001`. Nie podano danych klienta i nie złożono zamówienia.
- Produkcyjne `POST /api/remont/pricing/project` dla testowego kodu `00-001` i tych trzech produktów zwróciło wybraną Lobo wycenę `compared`, `missingProductCount=0`, 341,60 zł. Porównanie globalne zwróciło ten sam najlepszy **potwierdzony** koszyk, ale status `needs_delivery_costs`, gdyż inna kombinacja Sewery zwróciła `product_unavailable`. Nie jest to dowód absolutnie najniższej ceny na rynku.

## Weryfikacja i wdrożenie

- TypeScript API/mobile PASS; testy mobilne bieżącego katalogu **366/366 PASS**, ukierunkowane testy dostaw sklepów **9/9 PASS**, wspólny backend **1054/1054 PASS**. Test trzech produktów sprawdza jeden koszyk, brutto i wybór kuriera zamiast paczkomatu.
- Świeży snapshot produkcyjny miał 256 obserwacji i 148 plików. Przygotowana paczka dodała jedną obserwację i zmieniła wyłącznie `src/data/remont-verified-offers.json` oraz `src/services/remont-pricing.cjs`; pozostałe 146 plików zachowano. Po wdrożeniu **148/148 plików** identycznych z przygotowaną paczką; 257 źródeł, 250 aktywnych ofert, 182 aktywne produkty. SHA-256 modułu `9fcd48db3e5885733120632d7a3bb8f5d78951443c6a462009136143168e2e12`.
- Railway deployment `d9d572b8-3688-49c4-a350-6cb61cf53762` ma status SUCCESS. Backend [PR 107](https://github.com/jakatora/przetargai/pull/107) scalony.

## Zakres kontroli kwot

Nie zmieniono algorytmu wyceny ani płatności. Nowa cena pochodzi z bieżącego odczytu sklepu, a koszt dostawy z natywnego anonimowego koszyka. API potwierdziło zgodność sum materiałów i kuriera po wdrożeniu. Różne adresy w Polsce mogą mieć inne warunki końcowego zamówienia; aplikacja pokazuje podstawę taryfy i zaznacza niepełną konkurencję.
