# Okna: właściwa naprawa i wspólny koszyk — 2026-10-28

Model `window-repair-v1` zastępuje mieszany zestaw materiałów w istniejącej pracy `window-sealing`. Zachowano ID pracy, pole `perimeter` i cztery dotychczasowe ID materiałów. Nie dodano nowych produktów, ofert ani sklepów w tej iteracji. Korzystamy z wcześniej zweryfikowanych produktów i zdjęć.

## Problem użytkownika i zachowanie aplikacji

Wcześniej jeden obwód okna powodował jednoczesne obliczanie nieokreślonej uszczelki do rowka, pianki, akrylu oraz opcjonalnej taśmy opisanej jako rozprężna i paroprzepuszczalna. Nie potwierdzało to przyczyny nieszczelności ani dopasowania materiałów. Taśma SWS Inside jest innym produktem.

Użytkownik wybiera teraz jeden zakres: uszczelkę skrzydła, drobną wewnętrzną spoinę akrylową albo wewnętrzną warstwę złącza z taśmy SWS. Kreator, podsumowanie i edytor pokazują pola dotyczące wybranego zakresu. Przy zapisie parser pomija ukryte wartości pozostałych wariantów. Brak dopasowania, wymiarów lub przygotowania pozostaje widocznym brakiem wyceny.

Uszczelka skrzydła wymaga indywidualnego profilu okna. Nie podmieniamy jej na przypadkową uniwersalną uszczelkę. Zakup pozostaje do doboru; użytkownik może potwierdzić posiadanie prawidłowego profilu w całej zmierzonej długości. To nie jest nowa oferta sprzedaży uszczelki.

## Źródła i granice zastosowania

