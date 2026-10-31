# eTak: wspólny koszyk, dostawa dla kodu i zaokrąglenia — 2026-10-31

Poprzednia partia wave157 była zweryfikowanym postępem. Ta partia dodaje nowy sklep do rzeczywistego porównania kosztu całego remontu. Cel pozostaje aktywny.

## Zakres

Dodano trzy oferty eTak: WAGO 221-412, 221-413 i 221-415, sprzedawane pojedynczo. Nowa referencja i zdjęcie dotyczą modelu dwuprzewodowego 221-412. Modele trzy- i pięcioprzewodowe zachowują dotychczasowe identyfikatory. Żaden model nie zastępuje automatycznie innego.

| Model | GTIN | Cena karty brutto | Cena netto | Zapas potwierdzony w karcie |
|---|---|---:|---:|---:|
| 221-412 | 4050821808435 | 1,23 zł | 1,00 zł | 22141 szt. |
| 221-413 | 4050821808442 | 1,53 zł | 1,24 zł | 27572 szt. |
| 221-415 | 4055143234658 | 2,60 zł | 2,11 zł | 4937 szt. |

Źródła pierwotne:

- Producent WAGO, dokładne modele i GTIN: https://www.wago.com/ca-fr/interconnexions-%C3%A9lectriques/221
- https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-2-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-412-735.html
- https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-3-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-413-733.html
- https://etak.eu/pl/products/wago-zlaczka-instalacyjna-otwierana-5-przewodowa-do-linek-i-drutow-0-14-4-mm2-32a-221-415-732.html
- Metody wysyłki: https://etak.eu/pl/delivery.html

Zdjęcia pochodzą z dokładnie wybranego modelu w natywnym formularzu; sprawdzono HTTP obrazu i załadowanie nowego zdjęcia w aplikacji. Kod produktu, GTIN, liczba sztuk, jednostka sprzedaży, zapas oraz cena muszą zgadzać się między kartą i anonimowym koszykiem.

## Rzeczywiste sumy

Sklep deklaruje VAT 23% i nalicza go od wartości netto całej pozycji. Dwie sztuki po widocznej cenie 2,60 zł kosztują w natywnym koszyku 5,19 zł, a 116 sztuk — 301,05 zł. Adapter potwierdza cenę jednostkową netto i brutto, ilość, VAT, wartości pozycji i sumę koszyka. Nie akceptuje dowolnego odchylenia mieszczącego się w tolerancji.

| Koszyk, kod 30-001 | Materiały | Kurier | Razem |
|---|---:|---:|---:|
| 2 szt. 221-412 + 3 szt. 221-413 + 4 szt. 221-415 | 17,42 zł | 17,50 zł | 34,92 zł |
| 2 szt. 221-412 + 3 szt. 221-413 + 115 szt. 221-415 | 305,50 zł | 0,00 zł | 305,50 zł |
| 3 szt. 221-413 + 115 szt. 221-415 | 303,04 zł | 0,00 zł | 303,04 zł |
| 115 szt. 221-415 | 298,46 zł | 17,50 zł | 315,96 zł |
| 116 szt. 221-415 | 301,05 zł | 0,00 zł | 301,05 zł |

Wszystkie kwoty potwierdzono w rzeczywistych koszykach oraz lokalnym UI z przygotowanym API. Oddzielnie sprawdzono kod 00-001. Dostawa jest żądana dla aktualnego kodu użytkownika i bieżącej zawartości; próg darmowej dostawy ani kwota kuriera nie są zapisane jako taryfa w kodzie.

## Kontrole pieniędzy i transportu

Wybierany jest natywny DHL Paczka z płatnością z góry. Tańsze automaty i punkty oraz pobranie nie zastępują dostawy do domu. Wyraźne 0 zł jest akceptowane wyłącznie w odpowiedzi kuriera dla pełnego, niepustego i potwierdzonego koszyka. Pole shippingCost ani stan sprzed dodania produktów nie stanowią wyceny.

Odpowiedź dodawania zawiera poprzedni stan koszyka. Osobny odczyt bez operacji zmiany potwierdza rzeczywiste pozycje; nie dodajemy ich drugi raz. Klient ma własny anonimowy zestaw cookies. Dozwolone operacje ograniczono do trzech produktów, sprawdzenia kodu, koszyka i dostawy. Nie przesyłamy danych kontaktowych ani zgód, nie składamy zamówienia.

