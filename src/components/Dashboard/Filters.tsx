import { useState, useEffect } from 'react';

export type FiltersState = {
  from?: string;
  to?: string;
  status?: string;
  service?: string;
  priority?: string;
  propertyId?: string;
  providerId?: string;
  q?: string;
};

export default function Filters({ value, onChange }: { value: FiltersState; onChange: (v: FiltersState) => void }) {
  const [local, setLocal] = useState<FiltersState>(value);
  useEffect(() => setLocal(value), [value]);

  function applyQuick(range: 'today' | '7' | '30') {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let fromD = new Date(now);
    if (range === 'today') fromD = now; else if (range === '7') fromD.setDate(now.getDate() - 7); else fromD.setDate(now.getDate() - 30);
    const from = fromD.toISOString().slice(0, 10);
    const next = { ...local, from, to };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-gray-500">De</label>
        <input type="date" className="border rounded px-2 py-1" value={local.from || ''} onChange={(e) => setLocal({ ...local, from: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs text-gray-500">À</label>
        <input type="date" className="border rounded px-2 py-1" value={local.to || ''} onChange={(e) => setLocal({ ...local, to: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs text-gray-500">Statut</label>
        <select className="border rounded px-2 py-1" value={local.status || ''} onChange={(e) => setLocal({ ...local, status: e.target.value || undefined })}>
          <option value="">Tous</option>
          <option value="open">Ouvert</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
          <option value="canceled">Annulé</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500">Service</label>
        <select className="border rounded px-2 py-1" value={local.service || ''} onChange={(e) => setLocal({ ...local, service: e.target.value || undefined })}>
          <option value="">Tous</option>
          <option value="plumbing">Plomberie</option>
          <option value="electricity">Électricité</option>
          <option value="cleaning">Ménage</option>
          <option value="checkin">Check-in</option>
          <option value="other">Autre</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500">Priorité</label>
        <select className="border rounded px-2 py-1" value={local.priority || ''} onChange={(e) => setLocal({ ...local, priority: e.target.value || undefined })}>
          <option value="">Toutes</option>
          <option value="low">Basse</option>
          <option value="normal">Normale</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-gray-500">Recherche</label>
        <input placeholder="ID/email/texte" className="w-full border rounded px-2 py-1" value={local.q || ''} onChange={(e) => setLocal({ ...local, q: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button className="border rounded px-2 py-1" onClick={() => applyQuick('today')}>Aujourd’hui</button>
        <button className="border rounded px-2 py-1" onClick={() => applyQuick('7')}>7 jours</button>
        <button className="border rounded px-2 py-1" onClick={() => applyQuick('30')}>30 jours</button>
        <button className="border rounded px-2 py-1" onClick={() => { const next = {}; setLocal(next); onChange(next); }}>Réinitialiser</button>
        <button className="bg-blue-600 text-white rounded px-3 py-1" onClick={() => onChange(local)}>Appliquer</button>
      </div>
    </div>
  );
}

