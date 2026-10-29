# Klingspor P120/P150/P240: paczki po 50 w koszyku Matiw — 2026-10-29

## Dlaczego to potrzebne

Przy szlifowaniu różnych powierzchni kupujący może potrzebować kilku gradacji. Sewera sprzedaje pojedyncze arkusze, a Matiw całe paczki po 50. Aplikacja porównuje dokładne EAN i jednostki zakupu oraz dolicza dostawę całego zamówienia, aby nie przedstawiać ceny paczki jako ceny pojedynczego arkusza.

## Źródła i zdjęcia

- [Matiw P120, 50 sztuk](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P120-50szt/25769): EAN `5907560017644`, kod `000620`, ID `25769`, cena brutto 36,00 zł, `can_buy=true`. Natywny odczyt `2026-10-29T19:30:29.066Z`, SHA `e47cb06c90388455745153061d5244ce6d55a5b764067753eaaa4d816055e6b8`. [Zdjęcie paczki](https://matiw.pl/environment/cache/images/productGfx_63654_500_500/ARKUSZ-PAPIER-SCIERNY-KLINGSPOR-230x280mm-PL28C--P120-50szt.png) HTTP 200 PNG.
- [Matiw P150, 50 sztuk](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P150-50szt/25770): EAN `5907560023553`, kod `000621`, ID `25770`, cena brutto 36,00 zł, `can_buy=true`. Odczyt `2026-10-29T19:30:29.505Z`, SHA `4485265a2d5c87b49ae95f8181aae96eefd195e73aa5ee33935495704a5b5700`. [Zdjęcie paczki](https://matiw.pl/environment/cache/images/productGfx_63655_500_500/ARKUSZ-PAPIER-SCIERNY-KLINGSPOR-230x280mm-PL28C--P150-50szt.png) HTTP 200 PNG.
- [Matiw P240, 50 sztuk](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P240-50szt/25773): EAN `5907560039820`, kod `000634`, ID `25773`, cena brutto 38,24 zł, `can_buy=true`. Odczyt `2026-10-29T19:30:29.914Z`, SHA `e1ed10136ee17583ca8dc4da2dca99dde7eb32ca2232dd769da255ef0363afed`. [Zdjęcie paczki](https://matiw.pl/environment/cache/images/productGfx_63658_500_500/ARKUSZ-PAPIER-SCIERNY-KLINGSPOR-230x280mm-PL28C--P240-50szt.png) HTTP 200 PNG.

Karta każdej paczki podaje EAN, kod i opis `50szt`; natywne `szt.` oznacza jedną paczkę. Walidator wymaga pełnej zgodności ID, EAN, kodu, gradacji i jednostki. Wszystkie trzy obrazy zwróciły tę samą grafikę rodziny opakowań, więc gradację należy rozpoznawać po nazwie i EAN, nie po samej miniaturze. Zweryfikowane zdjęcia pojedynczych arkuszy Sewery w katalogu mobilnym pozostają bez zmian.

## Wycena prawdziwego anonimowego koszyka

W lokalnym API wywołującym natywne koszyki, przy kodzie testowym `00-001`:

| Zapotrzebowanie: po jednym lub po 50 sztuk P120, P150, P180, P220 i P240 | Materiały | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Po 1 sztuce, Sewera | 8,04 zł | 19,90 zł | **27,94 zł** |
| Po 50 sztuk, Matiw | 182,24 zł | 19,00 zł | **201,24 zł** |

Oba wybrane koszyki mają zero braków i jedną dostawę. Sewera zwróciła wycenę dla `00-001`. Matiw zwrócił stawkę krajową dla Polski; nie jest to obietnica dostawy pod każdy adres. Globalne porównanie dla pięciu paczek pokazało Matiw jako najtańszy **potwierdzony** koszyk, lecz część mieszanych kombinacji przekroczyła czas wyceny, więc status pozostał `needs_delivery_costs`. Aplikacja powinna zachować ostrzeżenie o niepełnym porównaniu.

## Weryfikacja i następny krok

Test HTTP pilnuje wyboru pojedynczych arkuszy dla małych ilości i paczek dla dużych oraz jednej dostawy. API i mobile typecheck, test Matiw 3/3, mobile 369/369, pricing 149/149 i kontrola legacy IDs przeszły. Przed ogłoszeniem wdrożenia trzeba jeszcze sprawdzić pakiet wspólnego backendu i produkcyjny HTTP. W następnej iteracji warto ograniczyć nadmiarowe odpytywanie mieszanych koszyków, zachowując matematycznie poprawne porównanie i jawne braki dostawy.
