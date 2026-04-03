import { useLocation, Link } from 'wouter';
import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ASSIGNMENT_STATE_LABELS, ASSIGNMENT_STATE_COLORS } from '@/lib/portal-types';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { path: '/portal/contractor', label: 'Panel glowny', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/portal/contractor/profile', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { path: '/portal/contractor/plans', label: 'Plany i Widocznosc', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { path: '/portal/contractor/billing', label: 'Rozliczenia', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { path: '/portal/contractor/promotions', label: 'Promocje', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { path: '/portal/contractor/usage', label: 'Uzycie i limity', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/portal/contractor/support', label: 'Pomoc', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { path: '/portal/contractor/settings', label: 'Ustawienia', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export function PortalLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { profile, access, authState, isAdmin, isTestMode, signOut } = usePortal();

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Portal Wykonawcy</h2>
          <p className="text-slate-500 mb-6">Zaloguj sie, aby uzyskac dostep do panelu wykonawcy.</p>
          <button onClick={() => { /* mock sign in */ window.location.reload(); }} className="inline-block bg-orange-500 text-white font-semibold rounded-lg px-6 py-3 hover:bg-orange-600 transition cursor-pointer">
            Zaloguj sie
          </button>
        </div>
      </div>
    );
  }

  if (authState === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Konto zawieszone</h2>
          <p className="text-slate-500 mb-4">Twoje konto wykonawcy zostalo zawieszone. Skontaktuj sie z nami.</p>
          <p className="text-sm text-slate-400">pomoc@asystentremontu.pl</p>
        </div>
      </div>
    );
  }

  if (authState === 'inactive') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Konto nieaktywne</h2>
          <p className="text-slate-500 mb-4">Twoje konto wykonawcy jest nieaktywne. Aktywuj je, aby kontynuowac.</p>
          <p className="text-sm text-slate-400">pomoc@asystentremontu.pl</p>
        </div>
      </div>
    );
  }

  if (authState === 'pending_activation') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-blue-600 mb-2">Oczekuje na aktywacje</h2>
          <p className="text-slate-500 mb-4">Twoje konto wykonawcy czeka na weryfikacje i aktywacje. Otrzymasz powiadomienie e-mail.</p>
          <p className="text-sm text-slate-400">pomoc@asystentremontu.pl</p>
        </div>
      </div>
    );
  }

  const isAdminPage = location.startsWith('/portal/contractor/admin');
  if (isAdminPage && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Brak dostepu</h2>
          <p className="text-slate-500 mb-4">Nie masz uprawnien do panelu administracyjnego.</p>
          <Link href="/portal/contractor" className="text-sm text-orange-600 hover:text-orange-700">Wroc do panelu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full">
        <div className="p-5 border-b border-slate-100">
          <Link href="/portal/contractor" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{profile.displayName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">{profile.displayName}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: PLAN_COLORS[access.currentPlanId] }} />
                <span className="text-xs text-slate-500">{PLAN_LABELS[access.currentPlanId]}</span>
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location === item.path || (item.path !== '/portal/contractor' && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          {isTestMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs font-medium text-amber-700">Tryb testowy</p>
              <p className="text-xs text-amber-600">Platnosci nie sa aktywne</p>
            </div>
          )}
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Wyloguj sie
          </button>
        </div>
      </aside>

      <div className="lg:ml-64 flex-1 min-h-screen">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <Link href="/portal/contractor" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{profile.displayName.charAt(0)}</span>
            </div>
            <span className="font-semibold text-sm text-slate-900">Portal Wykonawcy</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: PLAN_COLORS[access.currentPlanId] + '15', color: PLAN_COLORS[access.currentPlanId] }}>
              {PLAN_LABELS[access.currentPlanId]}
            </span>
          </div>
        </header>

        <nav className="lg:hidden bg-white border-b border-slate-200 px-2 py-2 overflow-x-auto sticky top-[52px] z-20">
          <div className="flex gap-1 min-w-max">
            {NAV_ITEMS.map((item) => {
              const active = location === item.path || (item.path !== '/portal/contractor' && location.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path}
                  className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition ${active ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="p-4 lg:p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
