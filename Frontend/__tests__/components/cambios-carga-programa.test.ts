import { describe, expect, it } from 'vitest';
import type { ProgramaResponseDTO } from '@/app/api/generated/model';
import type { ProgramaAdminFormData, ProgramaDocenteFormData } from '@/lib/schemas/programa';
import { tieneCambiosCargaDocente, tieneCambiosCargaSecretaria } from '@/lib/cambios-carga-programa';

const programa: ProgramaResponseDTO = {
  materia: { id: 1 }, docenteResponsable: { id: 10 },
  cantidadSemanas: 16, cargaHorariaSemanal: 4, creditos: 6,
  contenidosMinimos: 'Contenidos', fundamentacion: 'Fundamentación',
  bloqueMultiple: [{ plan: { id: 8 }, ubicacionEnPlan: 'Primer año',
    correlativasFuertes: [{ id: 2 }, { id: 3 }], contribucion: 'Texto de CCC' }],
};
const secretaria: ProgramaAdminFormData = {
  materiaId: 1, docenteResponsableId: 10, cantidadSemanas: 16, cargaHorariaSemanal: 4, creditos: 6,
  contenidosMinimos: 'Contenidos',
  bloqueMultiple: [{ key: 'clave-del-borrador', carreraPlanId: 8, ubicacionEnPlan: 'Primer año',
    correlativasFuertesIds: [3, 2], correlativasDebilesIds: [], contribucion: 'Texto de CCC' }],
};
const docente: ProgramaDocenteFormData = {
  cargaHorariaPractica: 0, fundamentacion: 'Fundamentación', objetivos: '', programaAnalitico: '',
  metodologia: '', modalidadEvaluacion: '', bibliografia: '',
};

describe('cambios pendientes respecto del programa persistido', () => {
  it('Docente sin cambios no necesita elegir qué guardar', () => {
    expect(tieneCambiosCargaDocente(docente, programa)).toBe(false);
  });
  it('detecta texto docente recuperado de un borrador y deja de detectarlo al restaurar el original', () => {
    const recuperado = { ...docente, objetivos: 'Objetivos del borrador' };
    expect(tieneCambiosCargaDocente(recuperado, programa)).toBe(true);
    expect(tieneCambiosCargaDocente({ ...recuperado, objetivos: '' }, programa)).toBe(false);
  });
  it('Secretaría ignora claves de interfaz y el orden de selección de correlativas', () => {
    expect(tieneCambiosCargaSecretaria(secretaria, programa)).toBe(false);
  });
  it('ignora campos ajenos a Secretaría aunque estén incluidos en un borrador', () => {
    expect(tieneCambiosCargaSecretaria({ ...secretaria, fundamentacion: 'Texto de consulta',
      bloqueMultiple: secretaria.bloqueMultiple.map(b => ({ ...b, contribucion: 'Otro texto de CCC' })),
    }, programa)).toBe(false);
  });
  it.each([
    { contenidosMinimos: 'Contenidos del borrador' }, { materiaId: 2 }, { docenteResponsableId: 11 },
    { cantidadSemanas: 18 }, { cargaHorariaSemanal: 6 }, { creditos: 8 }, { bloqueMultiple: [] },
    { bloqueMultiple: [{ ...secretaria.bloqueMultiple[0], ubicacionEnPlan: 'Segundo año' }] },
    { bloqueMultiple: [{ ...secretaria.bloqueMultiple[0], correlativasDebilesIds: [4] }] },
  ])('detecta cambios editables de Secretaría: %j', cambio => {
    expect(tieneCambiosCargaSecretaria({ ...secretaria, ...cambio }, programa)).toBe(true);
  });
});
