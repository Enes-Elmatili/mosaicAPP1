import React, { useMemo, useState } from 'react';
import { Upload, Search, FileText, Download, Eye, Trash2, Filter } from 'lucide-react';
import PageWrapper from '../../components/layouts/PageWrapper';

// Type de document
interface DocItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'IMAGE' | 'OTHER';
  sizeKB: number;
  uploadedAt: string; // ISO
  tags?: string[];
}

// Données mock pour l'UI
const MOCK_DOCS: DocItem[] = [
  { id: 'doc_001', name: 'Contrat de location - Apt 3B.pdf', type: 'PDF', sizeKB: 842, uploadedAt: '2025-07-21T10:05:00Z', tags: ['contrat', 'signé'] },
  { id: 'doc_002', name: 'Etat des lieux.pdf', type: 'PDF', sizeKB: 1260, uploadedAt: '2025-07-18T15:40:00Z', tags: ['état-des-lieux'] },
  { id: 'doc_003', name: 'Reçu loyer - Juillet 2025.pdf', type: 'PDF', sizeKB: 210, uploadedAt: '2025-07-05T09:12:00Z', tags: ['reçu', 'loyer'] },
  { id: 'doc_004', name: 'Assurance habitation_2025.pdf', type: 'PDF', sizeKB: 675, uploadedAt: '2025-06-28T17:22:00Z', tags: ['assurance'] },
];

// Petits helpers UI (style premium, gris sidéral, transparent)
const cls = {
  card: 'rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg',
  btnPrimary: 'inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-black/90 active:scale-[.98] transition-all',
  btnGhost: 'inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white transition-all',
  input: 'w-full rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300',
  chip: 'inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-gray-700',
};

const prettySize = (kb: number) =>
  kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${kb} Ko`;

const labelType = (t: DocItem['type']) => {
  const map: Record<DocItem['type'], string> = {
    PDF: 'PDF', DOCX: 'Word', XLSX: 'Excel', IMAGE: 'Image', OTHER: 'Autre'
  };
  return map[t];
};

const DocumentsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'date' | 'name' | 'size'>('date');

  const filtered = useMemo(() => {
    const base = MOCK_DOCS.filter(d =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      (d.tags || []).some(t => t.toLowerCase().includes(q.toLowerCase()))
    );
    const sorted = [...base].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'size') return b.sizeKB - a.sizeKB;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    return sorted;
  }, [q, sort]);

  return (
    <PageWrapper title="Documents">
      {/* Barre d’actions */}
      <div className={`${cls.card} p-4 mb-6`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Recherche */}
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un document, un tag…"
              className={`${cls.input} pl-9`}
            />
          </div>
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button className={cls.btnGhost} onClick={() => setSort(sort === 'date' ? 'name' : sort === 'name' ? 'size' : 'date')}>
              <Filter className="h-4 w-4" /> Trier: {sort === 'date' ? 'Date' : sort === 'name' ? 'Nom' : 'Taille'}
            </button>
            <button className={cls.btnPrimary}>
              <Upload className="h-4 w-4" /> Importer
            </button>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className={`${cls.card} overflow-hidden`}>
        <div className="hidden grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-gray-500 md:grid">
          <div className="col-span-6">Nom</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Taille</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <ul className="divide-y divide-gray-200/70">
          {filtered.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-gray-600">
              Aucun document. Importez vos fichiers pour commencer.
            </li>
          )}
          {filtered.map((d) => (
            <li key={d.id} className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-12 md:items-center">
              <div className="col-span-6 flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/70">
                  <FileText className="h-5 w-5 text-gray-700" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">Ajouté le {new Date(d.uploadedAt).toLocaleDateString()}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(d.tags || []).map((t) => (
                      <span key={t} className={cls.chip}>#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-700">{labelType(d.type)}</div>
              <div className="col-span-2 text-sm text-gray-700">{prettySize(d.sizeKB)}</div>
              <div className="col-span-2 flex items-center justify-start gap-2 md:justify-end">
                <button className={cls.btnGhost} title="Aperçu">
                  <Eye className="h-4 w-4" />
                </button>
                <button className={cls.btnGhost} title="Télécharger">
                  <Download className="h-4 w-4" />
                </button>
                <button className={`${cls.btnGhost} hover:border-red-300 hover:text-red-700`} title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Note de sécurité / conformité */}
      <div className="mt-4 text-center text-[11px] text-gray-500">
        Les documents sont stockés de manière sécurisée. Pensez à masquer toute information sensible avant partage.
      </div>
    </PageWrapper>
  );
};

export default DocumentsPage;
