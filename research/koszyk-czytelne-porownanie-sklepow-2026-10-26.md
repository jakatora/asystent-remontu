# Czytelne podsumowanie zakupów i sklepów — 2026-10-26

Cel: kupujący ma szybko zobaczyć koszt potrzebnego zestawu oraz kwoty materiałów i dostawy w każdym sklepie. Wcześniej lista wszystkich prac, instrukcja pustych dodatków, długa lista sieci i pełne pozycje sklepów zajmowały ekran przed podsumowaniem.

## Zmiana widoku

- Wybrane prace mają krótkie podsumowanie i przycisk „Zmień wybór prac”. Pusty koszyk pokazuje listę wyboru; po zaznaczeniu pierwszej pracy lista pozostaje otwarta, aby można było wybrać kolejne. Koszyk zawierający same dodatkowe produkty nie rozwija listy prac po odświeżeniu.
- Pusta sekcja dodatkowych materiałów zajmuje jeden przycisk „Dodaj produkt do koszyka”. Formularz, komunikaty błędów odczytu i zapisane pozycje zachowują pełną treść.
- Lista porównywanych sklepów jest rozwijana. Daty sprawdzenia cen pozostają widoczne.
- Karta każdego sklepu pokazuje sumę, materiały, dostawę oraz przewoźnika i podstawę wyceny. Zdjęcia, ilości opakowań i linki produktu są dostępne przez „Pokaż produkty”. Każda karta rozwija się niezależnie.
- Informacje o ręcznej weryfikacji ceny, minimalnym zamówieniu, wielokrotności partii oraz podwyżce/obniżce pozostają poza zwiniętymi szczegółami. Zmiana ceny zawiera nazwę produktu, aby można było ją rozpoznać także przy zamkniętej liście.
- Przy dostawie adresy punktów odbioru są dostępne pod przyciskiem; po przełączeniu na odbiór pokazują się domyślnie. Zachowano zastrzeżenia dotyczące lokalnej ceny, zapasu, odległości i dojazdu.

## Dostępność i kontrola pieniędzy

Rzeczywisty odczyt DOM wykazał, że same natywne `accessibilityState` nie przekazywały w podglądzie web zaznaczenia i rozwinięcia. Dodano jawne `aria-checked`, `aria-expanded` i stan zablokowanych checkboxów obok właściwości natywnych. Po zmianie rzeczywisty stan zaznaczonych trzech prac, Standard, Najtańszy zestaw i Dostawa do domu jest odczytywany poprawnie. Przyciski nowych sekcji mają minimum 48 px wysokości. Przy szerokości 375 px szerokość dokumentu i zawartości wynoszą po 375 px.

Ta zmiana nie modyfikuje formuł, cen, rankingu, zaokrąglania opakowań, kodu pocztowego, polityk dostawy ani kompletności koszyka. Nieznany fracht pozostaje nieznany; częściowa kwota nie jest pełnym kosztem. Backend nie został zmieniony ani ponownie wdrożony. Nie wykonano zakupów ani zamówień.

## Sprawdzenie w prawdziwej aplikacji

Przeglądarka: podgląd Expo na localhost:8082, desktop 1280 px i tymczasowy widok 375×812. Po teście przywrócono normalny rozmiar przeglądarki.

