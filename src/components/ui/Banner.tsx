"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { X, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

type BannerAction = {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary" | "outline"
}

type BannerProps = {
  type?: "info" | "success" | "warning" | "error"
  title?: string
  description?: string
  actions?: BannerAction[]
  closable?: boolean
  icon?: React.ReactNode
  affinity?: "global" | "contextual"
  placement?: "top-floating" | "inline"
  onDismiss?: () => void
  onView?: () => void
}

const variants = {
  info: {
    icon: <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />,
    classes: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
    role: "status" as const,
    live: "polite" as const,
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />,
    classes: "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-200",
    role: "status" as const,
    live: "polite" as const,
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" aria-hidden="true" />,
    classes:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    role: "alert" as const,
    live: "assertive" as const,
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />,
    classes:
      "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-200",
    role: "alert" as const,
    live: "assertive" as const,
  },
}

export const Banner: React.FC<BannerProps> = ({
  type = "info",
  title,
  description,
  actions,
  closable = true,
  icon,
  affinity = "contextual",
  placement = "inline",
  onDismiss,
  onView,
}) => {
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    if (onView) onView()
  }, [onView])

  const handleClose = () => {
    setVisible(false)
    if (onDismiss) onDismiss()
  }

  const variant = variants[type]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role={variant.role}
          aria-live={variant.live}
          className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl border text-sm shadow-sm",
            placement === "top-floating" &&
              "fixed top-4 left-1/2 transform -translate-x-1/2 max-w-lg w-full z-50",
            variant.classes
          )}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {icon ?? variant.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            {title && <p className="font-semibold">{title}</p>}
            {description && (
              <p className="text-sm opacity-90">{description}</p>
            )}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition",
                    action.variant === "primary" &&
                      "bg-black text-white hover:bg-neutral-800",
                    action.variant === "secondary" &&
                      "bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
                    action.variant === "outline" &&
                      "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Dismiss */}
          {closable && (
            <button
              onClick={handleClose}
              className="ml-auto text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
              aria-label="Fermer la bannière"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-neutral-600 dark:text-neutral-400", className)}
      {...props}
    >
      {children}
    </p>
  )
}   