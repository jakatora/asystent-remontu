# ALNAR — konkurencyjna oferta zestawu do paneli, 2026-11-02

W 195 dodaje drugi sklep dla istniejącego produktu Wolfcraft 6931000, GTIN 4006885693104. Jedna sztuka handlowa oznacza jeden kompletny zestaw 22 elementów, a nie 22 zestawy. Nie zmienia receptur, starych projektów ani migracji.

## Źródła i rzeczywiste koszyki

- ALNAR: https://alnar.pl/wolfcraft-zestaw-do-montazu-paneli-p-6949.html — natywne productID 6949, MPN WF 6931000, GTIN, marka, stan dostępności, cena brutto i formularz zakupu sztuki; autentyczne zdjęcie https://alnar.pl/images/6931000.jpg (HTTP 200, image/jpeg).
- Mensura: https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000 — drugi niezależny sklep tego samego GTIN/modelu, ponownie odczytany 2026-11-02.
- Producent: https://shop.wolfcraft.com/en-ua/products/p_6931_laminatelayingset ; katalog producenta https://www.wolfcraft.com/fileadmin/users/redakteur/Produktkataloge/Katalog_2025/Main-Catalogue_PRO_SAL_CAT_en_S_2025-03.pdf, tabela 6931000. Ten zagraniczny sklep producenta nie służy do wyceny transportu w Polsce.

Adapter, a nie tylko ręczny podgląd, wykonał 31 rzeczywistych HTTP dla odczytu i trzech anonimowych koszyków. 2026-11-02 05:30 UTC:

| Zestawy | Materiały | Kurier | Całość |
|---|---:|---:|---:|
| 1 | 49,00 zł | 21,99 zł | 70,99 zł |
| 2 | 98,00 zł | 21,99 zł | 119,99 zł |
| 7 | 343,00 zł | 0,00 zł | 343,00 zł |

Mensura 2026-11-02 05:32 UTC: ten sam jeden zestaw 64,90 zł + GLS 13,99 zł = 78,89 zł. Różnica 7,90 zł wynika z oferty innego sklepu; nie jest spadkiem ceny tego samego produktu w tym samym sklepie. Nie odnawiano dat ani nie dopisywano sztucznej poprzedniej ceny.

## Reguły i granice

ALNAR domyślnie wybiera punkt ORLEN. Integracja jawnie ustawia Polskę, kuriera po przedpłacie (14) i przelew bankowy (1), a następnie ponownie odczytuje koszyk. Potwierdza całe ilości, właściwy model/link, ceny wyraźnie oznaczone brutto (pomija niższe netto), sumę materiałów, wysyłki i należności oraz zgodność obu odpowiedzi AJAX z końcowym koszykiem.

Brak opłaty, odbiór osobisty, paczkomat/punkt, pobranie, dopłata płatnicza, kaucja, inna waluta, wariant, zmiana stanu lub ilości i niezgodna suma nie stają się darmowym kurierem. Zero wymaga rzeczywiście wybranego kuriera i potwierdzonej sumy powyżej przejrzanego progu 299 zł. Zmiana komunikatu progu jest nieznaną regułą wymagającą przeglądu.

To jawna taryfa krajowa PL. Sklep na tym etapie nie wycenia adresu według kodu; nie oznaczać jej jako osobistej wyceny kodu lub gwarancji obsługi każdego adresu. Wycenę przechowuje się z oryginalnym terminem ważności 10 minut. Publiczne tokeny pochodzą z tej samej świeżej anonimowej sesji; dozwolone jest tylko pięć ograniczonych akcji koszyka. Brak danych kontaktowych, finalizacji zamówienia lub płatności.

## Weryfikacja i publikacja — zakończona

