import React from 'react';
import {
  CreditCard,
  Wrench,
  FileText,
  BarChart,
  Scale,
  CalendarCheck,
} from 'lucide-react';

interface Feature {
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  punchline: string;
  bullets: string[];
}

const features: Feature[] = [
  {
    title: 'Loyers & paiements',
    icon: CreditCard,
    punchline: 'Encaissement automatique, relances intelligentes, reçus en un clic.',
    bullets: [
      'Échéancier clair et statut en temps réel',
      'CB / virement / SEPA (selon dispo)',
      'Reçus & export comptable',
    ],
  },
  {
    title: 'Tickets & interventions',
    icon: Wrench,
    punchline: 'Ouvrez, affectez, suivez — avec photos et historique par bien.',
    bullets: [
      'Priorités & SLA, notifications instantanées',
      'Checklists terrain + preuve photo/vidéo',
      'Journal complet des actions',
    ],
  },
  {
    title: 'Documents & contrats',
    icon: FileText,
    punchline: 'Baux, états des lieux, quittances — centralisés et signables.',
    bullets: [
      'Modèles prêts à l’emploi',
      'Signature électronique & horodatage',
      'Coffre-fort sécurisé, partage contrôlé',
    ],
  },
  {
    title: 'Reporting & KPI',
    icon: BarChart,
    punchline: 'Occupation, loyers encaissés, impayés — la performance en un regard.',
    bullets: [
      'Tableau de bord par bien & portefeuille',
      'Alertes sur seuils (impayés, retards)',
      'Export PDF / Excel',
    ],
  },
  {
    title: 'Notaires & juridique',
    icon: Scale,
    punchline: 'Dossiers prêts pour le notaire, conformité sans friction.',
    bullets: [
      'Checklists et pièces requises',
      'Partage sécurisé aux parties prenantes',
      'Archivage légal',
    ],
  },
  {
    title: 'Prestataires & concierge',
    icon: CalendarCheck,
    punchline: 'Réseau vérifié pour entretien, ménage et petites réparations.',
    bullets: [
      'Planification et suivi d’exécution',
      'Validation avec preuve photo',
      'Paiements contrôlés',
    ],
  },
];

const Features: React.FC = () => (
  <section className="bg-gray-50 py-16">
    <div className="container mx-auto px-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-12">
        Fonctionnalités clés
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, icon: Icon, punchline, bullets }) => (
          <div
            key={title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition duration-200"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-full mb-4">
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700 mb-4">{punchline}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
