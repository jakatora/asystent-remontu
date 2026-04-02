import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Strona nie znaleziona</h1>
        <p className="text-muted-foreground mb-6">Sprawdź adres lub wróć do strony głównej.</p>
        <Link href="/asystent-remontu" className="inline-flex px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
          Strona główna
        </Link>
      </div>
    </div>
  );
}
