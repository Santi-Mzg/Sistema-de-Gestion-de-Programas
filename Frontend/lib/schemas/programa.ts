import { z } from "zod"

const numeroRequerido = (message: string) =>
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

  const textoRequerido = (mensaje: string) =>
    z.string({
      required_error: mensaje,
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

  contenidosMinimos: z
    .string()
    .trim()
    .min(1, "Los contenidos mínimos son obligatorios."),
})

export type ProgramaCarreraFormData = z.infer<typeof programaCarreraSchema>;


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

  cargaHorariaPractica: z.number().optional(),
  fundamentacion: z.string().optional(),
  objetivos: z.string().optional(),
  programaAnalitico: z.string().optional(),
  metodologia: z.string().optional(),
  modalidadEvaluacion: z.string().optional(),
  bibliografia: z.string().optional(),

});

export type ProgramaAdminFormData = z.infer<typeof programaAdminSchema>;


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
    "La metodología es obligatoria"
  ),

  modalidadEvaluacion: textoRequerido(
    "La modalidad de evaluación es obligatoria"
  ),

  bibliografia: textoRequerido(
    "La bibliografía es obligatoria"
  ),
});

export type ProgramaDocenteFormData = z.infer<typeof programaDocenteSchema>;
