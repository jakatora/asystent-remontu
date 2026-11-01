# Wave171 — start od konkretnej pracy i koszyka całego remontu, 2026-11-01

## Zmiana dla użytkownika

Przycisk porównania na ekranie startowym prowadził do wyceny jednej wybranej pracy, a bez projektu do ogólnego kreatora. Teraz „Otwórz wspólny koszyk” prowadzi bezpośrednio do istniejącego koszyka całego remontu. Można połączyć wybrane zapisane prace i własne produkty; utworzenie projektu nie jest warunkiem wejścia.

Poniżej są trzy skróty do istniejących formularzy: „Maluję ściany”, „Układam panele laminowane”, „Uszczelniam łazienkę”. Wybierają odpowiednio paint-walls, laminate-flooring i bathroom-waterproofing oraz otwierają wybór pomieszczenia. Nie tworzą automatycznie projektów, zakupów ani obmiarów. To wejścia do formularzy, nie deklaracja ukończenia trzech pełnych ścieżek zakupowych.

Pełna lista kategorii została schowana pod „Pokaż wszystkie rodzaje prac”. Pozostaje dostępna, wraz ze wszystkimi 66 zarejestrowanymi pracami. Przycisk przekazuje nazwę i stan rozwinięcia do czytnika ekranu; działa Enter i Space. Usunięto powtórzony ogólny baner tworzenia projektu i pusty komunikat kierujący wyłącznie do plusa. Zerowe statystyki nie zajmują miejsca nowemu użytkownikowi. Istniejące projekty, kontynuacja aktywnej pracy i pozostałe narzędzia pozostają dostępne.

Zachowano obecne kolory i komponenty. Treść główna ma maksymalnie 1100 px na komputerze. Sprawdzono układ 320/390/1250 px, brak poziomego przepełnienia także po rozwinięciu kategorii, cele dotykowe co najmniej 44 px, nawigację wstecz oraz świeży widok telefonu.

## Zakres kodu

Trzy pliki: artifacts/mobile/app/(tabs)/index.tsx, constants/i18n/home.ts i constants/i18n/shopping-upgrade.ts. Dodano też odpowiadające tłumaczenia EN; domyślne UI pozostaje PL. Commit funkcji 3b27883521592a4a62344326bf7e7539f2c5e13f; poprawka dostępności i końcowy build d9409837f6b5432207bc51638a762f3437160e83.

Nie zmieniano obliczeń, cen, ofert, wymiarów, identyfikatorów prac, migracji ani zależności. Siedem plików serwera/configu WWW, w tym prywatny relay dostaw, ma identyczne SHA256 jak wydanie wave169. Nie wdrażano API ani wstrzymanego eksperymentu równoległych wycen wave170. Cudze zmiany ean-overlay.ts, mappings.ts, pnpm-lock.yaml, .atlas i PROPOZYCJE-COCKPIT.md nie weszły do commitu ani wydania.

## Weryfikacja

508 testów mobile PASS, zero fail/skip; typecheck mobile PASS; kontrola wszystkich 66 wpisów rejestru i chronionych legacy ID PASS. Wyniki powtórzeń nie są doliczane jako nowe testy.

**79 lokalnych scenariuszy przeglądarkowych PASS na końcowym buildzie:** 31 koszyka, 3 rzeczywistego kalkulatora hydroizolacji, 15 wyboru najniższego kosztu/jednego sklepu, 13 taśm i 17 nowych scenariuszy startu. Brak błędów stron i HTTP 429. Lokalny transport przekazywał żądania do niezmienionego natywnego API z wave169, bez podstawiania cen i dostaw.

Nowe scenariusze potwierdzają właściwy jobId każdego skrótu, zachowanie nazwy i obmiarów przy powrocie do tego samego szkicu, dotychczasowe czyszczenie obmiarów przy jawnym wyborze innej pracy, brak tworzenia rekordów przed zapisem oraz niezmienność projektów i ustawień koszyka po nawigacji. Własny kontrolny koszyk dwóch prac po 3 kg tego samego produktu dostał rzeczywistą ofertę dwóch opakowań po 5 kg: 225,80 zł materiałów + 10,50 zł dostawy = 236,30 zł. Dostawa Rab-Dom ma potwierdzony zakres Polska, nie udajemy indywidualnej taryfy adresowej.

Kontrole plików wydania: 63 zasoby / 17 238 517 B; zgodne SHA256, poprawny dokument PL, brak znalezionych 76 sprawdzanych wartości vaulta w publicznych plikach. Publiczny HTTP potwierdził 63/63 zasoby, 9 tras 200, 5 kontroli 404, WASM, COOP same-origin/COEP credentialless/no-referrer i odrzucenie niepodpisanego żądania prywatnego relay kodem 401.

**79 publicznych scenariuszy przeglądarkowych PASS** na tym samym końcowym commicie: 31 + 3 + 15 + 13 + 17. Bez przechwytywania ruchu aplikacji i bez podstawiania odpowiedzi API. Brak błędów stron i HTTP 429. Publiczne odtworzenie dwóch prac zachowało ich rekordy i wybór wspólnego koszyka; potwierdzono również sumę 236,30 zł. Sprawdzono świeży widok telefonu 390×844.

Weryfikacja dotyczy wersji przeglądarkowej Expo/RN. Nie wykonywano natywnego buildu iOS/Android ani badań z rzeczywistymi klientami. Wyniki QA nie dowodzą konwersji, oszczędności klientów, gotowości do zapłaty ani osiągnięcia pierwszej listy w 90 sekund.

## Wdrożenie i kontynuacja

[Aplikacja publiczna](https://asystent-remontu-web-production.up.railway.app). WWW Railway 0bd1dc50-5254-4b93-b37a-f40ba7b8e942 ma SUCCESS, a health i zasoby potwierdziły końcowy commit d940983. Backend pozostaje na wcześniejszym wydaniu; ta partia nie publikuje nowej usługi ani nowej bazy.

Dowody: G:/Projekty/asystent-remontu-work/wave171-20261101. Kanoniczny web-release i source.json zawierają końcowe d940983. web-release-r1, source-r1.json oraz checks-r1 to wcześniejszy niewdrożony build 3b27883 i diagnostyka; nie używać ich jako końcowej walidacji. Pierwsza kontrola wykryła brak jednoznacznej nazwy i webowego aria-expanded, poprawione w d940983. W diagnostyce poprawiono też błędne oczekiwanie eksportu całkowicie pustej kopii: właściwy test eksportuje własne ustawienia koszyka przy zerowej liczbie projektów, zgodnie z kontraktem backupu. Ostateczne kontrole nazw i stanów nie zostały osłabione.

Nie dodano nowych produktów i sklepów ani analityki, płatności czy afiliacji. Wcześniejsze braki katalogu oraz ograniczenia pełnych wycen Castorama/OBI nadal wymagają pracy. Kolejny krok to sprawdzenie trzech formularzy aż do rzeczywistego wyboru produktów i pełnej wyceny oraz minimalny wiarygodny pomiar drogi do zakupów, zgodnie z [planem biznesowym](kierunek-biznesowy-i-walidacja-2026-11-01.md).

Pomocnicze starter-pricing-samples.json są wyłącznie offline'ową próbą calculateMaterials + toPricingStageInput, przed applyShoppingContexts i wyborem modeli. Nie były wysyłane do API, nie odtwarzają pełnego żądania UI i nie dowodzą błędnych EAN ani pokrycia ofert. Do kolejnej analizy należy przejść rzeczywisty formularz i odczytać jego faktyczne żądanie.

Stały cel rozwoju pozostaje aktywny.
