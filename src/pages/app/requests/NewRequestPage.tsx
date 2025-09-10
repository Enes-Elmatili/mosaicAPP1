"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/api/apiClient"
import { motion } from "framer-motion"
import { Wrench, Brush, Car, Laptop } from "lucide-react"
import { FileUpload } from "@/components/ui" // ✅ ton composant

type Step = 1 | 2 | 3 | 4

const services = [
  { id: "bricolage", label: "Bricolage", icon: Wrench },
  { id: "menage", label: "Ménage", icon: Brush },
  { id: "transport", label: "Transport", icon: Car },
  { id: "tech", label: "Tech", icon: Laptop },
]

const NewRequestPage: React.FC = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [service, setService] = useState<string | null>(null)
  const [desc, setDesc] = useState("")
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [duration, setDuration] = useState<number>(1)
  const [photos, setPhotos] = useState<string[]>([])
  const [price, setPrice] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      // 1️⃣ Créer la requête
      const { data } = await apiClient.post<{ id: string }>("/api/requests/create", {
        title: service,
        description: desc,
        address,
        date,
        duration,
        price,
        photos,
      })

      const reqId = data.id

      // 2️⃣ Matching
      await apiClient.post(`/api/matching/${reqId}`, {})

      // 3️⃣ Paiement
      await apiClient.post("/api/payments", {
        requestId: reqId,
        amount: price,
        method: "card",
      })

      navigate("/app/dashboard")
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la création de la requête.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Créer une requête</h1>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              step >= i ? "bg-black" : "bg-neutral-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1 : Service */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-4">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setService(s.id)}
              className={`flex flex-col items-center gap-2 rounded-lg border px-4 py-6 shadow-sm transition ${
                service === s.id
                  ? "border-black bg-neutral-100"
                  : "border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <s.icon className="h-6 w-6" />
              <span>{s.label}</span>
            </button>
          ))}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => service && setStep(2)}
            className="col-span-2 mt-6 w-full rounded-lg bg-black text-white py-2 font-semibold"
            disabled={!service}
          >
            Étape suivante
          </motion.button>
        </div>
      )}

      {/* Step 2 : Détails */}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (photos.length === 0) {
              setError("Veuillez ajouter au moins une photo.")
              return
            }
            setStep(3)
          }}
          className="space-y-5"
        >
          {error && (
            <div className="rounded-md bg-red-50 text-red-600 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-md border px-3 py-2"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Adresse</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Date</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium">Durée (h)</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* FileUpload obligatoire */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photos (obligatoire)
            </label>
            <FileUpload
              multiple
              onUploadSuccess={(urls: string[]) => setPhotos((prev) => [...prev, ...urls])}
              onRemove={(url: string) => {
                setPhotos((prev) => prev.filter((p) => p !== url))
              }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full rounded-lg bg-black text-white py-2 font-semibold"
          >
            Étape suivante
          </motion.button>
        </form>
      )}

      {/* Step 3 : Récapitulatif */}
      {step === 3 && (
        <div className="space-y-4">
          <p>
            <strong>Service :</strong> {service}
          </p>
          <p>
            <strong>Description :</strong> {desc}
          </p>
          <p>
            <strong>Adresse :</strong> {address}
          </p>
          <p>
            <strong>Date :</strong> {date}
          </p>
          <p>
            <strong>Durée :</strong> {duration} h
          </p>
          <p className="text-lg font-bold">Total estimé : {duration * 45} €</p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setPrice(duration * 45)
              setStep(4)
            }}
            className="w-full rounded-lg bg-black text-white py-2 font-semibold"
          >
            Étape suivante
          </motion.button>
        </div>
      )}

      {/* Step 4 : Paiement */}
      {step === 4 && (
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 text-red-600 px-4 py-2 text-sm">
              {error}
            </div>
          )}
          <p className="text-lg font-semibold">Montant à payer : {price} €</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 font-semibold disabled:opacity-70"
          >
            {loading ? "Paiement en cours…" : "Confirmer et payer"}
          </motion.button>
        </div>
      )}
    </main>
  )
}

export default NewRequestPage
