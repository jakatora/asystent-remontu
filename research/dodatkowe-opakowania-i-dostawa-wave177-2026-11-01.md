# Dodatkowe opakowania obniżające koszt zakupów — 2026-11-01

Źródło `59f169454fced86538824c169a65c0e4751014e4`, artefakty `G:/Projekty/asystent-remontu-work/wave177-20261101/release`. API i WWW mają status SUCCESS; siedem publicznych wycen oraz czternaście publicznych scenariuszy interfejsu PASS. Końcowy audyt z 2026-11-01 20:24:48 UTC potwierdza ważność wszystkich zwycięskich publicznych wycen.

## Zachowanie dla użytkownika

Porównanie pokazuje osobny wariant „Niższy koszt z dodatkowym materiałem”, gdy świeża wycena sklepu potwierdza niższą sumę mimo zakupu większej ilości. Standardowy wariant pozostaje wybrany. Nowa opcja podaje pełny koszt, oszczędność, dodatkowy produkt i zmianę liczby opakowań.

Użytkownik sam wybiera nadwyżkę i może wrócić do standardowego planu. Wybór działa także klawiaturą. Kwoty, produkty, dostawy, kopiowany plan i podsumowanie projektu odnoszą się do wybranego wariantu. Kopiowana lista wyraźnie opisuje dodatkowy zakup. Obmiary i zapotrzebowanie nie są zwiększane; kopia danych nadal zawiera np. 240 m, a nie 270 m. Zmiana kodu, nowa wycena lub ponowne otwarcie aplikacji wymagają ponownego wyboru nadwyżki.

## Potwierdzone przykłady

