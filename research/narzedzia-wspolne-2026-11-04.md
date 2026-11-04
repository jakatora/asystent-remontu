# Wspólne narzędzia z konkretnym modelem

2026-11-04. Audyt 66 prac znalazł 306 wystąpień narzędzi, z których 10 miało model podłączony do bieżących ofert. Dodano trzy jawne przykłady dla kolejnych dziewięciu wystąpień. To 19 wystąpień, nie 19 nowych produktów ani komplet wszystkich narzędzi.

| Model | EAN | Cena odczytana brutto za sztukę | Zastosowanie w aplikacji |
|---|---|---|---|
| Stalco S010124205, miara 5 m × 19 mm | 5905947919611 | 15,29 zł | Miara przy podkładzie, laminacie, winylu i listwach |
| Hardy 0146-323734K, kuweta 37 × 34 cm | 5905061980771 | 12,14 zł | Malowanie i przemalowanie ścian |
| Tytan 10003240, wyciskacz szkieletowy 310 ml | 5903518042997 | 16,58 zł | Silikonowanie, ściana nad blatem i blat kuchenny |

Są to historyczne odczyty rzeczywistego parsera Sewery z 2026-11-04 około 04:28 UTC. Aplikacja pobiera aktualną cenę z serwera, nie utrwala tych kwot w kartach narzędzi. Każdy model ma własne zdjęcie produktu, którego odpowiedź HTTP 200 i typ obrazu sprawdzono. Źródła i SHA kart zapisano w `G:/Projekty/asystent-remontu-work/wave373-20261104`.

Źródła miary

- https://sklep.sewera.pl/miara-zwijana-5m-x-19mm-gumowana-stalco-p20547
- https://stalco.pl/media/katalogi/KATALOG_STALCO_2026_PL.pdf

S010124205 i EAN 5905947919611 to aktualny produkt karty. Nie połączono go ze starszą miarą S-10205 o EAN 5906365349424. Długość 5 m nie oznacza kupna pięciu sztuk.

Źródła kuwety

- https://sklep.sewera.pl/kuweta-malarska-37x34-cm-hardy-p6310
- https://hardy.pl/product/resource?prid=909

Producent potwierdza kod, EAN i wałki do 25 cm. Cena nie dotyczy przezroczystej wkładki 0144-323734K ani zestawu z wałkiem.

Źródła wyciskacza

- https://sklep.sewera.pl/wyciskacz-do-kartuszy-szkieletowy-310ml-tytan-p18099
- https://tytan.com/pl/produkt/akcesoria/wyciskacz-mechaniczny-szkieletowy-do-kartuszy/
- https://www.bricomarche.pl/wyciskacz-mechaniczny-szkieletowy-kartusz-310-ml-tytan

Model jest opisany jako wyciskacz do kartuszy 310 ml. Nie zastępuje pistoletu do piany, wyciskacza do kiełbas 600 ml ani wersji Profi 10023271. Do zakupu trzeba dopasować konkretny kartusz. Karton producenta 12 sztuk nie zmienia oferty Sewery sprzedawanej po jednej sztuce.

Zakres zmiany

Wybór „Kupuję” dodaje jedną sztukę tego samego modelu dla całego remontu. „Mam”, „Wypożyczam” i brak wyboru nie tworzą zakupów. Nie przypisujemy ceny przykładu do dawnych linków innych marek. Nie zmieniono historycznych projektów, ilości materiałów ani decyzji użytkownika zapisanych dla innych tożsamości narzędzi. Dawna ogólna pozycja i konkretny model mają różne klucze, więc aplikacja wymaga decyzji dla nowego modelu.

Testy obejmują deduplikację dziewięciu prac do trzech zakupów, jednostkę sztukową, brak automatycznych zakupów, odrzucenie innego EAN, brak stanu oraz wykluczenie zestawów i sprzętu o innym przeznaczeniu. Cena dostawy będzie potwierdzana przez istniejący automat całego koszyka. Na etapie dodania źródeł nie ma jeszcze dowodu wdrożenia ani pełnej wyceny dostawy tych trzech modeli.
