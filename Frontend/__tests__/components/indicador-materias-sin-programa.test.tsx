import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardStats as StatsAdministracion } from '@/components/ui/cardsStatsAdmin';
import { DashboardStats as StatsSecretaria } from '@/components/ui/cardsStatsSecretaria';
import { DashboardStats as StatsDireccion } from '@/components/ui/cardsStatsDirAdmin';

vi.mock('recharts', () => ({ ResponsiveContainer: () => null, PieChart: () => null, Pie: () => null, Cell: () => null }));
afterEach(cleanup);

describe('indicador departamental de materias sin programa', () => {
  for (const [nombre, Stats] of [
    ['Administración', StatsAdministracion], ['Secretaría', StatsSecretaria], ['Dirección administrativa', StatsDireccion],
  ] as const) {
    it.each([[12, 9, 3], [12, 12, 0], [0, 0, 0]])(`${nombre}: %i materias y %i programas actuales muestran %i pendientes`, (materias, programasTotales, esperado) => {
      render(<Stats stats={{ materias, programasTotales }} />);
      const indicador = screen.getByRole('group', { name: 'Materias sin programa del año actual' });
      expect(within(indicador).getByText(String(esperado))).toBeInTheDocument();
    });
  }
});
