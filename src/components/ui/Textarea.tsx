"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type TextareaProps = {
  error?: string
  maxLength?: number
  autoResize?: boolean
  className?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      maxLength,
      autoResize = true,
      className,
      onInput,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(
      props.value?.toString().length ?? 0
    )

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget
      if (autoResize) {
        el.style.height = "auto"
        el.style.height = `${el.scrollHeight}px`
      }
      setCharCount(el.value.length)
      if (onInput) onInput(e)
    }

    return (
      <div className="w-full">
        <textarea
          ref={textareaRef}
          className={cn(
            "w-full min-h-[120px] px-4 py-3 rounded-lg border-2 transition resize-none",
            "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100",
            "placeholder-neutral-400 dark:placeholder-neutral-500",
            "focus:outline-none focus:border-black dark:focus:border-white",
            error
              ? "border-red-500 focus:border-red-600"
              : "border-neutral-300 dark:border-neutral-700",
            className
          )}
          onInput={handleInput}
          maxLength={maxLength}
          {...props}
        />

        <div className="flex justify-between mt-1">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}

          {maxLength && (
            <p
              className={cn(
                "text-sm",
                charCount > maxLength * 0.9
                  ? "text-red-500"
                  : "text-neutral-400"
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
