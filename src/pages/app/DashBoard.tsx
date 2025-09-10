  import { AppShell } from "@/components/layouts/AppShell";
import { EmptyState, Button } from "@/components/ui";

export default function Dashboard() {
  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Bienvenue sur votre espace</h1>

        <EmptyState
          title="Aucune mission en cours"
          description="Vos missions apparaîtront ici dès qu’elles seront créées."
          action={<Button>Nouvelle mission</Button>}
        />
      </div>
    </AppShell>
  );
}
