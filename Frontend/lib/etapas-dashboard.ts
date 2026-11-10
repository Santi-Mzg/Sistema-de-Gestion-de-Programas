import type { DashboardResumenDTO } from '@/app/api/generated/model';

/** Orden del circuito y colores compartidos por gráficos y leyendas de todos los roles. */
export function etapasDashboard(stats: DashboardResumenDTO) {
  return [
    { estado: 'Administración', cantidad: stats.pendienteAdministracion ?? 0, color: '#f59e0b' },
    { estado: 'Secretaría inicial', cantidad: stats.pendienteSecretariaInicial ?? 0, color: '#10b981' },
    { estado: 'Docente', cantidad: stats.pendienteDocente ?? 0, color: '#3b82f6' },
    { estado: 'Coord. Área', cantidad: stats.pendienteCoordinacionArea ?? 0, color: '#ec4899' },
    { estado: 'Comisiones', cantidad: stats.pendienteComisiones ?? 0, color: '#8b5cf6' },
    { estado: 'Secretaría final', cantidad: stats.pendienteSecretariaFinal ?? 0, color: '#06b6d4' },
  ];
}
