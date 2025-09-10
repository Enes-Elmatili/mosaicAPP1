// KPIs data for MOSAÏC homepage
export interface KPIItem {
  value: string;
  label: string;
  description: string;
}

export const kpis: KPIItem[] = [
  {
    value: "350+",
    label: "Biens gérés",
    description: "Propriétés dans tout le Maroc"
  },
  {
    value: "97%",
    label: "Satisfaction client",
    description: "Note moyenne propriétaires"
  },
  {
    value: "48h",
    label: "Délai d'intervention",
    description: "Réactivité garantie"
  },
  {
    value: "82%",
    label: "Taux d'occupation",
    description: "Performance locative moyenne"
  }
];