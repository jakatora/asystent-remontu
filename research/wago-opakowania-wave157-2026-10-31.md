# WAGO 221-415: opakowania i dostawa — 2026-10-31

Dodano dokładny model pięcioprzewodowy, zdjęcie oraz dwie oferty. Dotychczasowy WAGO 221-413, identyfikatory prac i obmiarów pozostają bez zmian. Nie zamieniamy automatycznie modeli z inną liczbą zacisków.

## Źródła i jednostka sprzedaży

- WAGO, model 221-415 i GTIN 4055143234658: https://www.wago.com/ca-fr/interconnexions-%C3%A9lectriques/221
- Prescot: 1 szt., 4,23 zł brutto, ID 9816, SKU 221-415: https://www.prescot.com.pl/pl/p/ZLACZKA-WAGO-221-415-5X4mm-LINKADRUT-NO-WA/9816
- Elektro-Hurt: pełne opakowanie 25 szt., 69,84 zł brutto, ID 462, SKU WAGO-125138*25: https://sklep.ehw.com.pl/osprzet-laczeniowy/szybkozlaczka-zlaczka-wago-221-415-5x4-mm
- Zdjęcie modelu: https://www.prescot.com.pl/environment/cache/images/productGfx_28797_500_500/1.jpg

W obu sklepach potwierdzono aktualną dostępność, cenę brutto oraz natywny anonimowy koszyk. Jedna jednostka API „szt.” w Elektro-Hurt oznacza całe opakowanie 25 złączek. Kontrola wiąże wielkość opakowania z dokładnym GTIN, SKU, nazwą i opisem. Zmieniona wielkość opakowania, kod, model lub jednostka odrzucają ofertę.

## Potwierdzone koszyki

| Zapotrzebowanie | Zakup | Materiały | Dostawa | Razem |
|---|---|---:|---:|---:|
| 1 szt. | Prescot: 1 szt. | 4,23 zł | 24,60 zł | 28,83 zł |
| 25 szt. | Elektro-Hurt: 1 opak. | 69,84 zł | 21,00 zł | 90,84 zł |
| 26 szt. | Elektro-Hurt: 1 opak. + Prescot: 1 szt. | 74,07 zł | 45,60 zł | 119,67 zł |

Dla porównania 25 szt. w Prescot kosztuje 105,75 + 24,60 = 130,35 zł, czyli o 39,51 zł więcej. Każda dostawa pochodzi z rzeczywistego koszyka i nie jest stałą stawką wpisaną do aplikacji. Obie wyceny są krajowe dla Polski; aplikacja wyraźnie odróżnia je od wyceny indywidualnej dla kodu 30-001. Nie traktuje odbioru osobistego ani automatu jako kuriera do domu.

## Weryfikacja

Przeszły 42 testy wyceny i dostawy, 438 testów aplikacji i 1064 testy współdzielonego backendu (szeregowo). Poprawne kontrole typów w aplikacji, czystym źródle i API oraz 66 identyfikatorów prac.

Lokalny test rzeczywistej aplikacji potwierdził trzy warianty koszyka, zdjęcie, ekran 390 px bez przepełnienia, brak błędów JS i odpowiedzi 429 oraz zachowanie 26 szt. i kodu po odświeżeniu. Pierwszy przebieg QA zatrzymał się na błędnym selektorze przycisku; po użyciu rzeczywistej etykiety „Zapisz dodatkową pozycję” test powtórzono w nowym własnym profilu. Nie zmieniano aplikacji dla testu.

Audyt publicznego API z 2026-10-31, 17:20 UTC: wszystkie 223 referencje sprawdzone; 190 z potwierdzonymi ofertami, 282 aktywne oferty, bez pominięć i fałszywych potwierdzeń. Lokalny audyt samych danych startowych miał 182 aktywne referencje: starsze obserwacje wygasają prawidłowo. Seed zawiera 317 obserwacji, co nie oznacza 317 aktualnych ofert.

## Kolejne sklepy

Lux-Elektro: API zwraca can_buy=true, ale witryna produktu pokazuje „Sklep zablokowany”. Nie dodano tego sklepu jako miejsca możliwego zakupu.

eTak: działająca karta i anonimowy koszyk: https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-5-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-415-732.html

Przy cenie karty 2,60 zł/szt. natywna pozycja wynosi 5,19 zł za 2 szt. i 301,05 zł za 116 szt. Sklep zaokrągla wartość netto całej pozycji i VAT. Potwierdzony kurier DHL: 17,50 zł, a dla koszyka 301,05 zł dostawa 0 zł. Tańsze 13,51 zł dotyczy automatów i punktów.

Odpowiedź dodawania zwraca poprzedni stan koszyka; dopiero osobny POST getAjax=true bez operacji zmiany odczytuje bieżące pozycje. Pusty koszyk ani pole shippingCost nie potwierdzają darmowej dostawy. Integracja wymaga dokładnej obsługi zaokrągleń dla wielu pozycji, bez rozluźniania ogólnej kontroli sum i bez przedstawiania różnicy VAT jako rabatu. Znaleziono też osobne karty 221-412 / 735 i 221-413 / 733. Dowody zapisano poza repo w work/*etak*wave157.*.

## Publikacja

Źródło aplikacji: 0e7dcc543f77052b56f3db3a919e837ffd649e77.
PR backendu: https://github.com/jakatora/przetargai/pull/146 (scalony, 297c0b061329a97e0007ad2aaa709b194a79777d).
Backend: fbd502bd-842e-4e07-9a8d-cad2f33ef3db, SUCCESS; SHA modułu 2b3918ab652b8f54a126765a506a24d01e605e08ad7be1e37c9355166ed8cc58.
Wszystkie 150 plików zgodne z przygotowaną publikacją; 148 pozostałych plików identycznych z poprzednią wersją. Pierwsza kontrola SSH wygasła; powtórzenie potwierdziło niezmieniony serwer przed wdrożeniem.
Witryna: e1b15e1d-8a4c-43fd-935f-715ad0520ee8, SUCCESS. Publiczny test przeglądarki bez podmiany odpowiedzi potwierdził wszystkie trzy kwoty 28,83 / 90,84 / 119,67 zł, właściwe sklepy i opakowania, załadowane zdjęcie, zachowanie 26 szt. i kodu po odświeżeniu, brak błędów i odpowiedzi 429. Na ekranie 390 px brak przepełnienia; dokument polski, izolacja przeglądarki działa.

Zweryfikowano SHA wszystkich 63 publicznych plików, 9 tras, WASM, nagłówki COOP/COEP i brak publicznego dostępu do plików prywatnych (404) oraz niepodpisanego wywołania pośrednika (401). Skan porównał pliki z 76 kluczami vaulta bez wykrycia wycieku. Dowody: work/wago-{local,production}-qa-wave157.json, wago-native-carts-wave157.json, catalog-identity-production-audit-wave157.json, web-production-http-wave157.json, web-release-integrity-wave157.json i shared-test-result-wave157.json. Cel rozwoju pozostaje aktywny.
