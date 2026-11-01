# Asystent Remontu — kierunek biznesowy, 2026-11-01

Rekomendacja po pytaniu właściciela „co zrobiłbyś, gdybyś budował tę aplikację dla siebie i chciał na niej zarabiać?”. To plan i hipotezy do sprawdzenia, nie wyniki badań klientów ani uruchomiona monetyzacja.

## Obietnica i pierwszy klient

„Kiedy przygotowuję zakupy do remontu mieszkania, chcę zebrać komplet właściwych materiałów i sprawdzić koszt z dostawą, żeby zmieścić się w budżecie i uniknąć kolejnego wyjazdu po braki”.

Pierwsza grupa do pilotażu: osoby samodzielnie organizujące zakupy do remontu mieszkania, zaczynające od malowania, podłogi lub hydroizolacji łazienki. Trzy kompletne ścieżki mają pierwszeństwo przed dodawaniem kolejnych kategorii. Osobny pilotaż wykonawców pozwoli sprawdzić częstsze użycie i abonament.

Funkcjonalny cel: właściwe ilości, zgodne warianty, pełne opakowania, dostępność i rzeczywisty transport. Emocjonalny: spokój i poczucie kontroli nad wydatkami. Społeczny: uzgodniona lista z partnerem lub wykonawcą. Dwa ostatnie wymiary są hipotezami wymagającymi rozmów.

Konkurencją są również arkusz, kartka, lista wykonawcy, zakupy wszystkiego w znajomym sklepie oraz odłożenie remontu. Hipotezy czterech sił: frustracja dodatkowymi kosztami i brakami; korzyść z pełnego planu; obawa o błędne dopasowanie i nieaktualną cenę; przyzwyczajenie do lokalnej hurtowni. Nie traktować tego zestawienia jako potwierdzonych wypowiedzi klientów.

Ocena walidacji według jobs-to-be-done: **3/10**, nie ocena jakości aplikacji. Są sformułowanie zadania bez nazwy produktu, mapa alternatyw i punkt za opis zadania niezależny od rozwiązania. Brakuje dowodów z wywiadów na cztery siły i wymiary emocjonalny/społeczny, odrębnego pomiaru pierwszej i ponownej wartości oraz udokumentowanego powiązania każdej propozycji rozwoju z zadaniem klienta.

## Produkt, który dowozi zakup

1. Start od zamiaru i wymiarów. Pierwsza kompletna lista bez obowiązkowego konta; cel pilotażu do 90 sekund jest hipotezą, nie zmierzonym wynikiem.
2. Jeden wynik: produkty + transport + suma, obok dopłata za jeden sklep, brakujące pozycje i czas sprawdzenia. Istniejący wybór koszyka wielosklepowego/jednego sklepu zachować.
3. Pokaż właściwe zdjęcie, model, wielkość opakowania, ile kupić i ile zostanie. Audyt produkcyjny wave177 z 2026-11-01 20:24:48 UTC: 239 referencji, 207 z potwierdzonymi ofertami, 32 braki (307 ofert). Potwierdzona oferta produktu nie oznacza potwierdzonej dostawy każdego koszyka. Te liczby nie dowodzą kompletności dowolnego remontu.
4. Dokończ drogę do zakupów: lista na sklep, link do konkretnego produktu, oznaczenie kupione, ponowne przeliczenie pozostałych potrzeb. Bez deklarowania automatycznego przekazania całego koszyka, dopóki sklep tego rzeczywiście nie umożliwia.
5. Rozwijaj współdzielenie i kontrolę faktycznych wydatków po potwierdzeniu użyteczności w pilotażu. Zachowaj backup i lokalne projekty.

## Pomiar wartości i kosztów

Odczyt kodu 2026-11-01 nie znalazł instrumentacji `logEvent`, `trackEvent`, `firebase/analytics`, `outbound_click`, `affiliate_click` w aktywnych źródłach mobile/lib. Nie jest to dowód braku użytkowników lub jakiejkolwiek analityki poza tym kodem. Nie uruchomiono nowego śledzenia w ramach tej oceny.

Do zaprojektowania minimalny lejek: rozpoczęcie remontu → zapisana lista → pierwsza pełna potwierdzona wycena → wybór planu → przejście do sklepu → potwierdzony zakup. Kliknięcie i oznaczenie „kupione” nie są dowodem opłaconego zamówienia. Rozliczenie afiliacyjne wymaga potwierdzenia od partnera.

