// src/pages/public/signup/SignupStep1Page.tsx
import * as React from "react"
import { useSignupForm } from "@/hooks/useSignupForm"
import { useNavigate } from "react-router-dom"
import { Input, Button } from "@/components/ui"
import { useToast } from "@/hooks/useToast"
import { apiClient, ApiError } from "@/api/apiClient"

export default function SignupStep1Page() {
  const { data, update, validate } = useSignupForm()
  const navigate = useNavigate()
  const { push } = useToast()
  const [loading, setLoading] = React.useState(false)

  // Validation locale avant API
  function validateLocal(): string[] {
    const errors: string[] = []
    if (!data.email.includes("@")) errors.push("Email invalide")
    if (data.password.length < 8) errors.push("Mot de passe trop court (8 caractères min)")
    return errors
  }

  async function handleNext() {
    // 1. Validation locale
    const localErrors = validateLocal()
    if (localErrors.length > 0) {
      localErrors.forEach((msg) => push({ type: "error", message: msg }))
      return
    }

    try {
      setLoading(true)

      // 2. Vérifie si l'email existe déjà côté backend
      const { data } = await apiClient.post<{ exists: boolean }>(
        "/api/auth/check-email",
        { email: data.email }
      )

      if (data.exists) {
        push({ type: "error", message: "Cette adresse email est déjà utilisée" })
        return
      }

      // 3. Passe à l'étape suivante
      navigate("/signup/step-2")
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : "Impossible de vérifier l'email"
      push({ type: "error", message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 sm:px-12 lg:px-24">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Créer votre compte</h1>
          <p className="text-sm text-neutral-600">
            Entrez votre email et choisissez un mot de passe.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            placeholder="Email"
            type="email"
            value={data.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update({ email: e.target.value })
            }
            className="h-12 rounded-lg border-2 focus:border-black"
          />
          <Input
            placeholder="Mot de passe"
            type="password"
            value={data.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update({ password: e.target.value })
            }
            className="h-12 rounded-lg border-2 focus:border-black"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6">
          <Button
            className="rounded-full px-8 py-3 bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-50"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "Vérification..." : "Suivant →"}
          </Button>
        </div>
      </div>
    </div>
  )
}
