import { useParams } from "react-router-dom";

export default function RequestDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Demande #{id}</h1>
      <p>Détails de la demande (infos, statut, suivi en temps réel…)</p>
    </div>
  );
}
