/**
 * FAQ.jsx
 * Page Foire Aux Questions avec accordéons.
 */
import Layout from '../components/Layout';
import Accordion from '../components/Accordion';

export default function FAQ() {
  const faqs = [
    {
      question: 'Comment créer une demande ?',
      answer: 'Cliquez sur “Commencer” et remplissez le formulaire de demande.',
    },
    {
      question: 'Comment payer un prestataire ?',
      answer: 'Le paiement s’effectue sécuritairement via notre module de paiement intégré.',
    },
    {
      question: 'Puis-je annuler une demande ?',
      answer: 'Oui, vous pouvez annuler tant que le prestataire n’a pas confirmé la mission.',
    },
  ];
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Foire aux questions</h1>
        <div className="space-y-4">
          {faqs.map((f) => (
            <Accordion key={f.question} {...f} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
