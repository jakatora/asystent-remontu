# Zdjęcia produktów i historyczne oferty — 2026-10-29

## Wynik kontroli obrazów

`node scripts/audit-product-photos.cjs` pobiera tylko początek pliku każdego adresu z `PRODUCT_PHOTOS` i wymaga odpowiedzi HTTP 2xx z typem `image/*`. Kontrola 188 unikalnych adresów wykazała 187 poprawnych oraz jeden błędny: zdjęcie podkładu Arbiton Secura Thermo Aquastop Smart 6 m² na `a.assecobs.com` zwracało HTTP 439 i HTML. To powodowało ikonę zastępczą w aplikacji.

Zastąpiono je [fotografią producenta](https://photos.arbiton.com/media/cache/gallery2/photos/5905167826942_I_02.png) z [karty Arbiton](https://arbiton.com/sv/laminatunderlag/arbiton-secura-thermo-aquastop-smart-laminatunderlag). Karta potwierdza EAN **5905167826942**, grubość 1,6 mm i opakowanie 6 m². Obraz odpowiedział HTTP 206, `image/png`. Ponowna kontrola: **188/188** obrazów odpowiada poprawnie. Stan dotyczy chwili odczytu, bo obrazy są hostowane poza aplikacją.

## Brakujące historyczne oferty

Umywalka Cersanit Facile 50 **K30-002** widnieje w [Buy365](https://www.buy365.pl/umywalki-i-postumenty,c56.html) za 117,15 zł i z czasem 7–10 dni. Próba dodania identyfikatora 382 przez natywne `cart.addAjax` zwraca HTTP 404. [Domni](https://domni.pl/sklep/umywalki/umywalki-meblowe/cersanit-facile-k30-002) oznacza dokładny model jako wycofany, a [Renovey](https://www.renovey.com/pl/lazienka/umywalki/umywalki-wiszace/) jako niedostępny. Brak potwierdzonego koszyka i dostawy, więc tej ceny nie dodano do rankingu. Nie zastąpiono automatycznie wybranego modelu inną umywalką.

Pozostałe starsze referencje z siedmiu luk trzeba weryfikować pojedynczo: [folia Diall](https://www.castorama.pl/folia-paroizolacyjna-diall-20-m2/5059340141428_CAPL.prd) jest tylko do odbioru, a [Nati Bianco](https://elazienki.pl/p/plytka-scienna-paradyz-nati-bianco-struktura-25x40cm/) pokazuje zero opakowań w magazynie. Następny produkt do wyceny powinien mieć potwierdzony stan i działającą dostawę całego zamówienia.
