# SWS Inside: aktualna oferta, dostawa dla kodu i odbiór w Częstochowie

Wave66, 2026-10-28. Cel całej aplikacji nadal otwarty. Przywrócono ofertę istniejącego produktu, bez dopisywania nowego SKU do statystyki katalogu.

## Co otrzymuje użytkownik

Dokładna taśma Soudal SWS Basic Plus Inside 90 mm × 30 m, EAN `5411183151178`, jest ponownie dostępna w porównaniu. Nowe źródło to [Izosystems, produkt 1783, indeks 135633](https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html). Stary sklep BestBudowa zachowano jako źródło; bieżący odczyt zgłasza tam brak towaru.

Cena pełnej rolki wynosiła podczas weryfikacji 145 zł brutto. Dane natywne potwierdziły zapas 94 rolek. Nie używamy ceny netto 117,886179 zł ani błędnie prezentowanego wewnętrznego pola `unit_price` jako ceny całej rolki. Zakup zawsze dotyczy całej sztuki zawierającej 30 m. Wspólny koszyk zaokrągla łączne zapotrzebowanie, np. 12 m + 14 m daje jedną rolkę.

Zdjęcie zmieniono na pierwotne zdjęcie wybranego wariantu 90 mm, identyfikator obrazu 10544. Karta zawiera także starsze fotografie 70 mm × 25 m; czytnik nie może ich wybrać. HEAD nowego zdjęcia potwierdził HTTP 200, `image/jpeg`. W repo pozostaje URL, bez pliku graficznego.

## Potwierdzona dostawa, bez pozornej darmowej wysyłki

Początkowy anonimowy koszyk pokazuje 0 zł i „Za darmo!” przed wyborem miejsca i przewoźnika. Ta informacja nie jest używana do wyceny dostawy.

Obsługa sklepu korzysta z funkcji natywnego formularza: odczytuje kraj Polska, pyta przewoźników o podany kod, wybiera sprawdzoną usługę domową DHL/GLS, a następnie porównuje koszt z odświeżonym koszykiem i sumą brutto. Osobno potwierdza brak dopłaty za przelew bankowy. Wybór Paczkomatu, odbioru osobistego, płatności przy odbiorze lub nieznanego transportu nie może zastąpić dostawy domowej.

