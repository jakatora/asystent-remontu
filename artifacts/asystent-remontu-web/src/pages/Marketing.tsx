import { Link } from "wouter";

const FEATURES = [
  {
    icon: "📐",
    title: "Kalkulator materiałów",
    desc: "Podaj wymiary, a aplikacja obliczy dokładnie ile materiałów potrzebujesz. Obsługuje ponad 60 rodzajów prac.",
  },
  {
    icon: "🛒",
    title: "Lista zakupów",
    desc: "Automatyczna lista z podziałem na materiały i narzędzia. Zaznaczaj kupione pozycje, edytuj ceny i ilości.",
  },
  {
    icon: "💰",
    title: "Kosztorys referencyjny",
    desc: "Orientacyjne ceny materiałów i robocizny w Twoim regionie. Warianty: ekonomiczny, standardowy, premium.",
  },
  {
    icon: "📋",
    title: "Zarządzanie projektami",
    desc: "Zapisuj projekty, śledź postęp, dodawaj zdjęcia i notatki. Checklist krok po kroku.",
  },
  {
    icon: "📖",
    title: "Poradnik dla początkujących",
    desc: "Instrukcje krok po kroku, ostrzeżenia bezpieczeństwa, ocena trudności i rekomendacje kiedy zatrudnić fachowca.",
  },
  {
    icon: "🔧",
    title: "Znajdź fachowca",
    desc: "Przeglądaj profile wykonawców, porównuj specjalizacje i opinie, wysyłaj zapytania ofertowe.",
  },
];

const CATEGORIES = [
  "Malowanie i tapetowanie",
  "Podłogi i panele",
  "Płytki i ceramika",
  "Łazienki i hydraulika",
  "Elektryka",
  "Tynki i gładzie",
  "Izolacje i ocieplenia",
  "Prace konstrukcyjne",
  "Instalacje specjalne",
];

export default function Marketing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-lg font-bold">AR</span>
            </div>
            <span className="font-bold text-foreground text-lg">Asystent Remontu</span>
          </div>
          <nav className="hidden sm:flex gap-6 text-sm text-muted-foreground">
            <a href="#funkcje" className="hover:text-primary transition-colors">Funkcje</a>
            <a href="#kategorie" className="hover:text-primary transition-colors">Kategorie</a>
            <Link href="/pomoc" className="hover:text-primary transition-colors">Pomoc</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-b from-accent/50 to-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>🏠</span>
            <span>Aplikacja na iOS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
            Zaplanuj swój remont <br className="hidden sm:block" />
            <span className="text-primary">od A do Z</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Asystent Remontu pomaga obliczyć potrzebne materiały, przygotować listę zakupów,
            oszacować koszty i prowadzi krok po kroku przez każdy rodzaj pracy.
            Idealny dla początkujących i doświadczonych remontowców.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-2xl">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-80">Pobierz z</div>
                <div className="text-base font-semibold">App Store</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funkcje" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Główne funkcje</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Wszystko czego potrzebujesz do zaplanowania i zrealizowania remontu w jednym miejscu.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card border-y border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Zrzuty ekranu</h2>
            <p className="mt-3 text-muted-foreground">Zobacz jak wygląda aplikacja w działaniu</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Dashboard", "Kalkulator", "Lista zakupów", "Kosztorys"].map((label, i) => (
              <div
                key={i}
                className="aspect-[9/19.5] rounded-2xl bg-muted border border-border flex items-center justify-center"
              >
                <div className="text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary text-xl">📱</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  <p className="text-xs text-muted-foreground/70 mt-1">Zrzut ekranu wkrótce</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kategorie" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">9 kategorii prac</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Ponad 60 rodzajów prac remontowych z dokładnymi kalkulacjami materiałów
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium border border-border"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card border-y border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Dlaczego Asystent Remontu?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Dla początkujących</p>
                  <p className="text-sm text-muted-foreground">Nie musisz znać się na remontach. Aplikacja poprowadzi Cię krok po kroku i ostrzeże przed niebezpiecznymi pracami.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Bez rejestracji</p>
                  <p className="text-sm text-muted-foreground">Otwórz i korzystaj. Bez tworzenia konta, bez logowania, bez podawania danych osobowych.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Działa offline</p>
                  <p className="text-sm text-muted-foreground">Kalkulator, projekty, lista zakupów — wszystko działa bez internetu. Idealne do użycia w sklepie budowlanym.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Po polsku</p>
                  <p className="text-sm text-muted-foreground">Cała aplikacja jest w języku polskim z cenami dostosowanymi do polskiego rynku budowlanego.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Pobierz za darmo</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Zaplanuj swój następny remont z Asystentem Remontu. Dostępny w App Store.
          </p>
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-2xl">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-80">Pobierz z</div>
              <div className="text-base font-semibold">App Store</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">AR</span>
              </div>
              <span>&copy; 2026 Asystent Remontu</span>
            </div>
            <nav className="flex gap-6">
              <Link href="/pomoc" className="hover:text-primary transition-colors">Pomoc</Link>
              <Link href="/polityka-prywatnosci" className="hover:text-primary transition-colors">Prywatność</Link>
              <a href="mailto:kontakt@twojadomena.pl" className="hover:text-primary transition-colors">Kontakt</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
