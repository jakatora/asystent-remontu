# Farba i gładź: jeden koszyk czy dwa sklepy? (2026-10-29)

## Potrzeba użytkownika

Użytkownik kupujący Dulux EasyCare Nieskazitelna Biel 9 l i Atlas GTA 18 kg potrzebuje ceny **całego zestawu z dostawami**. Niższa cena jednego produktu ani opłata paczkomatowa nie wystarczą do wyboru sklepu.

## Potwierdzone oferty i natywny koszyk

- [Lobo — Dulux EasyCare 9 l](https://lobo.pl/dulux-easycare-nieskazitelna-biel-9l): EAN `5904078198759`, Shoper ID `6379`, kod `S7.0065237346`, `can_buy=true`, **171,90 zł** brutto. Obserwacja `2026-10-29T16:40:13.136Z`; SHA-256 odpowiedzi API `701ff184d4385449a3c4e951fa33d6f0e4bce4799729ba315960a9f87d8d0e8f`.
- [Lobo — Atlas GTA 18 kg](https://lobo.pl/atlas-gta-super-biala-gladz-polimerowa-18kg): EAN `5905400542509`, Shoper ID `42682`, kod `n.GG-R2U-18`, `can_buy=true`, **59,90 zł** brutto. Obserwacja `2026-10-29T16:40:13.326Z`; SHA-256 odpowiedzi API `11aa0bff450b868f4a4ec79aea871ba352d0d00014093455631de1e010368836`.
- Oba zdjęcia Lobo zwróciły obraz WebP. Wcześniej zarejestrowane zdjęcia referencyjne nadal działają: audyt **188/188**.
- Anonimowy natywny koszyk Lobo z dwiema pozycjami zwrócił materiały **231,80 zł**, kuriera InPost przy przedpłacie **66,90 zł**, razem **298,70 zł**. Paczkomat **56,90 zł** wykluczono z porównania dostawy do domu. Nie wpisano danych klienta i nie złożono zamówienia. Stawka ma podstawę `retailer_basket_national`/`destinationScope=PL`, nie jest wyceną dla konkretnego kodu.

## Wynik produkcyjny dla testowego kodu 00-001

| Potwierdzony plan | Materiały | Dostawy | Razem |
|---|---:|---:|---:|
| Sama farba Lobo | 171,90 zł | 22,90 zł | **194,80 zł** |
| Farba i gładź razem w Lobo | 231,80 zł | 66,90 zł | **298,70 zł** |
| Farba Lobo + gładź [Sewera](https://sklep.sewera.pl/atlas-gta-gotowa-gladz-polimerowa-18kg-p6321) | 237,80 zł | 46,80 zł | **284,60 zł** |

Podział Lobo + Sewera jest **14,10 zł tańszy** od jednego koszyka Lobo dla tych ilości. Produkcyjne `POST /api/remont/pricing/project` zwróciło `missingProductCount=0` i ten podział jako najlepszy potwierdzony. Globalny status to `needs_delivery_costs`: koszyk Sewery z farbą zwrócił `product_unavailable`, więc innego potencjalnie tańszego układu nie wolno uznać za wykluczony. Dla samej farby produkcja wskazuje Lobo jako najlepszy potwierdzony zakup, również przy niepełnej konkurencji.

## Weryfikacja wdrożenia

- Test bieżącego katalogu mobile **365/365 PASS**, ukierunkowane testy wycen dostawy API **9/9 PASS**, wspólny backend **1054/1054 PASS**; typecheck mobile/API PASS. Test dwóch EAN sprawdza jedną sesję koszyka, cenę brutto i wybór kuriera zamiast paczkomatu.
- Sprawdzono wcześniejszą porażkę testu winylu: aktualna robocza kopia przekazuje `m2`, zachowuje wymagane 11 m² i oba testy `vinylArea` przechodzą. Porażka w starszej kopii testowej wynikała z braku bieżącego mapowania `mappings.ts`; nie zmieniono poprawnego przeliczenia ani obcego WIP.
- Świeży zrzut produkcji: 254 obserwacje i 148 plików. Przygotowana paczka zmieniła tylko `src/data/remont-verified-offers.json` i `src/services/remont-pricing.cjs`, zachowując 146 pozostałych plików. Po wdrożeniu **148/148 plików identycznych** z paczką, 256 obserwacji, 249 aktywnych ofert, 181 aktywnych produktów. SHA-256 modułu `1753a96bda19ce07f7aa61b5bd475788b5d27e591b50026037eb3a13d41cc6b2`.
- Railway deployment `06622bfa-2663-412e-9dc5-45d6675f97d1` ma status SUCCESS. Backend [PR 106](https://github.com/jakatora/przetargai/pull/106) został scalony.

## Następny krok

Rozszerzać dokładne produkty i zdjęcia oraz poprawiać zakupy przy wielosklepowym planie. Utrzymać jawne oznaczenie niepełnej konkurencji i podstawy każdej dostawy. Dla przyszłego release pobrać nowy snapshot 256 obserwacji i aktualny `origin/main` po PR 106.
