/**
 * Footer.jsx
 * Composant Footer global affichant les informations de copyright.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-8 py-6">
      <div className="container mx-auto text-center text-sm text-gray-600">
        © {new Date().getFullYear()} MOSAÏC – Tous droits réservés
      </div>
    </footer>
  );
}
