import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getGetDashboardResumenQueryKey, getGetProgramaQueryKey, getGetProgramaMateriaAnioQueryKey,
  getGetProgramaVigenteQueryKey, getListProgramasMateriaQueryKey,
  getListProgramasQueryKey, getListProgramasPendientesQueryKey,
  getListProgramasCoordinacionQueryKey, getListProgramasPendientesCoordinadorQueryKey,
  getListMateriasSinProgramaQueryKey, getMeQueryKey, getMisAreasQueryKey,
  getListCarrerasAsignadasQueryKey, getListUsersDepartamentoQueryKey,
  getGetMateriaQueryKey, getListMateriasDepartamentoQueryKey,
  getGetAreaQueryKey, getListAreasDepartamentoQueryKey,
  getGetCarreraQueryKey, getListCarrerasDepartamentoQueryKey,
  getGetUserByIdQueryKey, getGetDepartamentoQueryKey, getListDepartamentosQueryKey,
} from '@/app/api/generated/client';
import {
  invalidarAsignacionesDepartamento, invalidarConsultasPrograma, invalidarCambioMateria,
  invalidarCambioArea, invalidarCoordinacionArea, invalidarCambioCarrera, invalidarEdicionCarrera,
  invalidarCambioPlan, invalidarCambioDepartamento, invalidarEdicionDepartamento, invalidarCambioUsuario,
} from '@/lib/invalidacion-consultas';
import type { Rol } from '@/app/api/generated/model';

let client: QueryClient;
beforeEach(() => { client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } }); });
afterEach(() => { client.clear(); });
const roles: Rol[] = ['ADMINISTRACION', 'SECRETARIA', 'DOCENTE', 'COORDINADOR_AREA', 'COORDINACION_COMISION_CURRICULAR', 'DIRECCION_ADMINISTRATIVA', 'SYSTEM_ADMIN'];

// Caracterización del alcance de los antiguos onSuccess: listado por prefijo y detalle opcional.
const entidades = [
  {
    nombre: 'área', listado: getListAreasDepartamentoQueryKey(6), detalle: getGetAreaQueryKey(12),
    cambiar: (incluirDetalle: boolean, eliminado = false) => invalidarCambioArea(client,
      { departamentoId: 6, areaId: incluirDetalle ? 12 : undefined, eliminado }),
  },
  {
    nombre: 'carrera', listado: getListCarrerasDepartamentoQueryKey(6), detalle: getGetCarreraQueryKey(12),
    cambiar: (incluirDetalle: boolean, eliminado = false) => invalidarCambioCarrera(client,
      { departamentoId: 6, carreraId: incluirDetalle ? 12 : undefined, eliminado }),
  },
  {
    nombre: 'usuario', listado: getListUsersDepartamentoQueryKey(6), detalle: getGetUserByIdQueryKey(12),
    cambiar: (incluirDetalle: boolean, eliminado = false) => invalidarCambioUsuario(client,
      { departamentoId: 6, usuarioId: incluirDetalle ? 12 : undefined, eliminado }),
  },
  {
    nombre: 'departamento', listado: getListDepartamentosQueryKey(), detalle: getGetDepartamentoQueryKey(12),
    cambiar: (incluirDetalle: boolean, eliminado = false) => invalidarCambioDepartamento(client,
      { departamentoId: incluirDetalle ? 12 : undefined, eliminado }),
  },
];

describe.each(entidades)('caché de $nombre', ({ listado, detalle, cambiar }) => {
  it('la creación invalida las variantes del listado y conserva detalles y consultas ajenas', async () => {
    const pagina = [...listado, { page: 2, search: 'sintético' }];
    [listado, pagina, detalle, ['consulta-ajena']].forEach(key => client.setQueryData(key, []));
    await cambiar(false);
    expect(client.getQueryState(listado)?.isInvalidated).toBe(true);
    expect(client.getQueryState(pagina)?.isInvalidated).toBe(true);
    expect(client.getQueryState(detalle)?.isInvalidated).toBe(false);
    expect(client.getQueryState(['consulta-ajena'])?.isInvalidated).toBe(false);
  });

  it('la edición invalida listado y detalle sin retirar sus datos', async () => {
    [listado, detalle].forEach(key => client.setQueryData(key, { anterior: true }));
    await cambiar(true);
    expect(client.getQueryState(listado)?.isInvalidated).toBe(true);
    expect(client.getQueryState(detalle)?.isInvalidated).toBe(true);
    expect(client.getQueryData(detalle)).toEqual({ anterior: true });
  });

  it('la eliminación retira el detalle por prefijo y conserva otras entidades', async () => {
    const variante = [...detalle, { contexto: 'anterior' }];
    const otroDetalle = [String(detalle[0]).replace('/12', '/99')];
    [listado, detalle, variante, otroDetalle].forEach(key => client.setQueryData(key, []));
    await cambiar(true, true);
    expect(client.getQueryState(listado)?.isInvalidated).toBe(true);
    expect(client.getQueryState(detalle)).toBeUndefined();
    expect(client.getQueryState(variante)).toBeUndefined();
    expect(client.getQueryState(otroDetalle)?.isInvalidated).toBe(false);
  });
});

