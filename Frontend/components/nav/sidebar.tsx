"use client"

import { LogOut, ChevronRight, Building2, Contact, UserRoundCog, Home, FileText, GraduationCap, Layers, University, BookText, Users, BookOpenText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRole } from "@/context/role-context"
import Link from "next/link"
import { useState } from "react"
import { useDept } from "@/context/dept-context"
import { DepartamentoSelectorDialog } from "@/components/modals/departamento-selector-dialog"
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { useLogoutFlow } from "@/hooks/use-logout"
import { RoleSelectorDialog } from "../modals/role-selector-dialog copy"
import { getRoleLabel } from "@/lib/utils"

export function Sidebar() {
  const { logout } = useLogoutFlow()
  const { availableRoles, activeRole, setActiveRole } = useRole()
  const { availableDepartamentos, activeDepartamento, setActiveDepartamento } = useDept()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)



  const menuConfig = {
    SYSTEM_ADMIN: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Departamentos", icon: <Building2 size={18}/>, href: "/departamentos" },
      { label: "Areas", icon: <Layers size={18}/>, href: "/areas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
    ],
    DIRECCION_ADMINISTRATIVA: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Areas", icon: <Layers size={18}/>, href: "/areas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
    ],
    SECRETARIA: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Areas", icon: <Layers size={18}/>, href: "/areas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
    ],
    ADMINISTRACION: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
    ],
    COORDINACION_COMISION_CURRICULAR: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
    ],
    DOCENTE: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
    ],
  }

  const options = menuConfig[activeRole as keyof typeof menuConfig] ?? []

  const handleDptoChange = (deptName: string) => {
    if (deptName)
      setActiveDepartamento(deptName)
  }

  const handleRoleChange = (role: UsuarioDepartamentoDTORolesItem) => {
    if (role)
      setActiveRole(role)
  }

  const handleLogout = () => {
    setIsLoading(true)
    try {
      logout()
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
      <RoleSelectorDialog
        activeDeptName={activeDepartamento?.departamentoNombre}
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        availableRoles={availableRoles}
        activeRole={activeRole}
        onSelectRole={handleRoleChange}
      />

      <aside className="fixed w-64 top-0 left-0 z-30 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-blue-200/50 shrink-0">
          <Link href="/">
            <div className="flex items-center justify-center">
              <h1 className="text-2xl font-bold italic">Sílabus-</h1>
              <h1 className="text-2xl font-bold">UNS</h1>
              <img src="/uns_pluma_v3.png" alt="Logo UNS" className="h-9 ml-1" />
            </div>
          </Link>
          <p className="text-xs text-sidebar-foreground/60 text-center mt-1">Sistema de Gestión de Programas</p>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <div className="p-4">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
              Departamento
            </h2>
            <button
              onClick={() => setIsDeptDialogOpen(true)}
              className="w-full p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/10 hover:bg-sidebar-accent/20 transition-colors flex items-center gap-3"
            >
              <Building2 size={22} className="text-sidebar-foreground/70 shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-sidebar-foreground/60">Departamento Activo</p>
                <p className="text-sm font-medium text-sidebar-foreground">
                  {activeDepartamento?.departamentoNombre || "Seleccionar"}
                </p>
              </div>
              <ChevronRight size={16} className="text-sidebar-foreground/50 shrink-0" />
            </button>
          </div>

          {/* Role Selector */}
          <div className="p-4">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
              Rol
            </h2>
            <button
              onClick={() => setIsRoleDialogOpen(true)}
              className="w-full p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/10 hover:bg-sidebar-accent/20 transition-colors flex items-center gap-3"
            >
              <UserRoundCog size={22} className="text-sidebar-foreground/70 shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-sidebar-foreground/60">Rol Activo</p>
                <p className="text-sm font-medium text-sidebar-foreground">
                  {getRoleLabel(activeRole as UsuarioDepartamentoDTORolesItem) || "Seleccionar"}
                </p>
              </div>
              <ChevronRight size={16} className="text-sidebar-foreground/50 shrink-0" />
            </button>
          </div>
          
          {/* <div className="p-4">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
              Seleccionar Rol
            </h2>
            <div className="space-y-1.5">
              {rolesOrdenados.map((role) => (
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
          </div> */}

          {/* Actions Menu */}
          <div className="px-4 pb-4 border-t border-blue-200/50">
            <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3 mt-4">
              Recursos
            </h2>
            <div className="space-y-1">
              {options.map((item) => (
                <Link href={item.href} key={item.href}>
                  <button className="w-full px-3 py-2 rounded-md flex items-center gap-2 transition-all text-sm text-sidebar-foreground hover:bg-sidebar-accent/20 group">
                    <span className="text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-blue-200/50 shrink-0">
          <Button
            variant="ghost"
            size="default"
            className="w-full justify-start h-auto px-4 py-3 rounded-lg flex items-center gap-4 transition-all text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 group"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut size={18} className="shrink-0 transition-transform group-hover:scale-110"/>
            <span className="text-sm font-bold">
              {isLoading ? "Cerrando Sesión..." : "Cerrar Sesión"}
            </span>
          </Button>
        </div>
      </aside>
    </>
  )
}
