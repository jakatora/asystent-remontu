# Asystent Remontu 1.2.1 (11) — wydanie i dowody

Stan na 2026-11-02T20:17:31.212Z.

Wydanie zawiera naprawę przycisku Dalej na powitaniu, fotografie materiałów w Koszt oraz bieżące ceny potwierdzonych modeli w Koszt i Narzędzia. Ceny brutto mają opakowanie, sklep, datę odczytu i zmianę względem poprzedniej zaakceptowanej obserwacji. Link Kup pozostaje osobną czynnością.

Cena nie jest kopiowana między różnymi modelami. Jawny przykład pędzla Kraus A50/50 mm/EAN5904178020035 ma własną ofertę Sewery i fotografię. Pozostałe narzędzia bez dokładnego modelu mają niepotwierdzoną cenę. Katalog nadal ma 33 wcześniejsze luki; ten raport nie potwierdza cen wszystkich produktów. Pędzel nie jest automatycznie dodawany do wspólnego koszyka.

## Źródła i artefakty

- WWW i API: źródło 62952f791819c2a2a03218c11baac6086ad881ae, wdrożenia API3368c1bd-e8d7-4be1-9e88-dc04070d4eb7 i WWW11e46afb-2472-46ae-868f-3cabbe3b4a58 SUCCESS. Pełny dowód W210: G:/Projekty/asystent-remontu-work/wave210-20261102/release-proof.json.
- Zamrożone źródło aplikacji natywnej: feff7c19e9646f29b5356577cc337d342c5e3c1e; branch codex/store-patch-20261102; katalog G:/Projekty/asystent-remontu-release-1-2-1-20261102. Późniejsze poprawki CI nie zmieniają plików aplikacji ani zależności.
- IPA 1.2.1(11): Codemagic6ae8d478658c2a846563e3d3, SHA256 c0da1be7bed263ad0d0811334d3744b9d711caf4c297a46fadacab29faede582. Applebuild dfc63c01-6963-447e-932b-eddd17b0dc67 VALID.
- Android AAB: EAS e52aa88f-f5ec-4628-a2fd-488f9f3d4838, SHA256 5c7f7a728d7b2e90d009bd050f2cb7ce306f695d9388f0b8fd59ca394b9b9b67. APK: EAS a11eb234-3f35-4481-b111-a730c1eb66c6, SHA256 3ec719d02e17d09be6a60286a3e4d8067f7b36fb9081445d8b07975ceb1b0efb.
- APK/AAB: pl.asystentremontu.app, versionCode11; oba podpisy zgodne z opublikowanym upload certificate060bb3db364b08c01efce9e72c802d493925c2338d8bf068572c9dd5d02274d4. W obu po48 bibliotek64bit z ELF>=16KB; APKZIP16KB i AABPAGE_ALIGNMENT_16K PASS.
- Zapasowy Android Codemagic6ae8dba4639756c45d7914cc został odrzucony przez kontrolę innego certyfikatu. Nie jest użyty do publikacji.

## Weryfikacja

Czyste testy aplikacji:604 mobile, typy i build pricing PASS. W210 ponadto252 pricing/190 APIlib/1064 shared i66 legacy PASS (zbiory pokrywają się, nie sumować). Lokalnie10 i publicznie9 kontroli CUA; publiczne63 assety WWW/150 plików API zgodne,149 pozostałych plików i385 seed zachowane. Faktyczne ceny pobrano przez klienta aplikacji.

