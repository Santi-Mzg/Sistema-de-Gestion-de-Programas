import { UserCreateDTORolesItem } from "@/app/api/generated/model"
import { z } from "zod"

export const createUserSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es requerido").min(3, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(1, "El apellido es requerido").min(2, "El apellido debe tener al menos 2 caracteres"),
    legajo: z.string().min(1, "El legajo es requerido").regex(/^\d+$/, "El legajo solo debe contener números"),
    email: z.string().min(1, "El correo electrónico es requerido").email("Ingresa un correo electrónico válido"),
    roles: z.array(z.enum([
      UserCreateDTORolesItem.ADMINISTRACION, 
      UserCreateDTORolesItem.DOCENTE
    ])).min(1, "Selecciona al menos un rol"),
  })
export type CreateUserFormData = z.infer<typeof createUserSchema>