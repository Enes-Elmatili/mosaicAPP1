import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter, MoreVertical, Send, Paperclip, Phone, Video, Check, Clock, UserRound } from 'lucide-react';
import PageWrapper from '../../components/layouts/PageWrapper';

// Types
type Message = {
  id: string;
  author: 'me' | 'them';
  text: string;
  at: string; // ISO date
  status?: 'sent' | 'delivered' | 'seen';
};

type Conversation = {
  id: string;
  name: string;
  avatar?: string; // url or base64; optional
  lastMessage: string;
  unread: number;
  updatedAt: string; // ISO
  tags?: string[];
  messages: Message[];
};

// Mock data (replace with API later)
const MOCK_CONVOS: Conversation[] = [
  {
    id: 'c1',
    name: 'Sabrina (Locataire Apt 3B)',
    lastMessage: "Merci, c'est noté.",
    unread: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    tags: ['locataire'],
    messages: [
      { id: 'm1', author: 'them', text: 'Bonjour, le chauffage fait un bruit.', at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'm2', author: 'me', text: 'On planifie un passage demain matin.', at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), status: 'delivered' },
      { id: 'm3', author: 'them', text: "Merci, c'est noté.", at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    ],
  },
  {
    id: 'c2',
    name: 'Yassine (Prestataire Plomberie)',
    lastMessage: 'Photo reçue, j’arrive à 14h.',
    unread: 2,
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    tags: ['prestataire', 'plomberie'],
    messages: [
      { id: 'm1', author: 'me', text: 'Peux-tu passer 12 Rue du Parc ? Fuite cuisine.', at: new Date(Date.now() - 1000 * 60 * 50).toISOString(), status: 'sent' },
      { id: 'm2', author: 'them', text: 'Photo reçue, j’arrive à 14h.', at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
    ],
  },
  {
    id: 'c3',
    name: 'Omar (Propriétaire)',
    lastMessage: 'Ok valide pour le devis.',
    unread: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    tags: ['propriétaire'],
    messages: [
      { id: 'm1', author: 'them', text: 'Peux-tu me partager le dernier devis ?', at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
      { id: 'm2', author: 'me', text: 'Envoyé par email + ici.', at: new Date(Date.now() - 1000 * 60 * 280).toISOString(), status: 'seen' },
      { id: 'm3', author: 'them', text: 'Ok valide pour le devis.', at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
    ],
  },
];

// UI helpers (premium, gris sidéral, transparent)
const cls = {
  card: 'rounded-3xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg',
  input: 'w-full rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300',
  iconBtn: 'inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/70 p-2 text-gray-700 hover:bg-white active:scale-[.98] transition',
  primaryBtn: 'inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-black/90 active:scale-[.98] transition',
  chip: 'inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-gray-700',
};

const prettyTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const StatusIcon: React.FC<{ status?: Message['status'] }> = ({ status }) => {
  if (!status) return null;
  if (status === 'sent') return <Clock className="h-3.5 w-3.5 text-gray-400" />;
  if (status === 'delivered') return <Check className="h-3.5 w-3.5 text-gray-400" />;
  return <Check className="h-3.5 w-3.5 text-gray-800" />; // seen (darker)
};

const MessagesPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [convos, setConvos] = useState<Conversation[]>(MOCK_CONVOS);
  const [activeId, setActiveId] = useState<string>(MOCK_CONVOS[0]?.id || '');
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    return convos
      .filter(c => c.name.toLowerCase().includes(q.toLowerCase()) ||
                   c.lastMessage.toLowerCase().includes(q.toLowerCase()) ||
                   (c.tags || []).some(t => t.toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [q, convos]);

  const active = useMemo(() => filtered.find(c => c.id === activeId) || filtered[0], [filtered, activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, active?.messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text || !active) return;
    const now = new Date().toISOString();
    const newMsg: Message = { id: `tmp_${now}`, author: 'me', text, at: now, status: 'sent' };
    setConvos(prev => prev.map(c => c.id === active.id
      ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, updatedAt: now, unread: 0 }
      : c
    ));
    setDraft('');
    setTimeout(() => {
      // simulate delivered -> seen
      setConvos(prev => prev.map(c => c.id === active.id
        ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m) }
        : c));
      setTimeout(() => setConvos(prev => prev.map(c => c.id === active.id
        ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'seen' } : m) }
        : c)), 800);
    }, 600);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <PageWrapper title="Messages / Chat">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Conversations list */}
        <aside className={`${cls.card} p-4 lg:col-span-4 xl:col-span-3`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Rechercher une conversation, un tag…"
                className={`${cls.input} pl-9`}
              />
            </div>
            <button className={cls.iconBtn} title="Filtrer">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          <ul className="divide-y divide-gray-200/70">
            {filtered.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 px-2 py-3 text-left transition hover:bg-white rounded-2xl ${active?.id === c.id ? 'bg-white' : ''}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/70">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <UserRound className="h-5 w-5 text-gray-700" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                      <span className="text-[11px] text-gray-500">{new Date(c.updatedAt).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="truncate text-xs text-gray-500">{c.lastMessage}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(c.tags || []).map(t => (
                        <span key={t} className={cls.chip}>#{t}</span>
                      ))}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-900 px-1.5 text-[11px] font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat area */}
        <section className={`${cls.card} flex min-h-[540px] flex-col lg:col-span-8 xl:col-span-9`}>
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-gray-200/60 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/70">
                <UserRound className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{active?.name || 'Conversation'}</p>
                <p className="text-[11px] text-gray-500">Dernière activité {active ? new Date(active.updatedAt).toLocaleString() : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className={cls.iconBtn} title="Appel audio"><Phone className="h-4 w-4" /></button>
              <button className={cls.iconBtn} title="Appel vidéo"><Video className="h-4 w-4" /></button>
              <button className={cls.iconBtn} title="Plus"><MoreVertical className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
            {(active?.messages || []).map(m => (
              <div key={m.id} className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.author === 'me' ? 'bg-gray-900 text-white' : 'bg-white/80 text-gray-900 border border-gray-200'} max-w-[78%] rounded-2xl px-3 py-2 shadow-sm`}>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{m.text}</p>
                  <div className={`mt-1 flex items-center gap-1 text-[10px] ${m.author==='me' ? 'text-white/70' : 'text-gray-500'}`}>
                    <span>{prettyTime(m.at)}</span>
                    {m.author === 'me' && <StatusIcon status={m.status} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-gray-200/60 px-4 py-3">
            <div className="flex items-end gap-2">
              <button className={cls.iconBtn} title="Joindre un fichier"><Paperclip className="h-4 w-4" /></button>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Écrire un message…"
                rows={1}
                className="min-h-[44px] max-h-32 flex-1 resize-none rounded-2xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <button onClick={send} className={cls.primaryBtn} disabled={!draft.trim()}>
                <Send className="h-4 w-4" />
                Envoyer
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default MessagesPage;
