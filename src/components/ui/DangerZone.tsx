"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { Modal } from "@/components/ui/Modal"

type DangerAction = {
  label: string
  description?: string
  onAction: () => void
}

type DangerZoneProps = {
  title: string
  description?: string
  actions: DangerAction[]
  className?: string
}

export function DangerZone({
  title,
  description,
  actions,
  className,
}: DangerZoneProps) {
  const [confirmAction, setConfirmAction] = React.useState<DangerAction | null>(
    null
  )

  return (
    <>
      {/* Bloc DangerZone */}
      <div
        className={cn(
          "rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-6 space-y-6",
          className
        )}
      >
        <header>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-300">
              {description}
            </p>
          )}
        </header>

        {/* Liste des actions */}
        <div className="space-y-4">
          {actions.map((action, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {action.label}
                </p>
                {action.description && (
                  <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                    {action.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setConfirmAction(action)}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700 active:bg-red-800 transition"
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmation */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title="Confirmer l’action"
      >
        {confirmAction && (
          <>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Êtes-vous sûr de vouloir{" "}
              <span className="font-semibold text-red-600">
                {confirmAction.label.toLowerCase()}
              </span>
              ? <br />
              Cette action est irréversible.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  confirmAction.onAction()
                  setConfirmAction(null)
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow hover:bg-red-700 active:bg-red-800 transition"
              >
                Confirmer
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
