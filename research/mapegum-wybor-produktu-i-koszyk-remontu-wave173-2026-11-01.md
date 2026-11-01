# Asystent Remontu — wybór produktu i opakowań w całym remoncie

Stan na 2026-11-01, po wdrożeniu i sprawdzeniu publicznej aplikacji.

## Problem i wynik dla użytkownika

Rzeczywisty formularz hydroizolacji zapisuje wcześniejszy Mapegum WPS 5 lub 10 kg. Te kody EAN celowo nie należą do zatwierdzonej rodziny aktualnych opakowań. W konsekwencji użytkownik takiego projektu nie miał dostępu do istniejącego automatycznego doboru wiader.

Dodano jawny wybór aktualnego produktu o tej samej masie. Karta pokazuje zdjęcie, pełną nazwę i oba kody EAN, pozwala przywrócić zapisany produkt oraz informuje o ponownym sprawdzeniu ceny i transportu. Po wyborze użytkownik może osobno włączyć porównanie opakowań 3, 5, 10 i 20 kg. Starsze projekty pozostają przy swoich produktach, dopóki użytkownik nie dokona wyboru.

Nie jest to alias kodów kreskowych ani automatyczna migracja. Zachowano zamkniętą rodzinę czterech aktualnych wariantów, kalkulacje, obmiary, 66 identyfikatorów prac i migracje 001–014.

## Rzeczywiste porównanie z transportem

Trzy projekty utworzone wcześniej przez rzeczywiste formularze publicznej aplikacji: malowanie 35 m², podłoga 20 m² z wybranymi panelami Oakland i podkładem Arbiton oraz hydroizolacja 12 m² ścian + 5 m² podłogi. Wymagane 22,44 kg folii i 3,4 l gruntu, kod dostawy 30-001. Kopię przeniesiono przez interfejs aplikacji do osobnych profili testowych.

| Wariant wspólnego koszyka | Materiały | Transport | Razem |
| --- | ---: | ---: | ---: |
| Zapisany produkt, stałe opakowania | 1943,10 zł | 301,90 zł | 2245,00 zł |
| Aktualny produkt 5 kg, stałe opakowania | 1987,60 zł | 291,40 zł | 2279,00 zł |
| Automatyczny dobór Mapegum, grunt nadal 1 l | 1870,05 zł | 318,30 zł | 2188,35 zł |
| Automatyczny dobór Mapegum i Primer G Pro | 1798,35 zł | 318,30 zł | 2116,65 zł |

Oszczędność ostatniego wariantu względem pierwotnego koszyka: **128,35 zł**. Wybrano 20 kg + 3 kg folii oraz 5 l gruntu. Sama zmiana kodu produktu była droższa — nie stosujemy jej domyślnie. Wynik potwierdzono również na publicznym wdrożeniu.

To najlepsze potwierdzone warianty w ograniczonym przeszukiwaniu (`searchLimited: true`), a nie dowód minimum we wszystkich sklepach. Wyceny transportu pochodzą z rzeczywistych koszyków sklepów. Sewera uwzględnia wskazany kod; część pozostałych ofert ma potwierdzony zasięg krajowy PL. Nie opisujemy ich jako indywidualnych taryf kodu pocztowego. Ceny i transport wymagają ponownego sprawdzenia przed zakupem.

Podczas lokalnej próby wariant ze stałym aktualnym opakowaniem miał kompletny potwierdzony plan, ale status `needs_delivery_costs` z powodu niepotwierdzonej alternatywy. Ostrzeżenie pozostało widoczne. W publicznej próbie wszystkie cztery warianty miały status `compared` i zero brakujących produktów. Brak kosztu nie został zamieniony na darmową dostawę.

## Zapis, zapasy i izolacja

