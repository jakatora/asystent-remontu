# Przygotowanie frontów i wspólna dostawa z farbą

29 października 2026, wave85. Dodano osobny wybór benzyny ekstrakcyjnej Chem-Rozlew 500 ml i zdjęcie rzeczywistego produktu. Dla sprawdzonego zestawu do 10 m² frontów pozwala obniżyć koszt brutto z dostawą z 328,63 zł do 220,54 zł. To porównanie dwóch jawnie wybranych środków, nie historyczna obniżka ceny tego samego EAN. Dalsze produkty i całe zestawy pozostają w rozwoju.

## Tożsamość, źródła i zastosowanie

[Produkt w Rab-Dom](https://www.rabdom.pl/pl/p/Chem-Rozlew-Benzyna-ekstrakcyjna-rozcienczalnik-0%2C5L/316): EAN **5906681230253**, native ID **316**, SKU **0175**, jedna płynna butelka 500 ml, cena brutto **8,90 zł**, fotografia z tej samej karty. Nie jest to aerozol 500 ml EAN 5906681231083 ani opakowanie 5 l EAN 5906681230260. Cena z publicznego API potwierdza kwotę brutto i całkowitą natywną jednostkę sztuki; obserwacja 2026-10-29T04:26:30.203Z. Sklepowy koszyk potwierdził zakup jednostkowy i transport.

[Producent Chem-Rozlew](https://www.chem-rozlew.com/benzyna-ekstrakcyjna/) wskazuje czyszczenie i odtłuszczanie powierzchni przed malowaniem. [FAQ V33](https://www.v33.pl/faq/) zaleca detergent bez nabłyszczaczy/tłustej warstwy, odtłuszczenie między innymi benzyną ekstrakcyjną i końcowe płukanie czystą wodą. Obowiązują również instrukcje [V33 Easy Renowacja Kuchnia](https://www.v33.pl/v33-product/easy-renowacja-kuchnia/). Benzyna służy do przygotowania powierzchni, nie do rozcieńczania tej farby. Należy przestrzegać etykiet i wentylacji.

Użytkownik jawnie potwierdza posiadanie odpowiedniego detergentu i wybiera środek do odtłuszczania. Dotychczasowe wartości cabinetPreparation 0/1/2 zachowują znaczenie; nowa wartość 3 wybiera Chem-Rozlew. Anser ma nadal własny EAN, ofertę i koszt wysyłki. Liczbę butelek podaje użytkownik (1–100); aplikacja nie wymyśla zużycia benzyny z powierzchni frontów. Zmiana marki unieważnia stare Mam/Kupione wyłącznie dla zmienionej pozycji. Stare lub podmienione tożsamości nie ukrywają brakującego materiału.

## Faktyczne ceny pełnych koszyków

Wariant podstawowy: stabilna powłoka na wskazanym drewnie/melaminie, 10 m² wszystkich malowanych stron, dwie warstwy, 12 m²/l na warstwę, 10% zapasu, cztery arkusze P240 i jedna butelka 500 ml. Odpowiedni detergent jest już posiadany. Narzędzia i robocizna są poza porównaniem materiałów.

| Zamówienie | Materiały brutto | Dostawa | Razem |
|---|---:|---:|---:|
| Rab-Dom: V33 2 l + Chem-Rozlew 500 ml | 184,18 zł | 10,50 zł | 194,68 zł |
| Sewera: cztery arkusze P240 | 5,96 zł | 19,90 zł | 25,86 zł |
| **Cały zestaw** | **190,14 zł** | **30,40 zł** | **220,54 zł** |

Wariant z wcześniej dostępnym Anserem ma 193,13 zł materiałów i 135,50 zł transportu, razem **328,63 zł**. Faktyczny koszyk Sewery dla Ansera i papieru wycenia dostawę na 125 zł; nie zastępujemy jej hipotetyczną tanią paczką. Nowy wybór oszczędza **108,09 zł**, głównie dzięki wspólnej dostawie środka i farby. To wynik sprawdzonych koszyków, nie obietnica najniższej ceny w całym rynku.

| Inny scenariusz Chem-Rozlew | Razem z dostawą |
|---|---:|
| 6 m², dwie puszki 0,75 l, cztery P240, jedna butelka | 216,08 zł |
| 15 m², puszki 2 l + 0,75 l, cztery P240, jedna butelka | 305,95 zł |
| 10 m², jedna puszka 2 l, cztery P240, dwie butelki | 229,44 zł |
| 20 m², dwie puszki 2 l, cztery P240, dwie butelki | 412,21 zł |
| Dwie prace po 5 m²: wspólna puszka 2 l, osiem P240, dwie butelki | 235,40 zł |
| Laminat 10 m²: farba i jedna butelka, bez zbędnego papieru | 194,68 zł |
| Zestaw podstawowy + dwa czujniki Virone DC-11 | 391,14 zł |

W większym koszyku Rab-Dom wysyłka rośnie z 10,50 zł do 17,99 zł. To bieżąca taryfa krajowa PL sprawdzona w rzeczywistym całym koszyku; Sewera zwraca wycenę dla podanego kodu. Sprawdzono 00-001 i 42-209, a także preferencję jednego zamówienia w sklepie. Nie składano zamówień ani nie podawano danych klienta.

## Weryfikacja i ograniczenia

Osiem anonimowych koszyków sklepów oraz 20 rzeczywistych scenariuszy SDK z serwerem produkcyjnym: 14 kompletnych zestawów z dostawą. Nieznane przygotowanie, błędna liczba butelek, brak kodu, niepotwierdzony odbiór i sklep bez całego zestawu nie dają fikcyjnej pełnej ceny. Własne testy tożsamości odrzucają 5 l, aerozol, zmianę SKU/nazwy/jednostki, cenę netto udającą brutto i brak zapasu. Ułamkowe ciągi NUMERIC z bazy (750.0000/2000.0000) zachowują narzucony rozmiar puszki i wspólne wykorzystanie zawartości.

**833 testy aplikacji/usługi i 1054 wspólnego backendu: PASS, zero błędów i pominięć.** Typecheck aplikacji i API, cztery źródła HTTP 200 oraz 66 stabilnych ID: PASS. Aktualny katalog: 179 referencji i zdjęć, 172 produkty z ofertą, 221 aktywnych ofert, 227 zarejestrowanych źródeł; 49 kanałów aktywnych. Siedem starszych dokładnych SKU nadal wymaga oferty. Te liczby nie oznaczają pokrycia wszystkich prac: te same 65 historycznych map ma 81/252 wycenionych wymagań i 171 nieuzgodnionych wymagań, które nie są liczbą unikalnych produktów.

Backend: [PR85](https://github.com/jakatora/przetargai/pull/85), Railway bb6dbe1e-26f8-4583-8b79-60dd1b3e6c2f SUCCESS. Wszystkie 148 plików zgadzają się ze sprawdzoną paczką; zachowano 226 wcześniejszych obserwacji i 146 pozostałych plików. Ograniczenia wyszukiwania kandydatów pozostają jawne; odbiór lokalny wymaga potwierdzenia ceny i stanu placówki.

## Sprawdzenie interfejsu

Własny projekt kontrolny proj_mvszta5sohgk4mlgj zmieniono w edytorze na 10 m² stabilnej powłoki, automatyczny dobór puszek, cztery P240 i jedną butelkę Chem-Rozlew. Aplikacja pokazała 220,54 zł (190,14 zł materiały i 30,40 zł dostawy). Rozwinięcie dwóch sklepów pokazało trzy prawidłowe zdjęcia oraz ilości: 1 × 2000 ml, 1 × 500 ml i 4 × 1 arkusz. Zmiana wyłącznie marki na Anser pokazała 328,63 zł, z faktyczną wysyłką Sewery 125 zł. Przywrócono Chem-Rozlew, a przeładowanie strony potwierdziło zapis i 220,54 zł.

Wspólny koszyk tego projektu i dwóch czujników Virone DC-11 pokazał 391,14 zł: 336,14 zł materiały i 55,00 zł dostawy, z rozpisaniem trzech sklepów. Następnie przywrócono wcześniejsze trzy własne projekty QA; fronty i CO są odznaczone. Tymczasową kartę koszyka zamknięto. Nie zmieniano innych projektów. Test wykonano w Expo Web na localhost:8082; nie na fizycznym Androidzie/iOS. Zrzuty: work/catalog-wave85-total.jpg i work/catalog-wave85-products.jpg.