| Przebieg | Build | Stan CI | Wyniki przypadków |
|---|---|---|---|
| iOS build IPA | 6ae8d478658c2a846563e3d3 | finished | wynik funkcjonalny niepotwierdzony |
| iOS powitanie i koszyk | 6ae8dd9f5953172967559527 | failed | 01-welcome: SUCCESS; 02-product-prices: ERROR; 03-basket: SUCCESS |
| iOS wygasły link testowy | 6ae8e4654b9b2abeabc6242e | failed | wynik funkcjonalny niepotwierdzony |
| iOS selektory dostępności | 6ae8e61270f65b1db0239a74 | failed | 01-welcome: SUCCESS; 02-product-prices: ERROR; 03-basket: ERROR |
| iOS końcowe selektory | 6ae8e92e6a3bbddbd7f99234 | finished | 01-welcome: SUCCESS; 02-product-prices: SUCCESS; 03-basket: SUCCESS |
| Android pierwsza nawigacja | 6ae8e2f10a39391d8e4be6e7 | failed | 01-welcome: SUCCESS; 02-product-prices: ERROR; 03-basket: ERROR |
| Android ceny w kartach | 6ae8e57e0c265440f5efc7da | failed | wynik funkcjonalny niepotwierdzony |
| Android pełny test | 6ae8e7259ca8531f991aa467 | failed | 01-welcome: ERROR; 02-product-prices: ERROR; 03-basket: ERROR |
| Android powtórka po awarii launchera | 6ae8ea97a14b695ad658efb8 | failed | 01-welcome: ERROR; 02-product-prices: ERROR; 03-basket: ERROR |
| Android obsługa wyłącznie launchera | 6ae8ee5928fcdeb571964c26 | finished | 01-welcome: SUCCESS; 02-product-prices: SUCCESS; 03-basket: SUCCESS |

Porażki testów są zachowane. W pierwszych próbach nie zadziałały bezpośrednie linki tuż po uruchomieniu; ekran pozostał na stronie głównej, przyczyny czasowej nie uznano za udowodnioną. Kolejne testy prowadzą przez Odkryj, kategorię, zadanie i Projekty. Na Androidzie ceny rzeczywiście przeszły przed poprawieniem niejednoznacznego selektora Projekty (statystyka i dolna zakładka mają tę samą nazwę). Na iOS ekran Koszt był widoczny, ale jego AX zawiera ikonę i nazwę; poprawiono selektory testowe. Wygasły minutowy link do archiwum iOS zastąpiono pobraniem podpisanego przekierowania bezpośrednio przed odczytem. Archiwum oraz tar mają przypięte SHA, a token Codemagic nie jest przekazywany do serwera przechowującego plik. To nadal ta sama skompilowana aplikacja. Ostatni pełny test Androida został zablokowany systemowym komunikatem Pixel Launcher is not responding; powitanie Asystenta było widoczne pod modalem. Jego trzy porażki są zachowane, a powtórka na świeżym emulatorze używa identycznych testów i identycznego podpisanego APK.

Ograniczenia: testy natywne dotyczą emulatorów/symulatora, bez fizycznego telefonu. Zaobserwowany iOS koszyk pokrywa wszystkie pozycje:307,46zł materiały +48,90zł dostawa =356,36zł. UI jawnie pokazał porównanie niepełne, bo3 inne sklepy nie zwróciły wyceny; to najtańszy potwierdzony koszyk. Nie deklarować minimum wszystkich sklepów w Polsce.

## Sklepy

- Google Play1.2.1(11): wysłane do oceny 2026-11-02T20:17:23.471Z. Opisy i kontakt pozostają zachowane. Poprzednie1.2.0(10) było opublikowane.
- Apple1.2.1(11): wysłane 2026-11-02T20:06:48.770Z, stan WAITING_FOR_REVIEW. Prywatność,2 lokalizacje,2 screenshoty na lokalizację oraz AFTER_APPROVAL są zachowane.
- Tymczasowe zmienne CI do odczytu archiwum: usunięte po testach, oryginalny vault i klucze podpisu nietknięte.

Artefakty i pełne niezmienione dowody: G:/Projekty/asystent-remontu-work/native-patch-20261102. Globalny cel runtime pozostaje PAUSED; wykonano ręczną prośbę o naprawy i wydanie, bez automatycznego wznowienia celu. Obce zmiany w głównym katalogu są chronione.
