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
