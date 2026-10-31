# Koszyk podczas ograniczenia zapytań — 2026-10-31, wave151

Formularz dostawy działa niezależnie od wyniku wyceny. Podczas ładowania i błędów użytkownik nadal może zmienić kod pocztowy, odbiór własny oraz sposób porównania zamówień. Zmiana miejsca dostawy natychmiast unieważnia skrót zakupowy i ukrywa poprzednią sumę; niepełny kod nie może przedstawiać starej dostawy jako aktualnej. Poprawny kod zatwierdzany jest po 650 ms lub opuszczeniu pola. Zachowano ochronę kliknięć przy przechodzeniu z pola do przełączników.

Po HTTP 429 wspólna bramka klienta zatrzymuje nowe zapytania o wycenę i historię cen do terminu `Retry-After`. Obsługuje liczbę sekund i datę HTTP; przy nieczytelnym/brakującym nagłówku czeka 60 s. Formularz, koszyk i lokalnie zapisana ilość pozostają dostępne. Przycisk ponowienia pokazuje odliczanie i jest zablokowany przed terminem. Upływ czasu sam nie wysyła zapytania. Ponowienie używa bieżącej ilości i kodu, a nie wcześniej odrzuconego koszyka.

Wspólny backend udostępnia przeglądarkom `Retry-After` wyłącznie na `/api/remont`, przed istniejącym limiterem. Limit 120/min i jego współdzielenie z innymi modułami pozostały bez zmian. Produkcyjny moduł wycen, 309 źródeł i pozostałe 149 plików identyczne ze świeżym snapshotem. PR: https://github.com/jakatora/przetargai/pull/142, merge `e8c469256cbdca489c2ebfcea514e1b722dbcb22`.

## Pomiary i dowody

- Pomiar publicznej aplikacji sprzed zmiany, własny pusty profil, bez przechwytywania zapytań i bez kodu dostawy: dodanie jednej pozycji oraz zmiany 5→10→15 mb wywołały po jednym POST wyceny. Historia: odpowiednio 1/2/2 odczyty GET, łącznie 8 żądań, bez 429 i błędów strony; po 5 s bezczynności nie było kolejnych zapytań. Nie potwierdzono pętli wycen. Nie podnoszono limitów na podstawie samego wystąpienia 429.
- 417/417 testów aplikacji, typecheck i 66 legacy IDs PASS. Pięć nowych testów sprawdza formaty nagłówka, błędne wartości, wspólny czas blokady, brak sieci przed terminem i zwykłe błędy sieci/503.
- 1064/1064 testów wspólnego backendu, 0 pominięć. Nowy rzeczywisty test HTTP wyczerpuje limit wyłącznie lokalnie: 120 odpowiedzi bez blokady, następnie 429 z dostępnym nagłówkiem. Fitter zachowuje wspólny licznik i nie dostaje nowego nagłówka CORS.
- Test przeglądarkowy z kontrolowanym 429 i 8 s oczekiwania: kod 30-001 pozostał widoczny, zmiana 15→10 mb zapisana, przed terminem dokładnie jedno żądanie (to odrzucone). Po upływie czasu brak automatycznego ponowienia. Ręczne ponowienie po 9559 ms użyło 10 mb i 30-001. Pomyślna odpowiedź pochodziła z rzeczywistego publicznego API i koszyka sklepu ABUD: 8540 gr materiałów + 1300 gr dostawy = 9840 gr. Test nie udawał ceny ani dostawy. Dodatkowo niepełny kod natychmiast ukrył poprzednią sumę. Brak błędów strony, ekran 390 px bez przepełnienia.
- Lokalny gotowy pakiet web z rzeczywistym publicznym API: osiem różnych rolek AKS, po jednej, nadal 202266 gr z dostawą, w tym 2044 gr rabatu. Historia cen karty bez zmiany podczas testu.
- Publiczny test przełączników: kliknięcie odbioru przy aktywnym polu kodu działa; po powrocie do dostawy kod 30-001 zachowany i suma 402492 gr potwierdzona. Osiem różnych zdjęć faktycznie załadowanych (16 elementów obrazu w dwóch miejscach UI), 3 zapytania API 200, brak błędów strony i przepełnienia na 390 px. Dowód `delivery-controls-production-qa-wave151.json`.
- Pakiet web: source `5e2cb6cde414f76d527690c5dadb1fb54d8be640`, 63 zasoby / 17133083 B; SHA zasobów zgodne, 76 wartości vaulta bez wycieku. Prywatny przekaźnik dostawy poza archiwum publicznym.

Dowody poza repo: `work/basket-request-baseline-wave151.json`, `backoff-browser-qa-wave151.json`, `shared-tests-wave151.log`, `mobile-tests-wave151.log`, `backoff-preparation-wave151.json`, `web-release-integrity-wave151.json`, `web-discount-local-qa-wave151.json`. Kontrolowany błąd 429 jest testem interfejsu; nie wywoływano sztucznego przeciążenia produkcji.

## Wdrożenie

API: `e66a71c9-f8a1-4067-a3bb-f3fde964d71e`, SUCCESS, 2026-10-31T14:34:15.403Z. Kontrola SSH po wdrożeniu: 150/150 plików zgodnych z przygotowanym pakietem. Publiczne API zwraca `Access-Control-Expose-Headers: Retry-After`. Moduł cen SHA256 `7160c3d7e3e777910430c92f7861fcca6c12170d58cdcd7ef134b7d33d62c43d` bez zmiany.

Web: `e22d5d0b-ab62-42dd-b533-ef9430cd70c3`, SUCCESS, 2026-10-31T14:35:53.475Z. Publiczny test bez przechwytywania cen: osiem wariantów rolek, po dwie sztuki, 402492 gr materiałów po rabacie + 0 gr dostawy; rabat 6128 gr, historia karty bez zmiany. Brak błędów strony i limitów, PL, 390 px bez przepełnienia, crossOriginIsolated=true. HTTP: 63/63 publiczne SHA zgodne; 9 tras 200; prywatne pliki 404, niepodpisany przekaźnik 401; relayReady=true, missingAssetCount=0. Nagłówki COOP/COEP/no-referrer poprawne. Dowody `web-discount-production-qa-wave151.json`, `web-production-http-wave151.json`.

Katalog bez zmiany w tej turze: 216 referencji i wpisów zdjęć, 309 źródeł, 274 aktywne oferty dla 183 produktów, 33 pozycje bez aktywnej oferty. Następny etap: nowe, rzeczywiście dostępne oferty i zdjęcia, przy zachowaniu dokładnego EAN/wariantu oraz potwierdzonej dostawy. Cel rozwoju pozostaje ACTIVE.

Źródła protokołu: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After i https://expressjs.com/en/resources/middleware/cors/#configuration-options.
