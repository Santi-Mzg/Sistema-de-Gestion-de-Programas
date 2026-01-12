import { UserCreateDTORolesItem } from "@/app/api/generated/model"
import { z } from "zod"

export const loginSchema = z.object({
  legajo: z.string().min(1, "El legajo es requerido").regex(/^\d+$/, "El legajo solo debe contener números"),
  password: z.string().min(1, "La contraseña es requerida").min(5, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const createUserSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(1, "El apellido es requerido").min(2, "El apellido debe tener al menos 2 caracteres"),
    legajo: z.string().min(1, "El legajo es requerido").regex(/^\d+$/, "El legajo solo debe contener números"),
    email: z.string().min(1, "El correo electrónico es requerido").email("Ingresa un correo electrónico válido"),
    roles: z.array(z.enum([
    UserCreateDTORolesItem.ADMINISTRACION, 
    UserCreateDTORolesItem.DOCENTE
  ])).min(1, "Selecciona al menos un rol"),
  })
export type CreateUserFormData = z.infer<typeof createUserSchema>

export const recoverPasswordSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Ingresa un correo electrónico válido"),
})

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>



const programaCarreraSchema = z.object({
  key: z.string(),
  carreraPlanId: z.coerce.number().min(1, "Debe seleccionar una carrera"),
  ubicacionEnPlan: z.string().min(1, "La ubicación es requerida"),
  correlativasFuertesIds: z.array(z.number()),
  correlativasDebilesIds: z.array(z.number()),
  contribucion: z.string().optional(),
  contenidosMinimos: z.string().optional(),
})

export const syllabusSchema = z.object({
  anio: z.coerce.number().min(2000).max(2100),
  materiaId: z.coerce.number().min(1, "Debe seleccionar una materia"),
  profesorResponsableId: z.coerce.number().min(1, "Debe seleccionar un profesor"),
  bloqueMultiple: z.array(programaCarreraSchema).min(1, "Debe agregar al menos una carrera"),
  
  cantidadSemanas: z.coerce.number().min(1, "Mínimo 1 semana"),
  cargaHorariaSemanal: z.coerce.number().min(1, "Mínimo 1 hora"),
  cargaHorariaTotal: z.coerce.number().min(1, "Carga total requerida"),
  cargaHorariaPractica: z.coerce.number().min(0, "No puede ser negativa").default(0),
  
  creditos: z.coerce.number().min(0),
  fundamentacion: z.string().optional(),
  objetivos: z.string().optional(),
  programaAnalitico: z.string().optional(),
  metodologia: z.string().optional(),
  modalidadEvaluacion: z.string().optional(),
  bibliografia: z.string().optional(),
})
.refine(
  (data) => data.cantidadSemanas * data.cargaHorariaSemanal === data.cargaHorariaTotal,
  {
    message: "El total debe ser igual a (Semanas × Carga Semanal)",
    path: ["cargaHorariaTotal"], // El error se mostrará en este campo
  }
)
.refine(
  (data) => data.cargaHorariaPractica <= data.cargaHorariaTotal,
  {
    message: "La carga práctica no puede ser mayor a la carga total",
    path: ["cargaPractica"],
  }
);

export type SyllabusFormValues = z.infer<typeof syllabusSchema>