Produkcja źródła aplikacji **0 cfe 630076 d 421506 fcdb 26 cd 820 bfdb 90 cb 58 c 9**. PR backendu [176](https://github.com/jakatora/przetargai/pull/176) scalony; head 0271 ae 62369892412 d 7 ef 5 c 0 cae 12999358 a 6 a 76, mergec 8852 bd 1793 f 1 cb 0 e 5 aef 0 c 547 bd 9 aa 725709 cdc. GitHub nie zwrócił statusów CI; opisane testy wykonano lokalnie i na prawdziwym publicznym API/UI.

- API 69100076-fdf 0-40 dd-8 e 36-19 eb 3 f 6 ec 44 f SUCCESS 2026-11-02 05:51:35.730 UTC. Publiczny snapshot wszystkich 150 plików jest identyczny z zatwierdzoną paczką. Bundel SHA 2564 d 39 efc 6977 da 829612 fa 941 b 69 c 8 f 6 b 8883719419 ac 4 a 97 c 2 e 5421456 d 9 e 7 f 0.
- WWW 16 a 3576 f-4 a 8 f-452 f-b 43 f-bb 564387 f 61 f SUCCESS 2026-11-02 05:53:10.742 UTC. Wszystkie 63 zasoby sprawdzone SHA 256, bez braków. Przejrzano 77 wartości vaulta:0 wycieków. Osiem z dziewięciu plików hostingu bez zmiany; zmienił się tylko wygenerowany delivery-relay.cjs z aktualnym katalogiem. Zakres prywatnego relay bez rozszerzenia.
- Zmieniono wyłącznie bundel remontu i seed w 150 plikach API;148 innych zachowane. Seed 364:363 poprzednie obserwacje zachowane dokładnie+1 rzeczywista obserwacja ALNAR.
- Czysta kopia:571 mobile/237 pricing/165 APIlib/190 adapters/1064 shared PASS,0 skip. Grupy częściowo się pokrywają. Typy API/mobile/pricing oraz 66 legacyjob IDs PASS.
- Osiem rzeczywistych lokalnych HTTP i osiem publicznych HTTP PASS: dwa warianty Optima, pełne trzy projekty, niepełny wybrany TopBoden, niepełny ALNAR oraz 1/2/7 zestawów. Żadne ceny/dostawy nie były wstrzyknięte do aplikacji.
-21 lokalnych i 21 publicznych scenariuszy UI PASS. Autentyczne zdjęcia katalogowe, rozwinięcie produktu ALNAR i rzeczywiste otwarcie dokładnej oferty, kopiowanie pełnego planu,320/390 px bez poziomego przepełnienia, eksport/import danych, ponowne wejście, edycja podkładu i reset potwierdzenia dopasowania, odrębne GTIN, realne odświeżenie, niepełne sklepy oraz powrót do porównania pełnego koszyka. Lokalny pełny przebieg 11 pricingPOST, publiczny 14; nie jest to pomiar liczby zapytań dla wszystkich użytkowników lub przypadków.

Publiczna odpowiedź tego samego porównania trzech projektów zawiera pełny najlepszy potwierdzony koszyk **1427,54 materiały+274,47 dostawy=1702,01 PLN** oraz alternatywę z Mensurą **1709,91 PLN**. Fizyczne produkty i liczby są identyczne; pozostałe sklepy mają dokładnie te same ceny i obiekty wycen. Oszczędność 7,90 PLN wynika z konkurencyjnej oferty zestawu. Nadal 3 sklepy/4 zamówienia (LiderzyCen wymaga 2),49,5 m²surowego podkładu→5 rolek 10 m². Jawne krajowe taryfy PL; nie dowiedziono globalnego minimum rynku.

Aktualny audyt katalogu:249 pozycji/217 potwierdzonych/325 ofert,32 dawne luki. Zero fałszywych potwierdzeń;4 stare tożsamości merchantSKU zachowane. Nie dodano nowego referencyjnego produktu: dodano konkurencyjny sklep dla istniejącego GTIN. W karcie UI pozostaje poprawne, zweryfikowane zdjęcie katalogowe tego samego zestawu z Mensury; dodatkowe zdjęcie źródłowe ALNAR zostało potwierdzone natywnie.

Historia ALNAR po publicznym odświeżeniu:3 rzeczywiste punkty po 49,00 PLN, delta 0. Początkowo poprzednia cena i delta były null. Brak fikcyjnej promocji/obniżki. Cache przed 361 obserwacji/12555 punktów, po 362/12869. Zachowane 12550 poprzednich punktów,5 prawidłowo usunięte przez istniejącą retencję 60/ofertę; dokładnie odtworzono zachowanie produkcyjnej klasy RetailPriceHistory. Final-proof o 05:54:37.888 UTC sprawdził 170 wystąpień wycen ważnych w tej chwili; dat nie zmieniano i nie jest to przedłużenie ich ważności w przyszłości.

## Wnioski z odbioru

Pierwszy import ESM ujawnił cykl zależności; metadane wydzielono do czystego alnar-source.ts, powtórzony adapter przeszedł wszystkie 3 natywne koszyki. W fixture i parserze koszyka rozróżniono jawne Brutto/Netto; niższe netto nie może wygrać.

Wcześniejsze próby QA r 1–r 7 zachowano. Poprawiono selektory, uwzględniono istniejące pierwszeństwo zdjęcia katalogowego i natywne Linking.openURL. Lokalny przechwytujący CORS runner czyta autentyczną APIResponse przed przekazaniem tej samej odpowiedzi do przeglądarki; zapobiega to utracie odczytu body przez CDP po nawigacji. R 8 lokalnie i r 1 publicznie mają 0 błędów. Produkcja nie ma przechwytywania lub podmieniania odpowiedzi. Dotychczasowy API missingProductCount liczy linie etapów (ALNAR 5), a UI grupuje identyczne brakujące produkty; nie zmieniono tego kontraktu.

Własny serwer PID 28536/session 58182 zamknięty exit 0.313 merchantHTTP to łączna liczba wszystkich lokalnych prób, w tym poprawek runnera, nie pojedynczego użytkownika. Browser contexts zamknięte. Localhost 8082, projekty użytkownika i obce WIP nietknięte. Nie zmieniono zależności, migracji lub dotychczasowych ID. Cel ciągły pozostaje aktywny.

Dalszy kierunek: domykać rzeczywiste braki malowania, paneli i hydroizolacji oraz ich wariantów, zgodny pełny system Atlas, stabilne dane i dostawy Castorama/OBI, wydajność i pilotaż klientów. Afiliacja i Pro z rekomendacji biznesowej pozostają hipotezami do walidacji.

Dowody lokalne: G:/Projekty/asystent-remontu-work/wave 195-20261102. Surowe sesje są poza repo; fixture zawiera wybrane autentyczne fragmenty, bez cookies, danych klienta i analytics, ze zmienionymi tokenami.
