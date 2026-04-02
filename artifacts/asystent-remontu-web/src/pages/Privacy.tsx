import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
            &larr; Strona główna
          </Link>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Polityka prywatności</h1>
          <p className="mt-2 text-muted-foreground">Ostatnia aktualizacja: 1 kwietnia 2026</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Informacje ogólne</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p>
                Niniejsza polityka prywatności określa zasady przetwarzania danych osobowych
                w aplikacji mobilnej <strong>Asystent Remontu</strong> (dalej: &bdquo;Aplikacja&rdquo;).
              </p>
              <p>
                Administratorem danych jest: <strong>[OWNER_NAME]</strong>, kontakt:{" "}
                <a href="mailto:kontakt@twojadomena.pl" className="text-primary hover:underline">kontakt@twojadomena.pl</a>.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Jakie dane zbieramy</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p><strong>Dane przechowywane lokalnie na urządzeniu:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Projekty remontowe (nazwa, pomiary, obliczenia, status)</li>
                <li>Listy zakupów i kalkulacje materiałów</li>
                <li>Zdjęcia dokumentacyjne dodane przez użytkownika</li>
                <li>Preferencje użytkownika (region cenowy, poziom jakości)</li>
                <li>Notatki i komentarze w projektach</li>
              </ul>
              <p className="mt-3">
                Powyższe dane <strong>nie są przesyłane na żadne zewnętrzne serwery</strong>.
                Są przechowywane wyłącznie w pamięci urządzenia i mogą być usunięte przez
                odinstalowanie aplikacji.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Konta użytkowników</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p>
                W obecnej wersji aplikacja <strong>nie wymaga tworzenia konta</strong> i nie
                przetwarza danych logowania. Funkcja synchronizacji z chmurą jest przygotowana
                technicznie, ale nie jest aktywna.
              </p>
              <p>
                Jeśli w przyszłości zostanie uruchomiona funkcja kont, niniejsza polityka
                zostanie odpowiednio zaktualizowana.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Moduł wykonawców</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p>
                Aplikacja zawiera moduł &bdquo;Znajdź fachowca&rdquo;, który umożliwia przeglądanie profili
                wykonawców i wysyłanie zapytań ofertowych. W obecnej wersji moduł działa
                w trybie demonstracyjnym z przykładowymi danymi.
              </p>
              <p>
                Formularz rejestracji wykonawcy zbiera dane takie jak: imię i nazwisko, nazwa firmy,
                NIP, specjalizacje, zakres działania. Te dane są przechowywane lokalnie i nie są
                przesyłane do zewnętrznych systemów w wersji demonstracyjnej.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Analityka i raportowanie błędów</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p>
                Aplikacja może wykorzystywać narzędzia do raportowania błędów (np. Sentry) w celu
                poprawy stabilności. W takim przypadku zbierane są wyłącznie dane techniczne
                dotyczące błędów (typ urządzenia, wersja systemu, opis błędu).
              </p>
              <p>
                Raportowanie błędów jest opcjonalne i może być wyłączone. Status tej funkcji
                jest widoczny w ustawieniach aplikacji.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Prawa użytkownika</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p>Zgodnie z RODO (Rozporządzenie 2016/679), przysługują Ci następujące prawa:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Prawo dostępu do swoich danych</li>
                <li>Prawo do sprostowania danych</li>
                <li>Prawo do usunięcia danych (&bdquo;prawo do bycia zapomnianym&rdquo;)</li>
                <li>Prawo do ograniczenia przetwarzania</li>
                <li>Prawo do przenoszenia danych</li>
                <li>Prawo do sprzeciwu wobec przetwarzania</li>
              </ul>
              <p className="mt-3">
                Ponieważ dane są przechowywane lokalnie na urządzeniu, masz pełną kontrolę nad
                nimi. Możesz je usunąć w dowolnym momencie poprzez odinstalowanie aplikacji
                lub wyczyszczenie danych w ustawieniach systemu.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Usunięcie danych</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-3">
              <p>Aby usunąć wszystkie swoje dane z aplikacji:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Usuń poszczególne projekty w aplikacji (Ustawienia → Projekty)</li>
                <li>Lub odinstaluj aplikację z urządzenia — wszystkie dane zostaną automatycznie usunięte</li>
                <li>Lub wyczyść dane aplikacji w ustawieniach systemu operacyjnego</li>
              </ol>
              <p className="mt-3">
                W przypadku pytań dotyczących usuwania danych, skontaktuj się z nami pod
                adresem:{" "}
                <a href="mailto:kontakt@twojadomena.pl" className="text-primary hover:underline">kontakt@twojadomena.pl</a>.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Zmiany w polityce prywatności</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed">
              <p>
                Zastrzegamy sobie prawo do aktualizacji niniejszej polityki prywatności.
                O istotnych zmianach poinformujemy użytkowników za pośrednictwem aktualizacji
                aplikacji lub komunikatu w aplikacji.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Kontakt</h2>
            <div className="rounded-xl border border-border bg-card p-6 text-foreground leading-relaxed space-y-2">
              <p>
                W sprawach dotyczących ochrony danych osobowych prosimy o kontakt:
              </p>
              <p>
                E-mail:{" "}
                <a href="mailto:kontakt@twojadomena.pl" className="text-primary hover:underline">kontakt@twojadomena.pl</a>
              </p>
              <p>
                Strona:{" "}
                <a href="https://twojadomena.pl" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">twojadomena.pl</a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>&copy; 2026 Asystent Remontu</span>
          <Link href="/pomoc" className="text-primary hover:underline">Pomoc i wsparcie</Link>
        </div>
      </footer>
    </div>
  );
}
