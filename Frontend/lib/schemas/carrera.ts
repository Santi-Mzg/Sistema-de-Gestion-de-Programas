import { z } from "zod";

const currentYear = new Date().getFullYear();

export const createCarreraSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  planAnio: z
    .string({
      required_error: "Debe seleccionar un año",
    })
    .min(1, "Debe seleccionar un año")
    .refine(
      (value) => {
        const year = Number(value);
        return year >= 2000 && year <= currentYear;
      },
      {
        message: "Año inválido",
      }
    ),

  planVersion: z.preprocess(
    (value) => (Number.isNaN(value) ? undefined : value),
    z
      .number({
        required_error: "La versión es obligatoria",
        invalid_type_error: "La versión debe ser un número",
      })
      .int("La versión debe ser un número entero")
      .min(1, "La versión debe ser mayor a 0")
  ),

  duracion: z
    .string()
    .trim()
    .min(1, "La duración es obligatoria")
});

export type CreateCarreraFormData = z.infer<typeof createCarreraSchema>;