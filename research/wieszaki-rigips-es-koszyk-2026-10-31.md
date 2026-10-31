# Rigips ES 60/75 i ES 60/125 — dokładna ilość i dostawa

Sprawdzenie: 2026-10-31. Cel: dodać realnie dostępne elementy do wspólnego koszyka bez automatycznej zamiany systemu konstrukcyjnego.

## Źródła i jednostka zakupu

// source: https://www.rigips.pl/akcesoria/akcesoria-montazowe/uchwyt-prosty-es-60-do-profili-cd-60-g-10-mm
// source: https://sklep.sewera.pl/wieszak-es-6075-prosty-rigips-p13734
// source: https://sklep.sewera.pl/wieszak-es-60125-prosty-rigips-p7413
// source: https://sklep.sewera.pl/photo/25090/wieszak-es-6075-prosty-rigips.webp
// source: https://sklep.sewera.pl/photo/25075/wieszak-es-60125-prosty-rigips.webp

| Wariant prosty | EAN | Kod producenta | Cena brutto / 1 szt. | Potwierdzony oddział |
|---|---|---|---:|---|
| Rigips ES 60/75 | 5905637101074 | 11511729 | 1,38 zł | Katowice |
| Rigips ES 60/125 | 5905637101081 | 11511730 | 1,75 zł | Sosnowiec |

Producent potwierdza odpowiednio 75 i 125 mm, blachę 1,0 mm oraz przeznaczenie do Rigips CD 60 ULTRASTIL. Opakowanie zbiorcze producenta 100 szt. nie zmienia potwierdzonej jednostki detalicznej Sewery: SZT = jeden wieszak. Karty oddziałowe w momencie sprawdzenia: Katowice 479 szt. wariantu75 i 0 szt. wariantu125; Sosnowiec 0 szt. wariantu75 i 431 szt. wariantu125. To obserwacja, nie gwarancja późniejszej dostępności.

Oba zdjęcia zwracają HTTP200 `image/webp`, 2428 bajtów i identyczny SHA256 `76953a2ffffee210ddb117974c8744f09a55936b98f4e1a5dd05640f035df9e7`. Sklep stosuje jedno poglądowe zdjęcie dla obu długości; UI zawiera uwagę o sprawdzeniu długości w nazwie i EAN. Żadne zdjęcie nie jest generowane ani dołączone binarnie do repo.

## Dobór i formularz

Sufit g-k otrzymuje jawny wybór Norgips ES 60/75 (zachowany domyślny wariant), Rigips ES 60/75 albo Rigips ES 60/125. Pole liczby wieszaków z projektu pojawia się tylko dla Rigips. Bez dodatniej całkowitej liczby pozycja pozostaje do ustalenia. Aplikacja dodaje wybrany zapas, np. 26 szt. + 10% = 29 szt.; nie stosuje normy Norgips 1,3 szt./m² do innego systemu.

Zmiana wieszaka lub profilu CD usuwa liczbę przypisaną do poprzedniego zestawienia. Zmiana produktu usuwa status posiadania/zakupu poprzedniego wariantu. Ta sama tożsamość z dwóch pomieszczeń jest sumowana we wspólnym koszyku. Dobór kotew, nośności i zgodności całej konstrukcji pozostaje według projektu; dodanie tych pozycji nie oznacza kompletnego sufitu.

## Rzeczywisty anonimowy koszyk

Kod testowy `00-001`, 2026-10-31. Nie składano zamówienia, nie podawano danych kontaktowych ani nie inicjowano płatności. Wyceny wiążą dokładne EAN, ilość, jednostkę, cenę brutto i oddział z koszykiem; zakres `postal_code`, ważność 10 minut.

| Wariant | Ilość | Materiał | Dostawa z koszyka | Razem |
|---|---:|---:|---:|---:|
| ES 60/75 | 1 | 1,38 zł | 19,90 zł InPost | 21,28 zł |
| ES 60/125 | 1 | 1,75 zł | 19,90 zł InPost | 21,65 zł |
| ES 60/75 | 29 | 40,02 zł | 37,90 zł DHL | 77,92 zł |
| ES 60/125 | 29 | 50,75 zł | 37,90 zł DHL | 88,65 zł |

Wyższa liczba sztuk zmienia rzeczywisty sposób i koszt dostawy. Nie wyliczamy taryfy samodzielnie z przypuszczalnej wagi. Ceny dotyczą opisanych ilości i kodu, nie wszystkich adresów i przyszłych zakupów.

Zestaw sprawdzany przez lokalny i produkcyjny HTTP: po 29 szt. obu wieszaków oraz po jednej rolce papierowej Rigips75m, akustycznej50mm×30m i akustycznej30mm×30m. Materiały 160,30 zł. Dwa oddziały wymagają dwóch odrębnie potwierdzonych koszyków; nigdy jednej fikcyjnej wysyłki.

// source: https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448
// source: https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips-p7445
// source: https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips-p7444

## Walidacja i wydanie

API focused14/14, pricing158/158, mobile376/376 bez skipów; mobile/API typecheck PASS. Testy obejmują błędny EAN i długość, opakowanie100 zamiast1, niewłaściwą jednostkę/oddział, odrębne grupy wysyłkowe, brak liczby, zachowanie starych projektów i sumowanie pomieszczeń. Wyniki końcowego backendu, wspólnego koszyka i wdrożenia dopisane po zakończeniu sprawdzenia.
