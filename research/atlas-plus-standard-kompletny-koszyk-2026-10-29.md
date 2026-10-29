# ATLAS PLUS: kompletny koszyk podłogi z dostawami

29 października 2026, wave80. Rozwój całego katalogu nadal trwa. Zamknięto wcześniejszą lukę dostawy kleju dla jawnie wybranego zestawu podłogi.

## Produkt i ilość

Dodano [ATLAS PLUS Podwójna Moc 25 kg w Sewerze](https://sklep.sewera.pl/atlas-plus-podwojna-moc-klej-do-plytek-25kg-p8893): kod producenta PL-NN-F-25, EAN **5905400488579**, cena **63,97 zł brutto za cały worek**, rzeczywiste zdjęcie produktu. Cena netto 52,01 zł nie jest ceną do porównania koszyka.

To odrębny kod od promocyjnego opakowania Castoramy 5905400658866. Oferty i historie cen pozostają osobne. Aplikacja umożliwia świadomy wybór opakowania ATLAS PLUS na podłogę; nie podmienia Ceresitu ani białego kleju kuchennego. Wybór zachowuje kilogramy, stabilne identyfikatory materiałów i obmiary, a API dobiera całe worki.

[Producent ATLAS](https://www.atlas.com.pl/produkt/atlas-plus/) opisuje klej C2TE S1, warstwę 2–10 mm i zużycie na równym podłożu. Dla 60×60 cm na posadzce tabela podaje 4,3 kg/m² przy pacy 12 mm. Nierówności i metoda kombinowana zwiększają zużycie. Dla wybranego Ennis 59,8×59,8 cm, podłogi 10 m² i przyjętego zapasu aplikacja zachowuje 47,3 kg, czyli dwa worki 25 kg. To założenie kosztorysowe do sprawdzenia z warunkami układania, a nie pomiar nierówności podłoża. Klej nie zastępuje wymaganej hydroizolacji.

## Pełny zestaw dla kodu 00-001

Przykład obejmuje pięć materiałów: płytki Ennis Light Beige, ATLAS PLUS standardowy, fugę Atlas 001, krzyżyki 3 mm i Ceresit CT 17. Zużycie kleju, fugi oraz krzyżyków wynika z wybranego formatu; surowe m² są łączone przed zakupem paczek.

| Sposób zakupu | Materiały brutto | Dostawy | Razem |
|---|---:|---:|---:|
| Jedno zamówienie w każdym sklepie | 1232,93 zł | 445,99 zł | **1678,92 zł** |
| Najtańszy potwierdzony podział | 1232,93 zł | 342,69 zł | **1575,62 zł** |

Potwierdzony tańszy plan:

- Modna Łazienka: dziewięć paczek płytek, 965,63 zł materiałów + 229 zł palety = 1194,63 zł.
- Rab-Dom: grunt 109 zł + dostawa 17,99 zł = 126,99 zł.
- Sewera: materiały 158,30 zł + trzy rzeczywiste dostawy 95,70 zł = 254 zł. Dwa osobne worki mają po 37,90 zł dostawy, a fuga z krzyżykami 19,90 zł.

Jedna wspólna przesyłka Sewery dla worków, fugi i krzyżyków kosztuje 199 zł. Podział oszczędza **103,30 zł** i jest wyraźnie pokazany jako trzy osobne zamówienia. Użytkownik może wybrać wygodniejszy wariant jednego zamówienia na sklep.

Kwoty pochodzą z rzeczywistych anonimowych koszyków. Dwa worki bez dodatków mają wycenę 159 zł, a z dodatkami przekraczają próg 50 kg. Nie wyprowadzamy taryfy wyłącznie z masy: dodatkowa próba jednego worka z fugą i krzyżykami kosztowała 125 zł, worek z fugą również 125 zł, a worek z krzyżykami 37,90 zł. Te połączenia nie obniżyły wybranego kosztu. Mechanizm nadal oznacza ograniczony zakres wyszukiwania i nie udaje porównania wszystkich sklepów w Polsce.

Sklep Realbud ma niepotwierdzoną dostawę jednego z wariantów gruntu. Jest to widoczne; nie blokuje rzeczywistego kompletnego koszyka korzystającego z Rab-Dom. Nie wpisujemy nieznanej dostawy jako zero.

## Projekt, wspólny koszyk i wybór sklepu

Wybrany klej zapisuje się osobno dla projektu. Wspólny koszyk odczytuje wybory każdego projektu i umożliwia własny wybór bez nadpisywania projektów. Klej jest zmieniany przed uwzględnianiem materiałów posiadanych: oznaczenie starego opakowania jako „Mam” nie usuwa nowego produktu. Uszkodzony zapis wstrzymuje wycenę zamiast podstawiać inny produkt.

Natywnie sprawdzono:

- Zmianę opakowania, zdjęcie, 1575,62 zł z wymaganymi trzema zamówieniami oraz przełączenie na 1678,92 zł przy jednym zamówieniu na sklep.
- Wybranie Sewery: oferta dla 3 z 5 produktów, materiały 158,30 zł i 199 zł dostawy tej części, razem 357,30 zł. Pozostałe dwa produkty pozostają jawnie poza kwotą. Lista punktów odbioru pokazuje adresy i zastrzega sprawdzenie lokalnej ceny, zapasu i godzin.
- Wspólny koszyk własnych projektów QA „Ennis 10 m²” i „podkład 10 m², folia 12 m², taśma 7 m”: zapisany standardowy klej odczytany bez ponownego wyboru; pełna wycena **1890,06 zł**. Po próbie przywrócono wcześniejsze trzy projekty QA w wyborze wspólnego koszyka.

## Weryfikacja techniczna

- **792 testy** kalkulatorów, koszyka i API oraz **1054 testy** wspólnego backendu: zero błędów i pominięć. Kontrole TypeScript mobile/API i ochrona legacy IDs zakończone poprawnie.
- **10 rzeczywistych prób produkcyjnego HTTP**, pięć kompletnych zestawów: pojedynczy i łączony zakup, dwa pomieszczenia, drugi kod, dwa kolory. Sprawdzono również stare opakowanie, spoinę 1 mm, wybrany sklep, brak kodu i dwa różne opakowania w dwóch projektach. Brakujące pozycje nie stają się pełną wyceną. Ilości worków w osobnych zamówieniach sumują się do rzeczywistego zapotrzebowania.
- Kwoty są całkowitymi groszami. Dokładne EAN, paczki, ceny brutto i koszyki pozostają oddzielone; rozliczenie ceny płytek za m² jest nadal jawnie uwzględnione w materiałach.
- Weryfikator URL: nowa Sewera i producent ATLAS HTTP 200. Istniejący odnośnik Castoramy zwrócił HTTP 503; automatyczna wycena dostawy tego opakowania pozostaje niedostępna. Nie zaliczono tego sprawdzenia jako poprawnego odczytu Castoramy.
- Nie składano zamówień, nie akceptowano umów, nie przekazywano danych klienta ani płatności.

Backend: [PR 81](https://github.com/jakatora/przetargai/pull/81), merge `99c2d71f2ecc980b76dec855ac8517cd1d79f579`. Railway `2be516c1-4344-4bd3-b3e4-428733bdd5c5` SUCCESS, wszystkie 148 plików zgodne z przygotowanym wydaniem. Zachowano 221 wcześniejszych obserwacji i 146 pozostałych plików, dodano jedną obserwację.

Katalog: **175 pozycji ze zdjęciami, 168 z aktywnymi ofertami, 216 ofert, 222 źródła, 49 aktywnych kanałów sklepów**. Siedem historycznych modeli nadal bez oferty. Te same 65 historycznych map obmiaru pozostają przy 81/251 wycenionych wymaganiach; 170 braków nie jest liczbą odrębnych produktów. Nowe kompletne zestawy wymagają jawnego wyboru i są sprawdzone osobno.
