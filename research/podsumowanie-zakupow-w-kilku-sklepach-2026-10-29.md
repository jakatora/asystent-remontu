# Podsumowanie zakupów w kilku sklepach (2026-10-29)

## Problem użytkownika

Na ekranach projektu „Przegląd”, „Zakupy” i „Budżet” skrót zakupów pokazywał tylko łączną kwotę. Przy planie rozdzielonym między sklepy użytkownik musiał otworzyć pełne porównanie, aby dowiedzieć się, gdzie kupić każdą część zestawu i ile zapłaci osobno.

## Zmiana

- Przy kompletnej wycenie z więcej niż jednego sklepu skrót pokazuje każdy sklep, jego kwotę z dostawą, koszt dostawy i przypisane produkty. Przy kilku zamówieniach z jednego sklepu pokazuje ich liczbę.
- Kwoty są wyłącznie kwotami z odpowiedzi backendu. Skrót akceptuje wynik jako kompletny dopiero, gdy suma materiałów, dostaw i kwot poszczególnych sklepów zgadza się z pełnym koszykiem. Nie podstawia zer za brakującą dostawę.
- Ostrzeżenie o ograniczonym porównaniu pozostaje widoczne. Lista szczegółowych opakowań, źródeł wyceny i linków do ofert jest w pełnym porównaniu.

## Weryfikacja

- TypeScript mobile: PASS. Testy `purchaseSummary.test.ts`: 7/7 PASS, w tym podział na sklepy i odrzucenie niespójnej sumy.
- Lokalny podgląd Expo Web przy 390 × 844 px: czytelny podział 284,60 zł na Lobo 194,80 zł i Sewera 89,80 zł; zrzut testowy: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/remont-ui-wave113-summary.png`. Tymczasowa trasa podglądowa została usunięta przed commitem.
- Rzeczywisty odczyt produkcyjnego API `POST /api/remont/pricing/project` z materiałami Dulux EasyCare 9 l i Atlas GTA 18 kg dla testowego kodu `00-001`: status porównania `needs_delivery_costs`, status skrótu `complete` z flagą `limited`, łącznie 284,60 zł. Kroki: Lobo 194,80 zł (dostawa 22,90 zł) oraz Sewera 89,80 zł (dostawa 23,90 zł). Suma kroków = 284,60 zł. Wyceny innych koszyków pozostają niepełne; wynik nie jest gwarancją najniższej ceny na całym rynku.

## Zakres kontroli kwot

Nie zmieniono cen produktów, algorytmu wyboru sklepów ani opłat. Kontrola spójności dotyczy wyświetlania kwot. Płatności, webhooki, wypłaty i rabaty nie są częścią tej zmiany. Dowodem działania ścieżki wyceny jest powyższa odpowiedź produkcyjnego API; podgląd wizualny korzystał z danych testowych odpowiadających tej wycenie.