- Nowy zapis `remont.mapegum-product-choice.v1:` jest niezależny dla projektu i wspólnego koszyka. Potwierdzone zakończenie zapisu poprzedza zmianę produktu oraz wyceny.
- Posiadanie, zakup, ręczna cena i częściowy zapas starego produktu nie przechodzą na nowy kod EAN. Źródłowe wiersze zakupów i obmiary nie są nadpisywane.
- Wspólny koszyk dziedziczy wybory z projektów; zmiana we wspólnym koszyku nie zmienia pojedynczego projektu.
- Eksport czeka na zakończenie zapisu. Wybory i kopie uszkodzonych ustawień przechodzą przez eksport/import wraz z remontem.
- Uszkodzony zapis wstrzymuje wycenę. Naprawa wymaga jawnego działania i zachowuje dokładną kopię błędnych danych przed przywróceniem produktu.

## Weryfikacja i wydanie

- Źródło aplikacji: `784db965ac72fc7673b3918dc7619090b08324a4`.
- WWW: `e8e08314-34fd-4eeb-8590-35bfd6afd62c`, Railway `SUCCESS`.
- API pozostaje na wydaniu 169: `955a75a0-0d30-468c-a256-5ef2fc56e91f`, `SUCCESS`; źródło `42fd74d2f6a5fdf7e7e73e996292142512141918`.
- 517 testów PASS, zero pominiętych; typy i kontrola 66 starszych identyfikatorów PASS. Istniejące testy wykluczające stare EAN z automatycznej rodziny pozostały bez zmian.
- 13 prób przeglądarkowych na nowym lokalnym buildzie z rzeczywistym publicznym API i 13 na publicznym wdrożeniu PASS. Obejmują pełny koszyk, wszystkie warianty, 320/390 px, błąd zapisu, przeładowanie, izolację projektu, eksport oraz naprawę uszkodzonego wyboru. Zero błędów strony i odpowiedzi 429.
- Publiczny HTTP: 63 zasoby z prawidłowymi SHA, WASM, polski dokument, 9 tras 200, 5 kontrolnych tras 404, prywatny relay 401 bez podpisu. Nagłówki izolacji i referrer bez zmian.
- 7 plików serwera i konfiguracji WWW identycznych z wydaniem 169. Brak kluczy z 76 sprawdzonych wartości vaulta w publicznych zasobach. Bez zmian API, zależności, płatności i analityki.
- Pierwsza próba lokalnego przekazywania HTTP zakończyła się domyślnym limitem Playwright 30 s. Poprawiono wyłącznie limit pośrednika testowego; kolejna pełna próba zakończyła się pomyślnie. Nie przedstawiamy tego jako poprawki wydajności aplikacji.

Dowody lokalne: `G:/Projekty/asystent-remontu-work/wave173-20261101/`: `local-product-qa.json`, `production-product-qa.json`, kopie remontu, zrzuty ekranów, `mobile-validation.json`, `production-http.json`, `web-integrity.json`, `web-server-compatibility.json` i `selected-package-evidence.json`.

To przegląd ścieżki pieniędzy: ceny i transport pozostają po stronie rzeczywistych odpowiedzi API w groszach, zakres projektu jest izolowany, zmiana produktu unieważnia poprzedni wynik, a niepotwierdzone alternatywy pozostają jawne. Dowodem są odpowiedzi publicznego HTTP i test całego koszyka na żywym buildzie.

## Źródła tożsamości produktów

- [Aktualny wariant 5 kg, Rab-Dom](https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-5kg-HYDROIZOLACJA-PLYNNA-FOLIA/1906), EAN 8022452242489.
- [Aktualny wariant 10 kg, Rab-Dom](https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-10kg-HYDROIZOLACJA-PLYNNA-FOLIA/9873), EAN 8022452242496.
- [Wcześniejszy wariant 5 kg, WinBud](https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-5kg/131) i [10 kg](https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419).

Strona produktu potwierdza tożsamość, nie kompletną dostawę. Nie użyto opisu zużycia sklepu do zmiany wzorów kalkulatora.

## Następne priorytety

Stały cel pozostaje aktywny. Kolejne prace powinny domykać rzeczywiste braki trzech głównych ścieżek oraz skracać oczekiwanie na pełną wycenę bez pogorszenia sklepów. Eksperyment współbieżnych koszyków z wydania 170 nadal pozostaje wstrzymany. Plan biznesowy i potrzeba testów z rzeczywistymi użytkownikami pozostają w `kierunek-biznesowy-i-walidacja-2026-11-01.md`; automatyczne QA ich nie zastępuje.
