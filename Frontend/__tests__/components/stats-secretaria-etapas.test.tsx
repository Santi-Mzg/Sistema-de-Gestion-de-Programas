import type { ReactNode } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DashboardResumenDTO } from '@/app/api/generated/model';
import { DashboardStats as Administracion } from '@/components/ui/cardsStatsAdmin';
import { DashboardStats as Secretaria } from '@/components/ui/cardsStatsSecretaria';
import { DashboardStats as Direccion } from '@/components/ui/cardsStatsDirAdmin';
import { DashboardStats as CCC } from '@/components/ui/cardsStatsCoord';
import { DashboardStats as Area } from '@/components/ui/cardsStatsCoordArea';
import { DashboardStats as Docente } from '@/components/ui/cardsStatsDocente';

vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { carrerasComoComision: [] } }) }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ data }: { data: unknown }) => <output data-testid="datos-grafico">{JSON.stringify(data)}</output>,
  Cell: () => null,
}));
afterEach(cleanup);

describe('Secretaría inicial y final en estadísticas', () => {
  const stats: DashboardResumenDTO = {
    materias: 10, programasTotales: 10, programasVigentes: 2,
    pendienteAdministracion: 1, pendienteDocente: 1, pendienteCoordinacionArea: 1, pendienteComisiones: 0,
    pendienteSecretaria: 5, pendienteSecretariaInicial: 2, pendienteSecretariaFinal: 3,
  };

  for (const [nombre, Stats] of [
    ['Administración', Administracion], ['Secretaría', Secretaria], ['Dirección', Direccion], ['CCC', CCC], ['Área', Area],
  ] as const) {
    it(`${nombre}: el gráfico cuenta cada etapa una sola vez`, () => {
      render(<Stats stats={stats} />);
      const datos: { estado: string; cantidad: number; color: string }[] = JSON.parse(screen.getByTestId('datos-grafico').textContent!);
      expect(datos.filter(etapa => etapa.estado === 'Secretaría inicial')).toEqual([expect.objectContaining({ cantidad: 2 })]);
      expect(datos.filter(etapa => etapa.estado === 'Secretaría final')).toEqual([expect.objectContaining({ cantidad: 3 })]);
      expect(datos.some(etapa => etapa.estado === 'Secretaría')).toBe(false);
      expect(datos.reduce((total, etapa) => total + (etapa.cantidad ?? 0), 0)).toBe(8);
      expect(new Set(datos.map(etapa => etapa.color)).size).toBe(6);
    });
    it(`${nombre}: las etapas sin datos muestran cero en el gráfico y la leyenda`, () => {
      render(<Stats stats={{}} />);
      const datos: { estado: string; cantidad: number }[] = JSON.parse(screen.getByTestId('datos-grafico').textContent!);
      expect(datos).toHaveLength(6);
      expect(datos.every(etapa => etapa.cantidad === 0)).toBe(true);
      const fila = screen.getByText('Secretaría inicial').parentElement!.parentElement!;
      expect(within(fila).getByText('0')).toBeInTheDocument();
    });
  }

  it('Docente muestra las dos etapas sin duplicarlas y calcula sus proporciones', () => {
    render(<Docente stats={{ programasTotales: 5, programasVigentes: 0,
      pendienteSecretariaInicial: 2, pendienteSecretariaFinal: 3 }} />);
    expect(screen.getAllByText('Secretaría inicial')).toHaveLength(1);
    expect(screen.getAllByText('Secretaría final')).toHaveLength(1);
    expect(screen.getByTitle('Secretaría inicial: 2')).toHaveStyle({ width: '40%' });
    expect(screen.getByTitle('Secretaría final: 3')).toHaveStyle({ width: '60%' });
  });

  it('CCC distingue programas en etapa de comisiones de revisiones pendientes del usuario', () => {
    render(<CCC stats={{ ...stats, pendienteComisiones: 9 }} pendientesRevision={2} />);
    const tarjeta = screen.getByText('Requieren mi atención').closest('[data-slot="card"]')!;
    expect(within(tarjeta as HTMLElement).getByText('2')).toBeInTheDocument();
    expect(within(tarjeta as HTMLElement).queryByText('9')).not.toBeInTheDocument();
    const datos: { estado: string; cantidad: number }[] = JSON.parse(screen.getByTestId('datos-grafico').textContent!);
    expect(datos.find(etapa => etapa.estado === 'Comisiones')?.cantidad).toBe(9);
  });

  it.each([[2, 3, 5], [0, 3, 3], [2, 0, 2], [0, 0, 0]])(
    'Secretaría mantiene la atención conjunta de %i iniciales y %i finales: %i', (inicial, final, total) => {
      render(<Secretaria stats={{ ...stats, pendienteSecretariaInicial: inicial, pendienteSecretariaFinal: final, pendienteSecretaria: total }} />);
      const titulo = screen.getByText('Requieren mi atención');
      const tarjeta = titulo.closest('[data-slot="card"]');
      expect(tarjeta).not.toBeNull();
      expect(within(tarjeta as HTMLElement).getAllByText(String(total)).length).toBeGreaterThan(0);
      if (total === 0) expect(within(tarjeta as HTMLElement).getByText('No tenés acciones pendientes')).toBeInTheDocument();
    },
  );
});
