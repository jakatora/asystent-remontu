# Wybór sklepu dla całego remontu — 2026-10-25

Użytkownik chce sam wybierać między najniższym kosztem zestawu z dostawą a zakupem w konkretnym sklepie, także stacjonarnie w okolicy. To rozszerza porównanie cen; nie zmienia materiałów ani obmiarów.

## Dostępne zachowanie

- „Najtańszy zestaw” zachowuje porównanie sprzedawców i dotychczasowe ograniczenia zakresu wyszukiwania.
- „Porównaj sklepy” pokazuje kwoty materiałów z serwera oraz pokrycie zestawu. Pełne zestawy poprzedzają częściowe; brak oferty ma kreskę zamiast ceny 0 zł. Wyszukiwanie obejmuje wszystkie 30 sklepów, również sklepy bez ofert dla danego remontu.
- Wybór sklepu obejmuje etapy, wspólne opakowania całego remontu i dostawę. Backend usuwa oferty innych sklepów przed dalszymi obliczeniami. Klient odrzuca niezgodny wynik ze starszego API.
- Preferencja sklepu i dostawy jest zapisywana lokalnie dla projektu. Kolejka zapisów i numer aktualnego żądania chronią przed nadpisaniem nowszego wyboru.
- Brakujące produkty pozostają na liście. Nie przedstawiamy kosztu dostępnej części jako sumy całego remontu. W trybie sklepu komunikat mówi o braku potwierdzonej oferty w tym sklepie, a nie o nieobecności produktu w całym katalogu.
- „Zakupy w Twojej okolicy” otwierają wyszukiwanie wybranego sprzedawcy i wpisanego kodu lub miasta w Mapach Google. Nie pobieramy GPS. Mapa nie jest potwierdzeniem ceny, stanu magazynowego ani dostępności odbioru w oddziale; koszt dojazdu jest wyłączony.

Źródło formatu odnośnika Maps: https://developers.google.com/maps/documentation/urls/get-started — sprawdzone HTTP 200 dnia 2026-10-25.

## Odbiór i weryfikacja

- 280 testów cen, API i klienta oraz 55 regresji współdzielonego backendu: PASS, 0 pominiętych. Typecheck API i mobile: PASS. Kontrola 66 identyfikatorów prac: PASS.
- Test HTTP zawiera celowo tańszą ofertę konkurenta: sklep wybrany przez użytkownika pozostaje wybrany po połączeniu dwóch pomieszczeń i doliczeniu dostawy. Brakująca pozycja uniemożliwia wycenę pełnego koszyka.
- Produkcyjny HTTPS: dwie pozycje po 3 l i 2 l tej samej farby wymagają jednego opakowania 5 l. Materiały: Sewera 98,50 zł, Castorama 118,00 zł, OBI 109,99 zł; Buduj24 bez potwierdzonej oferty. Sewera z dostawą dla testowego kodu 00-001: 118,40 zł. Dodanie klamki dostępnej wyłącznie gdzie indziej zachowuje wszystkie pozycje i daje brak pełnej wyceny.
- Dotychczasowy koszyk trzech prac nadal 790,83 zł = 637,43 zł materiałów + 153,40 zł dostaw. Health 200, auth/me 401.
- UI w przeglądarce: wyszukiwanie sklepu, częściowy koszyk Castoramy, zachowanie wyboru po przeładowaniu, HIPPER bez ofert i bez fałszywego 0 zł, wyszukiwanie Castoramy w Mapach dla 00-001. Sprawdzono widok 390×844 i domyślny; tymczasowy rozmiar przywrócono. Końcowo przywrócono wszystkie sklepy i dostawę na 00-001. Nie zmieniono trzech wybranych prac ani oznaczenia posiadanej pozycji.

## Wdrożenie i granice zakresu

PR https://github.com/jakatora/przetargai/pull/18, źródło `277193bbe0726669b5e749d5f7088665c1093c19`, merge `41383317e2dcc56fd1730f399b6ef43b23222fe2`. Railway `8b0ce1e7-aba9-438c-864b-adfb13f7c479`: SUCCESS, 2026-10-25 21:20:55 Europe/Warsaw. Zmiana współdzielonego backendu to jedna linia wygenerowanego modułu cen; dane ofert i pozostałe aplikacje zachowane. Interfejs jest dostępny w lokalnym podglądzie; nie wykonano nowego wydania Android/iOS.

Dowody poza repo: `work/store-choice-production-proof.json`, `outputs/asystent-remontu-wybor-sklepu-dowod-20261025.json`, zrzuty `outputs/asystent-remontu-wybor-sklepu-telefon-20261025.png` i `outputs/asystent-remontu-porownanie-sklepow-20261025.png` w katalogu zadania.

## Nadal do wykonania

Katalog ma **63 ze 103 produktów z potwierdzonymi ofertami, 40 brakujących**, 89 aktywnych ofert i zdjęcia przypisane do 103 pozycji. Ta zmiana nie zwiększa liczby produktów. Dostawa jest automatyczna w 16 sklepach; tylko Sewera i Cezar potwierdzają ją dla kodu, pozostałe integracje jasno oznaczają zakres krajowy. Castorama i OBI nadal wymagają integracji rzeczywistej wyceny dostawy. Wyszukiwanie placówki jest etapem poprzedzającym integrację lokalnych stanów i cen.

Kolejne prace: potwierdzanie brakujących wariantów/EAN i fizycznych opakowań; lokalne ceny i dostępność; limity zapasu w optymalizatorze; częściowo posiadane materiały i ręczne pozycje; ocena zgodności zamienników. Nie deklarujemy ceny całego zestawu, gdy brakuje ceny materiału lub dostawy. Cel uzupełnienia całego katalogu pozostaje aktywny.
