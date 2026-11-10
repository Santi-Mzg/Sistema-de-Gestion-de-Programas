import type { QueryClient, QueryKey } from '@tanstack/react-query';
import {
  getGetDashboardResumenQueryKey,
  getGetProgramaQueryKey,
  getListMateriasSinProgramaQueryKey,
  getListProgramasQueryKey,
  getListProgramasPendientesQueryKey,
  getMeQueryKey,
  getMisAreasQueryKey,
  getListCarrerasAsignadasQueryKey,
  getListCarrerasDepartamentoQueryKey,
  getListAreasDepartamentoQueryKey,
  getListUsersDepartamentoQueryKey,
  getCandidatosQueryKey,
  getGetMateriaQueryKey,
  getListMateriasDepartamentoQueryKey,
  getGetAreaQueryKey,
  getGetCarreraQueryKey,
  getGetDepartamentoQueryKey,
  getListDepartamentosQueryKey,
  getGetUserByIdQueryKey,
} from '@/app/api/generated/client';

interface CambioPrograma {
  departamentoId: number;
  programaId?: number;
  eliminado?: boolean;
}

/** Invalida datos del circuito, sin limitarse al rol que realizó la acción. */
export async function invalidarConsultasPrograma(
  client: QueryClient,
  { departamentoId, programaId, eliminado = false }: CambioPrograma,
) {
  if (eliminado && programaId !== undefined) {
    client.removeQueries({ queryKey: getGetProgramaQueryKey(programaId), exact: true });
  }

  const recursosDepartamento = new Set<string>([
    getListProgramasQueryKey(departamentoId)[0],
    getListProgramasPendientesQueryKey(departamentoId)[0],
    getGetDashboardResumenQueryKey(departamentoId)[0],
    getListMateriasSinProgramaQueryKey(departamentoId)[0],
  ]);

  await client.invalidateQueries({ predicate: ({ queryKey }) => {
    const [recurso, parametros] = queryKey;
    if (typeof recurso !== 'string') return false;
    if (recursosDepartamento.has(recurso)) return true;

    // Una CCC puede revisar programas cuyo departamento dueño es otro.
    if (/^\/api\/departamentos\/\d+\/programas-coordinacion(?:\/pendientes)?$/.test(recurso)) return true;
    if (/^\/api\/departamentos\/\d+\/dashboard\/resumen$/.test(recurso)
      && parametros && typeof parametros === 'object'
      && 'rolActivo' in parametros && parametros.rolActivo === 'COORDINACION_COMISION_CURRICULAR') return true;

    if (/^\/api\/programas\/\d+$/.test(recurso)) {
      return programaId === undefined || recurso === getGetProgramaQueryKey(programaId)[0];
    }
    // La carga puede cambiar la materia. Refrescar ambas versiones requiere
    // cubrir también las consultas guardadas de la materia anterior.
    return /^\/api\/materias\/\d+\/(?:programas|programa-vigente|programa-anio)$/.test(recurso);
  } });
}

/** Los cargos cambian tanto el alcance de programas como el contexto de sesión. */
export async function invalidarAsignacionesDepartamento(client: QueryClient, departamentoId: number) {
  const consultas = [
    getMeQueryKey(),
    getMisAreasQueryKey(departamentoId),
    getListCarrerasAsignadasQueryKey(departamentoId),
    getListCarrerasDepartamentoQueryKey(departamentoId),
    getListAreasDepartamentoQueryKey(departamentoId),
    getListUsersDepartamentoQueryKey(departamentoId),
    getCandidatosQueryKey(departamentoId),
  ];
  await Promise.all([
    invalidarConsultasPrograma(client, { departamentoId }),
    ...consultas.map(queryKey => client.invalidateQueries({ queryKey })),
  ]);
}

