import { z } from "zod";

export const departamentoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  email:
    z.string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),

  direccion:
    z.string()
    .max(255, "La dirección no puede superar los 255 caracteres"),

  telefono:
    z.string().max(30, "El teléfono no puede superar los 30 caracteres"),

  sitioWeb: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().url("Ingrese una URL válida").optional()
  )
});


export type DepartamentoFormData = z.infer<typeof departamentoSchema>;