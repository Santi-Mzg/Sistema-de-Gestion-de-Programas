import { z } from "zod"

const requiredPositiveNumber = (message: string) =>
  z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(value)
      ) {
        return undefined
      }

      return Number(value)
    },
    z
      .number({
        required_error: message,
        invalid_type_error: message,
      })
      .int(message)
      .positive(message)
  )

export const programaCarreraSchema = z.object({
  key: z.string().optional(),

  carreraPlanId: requiredPositiveNumber(
    "Debe seleccionar un plan."
  ),

  ubicacionEnPlan: z
    .string()
    .trim()
    .min(1, "La ubicación en el plan es obligatoria."),

  correlativasFuertesIds: z
    .array(z.number())
    .default([]),

  correlativasDebilesIds: z
    .array(z.number())
    .default([]),

  contribucion: z
    .string()
    .trim()
    .optional(),

  contenidosMinimos: z
    .string()
    .trim()
    .min(1, "Los contenidos mínimos son obligatorios."),
})

export const programaAdminSchema = z.object({
  materiaId: z
    .number({
      required_error: "Debe seleccionar una materia.",
      invalid_type_error: "Debe seleccionar una materia.",
    })
    .min(1, "Debe seleccionar una materia."),

  profesorResponsableId: z
    .number({
      required_error: "Debe seleccionar un docente responsable.",
      invalid_type_error: "Debe seleccionar un docente responsable.",
    })
    .min(1, "Debe seleccionar un docente responsable."),

  bloqueMultiple: z
    .array(programaCarreraSchema)
    .min(1, "Debe agregar al menos una carrera."),

  cantidadSemanas: z
    .number({
      required_error: "La cantidad de semanas es obligatoria.",
      invalid_type_error: "La cantidad de semanas es obligatoria.",
    })
    .min(1, "Debe ser mayor que 0."),

  cargaHorariaSemanal: z
    .number({
      required_error: "La carga horaria semanal es obligatoria.",
      invalid_type_error: "La carga horaria semanal es obligatoria.",
    })
    .min(1, "Debe ser mayor que 0."),

  cargaHorariaTotal: z
    .number()
    .optional(),

  creditos: z
    .number({
      required_error: "Los créditos son obligatorios.",
      invalid_type_error: "Los créditos son obligatorios.",
    })
    .min(1, "Debe ser mayor que 0."),

});

export const programaDocenteSchema = z.object({
  cargaHorariaPractica: z
    .number()
    .optional(),

  fundamentacion: z
    .string()
    .trim()
    .optional(),

  objetivos: z
    .string()
    .trim()
    .optional(),

  programaAnalitico: z
    .string()
    .trim()
    .optional(),

  metodologia: z
    .string()
    .trim()
    .optional(),

  modalidadEvaluacion: z
    .string()
    .trim()
    .optional(),

  bibliografia: z
    .string()
    .trim()
    .optional(),
});

export type ProgramaCarreraFormData = z.infer<typeof programaCarreraSchema>;
export type ProgramaAdminFormData = z.infer<typeof programaAdminSchema>;
export type ProgramaDocenteFormData = z.infer<typeof programaDocenteSchema>;
