import { Link } from 'wouter';
import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ASSIGNMENT_STATE_LABELS, ASSIGNMENT_STATE_COLORS } from '@/lib/portal-types';

export default function PortalDashboard() {
  const { profile, access, assignment, usage, promotions, billingHistory } = usePortal();

  const verificationMap: Record<string, { label: string; color: string }> = {
    'document-verified': { label: 'Zweryfikowany', color: '#16A34A' },
    'basic-verified': { label: 'Podstawowo zweryfikowany', color: '#2563EB' },
    'pending': { label: 'Oczekuje', color: '#D97706' },
    'unverified': { label: 'Niezweryfikowany', color: '#94A3B8' },
  };
  const verStatus = verificationMap[profile.verificationStatus] || { label: profile.verificationStatus, color: '#94A3B8' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Witaj, {profile.displayName.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-1">Twoj panel wykonawcy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Aktualny plan</p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[access.currentPlanId] }} />
            <span className="text-lg font-bold text-slate-900">{PLAN_LABELS[access.currentPlanId]}</span>
          </div>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: ASSIGNMENT_STATE_COLORS[assignment.state] + '20', color: ASSIGNMENT_STATE_COLORS[assignment.state] }}>
            {ASSIGNMENT_STATE_LABELS[assignment.state]}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Profil</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div className="bg-orange-500 rounded-full h-2 transition-all" style={{ width: `${profile.profileCompleteness}%` }} />
            </div>
            <span className="text-sm font-semibold text-slate-700">{profile.profileCompleteness}%</span>
          </div>
          <p className="text-xs text-slate-500">{profile.profileCompleteness < 100 ? 'Uzupelnij profil' : 'Profil kompletny'}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Weryfikacja</p>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: verStatus.color }} />
            <span className="text-sm font-medium" style={{ color: verStatus.color }}>{verStatus.label}</span>
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Widocznosc</p>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.isPromoted && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Promowany</span>}
            {profile.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Wyrozniony</span>}
            {!profile.isPromoted && !profile.isFeatured && <span className="text-xs text-slate-400">Standardowa</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Uzycie vs limity</h2>
            <Link href="/portal/contractor/usage" className="text-sm text-orange-600 hover:text-orange-700">Zobacz wszystko</Link>
          </div>
          <div className="space-y-4">
            {usage.map((u) => (
              <div key={u.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{u.label}</span>
                  <span className="text-slate-900 font-medium">{u.current} / {u.limit}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`rounded-full h-2 transition-all ${u.isAtLimit ? 'bg-red-500' : u.percentage > 75 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(u.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Aktywne promocje</h2>
            {promotions.filter((p) => p.isActive).length === 0 ? (
              <p className="text-sm text-slate-400">Brak aktywnych promocji</p>
            ) : (
              <ul className="space-y-2">
                {promotions.filter((p) => p.isActive).map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{p.label}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/portal/contractor/promotions" className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-700">Zarzadzaj</Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Ostatnie platnosci</h2>
            {billingHistory.length === 0 ? (
              <p className="text-sm text-slate-400">Brak historii platnosci</p>
            ) : (
              <ul className="space-y-2">
                {billingHistory.slice(0, 3).map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{b.date}</span>
                    <span className="font-medium text-slate-900">{b.amount} {b.currency}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/portal/contractor/billing" className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-700">Zobacz szczegoly</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Specjalizacje</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.specialties.map((s) => (
              <span key={s.categoryId} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{s.categoryName}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Obszary uslug</h3>
          <p className="text-sm text-slate-600">{profile.serviceAreas.city}{profile.serviceAreas.radiusKm ? ` (+${profile.serviceAreas.radiusKm} km)` : ''}</p>
          {profile.serviceAreas.regions && <p className="text-xs text-slate-400 mt-1">{profile.serviceAreas.regions.join(', ')}</p>}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Zapytania</h3>
          <p className="text-sm text-slate-400 italic">Podsumowanie zapytan wkrotce</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Potrzebujesz pomocy?</h3>
          <p className="text-sm text-slate-600 mt-1">Nasz zespol jest gotowy, zeby Ci pomoc.</p>
        </div>
        <Link href="/portal/contractor/support" className="bg-orange-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-orange-600 transition flex-shrink-0">
          Kontakt
        </Link>
      </div>
    </div>
  );
}
