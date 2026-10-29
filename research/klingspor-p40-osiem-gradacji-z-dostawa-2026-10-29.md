# Klingspor P40: ósma gradacja w koszyku z dostawą

Data weryfikacji: 2026-10-29. Kod 00-001 służy wyłącznie do testu; aplikacja używa kodu użytkownika.

## Potwierdzone oferty

- [Sewera P40](https://sklep.sewera.pl/papier-scierny-gr-40-arkusz-230x280mm-p6904): jeden arkusz PL 28 C 230 × 280 mm, EAN 5907560018009, 2,03 zł brutto, zdjęcie z tej karty.
- [Matiw P40](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P40-50szt/25766): jedna kupowana paczka zawiera 50 arkuszy, ten sam EAN, kod sklepu 000564, produkt 25766, 52,50 zł brutto. API sklepu i opis potwierdzają 50 sztuk.

Obie ceny i dostępność odczytano także przez natywne czytniki ofert. W seedzie zapisano czas odczytu, adres źródła i SHA-256 odpowiedzi. Oba zdjęcia pokazują arkusz z tej samej karty EAN w Sewerze; fotografia jest reprezentacyjna dla paczki, nie przedstawia 50 osobnych arkuszy.

## Pełen koszyk

Lokalny test z natywnymi anonimowymi koszykami sklepów dla ośmiu gradacji P40, P80, P100, P120, P150, P180, P220 i P240 oraz kodu 00-001:

| Liczba każdej gradacji | Wybrany sklep | Materiały | Dostawa | Razem | Status |
|---|---|---:|---:|---:|---|
| 1 arkusz | Sewera | 13,68 zł | 19,90 zł | 33,58 zł | compared |
| 50 arkuszy | Matiw | 312,74 zł | 19,00 zł | 331,74 zł | compared |

Globalne porównanie wskazało te same zestawy. Dostawa Sewery była wyceniona dla kodu, a stawka Matiw obejmowała Polskę. W obu przypadkach status `compared`, zero brakujących produktów, jedna dostawa i osiem pozycji. Wyszukiwanie oznacza zakres jako ograniczony (`searchLimited`), więc nie należy reklamować wyniku jako matematycznego optimum dla każdej hipotetycznej kombinacji paczek.

## Odłożona gradacja P60

[Sewera P60](https://sklep.sewera.pl/papier-scierny-gr-60-arkusz-230x280mm-p6905) podaje EAN 4014855194896 dla jednego arkusza za 2,09 zł, a [Matiw P60](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P60-50szt/25777) podaje EAN 5907560018016 dla paczki 50 sztuk za 44,24 zł. Wspólny kod producenta nie wystarcza do złączenia tych ofert jako identycznego produktu. Test dziewięciu gradacji wykazał również przekroczenie czasu natywnej wyceny dostawy Sewery. P60 wróci po weryfikacji tożsamości i usprawnieniu dużych koszyków.

## Następne kroki

1. Skrócić liczbę zapytań do sklepów dla dużego koszyka i zachować uczciwy status, gdy sklep nie poda stawki.
2. Potwierdzić P60 na podstawie danych producenta i natywnych koszyków, bez łączenia różnych kodów EAN na podstawie nazwy.
3. Rozszerzać katalog o produkty z potwierdzoną jednostką zakupu, zdjęciem i rzeczywistą wyceną całego zestawu.
