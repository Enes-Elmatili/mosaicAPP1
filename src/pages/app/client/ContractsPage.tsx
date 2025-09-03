export default function ContractsPage() {
    const contracts = [
      { id: "CTR-001", property: "Appartement Gauthier", status: "Actif" },
    ];
  
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Mes contrats</h1>
        <ul>
          {contracts.map((c) => (
            <li key={c.id} className="p-4 border rounded mb-2">
              {c.property} — <span className="text-green-600">{c.status}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  