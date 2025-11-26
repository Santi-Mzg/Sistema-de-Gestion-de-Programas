"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { ProfessorDashboard } from "@/components/dashboards/professor-dashboard"
import { CoordinatorDashboard } from "@/components/dashboards/coordinator-dashboard"
import { SecretaryDashboard } from "@/components/dashboards/secretary-dashboard"

type UserRole = "admin" | "professor" | "coordinator" | "secretary"

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin")

  const renderDashboard = () => {
    switch (currentRole) {
      case "admin":
        return <AdminDashboard />
      case "professor":
        return <ProfessorDashboard />
      case "coordinator":
        return <CoordinatorDashboard />
      case "secretary":
        return <SecretaryDashboard />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentRole={currentRole} setCurrentRole={setCurrentRole} />
      <main className="flex-1 overflow-auto">{renderDashboard()}</main>
    </div>
  )
}
