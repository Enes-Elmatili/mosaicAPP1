"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { useSocket } from "@/context/SocketContext"
import { useAuth } from "@/context/AuthContext"
import { Button, Badge, Input } from "@/components/ui"
import { Phone, Video, Bell, BellOff, CheckCheck, Paperclip, Smile, Mic, SendHorizontal } from "lucide-react"

type Message = {
  id: string
  senderId: string
  recipientId: string
  text?: string | null
  imageUrl?: string | null
  fileUrl?: string | null
  createdAt: string
  readAt?: string | null
}

type Conversation = {
  id: string
  partnerId: string
  partnerName?: string | null
  partnerAvatar?: string | null
  lastMessageAt?: string | null
  unreadCount?: number
  online?: boolean
}

export default function MessagesPage(): JSX.Element {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { socket } = useSocket()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const partnerId = params.get("c") || ""

  const [notifEnabled, setNotifEnabled] = useState<boolean>(true)
  const [typing, setTyping] = useState<boolean>(false)
  const [input, setInput] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)

  // Conversations list
  // Build threads from inbox (received messages): unique senderId
  const { data: inbox } = useQuery<{ data: Message[]; meta?: { page: number; limit: number; total: number } }>({
    queryKey: ["inbox"],
    queryFn: async () => (await apiClient.get<{ code: string; data: Message[]; meta?: { page: number; limit: number; total: number } }>("/api/messages/inbox")).data,
  })

  const threads = useMemo<Conversation[]>(() => {
    const list = inbox?.data || []
    const map = new Map<string, Conversation>()
    for (const m of list) {
      const existing = map.get(m.senderId)
      const unreadAdd = m.readAt ? 0 : 1
      if (!existing) {
        map.set(m.senderId, {
          id: m.senderId,
          partnerId: m.senderId,
          partnerName: undefined,
          partnerAvatar: undefined,
          lastMessageAt: m.createdAt,
          unreadCount: unreadAdd,
          online: false,
        })
      } else {
        existing.unreadCount = (existing.unreadCount || 0) + unreadAdd
        if (!existing.lastMessageAt || existing.lastMessageAt < m.createdAt) existing.lastMessageAt = m.createdAt
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.lastMessageAt! > a.lastMessageAt! ? 1 : -1))
  }, [inbox])

  // Messages for current conversation
  const { data: messagesData } = useQuery<{ data: Message[] }>({
    queryKey: ["messages", partnerId],
    queryFn: async () => (await apiClient.get<{ code: string; data: Message[] }>(`/api/messages/conversation/${encodeURIComponent(partnerId)}`)).data,
    enabled: Boolean(partnerId),
  })

  const messages = messagesData?.data ?? []
  const partner = useMemo<Conversation | undefined>(() => threads?.find((t) => t.id === partnerId), [threads, partnerId])

  // Socket listeners
  useEffect(() => {
    if (!socket) return
    const onNew = (m: Message) => {
      if ((m.senderId === partnerId) || (m.recipientId === partnerId)) {
        qc.setQueryData(["messages", partnerId], (prev: any) => ({ data: [ ...(prev?.data || []), m ] }))
        scrollToBottom()
      } else {
        qc.invalidateQueries({ queryKey: ["inbox"] })
      }
    }
    const onRead = (payload: { messageId: string; conversationId: string; readAt: string }) => {
      if (payload.conversationId === partnerId) {
        qc.setQueryData(["messages", partnerId], (prev: any) => ({
          data: (prev?.data || []).map((x: Message) => x.id === payload.messageId ? { ...x, readAt: payload.readAt } : x),
        }))
      }
    }
    const onTypingStart = (cid: string) => { if (cid === partnerId) setTyping(true) }
    const onTypingStop = (cid: string) => { if (cid === partnerId) setTyping(false) }

    socket.on("message:received", onNew)
    socket.on("message:read", onRead)
    socket.on("typing:start", onTypingStart)
    socket.on("typing:stop", onTypingStop)
    return () => {
      socket.off("message:received", onNew)
      socket.off("message:read", onRead)
      socket.off("typing:start", onTypingStart)
      socket.off("typing:stop", onTypingStop)
    }
  }, [socket, partnerId, qc])

  // Auto-scroll
  const listRef = useRef<HTMLDivElement | null>(null)
  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
    })
  }
  useEffect(() => { scrollToBottom() }, [messages.length])

  // Group by day
  const grouped = useMemo(() => groupByDay(messages), [messages])

  // Send message
  async function handleSend() {
    if (!partnerId || !input.trim()) return
    try {
      setSending(true)
      await apiClient.post("/api/messages", { recipientId: partnerId, content: input.trim() })
      setInput("")
      // The new message will arrive via socket "message:new"
    } finally {
      setSending(false)
    }
  }

  // Typing
  useEffect(() => {
    if (!socket || !partnerId) return
    if (!input) {
      socket.emit("typing:stop", partnerId)
      return
    }
    socket.emit("typing:start", partnerId)
    const t = setTimeout(() => socket.emit("typing:stop", partnerId), 1500)
    return () => clearTimeout(t)
  }, [input, socket, partnerId])

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Sidebar (desktop only) */}
      <aside className="hidden md:flex w-80 shrink-0 flex-col rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <input
            type="text"
            placeholder="Rechercher…"
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {(threads || []).map((c) => (
            <button
              key={c.id}
              onClick={() => setParams({ c: c.id })}
              className={`w-full p-3 text-left flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition ${c.id === partnerId ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
            >
              <Avatar src={c.partnerAvatar || undefined} alt={c.partnerName || ""} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-[clamp(0.9rem,1.2vw,1rem)]">{c.partnerName || "Conversation"}</p>
                  {c.unreadCount ? (
                    <span className="rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">{c.unreadCount}</span>
                  ) : null}
                </div>
                <p className="text-xs text-neutral-500">{c.online ? "En ligne" : "Hors ligne"}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={partner?.partnerAvatar || undefined} alt={partner?.partnerName || ""} />
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-[clamp(1rem,1.4vw,1.2rem)]">{partner?.partnerName || "Conversation"}</h2>
              <p className="text-xs text-neutral-500">{partner?.online ? "En ligne" : "Hors ligne"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton aria-label="Appel" onClick={() => console.log("call")}> <Phone className="h-4 w-4" /> </IconButton>
            <IconButton aria-label="Visio" onClick={() => console.log("video")}> <Video className="h-4 w-4" /> </IconButton>
            <IconButton aria-label="Notifications" onClick={() => setNotifEnabled((v) => !v)}>
              {notifEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </IconButton>
          </div>
        </div>

        {/* Messages list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
          {grouped.map((g) => (
            <div key={g.day} className="space-y-3">
              <div className="sticky top-0 z-10 flex justify-center">
                <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-0.5 text-xs text-neutral-600 dark:text-neutral-300 shadow">
                  {formatDayLabel(g.day)}
                </span>
              </div>
              {g.items.map((m) => (
                <MessageBubble key={m.id} message={m} selfId={user?.id || ""} />
              ))}
              {typing && <TypingBubble />}
            </div>
          ))}
          {grouped.length === 0 && (
            <div className="text-center text-sm text-neutral-500">Aucun message.</div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
          <div className="flex items-end gap-2">
            <IconButton aria-label="Joindre"><Paperclip className="h-5 w-5" /></IconButton>
            <IconButton aria-label="Emoji"><Smile className="h-5 w-5" /></IconButton>
            <AutoGrowTextarea value={input} onChange={setInput} onEnterSend={handleSend} placeholder="Écrire un message…" />
            <IconButton aria-label="Voix"><Mic className="h-5 w-5" /></IconButton>
            <Button onClick={handleSend} disabled={sending || !input.trim()} className="rounded-full h-10 px-4">
              {sending ? <SendHorizontal className="h-4 w-4 animate-pulse" /> : <SendHorizontal className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Subcomponents & utils

function Avatar({ src, alt }: { src?: string; alt?: string }) {
  return (
    <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center">
      {src ? <img src={src} alt={alt || "avatar"} className="h-full w-full object-cover" /> : <span className="text-xs">👤</span>}
    </div>
  )
}

function IconButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
    >
      {children}
    </button>
  )
}

function AutoGrowTextarea({ value, onChange, onEnterSend, placeholder }: { value: string; onChange: (v: string) => void; onEnterSend: () => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.style.height = "0px"
    ref.current.style.height = Math.min(ref.current.scrollHeight, 180) + "px"
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          onEnterSend()
        }
      }}
      placeholder={placeholder}
      rows={1}
      className="flex-1 resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
    />
  )
}

function MessageBubble({ message, selfId }: { message: Message; selfId: string }) {
  const isSelf = message.senderId === selfId
  const time = new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const text = (message as any).text ?? (message as any).content ?? ""
  const Bubble = (
    <div className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${isSelf ? "bg-primary text-white rounded-br-sm" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm"}`}>
      {text && <p className="whitespace-pre-wrap break-words text-[clamp(0.85rem,1vw,0.95rem)] leading-relaxed">{linkify(text)}</p>}
      {message.imageUrl && (
        <img src={message.imageUrl} alt="image" className="mt-2 rounded-lg max-h-60 object-cover" />
      )}
      {message.fileUrl && (
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block underline text-sm">Pièce jointe</a>
      )}
      <div className={`mt-1 flex items-center gap-1 text-[11px] ${isSelf ? "justify-end text-white/80" : "text-neutral-500 dark:text-neutral-400"}`}>
        <span>{time}</span>
        {isSelf && message.readAt && <CheckCheck className="h-3 w-3" />}
      </div>
    </div>
  )
  return (
    <div className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}>{Bubble}</div>
  )
}

function TypingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="inline-flex items-center gap-1 rounded-2xl bg-neutral-200 dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100">
        <span className="inline-block h-2 w-2 rounded-full bg-neutral-500 animate-pulse" />
        <span className="inline-block h-2 w-2 rounded-full bg-neutral-500 animate-pulse [animation-delay:150ms]" />
        <span className="inline-block h-2 w-2 rounded-full bg-neutral-500 animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  )
}

function groupByDay(items: Message[]): { day: string; items: Message[] }[] {
  const map = new Map<string, Message[]>()
  for (const m of items) {
    const d = new Date(m.createdAt)
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    const arr = map.get(key) || []
    arr.push(m)
    map.set(key, arr)
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, arr]) => ({ day, items: arr }))
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const ymd = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  if (ymd(d) === ymd(today)) return "Aujourd’hui"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (ymd(d) === ymd(yesterday)) return "Hier"
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "short" })
}

function linkify(text: string): React.ReactNode {
  const parts = text.split(/(https?:\/\/\S+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline">
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}
