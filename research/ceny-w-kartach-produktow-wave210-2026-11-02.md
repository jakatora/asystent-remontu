# Ceny przy materiałach i narzędziach

Użytkownik 2 listopada 2026 potwierdził, że chce widzieć cenę w aplikacji, bez obowiązkowego otwierania sklepu. Wcześniejsze karty pokazywały tylko statyczne linki, część starych kwot orientacyjnych i datę przeglądu linków 2026-06-12. Nie były połączone z istniejącym odczytem bieżących ofert.

Widoki Koszt i Narzędzia używają teraz dokładnej tożsamości produktu oraz istniejącego API catalog-availability/refresh. Cena brutto w groszach, opakowanie, sklep, data i zmiana względem poprzedniego odczytu pochodzą z potwierdzonych odpowiedzi serwera. Przycisk zakupu jest osobny. Nie sumujemy tutaj dostawy ani całego remontu; służy do tego wspólny koszyk. Nie uznajemy dawnej kwoty referencyjnej za bieżącą cenę sklepu. Błąd, niedostępność i brak modelu pozostają widoczne.

Automatyczny odczyt ma współdzielenie duplikatów, dwa równoległe żądania, kolejkę maksymalnie20 oczekujących, krótką pamięć64wpisów/60sekund i15sekund po błędzie. Nie ma cyklicznego odpytywania ani trwałego zapisu ceny w telefonie. Serwer ponownie sprawdza jedynie przypięte karty produktu, z własnym60-sekundowym limitem. Samo otwarcie widoku nie zmienia projektu, ilości ani zamówień.

Ogólny pędzelek 50mm nie jest jednym modelem we wszystkich sklepach. Dla tej grupy pokazujemy jawny przykład Kraus A50 — pędzel angielski50mm, EAN5904178020035, jedna sztuka. Cztery dawne linki Diall/Dexter/LUX/Ninja nie dostają ceny tego modelu. Dobór do używanego preparatu pozostaje jawny, bez twierdzenia o zgodności ze wszystkimi gruntami. Nie dopisujemy pędzla automatycznie do remontu.

Źródła:

- https://sklep.sewera.pl/pedzel-angielski-50mm-kraus-p22518 — aktualna karta, EAN5904178020035, kodA50, producentKRAUS POLAND, SZT, fotografia.
- https://www.kraus.net.pl/pl/oferta/15-test.html — producent: pędzel angielski50/a50, naturalna szczecina do prostych prac malarskich; brak aktualnej ceny detalicznej.
- https://sklep.sewera.pl/kategorie/narzedzia/narzedzia-malarskie/pedzle-malarskie — katalog sklepu wiąże dokładną kartę.

Rzeczywisty odczyt natywny 2026-11-02T18:04:40.308Z:385gr brutto/szt, dostępny, bez podstawionej ceny; ten sam automat co produkcyjne oferty. ProducentHTTP200 potwierdza wariant50/a50. Dowody G:/Projekty/asystent-remontu-work/wave210-20261102/brush-primary-proof.json. To historyczny dowód tej chwili, nie cena wpisana na stałe. Ninja wSewerze ma stan0 i nie został dodany jako dostępna oferta.

Stan: kod w przygotowaniu, walidacja i wdrożenie jeszcze przed nami. WWWW209 powitanie i zdjęcia już działa, natywne sklepy nie mają jeszcze nowej binarki.
