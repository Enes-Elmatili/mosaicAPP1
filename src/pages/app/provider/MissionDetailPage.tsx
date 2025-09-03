import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  MapPin,
  CalendarClock,
  Phone,
  CheckCircle2,
  Camera,
  FileUp,
} from 'lucide-react';
import PageWrapper from '../../../components/Layout/PageWrapper';

// Types locaux (ou importe-les si tu les as déjà centralisés)
type JobStatus = 'NEW' | 'ACCEPTED' | 'ON_ROUTE' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

const chip = (s: JobStatus) => {
  const base =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium';
  const map: Record<JobStatus, string> = {
    NEW: 'bg-amber-50 text-amber-700 border-amber-100',
    ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-100',
    ON_ROUTE: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-100',
    DONE: 'bg-green-50 text-green-700 border-green-100',
    CANCELED: 'bg-gray-50 text-gray-700 border-gray-100',
  };
  return `${base} ${map[s]}`;
};

const card =
  'rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg';

// —— MOCK mission (remplace par tes données / param route) ——
const initialStatus: JobStatus = 'ACCEPTED';
const mission = {
  id: 'JOB-2412',
  title: 'Prise électrique — court-circuit',
  address: '18 Bd Anfa, Casablanca',
  window: "Aujourd'hui 13:00–15:00",
  createdAt: new Date().toISOString(),
  phone: '+212 6 98 76 54 32',
  fee: 280,
};

const MissionDetailPage: React.FC = () => {
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [note, setNote] = useState('');

  const next = (to: JobStatus) => setStatus(to);

  return (
    <PageWrapper title={`Mission ${mission.id}`}>
      {/* En-tête : titre + statut + actions rapides */}
      <div className={`${card} p-6 mb-6`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              <span className="inline-flex items-center gap-2">
                <Wrench className="h-5 w-5 text-gray-700" />
                {mission.title}
              </span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" /> {mission.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4 text-gray-500" /> {mission.window}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" /> Créée le{' '}
                {new Date(mission.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={chip(status)}>
              {status === 'NEW'
                ? 'À traiter'
                : status === 'ACCEPTED'
                ? 'Acceptée'
                : status === 'ON_ROUTE'
                ? 'En route'
                : status === 'IN_PROGRESS'
                ? 'En cours'
                : status === 'DONE'
                ? 'Terminée'
                : 'Annulée'}
            </span>
            <a
              href={`tel:${mission.phone}`}
              className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white"
            >
              <Phone className="mr-1 inline h-4 w-4" />
              Appeler
            </a>
          </div>
        </div>
      </div>

      {/* Actions de workflow */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className={`${card} p-5 md:col-span-2`}>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Progression
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {status === 'ACCEPTED' && (
              <button
                onClick={() => next('ON_ROUTE')}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
              >
                Je pars sur place
              </button>
            )}
            {status === 'ON_ROUTE' && (
              <button
                onClick={() => next('IN_PROGRESS')}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
              >
                Démarrer l’intervention
              </button>
            )}
            {status === 'IN_PROGRESS' && (
              <button
                onClick={() => next('DONE')}
                className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <CheckCircle2 className="mr-1 inline h-4 w-4" />
                Terminer
              </button>
            )}
            {status !== 'DONE' && status !== 'CANCELED' && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mission.address)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white"
              >
                Itinéraire
              </a>
            )}
          </div>

          {/* Notes / compte rendu */}
          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Compte rendu / Remarques
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="Décris ce qui a été fait, les pièces utilisées, etc."
              className="w-full rounded-2xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Fichiers & pièces jointes */}
        <div className={`${card} p-5`}>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Pièces jointes</h3>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white">
              <Camera className="mr-1 inline h-4 w-4" /> Photos avant/après
            </button>
            <button className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white">
              <FileUp className="mr-1 inline h-4 w-4" /> Devis / Facture
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-3 text-xs text-gray-600">
            Formats acceptés : JPG, PNG, PDF. Taille max 10 Mo.
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default MissionDetailPage;