1. Stan kontrolny: trzy wcześniejsze prace, Standard, jedna posiadana pozycja, 00-001, dostawa do domu, bez preferowanego sklepu i dodatków. **637,43 zł materiałów + 153,40 zł dostaw = 790,83 zł**. Cztery karty sklepów mają te same kwoty przed i po rozwijaniu: Rab-Dom 91,44 zł, Realbud 112,84 zł, Sewera 79,31 zł, Zino 507,24 zł. Zachowano informację o pięciu sprawdzonych pełnych kombinacjach i innych kombinacjach/sklepach bez potwierdzonej wyceny. Nie jest to gwarancja globalnego minimum.
2. Rozwinięcie Rab-Dom pokazuje dwie pozycje, Realbud jedną; można otworzyć oba sklepy i zamknąć tylko jeden. Daty i suma pozostają widoczne. Rozwinięcie listy 37 porównywanych sklepów oraz listy siedmiu prac nie zmienia zaznaczenia lub ceny.
3. Własny dodatek testowy: 1 mb listwy Arbiton INDO, EAN 5905167725719. TopBoden wymaga partii 10 opakowań po 2,5 mb. Karta **przy zamkniętych produktach** pokazuje ograniczenie 25 mb oraz **319,80 + 29,99 = 349,79 zł**. Po otwarciu widoczna ilość 10×2,5 mb. Nie przedstawiono zapotrzebowania 1 mb jako możliwości zakupu jednej listwy.
4. Własny dodatek testowy: 2 umywalki Atlantic New 50, EAN 5901771226987. Dostawa Castoramy pozostaje bez pełnej wyceny, bez dopisanej stawki. Po wyborze odbioru: **316,00 zł**, dojazd wyłączony, cena sprawdzona ręcznie z datą ważności pozostaje widoczna przy zwiniętych produktach. Pełne odświeżenie zachowało dodatek i odbiór, a lista prac pozostała zamknięta. Nie potwierdzono tym lokalnego zapasu Castoramy.
5. Sewera: w dostawie adresy są zwinięte. Rozwinięcie pokazuje trzy najbliższe z siedmiu potwierdzonych adresów i orientacyjne odległości od Warszawy (00-001), wraz z linkami do map i danymi punktów. Po zamknięciu i przełączeniu na odbiór adresy pokazują się domyślnie. Kwota **539,53 zł za 4 z 5 produktów** pozostaje częściowa, Knauf 8,2 l z dwóch prac pozostaje jednym brakiem. Brak pełnej ceny jest wyraźny.
6. Usunięto wyłącznie własne dodatki i odtworzono dokładnie wcześniejsze trzy zaznaczenia. Pozostałe cztery prace nadal odznaczone. Stan końcowy: Standard, Najtańszy zestaw, dostawa do domu, 00-001, bez dodatków, jedna posiadana pozycja, **790,83 zł**. Nie tworzono ani usuwano projektów, nie zmieniano obmiarów.

Ostrzeżenia o rzeczywistej zmianie ceny oceniono w kodzie i istniejących testach historii; w tej kontroli nie wystąpiła nowa podwyżka/obniżka. Nie tworzono pozornej zmiany ceny w danych użytkownika. Przegląd dotyczy webowego podglądu Expo; nie wykonano nowego buildu binarek iOS/Android.

## Walidacja i dowody

**465 testów core/kalkulator/pricing/API PASS, 0 skip** z tej iteracji. Późniejsze poprawki dotyczyły jedynie układu i atrybutów dostępności; końcowy mobile typecheck i diff check PASS. Nie dodawano testów kopiujących układ JSX. Wspólny backend pozostaje bez zmian; nie powtarzano jego 1054 testów z wave34 i nie dodawano ich ponownie do liczby bieżących testów.

W katalogu rozmowy: `work/catalog-wave36-core-tests.log`, `work/catalog-wave36-ui-proof.json`, `outputs/catalog36-collapsed-desktop-20261026.txt`, `outputs/catalog36-lot-collapsed-20261026.txt`, `outputs/catalog36-lot-collapsed-20261026.png`, `outputs/catalog36-manual-price-collapsed-20261026.txt`, `outputs/catalog36-manual-price-collapsed-20261026.png`, `outputs/catalog36-pickup-addresses-20261026.txt`, `outputs/catalog36-mobile-top-20261026.png`, `outputs/catalog36-mobile-store-cards-20261026.png`, `outputs/catalog36-cost-overview-desktop-20261026.png`, `outputs/catalog36-basket-restored-20261026.txt`.

## Zakres pozostałej pracy

Ostatni odczyt katalogu produkcyjnego z wave34: **103 ze 109 referencji z co najmniej jedną ofertą**, 130 aktywnych ofert, 38 sklepów/punktów. To pokrycie obecnego katalogu, nie procent gotowości całej aplikacji i nie oferta każdego sklepu dla każdego produktu. Sześć historycznych modeli nadal wymaga oferty: Facile 50, Toledo 2,22, Diall PE 20, Petro Grey G2, Nati Bianco Struktura i stare Archi 80 lewe. Jawne alternatywy nie zamieniają tych braków w znalezione historyczne modele.

Cel nadal aktywny: rzeczywiste dostawy Castorama/OBI, komplet instalacji umywalki i zgodność kuchni, stare zapisane listy zakupów oraz dalszy rozwój lokalnych zakupów i porównania kompletnego zestawu. Ta iteracja poprawia obsługę, nie kończy całego celu.
