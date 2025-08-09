/**
 * Testimonials.jsx
 * Section de témoignages utilisateurs (quotes + auteur).
 */
/**
 * Testimonials.jsx
 * Section de témoignages utilisateurs (quotes + auteur).
 */
export default function Testimonials() {
  const testimonials = [
    { name: 'Alice Dupont', quote: 'Service rapide et professionnel, je recommande!' },
    { name: 'Jean Martin', quote: 'Le prestataire était ponctuel et efficace.' },
    { name: 'Sophie Bernard', quote: 'Excellente expérience du début à la fin.' },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Témoignages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-lg shadow">
              <p className="italic mb-4">“{t.quote}”</p>
              <p className="font-semibold">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
