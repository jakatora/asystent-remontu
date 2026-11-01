# Mniej sklepów i koszt wygody — wave184

Wdrożone i sprawdzone 2026-11-02 o 00:09:59 Europe/Warsaw (2026-11-01 23:09:59 UTC). Źródło aplikacji: `031aa6e7df2abc4b31a7d875c341cd18c6b2033b`.

## Efekt dla użytkownika

W porównaniu zakupów pojawia się opcja **„Mniej sklepów”**, kiedy istnieje potwierdzony pełny zestaw z dostawą, obejmujący mniej sklepów od najtańszego wariantu, ale co najmniej dwa. Użytkownik widzi obie sumy, dopłatę oraz liczbę sklepów i zamówień. Wybór zmienia produkty, kwoty i kopiowany plan zakupów. Najtańszy wariant pozostaje domyślny; nowa wycena lub ponowne otwarcie wymaga ponownego świadomego wyboru.

Opcja jest ukrywana, jeśli dostawa nie została potwierdzona, wygasła, dotyczy innego kodu lub kwoty są niespójne. Nie pokazujemy też droższego wariantu pośredniego, jeżeli potwierdzony zakup w jednym sklepie kosztuje tyle samo lub mniej. Jeden sklep może nadal wymagać kilku osobnych zamówień — ich opłaty i liczby pozostają widoczne.

## Rzeczywisty przykład testowy

Dla kodu `30-001` sprawdzono po jednym opakowaniu: Dulux EasyCare Nieskazitelna Biel 9 l (`5904078198759`), Ceresit CT 17 Transparent 5 l (`5900089218653`) i Śnieżka Grunt biała farba podkładowa 5 l (`5903973000235`). To kontrolowany zestaw QA, a nie udokumentowany remont lub zakup klienta.

| Wariant | Sklepy | Materiały | Dostawy | Razem |
| --- | --- | ---: | ---: | ---: |
| Najniższy potwierdzony koszt | Buduj24, Lobo, Rab-Dom | 272,95 zł | 48,40 zł | **321,35 zł** |
| Mniej sklepów | Buduj24, Sewera | 379,14 zł | 52,90 zł | **432,04 zł** |

Dopłata za redukcję z trzech sklepów do dwóch: **110,69 zł**. Kwoty dotyczą tego odczytu i zestawu. Buduj24 potwierdził krajową dostawę za 15,00 zł; Sewera dostawę dla kodu `30-001` za 37,90 zł. Rozróżnienie podstawy wyceny jest widoczne w aplikacji. Zachowano trzy właściwe modele, rozmiary opakowań i zapotrzebowanie 9/5/5 l.

W kontrolnym koszyku czternastu pozycji nie potwierdzono wariantu z mniejszą liczbą sklepów, więc opcja się nie pojawia. Istniejące sumy 2712,10 zł oraz 2684,99 zł po świadomym dokupieniu materiału zostały ponownie potwierdzone. Nie są obietnicą wyniku kolejnego remontu.

## Implementacja

- Backend zachowuje opcjonalne `cheapestFewerStores` niezależnie od trzech najtańszych alternatyw. Są to kompletne wycenione zestawy z bieżącego porównania, bez deklaracji przeszukania wszystkich podziałów lub całego rynku.
- Zestaw z mniejszą liczbą sklepów pozostaje wart sprawdzenia, nawet jeżeli jego materiały przekraczają cenę najtańszego zestawu z dostawą. Nadal obowiązuje wspólny limit 80 wycen koszyków, terminy, stany, partie zakupu i ważność dostawy. Limit koszyków nie jest limitem liczby HTTP do sklepów.
- Klient sprawdza ważność, kod, sumy w groszach i liczbę sklepów. Wariant o wygasającej dostawie uruchamia odświeżenie; wybór nie zmienia zapotrzebowania, historii cen ani źródłowej najtańszej wyceny.
- Odpowiedź starszego API może udostępnić zgodny wariant w istniejących alternatywach. Jawny brak nowego wyniku nie jest zastępowany takim fallbackiem.

## Weryfikacja i publikacja

