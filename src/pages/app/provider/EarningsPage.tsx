import React from "react";

/**
 * EarningPage.tsx — Page de suivi des revenus
 * - Compatible Tailwind
 * - Résumé en haut (chiffres clés)
 * - Tableau des missions avec paiements
 * - Accessible et responsive
 */

type Earning = {
  id: string;
  date: string;
  mission: string;
  client: string;
  amount: number;
  status: "paid" | "pending";
};

const dummyData: Earning[] = [
  { id: "1", date: "2025-08-01", mission: "Réparation plomberie", client: "Dupont", amount: 800, status: "paid" },
  { id: "2", date: "2025-08-05", mission: "Nettoyage appartement", client: "El Mansouri", amount: 500, status: "pending" },
  { id: "3", date: "2025-08-10", mission: "Électricité bureau", client: "SARL Atlas", amount: 1500, status: "paid" },
];

const EarningPage: React.FC = () => {
  const total = dummyData.reduce((sum, e) => sum + e.amount, 0);
  const paid = dummyData.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const pending = total - paid;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mes Revenus</h1>
          <p className="mt-2 text-gray-600">Suivez vos paiements et missions terminées.</p>
        </header>

        {/* Résumé */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Total gagné</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{total} MAD</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Déjà payé</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{paid} MAD</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">En attente</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{pending} MAD</p>
          </div>
        </section>

        {/* Tableau */}
        <section className="mt-10 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Mission</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3 text-right">Montant</th>
                <th className="px-6 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((e) => (
                <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{new Date(e.date).toLocaleDateString("fr-FR")}</td>
                  <td className="px-6 py-4">{e.mission}</td>
                  <td className="px-6 py-4">{e.client}</td>
                  <td className="px-6 py-4 text-right font-semibold">{e.amount} MAD</td>
                  <td className="px-6 py-4 text-center">
                    {e.status === "paid" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Payé
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        En attente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
};

export default EarningPage;
