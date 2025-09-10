"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type InputState = "default" | "error" | "success" | "warning"

type InputProps = {
  error?: string
  fullWidth?: boolean
  state?: InputState
} & React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      fullWidth = true,
      state = "default",
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId()

    const stateClasses: Record<InputState, string> = {
      default: "border-neutral-300 focus:border-black dark:focus:border-white",
      error: "border-red-500 focus:border-red-600",
      success: "border-green-500 focus:border-green-600",
      warning: "border-yellow-500 focus:border-yellow-600",
    }

    return (
      <div className={cn(fullWidth && "w-full")}>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-12 px-4 rounded-lg border-2 transition",
            "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100",
            "placeholder-neutral-400 dark:placeholder-neutral-500",
            "focus:outline-none",
            stateClasses[state],
            error && "border-red-500",
            className
          )}
          aria-invalid={state === "error"}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
