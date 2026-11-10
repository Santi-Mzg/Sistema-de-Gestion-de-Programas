import type { Rol } from '@/app/api/generated/model';

export function rutaAccionPrograma(rol: Rol | null, estado?: string, id?: number): string | null {
  if (!id) return null;
  if (rol === 'SECRETARIA' && ['PENDIENTE_DE_SECRETARIA_INICIAL', 'RECHAZADO_A_SECRETARIA'].includes(estado ?? '')) return '/programas/' + id + '/carga/secretaria';
  if (rol === 'SECRETARIA' && estado === 'PENDIENTE_DE_SECRETARIA_FINAL') return '/programas/' + id + '/revision/secretaria';
  if (rol === 'DOCENTE' && ['PENDIENTE_DE_DOCENTE', 'RECHAZADO_A_DOCENTE'].includes(estado ?? '')) return '/programas/' + id + '/carga/docente';
  if (rol === 'ADMINISTRACION' && estado === 'RECHAZADO_A_ADMINISTRACION') return '/programas/' + id + '/carga/administracion';
  if (rol === 'COORDINADOR_AREA' && estado === 'PENDIENTE_DE_COORDINACION_AREA') return '/programas/' + id + '/revision/area';
  return null;
}
