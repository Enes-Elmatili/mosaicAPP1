"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/cx"

type FileUploadProps = {
  files: File[]
  setFiles: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxSizeMb?: number
  label?: string
  helperText?: string
  className?: string
}

export function FileUpload({
  files,
  setFiles,
  multiple = true,
  accept,
  maxSizeMb = 10,
  label,
  helperText,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid: File[] = []
    Array.from(incoming).forEach((file) => {
      if (file.size / 1024 / 1024 <= maxSizeMb) {
        valid.push(file)
      } else {
        console.warn(`⚠️ ${file.name} dépasse ${maxSizeMb}MB`)
      }
    })
    setFiles(multiple ? [...files, ...valid] : valid.slice(0, 1))
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
      )}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        role="button"
        aria-label="Zone de dépôt de fichiers"
      >
        <Upload className="h-8 w-8 text-neutral-400 mb-2" />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Glissez-déposez vos fichiers ou <span className="text-primary font-medium">cliquez</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {helperText && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}

      {/* Liste des fichiers */}
      <ul className="mt-4 space-y-2">
        <AnimatePresence>
          {files.map((file, i) => {
            const isImage = file.type.startsWith("image/")
            return (
              <motion.li
                key={file.name + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between rounded-md border bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 p-2"
              >
                <div className="flex items-center gap-2">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-neutral-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[160px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  aria-label={`Supprimer ${file.name}`}
                >
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}