Taśma Norgips 50 mm × 30 m, GTIN `5907651698004`, jest tą samą zweryfikowaną rolką z Elmas dodaną w [wave176](./elmas-tasma-i-pelny-koszyk-wave176-2026-11-01.md). Źródła produktu: [Elmas](https://sklep-elmas.pl/p/tasma-akustyczna-samoprzylepna-z-klejem-50x3x30) i [karta producenta](https://norgips.pl/media/repository/0/153/36260b03960b449691b96488c1d9b974/NORGIPS_PL_KT_akcesoria_tasma_akustyczna.pdf).

| Potrzeba | Standard z kurierem | Proponowany zakup | Suma z kurierem | Oszczędność |
| --- | --- | --- | --- | --- |
| 240 m, 8 rolek | 233,12 zł | 9 rolek, dodatkowe 30 m | 206,01 zł | 27,11 zł |
| 210 m, 7 rolek | 210,23 zł | 9 rolek, dodatkowe 60 m | 206,01 zł | 4,22 zł |
| 180 m, 6 rolek | 187,34 zł | Brak opłacalnej propozycji | — | — |
| 270 m, 9 rolek | 206,01 zł | Brak dodatkowej propozycji | — | — |

Pełny testowy remont, 14 wejściowych pozycji i osiem sklepów: **2712,10 zł standardowo → 2684,99 zł z dodatkową rolką**. Materiały zmieniają się z 2345,20 zł na 2368,09 zł, a dostawy z 366,90 zł na 316,90 zł. Oszczędność całej płatności wynosi 27,11 zł. Pozostałe ilości i opakowania pozostają bez zmian.

Wynik pochodzi z rzeczywistego kalkulatora kraju Polska i rzeczywistego kuriera do domu, nie z domyślnego paczkomatu. Interfejs jawnie oznacza stawkę krajową, bez osobnej wyceny dla kodu pocztowego. W kodzie nie ma wpisanej opłaty 50 zł ani progu darmowej dostawy.

## Granice porównania i wydajność

Nowa deklaracja klienta `allowExtraPackages` pozwala zwracać propozycję nadwyżki. Starszy klient, jawne wyłączenie, odbiór i dostawa ręczna nie uruchamiają dodatkowych prób. Wariant nie zastępuje `best`; ma osobny `extraPackageOption` z pełnym koszykiem i różnicą sumy.

Każdy przebieg szukania nadwyżki sprawdza ograniczony wybór zwiększeń liczby opakowań jednego istniejącego SKU, do czterech partii i ośmiu wybranych koszyków. Uwzględnia minimalne partie, wielokrotności zakupu, stan i maksymalne ilości. Wyższy koszt materiałów musi móc zostać pokryty oszczędnością dostawy. Wariant, którego materiały już dowodzą wyższej sumy, nie potrzebuje kolejnej wyceny. Natywne rabaty i zaokrąglenia korzystają z istniejących walidatorów kwot.

Całe porównanie zachowuje wspólny limit **80 koszyków do wyceny**, wraz z dotychczasowymi limitami czasu i równoległości. To nie jest limit 80 żądań HTTP: odświeżenie produktu i jedna wycena mogą wymagać kilku żądań. Pierwszy przebieg rezerwuje osiem miejsc na nadwyżki; niewykorzystane miejsca wracają do zwykłego porównania. Test sprawdza pełny zwrot miejsc, gdy nadwyżki nie mogą się opłacać. Wyszukiwanie pozostaje jawnie ograniczone i nie dowodzi globalnego optimum wszystkich kombinacji oraz sklepów.

Zimny lokalny pełny remont: pierwsza odpowiedź po około 37,5 s, 449 rzeczywistych żądań do sklepów łącznie z odświeżeniem cen. Publiczny pełny remont potwierdził obie kwoty po około 37,0 s w pierwszej odpowiedzi. Są to pojedyncze obserwacje, nie p95 ani dowód gotowości na duży ruch. Liczby żądań wewnętrznych produkcji nie mierzono. Dalsza optymalizacja liczby zapytań i pomiar kilku równoczesnych remontów pozostają potrzebne przed skalowaniem.

## Dowody lokalne i publiczne

| Grupa | Wynik dla źródła 59f1694 |
| --- | --- |
| Mobile | 533 PASS, 0 FAIL, 0 SKIP |
| Pricing | 207 PASS, 0 FAIL, 0 SKIP |
| API lib, natywny TSX | 102 PASS, 0 FAIL, 0 SKIP |
| Adaptery, CJS | 133 PASS, 0 FAIL, 0 SKIP |
| Wspólny backend | 1064 PASS, 0 FAIL, 0 SKIP |
| Typecheck mobile/API, build pricing, 66 legacy IDs | PASS |
| Rzeczywiste lokalne wyceny | 7/7 PASS |
| Lokalny interfejs | 14/14 PASS, bez błędów strony i HTTP 429 |
| Rzeczywiste publiczne wyceny | 7/7 PASS |
| Publiczny interfejs | 14/14 PASS, bez błędów strony i HTTP 429 |

Grupy częściowo się pokrywają. Testy obejmują m.in. błędną kwotę, złą tożsamość, brak stanu, wielokrotności zakupu, nieopłacalny zakup, wyłączenie funkcji, starszego klienta, obcy kod oraz wygasanie. Jeżeli wycena bazowa wygaśnie podczas dodatkowego zapytania, ranking z pamięci usuwa nieaktualną podstawę; nie może ona pozostać pełną kwotą ani podstawą oszczędności. Nowy limit stanu odkryty przy dodatkowych opakowaniach dotyczy również podstawowego koszyka.

Interfejs sprawdzono przy 320 i 390 px oraz wizualnie przy 320 px. Scenariusze obejmują wybór i rezygnację, klawiaturę, kopię/import/reload, zmianę kodu, różne ilości oraz pełny remont.

Pierwszy kandydat `fe61d5d` nie znajdował propozycji dla całego remontu, ponieważ podziały zamówień zużywały limit przed dodatkowym produktem. Nowy test wielosklepowy odtworzył błąd; rezerwacja i zwrot miejsc go naprawiły. Nie zmieniono oczekiwanej oszczędności. W pierwszej zimnej próbie lokalne starsze dane startowe nie miały aktualnych ofert trzech produktów; właściwy test pełnego remontu jawnie odświeża ceny. Opóźnienie między dwoma odczytami zegara w fixture powodowało różnicę 1 ms w ważności; poprawiono zegar fixture bez rozluźniania walidacji.

## Publikacja

[PR 162](https://github.com/jakatora/przetargai/pull/162), head `f4d52d106fd6006611f4b8a6c8a23f8b7bc28d6a`, merge `6c93d3074cce5119628ebd6b9871c726af2cabf8`. We wspólnym repozytorium zmienia się tylko moduł remontowy. Snapshot 150 plików zachowuje pozostałe 149 oraz wszystkie 346 obserwacji. SHA modułu: `06976f1c148422e05ffa2acced15f2af44d99340308231ddefbdc324c0fba87e`.

API `90c33ed8-a7d7-4f24-840c-fe44f2b326c1` ma SUCCESS. Snapshot z 2026-11-01 20:19:36 UTC jest identyczny z przygotowanym wydaniem. WWW `914883a2-2ef3-4594-ba2c-59e28ed5c405` również ma SUCCESS; opublikowano je po siedmiu poprawnych publicznych wycenach API.

WWW: 63 zasoby / 17 267 969 B, zgodne SHA również przez publiczny HTTP, kontrola 76 wartości vaulta bez wycieku. Dziewięć stron ma HTTP 200, pięć kontrolnych niedostępnych ścieżek HTTP 404, a prywatny adapter bez autoryzacji HTTP 401. Zachowane: polski dokument, właściwy typ WASM, COOP `same-origin`, COEP `credentialless` i `no-referrer`. Wszystkie siedem plików hosta, konfiguracji i prywatnego adaptera jest identycznych z wave176.

Publiczny katalog nadal ma 239 referencji, 207 potwierdzonych materiałów, 307 ofert i 32 braki o tych samych identyfikatorach. Audyt nie znalazł błędnych potwierdzeń ani pominięć tożsamości; cztery warianty bez EAN nadal mają właściwą tożsamość sklepową. Katalog produktów i zdjęć nie został zmieniony w tej partii. Nie zmieniono zależności, migracji ani obcych zmian w nakładce EAN, mapowaniach i lockfile. Nie wysłano zamówienia ani płatności.

Końcowe dowody: `verification-summary.json`, `final-railway-deployments.json`, `production-extra-native.json`, `production-surplus-qa.json`, `production-surplus-backup.json`, `production-http.json`, `catalog-identity-production-audit-wave177.json` i `deployed-verification.json`. Wszystkie procesy tej partii zakończone.

Stały cel pozostaje aktywny: dalsze pokrycie katalogu i dostaw, zmiany cen, wygoda użytkownika, szybkość oraz walidacja z prawdziwymi remontującymi.
