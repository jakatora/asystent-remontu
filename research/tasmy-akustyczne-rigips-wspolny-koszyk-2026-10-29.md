# Taśmy akustyczne Rigips we wspólnym koszyku g-k — 2026-10-29

## Problem użytkownika

Taśmy Norgips 50 mm i 30 mm w kalkulatorze ścian oraz sufitów g-k miały jedynie ręcznie potwierdzone karty Leroy Merlin, które po 24 godzinach nie dawały bieżącej oferty z dostawą. Bez tych elementów pełny zestaw nie otrzymywał potwierdzonej kwoty. Wymiana marki musi być świadomą decyzją, zwłaszcza gdy projekt wymaga zgodności systemowej.

## Dokładne produkty i wybór

- [Rigips 50 mm × 30 m w Sewera](https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips-p7445), EAN `5905637113503`, 29,25 zł za rolkę, [zdjęcie produktu](https://sklep.sewera.pl/photo/191957/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips.webp). W kalkulatorze ścianki jest osobnym wyborem pod profile 50 mm.
- [Rigips 30 mm × 30 m w Sewera](https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips-p7444), EAN `5905637148819`, 18,34 zł za rolkę, [zdjęcie produktu](https://sklep.sewera.pl/photo/191959/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips.webp). W kalkulatorze sufitu jest osobnym wyborem pod UD 30 mm.

Norgips pozostaje domyślnym wyborem istniejących projektów. Nowe warianty mają oddzielne EAN i zdjęcia. Liczba metrów wynika z dotychczasowego obmiaru, a zakup obejmuje pełne rolki po 30 m. Zmiana wariantu nie pozwala automatycznie uznać posiadanej rolki innej marki za kupioną.

## Faktyczne źródło ceny i dostawy

Natywny parser kart Sewery potwierdził oba EAN, pełne nazwy, cenę brutto, dostępność oraz zapisał czas i SHA256 HTML. W oddziale Sosnowiec podczas odczytu było 27 rolek 50 mm i 30 rolek 30 mm. Reguła kierująca do tego oddziału wymaga dokładnego EAN, URL, nazwy, opakowania i kategorii, a także sprawdza oddział przed wyceną.

Anonimowy koszyk Sewery z trzema produktami: papierowa Rigips 75 m (21,94 zł) oraz obie taśmy akustyczne (29,25 zł i 18,34 zł), dla **testowego kodu 00-001**, potwierdził kuriera InPost za 19,90 zł z Sosnowca. Produkty razem kosztowały 69,53 zł, a całe zamówienie **89,43 zł**. Cytat dostawy jest ważny 10 minut; aplikacja wylicza go ponownie dla kodu użytkownika, ilości i całego zamówienia. Nie składano zamówienia ani płatności. Ta wycena nie gwarantuje minimum całego rynku.

## Kontrole

Testy obejmują świadomy wybór i zachowanie starego wariantu, dokładne EAN/zdjęcia we wszystkich trzech poziomach jakości, pełne rolki, zmianę statusu posiadanej taśmy i blokadę przypadkowego przepięcia oddziału. Realny anonimowy koszyk jest osobnym dowodem poza testami. API 15/15 w obszarze tożsamości i parsera, mobile 372/372, silnik cen 151/151, shared backend 1054/1054, typecheck API/mobile. Zdjęcia HTTP 200 `image/webp`.

## Odbiór produkcyjny

Backend [PR 122](https://github.com/jakatora/przetargai/pull/122) scalono jako `43648e3`; Railway deployment `05078625-de59-4ec3-a619-9eb92dc64025` ma status **SUCCESS**. Produkcyjne `/api/remont/health` pokazuje 278 źródeł, 243 aktywne oferty i oba nowe źródła aktywne. Dwa żądania HTTPS wyceny pełnego zestawu dla `00-001` zwróciły `compared`, brakujących produktów 0, produkty 6953 gr + jedna dostawa 1990 gr = **8943 gr**. Sklep Sewera, oddział Sosnowiec, identyczne `checkedAt` cytatu `2026-10-29T22:01:58.656Z`. Snapshot serwera: 148/148 plików identycznych z przygotowaną paczką, 278 obserwacji, SHA256 modułu `e4d251b4bbc6987dc916b1a0667738af59cffe30a56f18b2b395fb01d668fabf`.

To potwierdza koszt trzech taśm w jednym zamówieniu dla wskazanego kodu. Pozostałe materiały ściany lub sufitu g-k nadal mogą wymagać potwierdzonych ofert albo doboru technicznego; aplikacja nie może oznaczać całego remontu jako kompletnego na podstawie tych trzech produktów.