Różnica VAT jest częścią materiałów, nie opłaty przewozowej ani rabatu. Cena katalogowa i historia ceny jednostkowej zachowują rzeczywiste obserwacje karty. UI opisuje „Zaokrąglenie VAT pozycji w koszyku sklepu”. Dotychczasowe ścisłe sprawdzanie kwot ABUD i ChemiaDoParkietu25 pozostaje bez zmian. Podziały zamówień z takimi zaokrągleniami nie są jeszcze wyczerpująco porównywane; UI jawnie oznacza ograniczony zakres również przy darmowej dostawie.

## Weryfikacja

Przeszło 80 testów adapterów, podpisanego transportu i przełączania połączenia, 30 testów porównywania koszyków, 438 testów aplikacji i 1064 testy współdzielonego backendu bez pominięć. Końcowy zestaw backendu ponowiono dla opublikowanego modułu R5: 1064/1064, bez błędów i pominięć. Kontrole typów aplikacji, czystego źródła i API poprawne; 66 identyfikatorów prac bez zmian. Pierwsza publikacja zmieniała moduł i seed (148 innych plików identycznych), końcowa poprawka transportu wyłącznie moduł (149 innych plików identycznych).

Rozszerzenie testów wykryło stary fixture IdoSell bez identyfikatora formularza. Identyczny błąd potwierdzono na poprzednim czystym commicie. Fixture uzupełniono o rzeczywiste id formularza oraz testy braku identyfikatora i błędnego właściciela pola; nie osłabiono walidacji produkcyjnej. Pierwszy lokalny przebieg QA miał błędne oczekiwanie różnicy VAT koszyka z trzema pozycjami (pominął 1 grosz dla modelu 221-413). Poprawiono wyłącznie oczekiwanie testu, a kompletny przebieg powtórzono w nowym własnym profilu. Rzeczywiste sumy aplikacji pozostawały poprawne.

Finalny lokalny UI potwierdził pięć scenariuszy, zdjęcie, etykietę VAT bez fałszywego rabatu, ekran 390 px bez przepełnienia, brak błędów i odpowiedzi 429 oraz zachowanie 116 sztuk i kodu po odświeżeniu.

Pierwszy publiczny test był nieudany mimo poprawnego katalogu: kontener API nie nawiązywał połączenia z kartą 221-412. Odtworzono to w odrębnym procesie na tym samym serwerze. DNS wskazywał jeden adres IPv4; standardowe i stosowane nagłówki również kończyły się timeoutem. Odczyt pojedynczej innej karty z wcześniejszego kontenera nie dowodził działania pełnej integracji po publikacji.

Istniejąca usługa WWW ma działający dostęp do sklepu. Do jej prywatnego pośrednika dodano trzy stałe produkty eTak. Żądania i odpowiedzi są podpisane i związane z koszykiem, kodem oraz jednorazowym identyfikatorem. Wycena musi zawierać właściwy adres koszyka, poprawne kwoty, termin ważności oraz jawne zaokrąglenie VAT. API korzysta z tego kanału zarówno przy odczycie aktualnej karty, jak i dostawie. Nie dodano serwera, klucza ani ogólnego mechanizmu odpytywania dowolnych stron.

Kontrola zgodności wcześniejszej integracji ABUD wykazała odwrotną sytuację: sklep odpowiadał z API, lecz pośrednik był niedostępny. Po przejściowym błędzie pośrednika można teraz wykonać jedną próbę bezpośrednią. Obie próby dzielą limit 20 sekund i pełną walidację tego samego koszyka. Zmiana ceny, brak zapasu, zmiana reguł zakupu, zajęta kolejka i limit sklepu nie uruchamiają ponowienia. HTTP 429 jest zachowane także przez rzeczywistą klasę natywnego klienta; pokrywa to test odpowiedzi HTTP, nie tylko symulacja już rozpoznanego błędu.

Rzeczywisty podpisany HTTP przez opublikowany pośrednik potwierdził wszystkie trzy ceny i zapasy oraz cztery koszyki: 34,92 zł za trzy modele, 22,69 zł za dwie sztuki 221-415, 315,96 zł za 115 sztuk i 301,05 zł za 116 sztuk. To bramka przed włączeniem nowego kanału w API. Dowód końcowego ponowienia: work/etak-relay-native-proof-wave158-r5.json.

Powtórzenie testów backendu po poprawce transportu napotkało błąd SQLite „database or disk is full” przy tworzeniu tymczasowej bazy jednego niezwiązanego testu. Zachowano log błędu. W unikalnym katalogu TEMP/TMP na dysku D pełny zestaw 1064 testów przeszedł bez pominięć; nie zmieniano kodu ani bazy produkcyjnej innych aplikacji.

