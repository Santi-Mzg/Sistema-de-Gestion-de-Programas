import { z } from "zod";

export const createMateriaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(20, "El código no puede superar los 20 caracteres"),

  areaId: z
    .number({
      required_error: "Debe seleccionar un área",
      invalid_type_error: "Debe seleccionar un área",
    })
    .positive("Debe seleccionar un área"),
});

export type CreateMateriaFormData = z.infer<typeof createMateriaSchema>;