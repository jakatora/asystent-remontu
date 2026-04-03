import { usePortal } from '@/lib/portal-context';
import { PLAN_LABELS, PLAN_COLORS, ASSIGNMENT_STATE_LABELS, ASSIGNMENT_STATE_COLORS } from '@/lib/portal-types';

export default function PortalBilling() {
  const { access, assignment, billingHistory, invoices, billingContact, billingEvents, isTestMode } = usePortal();

  const statusColors: Record<string, string> = {
    paid: '#16A34A', pending: '#D97706', failed: '#DC2626', refunded: '#6B7280',
    issued: '#2563EB', overdue: '#DC2626',
  };
  const statusLabels: Record<string, string> = {
    paid: 'Zaplacona', pending: 'Oczekujaca', failed: 'Nieudana', refunded: 'Zwrot',
    issued: 'Wystawiona', overdue: 'Zalegla',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rozliczenia</h1>
        <p className="text-slate-500 mt-1">Zarzadzaj platnosciami i fakturami</p>
      </div>

      {isTestMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <span className="font-medium">Tryb testowy</span> - Platnosci nie sa aktywne. Dane ponizej sa przykladowe.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Aktualny plan</p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[access.currentPlanId] }} />
            <span className="text-lg font-bold text-slate-900">{PLAN_LABELS[access.currentPlanId]}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {access.currentPlanId !== 'free' && access.currentPlanId !== 'enterprise'
              ? `149 PLN/mies.`
              : access.currentPlanId === 'enterprise' ? 'Indywidualnie' : 'Darmowy'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Stan</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: ASSIGNMENT_STATE_COLORS[assignment.state] }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ASSIGNMENT_STATE_COLORS[assignment.state] }} />
            {ASSIGNMENT_STATE_LABELS[assignment.state]}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Nastepne odnowienie</p>
          <p className="text-lg font-bold text-slate-900">
            {access.nextRenewalDate ? new Date(access.nextRenewalDate).toLocaleDateString('pl-PL') : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Historia platnosci</h2>
        {billingHistory.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Brak historii platnosci</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-500 font-medium">Data</th>
                  <th className="text-left p-3 text-slate-500 font-medium">Opis</th>
                  <th className="text-right p-3 text-slate-500 font-medium">Kwota</th>
                  <th className="text-center p-3 text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50">
                    <td className="p-3 text-slate-600">{b.date}</td>
                    <td className="p-3 text-slate-900">{b.description}</td>
                    <td className="p-3 text-right font-medium text-slate-900">{b.amount} {b.currency}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: (statusColors[b.status] || '#94A3B8') + '15', color: statusColors[b.status] || '#94A3B8' }}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Faktury</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Brak faktur</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 text-slate-500 font-medium">Numer</th>
                  <th className="text-left p-3 text-slate-500 font-medium">Data</th>
                  <th className="text-right p-3 text-slate-500 font-medium">Kwota</th>
                  <th className="text-center p-3 text-slate-500 font-medium">Status</th>
                  <th className="text-center p-3 text-slate-500 font-medium">Akcja</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50">
                    <td className="p-3 text-slate-900 font-medium">{inv.invoiceNumber}</td>
                    <td className="p-3 text-slate-600">{inv.date}</td>
                    <td className="p-3 text-right font-medium text-slate-900">{inv.amount} {inv.currency}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: (statusColors[inv.status] || '#94A3B8') + '15', color: statusColors[inv.status] || '#94A3B8' }}>
                        {statusLabels[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">Pobierz PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Dane do faktury</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-500">Nazwa:</span> <span className="text-slate-900">{billingContact.name}</span></p>
            <p><span className="text-slate-500">E-mail:</span> <span className="text-slate-900">{billingContact.email}</span></p>
            {billingContact.nip && <p><span className="text-slate-500">NIP:</span> <span className="text-slate-900">{billingContact.nip}</span></p>}
            {billingContact.address && <p><span className="text-slate-500">Adres:</span> <span className="text-slate-900">{billingContact.address}</span></p>}
            {billingContact.city && <p><span className="text-slate-500">Miasto:</span> <span className="text-slate-900">{billingContact.city} {billingContact.postalCode}</span></p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Zdarzenia rozliczeniowe</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {billingEvents.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-xs">
                <span className="text-slate-400 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString('pl-PL')}</span>
                <span className="text-slate-600">{e.eventType.replace(/_/g, ' ')}</span>
                {e.amount != null && <span className="ml-auto font-medium text-slate-900">{e.amount} {e.currency}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
