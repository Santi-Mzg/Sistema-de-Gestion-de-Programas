import type { DashboardResumenDTO } from '@/app/api/generated/model';

/** Orden del circuito y colores compartidos por gráficos y leyendas de todos los roles. */
export function etapasDashboard(stats: DashboardResumenDTO) {
  return [
    { estado: 'Administración', cantidad: stats.pendienteAdministracion ?? 0, color: '#90A1B9' },
    { estado: 'Secretaría inicial', cantidad: stats.pendienteSecretariaInicial ?? 0, color: '#FD9A00' },
    { estado: 'Docente', cantidad: stats.pendienteDocente ?? 0, color: '#2B7FFF' },
    { estado: 'Coord. Área', cantidad: stats.pendienteCoordinacionArea ?? 0, color: '#E12AFB' },
    { estado: 'Comisiones', cantidad: stats.pendienteComisiones ?? 0, color: '#8E51FF' },
    { estado: 'Secretaría final', cantidad: stats.pendienteSecretariaFinal ?? 0, color: '#06b6d4' },
  ];
}
