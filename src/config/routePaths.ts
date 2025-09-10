// ✅ Définition centralisée des chemins de l'app
export const RoutePaths = {
  // Public
  home: "/",
  features: "/features",
  faq: "/faq",
  login: "/login",
  signup: {
    root: "/signup",
    step1: "/signup/step-1",
    step2: "/signup/step-2",
    step3: "/signup/step-3",
  },
  forgotPassword: "/forgot",

  // Client
  app: {
    dashboard: "/app/dashboard",
    profile: "/app/profile",
    support: "/app/support",
    contracts: "/app/contracts",
    invoices: "/app/invoices",
    requests: {
      list: "/app/requests",
      new: "/app/requests/new",
      detail: (id: string | number) => `/app/requests/${id}`, // fonction pour ID
    },
    tickets: "/app/tickets",
  },

  // Provider
  provider: {
    dashboard: "/app/provider/dashboard",
    missions: "/app/provider/missions",
    missionDetail: (id: string | number) => `/app/provider/missions/${id}`,
    earnings: "/app/provider/earnings",
    planning: "/app/provider/planning",
  },
} as const;

// ✅ Type dérivé → auto-complétion + sécurité
export type RoutePath = typeof RoutePaths[keyof typeof RoutePaths];