Mierzyć osobno: czas do pierwszej użytecznej listy; udział koszyków z pełną wyceną; rezygnacje przy dostawie; p50/p95 czasu wyceny; liczbę błędów i połączeń do sklepów; koszt jednej wyceny; powrót do kolejnego etapu aktywnego remontu; zatwierdzone prowizje i przychód po kosztach pozyskania, obsługi oraz infrastruktury. Codzienny powrót nie jest właściwym warunkiem sukcesu dla okazjonalnego remontu. Nie wysyłać do analityki adresu, surowego kodu pocztowego, obmiarów ani danych projektu bez uzasadnionej potrzeby.

Przed zwiększeniem ruchu uzyskać stabilne źródła danych i warunki dostępu: feedy/API partnerów dla produktów oraz rzeczywiste źródło wyceny dostawy. Zachować ograniczenia liczby zapytań i ważności ofert, obserwować kolejki oraz błędy sklepów przy kilku równoczesnych klientach. Pomiar jednego koszyka nie dowodzi gotowości na duży ruch. Skalowanie powinno opierać się na p95, pokryciu wycen i koszcie obsługi aktywnego remontu.

## Model przychodów

- **Najpierw afiliacja**, po akceptacji aplikacji przez partnerów i sprawdzeniu feedów, atrybucji oraz warunków publikacji. Podstawowe porównanie bez opłaty; jasne oznaczenie linku partnerskiego. Cena z dostawą i kompletność rozstrzygają ranking, prowizja nie może zmieniać kolejności ofert.
- **Dla klienta indywidualnego** test jednorazowego pakietu na remont, np. 49–99 zł za zakres rzeczywiście wykraczający poza darmową wersję: współpraca, kontrola wydatków, raport. To hipoteza cenowa. Nie pobierać pieniędzy za jeszcze niedostępną funkcję i nie obciążać odnawialnym abonamentem bez sprawdzenia potrzeby ponawiania użycia.
- **Dla wykonawcy** osobny płatny pilotaż: wiele remontów, listy dla ekip i klientów, powtarzalne zestawy, raporty. Przykładowe 49–99 zł/mies. to punkt do testowania gotowości do zapłaty, nie wdrożona cena.

Sprawdzone publiczne źródła 2026-11-01:

