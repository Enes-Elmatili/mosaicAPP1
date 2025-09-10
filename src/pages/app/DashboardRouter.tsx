"use client"

import * as React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import ClientDashboardPage from "@/pages/app/client/ClientDashboardPage"
import ProviderDashboardPage from "@/pages/app/provider/ProviderDashboardPage"

export default function DashboardRouter(): JSX.Element {
  const { user } = useAuth()

  const roles = user?.roles || []
  if (roles.includes("PROVIDER")) return <ProviderDashboardPage />
  if (roles.includes("CLIENT")) return <ClientDashboardPage />
  if (roles.includes("ADMIN")) return <Navigate to="/admin/dashboard" replace />
  return <ClientDashboardPage />
}

