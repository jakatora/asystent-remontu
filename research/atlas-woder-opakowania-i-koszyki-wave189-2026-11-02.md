# Atlas Woder E — opakowania i koszt pełnych koszyków, 2026-11-02

Status: kandydat w walidacji. Ten raport nie potwierdza jeszcze publikacji.

## Tożsamość i źródła

- Producent: https://www.atlas.com.pl/produkt/atlas-szybkoschnaca-folia-w-plynie-woder-e/ — jednoskładnikowy Woder E. Lista fabrycznych pojemności nie potwierdza dostępności sklepowej.
- PSB 2 kg: https://www.grupapsb.com.pl/produkt/szybkoschnaca-folia-w-plynie-2-kg-woder-e-atlas-5905400514483.html
- PSB 5 kg: https://www.grupapsb.com.pl/produkt/szybkoschnaca-folia-w-plynie-5-kg-woder-e-atlas-5905400514490.html
- PSB 15 kg: https://www.grupapsb.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html

Zamknięta rodzina obejmuje wyłącznie GTIN 5905400514483 (2 kg), 5905400514490 (5 kg), 5905400514506 (15 kg). Bez aliasowania Woder W, Duo, innych rewizji GTIN, litrów i niezweryfikowanego GTIN 10 kg. Nie zmieniono zużycia, formuł, domyślnych produktów ani zapisanych projektów. Zgoda na dobór rozmiarów jest jawna, pierwotna referencja i zapotrzebowanie pozostają zapisane.

## Rzeczywiste odczyty i fotografie

2026-11-02 01:56:58–01:57:01 UTC, HTTP 200. Lobo: 2 kg 48,90 zł; 5 kg 99,00 zł; 15 kg 249,00 zł. Sewera: 2 kg 57,99 zł; 5 kg 103,00 zł. Cena dotyczy jednego całego wiadra. To nowe obserwacje ofert, nie podwyżki względem najniższej ceny z 30 dni lub ceny innego sklepu.

Nowe referencje 2 i 5 kg mają fotografie z dokładnych kart Lobo, obejrzane lokalnie. Dwa zdjęcia Sewery są identyczną ilustracją modelu, dlatego dla nowych referencji wybrano różniące się fotografie opakowań Lobo. Obrazy pozostają URL-ami, bez binariów w repo. Masa logistyczna Lobo 3 / 7 / 16 kg nie zastępuje zawartości 2 / 5 / 15 kg i nie jest ręcznym cennikiem dostawy.

## Rzeczywiste koszyki adaptera

- lobo2, kod 30-001: materiały 48.90 zł; dostawa 22.90 zł, retailer_basket_national, PL.
- lobo5, kod 30-001: materiały 99.00 zł; dostawa 22.90 zł, retailer_basket_national, PL.
- lobo15, kod 30-001: materiały 249.00 zł; dostawa 45.90 zł, retailer_basket_national, PL.
- lobo-mixed, kod 30-001: materiały 147.90 zł; dostawa 22.90 zł, retailer_basket_national, PL.
- sewera2, kod 30-001: materiały 57.99 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.
- sewera5, kod 30-001: materiały 103.00 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.
- sewera-mixed, kod 30-001: materiały 160.99 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.
- sewera-warsaw, kod 00-001: materiały 103.00 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.

Lobo zwraca aktualną krajową wycenę całego anonimowego koszyka dla Polski, nie taryfę zależną od konkretnego kodu. Sewera potwierdza kod i oddział Katowice w rzeczywistym kalkulatorze. Dat wycen nie przedłużano; przed późniejszym zakupem wymagają aktualnego sprawdzenia. Nie złożono zamówienia ani nie podano danych kontaktowych.

Artefakty: G:/Projekty/asystent-remontu-work/wave189-20261102. native-price-observations.json, native-adapter-baskets.json i native-lobo-baskets.json są rzeczywistymi odczytami. Fixture w repo zawiera wybrane pola odpowiedzi Lobo bez cookies, sesji i danych klienta; modyfikacje w testach są kontrolowanymi awariami.
