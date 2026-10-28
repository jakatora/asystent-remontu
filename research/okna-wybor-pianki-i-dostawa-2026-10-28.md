# Okna: wybór pianki i pełna dostawa — 2026-10-28

Model `window-repair-v2` rozszerza poprzedni dobór okien o rzeczywisty wybór dwóch pian 750 ml. Nie dodano nowych SKU, sklepów ani zdjęć: obydwa modele miały już osobne referencje, oferty i zdjęcia. Nowy zakres pozwala użyć właściwego wybranego produktu w koszyku całego remontu.

## Dlaczego dostawa Soudala nie była potwierdzona

Świeży odczyt z wdrożonego serwera Railway 2026-10-28 o 18:33:48 UTC zakończył się `UND_ERR_CONNECT_TIMEOUT` przy połączeniu do Folnetu. Ten sam problem występował już w dowodach z 2026-10-27. Brak odpowiedzi sklepu nie jest zerową dostawą ani podstawą do podstawienia starej taryfy. Istniejąca oferta i jej data pozostają odróżnione od bieżącego potwierdzenia koszyka.

Wykryto alternatywną kartę identycznego Soudala 112583 / EAN 5411183048522 w [Eshopping24](https://eshopping24.pl/pl/products/soudal-pianka-pistoletowa-niskoprezna-soudafoam-low-expansion-10-c-5687.html), z widoczną ceną 38,28 zł brutto. Karta zawiera też niespójne dane dostawy JSON-LD: kraj DE i 0 zł mimo polskiego selektora kraju. Nie użyto tych danych jako polskiej wyceny. Skrypt i natywne zapytanie o stawkę nie odpowiedziały; SSH Railway miał dodatkowo przejściowy błąd weryfikacji klucza po udanej pierwszej diagnostyce. Nie dodano niepotwierdzonej oferty do katalogu. Dowody to `work/catalog-wave68-folnet-network-proof.json` i `work/catalog-wave68-research/`.

## Wybór produktu odpowiada warunkom pracy

Pozostaje Soudal Soudafoam Low Expansion −10, zimowy, 750 ml, EAN 5411183048522. Osobny wybór to Tytan Professional 65, 750 ml, indeks 10024861, EAN 5903518052859. [Producent Tytan](https://tytan.com/pl/produkt/piany-poliuretanowe/piana-pistoletowa-65/) podaje temperaturę otoczenia +5 do +30°C i puszki +10 do +30°C, a także zastosowanie do uszczelnień przy oknach. [Karta techniczna udostępniona przez producenta](https://tytan-cdn.tytan.com/uploads/sites/53/2026/10/KARTA20TECHNICZNA20TYTAN20PROFESSIONAL206520PIANA20PISTOLETOWA2006.24-2.pdf) opisuje warunki aplikacji i potrzebne przygotowanie. Nie jest to automatyczny zamiennik pianki zimowej.

Użytkownik wybiera model i ustala liczbę puszek dla tego modelu oraz złącza. Nie przeliczamy deklarowanej wydajności litrów piany na metry naprawy. Przy zmianie modelu usuwamy poprzednią liczbę puszek i potwierdzenia dopasowania/przygotowania. Przy zmianie całego zakresu naprawy również trzeba ponownie potwierdzić dopasowanie i przygotowanie. Ta sama obsługa działa w kreatorze i edytorze.

Puste dane lub nieznany model pozostają brakami. Jawne 0 puszek oznacza brak zakupu i ukrywa niepotrzebny wybór produktu. Stare wyniki `window-repair-v1` są odczytywane bez zapisywania zmian do projektu i oznaczane do sprawdzenia; status zakupu Soudala nie przechodzi na Tytana.

Referencję ceny Tytana odświeżono na podstawie [Sewery](https://sklep.sewera.pl/pianka-montazowa-pistoletowa-65-750ml-tytan-p12439): 22,80 zł brutto, świeży odczyt 2026-10-28 o 18:45:38 UTC, dokładnie jedna puszka 750 ml. Zastąpiła starą referencję Mrówki 40,99 zł z 2026-08-23. To aktualizacja źródła z innego sklepu, nie komunikat o obniżce ceny w tym samym sklepie. Dotychczasowe obserwacje, źródła i historia porównań cen nie zostały zmienione. Dokładne zdjęcie Tytana było już w katalogu.

## Potwierdzony pełny koszt wybranych zakupów

12 rzeczywistych scenariuszy z nowego kalkulatora trafiło do produkcyjnego API; ukończono je 2026-10-28 o 18:47:15 UTC. Kody pocztowe są testowe. Nie utworzono zamówienia, płatności, konta ani zapisu projektu użytkownika.

| Zakup dla jawnie dobranej naprawy | Materiały | Dostawy | Razem |
| --- | --- | --- | --- |
| 12 m połączenia + 3 cm zakładu, bez dodatkowego zapasu: 1 rolka SWS i 1 puszka Tytana | 167,80 zł | 34,90 zł | **202,70 zł** |
| Dwie prace: 12 m + 14 m oraz dwa zakłady: wspólnie 1 rolka SWS, 2 puszki Tytana | 190,60 zł | 34,90 zł | **225,50 zł** |
| Taśma bez zakupu pianki, po potwierdzeniu sprawnej/posiadanej izolacji | 145,00 zł | 15,00 zł | **160,00 zł** |

Dla kodu 00-001 Izosystems potwierdził 15,00 zł za swój koszyk taśmy, a Sewera 19,90 zł za swój koszyk piany. Obydwie wyceny mają podstawę `retailer_basket_postcode` i własne terminy ważności. Przykłady korzystają z jawnego potwierdzenia dopasowania, liczby puszek i przygotowanego podłoża/posiadania pozostałych materiałów pomocniczych. Nie obejmują całego montażu okna, robocizny ani zakupu narzędzi. Po wygaśnięciu trzeba odświeżyć wycenę.

Wybór wyłącznie Sewery lub Izosystems ujawnia brak drugiego produktu i nie daje fałszywego zwycięzcy. Brak kodu, brak dopasowania po zmianie, nieznana pianka i odbiór bez potwierdzenia oddziału również nie dają pełnej sumy. Wybrany zimowy Soudal nadal ma `needs_delivery_costs` dla Folnetu i nie jest po cichu zastępowany Tytanem.

Parametr techniczny `allowSeparateOrders=false` wyłącza dodatkowe dzielenie koszyka jednego sprzedawcy na kilka zamówień. Nadal dopuszcza zestaw od dwóch sklepów; do filtrowania konkretnego sprzedawcy służy `options.store`. Potwierdzono oba zachowania.

## Weryfikacja i stan całego celu

698 testów logiki/API/mobile przeszło bez błędów i pominięć. Nowe regresje sprawdzają zmianę zakresu, utratę starych potwierdzeń i liczby puszek, dokładny EAN Tytana oraz stare wyniki i statusy „Mam”. Typecheck mobile poprawny. Walidacja źródeł bez ostrzeżeń; chronione ID i negatywne próby walidatora zachowane.

Backend nie wymagał nowego wdrożenia. Port 8082 odmawiał połączenia; sprawdzono brak nasłuchu i odpowiedniego procesu Node, po czym uruchomiono Expo na tym samym porcie. Nie restartowano działającego procesu. Cudze zmiany, migracje i dotychczasowe 22 projekty zostały zachowane. Dostęp do przeglądarki jest obecnie dostępny; wcześniejszy bloker ustawień Work nie jest już aktualny.

W prawdziwym interfejsie ukończono kreator i utworzono jeden jawnie nazwany projekt QA: **Test kompletu — okna SWS + Tytan, 28.10**, ID `proj_mvsh6irl0iits49gc`. Liczba projektów wzrosła z 22 do 23; nie edytowano poprzednich projektów. Porównanie wyświetliło 167,80 zł materiałów + 34,90 zł dostaw = 202,70 zł. Oba zdjęcia zostały załadowane (SWS 381×492, Tytan 400×400). Wybór samej Sewery pokazał jedną brakującą pozycję i brak pełnej sumy, następnie przywrócono najtańszy zestaw.

W edytorze sprawdzono usuwanie liczby puszek i potwierdzeń po zmianie pianki, a także ukrywanie pól i usuwanie potwierdzeń po przejściu na akryl. Próby anulowano, zachowując zapisany zestaw Tytan+SWS. Błędny nagłówek „Obmiary ocieplenia” poprawiono na „Obmiary i materiały do naprawy okna” i sprawdzono po odświeżeniu. Końcowy podgląd pozostawiono na wycenie tego projektu. Dowody: `work/catalog-wave68-ui-proof.json`, pełne teksty stanów interfejsu i dwa zrzuty PNG w katalogu roboczym; obrazów nie dodano do repozytorium.

Katalog pozostaje na 166 referencjach, 132 aktywnych produktach, 177 ofertach, 210 źródłach i 51 zarejestrowanych / 46 aktywnych sklepach. Nadal 34 pozycje wymagają odświeżenia lub uzupełnienia ofert. Te same 65 zapisanych zestawów obmiarów: 72/250 wycenionych wierszy, 178 braków, 8 pełnych scenariuszy materiałowych. Nowe, jawnie dobrane scenariusze są osobno w `explicitMeasurementChecks.wave68`; nie zwiększamy nimi pozornie pokrycia starych niepełnych obmiarów.

Dalszy priorytet to 34 braki katalogowe. Sześć pozycji bez potwierdzonej oferty: Cersanit Facile 50, Kronospan Toledo, folia Diall 20 m², Paradyż Petro Grey G2, Paradyż Nati Bianco i Archi 80. Pozostałe 28 to wygasłe weryfikacje przeglądarkowe; wymagają świeżego źródła lub dostępnej integracji. Cel obejmuje też pozostałe receptury i rzeczywiste ceny/stany pobliskich oddziałów; pozostaje aktywny.
