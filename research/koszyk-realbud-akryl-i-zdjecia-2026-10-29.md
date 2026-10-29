# Koszyk Realbud, wybór prac i zdjęcia — 2026-10-29

## Problem użytkownika

Wspólny koszyk miał zbyt wiele ręcznych kliknięć przy wyborze prac. Jeden z produktów wykończeniowych nie miał zweryfikowanej oferty z dostawą. Cztery fotografie były zależne od jednego niedostępnego serwera sklepu.

## Wdrożone rozwiązanie

- W koszyku remontu dodano wybór wszystkich prac z zapisanymi obmiarami jednym przyciskiem oraz wyczyszczenie wyboru. Zachowano limit 20 prac zgodny z walidacją backendu i wyjaśniono go przy większej liczbie projektów.
- Dodano akryl Soudal do płyt G-K 280 ml, EAN `5411183157248`, z fotografią i ofertą Realbud. Cena brutto z natywnego API 2026-10-29: 15,01 zł, produkt dostępny. Natywny anonimowy koszyk 2026-10-29 zwrócił kuriera 25,00 zł dla testowego kodu `00-001`. Przy tym produkcie i akrylu uniwersalnym Soudal w jednym koszyku produkty kosztowały 31,00 zł, a kurier nadal 25,00 zł, razem 56,00 zł. Sklep podaje ten koszt jako dostawę na obszar Polski; wycena jest ponawiana dla rzeczywistego koszyka użytkownika.
- Cztery zdjęcia zastąpiono działającymi źródłami dla dokładnie tych samych EAN: Metylan 500 ml z HIPPER, wkręty i kołki Koelner z E-Kowalczyk, mocowanie umywalki z katalogu producenta Fischer.

## Dowody i kontrola

- [Akryl Realbud](https://realbud.com/pl/p/Akryl-SOUDAL-bialy-280-ml-do-plyt-GK/419576), [Metylan HIPPER](https://hipper.pl/metylan-plyn-do-usuwania-tapet-0-5-l-956213124), [wkręty Koelner](https://sklep-kowalczyk.pl/koelner-wkret-samowiercacy-fosfatowy-tex-3-5x9-5mm-1000-szt-ws-3595.html), [kołki Koelner](https://sklep-kowalczyk.pl/rawlplug-koelner-kolek-szybkiego-montazu-6x40-z-kolnierzem-200szt-op-fx-06k040.html), [mocowanie Fischer](https://www.fischer-si.si/sl-si/products/sanitary-fixings/ceramic-wash-basins-urinals-and-sanitary-installations/wash-basin-fixing-wst/45494-wst-10-x-140-k-nv).
- Kontrola fotografii: 190/190 adresów zwróciło obraz.
- Testy: 367/367 mobile, 149/149 silnik cen, 1054/1054 wspólny backend; typowanie mobile i API bez błędów.
- Migawka backendu zawierała 148 plików. Zmieniono wyłącznie dane ofert i wygenerowany moduł cennika; 146 pozostałych plików zachowano bez zmian.

## Kandydaci odrzuceni z porównania z dostawą

- Stary adres kleju Soudal 26A w Lobo przekierował na kategorię, więc nie potwierdza już dostępnego SKU.
- ABUD potwierdził cenę i EAN tego kleju na chwilę przed awarią, ale sklep przestał odpowiadać przy próbie wyceny koszyka. Nie dodano oferty z dostawą.
- Folia Praxa 100 m² w Sewerze ma potwierdzone EAN, cenę i zdjęcie, lecz anonimowy koszyk nie zwrócił dostępnej dostawy domowej. Nie dodano jej jako oferty dostarczanej.

## Kolejny krok celu

Uzupełnić brakujące aktywne oferty dla dokładnych modeli historycznych, pozyskać potwierdzone koszty dostaw dla kolejnych sklepów i zwiększyć liczbę prac w jednym koszyku po kontroli wydajności backendu. Pojedynczy wynik porównania oznacza najtańszy koszyk wśród ofert, które przeszły weryfikację, a nie gwarancję najniższej ceny we wszystkich sklepach w Polsce.
