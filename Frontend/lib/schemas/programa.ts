import { z } from "zod"

const numeroRequerido = (message: string) =>
  // Los controles numéricos entregan números (incluido NaN) o un valor aún sin completar.
  z.preprocess<number | undefined, z.ZodNumber, number | undefined>(
    (value: unknown) => {
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
          error: message
      })
      .int(message)
      .positive(message)
  )

  const textoRequerido = (mensaje: string) =>
    z.string({
      error: mensaje,
    })
    .trim()
    .min(1, mensaje);


export const programaCarreraSchema = z.object({
  key: z.string().optional(),

  carreraPlanId: numeroRequerido(
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


})

export const programaAdminSchema = z.object({
  contenidosMinimos: z.string().optional(),
  materiaId: z
    .number({
      error: "Debe seleccionar una materia.",
    })
    .min(1, "Debe seleccionar una materia."),

  docenteResponsableId: z
    .number({
      error: "Debe seleccionar un docente responsable.",
    })
    .min(1, "Debe seleccionar un docente responsable."),

  bloqueMultiple: z
    .array(programaCarreraSchema.extend({
      // Administración consulta estos campos; su completitud se exige en Secretaría inicial.
      carreraPlanId: z.number().optional(),
      ubicacionEnPlan: z.string().optional(),
    }))
    .default([]),

  cantidadSemanas: z
    .number({
      error: "La cantidad de semanas es obligatoria.",
    })
    .min(1, "Debe ser mayor que 0."),

  cargaHorariaSemanal: z
    .number({
      error: "La carga horaria semanal es obligatoria.",
    })
    .min(1, "Debe ser mayor que 0."),

  cargaHorariaTotal: z
    .number()
    .optional(),

  creditos: z
    .number({
      error: "Los créditos son obligatorios.",
    })
    .min(1, "Debe ser mayor que 0."),

  cargaHorariaPractica: z.number().optional(),
  fundamentacion: z.string().optional(),
  objetivos: z.string().optional(),
  programaAnalitico: z.string().optional(),
  metodologia: z.string().optional(),
  modalidadEvaluacion: z.string().optional(),
  bibliografia: z.string().optional(),

});

export const programaSecretariaInicialSchema = programaAdminSchema.extend({
  contenidosMinimos: textoRequerido("Los contenidos mínimos son obligatorios"),
  bloqueMultiple: z.array(programaCarreraSchema).min(1, "Debe agregar al menos una carrera"),
});
export type ProgramaSecretariaInicialFormInput = z.input<typeof programaSecretariaInicialSchema>;
export type ProgramaSecretariaInicialFormData = z.output<typeof programaSecretariaInicialSchema>;

export type ProgramaAdminFormInput = z.input<typeof programaAdminSchema>;
export type ProgramaAdminFormData = z.output<typeof programaAdminSchema>;


export const programaDocenteSchema = z.object({
  cargaHorariaPractica: numeroRequerido(
    "La carga horaria práctica es obligatoria"
  ),

  fundamentacion: textoRequerido(
    "La fundamentación es obligatoria"
  ),

  objetivos: textoRequerido(
    "Los objetivos son obligatorios"
  ),

  programaAnalitico: textoRequerido(
    "El programa analítico es obligatorio"
  ),

  metodologia: textoRequerido(
    "La metodología de enseñanza y actividades de aprendizaje es obligatoria"
  ),

  modalidadEvaluacion: textoRequerido(
    "El sistema de evaluación es obligatorio"
  ),

  bibliografia: textoRequerido(
    "La bibliografía es obligatoria"
  ),
});

export type ProgramaDocenteFormInput = z.input<typeof programaDocenteSchema>;
export type ProgramaDocenteFormData = z.output<typeof programaDocenteSchema>;
