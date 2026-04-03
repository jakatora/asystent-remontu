import { useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ENTITLEMENT_LABELS } from '@/lib/portal-types';
import type { ContractorPlanId, ContractorEntitlementSet, WebBillingSession } from '@/lib/portal-types';

export default function PortalCheckout() {
  const [, params] = useRoute('/portal/contractor/checkout/:planId');
  const [, navigate] = useLocation();
  const { plans, access, startCheckout, simulateCheckoutSuccess, simulateCheckoutFailure, simulateCheckoutCancel, isTestMode } = usePortal();

  const planId = (params?.planId || 'starter') as ContractorPlanId;
  const plan = plans.find((p) => p.id === planId);
  const currentPlan = plans.find((p) => p.id === access.currentPlanId);

  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'review' | 'confirm' | 'processing' | 'result'>('review');
  const [session, setSession] = useState<WebBillingSession | null>(null);
  const [result, setResult] = useState<'success' | 'failed' | 'cancelled' | null>(null);

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Plan nie znaleziony</h1>
        <Link href="/portal/contractor/plans" className="text-orange-600 hover:text-orange-700 text-sm">Wrocdo planow</Link>
      </div>
    );
  }

  const isUpgrade = plans.indexOf(plan) > plans.findIndex((p) => p.id === access.currentPlanId);
  const isDowngrade = plans.indexOf(plan) < plans.findIndex((p) => p.id === access.currentPlanId);
  const price = period === 'monthly' ? plan.monthlyPricePlaceholder : plan.yearlyPricePlaceholder;

  const entitlementChanges = currentPlan ? (Object.keys(ENTITLEMENT_LABELS) as (keyof ContractorEntitlementSet)[]).map((key) => {
    const oldVal = currentPlan.entitlements[key];
    const newVal = plan.entitlements[key];
    if (oldVal === newVal) return null;
    const improved = typeof newVal === 'boolean' ? newVal && !oldVal : (newVal as number) > (oldVal as number);
    return { key, label: ENTITLEMENT_LABELS[key], oldVal, newVal, improved };
  }).filter(Boolean) : [];

  const handleConfirm = () => {
    const s = startCheckout(planId, period);
    setSession(s);
    setStep('processing');
  };

  const handleSimulateSuccess = () => {
    if (session) simulateCheckoutSuccess(session.id);
    setResult('success');
    setStep('result');
  };

  const handleSimulateFailure = () => {
    if (session) simulateCheckoutFailure(session.id);
    setResult('failed');
    setStep('result');
  };

  const handleSimulateCancel = () => {
    if (session) simulateCheckoutCancel(session.id);
    setResult('cancelled');
    setStep('result');
  };

  if (step === 'result') {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          {result === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Plan zmieniony pomyslnie!</h2>
              <p className="text-slate-500 mb-1">Aktywowano plan: <span className="font-semibold" style={{ color: PLAN_COLORS[planId] }}>{plan.name}</span></p>
              {isTestMode && <p className="text-xs text-amber-600 mt-2">(Tryb testowy - platnosc nie zostala pobrana)</p>}
            </>
          )}
          {result === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Platnosc nieudana</h2>
              <p className="text-slate-500 mb-1">Nie udalo sie przetworzyc platnosci. Sprobuj ponownie.</p>
              {isTestMode && <p className="text-xs text-amber-600 mt-2">(Tryb testowy - symulacja bledu)</p>}
            </>
          )}
          {result === 'cancelled' && (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Anulowano</h2>
              <p className="text-slate-500 mb-1">Platnosc zostala anulowana. Twoj plan nie zostal zmieniony.</p>
            </>
          )}
          <div className="flex gap-3 mt-6 justify-center">
            <Link href="/portal/contractor/plans" className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Wrocdo planow
            </Link>
            <Link href="/portal/contractor" className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
              Panel glowny
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oczekiwanie na platnosc...</h2>
          <p className="text-slate-500 mb-4">Sesja platnosci: <span className="font-mono text-xs">{session?.id}</span></p>

          {isTestMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <p className="text-sm font-medium text-amber-800 mb-3">Tryb testowy - wybierz wynik:</p>
              <div className="flex flex-col gap-2">
                <button onClick={handleSimulateSuccess} className="w-full py-2.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition">
                  Symuluj sukces platnosci
                </button>
                <button onClick={handleSimulateFailure} className="w-full py-2.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                  Symuluj blad platnosci
                </button>
                <button onClick={handleSimulateCancel} className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition">
                  Symuluj anulowanie
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/portal/contractor/plans" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Wrocdo planow
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">
          {isUpgrade ? 'Ulepsz plan' : isDowngrade ? 'Zmien plan' : 'Wybierz plan'}
        </h1>
      </div>

      {isTestMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <span className="font-medium">Tryb testowy</span> - Platnosc nie zostanie pobrana. Mozesz bezpiecznie przetestowac caly proces.
        </div>
      )}

      <div className="bg-white rounded-xl border-2 p-6" style={{ borderColor: PLAN_COLORS[planId] }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PLAN_COLORS[planId] }} />
          <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
          {plan.badge && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[planId] + '15', color: PLAN_COLORS[planId] }}>{plan.badge}</span>}
        </div>
        <p className="text-sm text-slate-500 mb-4">{plan.shortDescription}</p>

        <div className="flex gap-3 mb-4">
          <button onClick={() => setPeriod('monthly')}
            className={`flex-1 p-4 rounded-xl border-2 text-center transition ${period === 'monthly' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <p className="text-2xl font-bold text-slate-900">{plan.monthlyPricePlaceholder} PLN</p>
            <p className="text-xs text-slate-500">miesiecznie</p>
          </button>
          <button onClick={() => setPeriod('yearly')}
            className={`flex-1 p-4 rounded-xl border-2 text-center transition ${period === 'yearly' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <p className="text-2xl font-bold text-slate-900">{plan.yearlyPricePlaceholder} PLN</p>
            <p className="text-xs text-slate-500">rocznie</p>
            {plan.monthlyPricePlaceholder > 0 && (
              <p className="text-xs text-green-600 mt-1">Oszczedzasz {Math.round((1 - plan.yearlyPricePlaceholder / (plan.monthlyPricePlaceholder * 12)) * 100)}%</p>
            )}
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Zawiera:</h3>
          <ul className="space-y-1.5">
            {plan.highlightFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {entitlementChanges.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Zmiany w uprawnieniach</h3>
          <div className="space-y-2">
            {entitlementChanges.map((ch) => ch && (
              <div key={ch.key} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${ch.improved ? 'bg-green-50' : 'bg-red-50'}`}>
                {ch.improved ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                )}
                <span className="text-slate-700">{ch.label}</span>
                <span className="ml-auto text-xs text-slate-500">
                  {typeof ch.oldVal === 'boolean' ? (ch.oldVal ? 'Tak' : 'Nie') : String(ch.oldVal)}
                  {' -> '}
                  {typeof ch.newVal === 'boolean' ? (ch.newVal ? 'Tak' : 'Nie') : String(ch.newVal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">Podsumowanie</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Plan</span>
            <span className="text-slate-900 font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Okres</span>
            <span className="text-slate-900 font-medium">{period === 'monthly' ? 'Miesieczny' : 'Roczny'}</span>
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between">
            <span className="text-slate-900 font-semibold">Do zaplaty</span>
            <span className="text-lg font-bold text-slate-900">{price} PLN</span>
          </div>
        </div>
      </div>

      {step === 'review' && (
        <div className="flex gap-3">
          <Link href="/portal/contractor/plans" className="flex-1 text-center py-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
            Anuluj
          </Link>
          <button onClick={() => setStep('confirm')}
            className="flex-1 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
            Przejdz dalej
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Potwierdz zmiane planu</h3>
          <p className="text-sm text-slate-600">
            {isUpgrade
              ? `Twoj plan zostanie zmieniony na ${plan.name}. Nowe uprawnienia beda dostepne natychmiast.`
              : `Twoj plan zostanie zmieniony na ${plan.name}. Niektore funkcje moga stac sie niedostepne.`}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStep('review')} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition">
              Wstecz
            </button>
            <button onClick={handleConfirm} className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
              Potwierdzam - zaplac {price} PLN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
