# Podkłady Arbiton Optima i cały zestaw do podłogi — 2026-11-02

Dwa nowe produkty i zdjęcia: Optima Thermo Aquastop 1,5 mm (5905167881811) i Optima Aquastop 2 mm (5905167881804). Osobne GTIN, rolki 10 m², jawny wybór w kalkulatorze podkładu oraz paneli laminowanych. Nie są utożsamiane z Secura ani dobierane pod winyl/SPC. Podkład 3 w 1 ma barierę i taśmę; nie dodajemy drugiej folii. Przed wyceną samodzielnego podkładu wymagana zgodność z instrukcją podłogi. Zmiana modelu resetuje potwierdzenie zgodności.

Źródła:
- https://arbiton.com/content/uploads/ARBITON-underlayments-2025.pdf — str. 31 i 53: kody, rolki 10 m², grubości oraz konstrukcja 3 w 1.
- https://topboden.pl/podklad-pod-panele/arbiton-optima-thermo-aquastop-podklady-pod-panele-laminowane
- https://topboden.pl/podklad-pod-panele/arbiton-optima-aquastop-podklady-pod-panele-laminowane

Natywna cena rolki 155,00 / 175,00 zł; cena za m² to 15,50 / 17,50 zł. Importujemy cenę całego opakowania bez opcjonalnego kodu EXTRA20. Publiczne API i karta produktu muszą potwierdzić tę samą cenę, jednostki, opakowanie, EAN, grubość i stan. Oryginalne obserwacje 04:52:21 UTC, bez fikcyjnej poprzedniej ceny. Trzy rzeczywiste próby natywnej taryfy TopBoden (1 rolka obu wariantów, 3 rolki Thermo) zwróciły kuriera 39,99 zł, taryfa krajowa PL. Termin ważności pozostał oryginalny, nie jest przedłużany.

Audyt czterech zestawów z publicznego API: domyślny ekonomiczny ma brak folii Diall; standard ma dodatkowo brak paneli Toledo. Istniejące jawne wybory Oakland/Niasa i Arbiton Aquaprotec albo system Secura 3 w 1 pozwalają już na pełne wyceny. Weryfikowane będą też nowe warianty oraz sumowanie całego remontu.

Odrzucone źródła: Volden 20 m² LiderzyCen ma tylko odbiór w Poznaniu, także przy 2 rolkach; mieszany zestaw nie dał potwierdzonej dostawy. Nie opublikowano tej spekulacyjnej integracji. RodiMAX ma kartę produktu, ale nie potwierdzono funkcjonalnego koszyka/dostawy. Arbiton Secura 6 m² w LiderzyCen (134585) ma can_buy=false. Baufol bez natywnego EAN i bez potwierdzenia pod laminat nie jest zamiennikiem folii podłogowej.

## Publikacja i dowody

Ukończona część opublikowana 2026-11-02. Źródło aplikacji 71b705296d9b4bfd71fbdcc7a08bba0160770183; PR 175 w jakatora/przetargai, head 48e8b526e5db4d117504fa7181ddebc549957211, merge ed7a79fb60894d7c86cefc38541d4549286d87e7. API e4ce5730-9d31-4fcc-afdf-9b5a35a29385 SUCCESS od 05:05:53 UTC; WWW 238a768a-bd90-4dea-8040-ea6f580631c8 SUCCESS od 05:07:32 UTC. GitHub nie ma przypisanych statusów CI; weryfikacje niżej są wykonanymi testami lokalnymi i publicznymi.

