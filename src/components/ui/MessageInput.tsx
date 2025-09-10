"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Send, Paperclip, Smile } from "lucide-react"
import { cn } from "@/lib/cx"

type MessageInputProps = {
  onSend: (message: string) => void
  onAttach?: (file: File) => void
  placeholder?: string
  className?: string
}

export function MessageInput({
  onSend,
  onAttach,
  placeholder = "Écrire un message…",
  className,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!message.trim()) return
    onSend(message.trim())
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAttach?.(e.target.files[0])
    }
  }

  // autosize
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  return (
    <div
      className={cn(
        "flex items-end gap-2 p-3 border-t bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      {/* Bouton emoji (placeholder, peut être branché à un picker) */}
      <button
        type="button"
        aria-label="Insérer un emoji"
        className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Smile className="h-5 w-5" />
      </button>

      {/* Zone texte */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        role="textbox"
        aria-multiline="true"
        className="flex-1 resize-none rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      {/* Bouton fichier */}
      <label className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
        <Paperclip className="h-5 w-5" />
        <input type="file" className="hidden" onChange={handleAttach} />
      </label>

      {/* Bouton envoyer */}
      <motion.button
        type="button"
        aria-label="Envoyer le message"
        onClick={handleSend}
        disabled={!message.trim()}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "p-2 rounded-md transition",
          message.trim()
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed"
        )}
      >
        <Send className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
MessageInput.displayName = "MessageInput"