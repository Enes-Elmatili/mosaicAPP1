import React, { useMemo, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Download, Search, Filter, MapPin, Clock, CheckCircle2 } from 'lucide-react';
// NOTE: PageWrapper import retiré pour éviter l'erreur d'alias pendant le dev.
// Remplacez <Wrapper> par votre PageWrapper réel quand le chemin est OK.
// import PageWrapper from '../../../components/Layout/PageWrapper'

// Wrapper local (style premium, gris sidéral, transparent)
const Wrapper: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="mx-auto max-w-6xl px-6 py-6 font-[Inter]">
    <div className="mb-6 rounded-3xl border border-white/20 bg-white/60 p-5 shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

// Types
export type JobStatus = 'NEW' | 'ACCEPTED' | 'ON_ROUTE' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

interface CalendarEvent {
  id: string;
  title: string;
  address: string;
  start: string; // ISO
  end: string;   // ISO
  status: JobStatus;
}

// Données mock (remplace avec API)
const now = new Date();
const todayAt = (h: number, m = 0) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).toISOString();
const dayShift = (d: number, h: number, m = 0) => {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, m);
  return base.toISOString();
};

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'JOB-2415', title: "Fuite d'eau — cuisine", address: '12 Rue du Parc', start: todayAt(10, 0), end: todayAt(11, 0), status: 'NEW' },
  { id: 'JOB-2412', title: 'Prise — court-circuit', address: '18 Bd Anfa', start: todayAt(13, 0), end: todayAt(14, 0), status: 'ACCEPTED' },
  { id: 'JOB-2409', title: 'Rideau métallique — bloqué', address: '6 Rue Ibn Sina', start: todayAt(16, 0), end: todayAt(17, 30), status: 'IN_PROGRESS' },
  { id: 'JOB-2403', title: 'Chaudière — entretien', address: 'Ain Diab', start: dayShift(1, 9, 0), end: dayShift(1, 10, 30), status: 'DONE' },
];

// UI helpers
const cls = {
  card: 'rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg',
  btn: 'rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white',
  btnPrimary: 'rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black/90',
  input: 'w-full rounded-full border border-gray-200 bg-white/70 pl-9 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300',
};

