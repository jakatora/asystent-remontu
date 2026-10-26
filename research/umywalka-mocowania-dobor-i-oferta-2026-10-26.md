# Mocowania umywalki w rzeczywistym koszyku — 2026-10-26

Poprzednia wycena obejmowała ceramikę, baterię, syfon, zawory i silikon. Nie zawierała mocowań ściennych, więc pozornie pełna suma nie wystarczała do zakupu potrzebnych części. Dodano osobny wymagany materiał oraz wybór jego doboru; pozostałe elementy podejścia odpływowego nadal wymagają pracy.

## Produkt i źródła

- [Fischer, dokładny wariant 45494 / WST 140 K NV](https://www.fischerdanmark.dk/da/produkter/sanitetsbefaestigelse/keramiske-handvaske-urinaler-og-sanitaere-installationer/fastgorelse-af-vask-wst/45494-wst-140-k-nv): EAN **8590369454948**. Niezależna identyfikacja producenta.
- [Fischer, zasady WST i podłoża](https://www.fischerpolska.pl/pl-pl/produkty/mocowania-sanitarne/ceramiczne-umywalki-pisuary-i-wyposazenie-sanitarne/mocowanie-umywalek-wst): dobór do podłoża nośnego; płytek i tynku nie traktuje się jako nośnego muru. Nie przenoszono deklarowanej nośności pomiędzy podłożami.
- [ABUD, dokładny blister](https://www.abud.pl/product-pol-17848-Mocowanie-umywalki-WST-10x140-Fischer-2-sztuki.html): rzeczywisty browser i HTTP, EAN 8590369454948, kod 45494, **24,50 zł brutto za opakowanie dwóch punktów mocowania**, dostępny przycisk zakupu i zdjęcie. HTTP `2026-10-26T22:19:50.486Z`; oryginał zachowany w prywatnym dowodzie badania. Blister zawiera dwa kołki UX 14×75, śruby M10×140, tuleje i nakrętki. Nie oznacza dwóch kompletnych umywalek.
- [OBI, odrębny WST 080660](https://www.obi.pl/p/1113554/fischer-mocowanie-sanitarne-wst-10x140-2-sztuki): browser pokazał **44,79 zł**, lecz dostawa do domu była wyłączona („Obecnie nie jest to możliwe”), a odbiór wymagał placówki. **Nie dodano oferty OBI** ani zamiany EAN 4006209806609 na EAN ABUD. Warianty WST II/DuoPower i produkty opisane jako Laufen także nie zostały połączone.

Zdjęcie z dokładnej karty ABUD, bez pobierania binariów do repo. Rzeczywiste UI potwierdziło `complete:true`, `naturalWidth:208` i prawidłowy blister. Zarejestrowanych 110 URL-i zdjęć nie jest ponowną kontrolą wszystkich obrazów jednocześnie.

## Zachowanie aplikacji

`sinkFixingChoice` to nowy obmiar, bez zmiany jakiegokolwiek wcześniejszego ID. Trzy czytelne opcje: dobór do ustalenia (domyślnie), zakup WST 140 K po potwierdzeniu dopasowania oraz posiadanie odpowiednich mocowań dla wszystkich umywalek. Nie ma automatycznego wyboru zestawu dla nieznanej ściany. Informacja obejmuje dwa punkty, gwint, długość, nośne podłoże i okładzinę; płyta g-k/stelaż wymagają osobnego doboru. To deklaracja użytkownika w kontrolnym projekcie, a nie zdalne potwierdzenie techniczne rzeczywistej ściany.

Wybrany zgodny zestaw: **2 punkty × liczba umywalek**, referencja 2 szt./blister; API zaokrągla zakupy do pełnych opakowań. Jawne posiadanie wszystkich mocowań wyłącza ich zakup. Brak doboru pozostaje wymaganą, niewycenioną pozycją i blokuje pełną sumę. Dotyczy wszystkich trzech poziomów, pojedynczego projektu i wspólnego koszyka. Wariant mocowań ma osobny typ względem zestawu WC.

Starszy JSON kalkulacji otrzymuje brakującą pozycję w widoku, bez przepisania przechowywanego JSON lub cen. Istniejąca **niepusta** lista Zakupów może otrzymać jeden nowy wiersz mocowań: atomowy `INSERT … WHERE NOT EXISTS` chroni przed duplikatami między kartami. Wcześniejsze ilości, własne ceny, oznaczenia i ręczne wiersze pozostają. Pusta lista nadal umożliwia normalne wygenerowanie zakupów. Odczyt już uzupełnionej listy nie wykonuje zapisu, co zapobiega pętli powiadomień bazy. Zmiana ilości unieważnia wcześniejsze posiadanie niewystarczającej liczby mocowań; potwierdzenie zapisuje aktualne wymaganie.

Kreator i edycja obsługują dostępne opcje radiowe zamiast kodów liczbowych. Parser odrzuca wartości spoza opcji, podsumowanie pokazuje nazwę wybranej opcji. Edycja istniejącego projektu umywalki obejmuje też liczbę umywalek i dodatkowe wężyki. Plan, Zakupy i porównanie mają bezpośrednie przejście do tej edycji.

## Weryfikacja

**486 testów core/kalkulator/pricing/API PASS, 0 skip** (końcowy log 5880,4957 ms), w tym sześć nowych testów doboru/ilości, historii, posiadania i parsera opcji oraz test rzeczywistego HTML ABUD z negatywnymi mutacjami EAN, jednostki, ceny i opakowania. **Dwa rzeczywiste testy SQLite repozytoriów PASS**: idempotentne dopisanie, zachowanie cen, zakupów i drugiego projektu, aktywne klucze obce; edycja projektu zachowuje pozostałe dane. Mobile/API typecheck, kontrola 66 chronionych ID z negatywnymi mutacjami i diff check PASS.

**1053 testy wspólnego backendu PASS, 0 skip**, 143263,2117 ms, z plikiem `.env.test` i szeregowym wykonaniem. Pierwsze uruchomienie bez `--env-file` nie przeszło walidacji JWT_SECRET; naprawiono polecenie bez zmiany aplikacji lub osłabienia walidacji. Poprzednia liczba 1054 obejmowała dodatkowo plik pomocniczy `test/helpers/buildPdf.js`; identyczne rzeczywiste nazwy testów pozostają obecne w bieżących 1053.

Rzeczywiste HTTP przygotowanego bundle oraz produkcji, z aktualnego kalkulatora dwóch umywalek i jawnego modelu Atlantic New:

- **4 punkty → 2 blistry → 49,00 zł**, sześć grup produktów, **1013,84 zł materiałów w odbiorze**, bez dojazdu i bez potwierdzenia lokalnego zapasu.
- Nieustalony dobór: brak pełnej oferty (`best:null`). Jawne posiadanie mocowań: **964,84 zł** pozostałych materiałów.
- Wysyłka do przykładowego 00-001: `needs_delivery_costs`, `best:null`. Brakującego frachtu ABUD/Castoramy/pozostałych sklepów nie podstawiono jako 0 zł.
- Wybrany ABUD: **49,00 zł części materiałów i pięć braków**, bez pełnej sumy. Posiadane cztery mocowania są pomijane we wspólnym filtrze Zakupów.
- Dotychczasowy wspólny koszyk regresyjny nadal **637,43 + 153,40 = 790,83 zł**.

Rzeczywisty UI istniejącego własnego projektu `proj_mvps3mo96r5yibhgr`: edycja, zapis, pełny reload, cztery mocowania/49 zł na liście, produkt ze zdjęciem i **2×2 szt./49 zł** w ABUD, suma 1013,84 zł, wybrany ABUD/49 zł/pięć braków przeniesione również do Planu, brak pełnego frachtu przy 00-001. Osobno sprawdzono wybór „Do ustalenia” (jeden brak i brak pełnej ceny), „Mam już dobrane” (964,84 zł) i powrót do zakupu. Mobilne 375×812: szerokość widoku i dokumentu 375, opcje mają wysokość 74 px, jawne ARIA checked. Viewport przywrócony do 1280×720. Nie utworzono ani nie usunięto projektu; siedem wcześniejszych projektów pozostaje bez zmian.

Końcowy test odkrył rzeczywisty błąd: po usunięciu zapisanego kodu i kliknięciu odbioru `blur` pola uruchamiał ponowną wycenę, która usuwała radio z DOM przed obsługą kliknięcia. Kod był usuwany, ale tryb zostawał „shipping”. Poprawiono celowo ten przypadek: gdy fokus przechodzi do jednego z dwóch radio sposobu dostawy, zapis łącznej decyzji przejmuje jego `onPress`. Pozostały blur/Enter nadal zatwierdza kod. [Dokumentacja FocusEvent.relatedTarget](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/relatedTarget). Rzeczywisty powtórzony test: zapis 00-001 → gotowa wycena wysyłki → wyczyszczenie pola → **jedno** kliknięcie odbioru daje `pickup` i 1013,84 zł; nie wymaga drugiego kliknięcia. Dowód `catalog39-postcode-blur-pickup-20261026.txt`.

Pełny reload po poprawce zachował odbiór, potwierdzony wariant mocowań, Najtańszy zestaw i 1013,84 zł. Wspólny koszyk w rzeczywistym UI nadal: trzy wcześniejsze prace, Standard, jedna posiadana pozycja, wysyłka do 00-001, 637,43+153,40=790,83 zł. Zaznaczeń wspólnego koszyka nie zmieniano w tej iteracji. Zapisano wspólny `work/catalog-wave39-ui-proof.json`.

## Wdrożenie i zakres

Świeża migawka 148 plików backendu, SHA256 `871997bcb7868027b3406c9dff0e7a94486c88ef325ab20865bc605b894f25c9`. Tuż przed wdrożeniem `2026-10-26T22:29:07.571Z` potwierdzono brak driftu. Zmieniono tylko bundle remontu i jego obserwacje; zachowano wszystkie wcześniejsze 132 obserwacje, dodano jedną automatyczną ofertę. Source `dced79cca7001e26cc8d54832a46b2227ee6cb9e`, [PR39](https://github.com/jakatora/przetargai/pull/39) scalony i przypięty, merge `54c8c0bb492e907ab1bf99f727778e702aeab58b`. GitHub checks/statuses puste — bez deklaracji zielonego CI.

Railway `dd15ca45-ed5d-469c-a050-8e471004660d`: **SUCCESS 2026-10-26T22:31:32.412Z**. Produkcja `2026-10-26T22:32:59.966Z`: **104/110 referencji z ofertą**, sześć dawnych braków, 131 aktywnych ofert, 38 sklepów/punktów, 133 obserwacje (dwie wyłączone), 22 ręczne potwierdzenia, 20 automatycznych integracji dostaw. ABUD automatycznie odczytany 22:32:14.320Z, bez błędu. Health200/authme401, collector running:false. Nie budowano binarek mobilnych.

Ścieżka pieniędzy: faktyczny brutto za blister i kwoty API w groszach; lokalna cena referencyjna osobno, bez fałszywej darmowej dostawy lub ukrycia brakującego materiału. Izolacja projektu i zachowanie danych w rzeczywistej bazie. Nie wykonywano zamówień, płatności, wysyłek wiadomości ani płatnego AI.

Dowody w katalogu rozmowy: `work/catalog-wave39-{local-live,production,collector}-proof.json`, `core-tests-final.log`, `shared-tests.log`, `legacy-mutation-proof.json`, oryginał HTTP w `work/catalog-wave39-research/`; teksty i zdjęcia `outputs/catalog39-*20261026.*`. Foreign WIP ean-overlay (+51), mappings (+86), pnpm-lock (+983/-977), .atlas, PROPOZYCJE-COCKPIT pozostaje poza commitem.

Pełny cel nadal aktywny. Brakuje sześciu historycznych modeli: Facile50, Toledo2,22, DiallPE20, PetroGreyG2, NatiBiancoStruktura, stareArchi80lewe. Jawne zamienniki ich nie kasują. Następne istotne prace: wycena i dopasowanie podejścia odpływu, automatyczny fracht ABUD i Castorama/OBI, lokalna dostępność/ceny odbioru oraz zgodność materiałów kuchennych/epoksydu. Dodane mocowania nie dowodzą kompletności wszystkich możliwych akcesoriów instalacyjnych.
