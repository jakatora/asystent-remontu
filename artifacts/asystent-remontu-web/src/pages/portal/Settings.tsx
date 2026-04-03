import { useState } from 'react';
import { usePortal } from '@/lib/portal-context';

export default function PortalSettings() {
  const { profile, billingContact, notificationPrefs, updateBillingContact, updateNotificationPrefs, signOut } = usePortal();
  const [editBilling, setEditBilling] = useState(false);
  const [billingForm, setBillingForm] = useState({ ...billingContact });
  const [notifPrefs, setNotifPrefs] = useState({ ...notificationPrefs });
  const [saved, setSaved] = useState('');
  const [showDeactivate, setShowDeactivate] = useState(false);

  const saveBilling = () => {
    updateBillingContact(billingForm);
    setEditBilling(false);
    setSaved('billing');
    setTimeout(() => setSaved(''), 3000);
  };

  const saveNotifs = () => {
    updateNotificationPrefs(notifPrefs);
    setSaved('notifs');
    setTimeout(() => setSaved(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ustawienia</h1>
        <p className="text-slate-500 mt-1">Zarzadzaj kontem i preferencjami</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          {saved === 'billing' ? 'Dane do faktury zostaly zaktualizowane.' : 'Preferencje powiadomien zostaly zapisane.'}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Dane konta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Nazwa wyswietlana</p>
            <p className="text-slate-900 font-medium">{profile.displayName}</p>
          </div>
          <div>
            <p className="text-slate-500">E-mail</p>
            <p className="text-slate-900 font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-slate-500">Firma</p>
            <p className="text-slate-900 font-medium">{profile.companyName || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">ID wykonawcy</p>
            <p className="text-slate-900 font-medium font-mono text-xs">{profile.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Dane do faktury</h2>
          {!editBilling ? (
            <button onClick={() => { setBillingForm({ ...billingContact }); setEditBilling(true); }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium">Edytuj</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditBilling(false)} className="text-sm text-slate-500 hover:text-slate-700">Anuluj</button>
              <button onClick={saveBilling} className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600">Zapisz</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            { key: 'name', label: 'Nazwa' },
            { key: 'email', label: 'E-mail' },
            { key: 'nip', label: 'NIP' },
            { key: 'address', label: 'Adres' },
            { key: 'city', label: 'Miasto' },
            { key: 'postalCode', label: 'Kod pocztowy' },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm text-slate-500 mb-1">{label}</label>
              {editBilling ? (
                <input value={billingForm[key] || ''} onChange={(e) => setBillingForm({ ...billingForm, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              ) : (
                <p className="text-sm text-slate-900">{billingContact[key] || '-'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Powiadomienia</h2>
          <button onClick={saveNotifs} className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600">Zapisz</button>
        </div>
        <div className="space-y-4">
          {([
            { key: 'emailNewRequests', label: 'Nowe zapytania', desc: 'Powiadomienie o nowych zapytaniach od klientow' },
            { key: 'emailBillingAlerts', label: 'Alerty rozliczeniowe', desc: 'Platnosci, faktury, problemy z platnosciami' },
            { key: 'emailPromotionUpdates', label: 'Aktualizacje promocji', desc: 'Zmiany w statusie promocji' },
            { key: 'emailWeeklyDigest', label: 'Podsumowanie tygodniowe', desc: 'Cotygodniowe podsumowanie aktywnosci' },
          ] as const).map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={notifPrefs[key]}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-orange-500 focus:ring-orange-300" />
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Sesja</h2>
        <button onClick={signOut}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Wyloguj sie
        </button>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-900 mb-2">Strefa niebezpieczna</h2>
        <p className="text-sm text-red-700 mb-4">Dezaktywacja konta wykonawcy jest nieodwracalna.</p>
        {!showDeactivate ? (
          <button onClick={() => setShowDeactivate(true)}
            className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
            Dezaktywuj konto wykonawcy
          </button>
        ) : (
          <div className="bg-white rounded-lg border border-red-200 p-4 space-y-3">
            <p className="text-sm text-red-700">Czy na pewno chcesz dezaktywowac konto wykonawcy? Ta operacja jest nieodwracalna.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeactivate(false)} className="text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Anuluj</button>
              <button className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Dezaktywuj</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-2">Linki</h3>
        <ul className="space-y-1.5 text-sm">
          <li><a href="#" className="text-orange-600 hover:text-orange-700">Regulamin serwisu</a></li>
          <li><a href="#" className="text-orange-600 hover:text-orange-700">Polityka prywatnosci</a></li>
          <li><a href="#" className="text-orange-600 hover:text-orange-700">Warunki korzystania z portalu</a></li>
          <li><a href="#" className="text-orange-600 hover:text-orange-700">Pomoc i wsparcie</a></li>
        </ul>
      </div>
    </div>
  );
}
