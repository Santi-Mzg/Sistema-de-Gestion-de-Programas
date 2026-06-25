import { z } from "zod";

export const areaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(1, "El nombre debe tener al menos 1 caracter")
    .max(100, "El nombre no puede superar los 100 caracteres"),
});

export type AreaFormData = z.infer<typeof areaSchema>;
