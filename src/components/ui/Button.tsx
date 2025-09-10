"useme"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/cx"

/**
 * Premium Button (sans @radix-ui/react-slot)
 * - API conservée: asChild, variant, size, loading, fullWidth, icon
 * - asChild: clone l'enfant unique (Link, <a/>, etc.) et injecte style + contenu
 * - Fallback sûr si plusieurs enfants -> évite tout crash en prod
 */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive"
type Size = "sm" | "md" | "lg" | "icon"

export type ButtonProps = {
  size?: Size
  variant?: Variant
  loading?: boolean
  asChild?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const base =
  "relative inline-flex items-center justify-center select-none font-medium rounded-xl transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"

const sizeClasses: Record<Exclude<Size, "icon">, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
}

const iconSizeClass = "p-2 rounded-full h-10 w-10"

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-black to-neutral-800 text-white shadow-sm hover:from-neutral-900 hover:to-black focus-visible:ring-black/40",
  secondary:
    "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900/40 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-white",
  outline:
    "border border-neutral-300 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-300/50",
  ghost:
    "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-200/50",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50",
}

/** Vérifie & retourne l’unique enfant ReactElement, sinon null. */
function getSingleElementChild(children: React.ReactNode): React.ReactElement | null {
  if (React.Children.count(children) !== 1) return null
  const only = React.Children.only(children)
  return React.isValidElement(only) ? (only as React.ReactElement) : null
}

export const Button = React.forwardRef<unknown, ButtonProps>(
  (
    {
      size = "md",
      variant = "primary",
      loading = false,
      asChild = false,
      fullWidth = false,
      icon,
      className,
      children,
      disabled,
      type, // on gère "type" proprement pour les <a>/<Link>
      ...rest
    },
    ref
  ) => {
    const classes = cn(
      base,
      size === "icon" ? iconSizeClass : sizeClasses[size] ?? sizeClasses.md,
      variantClasses[variant],
      fullWidth && "w-full",
      className
    )

    // Contenu commun (spinner + icône + label)
    const content = (
      <>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" aria-hidden="true" />}
        {!loading && icon ? <span className="mr-2">{icon}</span> : null}
        <span className="relative z-10">{children}</span>
      </>
    )

    // Mode asChild: on clone l'enfant (Link, <a/>, etc.)
    if (asChild) {
      const child = getSingleElementChild(children)

      if (!child) {
        // DX en dev: aide explicite + fallback sans crash en prod
        if (import.meta.env?.DEV) {
          // eslint-disable-next-line no-console
          console.error(
            "[Button.asChild] attend exactement 1 enfant ReactElement. " +
              "Ex: <Button asChild><Link>Texte</Link></Button>"
          )
        }

        // Fallback: <button> pour ne pas planter l'app
        return (
          <button
            {...rest}
            ref={ref as React.Ref<HTMLButtonElement>}
            className={classes}
            type={type ?? "button"}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
          >
            {content}
          </button>
        )
      }

      // On évite de passer "type" & "disabled" invalides sur un <a>/<Link>
      const { className: childClassName, onClick: childOnClick, ...childProps } = child.props as {
        className?: string
        onClick?: React.MouseEventHandler
      }

      const mergedClassName = cn(childClassName, classes)

      const handleClick: React.MouseEventHandler = (e) => {
        if (disabled || loading) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        childOnClick?.(e)
        const restOnClick = (rest as { onClick?: React.MouseEventHandler }).onClick
        restOnClick?.(e)
      }

      return React.cloneElement(
        child,
        {
          ...childProps,
          ...rest, // on fusionne les props externes (href, onClick, etc.)
          ref: (child as any).ref ?? (ref as React.Ref<unknown>),
          className: mergedClassName,
          onClick: handleClick,
          "aria-disabled": (disabled || loading) || undefined,
          tabIndex: (disabled || loading) ? -1 : childProps?.tabIndex,
        },
        content
      )
    }

    // Mode standard: <button>
    return (
      <button
        {...rest}
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        type={type ?? "button"}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"