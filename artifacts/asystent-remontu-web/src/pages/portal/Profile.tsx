import { useState } from 'react';
import { usePortal } from '@/lib/portal-context';

export default function PortalProfile() {
  const { profile, updateProfile } = usePortal();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({
      displayName: form.displayName,
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      description: form.description,
      materialsIncluded: form.materialsIncluded,
      availableSoon: form.availableSoon,
      houseBuildSuitability: form.houseBuildSuitability,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
          <p className="text-slate-500 mt-1">Zarzadzaj swoim profilem wykonawcy</p>
        </div>
        {!editing ? (
          <button onClick={() => { setForm({ ...profile }); setEditing(true); }} className="bg-orange-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-orange-600 transition">
            Edytuj profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Anuluj</button>
            <button onClick={handleSave} className="bg-orange-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-orange-600 transition">Zapisz</button>
          </div>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          Profil zostal zaktualizowany pomyslnie.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div className="bg-orange-500 rounded-full h-2 transition-all" style={{ width: `${profile.profileCompleteness}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-700">{profile.profileCompleteness}% kompletny</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900 text-lg">Dane podstawowe</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa wyswietlana</label>
            {editing ? (
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            ) : (
              <p className="text-sm text-slate-900">{profile.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa firmy</label>
            {editing ? (
              <input value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            ) : (
              <p className="text-sm text-slate-900">{profile.companyName || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Opis</label>
            {editing ? (
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            ) : (
              <p className="text-sm text-slate-600">{profile.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Miasto</label>
            {editing ? (
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            ) : (
              <p className="text-sm text-slate-900">{profile.city}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900 text-lg">Kontakt i szczegoly</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            {editing ? (
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            ) : (
              <p className="text-sm text-slate-900">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            {editing ? (
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            ) : (
              <p className="text-sm text-slate-900">{profile.phone || '-'}</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Opcje profilu</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing ? form.materialsIncluded : profile.materialsIncluded}
                onChange={(e) => editing && setForm({ ...form, materialsIncluded: e.target.checked })}
                disabled={!editing} className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-300" />
              <span className="text-sm text-slate-700">Materialy w cenie</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing ? form.availableSoon : profile.availableSoon}
                onChange={(e) => editing && setForm({ ...form, availableSoon: e.target.checked })}
                disabled={!editing} className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-300" />
              <span className="text-sm text-slate-700">Dostepny wkrotce</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing ? form.houseBuildSuitability : profile.houseBuildSuitability}
                onChange={(e) => editing && setForm({ ...form, houseBuildSuitability: e.target.checked })}
                disabled={!editing} className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-300" />
              <span className="text-sm text-slate-700">Budowa domow</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 text-lg mb-3">Specjalizacje</h2>
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((s) => (
              <span key={s.categoryId} className="text-sm px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">{s.categoryName}</span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Edycja specjalizacji dostepna w aplikacji mobilnej</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 text-lg mb-3">Obszary uslug</h2>
          <p className="text-sm text-slate-700">{profile.serviceAreas.city}{profile.serviceAreas.radiusKm ? ` (promien ${profile.serviceAreas.radiusKm} km)` : ''}</p>
          {profile.serviceAreas.regions && (
            <p className="text-xs text-slate-500 mt-1">Regiony: {profile.serviceAreas.regions.join(', ')}</p>
          )}
          <p className="text-xs text-slate-400 mt-3">Edycja obszarow dostepna w aplikacji mobilnej</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 text-lg mb-3">Galeria</h2>
        <p className="text-sm text-slate-600">Liczba zdjec: <span className="font-medium">{profile.galleryCount}</span></p>
        <p className="text-xs text-slate-400 mt-2">Zarzadzanie galeria dostepne w aplikacji mobilnej</p>
      </div>
    </div>
  );
}
