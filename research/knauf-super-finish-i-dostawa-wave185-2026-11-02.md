# Knauf Super Finish i dostawa — wave185, 2026-11-02

Dodano dwa dokładne opakowania masy Knauf Super Finish, trzy zweryfikowane oferty i fotografie właściwych produktów. Publiczne wydanie zachowuje koszyki wcześniejszych produktów. **Nowa dodatnia wycena dostawy ABUD nie przeszła próby produkcyjnej: HTTPS z działającej usługi WWW kończy się timeoutem.** Lokalnie rzeczywiste koszyki ABUD uzyskały wyceny. Nie przeniesiono tych stawek do publicznej odpowiedzi i nie uznano braku transportu za zero. Realbud wymaga wyceny transportu indywidualnie.

## Dokładne produkty i źródła

| Produkt | Kod fabryczny / EAN | Sklep i cena obserwacji | Fotografia |
| --- | --- | --- | --- |
| Super Finish 5,4 kg | 261831 / 5901793357959 | ABUD 44,70 zł za całe wiadro | Pierwotna fotografia ABUD produktu 27268 |
| Super Finish 28 kg | 503037 / 5901793357935 | ABUD 99,00 zł za całe wiadro; Realbud 103,05 zł | Pierwotna fotografia ABUD produktu 42372, ten sam dokładny GTIN w Realbud |

To nowe referencje, bez podmiany Kreisel GW180, Fill & Finish Light ani domyślnego wyboru materiału. Wszystkie wcześniejsze 240 referencji zachowano. Nadal są te same 32 pozycje bez aktualnie potwierdzonej oferty. Nie zadeklarowano kompletności dowolnego remontu.

Źródła odczytane podczas tej partii:

