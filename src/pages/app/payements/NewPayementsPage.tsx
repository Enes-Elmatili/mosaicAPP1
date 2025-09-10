"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/api/apiClient"
import { motion } from "framer-motion"
import { CreditCard } from "lucide-react"
import { Input, Button } from "@/components/ui"
import { useToast } from "@/hooks/useToast"

const currencies = ["MAD", "EUR", "USD"]

const NewPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  // Renommage du hook pour une meilleure lisibilité
  const { push } = useToast() 
  // États pour les champs du formulaire

  const [providerId, setProviderId] = useState<string>("")
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState("MAD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation plus robuste avec des messages d'erreur spécifiques
    if (!providerId.trim()) {
      setError("Veuillez renseigner l'ID du fournisseur.")
      return
    }

    if (amount <= 0) {
      setError("Le montant doit être supérieur à zéro.")
      return
    }

    try {
      setLoading(true)
      await apiClient.post("/api/payments", {
        providerId,
        amount,
        currency,
      })

      push({
        title: "Paiement créé",
        message: `Paiement de ${amount} ${currency} envoyé avec succès.`,
        type: "success",
      })

      // Réinitialisation des champs après succès pour un nouveau formulaire
      setProviderId("")
      setAmount(0)
      setCurrency("MAD")

      navigate("/app/payments")
    } catch (err: any) {
      // Gestion d'erreur plus précise
      const errorMessage = err?.response?.data?.message || "Erreur lors de la création du paiement"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Ajout d'une animation d'entrée pour une meilleure expérience utilisateur
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto px-6 py-12"
    >
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="h-6 w-6" /> Nouveau paiement
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Provider */}
        <div>
          <label htmlFor="providerId" className="block text-sm font-medium mb-1">
            ID Fournisseur
          </label>
          <Input
            id="providerId"
            type="text"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            placeholder="ID du fournisseur"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Montant
          </label>
          <Input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium mb-1">
            Devise
          </label>
          <select
            id="currency"
            className="w-full rounded-md border border-neutral-300 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            type="submit"
            disabled={loading}
            className="w-full font-semibold"
          >
            {loading ? "Création en cours…" : "Créer le paiement"}
          </Button>
        </motion.div>
      </form>
    </motion.main>
  )
}

export default NewPaymentPage
