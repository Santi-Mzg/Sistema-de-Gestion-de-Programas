"use client"

import { LogOut, ChevronRight, Building2, Contact, UserRoundCog, Home, FileText, GraduationCap, Layers, University, BookText, Users, BookOpenText, User, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRole } from "@/context/role-context"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useDept } from "@/context/dept-context"
import { DepartamentoSelectorDialog } from "@/components/modals/departamento-selector-dialog"
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { useLogoutFlow } from "@/hooks/use-logout"
import { RoleSelectorDialog } from "../modals/role-selector-dialog copy"
import { getRoleLabel } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { AboutDialog } from "../modals/about-dialog"

export function Sidebar() {
  const { logout } = useLogoutFlow()
  const { user } = useAuth()
  const { availableRoles, activeRole, setActiveRole } = useRole()
  const { availableDepartamentos, activeDepartamento, setActiveDepartamento } = useDept()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const menuConfig = {
    SYSTEM_ADMIN: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Perfil", icon: <User size={18}/>, href: `/mi-perfil` },
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
      { label: "Mi Perfil", icon: <User size={18}/>, href: `/mi-perfil` },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Areas", icon: <Layers size={18}/>, href: "/areas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
    ],
    SECRETARIA: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Perfil", icon: <User size={18}/>, href: `/mi-perfil` },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Areas", icon: <Layers size={18}/>, href: "/areas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
    ],
    ADMINISTRACION: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Perfil", icon: <User size={18}/>, href: `/mi-perfil` },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
      { label: "Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Usuarios", icon: <Users size={18}/>, href: "/usuarios" },
      { label: "Materias", icon: <BookOpenText size={18}/>, href: "/materias" },
    ],
    COORDINACION_COMISION_CURRICULAR: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Perfil", icon: <User size={18}/>, href: `/mi-perfil` },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Mis Carreras", icon: <GraduationCap size={18}/>, href: "/carreras" },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
    ],
    DOCENTE: [
      { label: "Inicio", icon: <Home size={18}/>, href: "/" },
      { label: "Mi Perfil", icon: <User size={18}/>, href: `/mi-perfil` },
      { label: "Mi Departamento", icon: <University size={18}/>, href: `/departamentos/${activeDepartamento?.departamentoId}` },
      { label: "Programas", icon: <FileText size={18}/>, href: "/programas" },
    ],
  }

  const options = mounted
    ? menuConfig[activeRole as keyof typeof menuConfig] ?? []
    : []

    const resourcesRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [canScrollUp, setCanScrollUp] = useState(false)

  useEffect(() => {
    const element = resourcesRef.current
    if (!element) return

    const updateScrollState = () => {
      const hasMoreContentDown =
        element.scrollTop + element.clientHeight < element.scrollHeight - 2
      
        const hasMoreContentUp =
        element.scrollTop > 2

      setCanScrollDown(hasMoreContentDown)
      setCanScrollUp(hasMoreContentUp)
    }

    updateScrollState()

    element.addEventListener("scroll", updateScrollState)

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(element)

    return () => {
      element.removeEventListener("scroll", updateScrollState)
      resizeObserver.disconnect()
    }
  }, [options])

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
      <AboutDialog
        open={isAboutDialogOpen}
        onOpenChange={setIsAboutDialogOpen}
      />

      <aside className="fixed w-64 top-0 left-0 z-30 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-blue-200/50 shrink-0">
          <Link href="/">
            <div className="flex items-center justify-center">
              <h1 className="text-2xl font-bold italic">Sílabus-</h1>
              <h1 className="text-2xl font-bold">UNS</h1>
              <img src="/uns_pluma_v3.png" alt="Logo UNS" className="h-9 ml-1" />
            </div>
          </Link>
          <p className="text-xs text-sidebar-foreground/60 text-center mt-1">Sistema de Gestión de Programas</p>
        </div>

        <div className="shrink-0 flex-1" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
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
                  {mounted
                  ? activeDepartamento?.departamentoNombre || "Seleccionar"
                  : "Seleccionar"}
                </p>
              </div>
              <ChevronRight size={16} className="text-sidebar-foreground/50 shrink-0" />
            </button>
          </div>

          {/* Role Selector */}
          <div className="shrink-0 p-4">
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
                  {mounted
                  ? getRoleLabel(activeRole as UsuarioDepartamentoDTORolesItem) || "Seleccionar"
                  : "Seleccionar"}
                </p>
              </div>
              <ChevronRight size={16} className="text-sidebar-foreground/50 shrink-0" />
            </button>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="shrink-0 px-4 border-t border-blue-200/50">
          <h2 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3 mt-4">
            Recursos
          </h2>
        </div>

        <div className="relative flex-1 min-h-0">
          {/* Contenido que scrollea */}
          {canScrollUp && (
            <div
              className="
                pointer-events-none
                absolute top-0 left-0 right-0
                z-10 h-10
                flex items-start justify-center
                bg-linear-to-b from-sidebar to-transparent
              "
            >
              <ChevronUp
                size={18}
                className="mb-1 text-sidebar-foreground/60 animate-bounce"
              />
            </div>
          )}

          <div
            ref={resourcesRef}
            className="h-full overflow-y-auto overflow-x-hidden pb-6 space-y-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {options.map((item) => (
              <Link href={item.href} key={item.href}>
                <button className="w-full px-3 py-2 rounded-md flex items-center gap-2 transition-all text-sm text-sidebar-foreground hover:bg-sidebar-accent/20 group">
                  <span className="text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors">
                    {item.icon}
                  </span>
                  <span className="flex -1 text-left truncate">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
      
          {canScrollDown && (
            <div
              className="
                pointer-events-none
                absolute bottom-0 left-0 right-0
                h-10
                flex items-end justify-center
                bg-linear-to-t from-sidebar to-transparent
              "
            >
              <ChevronDown
                size={18}
                className="mb-1 text-sidebar-foreground/60 animate-bounce"
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-1 border-t border-b border-blue-200/50 shrink-0">
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

        <div className="px-4 py-2 flex justify-between text-center shrink-0">
          <p className="text-[11px] text-sidebar-foreground/50">
            Sílabus-UNS · v{process.env.NEXT_PUBLIC_APP_VERSION}
          </p>

          <button
            type="button"
            onClick={() => setIsAboutDialogOpen(true)}
            className="text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            Acerca del sistema
          </button>
        </div>
      </aside>
    </>
  )
}
