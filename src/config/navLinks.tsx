import {
  Home,
  Briefcase,
  CreditCard,
  MessageSquare,
  User,
  Settings,
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
} from "lucide-react";
import type { NavLinkItem } from "@/components/layouts/AppShell";

export const navLinks: NavLinkItem[] = [
  // --- Commun ---
  {
    path: "/app/dashboard",
    label: "Accueil",
    icon: <Home className="h-5 w-5" />,
    roles: ["CLIENT", "PROVIDER", "ADMIN"],
  },

  // --- Client & Provider ---
  {
    path: "/app/missions",
    label: "Missions",
    icon: <Briefcase className="h-5 w-5" />,
    roles: ["CLIENT", "PROVIDER"],
  },
  {
    path: "/app/payments",
    label: "Paiements",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["PROVIDER", "ADMIN"],
  },
  {
    path: "/app/messages",
    label: "Messages",
    icon: <MessageSquare className="h-5 w-5" />,
    roles: ["CLIENT", "PROVIDER"],
  },
  {
    path: "/app/profile",
    label: "Profil",
    icon: <User className="h-5 w-5" />,
    roles: ["CLIENT", "PROVIDER"],
  },

  // --- Admin ---
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    path: "/admin/users",
    label: "Utilisateurs",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    path: "/admin/providers",
    label: "Providers",
    icon: <Building2 className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    path: "/admin/reports",
    label: "Rapports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["ADMIN"],
  },

  // --- Réglages ---
  {
    path: "/app/settings",
    label: "Réglages",
    icon: <Settings className="h-5 w-5" />,
    roles: ["CLIENT", "PROVIDER", "ADMIN"],
  },
];
