"use client"

import React, { useEffect, useState } from "react"
import { apiClient } from "@/api/apiClient"
import { motion } from "framer-motion"
import io from "socket.io-client"
import { getSocketUrl } from "@/lib/socket"
import { CreditCard, Loader2, ArrowDownCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui"

type Payment = {
  id: string
  providerId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  createdAt: string
}

let socket: ReturnType<typeof io> | null = null

const statusColors: Record<Payment["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadPayments() {
    try {
      const { data } = await apiClient.get<{ data: Payment[] }>("/api/payments")
      setPayments(data.data)
    } catch {
      setError("Impossible de charger les paiements.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
    try {
      socket = io(getSocketUrl(), { withCredentials: true, path: "/socket.io", autoConnect: true })
      socket.on("connect_error", () => { try { socket && socket.close() } catch {} })
      socket.on("payment:created", (payment: Payment) => {
        setPayments((prev) => [payment, ...prev])
      })
      socket.on("payment:updated", (payment: Payment) => {
        setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)))
      })
      socket.on("payment:deleted", ({ id }: { id: string }) => {
        setPayments((prev) => prev.filter((p) => p.id !== id))
      })
    } catch {}

    return () => {
      try {
        if (socket) {
          socket.off("payment:created")
          socket.off("payment:updated")
          socket.off("payment:deleted")
          socket.close()
        }
      } catch {}
    }
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="h-6 w-6" /> Paiements
      </h1>

      <div className="mb-4 flex items-center justify-end">
        <Link
          to="/app/payements/withdraw"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <ArrowDownCircle className="h-4 w-4" /> Retirer des fonds
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement des paiements…
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fournisseur</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Montant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {payments.map((p) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <td className="px-4 py-3 text-sm font-mono">{p.id}</td>
                <td className="px-4 py-3 text-sm">{p.providerId}</td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {p.amount.toLocaleString("fr-FR")} {p.currency}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {new Date(p.createdAt).toLocaleString("fr-FR")}
                </td>
              </motion.tr>
            ))}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-500">
                  Aucun paiement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default PaymentsPage
