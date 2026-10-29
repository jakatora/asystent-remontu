# Papierowa taśma Rigips w koszyku g-k — 2026-10-29

## Problem użytkownika

Domyślna papierowa taśma Norgips 50 mm × 75 m miała tylko ofertę Leroy Merlin weryfikowaną przeglądarkowo na 24 godziny. Po jej wygaśnięciu ściana lub sufit g-k nie mogły otrzymać pełnej potwierdzonej wyceny z dostawą, mimo że inna taśma papierowa o tym samym wymiarze była dostępna do kupienia. Różnych marek nie wolno łączyć pod jednym EAN ani zmieniać automatycznie w zapisanym projekcie.

## Zmiana

- Dodano osobny, świadomy wybór taśmy papierowej Rigips 50 mm × 75 m, EAN **5905637118010**, do ściany i sufitu g-k. Norgips pozostaje dotychczasowym wyborem. Wybór Rigips zachowuje surowe zapotrzebowanie w metrach i dobiera całe rolki 75 m. Formularz uprzedza o sprawdzeniu zgodności z wymaganym systemem i gwarancją.
- Katalog zawiera dokładną [kartę Sewery](https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448), [zdjęcie produktu](https://sklep.sewera.pl/photo/25025/tasma-spoinowa-papierowa-50mm-x-75m-rigips.webp), cenę brutto pełnej rolki i osobny kod produktu. Parser natywny potwierdził 21,94 zł, stan dostępny i SHA256 odpowiedzi. Zdjęcie odpowiedziało HTTP 200 `image/webp`.
- Anonimowy koszyk sprawdza magazyn Sosnowiec. Podczas odczytu karta pokazała tam 12 rolek, podczas gdy Katowice miały 0. Oddział jest przypięty tylko do dokładnego EAN, URL, nazwy, kategorii i opakowania; zmiana któregokolwiek z tych danych blokuje tę regułę.

## Rzeczywista dostawa

Kontrola anonimowego koszyka dla **jednej rolki** i kodu testowego `00-001` (2026-10-29 21:42 UTC) potwierdziła kuriera InPost z Sosnowca za 19,90 zł. Materiał 21,94 zł + dostawa 19,90 zł = **41,84 zł**. Cytat dostawy jest ważny 10 minut i zależy od kodu, liczby produktów oraz dostępności; aplikacja wycenia cały koszyk użytkownika na nowo. Nie złożono zamówienia ani płatności.

## Granice i kontrole

Audyt przed zmianą: 195 referencji materiałowych, 196 wpisów zdjęć, 275 obserwacji ofert i 34 referencje bez aktywnej oferty w produkcji. Pozycje historyczne bez potwierdzonego koszyka nie otrzymały wymyślonych cen. Karta produktu Norgips nie jest ceną Rigips.

Testy: API 15/15 w obszarze tożsamości i parsera; mobile 371/371; silnik cen 151/151; typecheck mobile i API. Parsowanie żywej karty oraz wycena dostawy były dodatkowo sprawdzone po HTTP. Dalsza praca: kolejne świadome alternatywy dla brakujących materiałów i stabilne wyceny dostawy, szczególnie kart Castoramy i Leroy Merlin.

## Odbiór produkcyjny

Backend [PR 121](https://github.com/jakatora/przetargai/pull/121) scalony jako `f7f51a1`; Railway deployment `e8ac1360-7c17-4ee4-a6f0-640c93c76632` ma status **SUCCESS**. Produkcyjne `/api/remont/health` pokazuje 276 źródeł i nową ofertę aktywną. Dwa kolejne żądania HTTPS pełnej wyceny tej samej rolki dla `00-001` zwróciły `compared`, brakujących produktów 0, materiały 2194 gr + dostawa 1990 gr = 4184 gr, oddział Sosnowiec. Drugie żądanie miało ten sam `checkedAt` potwierdzonej dostawy, zgodnie z krótką pamięcią cytatu. Snapshot produkcji: 148/148 plików identycznych z przygotowaną paczką, 276 obserwacji, SHA256 modułu `bc6cf7a0f58bbd4ca269e7e35aa573f2ccee32eb472a4c236edd4acb6068f68e`.
