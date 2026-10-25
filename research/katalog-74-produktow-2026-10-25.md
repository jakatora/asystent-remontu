# Katalog 74/103 — Betterial i warunki odbioru — 2026-10-25

## Potwierdzony zakres

Produkcja ma 74 ze 103 produktów z ofertami, 29 brakujących, 100 aktywnych ofert z 32 sklepów. Zdjęcia przypisano wszystkim 103 referencjom. Automatycznych integracji dostawy nadal jest 17: Betterial nie udostępnił wiążącej automatycznej stawki transportu. Pełny cel użytkownika pozostaje aktywny.

Nowy produkt: Atlas Stopter K-20, EAN 5905400160253, worek 25 kg, Betterial. Cena w głównej karcie i rzeczywistym anonimowym koszyku: **52,55 zł brutto za worek**, zamówienia w partiach po **42 worki**. Jedna partia to 1 050 kg i **2 207,10 zł materiałów**. To nie cena całego zamówienia z transportem.

Źródła tożsamości i opakowania:

- https://betterial.pl/kleje-do-styropianu/8679-atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.html
- https://www.grupapsb.com.pl/produkt/zaprawa-klejaca-do-styropianu-i-xps-oraz-do-zatapiania-siatki-25-kg-stopter-k-20-atlas-5905400160253.html
- https://betterial.pl/content/4-transport

Zdjęcie z głównej karty: https://betterial.pl/52078-product_main_2x/atlas-zaprawa-klejaca-do-styropianu-stopter-k-20.jpg

## Cena, dostawa i odbiór

Nowy czytnik wiąże wybraną kombinację 3816 z produktem 8679, SKU 8679-86310, EAN, wariantem 25 kg, ceną brutto PLN oraz partią 42. Potwierdza cenę widoczną, rekord wariantu i Product/Offer JSON-LD. Zmiana ilości minimalnej, paczki, producenta, SKU lub jednostki przerywa import. Cena nie pochodzi z wyników wyszukiwania.

Natywny koszyk potwierdził 42 worki za 2 207,10 zł i „Wysyłka do wyceny”. Sklep deklaruje odbiór bez opłaty dopiero po uzgodnieniu miejsca i terminu. Sam adres firmy w Bydgoszczy nie jest potwierdzonym miejscem odbioru.

Dlatego źródło ma pickupRequiresConfirmation, a backend pomija je w rankingu własnego odbioru. Przy dostawie cena materiałów jest widoczna, ale koszt transportu i pełna suma pozostają nieznane. Powód retailer_transport_quote_required ma czytelny komunikat i link do warunków sklepu. UI pokazuje osobne ostrzeżenie o uzgodnieniu odbioru. Nie utworzono zamówienia, konta, płatności ani zapytania do sprzedawcy, nie podano danych osobowych i nie zaakceptowano regulaminu. Własny koszyk opróżniono, stan 0 produktów potwierdzono po załadowaniu, karta zamknięta.

## Weryfikacja

- 304 testy logiki/API/mobile, 20 testów seedów i 1 054 testy wspólnego backendu: PASS, zero pominięć. Pełny zestaw backendu początkowo nie miał sąsiednich pakietów mobile/firebase w katalogu snapshotu; po dodaniu junctionów do istniejącego źródłowego checkoutu pełny przebieg przeszedł. Nie zmieniono cudzych testów ani kodu tych aplikacji.
- Typecheck API i mobile oraz walidacja identyfikatorów prac: PASS.
- Trzy nowe źródłowe URL (karta, warunki transportu, zdjęcie) zwróciły HTTP 200. Ponowny rzeczywisty odczyt ceny 2026-10-25T22:46:55.427Z potwierdził 52,55 zł/op.
- Rzeczywisty HTTP lokalnego bundla i wdrożenia: zapotrzebowanie 25 kg, 300 + 700 kg z dwóch prac i 1 050 kg daje 42 worki i 2 207,10 zł. 1 051 kg daje 84 worki i 4 414,20 zł. Dostawa nie staje się zerem. Odbiór pozostaje bez potwierdzonej oferty.
- Wszystkie 103 referencje zachowano: 74 rozpoznane, 29 bez ofert, bez pełnej sumy. Dotychczasowy koszyk trzech prac nadal 790,83 zł. Health 200, auth/me 401. Nowe źródło na produkcji active=true, error=null, odczyt 2026-10-25T22:42:11.447Z.

