"use client"

import { Users, BookOpen, Settings, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"

interface SidebarProps {
  currentRole: "admin" | "professor" | "coordinator" | "secretary"
  setCurrentRole: (role: "admin" | "professor" | "coordinator" | "secretary") => void
}

export function Sidebar({ currentRole, setCurrentRole }: SidebarProps) {
  const roles = [
    { id: "admin" as const, label: "Administrativo", icon: Settings },
    { id: "professor" as const, label: "Profesor", icon: BookOpen },
    { id: "coordinator" as const, label: "Coordinador", icon: Users },
    { id: "secretary" as const, label: "Secretario", icon: Home },
  ]

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-center">SyllabUNS</h1>
        <p className="text-xs text-sidebar-foreground/60 text-center mt-1">Sistema de Gestión de Programas</p>
      </div>

      {/* Role Selector */}
      <div className="p-4 flex-1">
        <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-4">
          Seleccionar Rol
        </h2>
        <div className="space-y-2">
          {roles.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentRole(id)}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all text-sm font-medium ${
                currentRole === id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2"> {/* <- CONTENEDOR NUEVO */}
          <Button
            variant="outline"
            className="justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/10 bg-transparent"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </Button>

          <ModeToggle />
        </div>
      </div>
    </aside>
  )
}
