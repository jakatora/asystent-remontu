# Mapei: nowe opakowania i koszt wspólnej dostawy — 2026-11-01

## Wynik

Opublikowane trzy nowe referencje ze zdjęciami: Primer G Pro 10 l, Primer G Pro 20 l i Mapegum WPS 3 kg. Czwarta nowa oferta, Mapegum WPS 20 kg z Rab-Dom, konkuruje z istniejącą ofertą WinBud wyłącznie przez ten sam GTIN. Katalog ma 230 referencji; publiczny audyt wykazał 197 referencji z ofertą, 291 aktywnych ofert, zero pominięć i fałszywych potwierdzeń. Nadal pozostają 33 starsze referencje bez aktualnej ceny. Liczba referencji nie oznacza pełnego pokrycia dostaw.

## Tożsamość i jednostka zakupu

| Oferta Rab-Dom | EAN | Produkt / stock ID | SKU | Zawartość jednej sztuki | Cena brutto podczas sprawdzenia |
|---|---|---|---|---|---|
| Primer G Pro 10 l | 8022452241147 | 15704 / 15707 | 37971 | 10 l | 139,90 zł |
| Primer G Pro 20 l | 8022452241154 | 10828 / 10832 | 37718 | 20 l | 249,00 zł |
| Mapegum WPS 3 kg | 8022452249266 | 16590 / 16595 | 59458 | 3 kg | 79,90 zł |
| Mapegum WPS 20 kg | 8022452242502 | 9875 / 9879 | 36196 | 20 kg | 385,00 zł |

Źródła pierwotne kart i zdjęć:

- https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-10l-KONCENTRAT-GRUNTUJACY-GRUNT/15704
- https://www.rabdom.pl/pl/p/MAPEI-PRIMER-G-PRO-KONCENTRAT-GRUNTUJACY-GRUNT-20L/10828
- https://www.rabdom.pl/pl/p/Folia-w-plynie-hydroizolacyjna-MAPEI-Mapegum-WPS-3kg/16590
- https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-20kg-HYDROIZOLACJA-PLYNNA-FOLIA/9875
- https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-20kg-folia-w-plynie/3543

Niezależne potwierdzenia tożsamości/opakowania:

- https://fugi.pl/produkt/primer-g-pro-op-10-i/ — 10 l i GTIN 8022452241147.
- https://fugi.pl/wp-content/uploads/2021/06/2949-primergpro-pl.pdf — karta producenta, strona 3: opakowania 1/5/10/20 l; obejrzano także zachowany render strony. Bieżące bezpośrednie adresy CDN producenta zwracały 403, więc nie są dowodem nowego odczytu.
- https://dtmhurtownia.pl/product-pol-41013-MAPEI-PRIMER-G-PRO-Koncentrat-gruntujacy-do-podlozy-grunt-20L.html — 20 l i GTIN 8022452241154.
- https://dtmhurtownia.pl/product-pol-24476-MAPEI-Hydroizolacja-plynna-folia-w-plynie-Mapegum-WPS.html?selected_size=580 — wariant 3 kg, GTIN 8022452249266.
- Zdjęcia aktualnych kanistrów 10/20 l obejrzano: etykiety Primer G Pro, pojemności oraz kody zgodne z kartami. Zdjęcie Mapegum ma oznaczenie 3 kg. Pliki graficzne nie zostały dodane do repozytorium.

`mapei-supplies.ts` wiąże źródło z dokładnym EAN, SKU, ID, nazwą, producentem Mapei/id57, adresem i jednostką `szt.` bez ułamków oraz `package="0"`. Producent, karta, jednostka lub wielopak po zmianie nie przechodzą potwierdzenia. Kilogramy w atrybucie transportowym sklepu nie są zawartością kanistra: produkt 10 l ma obecnie taki atrybut 20 kg, ale potrzeba użytkownika nadal jest w litrach. Woda do rozcieńczenia nie zwiększa kupowanej ilości koncentratu.

Nie dodano aliasów innych GTIN ani automatycznej zamiany opakowań. Każde nowe opakowanie użytkownik wybiera osobno; ta partia nie wdraża automatycznego mieszania kanistrów 1/5/10/20 l.

## Rzeczywiste koszyki

Osiem natywnych koszyków sklepów i dziewięć pełnych porównań projektu sprawdzono lokalnie. Następnie sześć rzeczywistych porównań publicznego API potwierdzono przed publikacją WWW. Wszystkie nowe ceny oraz obie oferty Mapegum 20 kg zostały potwierdzone na serwerze bez błędów odświeżenia.

- Samo wiadro Mapegum 20 kg: WinBud 367,70 + 19,50 = **387,20 zł**; Rab-Dom 385,00 + 17,99 = 402,99 zł.
- Primer G Pro 10 l + Mapegum 20 kg: Rab-Dom **524,90 zł**, natywna dostawa 0. Te same opakowania kupione osobno w Rab-Dom i WinBud: **545,09 zł**. Droższe samo wiadro daje tu tańszy kompletny zakup o 20,19 zł.
- Cztery produkty: materiały 853,80 zł. Jedno zamówienie Rab-Dom z dostawą 72,00 zł daje 925,80 zł. Potwierdzony podział na **dwa zamówienia** daje **889,79 zł**: 604,80 zł materiałów z dostawą 0 oraz osobny Primer G Pro 20 l za 249,00 + 35,99 zł. To 36,01 zł różnicy. UI i wygenerowany plan podają ten podział; nie wolno przedstawiać tej ceny jako jednego zamówienia.
- Potrzeba 10,1 l → dwie sztuki po 10 l: 311,30 zł z dostawą. 20,1 l → dwie po 20 l: 551,99 zł. 3,1 kg → dwa wiadra po 3 kg: 170,30 zł. Przecinek w formularzu działa.

