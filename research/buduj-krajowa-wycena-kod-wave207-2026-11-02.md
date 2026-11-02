# W207 — zachowanie krajowej wyceny przy zmianie kodu

W206 poprawił dostęp do Buduj24 przez istniejący podpisany serwis WWW. Publiczny test ponownie wykazał jednak brak wyceny po zmianie kodu pocztowego: sklep czasowo nie odpowiadał także przy nowym połączeniu. Zachowano nieudany przebieg W206 i diagnostykę. Nie oznaczono jego całego publicznego UI jako PASS.

Natywny koszyk Buduj24 wybiera kraj PL i nie przyjmuje kodu pocztowego. Mimo to dotychczas cache tej wyceny był rozdzielony według kodu. Identyczny pełny koszyk miał ważną, potwierdzoną stawkę dla całej Polski, ale po zmianie samego kodu API nie mogło jej wykorzystać. Taki krajowy cache istniał już dla dwóch produktów Elmas.

W207 dodaje do niego Buduj24 z osobnym, rygorystycznym kluczem: przypięte źródła, GTIN, adres karty, fizyczny rozmiar i jednostka, ilości, ceny brutto, pełna suma oraz reguły zakupu. Nie powstaje taryfa wpisana na sztywno. Zmieniona cena, ilość, produkt, adres, jednostka, cięcie lub niewystarczający zapas nie pożyczają starej wyceny.

Wykorzystywana jest wyłącznie rzeczywiście potwierdzona taryfa krajowa PL bez pola postalCode, z poprawnym źródłem, kwotą, skrótem dowodu i czasem. Data sprawdzenia i ważności nie są przedłużane. Dotychczasowy minutowy margines bezpieczeństwa i limit 64 zapisów pozostają. Wycena ABUD nadal wymaga osobnego potwierdzenia nowego kodu; nie pożycza stawki z innego miejsca.

Trzy testy odtworzyły problem (2 FAIL, 1 PASS na W206) i przechodzą po poprawce. Sprawdzają rzeczywisty historyczny koszyk po wyłączeniu połączenia, odwrócenie kolejności linii, odrzucenie dziesięciu zmian oraz koniec ważności bez zmiany oryginalnych dat. Wspólnie z ośmioma testami Elmas: 11 PASS; typy API PASS. Pełne czyste testy i produkcyjne sprawdzenie są w toku. Zmienia się tylko API; zgodna usługa WWW pozostaje na źródle 7362f72880a3e6ff7f64da62d84a5763f2fc7780. Cel rozwoju ACTIVE.
