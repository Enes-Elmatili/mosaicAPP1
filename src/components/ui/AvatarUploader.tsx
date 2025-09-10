"use client"

import * as React from "react"
import { Upload, X, Check } from "lucide-react"
import { cn } from "@/lib/cx"
import { Modal } from "@/components/ui/Modal"

type AvatarUploaderProps = {
  open: boolean
  onClose: () => void
  onSave: (file: File) => void
}

export function AvatarUploader({ open, onClose, onSave }: AvatarUploaderProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)

  const handleFile = (f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const reset = () => {
    setPreview(null)
    setFile(null)
  }

  return (
    <Modal open={open} onClose={onClose} title="Changer l’avatar">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer",
          preview ? "border-primary" : "border-neutral-300 dark:border-neutral-700"
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-neutral-500">
            <Upload className="w-8 h-8 mb-2" />
            <p className="text-sm">Glissez-déposez une image ou cliquez pour sélectionner</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="avatar-input"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0])
          }}
        />
        <label
          htmlFor="avatar-input"
          className="mt-3 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-sm cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
        >
          Choisir un fichier
        </label>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            reset()
            onClose()
          }}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
        >
          <X className="w-4 h-4" /> Annuler
        </button>
        <button
          disabled={!file}
          onClick={() => {
            if (file) {
              onSave(file)
              reset()
              onClose()
            }
          }}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition",
            file
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed"
          )}
        >
          <Check className="w-4 h-4" /> Confirmer
        </button>
      </div>
    </Modal>
  )
}
AvatarUploader.displayName = "AvatarUploader"   