- [Tabela opakowań producenta Knauf](https://knauf.com/pl-PL/p/produkt/knauf-super-finish-11410_0120) potwierdza GTIN i wielkość opakowań.
- [ABUD 5,4 kg](https://www.abud.pl/product-pol-27268-Gotowa-masa-szpachlowa-Super-Finish-5-4-kg-Knauf.html), pierwotny formularz produktu, słownik GTIN, widoczna cena i Product JSON-LD.
- [ABUD 28 kg](https://www.abud.pl/product-pol-42372--Gotowa-Masa-szpachlowa-Knauf-Super-finish-28kg.html), produkt 42372, widoczna cena promocyjna i poprawna data ważności.
- [Realbud 28 kg](https://realbud.com/pl/p/Gladz-KNAUF-SUPER-FINISH-28-kg%2C-gotowa-masa-szpachlowa/75056672), pierwotne API produktu 75056672, kod 18587, jednostka `szt.`, produkt możliwy do zakupu. Natywna waga 0 oznacza brak danych, a nie zerową masę transportową.
- [Opis dostaw ABUD](https://www.abud.pl/Dostawa-Towaru-cinfo-pol-24.html) identyfikuje charakter usług. Kwoty nie pochodzą z przepisanej tabeli: wymagają odpowiedzi konkretnego anonimowego koszyka, kodu i kraju.

Obie fotografie 600 × 600 obejrzano i sprawdzono ich ładowanie w aplikacji. Nie generowano zdjęć. Artbud z niepotwierdzonym GTIN i wagą 0 nie został podłączony.

## Reguły ceny i dostawy

Oferta ABUD 28 kg nie ma zwykłego pola ceny. Parser IdoSell obsługuje dokładnie jedną parę cen katalogowej i promocyjnej w PLN z tą samą ważną datą. Cena promocyjna musi zgadzać się z pierwotną widoczną ceną brutto, formularzem SKU, GTIN, marką i całym opakowaniem. Brak daty, wygaśnięcie, konflikty walut lub powielone specyfikacje odrzucają ofertę. Granica daty jest liczona zgodnie z Warszawą. **117,60 zł ceny katalogowej nie stało się poprzednią ceną w historii; brak podstaw do pokazywania tej różnicy jako rzeczywistej zmiany po odświeżeniu.**

ABUD: do dwóch istniejących list dokładnych źródeł i dozwolonych produktów anonimowego koszyka dopisano 27268 i 42372. Dodano rzeczywiście zwrócone usługi prepaid: 100072 „Pekaes - Paleta 60x40” oraz 100073 „Geis / Pekaes  - Paleta 120x80”. Wymagane są dokładny identyfikator i nazwa, aktualny cały koszyk, Polska i potwierdzony kod pocztowy. Odbiór, paczkomaty i pobranie pozostają wyłączone. Numeryczna kwota dostawy musi zgadzać się z formatowanym brutto bez zaokrąglania ułamka grosza.

Realbud: aktualny anonimowy koszyk wybiera usługę 23 „Transport na zapytanie”, engine `personal`. Jej koszt 0 i osobne hasło o darmowej dostawie nie potwierdzają przewozu do klienta. Wynik `retailer_transport_quote_required`, brak pełnej sumy. Zmieniono tylko oczekiwany powód odmowy w jednym historycznym teście MP75L + Betokontakt; cały natywny payload, kwoty i tożsamość tego fixture pozostają takie same. Obsługa rzeczywistego transportu MP75L i pozostałych produktów nie została zastąpiona ogólną odmową.

## Rzeczywista próba lokalna

Kod 30-001; poniższe stawki są wynikami konkretnych anonimowych koszyków lokalnego kandydata, **nie publiczną taryfą**:

| Potrzeba / zakup | Materiały | Dostawa | Suma lokalnego koszyka |
| --- | ---: | ---: | ---: |
| 5,4 kg / 1 × 5,4 kg | 44,70 zł | 13,00 zł | 57,70 zł |
| 5,5 kg / 2 × 5,4 kg | 89,40 zł | 19,99 zł | 109,39 zł |
| 28 kg / 1 × 28 kg | 99,00 zł | 90,00 zł | 189,00 zł |
| 29 kg / 2 × 28 kg | 198,00 zł | 90,00 zł | 288,00 zł |
| 5,4 kg + 28 kg | 143,70 zł | 90,00 zł | 233,70 zł |

Lokalny pełny zestaw 16 pozycji, obejmujący oba nowe opakowania: materiały 2488,90 zł, dostawy 456,90 zł, razem 2945,80 zł, 9 sklepów. Była to rozgrzana próba około 5,2 s, bez porównywania jej z zimnym p95. Surowe zapotrzebowanie 29 kg pozostaje 29 kg w kopii, mimo zakupu 56 kg.

## Publiczna próba i rzeczywiste ograniczenie

Pierwszy nowy dodatni scenariusz `small-one` zakończył się niepowodzeniem po około 40,4 s: HTTP aplikacji 200, materiał 44,70 zł, `best:null`, `deliveryGrosze:null`, `totalGrosze:null`, ABUD `quote_unavailable`. Pozostałych sześciu dodatnich scenariuszy tej grupy nie uruchomiono. Oryginalna porażka jest zachowana w `production-finishes-native-progress.json` i logu. Nie osłabiono tej próby tak, aby ogłosić dodatnią wycenę jako działającą.

Niezależna pojedyncza diagnostyka z aktualnego kontenera WWW: 2026-11-01 23:54:43 UTC, DNS zwrócił rodzinę IPv4, zwykły HTTPS do dokładnej karty ABUD zakończył się `TimeoutError` po 8007 ms, bez odpowiedzi HTTP. Podobny problem był udokumentowany 2026-10-29. Nie podmieniono adresu IP, proxy, ciasteczek ani zasad TLS. Stabilny dostęp serwerowy lub kanał uzgodniony ze sklepem pozostaje do rozwiązania.

Osobny rzeczywisty publiczny koszyk wyłącznie Realbud: materiał 103,05 zł, transport indywidualny, pełna suma null. W publicznym UI potwierdzono 10 scenariuszy zachowania przy tej sytuacji:

- własne fotografie i fabryczne EAN obu opakowań;
- nieudany rzeczywisty refresh ABUD nie potwierdza nowej ceny ani wymyślonej zmiany;
- 5,5 kg oznacza dwa całe wiadra; kwota materiałów 89,40 zł, transport nieznany;
- plan wyjaśnia brak dostawy i nie pokazuje pełnej sumy;
- kopiowana lista zachowuje „do potwierdzenia”, bez lokalnej kwoty 109,39 zł;
- odświeżenie 28 kg pokazuje wyłącznie aktualnie odpowiadający Realbud 103,05 zł; nie odnawia ceny niedostępnego ABUD;
- szerokości 320 i 390 px bez przewijania poziomego;
- kopia zachowuje pierwotne zapotrzebowanie 5,5 kg.

Nie wstrzyknięto wycen ani nie zmieniono produkcyjnej historii cen na potrzeby tych scenariuszy. Symulacje wzrostu/spadku ceny pozostają wyraźnie oznaczonymi, odrębnymi testami wcześniejszej funkcji.

## Walidacja i pochodzenie wydania

Źródło aplikacji: `0436f37ef59fede66fc1a078a63407dd496b8f8a`, funkcja `e1d28716e8ac77bcd7115f80bf0757a638f2a5e6`, późniejsza zmiana tylko wyżej opisanego oczekiwania testu. Bundel po przebudowie z finalnego źródła jest bajtowo identyczny z bundlem funkcji. Typy API/mobile oraz 66 zadań legacy przeszły.

Grupy testów: 547 mobile, 214 pricing, 135 API lib, 158 adapters, 1064 shared — bez błędów/pominięć, grupy nachodzą na siebie. Pierwszy przebieg API/adapters ujawnił historyczne oczekiwanie powodu odmowy; pierwotne logi zachowano, po korekcie wyłącznie oczekiwania obie grupy przeszły ponownie. Lokalnie 31 scenariuszy natywnych, 3 scenariusze krajowego ponownego użycia i 64 scenariusze UI przeszły. 742 HTTP do sklepów w lokalnym dowodzie, 0 odpowiedzi 429, 0 złożonych zamówień.

Publicznie: wcześniejsze 22 scenariusze natywne + 1 nowy Realbud oraz 3 kody krajowe przeszły. Wcześniejsze 54 scenariusze UI + 10 rzeczywistych scenariuszy nowych produktów przy awarii źródła przeszły. **To inne pokrycie niż lokalne dodatnie scenariusze dostawy nowych produktów. Nie jest to „wszystkie 31 dodatnich scenariuszy przeszło publicznie”.**

Końcowa kontrola 2026-11-01 23:58:04.934 UTC (2026-11-02 czasu Warszawy): 142 wystąpienia zwycięskich wycen i 16 zagnieżdżonych wycen osobnych zamówień ważne w tej chwili; 242 referencje, 210 z potwierdzonymi ofertami, 311 ofert, te same 32 braki. Cztery istniejące warianty identyfikowane SKU zachowane; zero fałszywie potwierdzonych dopasowań. Wcześniejszy pełny publiczny koszyk 14 pozycji nadal 2712,10 zł, świadoma nadwyżka 2684,99 zł; pierwsza próba około 38,8 s, pojedynczy pomiar, nie p95.

Backend: 150 plików, 148 bajtowo zachowanych; zmieniono wyłącznie bundel i seed. 347 poprzednich obserwacji zachowanych bez zmiany treści, 3 dopisane. Repo i runtime starego seed różniły się końcami linii, głęboka zgodność potwierdzona przed pracą. SHA256 nowego bundla `8851ed90588581268d186f4b86cae9d4530c94045e4508cf2e6969a3010c035c`.

WWW: 63 pliki, 17 283 146 B, publiczne SHA zgodne, 77 wartości vaulta sprawdzonych bez wycieku, prywatny POST bez podpisu 401. Osiem plików hostingu bez zmian; prywatny relay przebudowany ze sprawdzonych źródeł, parsera promocji i typowanej listy produktów ABUD. Nowe publiczne wyceny próbowano dopiero po publikacji obu usług.

- [PR167](https://github.com/jakatora/przetargai/pull/167): sprawdzony head `2ec1fc5a2d0308be53da7786c3517670659e4d66`, merge `07dc085c3524821d35440e6f6fa580a722aa6256`.
- API `04c00f4d-8cb1-4d7d-bfcb-8d8bd075f9f4` SUCCESS, 2026-11-01 23:50:48.920 UTC; wszystkie 150 wdrożonych plików porównane z przygotowanym wydaniem.
- WWW `159607b5-1f5e-4358-a382-b2fa2ddf92ce` SUCCESS, 2026-11-01 23:51:43.539 UTC.
- Artefakty: `G:/Projekty/asystent-remontu-work/wave185-20261102`, podsumowanie `verification-summary.json` ma jawnie `published_with_upstream_limitation`, `allRequiredReleaseChecksPassed:false`, `newAbudPositivePublicFreightPassed:false`. Pierwotny ścisły weryfikator dodatniej dostawy zachowano.

## Kolejność dalszych prac

Najpierw stabilny dostęp do danych i czasu wyceny, kompletne ścieżki malowania/podłogi/łazienki i rzeczywisty pilotaż. Dodawanie ofert nie zastępuje dowodu samodzielnie ukończonych zakupów przez klientów. Kierunek monetyzacji i bramki pilotażu opisuje [plan biznesowy](./kierunek-biznesowy-i-walidacja-2026-11-01.md). Publiczne programy partnerskie Castoramy i Leroy Merlin ponownie odczytano 2026-11-02 czasu Warszawy; nie oznacza to przyjęcia aplikacji do programu ani gotowego źródła wyceny transportu. Nie uruchomiono reklam, płatności ani kontaktu z osobami trzecimi. Ciągły cel rozwoju pozostaje aktywny.