- [Soudal Akryl uniwersalny, karta 2025](https://www.soudal.pl/sites/default/files/soudal_api/document/900003230/TDS_AKRYL_UNIWERSALNY_2025.pdf): biały kartusz 280 ml, spoiny wewnętrzne przy drewnie/metalu i odpowiednich podłożach, ruch do 7,5%, przekrój co najmniej 5 × 5 mm, zalecenie 1:1. Powyżej 20 mm szerokości potrzebna konsultacja. [Strona produktu](https://www.soudal.pl/diy/produkty/masy-uszczelniajace/akryle/akryl-uniwersalny-0) podaje 15% — do kalkulatora przyjęto ograniczenie z karty. Nie deklarujemy tego wariantu dla dowolnego PVC, szkła, kamienia ani stałego kontaktu z wodą.
- [Soudal SWS Extra / Basic Plus Inside, karta 2025](https://www.soudal.pl/sites/default/files/soudal_api/document/SWS_EXTRA_INSIDE_2025.pdf): wewnętrzna membrana paroszczelna 90 mm × 30 m, indeks 135633; minimum 3 cm na łączenie końców. Podłoże i luz trzeba sprawdzić. Nie zastępuje izolacji ani ochrony zewnętrznej złącza.
- [Profesjonalny katalog Soudal](https://media.soudal.pl/katalogi/Katalog_Prof_Soudal.pdf): zimowy Soudafoam Low Expansion, pistoletowy, 750 ml, indeks 112583, EAN 5411183048522. Ilość puszek jest osobnym, potwierdzonym zapotrzebowaniem. Usunięto niesprawdzony przelicznik „1 puszka na 8 m”.
- [tesa — różne rodzaje uszczelek do okien](https://www.tesa.com/pl-pl/konsument/uszczelki/uszczelki-do-okien) potwierdza potrzebę doboru do szczeliny. Samoprzylepne profile nie są automatycznym zamiennikiem fabrycznej uszczelki rowkowej.

Dokładne oferty i zdjęcia: [akryl Sewera](https://sklep.sewera.pl/soudal-akryl-bialy-280ml-p10680), [akryl Rab-Dom](https://www.rabdom.pl/pl/p/SOUDAL-Akryl-uniwersalny-280ml-Bialy/460), [SWS Izosystems](https://izosystems.pl/tasmy-wewnetrzne-do-cieplego-montazu-okien/1783-Tasma-paroszczelna-do-cieplego-montazu-okien-soudal-sws-basic-plus-inside-90mm-x-30m.html), [pianka Folnet](https://folnet.pl/pl/products/chemia-tasmy-mocowania/chemia-budowlana-soudal/pianki-pistoletowe/pianka-pistoletowa-soudafoam-low-expansion-10-8372.html), [taśma Blue Dolphin Sewera](https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966). Dowody dotychczasowych integracji są w raportach katalogu, Folnetu i Izosystems.

## Ilości i bezpieczeństwo wyceny

Akryl: długość w metrach × kwadrat wymiaru spoiny w milimetrach = ml, następnie jawny zapas, domyślnie 10%. Ten wariant obsługuje kwadratowe spoiny 5–20 mm. Inna geometria wymaga osobnego doboru. Dodatkowo jawna liczba rolek taśmy maskującej 50 m; początkowe założenie to jedna rolka, a wpisane 0 oznacza posiadanie całej potrzebnej ilości.

SWS: `(długość + liczba połączeń × 0,03 m + zmierzony naddatek na narożniki i luz) × (1 + zapas/100)`. Dopasowanie szerokości 90 mm potwierdza użytkownik po sprawdzeniu złącza. Puszki pianki liczymy oddzielnie w ml; 0 jest świadomą deklaracją sprawnej izolacji lub posiadania całej potrzebnej ilości.

Pozostałe przygotowanie jest osobną pozycją do ustalenia, dopóki użytkownik nie potwierdzi przygotowanego podłoża i posiadania kompletu potrzebnych materiałów pomocniczych, np. właściwego podparcia spoiny lub materiałów do gruntowania. Nie wyceniamy w ten sposób całego montażu okna ani narzędzi. Nie obiecujemy jednego czasu schnięcia wszystkich spoin.

Surowe ml i metry są sumowane między pracami przed doborem opakowań. Resolver wymaga aktualnego modelu, właściwego EAN, jednostki i rozmiaru opakowania. Stare zapisy JSON są odczytywane bez modyfikacji danych użytkownika i oznaczane do ponownego doboru. Dawna taśma „Pro Clima lub podobna” nie dziedziczy dopasowania SWS ani statusów „Mam” i „Kupione”.

## Weryfikacja rzeczywistego API

13 zapytań HTTP do produkcji zakończono 2026-10-28 o 18:23:08 UTC. Dane pochodzą bezpośrednio z nowego kalkulatora aplikacji. Nie wysłano zamówienia, płatności ani danych osobowych. Kody pocztowe są testowe.

| Przykład jawnie dobranej naprawy | Wynik materiałów z dostawą |
| --- | --- |
| SWS: dwie prace 12 m i 14 m, po jednym zakładzie, bez dodatkowego zapasu; izolacja i materiały pomocnicze gotowe | 26,06 m → 1 rolka, Izosystems: 145,00 + 15,00 = **160,00 zł**, kod 00-001 |
| SWS: zapotrzebowanie dokładnie 60 m | 2 rolki: **305,00 zł**, kod 42-209 |
| SWS: 60 m odcinka + zakład | 3 rolki: **435,00 zł**, potwierdzona dostawa 0 zł, kod 00-001 |
| Dwie drobne spoiny po 5 m, 5 × 5 mm, zapas 10%; taśma maskująca posiadana | 275 ml → 1 kartusz, Rab-Dom: 14,00 + 10,50 = **24,50 zł** |
| Spoina 12 m, 5 × 5 mm, zapas 10%, 1 rolka taśmy maskującej | 330 ml → 2 kartusze i 1 rolka, Rab-Dom: 39,99 + 10,50 = **50,49 zł** |

Izosystems potwierdza koszyk dla kodu pocztowego. Rab-Dom potwierdza koszyk w taryfie krajowej PL; nie opisujemy tej taryfy jako indywidualnej wyceny dla kodu. Najtańsze produkty z różnych sklepów nie są automatycznie najtańszym zestawem po doliczeniu dostawy.

Niepotwierdzona uszczelka, brak doboru lub przygotowania, wybór sklepu bez produktu, brak kodu oraz odbiór bez ceny i stanu oddziału nie otrzymały potwierdzonej najtańszej sumy. SWS z jedną puszką pianki ma rozpoznane oba produkty, lecz **dostawa Folnetu nie została potwierdzona** (`quote_unavailable`, `needs_delivery_costs`). Nie ogłaszamy tego wariantu jako kompletnego koszyka z dostawą.

Dowody robocze: `work/catalog-wave67-production-proof.json`, `work/catalog-wave67-current-audit-proof.json`, `work/catalog-wave67-validators-proof.json`. Testy obejmują ilości, granice parametrów, brakujące dane, stare JSON-y, statusy zakupów oraz parser ukrytych pól. Końcowy zestaw: 696 testów, 0 błędów, 0 pominiętych; typecheck mobile poprawny. Sprawdzenie źródeł bez ostrzeżeń; 66 identyfikatorów rejestru i trzy negatywne próby walidatora zachowane.

## Stan i dalsza praca

Katalog: 166 referencji, 132 aktywne produkty, 177 ofert, 210 źródeł, 51 zarejestrowanych i 46 aktywnych sklepów. Nadal 34 braki katalogowe: 28 wygasłych weryfikacji przeglądarkowych i 6 produktów bez potwierdzonej oferty. Nie dodano nowych zdjęć w tej iteracji.

Te same 65 zapisanych zestawów obmiarów dają teraz 72/250 wycenionych wierszy, 178 braków (90 bez jednoznacznego zapytania, 74 bez produktu, 14 bez oferty), 8 pełnych scenariuszy materiałowych. Wcześniej było 73/247: wycofano jedną nieuprawnioną wycenę i uwidoczniono dodatkowe wymagania. To powtarzające się wiersze receptur, nie liczba unikalnych produktów ani procent ukończenia aplikacji. Nowe jawnie dobrane przykłady okienne zapisano osobno w `explicitMeasurementChecks.wave67`.

Zmiana dotyczy aplikacji; istniejący backend nie wymagał nowego wdrożenia. Nie zmieniano projektów użytkownika ani migracji bazy. Expo 8082 pozostaje uruchomione. **Weryfikacja wyglądu kreatora, edytora i koszyka nadal czeka**: narzędzie przeglądarki zgłasza wyłączony lokalny dostęp w ustawieniach Work. Nie obchodzono tego ograniczenia innymi narzędziami.

Dalej: ustalić przyczynę niedostępnej wyceny Folnetu dla pianki lub dodać potwierdzoną ofertę z wyceną całego koszyka; uzupełniać 34 braki; rozszerzać receptury i rzeczywiste ceny/stany pobliskich oddziałów. Cel rozwoju aplikacji pozostaje aktywny.
