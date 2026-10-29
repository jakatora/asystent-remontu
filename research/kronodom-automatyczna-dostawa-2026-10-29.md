# Kronodom: automatyczna dostawa podkładu 3 w 1

Stan na 2026-10-29. Uzupełniono brak opisany w raporcie podkładu: użytkownik widzi pełną cenę zamówienia Arbiton Secura Thermo Aquastop Smart z dostawą, bez ręcznego wpisywania stawki.

## Zakres i reguły

Obsługiwany jest sprawdzony produkt Kronodom `kronodom-arbiton-secura-thermo-6m2`, EAN 5905167826942, product/offerPosition 423, oferta 1, jednostka sprzedaży 1007. Sklep sprzedaje m² w wielokrotności 6, nie pojedyncze sztuki opakowania. Cena 10,33 zł brutto/m² daje 61,98 zł za fizyczne opakowanie 6 m². Nie utożsamiamy go z produktem o nowym EAN 5905167799208.

Źródła:

- [Dokładna karta podkładu w Kronodom](https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka)
- [Pierwszy krok koszyka Kronodom](https://kronodom.pl/order/checkout/cart)
- [Opcje i koszty dostawy](https://kronodom.pl/opcje-i-koszty-dostawy)
- Publiczny kod koszyka: `https://kronodom.pl/abs/1793195254635/js/6823.js`, `8301.js`, `4586.js`. Trasa `/offer/ajax/triggerOrderUpdate` służy w tym froncie do dodawania do niezłożonego koszyka; nie jest finalnym złożeniem zamówienia.

Każda wycena używa nowej, odizolowanej sesji anonimowej. Czytamy kartę, potwierdzamy aktualny produkt i stan, dodajemy dokładną liczbę m² do koszyka i czytamy pierwszy krok koszyka. Udostępniona operacja przyjmuje wyłącznie liczbę opakowań i token tej sesji; produkt, jednostka i strategia dodania są przypięte. Nie przyjmuje danych klienta, dowolnej strategii ani polecenia zakupu.

Kontrole obejmują: EAN, nazwę i URL pozycji, jednostkę m², skok/minimum 6 m², zamówioną ilość, stan, aktualną cenę brutto, wartość pozycji i całych produktów, wybranego kuriera, dopuszczoną metodę płatności, sumę dostawy i kwotę do zapłaty. Niepełne dodanie, obcy produkt, zmiana ceny, niewystarczający stan lub niespójna suma zatrzymują wycenę. Zero za odbiór osobisty nie staje się darmową dostawą. Ewentualne darmowe doręczenie wymaga potwierdzenia w koszyku i aktualnej polityce sklepu; nie opiera się na samym banerze „od”.

Wynik ma podstawę `retailer_basket_national`, zakres `PL` i ważność 10 minut. Nie podajemy, że sklep wycenił konkretny kod pocztowy: ten etap sklepu zwraca koszyk krajowy. Pełny adres i dostępność doręczenia użytkownik potwierdza przy zakupie.

## Rzeczywiste koszyki i działające API

| Ilość podkładu | Opakowania | Materiały | Dostawa całego zamówienia | Razem |
| --- | ---: | ---: | ---: | ---: |
| 6 m² | 1 | 61,98 zł | 69,00 zł | 130,98 zł |
| 12 m² | 2 | 123,96 zł | 69,00 zł | **192,96 zł** |
| 18 m² | 3 | 185,94 zł | 69,00 zł | 254,94 zł |
| 24 m² | 4 | 247,92 zł | **249,00 zł** | **496,92 zł** |

Próg większego transportu został potwierdzony zarówno przez rzeczywisty adapter HTTP, jak i natywny koszyk w przeglądarce. Nie wpisano stałej stawki 69 zł do kalkulacji. Pierwszy weryfikator błędnie oczekiwał niezmienionej dostawy dla 4 opakowań; po sprawdzeniu odpowiedzi i sklepu poprawiono oczekiwanie testu. Zachowano wszystkie surowe odpowiedzi, bez zmiany kodu produktu dla przejścia testu.

10 rzeczywistych przypadków produkcyjnego API obejmuje: 1 i 2 opakowania, dwa pokoje, dwa małe pokoje, dodatkową taśmę, drugi kod 42-209, brak zgodności, poprzedni komplet Volden, mieszany remont i odmowę przy wymaganiu przekraczającym stan.

- Podłoga 10 m² + 10% zapasu → 2 opakowania: **192,96 zł** z dostawą. Aplikacja wyświetliła taki wynik z rozbiciem 123,96 + 69 zł.
- Dwa małe pomieszczenia po 3 m² + zapas → łącznie 6,6 m², 2 opakowania i jedna dostawa: **192,96 zł**. Zaokrąglanie następuje po połączeniu potrzeb.
- Dwa pomieszczenia po 10 m² → łącznie 22 m², 4 opakowania: jedno zamówienie **496,92 zł**, ponieważ sklep zmienia próg transportu.
- Podkład 3 w 1 + dodatkowa rolka taśmy: **219,78 zł** z dostawami Kronodom i LiderzyCen.
- Mieszany zestaw Volden / Aquaprotec / taśma oraz Arbiton 3 w 1: 376,41 zł materiałów + 130,99 zł dostaw = **507,40 zł**.
- Dotychczasowy komplet Volden / folia 12 m² / taśma 7 m zachował potwierdzoną cenę **314,44 zł** z dostawą.

Ograniczenie w chwili tego wydania: wyceniano jeden pełny koszyk Kronodom, a dzielenie zamówień rozdzielało produkty, nie ilość jednego produktu. Dwa zamówienia po 2 opakowania kosztowały według sprawdzonych wycen łącznie 385,92 zł, o 111 zł mniej niż jedno zamówienie 4 opakowań. Aktualizacja 2026-10-29: podział ilości wdrożono i zweryfikowano w [kolejnym wydaniu](podzial-ilosci-na-zamowienia-2026-10-29.md), zachowując wspólny stan, opakowania i aktualne ceny. Wynik pojedynczego zamówienia nadal jest dostępny po wybraniu takiego trybu zakupów. Poniższe dane opisują wcześniejszy etap walidacji.

## Walidacja i wydanie

- 769 testów rdzenia, w tym testy rzeczywistej struktury dwóch progów transportu; 1054 testy współdzielonego backendu. 0 błędów, 0 pominiętych. Mobile/API typecheck PASS. Nie ma uruchomień GitHub Actions.
- 4 rzeczywiste wyceny adaptera, 10 przypadków produkcyjnego HTTP, natywny koszyk sklepu 12 i 24 m² oraz wynik aplikacji 192,96 zł. Bez podawania danych klienta, akceptacji warunków i składania zamówienia. Formularz gościa jedynie otwarto i pozostawiono pusty.
- Własny projekt QA `proj_mvss3izb0i9m37n4o` przełączono na Arbiton 3 w 1 do testu, po czym przywrócono nazwę i zestaw Volden / folia 12 m² / taśma 7 m. Liczba projektów pozostała 27; pozostałe projekty nietknięte.
- Backend [PR77](https://github.com/jakatora/przetargai/pull/77) merged, head `0f62fa12da34aa487a363f80ccc2ff16171df7be`, main `0081421b865fc791e5bea7fd46e573ce359ba15c`. Railway `143bbcff-fe3f-42d9-8402-77d7622aef2d` SUCCESS; 148 plików wdrożenia zgodnych z przejrzanym wydaniem. Zmieniono wyłącznie bundle modułu remontu; pozostałe 147 plików oraz wszystkie 219 obserwacji cen zachowane.
- Katalog pozostaje: 172 referencje, 165 aktywnych produktów, 213 ofert, 49 aktywnych kanałów. Automatyczna dostawa obejmuje obecnie 33 kanały w zakresie obsługiwanych produktów i koszyków. To nie oznacza integracji całego asortymentu każdego sklepu. Pokrycie 65 starych map pomiarów pozostaje 81/251, z 170 nierozwiązanymi wymaganiami; nie są to 170 unikalne SKU.

Przegląd ścieżki pieniędzy: aktualne kwoty brutto pochodzą z koszyka, kontrolowane są ilości i wszystkie sumy, a brak danych nie staje się zerem. Dowodem są działający produkcyjny HTTP i dwie wyceny w przeglądarce sklepu. Nie zmieniano płatności, webhooków ani przepływów Stripe. Cel rozwoju aplikacji pozostaje aktywny.
