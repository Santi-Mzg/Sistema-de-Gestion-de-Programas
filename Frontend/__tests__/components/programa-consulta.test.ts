import { describe, expect, it } from 'vitest';
import { bloquesParaConsulta } from '@/lib/programa-bloques-consulta';
import { programaAdminSchema, programaSecretariaInicialSchema } from '@/lib/schemas/programa';

describe('datos heredados de consulta', () => {
  it('un bloque incompleto no bloquea a Administración, pero Secretaría debe completarlo', () => {
    const datos = { materiaId: 1, docenteResponsableId: 2, cantidadSemanas: 16, cargaHorariaSemanal: 4, creditos: 6,
      contenidosMinimos: 'Contenidos', bloqueMultiple: [{ carreraPlanId: 0, ubicacionEnPlan: '' }] };
    expect(programaAdminSchema.safeParse(datos).success).toBe(true);
    expect(programaSecretariaInicialSchema.safeParse(datos).success).toBe(false);
  });

  it('recupera nombres, plan y correlativas del catálogo para drafts anteriores', () => {
    const bloques = [{ carreraPlanId: 8, ubicacionEnPlan: 'Segundo año', correlativasFuertesIds: [3], contribucion: 'Texto conservado' }];
    const resultado = bloquesParaConsulta(bloques, [{ nombre: 'Ingeniería', planes: [{ id: 8, anio: '2026', version: 1 }] }],
      [{ id: 3, nombre: 'Análisis' }]);
    expect(resultado[0]).toMatchObject({ carreraNombre: 'Ingeniería', plan: { id: 8, anio: '2026' },
      ubicacionEnPlan: 'Segundo año', correlativasFuertes: [{ nombre: 'Análisis' }], contribucion: 'Texto conservado' });
    expect(bloques[0].correlativasFuertesIds).toEqual([3]);
  });

  it('conserva nombres del vigente aunque no estén en los catálogos del departamento', () => {
    const resultado = bloquesParaConsulta([{ carreraPlanId: 8, correlativasDebilesIds: [9] }], [], [],
      [{ carreraNombre: 'Carrera de otro departamento', plan: { id: 8, anio: '2020', version: 2 },
        correlativasDebiles: [{ id: 9, nombre: 'Materia de otro departamento' }] }]);
    expect(resultado[0]).toMatchObject({ carreraNombre: 'Carrera de otro departamento', plan: { anio: '2020' },
      correlativasDebiles: [{ id: 9, nombre: 'Materia de otro departamento' }] });
  });
});
