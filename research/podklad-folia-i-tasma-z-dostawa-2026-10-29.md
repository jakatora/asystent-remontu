# Podkład, folia i taśma — stan na 2026-10-29

Rozwijamy cały zestaw do przygotowania podłogi pod panele laminowane. Użytkownik wybiera konkretny podkład i zgodną barierę, podaje faktyczny obmiar folii oraz taśmy i widzi pełne opakowania z dostawą. Cel rozwoju całej aplikacji pozostaje aktywny.

## Zachowanie aplikacji

- Zachowano job `underlay-install`, pomiar `floorArea` oraz material IDs `underlay`, `vapor-barrier`, `adhesive-tape`. Materiały nadal mają jednolity format legacy. Model ilości: `underlay-install-v1`.
- Wybór Volden XPS Smart 3 mm / 10 m² albo Arbiton Secura Thermo Aquastop Smart 1,6 mm / 6 m² nie zmienia się przy przełączeniu poziomu cen. Zgodność podłogi, podłoża i ogrzewania sprawdza użytkownik według instrukcji konkretnego systemu.
- Dla podkładu 3 w 1 nie doliczamy drugiej folii. Dla osobnej folii można wybrać Conpar 100 m², Ecovil P 100 m² lub Aquaprotec 10 m² albo jawnie wskazać brak konieczności zakupu.
- Powierzchnia folii zawiera rzeczywiste zakłady i wywinięcia. Musi być co najmniej równa powierzchni podłogi. Nie powiększamy jej drugi raz o zapas podkładu. Taśma ma osobny pomiar w metrach; świadome 0 oznacza brak zakupu dodatkowej rolki.
- Kreator i edytor ukrywają niepotrzebne pola. Zmiana produktu zeruje potwierdzenie zgodności. Nieustalone dane nie stają się darmowym kompletnym zestawem.
- Stare i uszkodzone obliczenia wymagają ponownego sprawdzenia. Za małe, niepasujące lub historyczne pozycje „Mam” / „Kupione” nie mogą usunąć aktualnego zapotrzebowania. Wspólny koszyk sumuje surowe ilości przed doborem opakowań.

## Produkty, zdjęcia i źródła

Nowa referencja: `mat-vapor-foil-arbiton-aquaprotec-10m2`, EAN 5905167875223, Arbiton Aquaprotec Vapour Barrier, 0,18 mm, 10 × 1 m = 10 m², SD > 150 m. Cena zwykła TopBoden: 49 zł za rolkę. Zdjęcie rzeczywistego produktu wyświetlono i obejrzano w aplikacji.

