# Przewody AKS i pełny koszyk z dostawą — 2026-10-31, wave148

Cel rozwoju aplikacji pozostaje aktywny. Wdrożono cztery dodatkowe produkty ze zdjęciami oraz pięć zweryfikowanych ofert ABUD/HIPPER. Publiczny katalog ma 212 referencji i 212 wpisów zdjęć, 305 źródeł, 270 aktywnych ofert dla 179 produktów. Nadal 33 wcześniejsze referencje nie mają potwierdzonej aktywnej oferty. Nowe kody nie zastępują starszych przewodów o innych EAN-ach.

## Produkty i źródła

| Wariant AKS Zielonka | Kod producenta | EAN | Cena pełnej rolki ABUD | Druga oferta |
| --- | --- | --- | --- | --- |
| YDYp 3×1,5 mm² 450/750 V, 5 m | 777214 | 5901602190944 | 28,90 zł | — |
| YDYp 3×1,5 mm² 450/750 V, 100 m | 777096 | 5904617579735 | 413,60 zł | — |
| YDYp 3×2,5 mm² 450/750 V, 25 m | 777097 | 5904617578721 | 192,70 zł | HIPPER 189,00 zł |
| YDYp 3×2,5 mm² 450/750 V, 100 m | 777099 | 5904617579759 | 630,90 zł | — |

