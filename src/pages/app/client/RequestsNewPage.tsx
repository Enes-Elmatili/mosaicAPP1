export default function RequestsNewPage() {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Nouvelle demande</h1>
        <form className="space-y-4">
          <input type="text" placeholder="Type de service" className="w-full p-2 border rounded" />
          <textarea placeholder="Description" className="w-full p-2 border rounded" rows={4} />
          <input type="datetime-local" className="w-full p-2 border rounded" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
            Valider
          </button>
        </form>
      </div>
    );
  }
  