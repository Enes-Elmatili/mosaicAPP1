"use client"

import * as React from "react"
import { apiClient } from "@/api/apiClient"
import { Button } from "@/components/ui"
import { ArrowDownCircle, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function WithdrawPage(): JSX.Element {
  const [balance, setBalance] = React.useState<number | null>(null)
  const [withdraws, setWithdraws] = React.useState<any[]>([])
  const [amount, setAmount] = React.useState<string>("")
  const [method, setMethod] = React.useState<string>("bank")
  const [destination, setDestination] = React.useState<string>("")
  const [note, setNote] = React.useState<string>("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState<boolean>(false)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await apiClient.get<{ balance: number }>("/api/wallet")
        if (!cancelled) setBalance(data.balance)
      } catch (e) {
        if (!cancelled) setError("Impossible de charger le solde.")
      }
    }
    load()
    // Load last withdraws
    async function loadWithdraws() {
      try {
        const { data } = await apiClient.get<{ data: any[] }>("/api/payements/withdraws")
        if (!cancelled) setWithdraws(data.data)
      } catch {}
    }
    loadWithdraws()
    return () => { cancelled = true }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setDone(false)
    const amt = Math.floor(Number(amount))
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Montant invalide")
      return
    }
    if (balance !== null && amt > balance) {
      setError("Montant supérieur au solde disponible")
      return
    }
    try {
      setSubmitting(true)
      const { data } = await apiClient.post<{ code: string; data: any }>("/api/payements/withdraw", {
        amount: amt,
        method,
        destination,
        note,
      })
      setDone(true)
      // Update balance locally
      if (balance !== null) setBalance(balance - amt)
      setAmount("")
      // refresh list
      try {
        const res2 = await apiClient.get<{ data: any[] }>("/api/payements/withdraws")
        setWithdraws(res2.data.data)
      } catch {}
    } catch (e) {
      setError("Échec du retrait. Réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowDownCircle className="h-6 w-6" /> Retrait
        </h1>
        <Link to="/app/payments" className="text-sm underline">← Retour aux paiements</Link>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-5 space-y-6">
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Solde disponible</p>
          <p className="text-3xl font-semibold">
            {balance === null ? (
              <span className="inline-flex items-center gap-2 text-neutral-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
              </span>
            ) : (
              <>{balance.toLocaleString("fr-FR")} MAD</>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Montant (MAD)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                placeholder="Ex: 500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Méthode</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
              >
                <option value="bank">Virement bancaire</option>
                <option value="wallet">Portefeuille mobile</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Destination (IBAN, téléphone…)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
              placeholder="Ex: MA1234… ou +2126…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
              placeholder="Information complémentaire (facultatif)"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {done && <p className="text-sm text-green-600">Demande de retrait enregistrée.</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !amount} className="rounded-full h-10 px-5">
              {submitting ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</span>
              ) : (
                "Confirmer le retrait"
              )}
            </Button>
            <Link to="/app/payments" className="text-sm underline">Annuler</Link>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-semibold">Mes demandes récentes</h2>
          <Link to="/app/payments" className="text-sm underline">Voir paiements</Link>
        </div>
        <div className="p-5">
          {withdraws.length === 0 ? (
            <p className="text-sm text-neutral-500">Aucune demande.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="py-2">ID</th>
                    <th className="py-2">Montant</th>
                    <th className="py-2">Méthode</th>
                    <th className="py-2">Destination</th>
                    <th className="py-2">Statut</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdraws.map((w) => (
                    <tr key={w.id} className="border-t border-neutral-100 dark:border-neutral-800">
                      <td className="py-2 font-mono">{w.id}</td>
                      <td className="py-2">{w.amount?.toLocaleString("fr-FR")} MAD</td>
                      <td className="py-2">{w.method || "-"}</td>
                      <td className="py-2">{w.destination || "-"}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${w.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : w.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{w.status}</span>
                      </td>
                      <td className="py-2 text-neutral-500">{new Date(w.createdAt).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
