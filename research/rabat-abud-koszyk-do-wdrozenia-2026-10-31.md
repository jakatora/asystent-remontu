# Rabat na cały koszyk ABUD — dowód i dalszy zakres, 2026-10-31

Status: **niezaimplementowane**, priorytet kolejnej fali po wave149. Cel nadal aktywny. Nie zastępować tej pracy kolejnym powiększaniem katalogu lub kosmetyką UI.

## Potwierdzony przypadek

Anonimowy natywny koszyk ABUD z ośmioma rolkami AKS (po jednej: 3×1,5 mm² 5/25/50/100 m oraz 3×2,5 mm² 5/25/50/100 m), kod testowy 30-001:

- Karty produktów: łącznie **2043,10 zł**.
- Natywny koszyk: **2022,66 zł**, dostawa Pocztex Kurier 24 **0 zł**.
- Różnica: **20,44 zł**. Nie ustalać stałego progu ani procentu z jednego odczytu.
- `prices.base_price` każdej pozycji odpowiada cenie karty; `prices.gros` i `prices.worth_gros` zawierają niższe kwoty po rabacie. Sumę należy brać z rzeczywistych wartości groszowych, bez odtwarzania procentu.

Rzeczywisty HTTP przygotowanego modułu wave149 zwrócił `best=null`, `unavailableStores=[{store:'ABUD',reason:'price_changed'}]`. Obecne sprawdzanie `confirmIdosellBasket` wymaga identycznej ceny karty i koszyka. Dzięki temu nie pokazuje fałszywie potwierdzonych 2043,10 zł, ale nie obsługuje jeszcze prawdziwego rabatu całego zamówienia. Nie zapisywać rabatu jako nowej zwykłej ceny oferty ani punktu historii produktu.

Dowody lokalne w katalogu roboczym: `abud-native-carts-wave149.json` przypadek 5, `basket-discount-gap-wave149.json`, test `aks-cable-range.test.ts` wymagający jawnego odrzucenia niezgodnej sumy. Nie są to dane testowego operatora wpisane jako ceny ani kontrolowany upstream.

## Wymagana implementacja

1. Rozszerzyć kontrakt rzeczywistej wyceny o osobne, zweryfikowane ceny materiałów w danym koszyku. Sam `costGrosze` dostawy nie wystarcza. Powiązać pozycje z dokładnym offerId, liczbą opakowań i bazową ceną odczytaną z karty; rabat ma dotyczyć tylko tej zawartości koszyka.
2. W adapterze ABUD potwierdzić ID/GTIN/jednostkę/liczbę i zapas wszystkich pozycji, ich ceny bazowe, kwoty brutto po rabacie, sumę pozycji i sumę całego koszyka. Nie przyjmować podwyżki, dodatkowych produktów, kaucji, niezgodnych jednostek lub innej liczby sztuk jako rabatu. Używać bieżącej anonimowej sesji, bez kuponu lub cudzego konta. Pozostałe sklepy zachowują dotychczasowy ścisły kontrakt.
3. Uwzględniać potwierdzoną korektę materiałów w koszcie sklepu, sumie remontu i rankingu. Pozycje prezentowane użytkownikowi muszą sumować się do kosztu materiałów po rabacie. Nie odejmować rabatu od dostawy ani dodawać go drugi raz.
4. Sprawdzić generowanie kandydatów, granice kosztów i przycinanie wyszukiwania: suma cen katalogowych może przewyższać rzeczywistą cenę koszyka, więc nie stanowi automatycznie bezpiecznej dolnej granicy dla sklepu z rabatem. Przy limitach porównania nadal pokazywać uczciwie niepełny zakres.
5. Zachować powiązanie cache wyceny z całym koszykiem/kodem/ceną bazową, TTL 10 minut, podpis i walidację prywatnego relaya. Nowe pola muszą być objęte integralnością odpowiedzi. Nie przenosić rabatu na inną ilość, produkt, kod ani wygasłą wycenę.
6. Pokazać w PL i EN jawny rabat sklepu na ten koszyk. Historia i badge zmiany ceny produktu nadal porównują zwykłe odczyty tej samej oferty, nie rabaty warunkowe zamówienia.
7. Dodać testy negatywne i integracyjne (częściowy rabat, cena bazowa zmieniona, podwyżka, inna ilość, zapas, suma, format waluty, wygaśnięcie, cache, relay). Zweryfikować także brak rabatu: sama rolka 5 m to 42,70+13=55,70 zł; cztery nowe rolki to 777+0=777 zł.
8. Dopiero po realnym HTTP i publicznym UI z nowym kontraktem uznać przypadek ośmiu rolek za obsługiwany. Powtórzyć natywny odczyt, bo cena i rabat mogą się zmienić. Wdrożyć istniejące usługi z zachowaniem współdzielonego backendu i historii.

## Odrzucone nowe tropy z tej fali

Merkury Market: karta GW180 20 kg / produkt 155820 / SKU 1600629 i anonimowy koszyk potwierdzają 45,99 zł. Karta nie podaje GTIN, a koszyk po wyborze przelewu oferuje transport regionalny wybierany według miasta. Nie potwierdzono dostawy dla samego kodu pocztowego. Brak podstaw do włączenia jako kompletnej automatycznej oferty EAN 5907418038791 lub ogólnopolskiej stawki. Dowody: `merkury-{product,cart,rates}-ui-wave149.*`, `merkury-native-events-wave149.json`, `merkury-rates-events-wave149.json`. Nie ponawiać tej samej próby bez nowego sposobu potwierdzenia tożsamości i zasięgu.

Adamex, Norgips 50×30 m, EAN 5907651698004: rzeczywista karta 16586 zwróciła schema.org OutOfStock, quantity 0 i komunikat „Produkt na zamówienie”. Fragment wyszukiwarki mówił „W magazynie”, ale aktualny natywny odczyt mu przeczy. Nie importowano jako in_stock. RKMPro również podaje zamówienie. Castorama/OBI/Leroy nie były ponownie wywoływane bez nowej przesłanki dostępu.
