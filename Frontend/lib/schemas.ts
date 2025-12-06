import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(1, "El apellido es requerido").min(2, "El apellido debe tener al menos 2 caracteres"),
    dni: z
      .string()
      .min(1, "El DNI es requerido")
      .regex(/^\d{7,8}$/, "El DNI debe tener entre 7 y 8 dígitos"),
    legajo: z.string().min(1, "El legajo es requerido").regex(/^\d+$/, "El legajo solo debe contener números"),
    email: z.string().min(1, "El correo electrónico es requerido").email("Ingresa un correo electrónico válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/\d/, "Debe contener al menos un número")
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Debe contener al menos un carácter especial"),
    confirmPassword: z.string().min(1, "Confirmar contraseña es requerido"),
    roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const recoverPasswordSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Ingresa un correo electrónico válido"),
})

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>
