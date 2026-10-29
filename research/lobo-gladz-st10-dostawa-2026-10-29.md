# Gładź Acryl-Putz ST10 20 kg w Lobo (2026-10-29)

## Potrzeba użytkownika

Dodanie drugiego sklepu dla dokładnie tej samej gładzi pozwala porównać pełny koszt koszyka, a nie samą cenę worka. Referencja ST10 20 kg ma EAN `5903973104421`; folia Diall PE, Toledo, Facile i pozostałe brakujące warianty nie dostały fikcyjnych ofert na podstawie wyników wyszukiwania.

## Potwierdzenie produktu i dostawy

- [Lobo](https://lobo.pl/sniezka-acryl-putz-st10-start-gipsowa-gladz-szpachlowa-20-kg): natywne Shoper Front API potwierdziło produkt `57305`, kod `q159220000000BK00N`, EAN `5903973104421`, zakup `1 szt. = 20 kg`, `can_buy=true` i cenę brutto **36,99 zł**. Obserwacja: `2026-10-29T16:26:25.190Z`; SHA-256 odpowiedzi API: `935230cc9d6872adb7110f14ab9ee837666153bb029f9229fd7824f49e5e6013`. Zdjęcie Lobo zwróciło HTTP 206 `image/webp` dla żądania zakresowego.
- Anonimowy koszyk z 1 workiem zwrócił kuriera InPost przy przedpłacie **45,90 zł**, razem **82,89 zł**. Stawka **37,90 zł** dotyczy paczkomatu i nie jest dostawą do domu. Nie wpisano danych klienta ani nie złożono zamówienia. Jest to taryfa krajowa dla koszyka w Polsce (`destinationScope=PL`), nie osobna wycena dla kodu `00-001`.
- Produkcyjne `POST /api/remont/pricing/project` po wdrożeniu: przy wyborze Lobo `status=compared`, brak brakujących produktów, materiały **36,99 zł**, kurier **45,90 zł**, suma **82,89 zł**. Bez wskazania sklepu najtańszy potwierdzony koszyk dla testowego kodu `00-001` to [Sewera](https://sklep.sewera.pl/acryl-putz-st10-start-20kg-p6107): materiały **41,77 zł**, dostawa **23,90 zł**, suma **65,67 zł**. Globalny stan pozostaje `needs_delivery_costs`, bo ABUD ma `quote_unavailable`; nie nazywamy wyniku minimum całego rynku.

## Weryfikacja i wdrożenie

- Audyt fotografii: **188/188** URL zwraca obraz. Test integracji ST10 w kodzie API potwierdza kuriera zamiast tańszego paczkomatu; ukierunkowany zestaw `retailer-delivery.test.ts` **8/8**. Typecheck API i mobile PASS. Zestaw współdzielonego backendu **1054/1054** PASS.
- Świeży zrzut produkcji przed zmianą miał 253 obserwacje w 148 plikach. Przygotowana paczka zmieniła tylko `src/data/remont-verified-offers.json` i `src/services/remont-pricing.cjs`, zachowując 146 innych plików. Po wdrożeniu porównanie z produkcją: **148/148 plików identycznych**, 254 obserwacje, 247 aktywnych ofert, 181 aktywnych produktów. SHA-256 modułu: `f2a72c27dabe0f9589010dd20ee2ff73855aee5af129ab0216690bc06af05516`.
- Railway deployment `23c25263-0ad9-4412-a38d-676d373dff02` ma status SUCCESS; backend [PR 105](https://github.com/jakatora/przetargai/pull/105) scalony.
- Pełne uruchomienie testów API z bieżącego katalogu nie przechodzi przez istniejący problem ładowania nazwanych eksportów TypeScript z modułów mobile; ukierunkowane testy tej zmiany przechodzą. Testy mobile z ręcznym `__DEV__` mają 364/365 PASS, a pozostały test `vinylArea` wykazuje wcześniejszą niezgodność `m²` kontra `m2`, niezwiązaną z ofertą ST10. Nie deklarujemy pełnego zielonego zestawu aplikacji w tej turze.

## Dalszy kierunek

Uzupełniać inne dokładne produkty z natywną wyceną dostawy i naprawić ładowanie testów oraz rozbieżność jednostki paneli winylowych. Dla ABUD produkcyjne połączenie TCP nadal kończy się timeoutem mimo poprawnego DNS; nie zastępować nieznanej opłaty historyczną stawką lokalną.