## Ograniczenie ABUD i ochrona kolejki

Nie potwierdzono przywrócenia dostawy ABUD. Końcowa próba po wdrożeniu R5 również zwróciła quote_unavailable; zachowano ją w work/abud-compatibility-attempt-wave158-r5.json. Lokalna wycena tego samego przewodu 25 m potwierdza 192,70 zł materiałów i 0,00 zł kuriera dla kodu 30-001. Na aktualnym API natywna karta kończy się jednak timeoutem połączenia; pośrednik WWW również nie potwierdza wyceny. Zachowano rzeczywisty wynik nieudanego testu publicznego, odrębny ślad HTTP z kontenera i lokalny wynik. Nie są to dowody działającej produkcyjnej dostawy. Aplikacja pokazuje nieznaną dostawę i ograniczony wynik, a nie sztuczne 0 zł. Dowody: work/abud-compatibility-attempt-wave158-r4.json, abud-cloud-trace-wave158-r4.json i abud-local-trace-wave158-r4.json.

Ślad ujawnił dodatkowy błąd: odczyt ceny po sygnale zajętej kolejki uruchamiał połączenie bezpośrednie. Regresję potwierdził nowy test (79/80 przed poprawką, 80/80 po niej). Teraz zajęta kolejka kończy również odczyt ceny. Połączenie zapasowe pozostaje wyłącznie po błędzie przejściowym, we wspólnym limicie 20 sekund. Wycena koszyka już respektowała zajętą kolejkę.

## Publikacja

Źródło funkcji: 0374a99b2da2138fe7e003aca3bb75d8f021837c. Podpisany transport: a6406dabf26fb0081c3f786fb6853422f79bda00; ograniczona próba zapasowa: d66ccb31130ac5d9e5466159f80210af212ff6b7; zachowanie HTTP 429: d4eb8994ef1418557e5c95709425c1be45794249; końcowa ochrona kolejki API: dc777939ce8baa6876c36f0e97dcff6ab79faadd.
Backend: [PR147](https://github.com/jakatora/przetargai/pull/147), [PR148](https://github.com/jakatora/przetargai/pull/148), [PR149](https://github.com/jakatora/przetargai/pull/149) i [PR150](https://github.com/jakatora/przetargai/pull/150) (scalone).
WWW: a966382d-6f3e-4b40-b99f-796701e8bb57, SUCCESS, źródło d4eb899. API: 04eaf2ab-61e8-495e-bc83-2d3aa9942c82, SUCCESS, źródło dc77793. SHA modułu: c22ef628b61af935e60c8a1c49dc4aa9f1426d25e585c44e1590d815897a902d. Wszystkie 150 plików serwera zgodne z przygotowaną publikacją; 149 pozostałych plików i seed zachowano. Ostatnia poprawka dotyczy wyłącznie API; nie przebudowywano identycznego interfejsu ani pośrednika.

Końcowy publiczny UI bez podmieniania odpowiedzi potwierdził pięć sum: 34,92 / 305,50 / 303,04 / 315,96 / 301,05 zł, właściwe ilości i sklep, dostawę dla kodu 30-001, zdjęcie, etykietę VAT bez fałszywego rabatu i zachowanie 116 sztuk oraz kodu po odświeżeniu. Brak błędów JS i odpowiedzi 429; ekran 390 px bez przepełnienia. Dowód: work/etak-production-qa-wave158-r5.json.

Audyt publiczny objął 224 referencje: 191 z potwierdzonymi ofertami, 285 aktywnych ofert, brak pominięć i fałszywych potwierdzeń. Dane startowe zawierają 320 obserwacji; liczba zapisanych obserwacji nie jest liczbą aktualnie dostępnych produktów. Pozostają 33 starsze referencje bez potwierdzonej ceny.

Sprawdzono SHA wszystkich 63 publicznych plików, 9 tras, WASM i nagłówki izolacji przeglądarki. Pliki prywatne niedostępne (404), niepodpisane wywołanie pośrednika odrzucone (401). Porównanie zawartości publikacji z 76 kluczami vaulta nie wykazało wycieku. Dowody: work/web-production-http-wave158-r5.json, web-release-integrity-wave158-r4.json, catalog-identity-production-audit-wave158-r5.json oraz shared-tests-wave158-r5-isolated-temp.log.

Cel rozwoju pozostaje aktywny. Ta partia dostarcza działające eTak i ochronę połączeń, z jawnym ograniczeniem ABUD; nie oznacza ukończenia katalogu ani wszystkich integracji sklepów.