const statusColor: Record<JobStatus, string> = {
  NEW: 'bg-amber-100 text-amber-900 border-amber-200',
  ACCEPTED: 'bg-blue-100 text-blue-900 border-blue-200',
  ON_ROUTE: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-900 border-purple-200',
  DONE: 'bg-green-100 text-green-900 border-green-200',
  CANCELED: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Utils calendrier
const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Lundi=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const formatDayLabel = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
const hours = Array.from({ length: 13 }).map((_, i) => 8 + i); // 08:00 → 20:00
const pxPerHour = 56; // hauteur des colonnes
const pxPerMin = pxPerHour / 60; // ~0.933

const minutesSince = (d: Date, fromHour = 8) => d.getHours() * 60 + d.getMinutes() - fromHour * 60;

// Export ICS
const downloadICS = (events: CalendarEvent[], fileName = 'planning.ics') => {
  const dt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MOSAIC//Planning//FR',
    ...events.map(e => [
      'BEGIN:VEVENT',
      `UID:${e.id}@mosaic`,
      `DTSTAMP:${dt(new Date().toISOString())}`,
      `DTSTART:${dt(e.start)}`,
      `DTEND:${dt(e.end)}`,
      `SUMMARY:${e.title}`,
      `LOCATION:${e.address}`,
      'END:VEVENT',
    ].join('\n')),
    'END:VCALENDAR',
  ].join('\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.click();
  URL.revokeObjectURL(url);
};

const isBetween = (d: Date, start: Date, end: Date) => d.getTime() >= start.getTime() && d.getTime() <= end.getTime();

const PlanningPage: React.FC = () => {
  const [current, setCurrent] = useState<Date>(new Date());
  const [view, setView] = useState<'week' | 'day' | 'agenda'>('week');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ALL' | JobStatus>('ALL');

  const events = useMemo(() => {
    const byStatus = status === 'ALL' ? MOCK_EVENTS : MOCK_EVENTS.filter(e => e.status === status);
    const byQuery = byStatus.filter(e => e.title.toLowerCase().includes(q.toLowerCase()) || e.address.toLowerCase().includes(q.toLowerCase()) || e.id?.toLowerCase?.().includes(q.toLowerCase?.() || ''));
    return byQuery;
  }, [q, status]);

  const weekStart = useMemo(() => startOfWeek(current), [current]);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const eventsForDay = (d: Date) => events.filter(e => sameDay(new Date(e.start), d));

  const goToday = () => setCurrent(new Date());
  const prev = () => setCurrent(d => view === 'week' ? addDays(d, -7) : addDays(d, -1));
  const next = () => setCurrent(d => view === 'week' ? addDays(d, 7) : addDays(d, 1));

  return (
    <Wrapper title="Planning des interventions (Prestataire)">
      {/* Barre d'actions */}
      <div className={`${cls.card} p-4 mb-6`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button onClick={prev} className={cls.btn}><ChevronLeft className="h-4 w-4"/></button>
            <button onClick={goToday} className={cls.btn}>Aujourd'hui</button>
            <button onClick={next} className={cls.btn}><ChevronRight className="h-4 w-4"/></button>
            <div className="ml-2 text-sm text-gray-700">
              <CalendarClock className="mr-1 inline h-4 w-4"/>
              {view === 'week' ? `${formatDayLabel(days[0])} → ${formatDayLabel(days[6])}` : formatDayLabel(current)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher (titre, adresse, ID)…" className={`${cls.input}`} />
            </div>
            <div className="flex items-center gap-2">
              <select value={status} onChange={e=>setStatus(e.target.value as any)} className="rounded-full border border-gray-200 bg_white/70 px-3 py-2 text-sm text-gray-800 hover:bg-white">
                <option value="ALL">Tous statuts</option>
                <option value="NEW">À traiter</option>
                <option value="ACCEPTED">Acceptée</option>
                <option value="ON_ROUTE">En route</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminée</option>
                <option value="CANCELED">Annulée</option>
              </select>
              <button onClick={()=>downloadICS(events)} className={cls.btn}><Download className="h-4 w-4"/> Export .ics</button>
              <div className="hidden md:block text-sm text-gray-500"><Filter className="mr-1 inline h-4 w-4"/>8h–20h</div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 p-1">
              {(['week','day','agenda'] as const).map(v => (
                <button key={v} onClick={()=>setView(v)} className={`rounded-full px-3 py-1.5 text-xs ${view===v ? 'bg-gray-900 text-white' : 'text-gray-800'}`}>{v==='week'?'Semaine':v==='day'?'Jour':'Agenda'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vue calendrier */}
      {view !== 'agenda' ? (
        <div className={`${cls.card} overflow-hidden`}>
          {/* En-têtes jours */}
          <div className="grid grid-cols-8 border-b border-gray-200/70 bg-white/70 px-2 py-2 text-xs font-medium text-gray-500">
            <div className="col-span-1"></div>
            {(view==='week' ? days : [current]).map((d) => (
              <div key={d.toISOString()} className={`col-span-${view==='week'?1:7} text-center`}>{formatDayLabel(d)}</div>
            ))}
          </div>

          {/* Grille heures */}
          <div className="grid grid-cols-8">
            {/* Colonne heures */}
            <div className="col-span-1">
              {hours.map(h => (
                <div key={h} className="h-[56px] border-b border-dashed border-gray-200/80 pl-2 text-[11px] text-gray-500 flex items-start">{String(h).padStart(2,'0')}:00</div>
              ))}
            </div>

            {/* Colonnes jours */}
            <div className={`${view==='week' ? 'col-span-7 grid grid-cols-7' : 'col-span-7'}`}>
              {(view==='week' ? days : [current]).map((day) => (
                <div key={day.toISOString()} className="relative border-l border-gray-100/80">
                  {/* slots */}
                  {hours.map(h => (
                    <div key={h} className="h-[56px] border-b border-dashed border-gray-200/70" />
                  ))}

                  {/* events du jour */}
                  <div className="absolute inset-0">
                    {eventsForDay(day).map((e, idx) => {
                      const s = new Date(e.start); const en = new Date(e.end);
                      const top = Math.max(0, minutesSince(s)) * pxPerMin;
                      const height = Math.max(28, (en.getTime() - s.getTime()) / 60000 * pxPerMin);
                      const leftOffset = (idx % 2) * 6; // simple gestion de chevauchement léger
                      return (
                        <div
                          key={e.id}
                          className={`absolute right-1 left-1 rounded-2xl border px-2 py-1 text-[11px] shadow ${statusColor[e.status]}`}
                          style={{ top, height, marginLeft: leftOffset }}
                          title={`${e.title} • ${new Date(e.start).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold">{e.title}</span>
                            {e.status==='DONE' && <CheckCircle2 className="h-3.5 w-3.5"/>}
                          </div>
                          <div className="truncate text-[10px] text-current/80">
                            <MapPin className="mr-1 inline h-3 w-3"/>{e.address}
                          </div>
                          <div className="text-[10px] text-current/80">
                            <Clock className="mr-1 inline h-3 w-3"/>
                            {new Date(e.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–{new Date(e.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Vue agenda (mobile-friendly)
        <div className={`${cls.card}`}>
          <ul className="divide-y divide-gray-200/70">
            {events
              .filter(e => view==='agenda')
              .concat(view!=='agenda' ? [] : []) /* juste pour respecter le type */}
            {events
              .filter(e => {
                if (view==='agenda') return true;
                return true;
              })
              .sort((a,b)=> new Date(a.start).getTime() - new Date(b.start).getTime())
              .map(e => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(e.start).toLocaleDateString()} • {new Date(e.start).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}–{new Date(e.end).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                    </p>
                    <p className="text-xs text-gray-500"><MapPin className="mr-1 inline h-3 w-3"/>{e.address}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor[e.status]}`}>{e.status}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </Wrapper>
  );
};

export default PlanningPage;
