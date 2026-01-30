import { ProgramaResponseDTOEstado } from "@/app/api/generated/model/programaResponseDTOEstado"
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model/usuarioDepartamentoDTORolesItem"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
    INCOMPLETO_POR_ADMINISTRACION: 'Pendiente Administración',
    RECHAZADO_A_ADMINISTRACION: 'Rechazado a Administración',
    COMPLETO_POR_ADMINISTRACION: 'Pendiente Docente',
    INCOMPLETO_POR_PROFESOR: 'Pendiente Docente',
    RECHAZADO_A_PROFESOR: 'Rechazado a Docente',
    COMPLETO_POR_PROFESOR: 'Pendiente Comisiones Curriculares',
    APROBADO_POR_COMISION: 'Pendiente Secretaría',
    APROBADO_POR_SECRETARIA: 'Aprobado',
  }
  return stateLabels[state] || state
}

export const getProgramStateStyles = (state: ProgramaResponseDTOEstado): string =>{
  const stateStyles: Record<ProgramaResponseDTOEstado, string> = {
    // ROJO: Requieren atención inmediata (Rechazos)
    RECHAZADO_A_ADMINISTRACION: "border-destructive bg-destructive/10 text-destructive",
    RECHAZADO_A_PROFESOR: "border-destructive bg-destructive/10 text-destructive",

    // VERDE: Finalizado
    APROBADO_POR_SECRETARIA: "border-emerald-500 bg-emerald-50 text-emerald-700",

    // AZUL: Procesos de oficina/Administración
    INCOMPLETO_POR_ADMINISTRACION: "border-blue-500 bg-blue-50 text-blue-700",
    APROBADO_POR_COMISION: "border-sky-500 bg-sky-50 text-sky-700",

    // AMBAR/NARANJA: En manos del docente o revisión curricular
    COMPLETO_POR_ADMINISTRACION: "border-amber-500 bg-amber-50 text-amber-700",
    INCOMPLETO_POR_PROFESOR: "border-amber-500 bg-amber-50 text-amber-700",
    COMPLETO_POR_PROFESOR: "border-indigo-500 bg-indigo-50 text-indigo-700",
  }
  return stateStyles[state] || "border-gray-300 bg-gray-50 text-gray-600"
};