# Knauf 30 kg: pojedyncze worki, palety i cały koszyk — 2026-10-31

Dodano trzy produkty ze zdjęciami i pięć ofert: Knauf MP 75 L 30 kg w Plus-Market i Realbud, Goldband 30 kg w Rab-Dom i Realbud oraz Rotband 30 kg w Realbud. Są odrębne od dotychczasowych worków 25 kg i innych rodzajów tynku. Nie zmieniono prac, obmiarów ani formuł. Cel pozostaje aktywny; ta publikacja nie kończy katalogu ani wszystkich integracji.

## Źródła i jednostki

Producent potwierdza GTIN oraz zawartość worka: [MP 75 L](https://knauf.com/pl-PL/p/produkt/knauf-mp-75-l-10257_0120), [Goldband](https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120), [Rotband](https://knauf.com/pl-PL/p/produkt/knauf-rotband-10001_0120) i [cennik producenta 2026 z tabelą GTIN](https://knauf.com/api/download-center/v1/assets/58b479fa-d45b-45f4-8c3e-dc92d4b237dd?country=pl&download=true).

| Oferta | GTIN | Native ID / SKU | Brutto za worek | Zakup |
|---|---|---|---:|---|
| [Realbud MP 75 L](https://realbud.com/Tynk-maszynowy-gipsowy-Knauf-MP75L-30-kg) | 5902367206451 | 6599 / 49221 | 37,48 zł | wielokrotność 40 worków |
| [Plus-Market MP 75 L](https://www.plus-market.pl/pl/p/Tynk-maszynowy-gipsowy-Knauf-MP-75-L-30-kg-lekki/15716) | 5902367206451 | 15716 / 5902367206451 | 38,99 zł | pojedyncze worki |
| [Realbud Goldband](https://realbud.com/Tynk-gipsowy-reczny-Knauf-GOLDBAND-30-kg) | 5902367206475 | 6645 / 10956 | 50,54 zł | pojedyncze worki, dostawa niepotwierdzona |
| [Rab-Dom Goldband](https://www.rabdom.pl/pl/p/Knauf-GOLDBAND-Reczny-tynk-gipsowy-30kg/2022) | 5902367206475 | 2022 / 0172 | 47,00 zł | pojedyncze worki |
| [Realbud Rotband](https://realbud.com/Tynk-gipsowy-reczny-KNAUF-ROTBAND-30-kg) | 5903240904075 | 6773 / 8493 | 75,00 zł | pojedyncze worki |

Weryfikacja natywnego koszyka ujawniła, że dodanie jednej sztuki MP 75 L w Realbud zmienia ilość na 40. Cena 37,48 zł dotyczy worka, a minimalny zakup kosztuje 1499,20 zł za 1200 kg. Oferta ma purchaseMultiple40; przy innych źródłach wynosi ona1. Sprawdzane są ID, GTIN, SKU, nazwa, masa30 kg, jednostka szt., natywne package i dane producenta. Plus-Market nie zwraca pola producenta, ale potwierdza dokładny GTIN, SKU, nazwę, masę i jednostkę. Nie dopisujemy fikcyjnego pola producenta do odpowiedzi.

## Rzeczywisty koszt całości

| Zestaw | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| 1 worek MP 75 L, Plus-Market | 38,99 zł | 55,00 zł | 93,99 zł |
| 40 worków MP 75 L, Realbud | 1499,20 zł | 0,00 zł | 1499,20 zł |
| Zapotrzebowanie1201 kg: 40 worków Realbud + 1 Plus-Market | 1538,19 zł | 55,00 zł | 1593,19 zł |
| 1 worek Goldband, Rab-Dom | 47,00 zł | 21,00 zł | 68,00 zł |
| Goldband + Primer G Pro1 l, Rab-Dom | 84,90 zł | 31,50 zł | 116,40 zł |
| 1 worek Rotband, Realbud | 75,00 zł | 25,00 zł | 100,00 zł |
| Po jednym worku trzech tynków, trzy sklepy | 160,99 zł | 101,00 zł | 261,99 zł |

Dla zapotrzebowania1201 kg dwie pełne palety Realbud kosztowałyby2998,40 zł. Porównanie znalazło tańszy zestaw40+1, dający1230 kg materiału. Pierwszy test UI błędnie oczekiwał80 worków; prawidłowy wynik aplikacji wykrył błąd oczekiwania. Zmieniono wyłącznie test i użyto nowego własnego profilu. Nie zmieniano algorytmu, żeby dopasować go do oczekiwania.

Wszystkie siedem wyników potwierdził końcowy publiczny interfejs, bez podmieniania odpowiedzi. Native HTTP obejmuje również80 worków oraz negatywne przypadki dostawy. Goldband Realbud i mieszany koszyk40MP75L+Betokontakt nie mają potwierdzonej metody; nie przypisujemy im0zł. Dowody: work/knauf-native-proof-wave159.json, knauf-cloud-before-web-proof-wave159.json i knauf-production-qa-wave159.json.

Metoda Realbud89 „Darmowa dostawa” jest uznawana tylko dla kompletnego jednoproduktowego koszyka MP75L, z dokładną ilością i sumami brutto, krajem Polska179 i wybraną płatnością Autopay3 bez dopłaty. Nie obejmuje odbioru, pobrania, transportu na zapytanie ani mieszanego koszyka. Zero musi pochodzić z jawnych zgodnych kwot metody i kraju, a suma końcowa musi być równa materiałom. [Warunki transportu Realbud](https://realbud.com/koszty-transportu) potwierdzają krajowy zakres promocji. Stawki są odczytywane z bieżącego pełnego koszyka; brak taryfy lub progu wpisanego na stałe. Wyceny tych trzech sklepów są jawnie oznaczone jako taryfa krajowa PL, a nie indywidualna wycena adresu.

## Testy i publikacja

Źródło:7c60d48d78f912ca2a9e3c4666eb1c788a24bc6f. [PR151](https://github.com/jakatora/przetargai/pull/151) scalony jako fc326725035132a451e4472e2fa494824973959a. API 1d840f52-35a4-4e19-8545-98e6d13d2884 SUCCESS, WWW 1a84daf0-cadb-49a4-b37c-493053bd766b SUCCESS. SHA modułu 500690270c9ed04d3211e0e0068582f5bc609b3e27960da1990ed2b8504fede7. Wszystkie150 plików serwera identyczne z przygotowaną publikacją; zmieniono tylko moduł Remont i seed,148 innych zachowano. Seed325 obserwacji zachowuje poprzednie320. Najpierw opublikowano API, sprawdzono cztery rzeczywiste koszyki w chmurze, potem udostępniono nowe produkty w WWW.

86 testów adapterów,438 aplikacji,171 porównywania cen i1064 wspólnego backendu przeszły bez błędów i pominięć. Zestawy86/438/171 ponowiono na czystym zatwierdzonym źródle. Kontrole typów API i aplikacji poprawne; zachowano66 identyfikatorów prac. Błędy początkowego przygotowania runnerów dotyczyły ścieżek zainstalowanych narzędzi i NODE_PATH; logi zachowano, źródła produkcyjne nie były zmieniane, żeby ukryć te błędy. Czysty projekt wymagał zbudowania deklaracji pricing-service przed API typecheck.

Publiczny QA:3 zdjęcia załadowane, widok390px bez przepełnienia, językPL, izolacja przeglądarki, brak błędów JS i429, zachowanie3 pozycji po30 kg i kodu30-001 po odświeżeniu. Sprawdzono63 SHA publicznych plików,9 tras iWASM, pliki prywatne404 i niepodpisany relay401. Porównanie z76 kluczami vaulta bez wycieku. Audyt227 referencji:194 z niewygasłymi obserwacjami cen,290 aktywnych ofert, brak pominięć i fałszywych dopasowań;213 wierszy snapshotu i4 SKU bezEAN. Obserwacja ceny nie jest potwierdzeniem dostawy. Starsze33 referencje nadal bez potwierdzonej ceny.

## Ograniczenia wykryte podczas kontroli

Po uruchomieniu nowego kontenera WWW ponowna kontrola eTak nie potwierdziła dostępu do sklepu. Odrębny GET z kontenera zakończył się błędem połączenia; rzeczywisty publiczny odczyt i wycena zwróciły quote_unavailable, bez potwierdzonego koszyka. To nieudany test zgodności, a nie wynik zielony. Aplikacja zachowuje nieznaną dostawę. Nie wpisano stałej kwoty ani nie osłabiono kontroli ceny. Dowody: work/etak-public-compatibility-wave159.json i etak-web-network-wave159.json. Nowe koszyki Knauf pozostają potwierdzone produkcyjnie. Ograniczenie ABUD z wave158 nie otrzymało nowego pozytywnego potwierdzenia.

Odrzucono błędne dopasowania taśm HIPPER: kody5907810197980/7997 są według [producenta Sila](https://sila.com.pl/wp-content/uploads/2023/09/Tasmy.pdf) produktami Sila/PSB, mimo etykiety Norgips w sklepie. Nie łączono ich z istniejącymi GTIN Norgips. MP7525 iMP75L25 w LiderzyCen mają obecnie pusty EAN w API i HTML, tylko SKU ctma z cyframi kodu. Nie zamieniono SKU na potwierdzony GTIN. Żadnego z tych wpisów nie dodano na podstawie samego wyniku wyszukiwania.

Cel pozostaje aktywny: katalog, stabilne dane sklepów, wycena dostawy, historia zmian cen i prostota zakupu wymagają dalszego rozwoju.
