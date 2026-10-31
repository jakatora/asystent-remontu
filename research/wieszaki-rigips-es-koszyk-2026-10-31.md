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

Zestaw sprawdzany przez lokalny i produkcyjny HTTP: po 29 szt. obu wieszaków oraz po jednej rolce papierowej Rigips75m, akustycznej50mm×30m i akustycznej30mm×30m. Lokalny HTTP potwierdził materiały 160,30 zł + dwie dostawy DHL po 37,90 zł = **236,10 zł**. Katowice: wieszaki75 za40,02 zł; Sosnowiec: pozostałe cztery produkty120,28 zł. Wybrany sklep i ranking globalny zwracają `compared/missing0`; po wyłączeniu osobnych zamówień `needs_delivery_costs`, pełna kwota null. To zestaw pięciu wskazanych produktów, nie kompletny sufit ani minimum całego rynku.

// source: https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448
// source: https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips-p7445
// source: https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips-p7444

## Walidacja i wydanie

API focused14/14, pricing158/158, mobile376/376 w roboczej kopii bez skipów; mobile/API typecheck PASS. W odizolowanym commicie mobile375/376: wcześniejszy test `vinylArea` zakłada niezatwierdzone mapowanie paneli winylowych z obcego WIP `mappings.ts`. Identyczny błąd odtworzono na bazie2e91721, sprzed tej zmiany. Obce mapowanie pozostawiono nietknięte i wyłączone z wydania; to osobna zaległość, nie błąd wieszaków. Typy API z czystej kopii przeszły po zbudowaniu deklaracji bibliotek (`tsc -b`); brak wcześniejszych artefaktów deklaracji nie jest błędem źródła. Wizualnego testu formularza nie wykonano — dostępny runtime przeglądarki pozostaje niesprawny. Nowe pola korzystają z istniejących rendererów wizardu i edycji, z testowaną widocznością i resetem. Testy obejmują błędny EAN i długość, opakowanie100 zamiast1, niewłaściwą jednostkę/oddział, odrębne grupy wysyłkowe, brak liczby, zachowanie starych projektów i sumowanie pomieszczeń. Pełne testy końcowego wspólnego backendu:1060/1060, bez skipów. Legacy66 ID i8URL-i200:PASS. Wydanie przygotowano z aktualnej produkcji149 plików; seed280→282 i bundle zmienione,147 pozostałych plików identyczne. SHA bundle `2a4b34d94ecc7ea35f9b3c5d4229ee572077460f57ddb7144e60894affb49396`. Kod aplikacji `4ba0593`, backend [PR127](https://github.com/jakatora/przetargai/pull/127) MERGED `ac5103ea8ff2cdef1691cb6fa1269b42dbb4ff42`. Przypięcie PR do czatu odrzucono limitem100 załączników. Preflight przed wdrożeniem potwierdził149/149 plików zgodnych z bazą. Railway `3160edbb-b033-45d4-81a2-204176095d49`: SUCCESS.

Produkcja przed zmianą: `partial/missing2`. Po zmianie rzeczywisty HTTPS potwierdził oba nowe produkty i testowy zestaw pięciu produktów: materiały16030gr, dostawy7580gr, razem23610gr, `compared/missing0` w wybranym sklepie oraz rankingu globalnym. Bez osobnych zamówień: `needs_delivery_costs`, pełna kwota null. Jedna sztuka75 z kurierem2128gr, jedna sztuka125 z kurierem2165gr. To dowód na rzeczywistych koszykach, nie tylko test jednostkowy. Zastosowano aktualne ceny brutto i całkowite grosze, rzeczywistą liczbę sztuk i dokładne EAN; bez tworzenia płatności i zamówień.

Snapshot po wdrożeniu149/149 plików zgodny z przygotowaniem,282 obserwacje i identyczny SHA bundle. Health247 aktywnych ofert/167 produktów, katalog200 referencji i201 wpisów zdjęć;33 referencje bez aktywnej oferty. Obce WIP `ean-overlay.ts`, `mappings.ts`, `pnpm-lock.yaml`, `.atlas/`, `PROPOZYCJE-COCKPIT.md` zachowane i wyłączone. Zmiany formularza są w kodzie; nie publikowano nowego wydania mobile w sklepach. Cel pozostaje aktywny. Następne priorytety: przegląd brakującego mapowania winylu bez bezkrytycznego przyjęcia obcego WIP, dalsze dokładne produkty/zdjęcia i aktywne oferty dla konstrukcji. Automatyczna dostawa Castoramy/OBI nadal wymaga działającego źródła.
