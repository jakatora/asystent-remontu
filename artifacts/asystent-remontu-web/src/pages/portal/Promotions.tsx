import { usePortal } from '@/lib/portal-context';
import { PROMOTION_SCOPE_LABELS } from '@/lib/portal-types';

export default function PortalPromotions() {
  const { promotions, access } = usePortal();
  const active = promotions.filter((p) => p.isActive);
  const expired = promotions.filter((p) => !p.isActive);
  const maxSlots = access.entitlements.maxPromotionSlots;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Promocje</h1>
        <p className="text-slate-500 mt-1">Zarzadzaj widocznoscia i promocja profilu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sloty promocyjne</p>
          <p className="text-2xl font-bold text-slate-900">{active.length} <span className="text-base font-normal text-slate-500">/ {maxSlots}</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Aktywne promocje</p>
          <p className="text-2xl font-bold text-green-600">{active.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Wygasle</p>
          <p className="text-2xl font-bold text-slate-400">{expired.length}</p>
        </div>
      </div>

      {!access.entitlements.canBePromoted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-1">Promocje niedostepne</h3>
          <p className="text-sm text-amber-700">Twoj aktualny plan nie obejmuje opcji promocji. Ulepsz plan, aby uzyskac dostep do promocji w miastach, kategoriach i etapach budowy.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Aktywne promocje</h2>
        {active.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            <p className="text-slate-500 text-sm">Nie masz aktywnych promocji</p>
            {access.entitlements.canBePromoted && active.length < maxSlots && (
              <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium">Aktywuj promocje</button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">
                      {PROMOTION_SCOPE_LABELS[p.scope]} &middot; {p.scopeValue || 'Globalny'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Od {new Date(p.startDate).toLocaleDateString('pl-PL')}
                      {p.endDate && ` do ${new Date(p.endDate).toLocaleDateString('pl-PL')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">Aktywna</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Dostepne typy promocji</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { scope: 'city' as const, available: access.entitlements.canUseCityPromotion, desc: 'Twoj profil wyswietlany na gorze wynikow w wybranym miescie.' },
            { scope: 'category' as const, available: access.entitlements.canUseCategoryPromotion, desc: 'Wyswietlany jako sponsorowany w wybranej kategorii uslug.' },
            { scope: 'stage' as const, available: access.entitlements.canUseStagePromotion, desc: 'Wyrozniony na etapie budowy domu w module budowlanym.' },
            { scope: 'featured-global' as const, available: access.entitlements.canBeFeatured, desc: 'Globalnie wyrozniony profil widoczny na stronie glownej.' },
          ].map((item) => (
            <div key={item.scope} className={`border rounded-xl p-4 ${item.available ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-900">{PROMOTION_SCOPE_LABELS[item.scope]}</h3>
                {item.available ? (
                  <span className="text-xs text-green-600 font-medium">Dostepna</span>
                ) : (
                  <span className="text-xs text-slate-400">Wymaga wyzszego planu</span>
                )}
              </div>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Transparentnosc promocji</h3>
        <p className="text-sm text-slate-600">
          Promowane i wyroznione profile sa zawsze oznaczone odpowiednimi etykietami widocznymi dla uzytkownikow:
          &quot;Promowany&quot;, &quot;Sponsorowany&quot;, &quot;Wyrozniony&quot;. Gwarantujemy pelna przejrzystosc.
        </p>
      </div>
    </div>
  );
}
