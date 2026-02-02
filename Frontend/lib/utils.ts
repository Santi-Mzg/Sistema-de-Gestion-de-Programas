import { ProgramaResponseDTOEstado } from "@/app/api/generated/model/programaResponseDTOEstado"
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model/usuarioDepartamentoDTORolesItem"
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

export const getRoleLabel = (role: UsuarioDepartamentoDTORolesItem): string => {
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

export const getProgramStateLabel = (state: ProgramaResponseDTOEstado): string => {
  const stateLabels: Record<ProgramaResponseDTOEstado, string> = {
    INCOMPLETO_POR_ADMINISTRACION: 'Pendiente Administración (Incompleto)',
    RECHAZADO_A_ADMINISTRACION: 'Rechazado a Administración',
    COMPLETO_POR_ADMINISTRACION: 'Pendiente Docente',
    INCOMPLETO_POR_PROFESOR: 'Pendiente Docente (Incompleto)',
    RECHAZADO_A_PROFESOR: 'Rechazado a Docente',
    COMPLETO_POR_PROFESOR: 'En Revisión (Comisiones Curriculares)',
    APROBADO_POR_COMISION: 'En Revisión (Secretaría)',
    APROBADO_POR_SECRETARIA: 'Aprobado',
  }
  return stateLabels[state] || state
}

export const getProgramStateStyles = (state: ProgramaResponseDTOEstado): string =>{
  const stateStyles: Record<ProgramaResponseDTOEstado, string> = {
    RECHAZADO_A_ADMINISTRACION: "border-destructive bg-destructive/10 text-destructive",
    RECHAZADO_A_PROFESOR: "border-destructive bg-destructive/10 text-destructive",

    INCOMPLETO_POR_ADMINISTRACION: "border-amber-500 bg-amber-50 text-amber-700",

    COMPLETO_POR_ADMINISTRACION: "border-blue-500 bg-blue-50 text-blue-700",

    INCOMPLETO_POR_PROFESOR: "border-amber-500 bg-amber-50 text-amber-700",

    COMPLETO_POR_PROFESOR: "border-violet-500 bg-violet-50 text-violet-700",

    APROBADO_POR_COMISION: "border-sky-500 bg-sky-50 text-sky-700",

    APROBADO_POR_SECRETARIA: "border-emerald-500 bg-emerald-50 text-emerald-700",

  }
  return stateStyles[state] || "border-gray-300 bg-gray-50 text-gray-600"
};