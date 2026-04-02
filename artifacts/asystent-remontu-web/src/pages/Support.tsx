import { Link } from "wouter";

const FAQ = [
  {
    q: "Jak obliczyć materiały na remont?",
    a: "Wybierz rodzaj pracy z listy (np. malowanie ścian, układanie płytek), podaj wymiary pomieszczenia w kreatorze, a aplikacja automatycznie obliczy potrzebne materiały — ilość farby, gładzi, kleju, płytek czy paneli.",
  },
  {
    q: "Jak zapisać i zarządzać projektami?",
    a: 'Po ukończeniu kalkulacji możesz zapisać projekt. Wszystkie projekty są dostępne w zakładce "Projekty". Możesz zmieniać ich status, dodawać zdjęcia, generować listy zakupów i śledzić postęp.',
  },
  {
    q: "Czy mogę edytować ceny materiałów?",
    a: 'Tak. W zakładce "Kosztorys" możesz kliknąć na dowolny materiał lub pozycję robocizny i wpisać własną cenę. Aplikacja przeliczy kosztorys automatycznie. Możesz też przywrócić cenę domyślną.',
  },
  {
    q: "Czym są ceny referencyjne?",
    a: "Ceny referencyjne to orientacyjne stawki materiałów i robocizny oparte na średnich rynkowych. Nie są to ceny sklepowe w czasie rzeczywistym — służą do szacunkowego porównania kosztów. Zawsze sprawdź aktualne ceny w lokalnym sklepie budowlanym.",
  },
  {
    q: "Jak działa lista zakupów?",
    a: "Lista zakupów jest generowana automatycznie na podstawie kalkulacji. Możesz zaznaczać kupione pozycje, edytować ilości i ceny, oznaczać rzeczy które już posiadasz, oraz udostępnić listę przez SMS lub e-mail.",
  },
  {
    q: "Jak znaleźć fachowca?",
    a: 'W module "Znajdź fachowca" możesz przeglądać profile wykonawców, filtrować według specjalizacji i lokalizacji, porównywać opinie, oraz wysyłać zapytania ofertowe. Moduł jest w fazie rozwoju \u2014 profile są demonstracyjne.',
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Tak. Wszystkie dane (projekty, kalkulacje, zdjęcia) są przechowywane lokalnie na Twoim urządzeniu. Aplikacja nie wymaga logowania i nie wysyła danych na zewnętrzne serwery.",
  },
  {
    q: "Czy aplikacja działa offline?",
    a: "Tak, w pełni. Wszystkie funkcje — kalkulator, projekty, lista zakupów, kosztorys — działają bez połączenia z internetem.",
  },
  {
    q: "Jak usunąć swoje dane?",
    a: "Ponieważ dane są przechowywane wyłącznie na Twoim urządzeniu, możesz je usunąć odinstalowując aplikację lub czyszcząc dane aplikacji w ustawieniach systemu.",
  },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
            &larr; Strona główna
          </Link>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Pomoc i wsparcie</h1>
          <p className="mt-2 text-muted-foreground">Asystent Remontu — aplikacja do planowania remontów</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">O aplikacji</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-foreground leading-relaxed">
              <strong>Asystent Remontu</strong> to aplikacja mobilna pomagająca zaplanować remont domowy od A do Z.
              Oblicza potrzebne materiały, generuje listy zakupów, szacuje koszty i prowadzi krok po kroku
              przez ponad 60 rodzajów prac remontowych — od malowania ścian po układanie płytek.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Najczęściej zadawane pytania</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-4 font-medium text-foreground hover:bg-accent/50 transition-colors list-none flex items-center justify-between">
                  <span>{item.q}</span>
                  <svg
                    className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Kontakt</h2>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">E-mail</p>
              <a href="mailto:kontakt@twojadomena.pl" className="text-primary hover:underline font-medium">
                kontakt@twojadomena.pl
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Czas odpowiedzi</p>
              <p className="text-foreground">Staramy się odpowiadać w ciągu 48 godzin w dni robocze.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Strona internetowa</p>
              <a href="https://twojadomena.pl" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                twojadomena.pl
              </a>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-xl border border-border bg-accent/30 p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Przeczytaj także naszą{" "}
              <Link href="/polityka-prywatnosci" className="text-primary hover:underline">
                Politykę prywatności
              </Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 text-center text-sm text-muted-foreground">
          &copy; 2026 Asystent Remontu. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
