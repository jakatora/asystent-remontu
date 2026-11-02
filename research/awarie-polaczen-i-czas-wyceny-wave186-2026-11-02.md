# Awarie połączeń i czas wyceny — wave186, 2026-11-02

Opublikowano krótką przerwę w ponawianiu jednoznacznie niedostępnego połączenia sklepu. Odczyt ceny i późniejsza wycena transportu korzystają z tej samej wiedzy o błędzie, zamiast ponownie oczekiwać na identyczne niedostępne połączenie. Koszt dostawy i pełna suma pozostają nieznane. To nie potwierdza transportu ABUD ani kompletności dowolnego remontu.

## Co zmieniono

- Oddzielny stan dla każdej instancji usługi i origin sklepu, wyłącznie dla przypiętych źródeł. Po jednoznacznym błędzie systemowym połączenia przed odpowiedzią HTTP przerwa trwa 30 s. Pominięte próby nie przesuwają jej końca.
- Uwzględniane są jawne kody połączenia i DNS, w tym UND_ERR_CONNECT_TIMEOUT. Ogólny TypeError, anulowanie żądania, sam TimeoutError, HTTP 403/429/5xx, cena, dostępność i reguły zakupu nie uruchamiają tej przerwy. [Dokumentacja Node](https://nodejs.org/api/errors.html#common-system-errors), [dokumentacja Undici](https://github.com/nodejs/undici/blob/main/docs/docs/api/Errors.md). Walidator dwóch źródeł: HTTP 200, zero ostrzeżeń.
- Dokładna, potwierdzona i niewygasła wycena istniejącego koszyka nadal może być użyta z pierwotnymi datami. Inny kod pocztowy lub ilość nie otrzymują tej kwoty. Nie przedłużono ważności dostaw i nie dopisano nowych taryf.
- Udany, zweryfikowany odczyt istniejącą alternatywną drogą usuwa informację o niedostępnym połączeniu. Zachowano jedną ograniczoną czasem próbę bezpośrednią po awarii prywatnego relay. Zmiana ceny, brak towaru, ograniczenie 429 i zajęta kolejka nadal nie powodują drugiej drogi.
- Ten sam mechanizm działa w API i istniejącym podpisanym kanale WWW. Brak globalnej podmiany fetch i nowych usług, kluczy, proxy, adresów IP, danych klienta lub operacji zamówienia.
- Polski i angielski komunikat wyjaśniają chwilowy brak odpowiedzi sklepu i nieznany transport. Nie zmieniono zapotrzebowania, zaokrąglania pełnych opakowań, rejestru prac ani historii ceny po nieudanym odczycie.

## Dowód kontrolowany i rzeczywisty

Test RED odtworzył dwie próby połączenia zamiast jednej przy odczycie ceny i transportu. Po poprawce test przechodzi. 25 testów skupionych na tej ścieżce obejmuje również koniec 30 s, brak przedłużania przerwy, inne originy i instancje, odrębne kody pocztowe, ważny cache, odzyskanie połączenia, podpisane HTTP, błędy HTTP i anulowanie.

Osobno uruchomiono przygotowany bundel CJS za rzeczywistym lokalnym HTTP. W kontrolowanym transporcie podstawiono faktyczną odmowę połączenia TCP do zamkniętego lokalnego portu. Dwa kody pocztowe wykonały łącznie jedną próbę TCP; odpowiedzi 103 i 28 ms zachowały 5,5 kg, dwa wiadra po 5,4 kg, 89,40 zł samych materiałów, pierwotny czas obserwacji oraz null dla dostawy i pełnej sumy. To test kontrolowany, nie pomiar ABUD. Nie wstrzyknięto cen ani wycen transportu.

**Rzeczywista publiczna próba po publikacji obu usług:**

| Kod i potrzeba | Opakowania | Materiały | Transport i pełna suma | Czas |
| --- | --- | ---: | --- | ---: |
| 30-001, 5,5 kg | 2 × 5,4 kg | 89,40 zł | Nieznane, retailer_connection_unavailable | 20.195 s |
| 00-001, 10,9 kg | 3 × 5,4 kg | 134,10 zł | Nieznane, retailer_connection_unavailable | 0.110 s |

Obserwacja przerwy na produkcji: true. Zmieniono zarazem kod i liczbę opakowań; druga odpowiedź nie pochodzi z cache identycznej wyceny pierwszego koszyka. To pojedyncze pomiary podczas konkretnej awarii, nie p95, próba obciążenia lub dowód przyspieszenia każdego zdrowego koszyka. Liczby wewnętrznych HTTP w publicznej próbie nie zmierzono.

ABUD nadal nie potwierdza publicznej dostawy. Lokalna stawka nie zastępuje odpowiedzi sklepu. Realbud Super Finish nadal wymaga indywidualnego transportu, a 103,05 zł opisuje materiał. Poprawka przyspiesza poprawną obsługę braku połączenia; nie rozwiązuje dostępu do kalkulatorów Castoramy i OBI.

## Regresje

Grupy czystego źródła: 547 mobile, 214 pricing, 144 api-lib, 159 adapter, 1064 shared. Wszystkie bez błędów i pominięć; grupy nachodzą na siebie. Typy API i mobile oraz 66 zadań legacy przeszły. Wczesny typecheck brudnego D wskazał nieprzebudowane deklaracje zależności; czysta kopia po wymaganym buildzie referencji przeszła.

Lokalnie przeszły 31 rzeczywistych scenariuszy natywnych cen/koszyków, trzy kody ponownego użycia dostawy krajowej i 64 scenariusze UI. Lokalny pierwszy koszyk 14 pozycji: 39,4 s i 441 HTTP, bez deklarowania przyspieszenia zdrowych sklepów. Szesnaście pozycji z oboma nowymi Knaufami nadal 2945,80 zł z dostawami, dziewięć sklepów, rozgrzana próba około 4,2 s. To lokalne, a nie publiczne potwierdzenie ABUD.

Publicznie przeszły 25 samodzielne scenariusze API oraz trzy kody krajowe i 64 scenariusze UI. Obejmują wcześniejsze 22 przypadki, Realbud i dwie rzeczywiste próby połączenia opisane wyżej. Dziesięć nowych scenariuszy UI sprawdza rzeczywisty brak odpowiedzi sklepu: zdjęcia i EAN, odświeżenie bez wymyślonej nowej ceny, całe wiadra, nieznany transport w ekranie i kopiowanej liście, sam odpowiadający Realbud, szerokości 320/390 px oraz surowe zapotrzebowanie w kopii. To inne pokrycie od dodatnich lokalnych dostaw Knaufów.

Symulacje wzrostu i spadku ceny w istniejącym teście interfejsu są jawnie kontrolowane i nie zmieniają produkcyjnej historii. Użytkownik nie dostaje zmiany ceny na podstawie ceny katalogowej ani nieudanego odświeżenia.

Końcowa weryfikacja 2026-11-02T00:28:14.821Z: 142 wystąpienia zwycięskich wycen i 16 zagnieżdżonych wycen osobnych zamówień; wygasłych przy kontroli 0. Katalog zachowany: 242 referencje, 210 z ofertami, 311 ofert, te same 32 braki; cztery wcześniej sprawdzone warianty SKU i zero fałszywie potwierdzonych dopasowań. Wszystkie materiały, zdjęcia i seed bez zmian.

Pełny publiczny koszyk 14 pozycji nadal 2712,10 zł, świadomie wybrana nadwyżka 2684,99 zł. Pierwsza próba tej wyceny trwała 40,122 s; pojedynczy pomiar, nie p95. Lokalny dowód obejmuje 737 HTTP, bez 429 i złożonych zamówień. Publiczne próby nie mierzą wewnętrznej liczby HTTP do sklepów.

Pierwotną kontrolę czasu zatrzymała różnica 38 ms między czasem wyceny Elmas a lokalnym zapisem odpowiedzi. Zachowano oryginalne daty i dowód tej porażki pomocnika; końcowy weryfikator wymaga ważności każdej wyceny w aktualnej chwili kontroli, bez przesuwania dat i przedłużania ofert.

## Publikacja i granice

Źródło runtime: 8603f0163ba9dd87e3baf88cac7ae72180b5449b. [PR 168](https://github.com/jakatora/przetargai/pull/168), head 9ea4fd3517a6fe76db5dfd3a999943e18d6f3a42, merge a1dd1ccef889be6ebdc46269ded73436bd21755b. Wspólny backend zmienił tylko bundel: 149 pozostałych plików i wszystkie 350 obserwacji seed zachowane bajtowo. SHA256 b9b1ff0eb7240fd9ade66ca6e8390a3969711499a62d1f896a9915c47191eede. Wszystkie 150 wdrożonych plików porównano z przygotowanymi.

- API: 8cb41ddd-62ed-4faf-b59b-02277f17f9dd, SUCCESS, 2026-11-02T00:19:53.348Z.
- WWW: 1e327405-c00f-4ba1-be32-79b248526864, SUCCESS, 2026-11-02T00:20:51.514Z.

Pierwsza próba API 46885579-6576-41f4-b090-3bddde8d5879 zakończyła się FAILED na BUILD_IMAGE, przed uruchomieniem aplikacji. W 59 wiadomościach logu nie było jawnego błędu; przyczyny nie ustalono. Po ponownym potwierdzeniu 150 niezmienionych plików działającej wersji wykonano jedną próbę identycznego pakietu, która przeszła. Obie próby i wyniki zachowano, bez uznawania timeoutu obserwacji za zakończenie procesu.

WWW: 63 zasoby, 17 283 474 B, publiczne SHA zgodne, skan 77 wartości vaulta bez wycieków. Osiem plików konfiguracji hostingu identycznych z wave185; zmienił się tylko prywatny relay. Prywatny POST bez podpisu zwraca 401. API i WWW mają spójne źródło. Pliki migracji, identyfikatory prac, zależności i obce WIP nie zostały zmienione.

Artefakty: G:/Projekty/asystent-remontu-work/wave186-20261102. Oryginalny RED, kontrolowane TCP, rzeczywiste odpowiedzi, zrzuty ekranu i nieudana próba publikacji zachowane. Pierwszy pomocnik natywny przerwał się przed Elmas z powodu brakującej kopii fixture; skopiowano niezmieniony oryginał i wznowiono tylko jeszcze niewykonane kroki.

Przegląd money-path: kwoty nadal pochodzą z rzeczywistego produktu i konkretnego potwierdzonego koszyka, cache zachowuje zakres i czas ważności, awaria nie odnawia ceny ani nie tworzy kwoty transportu, stan jest izolowany do aplikacji. Dowód obejmuje testy, uruchomiony bundel HTTP oraz rzeczywistą produkcyjną awarię i renderowanie UI. Brak płatności, webhooków, płatnego AI i ruchu pieniędzy.

Ciągły cel pozostaje aktywny. Nadal do wykonania: brakujące produkty i stabilne wyceny dostawy, kompletność trzech głównych scenariuszy remontu, rzeczywisty pilotaż użytkowników oraz pomiar szybkości i kosztu przy większym ruchu.
