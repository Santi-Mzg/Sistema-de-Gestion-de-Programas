import { z } from "zod"

export const loginSchema = z.object({
  legajo: z.string().min(1, "El legajo es requerido").regex(/^\d+$/, "El legajo solo debe contener números"),
  password: z.string().min(1, "La contraseña es requerida").min(5, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>