/** Conserva el alcance por prefijo de las claves generadas, incluidas sus variantes. */
async function invalidarListadoYDetalle(
  client: QueryClient,
  listado: QueryKey,
  detalle?: QueryKey,
  eliminado = false,
) {
  const pendientes = [client.invalidateQueries({ queryKey: listado })];
  if (detalle) {
    if (eliminado) client.removeQueries({ queryKey: detalle });
    else pendientes.push(client.invalidateQueries({ queryKey: detalle }));
  }
  await Promise.all(pendientes);
}

interface CambioArea {
  departamentoId?: number;
  areaId?: number;
  eliminado?: boolean;
}

export function invalidarCambioArea(client: QueryClient, { departamentoId, areaId, eliminado }: CambioArea) {
  return invalidarListadoYDetalle(client, getListAreasDepartamentoQueryKey(departamentoId),
    areaId === undefined ? undefined : getGetAreaQueryKey(areaId), eliminado);
}

export async function invalidarCoordinacionArea(client: QueryClient, departamentoId: number, areaId: number) {
  await client.invalidateQueries({ queryKey: getGetAreaQueryKey(areaId) });
  await invalidarAsignacionesDepartamento(client, departamentoId);
}

interface CambioCarrera {
  departamentoId?: number;
  carreraId?: number;
  eliminado?: boolean;
}

export function invalidarCambioCarrera(client: QueryClient, { departamentoId, carreraId, eliminado }: CambioCarrera) {
  return invalidarListadoYDetalle(client, getListCarrerasDepartamentoQueryKey(departamentoId),
    carreraId === undefined ? undefined : getGetCarreraQueryKey(carreraId), eliminado);
}

/** La edición de carrera y su comisión ya refrescaban también los cargos. */
export async function invalidarEdicionCarrera(client: QueryClient, departamentoId: number, carreraId: number) {
  void client.invalidateQueries({ queryKey: getGetCarreraQueryKey(carreraId) });
  // El listado de carreras ya está incluido: no volver a invalidarlo por separado.
  await invalidarAsignacionesDepartamento(client, departamentoId);
}

export function invalidarCambioPlan(client: QueryClient, carreraId: number) {
  return client.invalidateQueries({ queryKey: getGetCarreraQueryKey(carreraId) });
}

interface CambioDepartamento {
  departamentoId?: number;
  eliminado?: boolean;
}

export function invalidarCambioDepartamento(client: QueryClient, { departamentoId, eliminado }: CambioDepartamento = {}) {
  return invalidarListadoYDetalle(client, getListDepartamentosQueryKey(),
    departamentoId === undefined ? undefined : getGetDepartamentoQueryKey(departamentoId), eliminado);
}

export async function invalidarEdicionDepartamento(client: QueryClient, departamentoId: number) {
  void invalidarCambioDepartamento(client, { departamentoId });
  await invalidarAsignacionesDepartamento(client, departamentoId);
}

interface CambioUsuario {
  departamentoId?: number;
  usuarioId?: number;
  eliminado?: boolean;
}

export function invalidarCambioUsuario(client: QueryClient, { departamentoId, usuarioId, eliminado }: CambioUsuario) {
  return invalidarListadoYDetalle(client, getListUsersDepartamentoQueryKey(departamentoId),
    usuarioId === undefined ? undefined : getGetUserByIdQueryKey(usuarioId), eliminado);
}

interface CambioMateria {
  departamentoId: number;
  materiaId?: number;
  eliminado?: boolean;
}

export async function invalidarCambioMateria(
  client: QueryClient,
  { departamentoId, materiaId, eliminado = false }: CambioMateria,
) {
  // Se conserva el orden y la espera del flujo anterior: listado, circuito y detalle.
  void client.invalidateQueries({ queryKey: getListMateriasDepartamentoQueryKey(departamentoId) });
  await invalidarConsultasPrograma(client, { departamentoId });
  if (materiaId !== undefined) {
    if (eliminado) client.removeQueries({ queryKey: getGetMateriaQueryKey(materiaId) });
    else void client.invalidateQueries({ queryKey: getGetMateriaQueryKey(materiaId) });
  }
}