| Zakres | Wynik |
| --- | --- |
| Testy aplikacji | 545 PASS |
| Moduł cenowy | 214 PASS |
| Biblioteki API | 127 PASS |
| Adaptery sklepów | 158 PASS |
| Wspólny backend | 1064 PASS |
| Typecheck / identyfikatory prac | PASS / 66 zachowanych |
| Rzeczywiste HTTP cen i koszyków | 22 lokalne + 22 publiczne |
| Krajowa wycena dla trzech kodów | 3 lokalne + 3 publiczne; lokalnie 8/0/0 nowych HTTP |
| Interfejs | 54 lokalne + 54 publiczne scenariusze |
| Nowa opcja w rzeczywistym UI | 6 lokalnych + 6 publicznych; klawiatura, kopiowanie, 320/390 px, ponowne otwarcie |

Grupy testów częściowo się pokrywają. Wszystkie wymienione zestawy zakończyły się bez fail/skip. W starszych regresjach UI część przypadków celowo symuluje awarie i zmiany ceny; nie dowodzą rzeczywistej podwyżki w sklepie. Nowe sześć przypadków używa rzeczywistych odpowiedzi API, bez podmieniania wycen na produkcji. Końcowa kontrola objęła 142 publiczne wystąpienia wycen zwycięzców/opcji oraz 16 wycen osobnych zamówień; były ważne w chwili kontroli.

Pierwszy koszyk czternastu pozycji: 37,279 s lokalnie i 35,510 s publicznie. Lokalnie wymagał 441 HTTP. Cała lokalna sesja QA wykonała 652 HTTP do sklepów, bez merchant 429 lub utworzenia zamówienia. Nie jest to pomiar p95 ani test gotowości na duży ruch. Lokalny pomocnik PID 24836 / sesja 41401 został poprawnie zamknięty; publiczny proces QA zakończył się kodem 0.

Pierwszy przebieg nowego testu UI zatrzymał się na różnicy między zwykłą i niełamliwą spacją przed „zł” w kopiowanym tekście. Poprawiono wyłącznie porównanie w pomocniku QA, zapisano faktyczny tekst i wykonano pełny test ponownie. Brakującą kopię istniejącego fixture w nowym katalogu roboczym uzupełniono przed uruchomieniem pozostałych testów; zakończonych prób sklepowych nie odtwarzano bez potrzeby.

- [PR 166](https://github.com/jakatora/przetargai/pull/166): head `19715ffbb5d73f50a9870f9780758b7b3173d485`, merge `9d88ceb595a26ba6bcae0cf53b9403aa2c067655`.
- API: `f2f1138d-d874-4e93-99bf-0d02ab6b21e1`, SUCCESS. WWW: `60e9d3ba-8afe-4f69-84b4-77abe86e9e47`, SUCCESS.
- Bundle API SHA-256: `69c2cce736b85e7f88c2cc8a7035ef1e87ee4e156b3e5435913159c7bf9a5496`. Zdalny snapshot 150 plików zgodny z kandydatem, 149 pozostałych plików i wszystkie 347 obserwacji startowych zachowane.
- WWW: 63 zasoby sprawdzone przez publiczny HTTP i SHA-256. Skan 77 wartości z vaulta bez ujawnień. Dziewięć plików hostingu i prywatnego relay pozostało identycznych z wave182; prywatna operacja bez uwierzytelnienia nadal zwraca 401.

## Dalszy zakres

Katalog nadal ma **240 referencji, 208 z potwierdzonymi ofertami, 308 ofert i 32 braki**. Ta zmiana nie dodaje nowych produktów ani zdjęć. Potwierdzenie produktu nie oznacza potwierdzonej dostawy każdego koszyka. Ograniczenia dostawy OBI/Castoramy opisane w [wave183](./obi-dostawa-i-gotowosc-biznesowa-wave183-2026-11-01.md) pozostają otwarte. Nie uruchomiono monetyzacji, śledzenia użytkowników, zamówień ani płatności.

Cel dalszego rozwoju pozostaje aktywny. Priorytet: kompletne listy dla malowania, podłogi i hydroizolacji, brakujące produkty z rzeczywistymi ofertami i zdjęciami, wiarygodne dostawy oraz szybkość porównania. Badania i rzeczywiste zakupy klientów opisane w planie biznesowym wymagają osobnego pilotażu.

Dowody: `G:/Projekty/asystent-remontu-work/wave184-20261101/verification-summary.json`, `validation.json`, `production-fewer-native.json`, `production-fewer-qa.json`, `production-fewer-copied-plan-r1.txt`, `production-fewer-390.png` oraz pozostałe logi w tym katalogu.
