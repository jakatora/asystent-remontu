import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ENTITLEMENT_LABELS } from '@/lib/portal-types';
import type { ContractorEntitlementSet } from '@/lib/portal-types';
import { Link } from 'wouter';

export default function PortalUsage() {
  const { access, usage, plans } = usePortal();

  const booleanEntitlements: (keyof ContractorEntitlementSet)[] = [
    'canAppearInSearch', 'canReceiveRequests', 'canBeFeatured', 'canBePromoted',
    'canUseCityPromotion', 'canUseCategoryPromotion', 'canUseStagePromotion',
    'canAccessLeadDetailsPlaceholder', 'canSeeAdvancedStatsPlaceholder',
    'canUsePrioritySupportPlaceholder',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Uzycie i limity</h1>
        <p className="text-slate-500 mt-1">Sprawdz swoje zuzycie i dostepne limity</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PLAN_COLORS[access.currentPlanId] }} />
          <h2 className="text-lg font-semibold text-slate-900">Plan: {PLAN_LABELS[access.currentPlanId]}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usage.map((u) => (
            <div key={u.key} className="border border-slate-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">{u.label}</span>
                <span className={`text-sm font-bold ${u.isAtLimit ? 'text-red-600' : 'text-slate-900'}`}>
                  {u.current} / {u.limit}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className={`rounded-full h-3 transition-all ${u.isAtLimit ? 'bg-red-500' : u.percentage > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(u.percentage, 100)}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {u.isAtLimit
                  ? 'Osiagnieto limit - ulepsz plan, aby zwiekszyc'
                  : `Wykorzystano ${u.percentage}%`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Dostepne funkcje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {booleanEntitlements.map((key) => {
            const available = access.entitlements[key] as boolean;
            return (
              <div key={key} className={`flex items-center gap-3 p-3 rounded-lg ${available ? 'bg-green-50' : 'bg-slate-50'}`}>
                {available ? (
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <div>
                  <p className={`text-sm ${available ? 'text-slate-900' : 'text-slate-400'}`}>{ENTITLEMENT_LABELS[key]}</p>
                  {!available && (
                    <p className="text-xs text-slate-400">Wymaga wyzszego planu</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Limity numeryczne</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-slate-500 font-medium">Parametr</th>
                <th className="text-center p-3 text-slate-500 font-medium">Twoj limit</th>
                {plans.filter((p) => plans.indexOf(p) > plans.findIndex((pl) => pl.id === access.currentPlanId)).slice(0, 2).map((p) => (
                  <th key={p.id} className="text-center p-3 font-medium" style={{ color: p.color }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                'maxActiveRequestsPlaceholder', 'maxProfileGalleryItemsPlaceholder',
                'maxServiceAreasPlaceholder', 'maxSpecialtiesPlaceholder',
                'maxPromotionSlots', 'maxCategorySponsorships',
              ] as (keyof ContractorEntitlementSet)[]).map((key) => (
                <tr key={key} className="border-b border-slate-50">
                  <td className="p-3 text-slate-600">{ENTITLEMENT_LABELS[key]}</td>
                  <td className="p-3 text-center font-medium text-slate-900">
                    {(access.entitlements[key] as number) >= 999 ? 'Bez limitu' : String(access.entitlements[key])}
                  </td>
                  {plans.filter((p) => plans.indexOf(p) > plans.findIndex((pl) => pl.id === access.currentPlanId)).slice(0, 2).map((p) => (
                    <td key={p.id} className="p-3 text-center text-slate-700">
                      {(p.entitlements[key] as number) >= 999 ? 'Bez limitu' : String(p.entitlements[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">Potrzebujesz wiecej?</h3>
          <p className="text-sm text-slate-600 mt-1">Ulepsz swoj plan i zyskaj wiecej mozliwosci</p>
        </div>
        <Link href="/portal/contractor/plans" className="bg-violet-600 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-violet-700 transition text-center">
          Porownaj plany
        </Link>
      </div>
    </div>
  );
}
