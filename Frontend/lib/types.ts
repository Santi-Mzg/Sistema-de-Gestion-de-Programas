export type UserRole = "admin" | "professor" | "coordinator" | "secretary"

export interface Syllabus {
  id: number
  name: string
  code: string
  professor: string
  semester: string
  credits?: number
  description?: string
  objectives?: string
  prerequisites?: string
  status: "draft" | "published" | "archived"
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ProgramaCarreraDTO {
  carreraId: number
  plan: string
  ubicacionEnPlan: string
  correlativasFuertesIds: number[]
  correlativasDebilesIds: number[]
  contribucion: string
  contenidosMinimos: string
}

export interface SyllabusCreateDTO {
  // Bloque único
  materiaId: number
  profesorResponsableId: number

  // Bloque múltiple
  carreras: ProgramaCarreraDTO[]
  cargaHorariaTotal: number
  cargaHorariaSemanal: number
  creditos: number
  cantidadSemanas: number
  cargaHorariaPractica: number
  fundamentacion: string
  objetivos: string
  programaAnalitico: string
  metodologia: string
  modalidadEvaluacion: string
  bibliografia: string
}

// Mock data types for dropdowns
export interface Materia {
  id: number
  nombre: string
  codigo: string
}

export interface Profesor {
  id: number
  nombre: string
  email: string
}

export interface Carrera {
  id: number
  nombre: string
}