Kod w sprawdzonych formularzach: **30-001**. Sklepy potwierdzają aktualną taryfę krajową **PL**, nie indywidualną stawkę dla tego kodu lub pełnego adresu; `retailer_basket_national` jest jawne w UI i planie. Kwoty są obserwacjami z 2026-11-01, a każda dostawa ma własne sprawdzenie i ważność. Nie wpisano progów darmowego transportu ani stawek do kodu. Nie składano zamówień i nie przesyłano danych kontaktowych.

## Weryfikacja i publikacja

- 94 testy adapterów/relay, 461 aplikacji, 171 pricing i 1064 współdzielonego backendu: **1790 PASS, 0 FAIL, 0 SKIP**. Osiem nowych testów obejmuje rzeczywiste projekcje odpowiedzi kart/koszyków, negatywne zmiany tożsamości, zmianę ceny przed dodaniem i błędne sumy/dostawę. Testy importują kod produkcyjny.
- Typy API i aplikacji przeszły także dla czystego źródła; chronione 66 identyfikatorów zachowane. Nie zmieniono pomiarów, migracji, zależności ani rozdziału rich/legacy.
- Dziewięć scenariuszy przeglądarki lokalnie i dziewięć publicznie: **157,89 / 311,30 / 284,99 / 551,99 / 90,40 / 170,30 / 387,20 / 524,90 / 889,79 zł**. Sprawdzono trzy nowe zdjęcia, kopię planu z dwoma zamówieniami, zapis czterech pozycji i kodu po reload, polski dokument, szerokość 390 px bez overflow, izolację przeglądarki, zero błędów JS i HTTP429. Publiczne API bez podmiany odpowiedzi. Nie testowano fizycznego urządzenia Android/iOS.
- Kod aplikacji: `85b4379683ca93f82923827320bd9b9879edf227`.
- Backend: PR https://github.com/jakatora/przetargai/pull/152, commit źródła `9d9b05908df19b60bc7b7a588f401906a4acc177`, merge `35830d7dda5d00fdcfe9a3fb91eb70ecba3ce438`.
- API `069f231a-a21a-4f0d-b6b7-b262cbbcac73` **SUCCESS**; WWW `e23ce1d3-05d5-4ca0-8178-aa98b3a5a282` **SUCCESS**.
- Świeży snapshot, ponowny preflight i snapshot po publikacji: 150 plików; zmienione tylko moduł Remont i seed, pozostałe 148 zachowane. Seed 325 → 329, poprzedni prefiks identyczny. Runtime SHA256 `3c070d6f08e240dc8cfc5a44157e03e88b8fd5cae2c43457d7f6d9a9e5682dca`.
- WWW: 63 pliki sprawdzone SHA, 17189121 bajtów, 9 tras, WASM, nagłówki izolacji; prywatne pliki 404, niepodpisany endpoint 401. Skan publicznych plików względem 76 wartości vaulta bez wycieku. Sześć plików serwera/config identycznych z162; prywatny bundle relay zmienił się wskutek nowego importowanego katalogu, SHA `b775872ce99a9c7b0b3c98ea2b71ad73d92582da720926692c67471ce7fe2aab`. Brak nowego serwera, klucza lub płatnego API.

Dowody lokalne w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work`: `mapei-native-proof-wave163.json`, `mapei-project-native-wave163.json`, `mapei-cloud-before-web-proof-wave163.json`, `mapei-{local,production}-qa-wave163.json`, `mapei-{local,production}-purchase-plan-wave163.txt`, `catalog-identity-production-audit-wave163.json`, `web-production-http-wave163.json` oraz logi testów. Własne profile local-r1/r2 i production-r1 są initializerami — nie uruchamiać ponownie skryptu inicjalizującego te same profile. R1 przeszedł; R2 rozszerza QA o widoczny podział i kopię planu, bez zmiany kodu produktu.

## Pozostałe ograniczenia i kolejne kroki

WinBud Primer 5/10 l ma starsze GTIN 8022452002564/8022452002571 mimo nazwy Pro; 20 l nie ma EAN, 1 l jest niedostępny. Nie połączono ich z opublikowanymi kodami Primer G Pro. Rab-Dom Mapegum 5/10 kg ma poprawne karty, lecz inne GTIN 8022452242489/8022452242496 niż dotychczasowe referencje; pozostają do osobnego odwzorowania, bez zgadywania aliasów.

Następny użyteczny kierunek: świadomy wybór automatycznego zestawu opakowań tej samej potwierdzonej rodziny Primer G Pro, z zachowaniem pojemności, konkretnego GTIN każdego kanistra i pełnego kosztu dostawy. Nie uznawać samego dodania opakowań za wdrożenie tej funkcji. Braki 33 starszych referencji i wcześniejsze niepotwierdzone dostawy eTak/ABUD nie są naprawione w tej partii; nie powtarzano ich bez nowej podstawy. Obce WIP nietknięte. Cel ciągłego rozwoju pozostaje **ACTIVE**.
