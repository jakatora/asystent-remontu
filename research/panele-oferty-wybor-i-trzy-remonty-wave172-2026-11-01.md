# Wave172 — wybór paneli z ofertą i trzy rzeczywiste formularze, 2026-11-01

## Problem i zmiana

Audyt przeszedł od Home przez formularze, zapis obmiarów i rzeczywiste żądania API. Malowanie i hydroizolacja otrzymały pełne potwierdzone koszyki. Przy panelach domyślny Kronospan Toledo 5907555422774 nie miał potwierdzonej oferty w katalogu, choć dwa inne modele miały oferty. Dotychczas użytkownik dowiadywał się o nich dopiero po zastosowaniu kolejnych wyborów.

Sekcja wyboru paneli pokazuje teraz status oferty i sklepy przy aktualnym modelu oraz przy każdej opcji. Przy braku oferty pokazuje liczbę innych modeli z potwierdzoną ofertą. Użytkownik sam wybiera inny produkt; model, dekor, zamek, grubość i warunki montażu nadal wymagają sprawdzenia. Produkty nie stały się aliasami, nie są automatycznie zamieniane ani mieszane.

Wykorzystano istniejący endpoint i cache informacji o ofertach: dokładny EAN, kategoria, jednostka i pełna wielkość paczki. To informacja o ofercie materiału, bez obietnicy kosztu dostawy. Pełna wycena następuje po zastosowaniu modelu. Cache jest współdzielony, ma maksymalnie 30 sekund, nie odpytuje cyklicznie sklepów i nie wysyła wycen po każdym klawiszu.

Przy błędzie lub wygaśnięciu informacji pozostają wszystkie modele i dotychczasowy wybór; status jest niesprawdzony. Można ponowić sam odczyt ofert bez przeliczania koszyka. Istniejący RadioCard zastąpił Pressable: przeglądarka otrzymuje rzeczywiste kontrolowane radio, zaznaczenie, spację, strzałki, grupowanie i widoczną ramkę fokusu. Dotychczasowy model paneli miał w przeglądarce aria-checked:null; nie osłabiono końcowych kontroli zaznaczenia.

## Rzeczywiste przykłady

To własne kontrolne projekty utworzone przez UI, a nie dane klienta ani uniwersalne zalecenie materiałowe. Kwoty dotyczą potwierdzonych w tych testach wariantów; ograniczenia przeszukania i niepotwierdzone alternatywy pozostają widoczne.

| Przykład | Zakres | Potwierdzona suma z dostawą |
| --- | --- | ---: |
| Malowanie | 35 m² ścian, dwie warstwy; cztery materiały | 312,44 zł |
| Podłoga Oakland | 20 m², z zapasem potrzeba 22 m²; 9 paczek po 2,51 m² oraz 4 paczki podkładu po 6 m² | 980,21 zł |
| Podłoga Classen Dąb Niasa | Te same wymagane 22 m²; 12 paczek po 1,973 m² i ten sam podkład | 1739,04 zł |
| Hydroizolacja | 12 m² ścian i 5 m² podłogi, 15 m połączeń, cztery narożniki; wybrany system i grunt | 958,48 zł |

Oakland: materiały 757,21 zł + dostawy LiderzyCen 198,00 zł i DekoratorMarket 25,00 zł. Niasa: materiały 1515,04 zł + dostawy LiderzyCen 199,00 zł i DekoratorMarket 25,00 zł. To różne produkty, więc różnica sum nie dowodzi równoważności podłóg. Wymagane m² pozostają niezaokrąglone do paczek po stronie wyboru; fizyczne paczki, dostępność, pieniądze i transport potwierdza API oraz natywne koszyki sklepów. Taryfy tych dostawców są potwierdzone dla Polski; nie udajemy indywidualnej taryfy adresowej.

