import { useState } from 'react';
import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ASSIGNMENT_STATE_LABELS, ASSIGNMENT_STATE_COLORS } from '@/lib/portal-types';
import type { ContractorPlanId } from '@/lib/portal-types';

export default function AdminInspect() {
  const { profile, access, assignment, billingEvents, promotions, plans, changePlan, cancelPlan } = usePortal();
  const [adminNote, setAdminNote] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ContractorPlanId>(access.currentPlanId);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addLog = (msg: string) => setActionLog((l) => [msg, ...l]);

  const handleManualAssign = () => {
    changePlan(selectedPlan);
    addLog(`Plan zmieniony recznie na: ${PLAN_LABELS[selectedPlan]}`);
    setShowAssign(false);
  };

  const handleSuspend = () => {
    cancelPlan();
    addLog('Konto rozliczeniowe zawieszone');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inspekcja konta (Admin)</h1>
        <p className="text-slate-500 mt-1">Widok administracyjny konta wykonawcy</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
        <span className="font-medium">Panel administracyjny</span> - Akcje wykonywane tutaj sa zapisywane w logach.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Stan konta</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="font-mono text-xs">{profile.id}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Nazwa</span><span>{profile.displayName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">E-mail</span><span>{profile.email}</span></div>
            <div className="flex justify-between">
              <span className="text-slate-500">Plan</span>
              <span className="font-medium" style={{ color: PLAN_COLORS[access.currentPlanId] }}>{PLAN_LABELS[access.currentPlanId]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stan przypisania</span>
              <span style={{ color: ASSIGNMENT_STATE_COLORS[assignment.state] }}>{ASSIGNMENT_STATE_LABELS[assignment.state]}</span>
            </div>
            <div className="flex justify-between"><span className="text-slate-500">Aktywny</span><span>{access.isFullyActive ? 'Tak' : 'Nie'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Platne funkcje</span><span>{access.canUsePaidFeatures ? 'Tak' : 'Nie'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Weryfikacja</span><span>{profile.verificationStatus}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Sesja rozliczeniowa</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Poczatek</span><span>{assignment.startDate.split('T')[0]}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Koniec</span><span>{assignment.endDate?.split('T')[0] || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Nastepne odnowienie</span><span>{access.nextRenewalDate?.split('T')[0] || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Przypisany przez</span><span>{assignment.assignedBy}</span></div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4 space-y-3 text-sm">
            <p className="text-slate-500 font-medium">Promocje ({promotions.length})</p>
            {promotions.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="text-slate-600">{p.label}</span>
                <span className={p.isActive ? 'text-green-600' : 'text-slate-400'}>{p.isActive ? 'Aktywna' : 'Wygasla'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Akcje administracyjne</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button onClick={() => setShowAssign(!showAssign)}
            className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Przypisz plan recznie
          </button>
          <button onClick={handleSuspend}
            className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
            Zawies rozliczenie
          </button>
        </div>

        {showAssign && (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
            <label className="block text-sm font-medium text-slate-700">Wybierz plan</label>
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value as ContractorPlanId)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowAssign(false)} className="text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Anuluj</button>
              <button onClick={handleManualAssign} className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Przypisz</button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notatka administracyjna</label>
          <textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Dodaj notatke dotyczaca tego konta..." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Zdarzenia rozliczeniowe</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-2 text-slate-500">Data</th>
                <th className="text-left p-2 text-slate-500">Typ</th>
                <th className="text-left p-2 text-slate-500">Plan</th>
                <th className="text-left p-2 text-slate-500">Provider</th>
                <th className="text-right p-2 text-slate-500">Kwota</th>
              </tr>
            </thead>
            <tbody>
              {billingEvents.map((e) => (
                <tr key={e.id} className="border-b border-slate-50">
                  <td className="p-2 text-slate-600">{new Date(e.createdAt).toLocaleString('pl-PL')}</td>
                  <td className="p-2 text-slate-900">{e.eventType.replace(/_/g, ' ')}</td>
                  <td className="p-2" style={{ color: PLAN_COLORS[e.planId] }}>{PLAN_LABELS[e.planId]}</td>
                  <td className="p-2 text-slate-500">{e.providerType.replace(/_/g, ' ')}</td>
                  <td className="p-2 text-right font-medium">{e.amount != null ? `${e.amount} ${e.currency}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {actionLog.length > 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Log akcji (sesja)</h2>
          <ul className="space-y-1">
            {actionLog.map((log, i) => (
              <li key={i} className="text-xs text-slate-600 font-mono">[{new Date().toLocaleTimeString()}] {log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
