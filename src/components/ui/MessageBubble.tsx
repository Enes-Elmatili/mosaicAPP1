"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"
import { Check, CheckCheck } from "lucide-react"

type MessageBubbleProps = {
  sender: "client" | "provider"
  text?: string
  image?: string
  fileUrl?: string
  fileName?: string
  time: string
  status?: "sent" | "delivered" | "read"
  className?: string
}

export function MessageBubble({
  sender,
  text,
  image,
  fileUrl,
  fileName,
  time,
  status = "sent",
  className,
}: MessageBubbleProps) {
  const isClient = sender === "client"

  const statusIcon = {
    sent: <Check className="h-3 w-3 text-neutral-400" />,
    delivered: <CheckCheck className="h-3 w-3 text-neutral-400" />,
    read: <CheckCheck className="h-3 w-3 text-blue-500" />,
  }

  return (
    <motion.div
      role="article"
      aria-label={`${sender} message`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full",
        isClient ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-3 py-2 shadow-sm text-sm relative",
          isClient
            ? "bg-primary text-white rounded-br-sm"
            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm"
        )}
      >
        {/* Texte */}
        {text && <p className="whitespace-pre-wrap break-words">{text}</p>}

        {/* Image */}
        {image && (
          <img
            src={image}
            alt="image envoyée"
            className="mt-2 rounded-lg max-h-40 object-cover"
          />
        )}

        {/* Fichier */}
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs underline"
          >
            {fileName || "Télécharger le fichier"}
          </a>
        )}

        {/* Footer : heure + statut */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[11px]",
            isClient ? "justify-end" : "justify-start",
            isClient ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"
          )}
        >
          <span>{time}</span>
          {isClient && statusIcon[status]}
        </div>
      </div>
    </motion.div>
  )
}
MessageBubble.displayName = "MessageBubble"