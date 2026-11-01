# OBI: dostawa i gotowość do pozyskiwania klientów — wave183

Stan na 2026-11-01, 22:51 UTC (23:51 Europe/Warsaw). Badanie techniczne publicznego sklepu, bez zmiany działania aplikacji. Produkcja pozostaje na wave182, źródło `61af6fb8a4ff0e0be95f76400f7b79b465865cf4`.

## Potwierdzone obserwacje

- Publiczna strona OBI działała w osobnym profilu Edge, HTTP 200. Produkt: Kreisel GW 180, wiadro 20 kg, SKU `7088131`, EAN `5907418038791`. Cena całego wiadra 3849 gr; zaokrąglonej ceny 1,93 zł/kg nie mnożyć przez 20 w celu ustalenia ceny opakowania.
- Jeden anonimowy koszyk zawierał ten produkt: materiały 3849 gr, dostawa do domu 1399 gr, razem 5248 gr. Sprzedawca `obiecomprodpl`, bez zewnętrznego sprzedawcy. Pole maksymalnej ilości w formularzu nie jest dowodem stanu magazynowego.
- Zapowiedź na stronie produktu wskazywała odmienną usługę: Locker / Paczkomat InPost za 1299 gr, z domyślnym `postalCode=00000`. Nie jest to potwierdzenie transportu tego koszyka do domu.
- W anonimowym checkout znaleziono domyślny kod dostawy `99-120`. Nie był to kod użytkownika aplikacji ani dowód wyceny dla badanego kodu `30-001`.
- Wpisanie samego kodu `30-001` w zwykłym formularzu nie uruchomiło potwierdzonej wyceny. Natywna operacja aktualizacji danych z pustymi danymi kontaktowymi zwróciła HTTP 400: `Invalid contactInformation email`. Wariant pomijający dane kontaktowe również zwrócił HTTP 400, błąd walidacji zdarzenia.
- Zwykły odczyt Node strony i koszyka zwracał HTTP 404 z pustym body, także z publicznym nagłówkiem używanym przez frontend. Przeglądarkowy odczyt natywnego koszyka działał. Nie wdrożono obejść kontroli dostępu ani nowego serwisu przeglądarkowego.
- Strona Castoramy badanego produktu zwróciła HTTP 503 z komunikatem o konserwacji. To problem dostępności strony, a nie potwierdzenie braku produktu w magazynie.

## Decyzja dla aplikacji

**Integracja automatycznej dostawy OBI dla kodu użytkownika pozostaje niepotwierdzona.** Kwoty 12,99 zł i 13,99 zł nie zostają wpisane jako uniwersalna lub potwierdzona stawka dostawy. Zauważony próg darmowej dostawy również wymaga osobnych rzeczywistych przypadków; sam odczyt progu nie dowodzi ceny kolejnego koszyka.

Nie dodano tej obserwacji do rankingu pełnych koszyków ani do katalogu produkcyjnego. Nie złożono zamówienia, nie podano fikcyjnych danych osobowych i nie uruchomiono płatności. Pomocnik przeglądarkowy PID 44824 / sesja 75244 został zamknięty poprawnie; wcześniejsze pomocniki również zakończone.

Następny krok tej integracji wymaga potwierdzonego kanału wyceny, który wiąże rzeczywistą zawartość koszyka, usługę dostawy i kod pocztowy. Dostęp do feedu produktowego lub afiliacji sam w sobie tego nie zapewnia. To ograniczenie jednego sklepu; rozwój pozostałych ścieżek aplikacji może trwać.

## Konsekwencja biznesowa

Przed zwiększaniem ruchu priorytetem jest udział użytkowników uzyskujących kompletną, wiarygodną wycenę remontu. Rozwijać trzy zadania: malowanie, podłoga i hydroizolacja łazienki. Każde powinno prowadzić od wymiarów do ilości pełnych opakowań, właściwych zdjęć i wariantów, potwierdzonego kosztu dostawy oraz list na poszczególne sklepy.

Publiczne programy [Castoramy w Tradedoubler](https://directory.tradedoubler.com/pl/programs/383060-Castorama-Afiliacja) i [Leroy Merlin w VIVnetworks](https://www.vivnetworks.com/pl/affiliate-katalog/leroymerlin-pl/) odczytano ponownie 2026-11-01. Publikują odpowiednio CPS 4% i 6%; uczestnictwo aplikacji i warunki konkretnej umowy nie są potwierdzone. Ranking ma wynikać z kosztu i kompletności, niezależnie od prowizji.

Kolejność prac biznesowych pozostaje zgodna z [planem](./kierunek-biznesowy-i-walidacja-2026-11-01.md): ukończone zadanie i pomiar → rzeczywisty pilotaż → partnerstwa → test dostępnej płatnej wartości → pozyskiwanie o dodatniej marży. Płatność za jeden remont i abonament ekip są hipotezami do walidacji, a nie uruchomioną monetyzacją. Nie uruchomiono kontaktowania się z klientami, analityki, reklam ani płatności.

Dowody robocze: `G:/Projekty/asystent-remontu-work/wave183-20261101`, w szczególności `obi-postcode-q1-30001.json`, `obi-postcode-partial-address.json`, `obi-network-index.json` oraz zrzuty strony i koszyka. Nie publikować przechwyconych skryptów sklepów, nagłówków ani wartości kluczy klienta.
