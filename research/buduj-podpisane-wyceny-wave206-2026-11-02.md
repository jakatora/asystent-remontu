# W206 — połączenie Buduj24 przez istniejącą usługę wycen

Po wdrożeniu W205 rzeczywiste porównania HTTP potwierdziły 502,09 zł za trzy kolory Viva. Publiczny test UI ujawnił jednak brak wyceny po zmianie kodu pocztowego. Zachowano oba nieudane przebiegi; dostawa pozostała nieznana, bez fikcyjnego zera.

Diagnostyka z 2026-11-02 15:32:03 UTC dla tej samej przypiętej karty Buduj24: serwer API — UND_ERR_CONNECT_TIMEOUT po 10533 ms; istniejący serwer WWW — HTTP 200 w 712 ms; lokalnie — HTTP 200 w 461 ms. Nie zaobserwowano HTTP 403 ani 429. Artefakt: G:/Projekty/asystent-remontu-work/wave205-release-20261102/buduj-network-probes.json.

Rozszerzono istniejący podpisany transport między API i WWW o Buduj24. Wykorzystuje ten sam adapter kart i rzeczywistych koszyków, z kontrolą GTIN, ceny brutto, pełnych opakowań i zapasu. Odczyt ceny wskazuje wyłącznie przypięte źródło po identyfikatorze. Wycena Buduj24 pozostaje taryfą krajową PL, bez pola postalCode i bez twierdzenia, że sklep osobno sprawdził kod. Koszyki ABUD/eTak/Chemia zachowują dotychczasowe wymagania kodu.

Podpis, nonce, termin ważności, związanie odpowiedzi z żądaniem i limity kolejki pozostają zachowane. Niedostępność bezpośredniego połączenia API nie powstrzymuje wywołania odrębnej podpisanej usługi. Błędy zapasu, ceny, reguł zakupów, HTTP 429 oraz zajętej kolejki nadal nie inicjują alternatywnego ruchu do sklepu. Jeżeli obie ścieżki zawiodą, obowiązuje dotychczasowy 30-sekundowy cache błędu. Stawka z innego kodu nie staje się potwierdzeniem adresowym.

Cztery nowe testy najpierw nie przechodzą na W205, a po zmianie przechodzą. Obejmują odtworzenie rzeczywistego koszyka przez podpisany HTTP, zdrową usługę przy niedostępności połączenia API, przypięty odczyt ceny i zapasu oraz odrzucenie fałszywego zakresu kodu, adresu źródła, rabatu i terminu ważności. Test istniejącego nieudanego połączenia zaktualizowano do próby drugiej ścieżki i rzeczywistego czasu ujemnego cache. Skupiony zestaw 21 testów i typy API PASS.

Wdrożenie w kolejności: najpierw zgodna usługa WWW, potem API. Następnie rzeczywisty test kodów 30-001 i 00-001, odświeżenia, kopii koszyka oraz kontrola zachowania historii cen. Pełne czyste testy i wdrożenie są w toku. W205 nie ma końcowego zielonego raportu publicznego UI; należy go zamknąć dopiero po rzeczywistym sprawdzeniu naprawy. Cel rozwoju ACTIVE; binaria sklepowe 1.2.0 (10) bez ponownej wysyłki.
