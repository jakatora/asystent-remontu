# Niepełne porównanie dostaw widoczne przy kwocie — 2026-10-31

W rzeczywistym koszyku z wave145 backend zwracał `status: compared`, pełną potwierdzoną kwotę oraz niewycenione warianty tego samego sklepu (`partiallyQuotedStores`, `unavailableStores.partial`). Interfejs pokazywał wtedy kwotę i dopiero zwijaną listę problemów pod produktami. Wyraźne ostrzeżenie przy kwocie działało wyłącznie dla `needs_delivery_costs`. Użytkownik mógł więc uznać wynik za najtańszy, chociaż jeden z niewycenionych wariantów mógł być tańszy.

Nowa funkcja `unconfirmedDeliveryCoverage` uwzględnia także częściowo wycenione sklepy i brakujące dostawy przy statusie compared. Przy pełnej kwocie pokazujemy „Porównanie niepełne”, listę sklepów oraz informację, że inny zestaw może kosztować mniej. Dla ręcznie wybranego sklepu ostrzeżenie obejmuje wyłącznie jego warianty. Wyceny odbioru, innego kodu, brakujące produkty i koszyki bez potwierdzonej sumy zachowują dotychczasowy właściwy komunikat. Nie zmieniono cen, sortowania ani opakowań.

Odpowiedź HTTP 429 z Dekork oraz czas jego ograniczenia propagują teraz kod `retailer_rate_limited`, zamiast ogólnego quote_unavailable. UI tłumaczy go na „Sklep chwilowo ogranicza automatyczne wyceny. Spróbuj później lub sprawdź dostawę bezpośrednio w sklepie.” Nie obiecujemy czasu wznowienia i nie pokazujemy braku opłaty jako darmowej dostawy. Reguły Retry-After, odstęp 500 ms, cache publicznych odczytów 30 s i rozdzielenie prywatnych koszyków pozostają bez zmian.

Na początku fali wykonano jedną ograniczoną próbę po kilku minutach przerwy. Natywna karta SilverLux z produkcyjnego hosta nadal zwróciła 429 bez Retry-After; nie ponawiano krótkiej pętli ani nie użyto innego proxy. Dowód: `work/dekork-production-mixed-diagnostic-wave146.json`. Nie jest to potwierdzenie dostawy SilverLux/GoldLux.

Cztery testy modelu widoku sprawdzają rzeczywisty kształt odpowiedzi z wave145, brak modyfikowania pieniędzy, stare i bieżące stany, wybrany sklep i instrukcję odzyskania. Test 429 sprawdza przejście powodu przez rzeczywisty quoter i zachowanie jednego żądania podczas przerwy. Pełny pierwszy mobile: 411/411 PASS. Końcowe dowody czystego wydania, HTTP, przeglądarki i wdrożenia zostaną zapisane po sprawdzeniu.

Podstawy UX: czytelny stan, błąd blisko wyniku, konkretna kolejna czynność i jawne ograniczenie porównania. Zachowano istniejące tokeny kolorów, element alert, etykiety PL/EN i przyciski o dotychczasowej wielkości. Cel dalszego rozwoju aplikacji pozostaje aktywny.