Tożsamości kodów, długości i EAN-ów potwierdza tabela na stronie 1 [deklaracji producenta AKS 015/2025](https://media.adeo.com/media/4774947/media.pdf). Zeskanowany dokument pobrano, wyodrębniono jego obrazy i obejrzano tabelę. Starsze EAN-y 5904617573771/5904617573764 należą do odrębnych referencji i pozostają bez zmian.

Aktualne odczyty kart i koszyków:

- [ABUD: 3×1,5 mm², 5 m](https://www.abud.pl/product-pol-65373-Przewod-elektryczny-3x1-5mm2-YDYP-5m-Bialy-AKS-Zielonka.html), produkt 65373, jednostka sklepu `szt.`.
- [ABUD: 3×1,5 mm², 100 m](https://www.abud.pl/product-pol-50450-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-100m.html), produkt 50450, jednostka `op.`.
- [ABUD: 3×2,5 mm², 25 m](https://www.abud.pl/product-pol-6900-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-25m.html), produkt 6900, jednostka `op.`.
- [ABUD: 3×2,5 mm², 100 m](https://www.abud.pl/product-pol-50414-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-100m.html), produkt 50414, jednostka `op.`.
- [HIPPER: 3×2,5 mm², 25 m](https://hipper.pl/przewod-elektroenergetyczny-ydyp-3-x-2-5-mm2-450-750-v-25-m-aks-zielonka-956340429), produkt 956340429, jednostka 956397306 / `szt`.

Zdjęcia pochodzą z dokładnych kart ABUD. Żądanie użytkownika podawane jest w metrach bieżących; zakup oznacza odpowiednią liczbę pełnych rolek. Walidacja przypina EAN, produkt, długość, jednostkę i zasady zakupu. Zmieniona jednostka, cena, minimalna ilość, dostępny zapas lub zawartość koszyka odrzucają wycenę. Przekrój i długość wybiera użytkownik zgodnie z projektem instalacji; poziom cenowy nie zmienia przekroju. Nie przypisano automatycznego, niepotwierdzonego odbioru w sklepie.

## Wynik rzeczywistych koszyków

Dla kodu testowego **30-001**, przy płatności z góry:

| Koszyk | Materiały | Dostawa | Razem |
| --- | --- | --- | --- |
| Jedna rolka 25 m, ABUD | 192,70 zł | 0,00 zł | **192,70 zł** |
| Ta sama rolka 25 m, HIPPER | 189,00 zł | 18,90 zł | 207,90 zł |
| Wszystkie cztery rolki, ABUD | 1266,10 zł | 0,00 zł | **1266,10 zł** |
| Rolka 25 m w HIPPER, pozostałe w ABUD | 1262,40 zł | 18,90 zł | 1281,30 zł |

ABUD ma droższą rolkę 25 m o 3,70 zł, ale potwierdzony pełny zakup jest tańszy o **15,20 zł**. Dostawa ABUD pochodzi z faktycznego koszyka i taryfy Pocztex Kurier 24 dla kodu. HIPPER potwierdza taryfę ogólnopolską Kurier InPost. Zakres każdej wyceny jest widoczny. Kwota 0 zł nie jest stałą ani zastępczą wartością: kontrolny zakup samej rolki 5 m ma 13 zł dostawy. Zebrano sześć wariantów natywnych koszyków ABUD i pełny przebieg HIPPER bez składania zamówienia, przekazania kontaktu czy uruchomienia płatności.

Publiczne Edge QA po wdrożeniu korzystało z rzeczywistego API i koszyków sklepów, bez przechwytywania odpowiedzi. Potwierdzono oba warianty jednej rolki, cały czteroproduktowy koszyk, cztery załadowane zdjęcia, zapis pozycji i kodu po odświeżeniu, polski interfejs, izolację COI oraz brak poziomego przewijania przy szerokości 390 px. Brak błędów JavaScript i nieudanych żądań. Kwoty są odczytami z 2026-10-31, a nie obietnicą niezmiennej ceny czy dostawy dla każdego kodu.

## Poprawka obsługi formularza

Puste konto może zbudować koszyk bez zakładania projektu z obmiarami. Opis kieruje do dodania produktu z katalogu. Korzeń przewijanego widoku otrzymał `keyboardShouldPersistTaps="handled"` dla obsługi aktywnej klawiatury.

Test myszy wykrył osobny błąd: opuszczenie edytowanego pola kodu rozpoczynało pobieranie i usuwało dotychczasową wycenę, zmniejszając wysokość strony pomiędzy `pointerdown` i `pointerup` na przycisku dodania produktu. Zarejestrowane zdarzenia potwierdziły zmianę celu; sama obsługa klawiatury nie rozwiązywała tego przypadku. Widok wyceny zachowuje ostatnią zmierzoną wysokość na czas pobierania. Poprzednia kwota nadal jest ukrywana; przycisk pozostaje na miejscu. Ten sam przebieg myszy przeszedł lokalnie i publicznie po poprawce, również po wyczyszczeniu kodu.

## Weryfikacja i historia cen

- 412/412 testów mobile w czystym checkoutcie finalnego źródła; typecheck mobile/API oraz zgodność 66 dawnych identyfikatorów.
- 34/34 testy scoped API, w tym sześć nowych przypadków przewodów, rzeczywiste zanonimizowane DTO koszyków, walidacja tożsamości i kwot oraz historia/relay. Test HTTP wymaga wycen obu sklepów, aby awaria alternatywy nie była ukryta przez sam poprawny zwycięski koszyk.
- 1063/1063 testy przygotowanego współdzielonego backendu, bez pominięć. Cztery wcześniej znane błędy starszego samodzielnego zestawu API nie są zaliczane jako zielone.
- Po wdrożeniu wszystkie pięć nowych ofert ma po dwa odczyty historii: kartę z około 12:25 UTC oraz produkcyjne ponowne sprawdzenie około 13:04 UTC. Ceny się nie zmieniły: delta 0, brak sztucznej promocji i mieszania sklepów/opakowań.
- Publiczny panel dawnych produktów zachował historię Arilli: cztery odczyty, 164,45 zł; Silver Lux: cztery odczyty, 152,99 zł. Zmiana 0. Nie wstrzyknięto danych historycznych.
- Cache `/data/remont-prices.json` v3 zachowano. Przed i bezpośrednio po wdrożeniu identyczne 809 punktów / 298 obserwacji, SHA256 `1d324bdb5f70b8515e3ea2b1393fb4a74d0580428385a89c9b9ef724b6fd697f`. Po ukończeniu odświeżenia 1075 punktów / 303 obserwacje, SHA256 `5cde64f5ee47fcf9c93c7a94c721e7fae40fafdda9418cf2fec6191fe30043a6`; wszystkie 809 wcześniejszych punktów zachowane bajtowo.

## Publikacja i zakres

Źródło aplikacji: `6ed9123` (katalog), `a553d9f` (formatowanie testu), `be27316` (opis i klawiatura), finalnie **`46312a142d44930e25593e0922c4bdd40d78c8e7`** (stabilna wysokość). Backend przygotowany z `a553d9f`; późniejsze poprawki zmieniają tylko UI.

[PR 139](https://github.com/jakatora/przetargai/pull/139) scalony jako `c82179b6db3ff98e38d44325794d250bb3ef1c01`. Przed publikacją świeży snapshot 150 plików i zero nieoczekiwanego dryfu. Zmieniono wyłącznie bundle Remontu i seed 300→305; pierwsze 300 wpisów oraz pozostałe 148 plików zachowano. Po SSH wszystkie 150 plików zgodne z przygotowanym wydaniem. SHA256 modułu `cb8d3fef2f2888a71a3528256ea9a7b24bbee463d7fbe52725624e85470793e9`.

API Railway: `fb1a40b0-273c-4530-b31f-090fb2e91cb7` **SUCCESS**, utworzone 2026-10-31T13:02:28.081Z. WWW: `21f58abc-a86b-4a75-a843-452db0bec13f` **SUCCESS**, utworzone 2026-10-31T13:01:31.172Z. Finalny release `remont-web-wave148-r3-release-20261031`: 63 publiczne pliki, 17 124 662 B, wszystkie SHA256 zgodne z publicznym serwerem. Sprawdzenie 76 wartości vaulta bez wycieku. `quoteRelayReady=true`, brak brakujących zasobów, dziewięć tras 200, prywatne pliki 404, niepodpisany POST 401. Prywatny relay poza archiwum publicznym, sklepy relaya i zabezpieczenia HMAC/TTL bez zmian.

Najważniejsze dowody w katalogu roboczym: `web-aks-production-qa-wave148-r3.json`, `web-aks-production-{single,basket,products,mobile}-wave148-r3.png`, `web-production-http-wave148-r3.json`, `catalog-summary-wave148-production.json`, `aks-live-history-wave148.json`, `history-cache-preservation-wave148.json`, `mobile-clean-tests-wave148-r3.log`, `api-clean-tests-wave148.log`, `shared-tests-wave148.log`. Lokalny wynik seed-only 263 ofert / 41 braków nie obejmuje odświeżonego cache produkcyjnego i nie opisuje stanu publicznej aplikacji.

Kolejny zakres: uzupełniać dokładne 33 braki i kolejne zweryfikowane produkty z pełnym koszykiem. Castorama/OBI/Leroy nadal wymagają rzeczywistej integracji dostępowej; ta fala nie odblokowuje tych kalkulatorów. Nie dodano nowych usług, zależności ani opłat AI. Obce zmiany robocze pozostawiono nietknięte.
