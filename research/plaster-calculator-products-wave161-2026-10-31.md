# Tynkowanie z dostępnymi produktami — 2026-10-31

Produkty dodane do katalogu w wave159 można teraz wybrać podczas obmiaru tynkowania i przy edycji zapisanego projektu: lekki maszynowy Knauf MP 75 L 30 kg oraz ręczny Knauf Goldband 30 kg. Wybór trafia do zwykłej wyceny i wspólnego koszyka. Nie trzeba ręcznie dodawać zamiennego worka jako dodatkowego produktu.

## Ilości, tożsamość i stare projekty

Do istniejącego pola plasterSystem dopisano wartości4 i5. Wartości0–3, identyfikatory projektu, pracy i obmiarów zachowują znaczenie. MP75 25 kg, MP75L 30 kg oraz Goldband25/30 pozostają odrębnymi tożsamościami. Nie powstał alias EAN ani automatyczna podmiana. Grunt i zbrojenie nadal wymagają właściwego wyboru; zmiana tynku resetuje potwierdzenia kompatybilności. Oba nowe warianty zachowują reguły grubości dla wykończenia i siatki oraz obliczenia kilogramów koncentratu, gdy użytkownik wybierze chłonne podłoże.

[Karta MP75L P113](https://knauf.com/api/download-center/v1/assets/86ef5f4d-c2b2-4734-aad6-91723572ea98?country=pl&download=true) podaje8 kg/m² przy10 mm. [Karta Goldband P131 z24.07.2026](https://knauf.com/api/download-center/v1/assets/2c71e1e0-2050-4334-a0ef-712579cd9dc9?country=pl&download=true) podaje13 kg/m² przy15 mm. Kalkulator wcześniej używał dla Goldband8,5 kg/m²/10 mm. Poprawiono oba opakowania Goldband,25 i30 kg. Zapas pozostaje osobnym założeniem użytkownika, a zużycie jest orientacyjne i zależy od podłoża.

Przykład graniczny:10,5 m² przy15 mm i10% zapasu wymaga150,15 kg, czyli6 worków30 kg. Poprzedni przelicznik dałby mniej niż150 kg i5 worków. API otrzymuje niezaokrągloną ilość kg; pełne opakowania dobiera dopiero po połączeniu wymagań pomieszczeń.

Model ilości ma wersję wall-plastering-v2. Historyczne wyliczenia v1 wymagają ponownego przeliczenia i potwierdzenia posiadanych zakupów. Nie przepisujemy ich zapisanego JSON ani kwot; pozostają obmiary i dotychczasowe produkty. Zapisane oznaczenie starego worka25 kg nie usuwa nowego worka30 kg z zakupów. Nie dodano kluczy preferencji ani migracji bazy. Poprawiono także wskazówkę mieszania, usuwając nieuzasadniony wspólny czas30–45 minut dla wszystkich tynków.

## Rzeczywiste koszyki

Sześć prób przeszło od kalkulatora do publicznego API i natywnych koszyków, bez podmieniania odpowiedzi. Ściany4 m²,10 mm,10% zapasu; grunt zadeklarowany jako przygotowany, brak zakupu siatki i narożników, chyba że tabela wskazuje grunt. Goldband6worków dotyczy przykładu10,5 m² i15 mm. Kod testowy30-001; uzyskane taryfy mają jawny zakres krajowy PL, nie osobną wycenę adresu.

| Zakupy | Materiały | Dostawy | Razem |
|---|---:|---:|---:|
| MP75L, jeden pokój,2 worki | 77,98 zł | 75,00 zł | 152,98 zł |
| MP75L, dwa pokoje razem,3 worki | 116,97 zł | 130,00 zł | 246,97 zł |
| Goldband,150,15 kg,6 worków | 282,00 zł | 126,00 zł | 408,00 zł |
| Goldband, dwa pokoje razem,3 worki | 141,00 zł | 63,00 zł | 204,00 zł |
| MP75L, jeden pokój i Betokontakt5 kg | 144,77 zł | 100,00 zł | 244,77 zł |
| Goldband, jeden pokój i Betokontakt5 kg | 160,79 zł | 67,00 zł | 227,79 zł |

Dwa pokoje MP75L wymagają35,2+35,2=70,4 kg. Osobno każdy kupowałby2 worki, razem wystarczają3. Plus-Market wycenił jedno zamówienie3worków na150 zł transportu; potwierdzony podział1+2 ma55+75=130 zł. Aplikacja i kopiowany plan zachowują wymagane dwa zamówienia. Przykład oszczędza58,99 zł wobec dwóch identycznych osobnych koszyków po152,98 zł. Jest to wynik tych sprawdzonych zawartości, nie gwarancja oszczędności na rynku.

Dowód sześciu prób: work/plaster-project-baskets-proof-wave161.json. Pięć prób pełnego publicznego UI: jeden pokój15298gr, połączone pomieszczenia24697gr, edycja drugiego na Goldband40800gr, mieszany koszyk obu produktów56098gr i ten sam wynik po odświeżeniu. Mieszany koszyk to2 worki MP75L i6 Goldband,35998gr materiałów+20100gr dostaw. Część alternatywnych koszyków Realbud nie ma dostawy; ekran zachowuje ostrzeżenie o niepełnym porównaniu. To najtańsze potwierdzone warianty w sprawdzonym zakresie, nie dowód globalnego minimum.

## Testy i publikacja

449 testów aplikacji,171 porównywania cen,0 błędów/pominięć: PASS także z czystego źródła.16 testów tynkowania obejmuje nową ilość, granicę dodatkowego worka, grunty, siatkę, płytki, nowe opcje, stare wartości wyboru, oznaczenia posiadanych materiałów i historyczny model v1 bez modyfikacji zapisanego JSON. Typy aplikacji i66 identyfikatorów prac poprawne. Walidator URL funkcji zwrócił0 błędów i6 ostrzeżeń403 Knauf; treść oficjalnych kart odczytano narzędziem WWW, nie traktowano403 jako dowodu parametrów.

Lokalny oraz publiczny Playwright utworzył własne projekty przez kreator, zmienił produkt w edytorze i wykonał pięć prób bez podmieniania publicznych danych cenowych. Oba zdjęcia katalogowe załadowane,390px bez przepełnienia, językPL i izolacja przeglądarki,0 błędów JS/429. Dowody work/plaster-calc-{local,production}-qa-wave161.json. Historyczne v1 sprawdzono w testach reguł; nie wykonywano osobnego publicznego importu starej kopii.

Pierwsze lokalne runnery miały błędne oczekiwania: odczyt przycisku przed hydratacją, spłaszczenie trzech worków mimo potwierdzonego podziału1+2 oraz oczekiwanie zdjęcia API zamiast preferowanego zweryfikowanego zdjęcia katalogowego. Poprawiono wyłącznie QA, zachowując pierwotne wersje i profile. Końcowy lokalny r4 oraz publiczny r1 przeszły na tym samym kodzie produkcyjnym. Początkowy błąd typów testowego przypisania do readonly naprawiono przez tworzenie niezmiennego obiektu historycznego.

Źródło339a3b6d94e16a32011209af6eeafaeaaba2c933. WWW35099316-2fdb-4cd0-b9bb-e91ccf73c5d8 SUCCESS: [aplikacja](https://asystent-remontu-web-production.up.railway.app). Czysty eksport63 plików,17172269B; publiczne63SHA,9 tras,WASM,nagłówki izolacji, private404 i niepodpisany relay401 poprawne. Brak76 kluczy vaulta w zasobach.

Siedem plików serwera, konfiguracji i prywatnego adaptera identycznych bajtowo z wave160. API nadal1d840f52-35a4-4e19-8545-98e6d13d2884, runtime500690270c9ed04d3211e0e0068582f5bc609b3e27960da1990ed2b8504fede7. Nie było zmian backendu, seedów, liczby referencji ani taryf; jego1064 testów z wave159 nie powtarzano. Health194 produktów/290 ofert nie jest potwierdzeniem wszystkich dostaw. eTak i ABUD nadal bez nowego potwierdzenia stabilnego dostępu. Cel rozwoju pozostaje aktywny.
