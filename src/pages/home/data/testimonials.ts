// Testimonials data for MOSAÏC homepage
export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  location: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Amina",
    role: "Propriétaire expatriée",
    content: "MOSAÏC gère mes 3 appartements à Casablanca depuis 2 ans. Transparence totale et rentabilité maximisée. Je recommande vivement !",
    rating: 5,
    location: "Casablanca"
  },
  {
    name: "Youssef",
    role: "Investisseur immobilier",
    content: "Service exceptionnel ! Maintenance rapide, reporting détaillé chaque mois. Mes locataires sont satisfaits, moi aussi.",
    rating: 5,
    location: "Rabat"
  },
  {
    name: "Sarah",
    role: "Propriétaire résidente",
    content: "La conciergerie premium a transformé l'expérience de mes locataires. Taux d'occupation de 95% depuis le début !",
    rating: 5,
    location: "Marrakech"
  }
];