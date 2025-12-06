"use client"

import { Users, BookOpen, Settings, LogOut, Home, ChevronRight, Building2, BookMarked, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRole } from "@/context/role-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";

const menuConfig = {
  ADMINISTRATIVO: [
    { label: "Crear Usuario", href: "/usuarios/crear" },
    { label: "Crear Departamento", href: "/departamentos/crear" },
    { label: "Crear Carrera", href: "/carreras/crear" },
    { label: "Crear Materia", href: "/materias/crear" },
    { label: "Crear Programa", href: "/programas/crear" },
    { label: "Programas", href: "/programas" },
    { label: "Usuarios", href: "/usuarios" },
    { label: "Departamentos", href: "/departamentos" },
    { label: "Carreras", href: "/carreras" },
    { label: "Materias", href: "/materias" },
  ],
  PROFESOR: [
    { label: "Mis materias", href: "/materias" },
    { label: "Cargar notas", href: "/notas" },
  ],
  SECRETARIO: [
    { label: "Programas", href: "/programas" },
    { label: "Inscripciones", href: "/inscripciones" },
  ],
};

export function Sidebar() {
  const { logout } = useContext(AuthContext);
  const { availableRoles, activeRole, setActiveRole } = useRole();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const options = menuConfig[activeRole as keyof typeof menuConfig] ?? [];


  const handleLogout = () => {
    setIsLoading(true)
    try {
      logout()
      
      router.push("/login")

    } catch (err) {
      console.error("Error al registrarse:", err)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <aside className="fixed w-64 top-0 left-0 z-30 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border/50">
        <Link href="/">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold">SyllabUNS</h1>
            <img src="/uns_pluma_v3.png" alt="Logo UNS" className="h-11 ml-1" />
          </div>
        </Link>
        <p className="text-xs text-sidebar-foreground/60 text-center mt-1">Sistema de Gestión de Programas</p>
      </div>


      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Role Selector */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-4">
            Seleccionar Rol
          </h2>
          <div className="space-y-2">
            {availableRoles.filter((role) => role !== "ADMIN").map((role) => (
              <button
                key={role}
                value={role}
                onClick={() => setActiveRole(role)}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all text-sm font-medium border ${
                  activeRole === role
                    ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20 border-transparent hover:border-sidebar-accent/30"
                }`}
              >
                <span className="flex-1 text-left">{role}</span>
                {activeRole === role && <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        </div>


        <div className="p-4 border-t border-sidebar-border/50">
          <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-4">Acciones</h2>
          <div className="space-y-2">
            {options.map((item) => (
              <Link href={item.href} key={item.href}>
                <button
                  className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/30 border border-transparent hover:border-sidebar-accent/40"
                >
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-destructive/10 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span className="text-xs">Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  )
}