- 571 testów mobile, typy i 66 historycznych prac PASS; 237 pricing, 165 API lib, 177 adapterów i 1064 wspólnego backendu PASS, bez pominięć. Grupy częściowo się pokrywają — nie sumować ich jako unikalnych testów.
- Cztery lokalne i cztery publiczne próby HTTP PASS: oba nowe warianty dla 20 m², pełny zestaw trzech projektów oraz wybrany TopBoden z dwoma brakującymi produktami. W tym ostatnim przypadku pełna cena pozostaje nieznana.
- 19 lokalnych i ponownie 19 publicznych scenariuszy UI PASS. Obejmują dwa kody i zdjęcia, import/eksport 3 projektów, ilości i pełne rolki, realną cenę z dostawą, kopię planu, szerokości 320/390 px, zachowanie kodu pocztowego, prawdziwy edytor obmiarów, reset zgodności po zmianie modelu, osobne GTIN, ponowną konsolidację po przywróceniu, odświeżenie i niepełny wybrany sklep. Żadnych cen ani wycen nie wstrzyknięto.
- Trzy projekty: podkład dla 10 i 15 m² oraz montaż paneli dla 20 m². Surowy podkład 11 + 16,5 + 22 = 49,5 m² daje 5 rolek po 10 m² zamiast 7 przy osobnym zaokrąglaniu prac. Pozostałe potrzeby: panele Oakland 22 m², 1 zestaw Wolfcraft i 5 m taśmy. W próbie publicznej materiały 1443,44 zł + dostawy 266,47 zł = 1709,91 zł; 3 sklepy, 4 zamówienia. To obserwacja w danym czasie i porównanie wycenionych wariantów; nie dowód globalnego minimum. Taryfy krajowe PL są jawnie opisane w UI i kopiowanym planie, bez osobnej wyceny dla kodu.
- Końcowy przegląd 2026-11-02T05:09:38.167Z: 102 wystąpienia cytowanych wycen ważnych wtedy; oryginalne daty bez przedłużania. Sumy groszy zgadzają się z fizycznymi opakowaniami i dostawami.
- Zachowano wszystkie 361 wcześniejszych obserwacji seed i dodano 2 rzeczywiste (363). SSH potwierdził 150 plików publikacji; 148 innych plików bez zmian. SHA256 pakietu API 07be667e50dc989274c1c51739cac96ef789fc35fa2c34e66f1ef600aab4cac4.
- Historia: przed 12243, po 12555; zachowano 12238 dawnych punktów. 5 najstarszych usunęła istniejąca retencja, wynik odtworzony rzeczywistą klasą RetailPriceHistory. Nowe źródła miały odpowiednio 3 i 2 prawdziwe obserwacje; delta 0, bez fikcyjnej poprzedniej ceny i promocji.
- 63 publiczne zasoby sprawdzone SHA256, 77 wartości vault / 0 wycieków. Z dziewięciu plików hostingu 8 bajtowo bez zmian; zmieniony wyłącznie generowany moduł prywatnego przekaźnika z nowym katalogiem. Publiczne strony 200, prywatne pliki 404, anonimowy POST do przekaźnika 401.
- Katalog: 249 referencji, 217 z potwierdzonymi ofertami, 324 oferty. Nadal 32 stare braki; nie przedstawiać nowych podkładów jako zamknięcia ofert dla starej folii Diall lub paneli Toledo.

## Wykryte problemy w walidacji

Pierwsza integracyjna próba HTTP wykryła rozbieżność jednostki: nowe referencje miały m², a natywny adapter oczekiwał kanonicznego m2. Przed publikacją poprawiono obie referencje i asercję kontraktu; ilości nie uległy zmianie. Zachowano czerwony wynik local-optima-unit-mismatch-red.json; następne rzeczywiste próby i UI są zielone.

Pierwsza kontrola typów wykryła wyłącznie nieprecyzyjny typ mapy pomiarów w nowym teście — poprawiono go i powtórzono testy oraz typy. Rozszerzony zestaw ujawnił też historyczną próbkę akcesoriów TopBoden ważną do 2026-10-29; test odtwarza ją teraz w oryginalnej dacie przechwycenia 2026-10-27, a osobna asercja odrzuca ją po terminie. Nie zmieniono danych ani terminu w próbce.

W roboczym czystym klonie zdiagnozowano nieśledzony plik wygenerowanego pakietu po pomocniczym buildzie ze względną ścieżką z wejścia stdin. Jego SHA był identyczny z własnym pakietem; zachowano kopię na G i usunięto wyłącznie ten plik. Końcowy build używał absolutnej ścieżki, a klon źródłowy jest czysty.

Dowody: G:/Projekty/asystent-remontu-work/wave194-20261102, w szczególności optima-native-products.json, optima-native-baskets.json, local-optima-native.json, production-optima-native.json, local-optima-qa.json, production-optima-qa.json, production-product-history.json, deployed-verification.json, production-http.json, final-proof.json i release-state-api-web.json. Własne serwery 47144 oraz 33524 zakończone, wszystkie przeglądarki QA zamknięte. Nie dotykano projektów użytkownika, localhost:8082, migracji, zależności, płatności ani innych aplikacji. Obcy WIP w mapowaniach, ean-overlay i lock nie został włączony.

Cel pozostaje aktywny. Kolejna wartościowa próba: dodatkowy sklep z tym samym zestawem Wolfcraft 6931000, aby sprawdzić cenę całego koszyka z dostawą wobec Mensura. Kandydat do ponownej weryfikacji, bez potwierdzonej integracji: https://alnar.pl/wolfcraft-zestaw-do-montazu-paneli-p-6949.html . Nie korzystać z indeksowanej ceny lub stawki od jako dowodu aktualnej pełnej dostawy.
