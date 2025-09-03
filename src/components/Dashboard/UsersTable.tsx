type UserRow = { id: string; email: string; role: string; createdAt: string; lastLoginAt?: string; isActive?: boolean };

export default function UsersTable({ items }: { items: UserRow[] }) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th>ID</Th>
            <Th>Email</Th>
            <Th>Rôle</Th>
            <Th>Créé</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t">
              <Td>{u.id}</Td>
              <Td>{u.email}</Td>
              <Td>{u.role}</Td>
              <Td>{new Date(u.createdAt).toLocaleString()}</Td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <Td colSpan={4} className="text-center p-4">Aucun utilisateur récent</Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left font-medium px-3 py-2">{children}</th>; }
function Td({ children, colSpan=1, className='' }: { children: React.ReactNode; colSpan?: number; className?: string }) {
  return <td colSpan={colSpan} className={`px-3 py-2 ${className}`}>{children}</td>;
}

