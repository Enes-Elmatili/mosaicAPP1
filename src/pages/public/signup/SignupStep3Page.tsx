// src/pages/public/signup/SignupStep3Page.tsx
import { useSignupForm } from "@/hooks/useSignupForm"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/context/AuthContext"
import * as React from "react"

export function SignupStep3Page() {
  const { data, reset, validate } = useSignupForm()
  const navigate = useNavigate()
  const { push } = useToast()
  const { signup } = useAuth()
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit() {
    const { valid, errors } = validate()
    if (!valid) {
      errors.forEach((msg) => push({ type: "error", message: msg }))
      return
    }

    try {
      setLoading(true)
      await signup({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
      })

      reset()
      push({ type: "success", message: "Compte créé avec succès " })
      navigate("/app") // ou "/login" selon ton flow
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur inattendue lors de l’inscription"
      push({ type: "error", message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Confirmer vos informations</h1>
        <p className="text-sm text-neutral-600">
          Vérifiez que tout est correct avant de créer votre compte.
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="space-y-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-6 text-sm">
        <p>
          <span className="font-medium">Email :</span> {data.email}
        </p>
        <p>
          <span className="font-medium">Prénom :</span> {data.firstName || "—"}
        </p>
        <p>
          <span className="font-medium">Nom :</span> {data.lastName || "—"}
        </p>
        <p>
          <span className="font-medium">Téléphone :</span>{" "}
          {`${data.phonePrefix} ${data.phone}`.trim() || "—"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6">
        <Button
          variant="ghost"
          className="rounded-full px-6 py-2 text-neutral-600"
          onClick={() => navigate("/signup/step-2")}
          disabled={loading}
        >
          ← Retour
        </Button>
        <Button
          className="rounded-full px-8 py-3 bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Création en cours..." : "Créer un compte →"}
        </Button>
      </div>
    </div>
  )
}