- [Castorama w Tradedoubler](https://directory.tradedoubler.com/pl/programs/383060-Castorama-Afiliacja): publiczne CPS 4%, porównywarki i aplikacje mobilne dopuszczone; deeplinki i feed produktowy; cookie 4 dni, okres oczekiwania 70 dni. Przyjęcie wydawcy i obowiązujące warunki trzeba potwierdzić przed integracją. Nie traktować naliczonej oczekującej prowizji jako dostępnej gotówki.
- [Leroy Merlin w VIVnetworks/CJ](https://www.vivnetworks.com/pl/affiliate-katalog/leroymerlin-pl/): publiczne 6%, cookie 30 dni, XML feed i S2S. Nie zakładać identycznych zasad dla każdego źródła ruchu ani dostępności umowy bez akceptacji. Tabela SEM jest wewnętrznie sprzeczna, więc nie podejmować kampanii brandowych na jej podstawie.
- Feed produktów i umowa afiliacyjna same w sobie nie potwierdzają ceny transportu dla kodu pocztowego. Aktualne ograniczenia dostawy Castoramy/OBI pozostają jawne; nie zastępować ich pozornym zerem.

Przychód zależy od zatwierdzonych kwalifikujących się zakupów, podstawy prowizji i indywidualnych warunków. Nie mnożyć instalacji przez stawkę prowizji. Nie aktywowano rozliczeń, kont partnerskich, płatnych reklam ani wiadomości do sklepów.

## Pierwsze 30 dni do sprawdzenia z klientami

| Termin | Praca | Dowód do zebrania |
| --- | --- | --- |
| 2026-11-02–2026-11-08 | 10 rozmów o ostatnich rzeczywistych zakupach; 5 obserwowanych testów zadania; specyfikacja i uruchomienie minimalnego pomiaru | Gdzie były braki, niepewność, nadmiar opakowań i nieoczekiwany transport; samodzielnie ukończone zadania |
| 2026-11-09–2026-11-15 | Domknięcie trzech wybranych ścieżek i problemów ujawnionych w testach; pomiar szybkości i kosztu wyceny | Kompletna lista i potwierdzona suma dla prawdziwych koszyków; brak pogorszenia innych sklepów |
| 2026-11-16–2026-11-22 | Przygotowanie zgłoszeń afiliacyjnych; treści odpowiadające konkretnym remontom; mały pilotaż pozyskania | Pochodzenie użytkownika → ukończony koszyk → przejście do sklepu; zasady i dostęp do danych partnera |
| 2026-11-23–2026-12-01 | Pilotaż płatnej wartości z osobami po pierwszym użyciu i małymi ekipami | Rzeczywista zapłata za dostępny zakres, koszt obsługi, powrót do kolejnego etapu |

Przed zwiększaniem wydatków na pozyskanie proponowane minimum dowodów: 20 rzeczywistych remontów w pilotażu, 10 samodzielnie ukończonych pełnych porównań i 5 potwierdzonych zakupów. Dla abonamentu osobny test co najmniej 3 płacących ekip. To wstępne bramki decyzyjne, nie prognoza konwersji ani dane obecnych klientów.

Rozmowy i pilotaż wymagają rzeczywistych uczestników. Automatyczne scenariusze QA nie zastępują badania klientów. Niniejszy plan nie uruchamia kontaktowania się z osobami trzecimi ani przyjmowania opłat.

Kolejność inwestycji: pomiar i rozmowy → zaufanie oraz prostota trzech ścieżek → partnerstwa i zatwierdzone zakupy → test płatnej wartości → skalowanie kanału o dodatniej marży. Obecny stały cel rozwoju pozostaje aktywny.

## Decyzja właścicielska po wave177 — 2026-11-01

Gdybym finansował tę aplikację sam, traktowałbym ukończone, wiarygodnie wycenione zakupy jako główny wynik produktu. Liczba produktów, sklepów i instalacji jest pomocnicza. Rozwój katalogu trwa, ale priorytet mają brakujące materiały potrzebne do ukończenia wybranego zadania oraz sklepy pozwalające faktycznie kupić je z dostawą.

Obecny dowód techniczny: [wave177](./dodatkowe-opakowania-i-dostawa-wave177-2026-11-01.md) potwierdził w publicznym scenariuszu QA pełny testowy remont za 2712,10 zł i świadomie wybraną nadwyżkę obniżającą sumę do 2684,99 zł. Są to ceny z konkretnego testu, nie oszczędność klienta ani obietnica dla kolejnego remontu. Osiem sklepów w tym przykładzie pokazuje także potrzebę przedstawienia kosztu wygody: pełnego wariantu jednosklepowego, a docelowo ograniczenia liczby sklepów, gdy uda się potwierdzić taki zestaw.

Pierwsza odpowiedź tego publicznego scenariusza trwała około 37 s. Odrębny lokalny zimny pomiar wykazał 449 żądań do sklepów, łącznie z odświeżaniem cen. Limit 80 wycen koszyków nie jest limitem liczby HTTP. Nie ekstrapolować tych pojedynczych obserwacji na p95 ani gotowość na dużą liczbę klientów. Przed zakupem większego ruchu mierzyć p50/p95, udział kompletnych wycen, błędy, 429 i koszt jednej ukończonej wyceny; optymalizować powtórzone żądania i współdzielenie nadal ważnych danych bez mieszania kodów pocztowych, wariantów, ilości lub krajów. Próby obciążeniowe wykonywać na odtworzonych odpowiedziach; rzeczywiste sklepy sprawdzać ograniczonymi próbami, bez generowania zamówień.

| Decyzja | Co musi być prawdą, zanim wydam więcej |
| --- | --- |
| Szerszy katalog | Nowa pozycja usuwa brak w rzeczywistym zadaniu; model, opakowanie, zdjęcie, dostępność i możliwość zakupu są potwierdzone |
| Płatne pozyskanie | Pilotaż pokazuje samodzielne ukończenie wyceny i zakup; znam koszt wyceny, obsługi i pozyskania względem zatwierdzonego przychodu |
| Afiliacja | Partner przyjął aplikację, ustalone są dane i atrybucja; prowizja nie wpływa na ranking, link jest oznaczony |
| Pakiet jednorazowy | Klient płaci za dostępny dodatkowy efekt, np. współpracę lub kontrolę wydatków; 49–99 zł pozostaje hipotezą |
| Abonament ekip | Co najmniej trzy ekipy płacą w osobnym pilotażu i wracają przy kolejnych realizacjach |

Przychód oceniać po zatwierdzeniu zakupów, zwrotach i kosztach; instalacje oraz kliknięcia nie są sprzedażą. Stawkę programu stosować wyłącznie do podstawy i transakcji kwalifikujących się według umowy. Publiczne programy Castoramy i Leroy Merlin odczytano ponownie 2026-11-01; sama ich obecność nie potwierdza uczestnictwa aplikacji ani źródła wyceny transportu.

Ocena rozpoznania potrzeb klientów pozostaje **3/10**. Do poprawy są konkretne braki diagnostyki JTBD: potwierdzenie czterech sił decyzji na podstawie zakupów, dowody wymiaru emocjonalnego i społecznego, osobny pomiar pierwszego użycia i powrotu, powiązanie propozycji funkcji z zadaniem oraz wywiady rekonstruujące rzeczywisty zakup. Rozmowy i gotowość do zapłaty nie zostały zastąpione testami technicznymi.
