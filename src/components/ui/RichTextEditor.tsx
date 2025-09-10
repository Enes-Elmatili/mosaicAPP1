"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { Bold, Italic, Underline, List, ListOrdered, Link, Code, Quote } from "lucide-react"
import { motion } from "framer-motion"

type RichTextEditorProps = {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu…",
  className,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)

  // appliquer une commande execCommand
  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // gestion des raccourcis clavier
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault()
          exec("bold")
          break
        case "i":
          e.preventDefault()
          exec("italic")
          break
        case "u":
          e.preventDefault()
          exec("underline")
          break
      }
    }
  }

  return (
    <div className={cn("w-full border rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        {[
          { icon: <Bold className="h-4 w-4" />, cmd: "bold" },
          { icon: <Italic className="h-4 w-4" />, cmd: "italic" },
          { icon: <Underline className="h-4 w-4" />, cmd: "underline" },
          { icon: <List className="h-4 w-4" />, cmd: "insertUnorderedList" },
          { icon: <ListOrdered className="h-4 w-4" />, cmd: "insertOrderedList" },
          { icon: <Quote className="h-4 w-4" />, cmd: "formatBlock", arg: "blockquote" },
          { icon: <Code className="h-4 w-4" />, cmd: "formatBlock", arg: "pre" },
          { icon: <Link className="h-4 w-4" />, cmd: "createLink", arg: prompt("Entrez l’URL") || "" },
        ].map((btn, i) => (
          <motion.button
            key={i}
            onClick={() => exec(btn.cmd, btn.arg)}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            whileTap={{ scale: 0.9 }}
          >
            {btn.icon}
          </motion.button>
        ))}
      </div>

      {/* Zone editable */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onKeyDown={handleKey}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[150px] px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}
RichTextEditor.displayName = "RichTextEditor"