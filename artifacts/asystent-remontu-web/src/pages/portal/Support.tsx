export default function PortalSupport() {
  const supportItems = [
    { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'E-mail ogolny', desc: 'pomoc@asystentremontu.pl', sub: 'Odpowiadamy w ciagu 24h' },
    { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: 'Wsparcie rozliczeniowe', desc: 'faktury@asystentremontu.pl', sub: 'Pytania o platnosci i faktury' },
    { icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title: 'Pomoc z weryfikacja', desc: 'weryfikacja@asystentremontu.pl', sub: 'Dokumenty i status weryfikacji' },
    { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', title: 'Zgloszenia i moderacja', desc: 'moderacja@asystentremontu.pl', sub: 'Problemy ze zgloszeniami lub proflem' },
  ];

  const faqItems = [
    { q: 'Jak zmienic plan?', a: 'Przejdz do sekcji "Plany i Widocznosc", wybierz nowy plan i kliknij "Ulepsz" lub "Zmien".' },
    { q: 'Jak aktywowac promocje profilu?', a: 'W sekcji "Promocje" mozesz przegladac i aktywowac dostepne sloty promocyjne.' },
    { q: 'Jak pobrac fakture?', a: 'Przejdz do "Rozliczenia" > "Faktury" i kliknij "Pobierz PDF" przy wybranej fakturze.' },
    { q: 'Jak zweryfikowac konto?', a: 'Skontaktuj sie z zespolem weryfikacji, aby rozpoczac proces weryfikacji dokumentow.' },
    { q: 'Czy moge anulowac plan?', a: 'Tak, mozesz anulowac auto-odnowienie planu w sekcji ustawien konta.' },
    { q: 'Jak zmienic dane do faktury?', a: 'Dane do faktury mozna edytowac w sekcji "Ustawienia" > "Dane do faktury".' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pomoc i wsparcie</h1>
        <p className="text-slate-500 mt-1">Skontaktuj sie z naszym zespolem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-orange-200 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{item.title}</h3>
                <p className="text-sm text-orange-600 mt-1">{item.desc}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Czesto zadawane pytania</h2>
        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <details key={idx} className="group border border-slate-100 rounded-lg overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition">
                <span className="text-sm font-medium text-slate-900">{item.q}</span>
                <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-600">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-medium text-slate-900 mb-2">Linki prawne</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-orange-600 hover:text-orange-700">Regulamin serwisu</a></li>
            <li><a href="#" className="text-orange-600 hover:text-orange-700">Polityka prywatnosci</a></li>
            <li><a href="#" className="text-orange-600 hover:text-orange-700">Warunki korzystania z portalu wykonawcy</a></li>
          </ul>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
          <h3 className="font-medium text-slate-900 mb-2">Pilna sprawa?</h3>
          <p className="text-sm text-slate-600 mb-3">W naglyxh przypadkach skontaktuj sie telefonicznie.</p>
          <p className="text-lg font-semibold text-orange-600">+48 22 000 00 00</p>
          <p className="text-xs text-slate-500 mt-1">Pon-Pt 9:00 - 17:00</p>
        </div>
      </div>
    </div>
  );
}
