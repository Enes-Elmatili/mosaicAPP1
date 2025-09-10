// src/pages/public/SignupPage.tsx
"use client"

import { Outlet } from "react-router-dom"
import { StepperWithActiveIndex } from "@/components/ui/Stepper"
import { useLocation } from "react-router-dom"

const steps = [
  { id: "step-1", label: "Compte" },
  { id: "step-2", label: "Informations" },
  { id: "step-3", label: "Confirmation" },
]

const SignupPage = () => {
  const location = useLocation()
  const activeIndex = steps.findIndex((s) =>
    location.pathname.includes(s.id)
  )

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-2xl p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
        {/* Stepper avec calcul auto */}
        <StepperWithActiveIndex steps={steps} activeStep={activeIndex} />

        {/* Contenu de l’étape courante */}
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default SignupPage