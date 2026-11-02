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


## Wdrożono 2026-11-02T18:24:51.204Z

Źródło62952f791819c2a2a03218c11baac6086ad881ae, API3368c1bd-e8d7-4be1-9e88-dc04070d4eb7, WWW11e46afb-2472-46ae-868f-3cabbe3b4a58, obaSUCCESS. PR189 mergedc219c5b00870fac00306c86edde15a3b681ad6bf. Czyste604mobile/252pricing/190APIlib/1064shared PASS,0fail/skip; typy/build i66legacy PASS. Zestawy zachodzą na siebie — nie sumujemy ich jako unikalnych testów. LokalnaCUA10sprawdzeń i publicznaCUA9sprawdzeń PASS; widoczne ceny5materiałów oraz pędzla, zdjęcia, opakowania, daty, odświeżenie w aplikacji i jawne brakujące wyceny.320px sprawdzono lokalnie, publiczny rzeczywisty viewport1743px. Wszystkie63publiczne zasoby mają zgodneSHA. Lokalnie3rzeczywiste podpisane wyceny i1odczyt natywny, po wdrożeniu6kart aktualnych cen przez klienta aplikacji i4przypadki pełnych koszyków PASS. Malowanie35636gr z4890gr dostawy; długie profile nadal z jawną indywidualną wyceną transportu. Nie podstawiano cen ani dostaw.

150plików API zgodnych z paczką,149pozostałych i385seed zachowanych. Cache382→383, wszystkie wcześniejsze obserwacje są obecne lub nowsze. Historia16655→16966;42usunięć wyjaśnionych retencją,0niewyjaśnionych strat.5obcychWIP ma niezmienione hashe. DowodyG:/Projekty/asystent-remontu-work/wave210-20261102/release-proof.json i production-cua-qa.json; prawdziwy zrzut production-brush-price.jpg.

To nie jest komplet cen wszystkich narzędzi: szpachelka i klocek bez dokładnego modelu pozostają jawnie niepotwierdzone. Stare linki nie dostały fikcyjnych kwot. Nowa binarka1.2.1(11) powstaje osobno ze źródłafeff7c1 iCI446e5ae, bez zmieniania istniejącego zgłoszeniaApple1.2.0(10). Narzędziecelu zwróciłoPAUSED, nie zmieniano tego statusu; wykonano bieżące jawne zlecenia użytkownika.