Backend PR22 https://github.com/jakatora/przetargai/pull/22: merged. Źródło f62e1b9395f89f60dfe27563536e06452dec7186, merge 32bde010778c26ac84479c1a87ddedadb3add260. Railway de9261e2-62ac-452d-843d-fa6a430fd8f0, SUCCESS 2026-10-25T22:41:37.826Z. Świeży snapshot poprzedniej produkcji 8c581766 miał SHA256 57e106cae8f403af0cbda75bedb6b0491b64e31e472bbbbe873e08e99ad7afd6. Zmieniono wyłącznie moduł Remontu i jego seed, zachowano wszystkie 101 poprzednich obserwacji oraz pozostałe pliki wspólnego backendu.

Dowody w C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/: work/reviewed-catalog-wave12.json, catalog-wave12-local-live-proof.json, catalog-wave12-production-proof.json, catalog-wave12-*-tests.log; outputs/asystent-remontu-katalog-74-dowod-20261025.json, betterial-k20-42-worki-transport-do-wyceny-20261025.png, betterial-koszyk-oprozniony-20261025.png i asystent-remontu-betterial-warunki-odbioru-20261025.png.

## Rzeczywisty brak ujawniony przez projekt

W UI utworzono testowy projekt proj_mvoewpq1eurced6nm „Test wyceny — Atlas K20, partia 42 worki”, eps-insulation-bso, 30 m², porównanie kosztów. Wybrano Betterial i potwierdzono widoczny komunikat o warunkach odbioru. Jednak osiem ogólnych materiałów oryginalnego kalkulatora nadal nie dopasowuje się do konkretnych referencji w Gdzie najtaniej, w tym „klej do styropianu”. Nie uznawać tej pracy za w pełni wycenioną tylko dlatego, że katalog zawiera K20.

Projekt testowy jest niezaznaczony we wspólnym koszyku. UI potwierdziło zachowane trzy prace, jedną posiadaną pozycję, kod 00-001 i 790,83 zł = 637,43 zł materiałów + 153,40 zł dostawy. Karta 2 pozostaje na podsumowaniu wspólnego koszyka. Zrzut outputs/asystent-remontu-koszyk-74-suma-20261025.png.

Następne zadanie: powiązać rzeczywisty wynik kalkulatora z jawnym doborem produktów i prawidłowym zapotrzebowaniem. Legacy job ma constant i daje niewiarygodnie niski lokalny budżet 95,90 zł dla 30 m²; nie przenosić tej ilości jako potwierdzonego zużycia. Nie mieszać rich/legacy ani zmieniać ID/obmiarów. Oddzielić klejenie EPS od warstwy zbrojonej i nie deklarować zgodności całego systemu bez źródeł. Wybór „Zatrudnię fachowca” prowadzi do porad, bez obmiaru i utworzenia projektu — także do poprawy. Serializer rozbicia opakowań powinien przekazywać regułę purchaseMultiple, aby wyjaśniać minimalne partie również przy braku wycenionej dostawy.

Badanie wyszukiwania Betterial po 30 kodach EAN zwracało również inne, niepasujące produkty; zero dodatkowych importów. Dotyczy także kontrolnego EAN K20. Nie utożsamiać znalezionego linku z potwierdzonym kodem. Zapis: work/catalog-wave12-research/search/proof.json.

Pozostałe wymagania: 29 produktów, dostawy Castorama/OBI, lokalne ceny/stany i limity zapasu, ręczne pozycje i częściowe zapasy, zgodność produktów oraz połączenie doboru z Zakupami i Budżetem. Bez nowego wydania Android/iOS. Obcy WIP w ean-overlay.ts, mappings.ts, pnpm-lock.yaml, .atlas i PROPOZYCJE zachowany.
