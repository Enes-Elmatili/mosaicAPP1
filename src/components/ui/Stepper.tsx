"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"
import { Progress } from "@/components/ui/ProgressBar"

type Step = {
  id: string
  label: string
  description?: string
  state?: "pending" | "active" | "completed" | "error"
}

type StepperProps = {
  steps: Step[]
  currentStep: string
  onStepChange?: (id: string) => void
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  onStepChange,
  className,
}: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <ol
      role="list"
      aria-label="Progression"
      className={cn(
        "flex items-center justify-center gap-12 w-full max-w-xl mx-auto",
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = index < currentIndex
        const isError = step.state === "error"

        return (
          <li
            key={step.id}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border transition-colors",
                isCompleted
                  ? "bg-black border-black text-white"
                  : isActive
                  ? "border-black text-black"
                  : isError
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-neutral-300 dark:border-neutral-600 text-neutral-400"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : isError ? (
                <X className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </motion.div>

            <span
              className={cn(
                "mt-2 text-xs font-medium",
                isActive
                  ? "text-black dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400"
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
Stepper.displayName = "Stepper"

/**
 * Variante : accepte un index numérique
 * + affiche la barre de progression
 */
export function StepperWithActiveIndex({
  steps,
  activeStep,
  onStepChange,
  className,
}: {
  steps: Step[]
  activeStep: number
  onStepChange?: (id: string) => void
  className?: string
}) {
  const safeIndex = Math.max(0, Math.min(activeStep, steps.length - 1))

  const enhancedSteps = steps.map((step, index) => {
    if (step.state === "error") return step
    if (index < safeIndex) return { ...step, state: "completed" as const }
    if (index === safeIndex) return { ...step, state: "active" as const }
    return { ...step, state: "pending" as const }
  })

  const percentage = Math.round(((safeIndex + 1) / steps.length) * 100)

  return (
    <div className="space-y-6">
      <Stepper
        steps={enhancedSteps}
        currentStep={steps[safeIndex]?.id}
        onStepChange={onStepChange}
        className={className}
      />

      <Progress
        value={percentage}
        max={100}
        variant="bar"
        size="sm"
        showValue={false} 
        className="max-w-xl mx-auto"
      />
    </div>
  )
}
StepperWithActiveIndex.displayName = "StepperWithActiveIndex"