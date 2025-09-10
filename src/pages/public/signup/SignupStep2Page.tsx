// src/pages/public/signup/SignupStep2Page.tsx
import { useSignupForm } from "@/hooks/useSignupForm"
import { useNavigate } from "react-router-dom"
import { Input, Button } from "@/components/ui"
import { useToast } from "@/hooks/useToast"

export function SignupStep2Page() {
  const { data, update, validate } = useSignupForm()
  const navigate = useNavigate()
  const { push } = useToast()

  function handleNext() {
    const { valid, errors } = validate()
    if (!valid) {
      errors.forEach((msg) => push({ type: "error", message: msg }))
      return
    }
    navigate("/signup/step-3")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Vos informations</h1>
        <p className="text-sm text-neutral-600">
          Comment peut-on vous contacter ?
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          placeholder="Prénom"
          value={data.firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ firstName: e.target.value })
          }
          className="h-12 rounded-lg border-2 focus:border-black"
        />
        <Input
          placeholder="Nom"
          value={data.lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ lastName: e.target.value })
          }
          className="h-12 rounded-lg border-2 focus:border-black"
        />

        {/* Phone with prefix */}
        <div className="flex gap-2">
          <select
            value={data.phonePrefix}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              update({ phonePrefix: e.target.value })
            }
            className="w-28 h-12 rounded-lg border-2 border-neutral-300 focus:border-black bg-white dark:bg-neutral-900 px-2"
          >
            <option value="+212">+212</option>
            <option value="+33">+33</option>
            <option value="+32">+32</option>
            <option value="+1">+1</option>
          </select>
          <Input
            placeholder="Numéro de téléphone"
            type="tel"
            value={data.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update({ phone: e.target.value })
            }
            className="flex-1 h-12 rounded-lg border-2 focus:border-black"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="ghost"
          className="rounded-full px-6 py-2 text-neutral-600"
          onClick={() => navigate("/signup/step-1")}
        >
          ← Retour
        </Button>
        <Button
          className="rounded-full px-8 py-3 bg-black text-white font-medium hover:bg-neutral-800"
          onClick={handleNext}
        >
          Suivant →
        </Button>
      </div>
    </div>
  )
}