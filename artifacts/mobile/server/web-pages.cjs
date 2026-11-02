// Operator name source: https://apps.apple.com/pl/app/remont-asystent/id6761497453
// Public application information; data flow reviewed for native 1.2.0 and web.
const pages={
  "/pomoc": {
    "title": "Pomoc — Asystent Remontu",
    "heading": "Zaplanuj zakupy na cały remont",
    "sections": [
      [
        "Od obmiaru do koszyka",
        "Dodaj projekt, wybierz rodzaj pracy i wpisz wymiary. Zapisz obliczenia, a następnie dodaj pozostałe pomieszczenia. We wspólnym koszyku zaznacz prace, które chcesz porównać razem. Te same produkty sumujemy przed zakupem pełnych opakowań."
      ],
      [
        "Gdzie kupię najtaniej?",
        "Wybierz dostawę i podaj swój kod pocztowy. Porównujemy materiały razem z dostawami. Dla części sklepów dostępna jest taryfa krajowa, a dla innych wycena konkretnego kodu — zakres jest podany przy wyniku. Możesz dopuścić osobne zamówienia, aby sprawdzić tańszy podział zakupów."
      ],
      [
        "Niepełna wycena",
        "Brak oferty, nieznana ilość lub niepotwierdzona dostawa pozostają widoczne. Nie oznaczają darmowego materiału. Wynik wskazuje najtańszy potwierdzony wariant w zakresie dostępnych ofert, nie cenę wszystkich sklepów na rynku."
      ],
      [
        "Aktualność cen",
        "Odśwież wycenę przed zakupem. Aplikacja pokazuje czas sprawdzenia, zmiany cen i ważność potwierdzenia dostawy. Zamówienie kończysz w wybranym sklepie."
      ],
      [
        "Gdzie są moje projekty?",
        "Na telefonie projekty są zapisane w lokalnej bazie aplikacji, a w wersji webowej w tej przeglądarce i dla tego adresu. Nie przenoszą się automatycznie między urządzeniami. Sprawdź dostępne na Twojej platformie opcje w Ustawieniach. Import i eksport pliku kopii remontu są obecnie dostępne w przeglądarce. Przed zakupem odśwież ceny i dostawy."
      ],
      [
        "Kontakt",
        "Napisz do jakatora68@gmail.com. Podaj wersję aplikacji, system urządzenia oraz opis problemu. Nie przesyłaj haseł, danych karty ani pełnego adresu dostawy."
      ]
    ]
  },
  "/polityka-prywatnosci": {
    "title": "Polityka prywatności — Remont Asystent",
    "heading": "Polityka prywatności aplikacji",
    "sections": [
      [
        "Administrator i kontakt",
        "Administratorem danych związanych z aplikacją Remont Asystent, używającą również nazwy Asystent Remontu, jest Krzysztof Kapusta. Kontakt w sprawach aplikacji i danych: jakatora68@gmail.com. Informacja obejmuje wersję 1.2.0 na Androida i iOS oraz udostępnioną wersję przeglądarkową."
      ],
      [
        "Lokalne projekty i zdjęcia",
        "Obmiary, projekty, listy zakupów, notatki i własne zdjęcia remontu zapisują się lokalnie na urządzeniu lub w przeglądarce. Aplikacja nie synchronizuje ich automatycznie z kontem w chmurze. Zdjęcia i notatki nie są przesyłane w zapytaniach o ceny materiałów. Dane pozostają do czasu ich usunięcia przez użytkownika; odinstalowanie aplikacji lub wyczyszczenie danych przeglądarki może je usunąć. System operacyjny może uwzględniać lokalne dane w kopii urządzenia zgodnie z jego ustawieniami."
      ],
      [
        "Porównanie ofert i dostawy",
        "Gdy korzystasz z porównania, do API wyceny trafiają informacje potrzebne do zapytania: nazwy i kody materiałów, ilości, parametry prac oraz techniczne identyfikatory pozycji. Przy dostawie przesyłany jest wpisany kod pocztowy. Pełny adres, nazwisko i dane płatnicze nie są potrzebne. Serwer kontaktuje się z wybranymi sklepami i może przekazać kod pocztowy sklepowi, który wymaga go do wyceny. Nie składa zamówienia w Twoim imieniu."
      ],
      [
        "Bufory i historia cen",
        "Wyniki zapytań o koszyki są buforowane w pamięci usługi, aby ograniczyć powtarzane sprawdzenia. Potwierdzenie dostawy ma własny krótki termin ważności, zwykle do 10 minut; nie jest to deklaracja usunięcia wpisu dokładnie w tej chwili. Bufor mieści ograniczoną liczbę koszyków, a wpisy są zastępowane kolejnymi lub usuwane przy restarcie usługi. Trwała historia cen zawiera obserwacje publicznych produktów i sklepów, nie lokalną bazę Twoich projektów."
      ],
      [
        "Połączenia sieciowe i odbiorcy",
        "API i wersja przeglądarkowa korzystają z hostingu Railway. Obsługa połączeń i ochrona przed nadużyciami wymagają przetwarzania standardowych danych sieciowych, takich jak adres IP. Zdjęcia produktów pobierane są z zewnętrznych serwerów sklepów i producentów, którym połączenie również ujawnia dane sieciowe. Po otwarciu strony sklepu lub mapy korzystasz z usługi tego podmiotu i jego zasad prywatności. Infrastruktura dostawców może znajdować się poza Europejskim Obszarem Gospodarczym."
      ],
      [
        "Uprawnienia telefonu",
        "Aparat i systemowy wybór zdjęcia służą do dodania fotografii remontu. Lokalizacja może być używana przez opcjonalne funkcje związane z okolicą i mapą wykonawców. Odmowa uprawnień nie blokuje podstawowego kalkulatora. Aplikacja nie wymaga lokalizacji w tle ani nagrywania mikrofonu do planowania i porównywania zakupów."
      ],
      [
        "Konta, analityka i reklamy",
        "Lokalne planowanie i porównanie nie wymagają utworzenia konta. W wydaniu 1.2.0 synchronizacja Supabase i raportowanie Sentry nie są skonfigurowane. Nie sprzedajemy danych użytkowników i nie prowadzimy reklamowego śledzenia między aplikacjami. Moduł wykonawców zawiera dane demonstracyjne; nie wysyła zapytania do rzeczywistej ekipy."
      ],
      [
        "Kopie, usuwanie i kontakt",
        "Własne projekty usuwa się w aplikacji, a wszystkie lokalne dane można wyczyścić w Ustawieniach. Dostępne opcje kopii zależą od platformy; plik kopii może zawierać prywatne notatki i zdjęcia, więc udostępniaj go świadomie. W sprawie dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania danych po stronie usługi napisz na adres kontaktowy. Masz również prawo zgłosić skargę do właściwego organu ochrony danych."
      ]
    ]
  },
  "/regulamin": {
    "title": "Zasady korzystania — Asystent Remontu",
    "heading": "Zasady korzystania z aplikacji",
    "sections": [
      [
        "Planowanie i zakupy",
        "Aplikacja pomaga obliczyć zapotrzebowanie i porównać koszyk. Nie składa zamówienia ani nie pobiera płatności za materiały. Zakup, płatność, dostępność i ostateczne warunki potwierdzasz w sklepie."
      ],
      [
        "Co obejmuje wynik",
        "Ceny dotyczą wskazanych produktów, opakowań i ilości. Koszt dostawy ma podany zakres i czas sprawdzenia. Niepełne pozycje, ograniczony zakres wyszukiwania i niepotwierdzone dostawy pozostają jawne. Rzeczywisty zakup może wymagać dodatkowych materiałów dobranych do konkretnego projektu."
      ],
      [
        "Dobór produktów",
        "Sprawdź instrukcję wybranego produktu, podłoże i wymagania wykonawcze. Warianty różnych systemów nie są automatycznie równoważne. Obliczenia zakupowe nie zastępują projektu konstrukcji ani wymaganego doboru przez fachowca."
      ],
      [
        "Zapisy lokalne",
        "Na telefonie projekty pozostają w lokalnej bazie aplikacji. W wersji webowej są przypisane do przeglądarki i adresu witryny. Zmiana urządzenia albo usunięcie danych nie przenosi projektów."
      ],
      [
        "Pomoc",
        "Instrukcję porównywania zakupów i opis lokalnych zapisów znajdziesz na stronie pomocy. Kontakt: jakatora68@gmail.com. Aktualizacja tej informacji: 2 listopada 2026 r."
      ]
    ]
  }
};
function escape(value){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderPage(page){return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)}</title><style>:root{font-family:system-ui,sans-serif;color:#0f172a;background:#f8fafc}*{box-sizing:border-box}body{margin:0}header,main,footer{max-width:760px;margin:auto;padding:24px}header{border-bottom:1px solid #e2e8f0}a{color:#9a3412;text-underline-offset:4px}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}nav a{display:inline-flex;align-items:center;min-height:44px;padding:8px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:10px}a:focus-visible{outline:3px solid #c2410c;outline-offset:3px}h1{font-size:clamp(26px,5vw,36px);line-height:1.2;margin:16px 0 28px}h2{font-size:20px;margin:0 0 8px}p{font-size:16px;line-height:1.7;margin:0}section{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin:16px 0}footer{color:#475569;padding-top:8px}</style></head><body><header><strong>Asystent Remontu</strong><nav aria-label="Nawigacja"><a href="/">Otwórz aplikację</a><a href="/pomoc">Pomoc</a><a href="/polityka-prywatnosci">Prywatność</a><a href="/regulamin">Zasady korzystania</a></nav></header><main><h1>${escape(page.heading)}</h1>${page.sections.map(([title,body])=>`<section><h2>${escape(title)}</h2><p>${escape(body)}</p></section>`).join('')}</main><footer><p>Aktualizacja: 2 listopada 2026 · <a href="mailto:jakatora68@gmail.com">Kontakt z pomocą</a></p></footer></body></html>`;}
module.exports={pages,renderPage};
