# Klingspor P60: arkusz, paczka 50 sztuk i wycena dziewięciu gradacji

Data weryfikacji: 2026-10-29. Kod `00-001` służy tylko do testu; aplikacja używa kodu pocztowego użytkownika.

## Tożsamość produktu i jednostka zakupu

- [Klingspor, karta PL 28 C](https://www.klingspor.pl/produkty/arkusze-scierne/pl-28-c/pdf) identyfikuje artykuł 269221 jako arkusz 230 × 280 mm P60, opakowanie 50 sztuk.
- [Tabela detalisty](https://mkplastimex.pl/arkusze-scierne-papierowe-/1971-papier-scierny-arkusz-230x280-mm-klingspor-pl-28-c-5907560027483.html) podaje dla artykułu 269221 EAN pojedynczej sztuki `4014855194896` i EAN opakowania `5907560018016`. To wyjaśnia rozbieżność kodów, bez zgadywania na podstawie nazwy.
- [Sewera](https://sklep.sewera.pl/papier-scierny-gr-60-arkusz-230x280mm-p6905): pojedynczy arkusz P60, 2,09 zł brutto, EAN sztuki i kod producenta 269221 potwierdzone na karcie.
- [Matiw](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P60-50szt/25777): jedna paczka 50 sztuk, 44,24 zł brutto, EAN opakowania, kod sklepu 000611, natywny produkt 25777 i opis paczki potwierdzone w API sklepu.

Zdjęcie pojedynczego arkusza pochodzi z Sewery. Zdjęcie paczki pochodzi z karty Matiw i zostało obejrzane. Obie ceny odczytał natywny czytnik aplikacji; seed zawiera osobny SHA-256 i czas odczytu każdej odpowiedzi. Powiązanie w kodzie jest wyjątkiem wyłącznie dla tego dokładnego artykułu, dwóch EAN, jednostek i identyfikatorów sklepu. Zmiana któregokolwiek pola wymaga ponownej weryfikacji.

## Problem i poprawka wyceny

Natywny koszyk dziewięciu pozycji Sewery wykonywał kolejno dodanie produktów i sprawdzenie metod dostawy. Przy limicie 20 sekund poprawna odpowiedź sklepu była przerywana w trakcie trzeciej stawki kurierskiej. Okno dla dziewięciu pozycji ma teraz 30 sekund, a dla większych koszyków rośnie z limitem 45 sekund. Nadal sprawdzane są aktualna cena brutto, liczba sztuk, skład koszyka i kod pocztowy. Serwer ma 35 sekund na rozpoczęcie wycen średniego koszyka; po przekroczeniu limitu pokazuje brak potwierdzonej stawki.

## Wynik prawdziwych koszyków

Lokalny HTTP do serwisu aplikacji z rzeczywistą anonimową wyceną sklepów dla P40/P60/P80/P100/P120/P150/P180/P220/P240:

| Liczba każdej gradacji | Najlepszy potwierdzony sklep | Materiały | Dostawa | Razem | Status |
|---|---|---:|---:|---:|---|
| 1 arkusz | Sewera | 15,77 zł | 19,90 zł | 35,67 zł | `compared`, brak 0 |
| 50 arkuszy | Matiw | 356,98 zł | 19,00 zł | 375,98 zł | `compared`, brak 0 |

Globalne porównanie wskazało te same zestawy. Sewera wycenia kod `00-001`, Matiw podaje krajową dostawę dla Polski. Wyszukiwanie ma znacznik `searchLimited`, więc kwota jest najtańsza w porównanych potwierdzonych zestawach, bez obietnicy przeszukania wszystkich możliwych sklepów i podziałów paczek. Przed powiązaniem paczki P60 koszt zestawu po 50 sztuk wynosił 474,14 zł z dwiema dostawami, z czego P60 było kupowane w Sewerze; nowa potwierdzona paczka Matiw obniża ten wynik o 98,16 zł dla badanego kodu i czasu.

Osobne wejście po EAN opakowania `5907560018016` wybiera paczkę Matiw: 44,24 zł + 19,00 zł dostawa = 63,24 zł. Wejście po EAN sztuki `4014855194896` z `refreshPrices: true` odświeżyło obie oferty bez błędów i podało ten sam najtańszy koszyk przy 50 sztukach.
