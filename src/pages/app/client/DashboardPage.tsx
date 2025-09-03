import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Tableau de bord client</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/app/client/requests/new" className="p-4 bg-indigo-100 rounded-lg shadow hover:bg-indigo-200">
          ➕ Nouvelle demande
        </Link>
        <Link to="/app/client/requests" className="p-4 bg-indigo-100 rounded-lg shadow hover:bg-indigo-200">
          📋 Mes demandes
        </Link>
        <Link to="/app/client/invoices" className="p-4 bg-indigo-100 rounded-lg shadow hover:bg-indigo-200">
          💳 Factures
        </Link>
        <Link to="/app/client/contracts" className="p-4 bg-indigo-100 rounded-lg shadow hover:bg-indigo-200">
          📑 Contrats
        </Link>
        <Link to="/app/client/tickets" className="p-4 bg-indigo-100 rounded-lg shadow hover:bg-indigo-200">
          🛟 Support
        </Link>
        <Link to="/app/profile" className="p-4 bg-indigo-100 rounded-lg shadow hover:bg-indigo-200">
          ⚙️ Paramètres
        </Link>
      </div>
    </div>
  );
}