- [Karta Aquaprotec w TopBoden](https://topboden.pl/podklad-pod-panele/aquaprotec-vapour-barrier-energy-saving-flooring-system-folia-paroizolacyjna)
- [Zdjęcie Aquaprotec](https://topboden.pl/media/cache/gallery/photos/webp/5905167875223_P_01.webp)
- [Katalog producenta Arbiton 2025](https://arbiton.com/content/uploads/ARBITON-underlayments-2025.pdf), strona PDF 49: Aquaprotec; strona 51: akcesoria.
- [Instrukcja systemu producenta](https://pim.decora.pl/files/gHiJ3PFoVKBHE5Ep.pdf)

Aquaprotec 0,18 mm nie jest automatycznie zamiennikiem folii wymaganej jako minimum 0,20 mm. Nie utożsamiamy tolerancji, różnych EAN ani zastosowań do laminatu, winylu, podłogi klejonej lub ogrzewania elektrycznego. Folia nie osusza mokrego podłoża.

Drugie nowe źródło dla istniejącej taśmy Arbiton Izo Floor Tape 50 mm × 25 m, EAN 5905167698778: [TopBoden](https://topboden.pl/podklad-pod-panele/arbiton-izo-floor-tape-50mmx25m), zwykła cena 28,91 zł za rolkę. To dodatkowa oferta tej samej referencji, nie kolejny unikalny produkt.

Adapter wiąże EAN, UUID, jednostkę bazową, zamówieniową, przelicznik i cenę całego opakowania. Folia jest natywnie wyceniana za m², rolka ma 10 m²; taśma natywnie jest sztuką, mimo zapotrzebowania w metrach. Nie mnożymy 25 razy ceny ani stanu magazynowego taśmy. Dopuszczenie jawnej ceny zwykłej przy opcjonalnym EXTRA20 ograniczono do dokładnie sprawdzonych produktów. Nie importujemy ceny kuponowej, upominków ani niepotwierdzonej promocji.

## Dowód rzeczywistych kwot brutto

Anonimowy koszyk TopBoden w przeglądarce: jedna rolka folii 49 zł i jedna rolka taśmy 28,91 zł, produkty 77,91 zł + kurier 39,99 zł = **117,90 zł**. Opcjonalny kupon usunięto. Nie składano zamówienia, nie podawano danych klienta ani nie akceptowano warunków zakupu.

12 przypadków rzeczywistego API produkcyjnego zapisano w `work/catalog-wave76-production-raw.json` i sprawdzono w `work/catalog-wave76-production-proof.json` w katalogu pomocniczym. Kwoty dotyczą odczytów 2026-10-29, nie gwarancji cen przyszłych.

| Zestaw | Materiały | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Folia 10 m² + taśma 25 m w TopBoden | 77,91 zł | 39,99 zł | 117,90 zł |
| Folia 20 m² + taśma 25 m w TopBoden | 126,91 zł | 39,99 zł | 166,90 zł |
| Podłoga 10 m²: podkład 11 m², folia 12 m², taśma 7 m | 252,45 zł | 61,99 zł | **314,44 zł** |
| Dwa takie pomieszczenia we wspólnym koszyku | 372,51 zł | 68,98 zł | **441,49 zł** |
| Podkład bez zakupu folii i dodatkowej taśmy | 142,12 zł | 20,00 zł | 162,12 zł |

Pełny zestaw 314,44 zł: LiderzyCen 154,45 zł materiałów + 22 zł dostawy, TopBoden 98 zł folii + 39,99 zł dostawy. Alternatywa z taśmą również w TopBoden kosztuje 329,02 zł. Dwa pomieszczenia wymagają łącznie 3 opakowań podkładu, 3 rolek folii i 1 rolki taśmy, zamiast dwukrotnego zaokrąglania osobnych prac. Oszczędność względem dwóch oddzielnych zestawów: 187,39 zł.

Sprawdzono także inny kod 42-209, wybór Conpar i Ecovil, brak zgodności, za mały obmiar folii oraz wybrany sklep oferujący tylko część zestawu. TopBoden zwraca aktualną taryfę krajową dla Polski, nie indywidualną wycenę adresu. Podstawę pokazujemy przy dostawie, ważność 10 minut.

Ograniczenie: podkład Arbiton 3 w 1 ma potwierdzoną cenę produktów 123,96 zł za 2 opakowania po 6 m² w Kronodom, ale automatyczna dostawa Kronodom nie jest jeszcze zintegrowana. Łączna kwota pozostaje nieustalona. Kwota „od” z karty produktu nie może zastąpić wyceny koszyka. To kolejny konkretny etap rozwoju.

## Walidacja i wydanie

- 764 testy rdzenia i 1054 testy współdzielonego backendu: 0 błędów, 0 pominiętych. Końcowy typecheck mobile i API: PASS.
- Rzeczywisty kreator, edycja, blokada folii 9 m² przy podłodze 10 m², zdjęcie rolki, pełny koszt 314,44 zł i jawny brak dostawy wariantu 3 w 1 sprawdzone w przeglądarce. Własny projekt QA `proj_mvss3izb0i9m37n4o` przywrócono po próbach do pełnego zestawu 10 / 12 / 7. Pozostałe projekty nietknięte.
- Negatywne próby walidatora legacy wykryły usunięcie ID, eksportu i pusty rejestr. Stabilne ID i migracje 001–014 zachowane.
- Backend [PR76](https://github.com/jakatora/przetargai/pull/76) merged, head `70d4e32678173ffbb37d658d261d1494c5c87429`, main `d5f878691547c6942d17d761a41ea228d493ed93`. Railway `40d13224-193c-4a76-8117-80de65f4727c`: SUCCESS. Wszystkie 148 plików wdrożenia zgodne z przejrzanym wydaniem. 146 plików poza bundle i seedem oraz 217 wcześniejszych obserwacji zachowano; dodano 2 obserwacje.
- Katalog: 172 referencje, 165 aktywnych produktów, 213 ofert, 219 źródeł, 49 aktywnych kanałów, każda referencja ma przypisane zdjęcie. Pozostaje 7 historycznych referencji bez aktualnej oferty.
- Ten sam audyt 65 starych map pomiarów: 81/251 wymagań wycenionych, 170 nierozwiązanych (100 bez zapytania, 69 bez produktu, 1 bez oferty), 11 kompletnych scenariuszy. Nie oznacza to 170 unikalnych brakujących produktów. Stare założenia podkładu wymagają teraz faktycznego doboru i obmiaru, dlatego pokrycie nie jest sztucznie podtrzymywane domyślnymi danymi. Nowy pełny zestaw potwierdzono osobno.

Przegląd ścieżki pieniędzy: kwoty pochodzą z konkretnych opakowań i aktualnych koszyków/taryf; nie doliczamy dwa razy zapasu, nie pomijamy transportu i nie zapisujemy kuponu jako zwykłej ceny. Brak wyceny nie staje się zerem. Dowód obejmuje działające API i zwykły koszyk sklepu, nie tylko testy jednostkowe. Nie zmieniano płatności, webhooków ani przepływów Stripe.
