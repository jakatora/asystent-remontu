# ALNAR — konkurencyjna oferta zestawu do paneli, 2026-11-02

W195 dodaje drugi sklep dla istniejącego produktu Wolfcraft 6931000, GTIN 4006885693104. Jedna sztuka handlowa oznacza jeden kompletny zestaw 22 elementów, a nie 22 zestawy. Nie zmienia receptur, starych projektów ani migracji.

## Źródła i rzeczywiste koszyki

- ALNAR: https://alnar.pl/wolfcraft-zestaw-do-montazu-paneli-p-6949.html — natywne productID 6949, MPN WF6931000, GTIN, marka, stan dostępności, cena brutto i formularz zakupu sztuki; autentyczne zdjęcie https://alnar.pl/images/6931000.jpg (HTTP 200, image/jpeg).
- Mensura: https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000 — drugi niezależny sklep tego samego GTIN/modelu, ponownie odczytany 2026-11-02.
- Producent: https://shop.wolfcraft.com/en-ua/products/p_6931_laminatelayingset ; katalog producenta https://www.wolfcraft.com/fileadmin/users/redakteur/Produktkataloge/Katalog_2025/Main-Catalogue_PRO_SAL_CAT_en_S_2025-03.pdf, tabela 6931000. Ten zagraniczny sklep producenta nie służy do wyceny transportu w Polsce.

Adapter, a nie tylko ręczny podgląd, wykonał 31 rzeczywistych HTTP dla odczytu i trzech anonimowych koszyków. 2026-11-02 05:30 UTC:

| Zestawy | Materiały | Kurier | Całość |
|---|---:|---:|---:|
| 1 | 49,00 zł | 21,99 zł | 70,99 zł |
| 2 | 98,00 zł | 21,99 zł | 119,99 zł |
| 7 | 343,00 zł | 0,00 zł | 343,00 zł |

Mensura 2026-11-02 05:32 UTC: ten sam jeden zestaw 64,90 zł + GLS 13,99 zł = 78,89 zł. Różnica 7,90 zł wynika z oferty innego sklepu; nie jest spadkiem ceny tego samego produktu w tym samym sklepie. Nie odnawiano dat ani nie dopisywano sztucznej poprzedniej ceny.

## Reguły i granice

ALNAR domyślnie wybiera punkt ORLEN. Integracja jawnie ustawia Polskę, kuriera po przedpłacie (14) i przelew bankowy (1), a następnie ponownie odczytuje koszyk. Potwierdza całe ilości, właściwy model/link, ceny wyraźnie oznaczone brutto (pomija niższe netto), sumę materiałów, wysyłki i należności oraz zgodność obu odpowiedzi AJAX z końcowym koszykiem.

Brak opłaty, odbiór osobisty, paczkomat/punkt, pobranie, dopłata płatnicza, kaucja, inna waluta, wariant, zmiana stanu lub ilości i niezgodna suma nie stają się darmowym kurierem. Zero wymaga rzeczywiście wybranego kuriera i potwierdzonej sumy powyżej przejrzanego progu 299 zł. Zmiana komunikatu progu jest nieznaną regułą wymagającą przeglądu.

To jawna taryfa krajowa PL. Sklep na tym etapie nie wycenia adresu według kodu; nie oznaczać jej jako osobistej wyceny kodu lub gwarancji obsługi każdego adresu. Wycenę przechowuje się z oryginalnym terminem ważności 10 minut. Publiczne tokeny pochodzą z tej samej świeżej anonimowej sesji; dozwolone jest tylko pięć ograniczonych akcji koszyka. Brak danych kontaktowych, finalizacji zamówienia lub płatności.

## Weryfikacja i publikacja

13 testów ALNAR i istniejącego DekoratorMarket PASS, 0 skip, typy API PASS. Ujęto kontrolowane uszkodzenia: GTIN/MPN, cena, netto, waluta, stan, jednostka, dopłaty, kraj, kurier, brak pełnej ilości, zmieniony próg oraz nieobsługiwany koszyk. Pierwsza rzeczywista próba importu ESM ujawniła cykl zależności; metadane źródła wydzielono do czystego alnar-source.ts i ponowiona próba natywna przeszła wszystkie 3 koszyki.

Pełna walidacja czystej kopii, próby HTTP aplikacji, UI i publikacja pozostają do wykonania. Katalog po dodaniu oferty powinien zachować 249 pozycji, 217 potwierdzonych i 32 dawne luki; liczba ofert rośnie z 324 do 325. To oczekiwanie do sprawdzenia, nie zakończony audyt.

Dowody lokalne: G:/Projekty/asystent-remontu-work/wave195-20261102. Pełne surowe sesje są poza repo; fixture to wybrane autentyczne fragmenty z zastąpionymi tokenami i bez cookies/analytics.
