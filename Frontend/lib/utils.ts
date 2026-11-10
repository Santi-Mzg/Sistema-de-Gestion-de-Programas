import { EstadoPrograma } from "@/app/api/generated/model/estadoPrograma"
import { Rol } from "@/app/api/generated/model/rol"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "Fecha desconocida"
  const date = new Date(dateString)
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getRoleLabel = (role: Rol): string => {
  const roleLabels: Record<Rol, string> = {
    COORDINADOR_AREA: "Coord. Área",
    SYSTEM_ADMIN: "Administrador del sistema",
    DIRECCION_ADMINISTRATIVA: "Dir. Administrativa",
    SECRETARIA: "Secretaría académica",
    COORDINACION_COMISION_CURRICULAR: "Coord. Comisión",
    DOCENTE: "Docente",
    ADMINISTRACION: "Administración",
  }
  return roleLabels[role] || role
}

export const getProgramStateLabel = (state: EstadoPrograma): string => {
  const stateLabels: Record<EstadoPrograma, string> = {
    PENDIENTE_DE_DOCENTE: 'Pendiente carga docente',
    RECHAZADO_A_SECRETARIA: 'Rechazado a secretaría inicial',
    PENDIENTE_DE_COORDINACION_AREA: 'En revisión (coordinación de área)',
    RECHAZADO_A_DOCENTE: 'Rechazado a docente',
    PENDIENTE_DE_COMISIONES_CURRICULARES: 'En revisión (comisiones curriculares)',
    RECHAZADO_A_ADMINISTRACION: 'Rechazado a administración',
    PENDIENTE_DE_SECRETARIA_INICIAL: 'Pendiente carga secretaría',
    PENDIENTE_DE_SECRETARIA_FINAL: 'En revisión (secretaría)',
    APROBADO: 'Aprobado',
  }
  return stateLabels[state] || state
}

export const getProgramStateStyles = (state: EstadoPrograma): string =>{
  const stateStyles: Record<EstadoPrograma, string> = {
    PENDIENTE_DE_DOCENTE: "border-blue-500 bg-blue-50 text-blue-700",
    RECHAZADO_A_SECRETARIA: "border-destructive bg-destructive/10 text-destructive",
    PENDIENTE_DE_COORDINACION_AREA: "border-amber-500 bg-amber-50 text-amber-700",
    RECHAZADO_A_DOCENTE: "border-destructive bg-destructive/10 text-destructive",
    PENDIENTE_DE_COMISIONES_CURRICULARES: "border-violet-500 bg-violet-50 text-violet-700",
    RECHAZADO_A_ADMINISTRACION: "border-destructive bg-destructive/10 text-destructive",
    PENDIENTE_DE_SECRETARIA_INICIAL: "border-blue-500 bg-blue-50 text-blue-700",
    PENDIENTE_DE_SECRETARIA_FINAL: "border-sky-500 bg-sky-50 text-sky-700",
    APROBADO: "border-emerald-500 bg-emerald-50 text-emerald-700",
  }
  return stateStyles[state] || "border-gray-300 bg-gray-50 text-gray-600"
};