describe('operaciones que afectan varias entidades', () => {
  it('editar una materia actualiza su detalle, listado y circuito, sin invalidar detalles de otras materias', async () => {
    const incluidas = [getGetMateriaQueryKey(8), getListMateriasDepartamentoQueryKey(6),
      getGetProgramaQueryKey(12), getGetDashboardResumenQueryKey(6), getGetProgramaVigenteQueryKey(8)];
    const ajenas = [getGetMateriaQueryKey(99), getListMateriasDepartamentoQueryKey(9), getGetAreaQueryKey(8)];
    [...incluidas, ...ajenas].forEach(key => client.setQueryData(key, []));
    await invalidarCambioMateria(client, { departamentoId: 6, materiaId: 8 });
    incluidas.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    ajenas.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(false));
  });

  it('eliminar una materia retira su detalle y mantiene la invalidación del circuito', async () => {
    client.setQueryData(getGetMateriaQueryKey(8), { id: 8 });
    client.setQueryData(getGetProgramaVigenteQueryKey(8), []);
    await invalidarCambioMateria(client, { departamentoId: 6, materiaId: 8, eliminado: true });
    expect(client.getQueryState(getGetMateriaQueryKey(8))).toBeUndefined();
    expect(client.getQueryState(getGetProgramaVigenteQueryKey(8))?.isInvalidated).toBe(true);
  });

  it('crear una materia conserva los detalles ya almacenados', async () => {
    client.setQueryData(getGetMateriaQueryKey(8), { id: 8 });
    client.setQueryData(getListMateriasDepartamentoQueryKey(6), []);
    await invalidarCambioMateria(client, { departamentoId: 6 });
    expect(client.getQueryState(getGetMateriaQueryKey(8))?.isInvalidated).toBe(false);
    expect(client.getQueryState(getListMateriasDepartamentoQueryKey(6))?.isInvalidated).toBe(true);
  });

  it('editar una carrera refresca asignaciones sin invalidar dos veces su listado', async () => {
    const llamadas = vi.spyOn(client, 'invalidateQueries');
    const keys = [getGetCarreraQueryKey(12), getListCarrerasDepartamentoQueryKey(6),
      getMeQueryKey(), getGetProgramaQueryKey(8)];
    keys.forEach(key => client.setQueryData(key, []));
    await invalidarEdicionCarrera(client, 6, 12);
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    expect(llamadas.mock.calls.filter(([filtros]) =>
      filtros?.queryKey?.[0] === getListCarrerasDepartamentoQueryKey(6)[0])).toHaveLength(1);
  });

  it('cambiar un plan solo invalida el detalle de su carrera', async () => {
    const detalle = getGetCarreraQueryKey(12);
    const ajenas = [getListCarrerasDepartamentoQueryKey(6), getMeQueryKey(), getGetProgramaQueryKey(8)];
    [detalle, ...ajenas].forEach(key => client.setQueryData(key, []));
    await invalidarCambioPlan(client, 12);
    expect(client.getQueryState(detalle)?.isInvalidated).toBe(true);
    ajenas.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(false));
  });

  it('editar un departamento conserva la actualización de sus asignaciones', async () => {
    const keys = [getGetDepartamentoQueryKey(6), getListDepartamentosQueryKey(),
      getMeQueryKey(), getListUsersDepartamentoQueryKey(6), getGetProgramaQueryKey(8)];
    keys.forEach(key => client.setQueryData(key, []));
    await invalidarEdicionDepartamento(client, 6);
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });

  it('cambiar la coordinación de área invalida primero su detalle y luego las asignaciones', async () => {
    let terminarDetalle!: () => void;
    const esperaDetalle = new Promise<void>(resolve => { terminarDetalle = resolve; });
    const llamadas = vi.spyOn(client, 'invalidateQueries').mockReturnValue(esperaDetalle);
    const operacion = invalidarCoordinacionArea(client, 6, 12);
    expect(llamadas).toHaveBeenCalledTimes(1);
    expect(llamadas).toHaveBeenCalledWith({ queryKey: getGetAreaQueryKey(12) });
    terminarDetalle();
    await operacion;
    expect(llamadas).toHaveBeenCalledWith({ queryKey: getMeQueryKey() });
    expect(llamadas).toHaveBeenCalledWith({ queryKey: getListAreasDepartamentoQueryKey(6) });
  });
});

