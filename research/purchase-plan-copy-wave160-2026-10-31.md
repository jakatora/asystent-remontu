# Przenoszenie planu zakupów — 2026-10-31

Użytkownik może skopiować plan z porównania całego remontu lub wybranego sklepu. Kopia zawiera dokładne produkty, opakowania i ich liczby, linki HTTPS, podział na sklepy oraz wymagane osobne zamówienia. Pozwala przejść do zakupów i samodzielnie sprawdzić brakującą dostawę. Nie wykonuje kolejnego zapytania o ceny ani nie składa zamówienia.

## Znaczenie kwot

Generator purchaseListText korzysta z tego samego planu co ekran. Zachowuje partie zakupu, minimum opakowań, odcinki wykładziny, rabaty i zaokrąglenia uwzględnione przez koszyk. Nie przelicza rankingu ani cen sklepu. Nie łączy oddzielnych zamówień w jeden koszyk. Przy dostawie pokazuje podstawę krajową albo wskazany kod oraz czas sprawdzenia i wygaśnięcia.

Brak dostawy pozostaje „do potwierdzenia”; minimum transportu nie staje się rzeczywistą opłatą. Suma z dostawą jest kopiowana tylko przy zgodnych sumach i niewygasłych potwierdzeniach wszystkich sklepów. Termin ważności jest ponownie sprawdzany podczas kliknięcia, a nie tylko podczas renderowania. Wygaśnięcie, inny kod, przyszły czas lub wygasła ręczna weryfikacja oferty wyłączają potwierdzoną sumę. Materiały pozostają opisane jako kwoty według planu. Dostępna część niepełnego remontu ma wyraźne oznaczenie i sumę wyłącznie za tę część. Odbiór nie zawiera udawanej darmowej dostawy ani kosztu dojazdu.

Kopia nie zawiera twierdzenia o najtańszej ofercie całego rynku. Przy ograniczonym porównaniu zachowuje ostrzeżenie o innych możliwych wariantach. Po zmianie koszyka stara kopia znika z formularza. Schowek użytkownika zachowuje wcześniej skopiowany tekst, jak przy zwykłym kopiowaniu.

Na WWW działa schowek i pole tylko do odczytu do ręcznego zaznaczenia, także gdy dostęp do schowka jest zabroniony. Natywne aplikacje korzystają z istniejącego Share React Native; ten przebieg przeszedł kontrolę typów, ale nie był testowany na urządzeniu. Nie wysłano żadnych wiadomości i nie podłączano rozliczeń.

## Weryfikacja

445 testów aplikacji i 171 testów porównywania cen: PASS, 0 błędów i pominięć, również na czystym zatwierdzonym źródle. Siedem nowych testów obejmuje nieznane koszty, wygaśnięcie podczas kopiowania, podstawę krajową i inny kod, rzeczywiste zero, partie paletowe, osobne zamówienia, niepełną część, odbiór, EN i bezpieczne linki. Typy aplikacji PASS; 66 identyfikatorów prac zachowanych. Backend nie zmienił się, więc nie powtarzano jego testów 1064 z poprzedniej publikacji.

Playwright na nowym własnym profilu sprawdził wersję lokalną i publiczną. Bez podmieniania publicznych odpowiedzi cenowych potwierdził:

| Plan | Materiały | Dostawa | Potwierdzona całość |
|---|---:|---:|---:|
| MP75L: 40 worków Realbud + 1 Plus-Market | 1538,19 zł | 55,00 zł | 1593,19 zł |
| MP75L: 40 worków Realbud | 1499,20 zł | 0,00 zł | 1499,20 zł |
| Goldband: 1 worek Realbud | 50,54 zł | do potwierdzenia | brak |

Rzeczywisty schowek Windows odpowiada tekstowi pola po normalizacji CRLF/LF. Kliknięcie klawiaturą działa, a kopiowanie nie wywołuje nowego porównania. Zmiana ilości usuwa starą kopię. Kontrolowany błąd dotyczył wyłącznie możliwości zapisu schowka; dane sklepów pozostały rzeczywiste. Tekst pozostał dostępny do ręcznego kopiowania. Widok390px bez przepełnienia, językPL, izolacja przeglądarki, 0 błędów JS i429. Dowody: work/purchase-copy-{local,production}-qa-wave160.json.

Pierwszy lokalny test błędnie porównał systemowe CRLF ze znakami LF pola tekstowego. Poprawiono tylko oczekiwanie QA i formatowanie grupowania czterocyfrowej kwoty; kod aplikacji nie wymagał zmiany. Zachowano pierwotny runner i własny profil r1; końcowy lokalny r2 przeszedł. Dodatkowo generator sprawdzono na siedmiu zapisanych rzeczywistych koszykach z wave159, z czasem ustawionym na moment ich sprawdzenia. To regresja na zapisanym dowodzie, nie siedem nowych wycen dostawy.

## Publikacja i ograniczenia

Źródło53164093600a3c11f060fe7de3437127ceef68a3. WWW4bb14220-b58c-4fd7-9a8e-b325e0acad54 SUCCESS: [aplikacja](https://asystent-remontu-web-production.up.railway.app/renovation-basket). Zbudowano czysty checkout. Zweryfikowano63 SHA publicznych plików,17171381B,9 tras, WASM i nagłówki izolacji. Prywatne pliki404, niepodpisany relay401; brak76 kluczy vaulta w zasobach. Siedem plików serwera, konfiguracji i prywatnego adaptera identycznych bajtowo z wave159.

API pozostaje1d840f52-35a4-4e19-8545-98e6d13d2884, runtime500690270c9ed04d3211e0e0068582f5bc609b3e27960da1990ed2b8504fede7. Nie zmieniono katalogu, cen, taryf, kont ani wspólnego backendu. Aktualne odczyty health pokazywały194 produktów i290 ofert; nie potwierdza to dostawy wszystkich pozycji. Nie powtarzano bez nowej podstawy nieudanych prób eTak i ABUD. Ich poprzednie ograniczenia nie są uznane za naprawione. Stabilizacja integracji i uzupełnianie katalogu pozostają częścią aktywnego celu.
