# Odbiór osobisty: cena materiałów bez pozornej dostawy za zero

Data: 2026-10-29. Zmiana dotyczy widoku koszyka całego remontu i porównania sklepów w aplikacji mobilnej/webowej.

## Problem użytkownika

Silnik porównania przy `pickup` przyjmuje koszt dostawy równy zero, aby porównać ceny opakowań. Nie sprawdza, czy cały zestaw czeka w jednym oddziale, ani kosztu dojazdu. Widok nazywał taki wynik „najtańszym zestawem do odbioru”, pokazywał wiersz „Dostawa 0,00 zł” i przy zachowanym kodzie pocztowym wyświetlał przycisk „Sprawdź dostawy ponownie”. To sugerowało pełny koszt lub potwierdzoną możliwość odbioru.

## Zmiana

- Tryb odbioru pokazuje „Ceny materiałów do odbioru” i wyraźną informację o konieczności potwierdzenia wszystkich opakowań w oddziale oraz o niewliczonym dojeździe.
- Jeśli jest pełna wycena, główna kwota ma etykietę „Suma materiałów”. Wiersz dostawy i opłata `0,00 zł` nie są prezentowane jako koszt transportu; również karty sklepów i alternatyw w tym trybie nie przedstawiają fikcyjnej opłaty.
- Wybór globalny nazywa się „Porównaj ceny”, co pozostaje prawdziwe także przy niepełnym koszyku. Przy potwierdzonym pełnym koszyku nagłówek mówi „Najniższa cena materiałów”.
- Przycisk ponownego sprawdzenia dostaw i komunikat o braku wyceny dostawy wymagają trybu `shipping`, więc stary kod pocztowy nie włącza ich podczas odbioru. Po przełączeniu z powrotem na dostawę dotychczasowy kod i pełna wycena pozostają dostępne.

## Weryfikacja

Na lokalnym podglądzie `http://localhost:8082/renovation-basket` sprawdzono koszyk trzech prac z kodem testowym `00-001`. W trybie odbioru widok wskazał cztery pozycje bez potwierdzonej oferty odbioru i nie podał pełnej kwoty. Po zmianie nie było przycisku „Sprawdź dostawy ponownie”; informacja o oddziale i dojeździe była widoczna. Po powrocie na dostawę kod `00-001` i porównanie z realnymi opłatami pozostały. Typecheck mobilny PASS, testy mobilne 370/370 PASS. Backend i dane cenowe nie były zmieniane; tej wersji mobilnej nie opublikowano w sklepie z aplikacjami.
