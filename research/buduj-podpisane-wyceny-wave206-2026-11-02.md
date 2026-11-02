# W206 — połączenie Buduj24 przez istniejącą usługę wycen

Po wdrożeniu W205 rzeczywiste porównania HTTP potwierdziły 502,09 zł za trzy kolory Viva. Publiczny test UI ujawnił jednak brak wyceny po zmianie kodu pocztowego. Zachowano oba nieudane przebiegi; dostawa pozostała nieznana, bez fikcyjnego zera.

Diagnostyka z 2026-11-02 15:32:03 UTC dla tej samej przypiętej karty Buduj24: serwer API — UND_ERR_CONNECT_TIMEOUT po 10533 ms; istniejący serwer WWW — HTTP 200 w 712 ms; lokalnie — HTTP 200 w 461 ms. Nie zaobserwowano HTTP 403 ani 429. Artefakt: G:/Projekty/asystent-remontu-work/wave205-release-20261102/buduj-network-probes.json.

Rozszerzono istniejący podpisany transport między API i WWW o Buduj24. Wykorzystuje ten sam adapter kart i rzeczywistych koszyków, z kontrolą GTIN, ceny brutto, pełnych opakowań i zapasu. Odczyt ceny wskazuje wyłącznie przypięte źródło po identyfikatorze. Wycena Buduj24 pozostaje taryfą krajową PL, bez pola postalCode i bez twierdzenia, że sklep osobno sprawdził kod. Koszyki ABUD/eTak/Chemia zachowują dotychczasowe wymagania kodu.

Podpis, nonce, termin ważności, związanie odpowiedzi z żądaniem i limity kolejki pozostają zachowane. Niedostępność bezpośredniego połączenia API nie powstrzymuje wywołania odrębnej podpisanej usługi. Błędy zapasu, ceny, reguł zakupów, HTTP 429 oraz zajętej kolejki nadal nie inicjują alternatywnego ruchu do sklepu. Jeżeli obie ścieżki zawiodą, obowiązuje dotychczasowy 30-sekundowy cache błędu. Stawka z innego kodu nie staje się potwierdzeniem adresowym.

Cztery nowe testy najpierw nie przechodzą na W205, a po zmianie przechodzą. Obejmują odtworzenie rzeczywistego koszyka przez podpisany HTTP, zdrową usługę przy niedostępności połączenia API, przypięty odczyt ceny i zapasu oraz odrzucenie fałszywego zakresu kodu, adresu źródła, rabatu i terminu ważności. Test istniejącego nieudanego połączenia zaktualizowano do próby drugiej ścieżki i rzeczywistego czasu ujemnego cache. Skupiony zestaw 21 testów i typy API PASS.

Wdrożenie w kolejności: najpierw zgodna usługa WWW, potem API. Następnie rzeczywisty test kodów 30-001 i 00-001, odświeżenia, kopii koszyka oraz kontrola zachowania historii cen. Wdrożenie i jego ograniczenie opisano poniżej. W205 nie ma końcowego zielonego raportu publicznego UI; należy go zamknąć dopiero po rzeczywistym sprawdzeniu naprawy. Cel rozwoju ACTIVE; binaria sklepowe 1.2.0 (10) bez ponownej wysyłki.


## Wynik W206 i poprawka W207

Źródło7362f72, [PR186](https://github.com/jakatora/przetargai/pull/186), merge3f0e345. WWW42e5725a-d055-44cb-8590-47019a42c625 wdrożono przed API1f25feab-ff10-4742-96e8-7c3fe9811014, oba SUCCESS. Publiczny podpisany moduł potwierdził dwa natywne koszyki i dwa odczyty cen oraz skończonego zapasu. Odczyt 150 plików API i63 zasobów WWW zgadzał się z paczkami; seed385 bez zmian.

Czyste testy252 pricing /176 API /596 mobile /259 adapterów /1064 shared PASS, zero fail/skip; typy i66 legacy prac PASS. Lokalnie12 UI /10 API /2 kopie /12 HTTP PASS. W dwóch procesach wyłączono bezpośrednią ścieżkę API do Buduj24, podczas gdy WWW wykonywało rzeczywiste żądania do sklepu; nie podstawiano cen ani dostaw.

Publiczne8 nowych HTTP i4 wcześniejsze przeszły. Pełny UI na W206 zakończył się po9 przypadkach: po zmianie kodu Buduj24 ponownie nie odpowiadał. Diagnostyka potwierdziła tryb client i skonfigurowany klucz. Późniejsza próba podpisanego modułu również zwróciła retailer_connection_unavailable. Ta ścieżka poprawia dostępność, lecz nie gwarantuje odpowiedzi sprzedawcy. Nie oznaczono W206 jako pełnego sukcesu publicznego UI; nieudane odpowiedzi zachowano.

W207 wykorzystuje ważne potwierdzenie dla kraju PL, kiedy zmienia się tylko kod i identyczny koszyk. Wycena dla nowego kodu ABUD jest nadal odrębna. Ostateczne 12 przypadków publicznego UI, kopie i test zachowania oryginalnego czasu wyceny przechodzą na źródle 3aeffe511df0920bfc812c94b0221b8dcd0fba1f; WWW pozostaje zgodne na 7362f72880a3e6ff7f64da62d84a5763f2fc7780. Szczegóły: buduj-krajowa-wycena-kod-wave207-2026-11-02.md. W206 nie dodaje nowych produktów; 4 referencje i7 ofert pochodzą z W205. Cel ACTIVE.
