export default function InvoicesPage() {
    const invoices = [
      { id: "INV-001", amount: 250, status: "Payée" },
      { id: "INV-002", amount: 450, status: "En attente" },
    ];
  
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Mes factures</h1>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Montant</th>
              <th className="p-2 border">Statut</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="p-2 border">{inv.id}</td>
                <td className="p-2 border">{inv.amount} MAD</td>
                <td className="p-2 border">{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  