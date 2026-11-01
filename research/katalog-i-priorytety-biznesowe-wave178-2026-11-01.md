# Katalog i priorytety biznesowe — 2026-11-01, wave178

Punkt wyjścia: publicznie zweryfikowane źródło aplikacji `59f169454fced86538824c169a65c0e4751014e4` z wave177. Katalog ma 239 referencji, 207 z potwierdzonymi ofertami, 307 ofert i 32 braki. W tej partii nie dodano produktów, nie zmieniono aplikacji ani nie publikowano nowego API/WWW.

## Weryfikacja kandydatów

Odczyty stron wykonano 2026-11-01. Sam wynik wyszukiwania, zdjęcie lub cena na niedostępnej ofercie nie wystarczają do zamknięcia braku.

| Kandydat | Ustalenie | Decyzja |
| --- | --- | --- |
| Norgips papierowa 50 × 75 m, Elmas | [Dokładna strona](https://sklep-elmas.pl/p/tasma-spoinowa-papierowa-norgips-50x75mb-g-k) ma producenta Norgips i `OutOfStock` | Nie dodawać jako dostępny zakup |
| Taśma akustyczna 30 mm × 30 m, Elmas | [Strona](https://sklep-elmas.pl/p/tasma-izol.-akustyczna-30mm-30mb) wskazuje markę Criss; wyszukiwarka zwróciła ją dla kodu oczekiwanego Norgips | Nie utożsamiać różnych marek ani nie zamykać braku Norgips |
| Kreisel GW180 25 kg, Liderzy Cen | [Strona](https://liderzycen.pl/pl/p/Gladz-pod-walek-Kreisel-GW180-25-kg/151221) ma `OutOfStock`, SKU `ctma_5907418045300`; oczekiwany produkt 20 kg ma inny kod | Nie dodawać niedostępnego zakupu ani podmieniać 20 kg po cichu |
| Wieszak ES, MyBudio | [Strona](https://mybudio.eu/pl/profile-do-plyt-gk-i-regipsow-c-5/wieszak-es-do-profili-sufitowych-p-25) podaje GTIN 5907651699650, ale wymaga wyboru rozmiaru; właściwa marka, jednostka sprzedaży i transport PL wymagają potwierdzenia | Wstrzymać integrację do rozstrzygnięcia tożsamości i całego koszyka |
| Knauf MP75 25 kg, ERLI | [Oferta](https://erli.pl/produkt/tynk-maszynowy-knauf-mp-75-25-kg,122499772) potwierdza kod 5902367206352, ale jawnie informuje, że produkt jest niedostępny | Nie używać widocznej ceny i hasła dostawy jako dostępnej oferty |
| Knauf MP75 25 kg, Realbud | Znaleziony adres produktu 193518 zwrócił HTTP 500; nie potwierdzono kanonicznego adresu, bieżącego zakupu ani transportu | Kandydat nadal do wyjaśnienia, nie dowód trwałego braku produktu w sklepie |

Surowe odczyty i znaczniki czasu: `G:/Projekty/asystent-remontu-work/wave178-20261101/`. `primary-candidate-pages.json` zawiera statusy odczytów Elmas i Realbud; pozostałe HTML zachowano osobno. ERLI odczytano narzędziem web. Nie tworzono zamówień, nie wpisywano fikcyjnych danych klienta i nie przyjmowano ogólnego hasła „dostawa od” jako potwierdzenia przewozu całego zestawu.

## Znaczenie dla rozwoju

Te kontrole pozwalają uniknąć pozornego powiększania katalogu. Nie dowodzą zamknięcia wszystkich możliwości dla wymienionych produktów. Nadal szukać dokładnych dostępnych ofert albo jawnie wybieranych, zgodnych alternatyw; nie zmieniać istniejącego zapotrzebowania przez aliasowanie innych wariantów.

W odpowiedzi na pytanie właściciela odświeżono [plan biznesowy](./kierunek-biznesowy-i-walidacja-2026-11-01.md): aktualne pokrycie katalogu, dowód publicznego koszyka i ograniczenia wydajności, warunki inwestowania w pozyskanie, afiliację i płatne pakiety. Ponownie odczytano publiczne warunki [Castorama / Tradedoubler](https://directory.tradedoubler.com/pl/programs/383060-Castorama-Afiliacja) i [Leroy Merlin / VIV](https://www.vivnetworks.com/pl/affiliate-katalog/leroymerlin-pl/). Nie uruchomiono monetyzacji, analityki, reklam ani kontaktowania się z klientami lub sklepami.

Najbliższe prace techniczne powinny jednocześnie służyć zakupom i przyszłym przychodom: usuwać rzeczywiste braki w wybranych ścieżkach, ograniczać powtarzane odczyty sklepów i mierzyć kompletność oraz koszt wyceny. Potrzebne są też prawdziwe rozmowy i pilotaż; automatyczne QA nie potwierdza gotowości do zapłaty. Stały cel pozostaje aktywny.
