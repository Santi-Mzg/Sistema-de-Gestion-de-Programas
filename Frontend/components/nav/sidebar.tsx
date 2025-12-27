"use client"

import { LogOut, ChevronRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRole } from "@/context/role-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useDept } from "@/context/dept-context"
import { DepartamentoSelectorDialog } from "@/components/modals/departamento-selector-dialog"
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"

const getRoleLabel = (role: UsuarioDepartamentoDTORolesItem): string => {
  const roleLabels: Record<UsuarioDepartamentoDTORolesItem, string> = {
    SYSTEM_ADMIN: "System Admin",
    DIRECCION_ADMINISTRATIVA: "Dir. Administrativa",
    SECRETARIA: "Secretaría",
    COORDINACION_COMISION_CURRICULAR: "Coord. Comisión",
    DOCENTE: "Docente",
    ADMINISTRACION: "Administración",
  }
  return roleLabels[role] || role
}

export function Sidebar() {
  const { logout } = useAuth()
  const { availableRoles, activeRole, setActiveRole } = useRole()
  const { availableDepartamentos, activeDepartamento, setActiveDepartamento } = useDept()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false)



  const menuConfig = {
    SYSTEM_ADMIN: [
      { label: "Crear Departamento", href: "/departamentos/crear" },
      { label: "Crear Area", href: "/areas/crear" },
      { label: "Crear Carrera", href: "/carreras/crear" },
      { label: "Crear Materia", href: "/materias/crear" },
      { label: "Cargar Programa", href: "/programas/cargar" },
      { label: "Crear Usuario", href: "/usuarios/crear" },
      { label: "Departamentos", href: "/departamentos" },
      { label: "Mi Departamento", href: `/departamentos/${activeDepartamento?.departamentoId}`},
      { label: "Areas", href: "/areas" },
      { label: "Carreras", href: "/carreras" },
      { label: "Materias", href: "/materias" },
      { label: "Programas", href: "/programas" },
      { label: "Usuarios", href: "/usuarios" },
    ],
    DIRECCION_ADMINISTRATIVA: [
      { label: "Crear Area", href: "/areas/crear" },
      { label: "Crear Carrera", href: "/carreras/crear" },
      { label: "Crear Materia", href: "/materias/crear" },
      { label: "Cargar Programa", href: "/programas/cargar" },
      { label: "Crear Usuario", href: "/usuarios/crear" },
      { label: "Mi Departamento", href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Areas", href: "/areas" },
      { label: "Carreras", href: "/carreras" },
      { label: "Materias", href: "/materias" },
      { label: "Programas", href: "/programas" },
      { label: "Usuarios", href: "/usuarios" },
    ],
    SECRETARIA: [
      { label: "Crear Area", href: "/areas/crear" },
      { label: "Crear Carrera", href: "/carreras/crear" },
      { label: "Crear Materia", href: "/materias/crear" },
      { label: "Cargar Programa", href: "/programas/cargar" },
      { label: "Crear Usuario", href: "/usuarios/crear" },
      { label: "Mi Departamento", href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Areas", href: "/areas" },
      { label: "Carreras", href: "/carreras" },
      { label: "Materias", href: "/materias" },
      { label: "Programas", href: "/programas" },
      { label: "Usuarios", href: "/usuarios" },
    ],
    ADMINISTRACION: [
      { label: "Crear Usuario", href: "/usuarios/crear" },
      { label: "Crear Carrera", href: "/carreras/crear" },
      { label: "Crear Materia", href: "/materias/crear" },
      { label: "Cargar Programa", href: "/programas/cargar" },
      { label: "Mi Departamento", href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", href: "/programas" },
      { label: "Usuarios", href: "/usuarios" },
      { label: "Carreras", href: "/carreras" },
      { label: "Materias", href: "/materias" },
    ],
    COORDINACION_COMISION_CURRICULAR: [
      { label: "Mi Departamento", href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", href: "/programas" },
    ],
    DOCENTE: [
      { label: "Mi Departamento", href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", href: "/programas" },
    ],
  }



  const options = menuConfig[activeRole as keyof typeof menuConfig] ?? []

  const handleDptoChange = (deptId: string) => {
    if (!deptId) return

    const selected = availableDepartamentos.find((dept) => dept.departamentoNombre?.toString() === deptId)

    if (selected) {
      setActiveDepartamento(selected)
    }
  }

  const handleLogout = () => {
    setIsLoading(true)
    try {
      logout()
      router.push("/login")
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DepartamentoSelectorDialog
        open={isDeptDialogOpen}
        onOpenChange={setIsDeptDialogOpen}
        availableDepartamentos={availableDepartamentos}
        activeDepartamento={activeDepartamento}
        onSelectDepartamento={handleDptoChange}
      />

      <aside className="fixed w-64 top-0 left-0 z-30 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border/50 shrink-0">
          <Link href="/">
            <div className="flex items-center justify-center">
              <h1 className="text-2xl font-bold italic">Sílabus-</h1>
              <h1 className="text-2xl font-bold">UNS</h1>
              <img src="/uns_pluma_v3.png" alt="Logo UNS" className="h-9 ml-1" />
            </div>
          </Link>
          <p className="text-xs text-sidebar-foreground/60 text-center mt-1">Sistema de Gestión de Programas</p>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 border-b border-sidebar-border/50">
            <button
              onClick={() => setIsDeptDialogOpen(true)}
              className="w-full p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/10 hover:bg-sidebar-accent/20 transition-colors flex items-center gap-3"
            >
              <Building2 size={18} className="text-sidebar-foreground/70 flex-shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-sidebar-foreground/60">Departamento</p>
                <p className="text-sm font-medium text-sidebar-foreground">
                  {activeDepartamento?.departamentoNombre || "Seleccionar"}
                </p>
              </div>
              <ChevronRight size={16} className="text-sidebar-foreground/50 flex-shrink-0" />
            </button>
          </div>

          {/* Role Selector */}
          <div className="p-4">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
              Seleccionar Rol
            </h2>
            <div className="space-y-1.5">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`w-full px-3 py-2.5 rounded-md flex items-center gap-2 transition-all text-sm font-medium ${
                    activeRole === role
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                  }`}
                >
                  <span className="flex-1 text-left truncate">{getRoleLabel(role)}</span>
                  {activeRole === role && <ChevronRight size={14} className="shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="px-4 pb-4 border-t border-sidebar-border/50">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3 mt-4">
              Acciones
            </h2>
            <div className="space-y-1">
              {options.map((item) => (
                <Link href={item.href} key={item.href}>
                  <button className="w-full px-3 py-2 rounded-md flex items-center gap-2 transition-all text-sm text-sidebar-foreground hover:bg-sidebar-accent/20">
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border/50 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-destructive/10 bg-transparent"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut size={14} />
            <span className="text-xs">{isLoading ? "Cerrando..." : "Cerrar Sesión"}</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