describe('coherencia de las consultas del circuito', () => {
  it('marca todas las variantes de rol, página y filtro del departamento', async () => {
    const keys = roles.flatMap(rolActivo => [
      getGetDashboardResumenQueryKey(6, { rolActivo }),
      getListProgramasPendientesQueryKey(6, { rolActivo, page: 0, size: 10 }),
      getListProgramasPendientesQueryKey(6, { rolActivo, page: 2, size: 5 }),
      getListProgramasQueryKey(6, { rolActivo, page: 1, size: 10, search: 'Álgebra' }),
    ]);
    keys.forEach(key => client.setQueryData(key, { anterior: true }));
    await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12 });
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });

  it('incluye CCC y su resumen en otros departamentos, conservando datos ajenos', async () => {
    const incluidas = [
      getListProgramasCoordinacionQueryKey(9, { rolActivo: 'COORDINACION_COMISION_CURRICULAR', page: 1 }),
      getListProgramasPendientesCoordinadorQueryKey(9, { rolActivo: 'COORDINACION_COMISION_CURRICULAR' }),
      getGetDashboardResumenQueryKey(9, { rolActivo: 'COORDINACION_COMISION_CURRICULAR' }),
    ];
    const ajenas = [getGetDashboardResumenQueryKey(9, { rolActivo: 'SECRETARIA' }), getMeQueryKey(), ['otra-consulta']];
    [...incluidas, ...ajenas].forEach(key => client.setQueryData(key, []));
    await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12 });
    incluidas.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    ajenas.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(false));
  });

  it('actualiza historial/detalle, versiones, vigente incluso con Infinity y materias sin programa', async () => {
    const keys = [getGetProgramaQueryKey(12), getListProgramasMateriaQueryKey(8),
      getGetProgramaVigenteQueryKey(8), getGetProgramaMateriaAnioQueryKey(8),
      [...getListMateriasSinProgramaQueryKey(6, { page: 1, size: 5 }), { rol: 'SECRETARIA' }]];
    keys.forEach(key => client.setQueryData(key, []));
    client.setQueryData(getGetProgramaQueryKey(99), { id: 99 });
    await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12 });
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    expect(client.getQueryState(getGetProgramaQueryKey(99))?.isInvalidated).toBe(false);
  });

  it('el borrado retira el detalle y conserva los borradores', async () => {
    const draftKey = ['/api/departamentos/6/programas/draft/8', { rolActivo: 'DOCENTE', programaId: 12, anio: 2026 }];
    client.setQueryData(draftKey, { payloadJson: 'trabajo conservado' });
    client.setQueryData(getGetProgramaQueryKey(12), { id: 12 });
    await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12, eliminado: true });
    expect(client.getQueryData(getGetProgramaQueryKey(12))).toBeUndefined();
    expect(client.getQueryData(draftKey)).toEqual({ payloadJson: 'trabajo conservado' });
    expect(client.getQueryState(draftKey)?.isInvalidated).toBe(false);
  });

  it('al volver al rol destino consulta sus pendientes pese a un staleTime infinito', async () => {
    const queryKey = getListProgramasPendientesQueryKey(6, { rolActivo: 'SECRETARIA' });
    client.setQueryData(queryKey, { content: [] });
    const queryFn = vi.fn(async () => ({ content: [{ id: 12 }] }));
    await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12 });
    expect(queryFn).not.toHaveBeenCalled();
    const observer = new QueryObserver(client, { queryKey, queryFn, staleTime: Infinity });
    const resultado = await new Promise<unknown>(resolve => {
      const unsubscribe = observer.subscribe(value => {
        if (value.isSuccess && !value.isFetching) { resolve(value.data); unsubscribe(); }
      });
    });
    expect(resultado).toEqual({ content: [{ id: 12 }] });
    expect(queryFn).toHaveBeenCalledTimes(1);
    observer.destroy();
  });

  it('refresca las consultas activas y no ejecuta consultas deshabilitadas', async () => {
    const queryKey = getGetDashboardResumenQueryKey(6, { rolActivo: 'SECRETARIA' });
    const queryFn = vi.fn(async () => ({ pendientes: 1 }));
    client.setQueryData(queryKey, { pendientes: 0 });
    const observer = new QueryObserver(client, { queryKey, queryFn });
    const unsubscribe = observer.subscribe(() => {});
    const disabledFn = vi.fn(async () => []);
    const disabled = new QueryObserver(client, { queryKey: getListProgramasQueryKey(6), queryFn: disabledFn, enabled: false });
    const unsubscribeDisabled = disabled.subscribe(() => {});
    await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12 });
    expect(client.getQueryData(queryKey)).toEqual({ pendientes: 1 });
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(disabledFn).not.toHaveBeenCalled();
    unsubscribe(); unsubscribeDisabled(); observer.destroy(); disabled.destroy();
  });

  it('un cambio de cargo actualiza sesión, asignaciones y programas', async () => {
    const keys = [getMeQueryKey(), [...getMisAreasQueryKey(6), { usuarioId: 42 }],
      [...getListCarrerasAsignadasQueryKey(6, { page: 0 }), { usuarioId: 42, rol: 'COORDINACION_COMISION_CURRICULAR' }],
      getListUsersDepartamentoQueryKey(6), getListProgramasPendientesCoordinadorQueryKey(9),
      getGetProgramaQueryKey(12)];
    keys.forEach(key => client.setQueryData(key, []));
    await invalidarAsignacionesDepartamento(client, 6);
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });
});