Źródła identyfikacji istniejących modeli: [Toledo — Castorama](https://www.castorama.pl/panele-podlogowe-laminowane-kronospan-toledo-ac4-2-22-m2/5907555422774_CAPL.prd), [Oakland — LiderzyCen](https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472), [Niasa — LiderzyCen](https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535). Ceny w tabeli pochodzą z zapisanych odpowiedzi rzeczywistego API i natywnych koszyków, nie z cache wyszukiwarki ani stawek „od”. Sam widok strony Toledo nie potwierdza aktualnej oferty i dostawy w aplikacji.

## Zakres i weryfikacja

Zmiana obejmuje jeden plik: artifacts/mobile/components/project/LaminateChoiceSection.tsx, commit 33ac84be1399fdf3b054fd03d301b5d43af4223e. Nie zmieniono obliczeń, katalogu, zdjęć, API, migracji, zależności ani dotychczasowych ID. Siedem plików serwera/configu WWW, w tym relay dostaw, pozostało identycznych z wave171. Cudze WIP ean-overlay/mappings/lock/.atlas/PROPOZYCJE nie weszły do wydania.

508 testów mobile PASS, zero skip/fail; mobile typecheck i kontrola 66 prac/legacy ID PASS. 19 lokalnych scenariuszy nowego przepływu PASS: brak oferty, oba pełne koszyki, paczki i m², klawiatura, anulowanie bez nowej wyceny, reload, niezależność projektu i wspólnego koszyka, kopiowanie planu, backup obmiarów/zakupów, błąd odczytu, rzeczywiste 30-sekundowe wygaśnięcie, samodzielne odświeżenie informacji bez POST wyceny, widoki 320/390 px oraz zachowanie wycen malowania i hydroizolacji bez dodatkowego zapytania o katalog paneli.

Ujemne przypadki celowo zwracają HTTP 503 wyłącznie dla GET informacji o ofertach w własnej przeglądarce QA. Ceny, stany, paczki i dostawy nie są podstawiane. Pierwsza próba przeszła 17 przypadków, ale kontrola malowania zatrzymała się na starych lokalnych danych startowych bez aktualnych ofert farby i gruntu. W końcowej kontroli użyto rzeczywistego przycisku odświeżenia cen, gdy początkowa paczka nie dawała pełnej wyceny. Oczekiwane kwoty, kompletność i natywne dowody pozostały niezmienione. Nie doliczano powtórzeń jako nowych testów.

**19 publicznych scenariuszy PASS**, zero błędów stron i HTTP 429 dla wycen; ujemna próba celowo przechwytuje tylko GET katalogu we własnej przeglądarce. Wszystkie dodatnie informacje o ofertach i wszystkie wyceny są rzeczywiste. Na końcowym buildzie utworzono przez Home i formularze trzy nowe własne projekty, wybrano Oakland i otrzymano pełne wyceny 312,44/980,21/958,48 zł; eksport zachował trzy rekordy. Publiczny wspólny koszyk tych prac obejmuje 10 materiałów i daje **1943,10 zł materiałów + 301,90 zł dostaw = 2245,00 zł** w sześciu sklepach. Osobno trzy koszyki kosztowały 2251,13 zł; potwierdzona różnica 6,13 zł. Przeszukanie jest oznaczone jako ograniczone: nie twierdzimy, że sprawdzono każdą możliwą kombinację. Publiczny HTTP: 63 zgodne zasoby, 9 tras 200 + 5 kontroli 404, PL, WASM, COOP/COEP/no-referrer, niepodpisany relay 401. Paczka ma 17 241 451 B; sprawdzenie 76 wartości vaulta nie wykryło wycieku.

Ścieżka pieniędzy: ten sam surowy popyt 22 m², natywne 9/12 paczek, całkowite grosze z API, potwierdzone opłaty za obydwa zamówienia, rozdzielone ustawienia projektu i koszyka, niezmienione rekordy obmiarów oraz zakupów w backupie. Nie wykonywano zamówień, płatności, zwrotów ani wypłat. Testy przeglądarkowe nie zastępują badań z klientami i nie dowodzą konwersji.

## Wdrożenie i dalszy kierunek

WWW Railway 71e9ddb3-ddb0-412a-85dd-a741615533d0 SUCCESS, źródło 33ac84b. [Aplikacja publiczna](https://asystent-remontu-web-production.up.railway.app). Nie wdrażano API ani wstrzymanego eksperymentu wave170. Wszystkie artefakty i ślady żądań: G:/Projekty/asystent-remontu-work/wave172-20261101.

Nie dodano nowych SKU, sklepów, analityki lub monetyzacji. Toledo nadal wymaga aktualnej oferty; użytkownik może wybrać potwierdzony inny model, z zachowaniem świadomości różnic. Pozostałe wcześniejsze braki katalogu i pełnych dostaw Castorama/OBI pozostają otwarte. Do dalszej pracy: świeżość katalogu po starcie serwera, kolejne braki w najczęstszych remontach i wiarygodny pomiar drogi do zakupów. Stały cel rozwoju pozostaje aktywny.
