import type { ProgramaResponseDTO } from '@/app/api/generated/model';
import type { ProgramaAdminFormData, ProgramaDocenteFormData } from '@/lib/schemas/programa';

/** Compara únicamente los campos que el actor puede guardar, contra el programa persistido. */
export function tieneCambiosCargaDocente(valores: ProgramaDocenteFormData, programa?: ProgramaResponseDTO): boolean {
  if (!programa) return false;

  return (valores.cargaHorariaPractica ?? 0) !== (programa.cargaHorariaPractica ?? 0)
    || (['fundamentacion', 'objetivos', 'programaAnalitico', 'metodologia', 'modalidadEvaluacion', 'bibliografia'] as const)
      .some(campo => (valores[campo] ?? '') !== (programa[campo] ?? ''));
}

export function tieneCambiosCargaSecretaria(valores: ProgramaAdminFormData, programa?: ProgramaResponseDTO): boolean {
  if (!programa) return false;

  if ((valores.materiaId ?? 0) !== (programa.materia?.id ?? 0)
    || (valores.docenteResponsableId ?? 0) !== (programa.docenteResponsable?.id ?? 0)
    || (valores.contenidosMinimos ?? '') !== (programa.contenidosMinimos ?? '')
    || (['cantidadSemanas', 'cargaHorariaSemanal', 'creditos'] as const)
      .some(campo => (valores[campo] ?? 0) !== (programa[campo] ?? 0))) return true;

  // Las claves de React y la contribución de CCC no son cambios de Secretaría.
  const bloquesActuales = (valores.bloqueMultiple ?? []).map(bloque => ({
    plan: bloque.carreraPlanId ?? 0,
    ubicacion: bloque.ubicacionEnPlan ?? '',
    fuertes: [...(bloque.correlativasFuertesIds ?? [])].sort((a, b) => a - b),
    debiles: [...(bloque.correlativasDebilesIds ?? [])].sort((a, b) => a - b),
  }));
  const bloquesGuardados = (programa.bloqueMultiple ?? []).map(bloque => ({
    plan: bloque.plan?.id ?? 0,
    ubicacion: bloque.ubicacionEnPlan ?? '',
    fuertes: (bloque.correlativasFuertes ?? []).flatMap(materia => materia.id === undefined ? [] : [materia.id]).sort((a, b) => a - b),
    debiles: (bloque.correlativasDebiles ?? []).flatMap(materia => materia.id === undefined ? [] : [materia.id]).sort((a, b) => a - b),
  }));
  return JSON.stringify(bloquesActuales) !== JSON.stringify(bloquesGuardados);
}
