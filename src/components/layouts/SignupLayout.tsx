// src/pages/public/signup/SignupLayout.tsx
import { Outlet, useLocation } from "react-router-dom"
import { StepperWithActiveIndex } from "@/components/ui/Stepper"

const steps = [
  { id: "step-1", label: "Compte" },
  { id: "step-2", label: "Informations" },
  { id: "step-3", label: "Confirmation" },
]

export function SignupLayout() {
  const location = useLocation()
  const activeStep = steps.findIndex((s) => location.pathname.includes(s.id))

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-xl px-6 pt-12">
          {/* Stepper en noir */}
          <StepperWithActiveIndex steps={steps} activeStep={activeStep} />

          {/* Contenu dynamique */}
          <div className="mt-12">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}