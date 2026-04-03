import { useState } from 'react';
import { Link } from 'wouter';
import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ENTITLEMENT_LABELS } from '@/lib/portal-types';
import type { ContractorPlanId, ContractorEntitlementSet } from '@/lib/portal-types';

export default function PortalPlans() {
  const { access, plans, usage } = usePortal();
  const [selectedPlan, setSelectedPlan] = useState<ContractorPlanId | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const currentPlanIndex = plans.findIndex((p) => p.id === access.currentPlanId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plany i Widocznosc</h1>
        <p className="text-slate-500 mt-1">Zarzadzaj swoim planem i opcjami widocznosci</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Aktualny plan</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[access.currentPlanId] }} />
              <span className="text-xl font-bold text-slate-900">{PLAN_LABELS[access.currentPlanId]}</span>
            </div>
          </div>
          <button onClick={() => setShowComparison(!showComparison)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            {showComparison ? 'Ukryj porownanie' : 'Porownaj wszystkie plany'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {plans.map((plan, idx) => {
          const isCurrent = plan.id === access.currentPlanId;
          const isUpgrade = idx > currentPlanIndex;
          const isDowngrade = idx < currentPlanIndex;
          return (
            <div key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-5 transition ${isCurrent ? 'border-orange-400 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              {isCurrent && (
                <span className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                  Aktualny
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                <h3 className="font-bold text-slate-900">{plan.name}</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">{plan.shortDescription}</p>
              {plan.id !== 'enterprise' ? (
                <div className="mb-4">
                  <span className="text-2xl font-bold text-slate-900">{plan.monthlyPricePlaceholder}</span>
                  <span className="text-sm text-slate-500"> PLN/mies.</span>
                  {plan.yearlyPricePlaceholder > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">{plan.yearlyPricePlaceholder} PLN/rok</p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-lg font-bold text-slate-900">Indywidualnie</span>
                </div>
              )}
              <ul className="space-y-1.5 mb-4">
                {plan.highlightFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && plan.id !== 'enterprise' && (
                <Link href={`/portal/contractor/checkout/${plan.id}`}
                  className={`block w-full text-center text-sm font-medium py-2 rounded-lg transition ${isUpgrade
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {isUpgrade ? 'Ulepsz' : 'Zmien'}
                </Link>
              )}
              {!isCurrent && plan.id === 'enterprise' && (
                <Link href="/portal/contractor/support"
                  className="block w-full text-center text-sm font-medium py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  Kontakt
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {showComparison && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-4 text-slate-500 font-medium">Uprawnienie</th>
                {plans.map((p) => (
                  <th key={p.id} className="p-4 text-center font-medium" style={{ color: p.color }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(ENTITLEMENT_LABELS) as (keyof ContractorEntitlementSet)[]).map((key) => (
                <tr key={key} className="border-b border-slate-100">
                  <td className="p-3 text-slate-600 text-xs">{ENTITLEMENT_LABELS[key]}</td>
                  {plans.map((p) => {
                    const val = p.entitlements[key];
                    return (
                      <td key={p.id} className="p-3 text-center text-xs">
                        {typeof val === 'boolean' ? (
                          val ? <span className="text-green-500">&#10003;</span> : <span className="text-slate-300">&#10005;</span>
                        ) : (
                          <span className="text-slate-700 font-medium">{val >= 999 ? 'Bez limitu' : val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Uzycie w aktualnym planie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usage.map((u) => (
            <div key={u.key} className="border border-slate-100 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">{u.label}</span>
                <span className={`font-medium ${u.isAtLimit ? 'text-red-600' : 'text-slate-900'}`}>{u.current}/{u.limit}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`rounded-full h-2 transition-all ${u.isAtLimit ? 'bg-red-500' : u.percentage > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(u.percentage, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Aktywne sloty promocyjne</h2>
        <PromotionSlotsSection />
      </div>
    </div>
  );
}

function PromotionSlotsSection() {
  const { promotions, access } = usePortal();
  const active = promotions.filter((p) => p.isActive);
  const maxSlots = access.entitlements.maxPromotionSlots;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-slate-600">Uzywane sloty:</span>
        <span className="text-sm font-medium text-slate-900">{active.length} / {maxSlots}</span>
      </div>
      {active.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Brak aktywnych promocji</p>
      ) : (
        <div className="space-y-2">
          {active.map((p) => (
            <div key={p.id} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.label}</p>
                <p className="text-xs text-slate-500">{p.scopeValue || 'Globalny'} &middot; Od {new Date(p.startDate).toLocaleDateString('pl-PL')}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Aktywna</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
