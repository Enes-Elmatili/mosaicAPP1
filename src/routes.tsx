import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import { AppShell } from "@/components/layouts/AppShell";
import { PublicLayout } from "@/components/layouts/PublicLayout";

// Auth
import { RequireAuth } from "@/context/AuthContext";

// Config
import { navLinks } from "@/config/navLinks";

// Pages publiques
import LandingPage from "@/pages/public/LandingPage";
import FeaturesPage from "@/pages/public/FeaturesPage";
import FAQPage from "@/pages/public/FAQPage";
import LoginPage from "@/pages/public/LoginPage";
import SignupPage from "@/pages/public/SignupPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import NotFoundPage from "@/pages/public/NotFoundPage";

// Pages signup (étapes)
import SignupStep1Page from "@/pages/public/signup/SignupStep1Page";
import { SignupStep2Page } from "@/pages/public/signup/SignupStep2Page";
import { SignupStep3Page } from "@/pages/public/signup/SignupStep3Page";

// Pages app (client)
import DashboardRouter from "@/pages/app/DashboardRouter";
import ClientDashboardPage from "@/pages/app/client/ClientDashboardPage";
import ProviderDashboardPage from "@/pages/app/provider/ProviderDashboardPage";
import ProfilePage from "@/pages/app/client/ProfilePage";
import SupportPage from "@/pages/app/client/SupportPage";
import ContractsPage from "@/pages/app/client/ContractsPage";
import InvoicesPage from "@/pages/app/client/InvoicesPage";
import RequestListPage from "@/pages/app/client/RequestListPage";
import RequestDetailPage from "@/pages/app/client/RequestDetailPage";
import RequestsNewPage from "@/pages/app/client/RequestsNewPage";
import TicketsPage from "@/pages/app/client/TicketsPage";
import MessagesPage from "@/pages/app/messages/MessagesPage";
import PaymentsPage from "@/pages/app/payements/PaymentsPage";
import WithdrawPage from "@/pages/app/payements/WithdrawPage";
import SettingsPage from "@/pages/app/profile/SettingsPage";

// Pages app (provider)
import MissionsPage from "@/pages/app/provider/MissionsPage";
import MissionDetailPage from "@/pages/app/provider/MissionDetailPage";
import EarningsPage from "@/pages/app/provider/EarningsPage";
import PlanningPage from "@/pages/app/provider/PlanningPage";

// ✅ définition du router
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/features", element: <FeaturesPage /> },
      { path: "/faq", element: <FAQPage /> },
      { path: "/login", element: <LoginPage /> },

      {
        path: "/signup",
        element: <SignupPage />,
        children: [
          { index: true, element: <Navigate to="step-1" replace /> },
          { path: "step-1", element: <SignupStep1Page /> },
          { path: "step-2", element: <SignupStep2Page /> },
          { path: "step-3", element: <SignupStep3Page /> },
        ],
      },

      { path: "/forgot", element: <ForgotPasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <AppShell navLinks={navLinks} variant="responsive" />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardRouter /> },
      { path: "client/dashboard", element: <ClientDashboardPage /> },
      { path: "provider/dashboard", element: <ProviderDashboardPage /> },
      { path: "missions", element: <MissionsPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "payments/withdraw", element: <WithdrawPage /> },
      // French-spelled aliases (payements)
      { path: "payements", element: <PaymentsPage /> },
      { path: "payements/withdraw", element: <WithdrawPage /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "support", element: <SupportPage /> },
      { path: "contracts", element: <ContractsPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "requests", element: <RequestListPage /> },
      { path: "requests/new", element: <RequestsNewPage /> },
      { path: "requests/:id", element: <RequestDetailPage /> },
      { path: "tickets", element: <TicketsPage /> },
      {
        path: "provider",
        children: [
          { path: "dashboard", element: <ProviderDashboardPage /> },
          { path: "missions", element: <MissionsPage /> },
          { path: "missions/:id", element: <MissionDetailPage /> },
          { path: "earnings", element: <EarningsPage /> },
          { path: "planning", element: <PlanningPage /> },
        ],
      },
    ],
  },
]);
