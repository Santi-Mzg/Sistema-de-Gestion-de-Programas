import type { CarreraResponseDTO, MateriaResponseDTO, ProgramaCarreraCreateDTO, ProgramaCarreraResponseDTO } from '@/app/api/generated/model';

/** Recupera la presentación de los bloques sin convertirlos en campos editables. */
export function bloquesParaConsulta(
  bloques: ProgramaCarreraCreateDTO[] = [],
  carreras: CarreraResponseDTO[] = [],
  materias: MateriaResponseDTO[] = [],
  referencia: ProgramaCarreraResponseDTO[] = [],
): ProgramaCarreraResponseDTO[] {
  return bloques.map(bloque => {
    const anterior = referencia.find(item => item.plan?.id === bloque.carreraPlanId);
    const carrera = carreras.find(item => item.planes?.some(plan => plan.id === bloque.carreraPlanId));
    const correlativas = (ids: number[] = [], anteriores: ProgramaCarreraResponseDTO['correlativasFuertes'] = []) =>
      ids.map(id => materias.find(materia => materia.id === id)
        ?? anteriores.find(materia => materia.id === id)
        ?? { id, nombre: `Materia #${id}` });
    return {
      carreraNombre: carrera?.nombre ?? anterior?.carreraNombre ?? `Carrera del plan #${bloque.carreraPlanId ?? ''}`,
      plan: carrera?.planes?.find(plan => plan.id === bloque.carreraPlanId) ?? anterior?.plan ?? { id: bloque.carreraPlanId },
      ubicacionEnPlan: bloque.ubicacionEnPlan ?? '',
      correlativasFuertes: correlativas(bloque.correlativasFuertesIds, anterior?.correlativasFuertes),
      correlativasDebiles: correlativas(bloque.correlativasDebilesIds, anterior?.correlativasDebiles),
      contribucion: bloque.contribucion ?? '',
    };
  });
}