[Oficjalne warunki dostaw](https://izosystems.pl/pl/content/1-owd-ogolne-warunki-dostaw) opisują różne taryfy dla małych paczek, długich przedmiotów i spedycji. Nie przypisujemy stawki za taśmę całemu asortymentowi ani nie przeliczamy ceny z samego tekstu „od”. Kod i cały koszyk trafiają do rzeczywistej wyceny sklepu.

| Potwierdzony przypadek | Kod QA | Materiały | Dostawa | Razem |
|---|---|---:|---:|---:|
| 1 rolka | 00-001 | 145,00 zł | 15,00 zł | 160,00 zł |
| 2 rolki | 42-209 | 290,00 zł | 15,00 zł | 305,00 zł |
| 3 rolki | 00-001 | 435,00 zł | 0,00 zł | 435,00 zł |

Próg darmowej dostawy sprawdzono w rzeczywistym koszyku trzech rolek. Nie ekstrapolowano go na inne towary ani nie ogłoszono wszystkich sklepów jako porównanych.

Nie przesyłano danych klienta, imienia, kontaktu, ulicy, numeru domu ani zgód. Kod QA jest daną syntetyczną. Nie tworzono zamówienia, nie akceptowano regulaminów, nie wykonywano płatności. Sesje sklepu są niezależne od przeglądarki użytkownika. Endpoint modułu potrafi także składać zamówienia, więc klient dopuszcza wyłącznie wskazane operacje koszyka, kodu, przewoźnika i odczytu opcji płatności; odrzuca dowolną metodę lub dodatkowe pola.

Sklep zwraca pusty HTML dla łącznego nagłówka `Accept: text/html, application/json`. Dla tego jednego originu żądanie jawnie prosi o HTML oraz język polski. Identyfikacja agenta pozostaje `AsystentRemontu/1.0`; nie zmieniano jej w celu obchodzenia ochrony. Zapytania pozostają ograniczone limitem wywołań, rozmiarem odpowiedzi, czasem i wspólną kolejką.

## Wybór sklepu i odbiór

Nowy sklep pojawia się w wyborze sprzedawcy. Wybór WinBud dla testowego zakupu tej taśmy pokazuje brak oferty, zamiast użycia kwoty innego sklepu. Brak kodu blokuje końcową wycenę dostawy, a zapotrzebowanie ponad rzeczywisty zapas nie daje pełnej sumy.

W katalogu punktów odbioru dodano opublikowany adres: Izosystems, ul. Morsztyna 10, 42-209 Częstochowa, tel. +48 34 307 07 77. Źródło to powyższe oficjalne warunki dostaw. Godziny z tego źródła: pn–śr 8:00–16:00, czw. do 15:00, pt. do 14:00. To punkt odbioru wymagający potwierdzenia gotowości. Nie podano niezweryfikowanych współrzędnych, odległości, ceny lokalnej ani zapasu konkretnego oddziału. Oferta internetowa nie została oznaczona jako potwierdzona oferta odbioru.

## Weryfikacja i wydanie

- 689 testów kalkulatora, kolektora, API i wycen: PASS, 0 pominięć.
- 1054 testy wspólnego backendu: PASS, 0 pominięć.
- Kontrola typów mobile i API: PASS.
- Zachowanie 66 ID legacy i trzy próby negatywne: PASS.
- Walidatory źródeł obu nowych modułów: PASS, 0 ostrzeżeń.
- 3 świeże anonimowe koszyki sklepu, 28 zarejestrowanych odpowiedzi. Fixture zawiera wybrane pierwotne dane i SHA oryginalnych odpowiedzi. Cel przekierowania checkout jest jawnie oznaczony jako potwierdzony przez kolejne żądanie klienta; anonimowe tokeny w fixture zastąpiono stałymi testowymi.
- 9 przypadków przez lokalne oraz produkcyjne HTTP: PASS. Obejmują wspólną rolkę, próg darmowej dostawy, drugi kod, wybrany sklep, inny sklep bez oferty, niepotwierdzony odbiór, brak kodu i przekroczenie zapasu.
- Testy odrzucają zmianę EAN, wariantu, opakowania, warunkowej ceny, ilości koszyka, ceny brutto, przewoźnika, końcowej sumy i opłaty za przelew. Sprawdzono również prawidłowy zakup ostatniej rolki.

Starsze testy HTTP INDO i akcesoriów wykonywały odczyt historycznych obserwacji przy bieżącej dacie. Po upływie 24 godzin poprawnie zadziałało produkcyjne wygaszanie, lecz replay testów stał się zależny od kalendarza. Testy odtwarzają teraz czas przechwycenia fixture. Produkcyjnych dat, zasad wygasania i zapisanych obserwacji nie zmieniano.

Backend: [PR #67](https://github.com/jakatora/przetargai/pull/67), squash `4297c6daf2341fba58e2299d488f7597cf8e166b`. Wydanie zmienia wyłącznie pakiet serwisu remontu i dane: zachowano 146 innych plików oraz wszystkie 209 dotychczasowych obserwacji, dopisano jedną. Snapshot bazowy SHA256 `05b8bf507ff191ddff4d44bdd58ad4879154b9775f6652c05cd533a576132b9b`.

Railway `b9adcda4-9e9d-478f-8cf5-0f996f4707f9`: SUCCESS. Sprawdzenie SHA wszystkich 148 plików produkcji 2026-10-28T16:30:33.823Z potwierdziło zgodność z ocenionym wydaniem. Końcowy pakiet źródłowy SHA256 `436831b1a4f3033be9c9c4383d6bae67be7f9b9517ca6dafd81e0ad559bfe9da`. Brak workflow uruchomionych dla PR nie jest wynikiem zielonego CI.

Sterowanie lokalną przeglądarką nadal jest wyłączone w ustawieniach Work. Nie restartowano Expo na 8082 i nie zmieniano projektów użytkownika. Weryfikacja gotowego widoku, zdjęcia w interfejsie i karty odbioru pozostaje do wykonania. Nie oznaczamy jej jako zaliczonej.

## Stan i dalsze prace

Świeży audyt produkcji: 166 referencji, 132 z aktywną ofertą, 177 aktywnych ofert, 210 źródeł, 51 zarejestrowanych i 46 aktywnych sklepów. Aktualnie 34 braki: 28 wymaga ponownego potwierdzenia oferty, 6 znalezienia zweryfikowanej oferty. Wszystkie 166 referencji mają przypisane zdjęcia; rekordów zdjęć jest 167 ze starszym duplikatem.

Te same 65 starych map obmiarów: 73/247 wycenionych wierszy, 174 niepełne, 8 pełnych scenariuszy materiałowych. Nie uzupełniano za użytkownika nowych parametrów. Przywrócenie pojedynczej oferty nie uzupełnia automatycznie receptury montażu okna. Wiersze scenariuszy powtarzają produkty i nakładają się na braki katalogu; nie należy sumować 174 i 34 ani nazywać ich liczbą unikalnych SKU.

Przy przeglądzie stwierdzono, że historyczna opcjonalna „taśma rozprężna Pro Clima lub podobna” w zadaniu uszczelnienia okna nie opisuje membrany SWS Inside. Nie zamieniono jej po cichu na tańszy produkt. Kolejna praca powinna rozdzielić wybór uszczelki skrzydła, naprawy pianki oraz wewnętrznej membrany, z właściwym obmiarem i potwierdzeniem systemu. Pozostałe priorytety: brakujące aktualne oferty, pełne receptury materiałów, ceny i zapas faktycznych pobliskich oddziałów oraz kontrola UI po włączeniu przeglądarki.
