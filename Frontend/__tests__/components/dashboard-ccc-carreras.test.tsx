import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoordinadorDashboard } from '@/components/dashboards/coordinador-dashboard';
import { customInstance } from '@/app/api/custom-instance';

const estado = vi.hoisted(() => ({
  setHeader: vi.fn(), vacio: false, error: false,
}));
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: { id: 42, nombre: 'Persona sintética' } }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: 6, carrerasComoComision: ['Nombre sin identificador'] } }) }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: 'COORDINACION_COMISION_CURRICULAR' }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: estado.setHeader }) }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('recharts', () => ({ ResponsiveContainer: () => null, PieChart: () => null, Pie: () => null, Cell: () => null }));
vi.mock('@/components/pages/programas-list-reduced-coordinador', () => ({ ProgramasListReducedCoord: () => <p>Bandeja de programas</p> }));
vi.mock('@/app/api/generated/client', async importOriginal => ({
  ...await importOriginal<typeof import('@/app/api/generated/client')>(),
  useGetDashboardResumen: () => ({ data: { programasTotales: 3, programasVigentes: 1, pendienteComisiones: 2 }, isLoading: false }),
  useListProgramasPendientesCoordinador: () => ({ data: { content: [], totalElements: 0, totalPages: 0 }, isLoading: false }),
}));

const request = vi.mocked(customInstance);
let client: QueryClient;
beforeEach(() => {
  estado.vacio = false; estado.error = false;
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  request.mockImplementation(async () => {
    if (estado.error) throw new Error('Error simulado');
    return {
      content: estado.vacio ? [] : Array.from({ length: 5 }, (_, i) => ({ id: i + 21, nombre: `Carrera ${i + 1}` })),
      totalElements: estado.vacio ? 0 : 7, totalPages: estado.vacio ? 0 : 2,
    } as never;
  });
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });
function mostrar() {
  return render(<CoordinadorDashboard />, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}

describe('enlaces de carreras asignadas en el dashboard CCC', () => {
  it('usa los IDs del backend y permite acceder al resto de las asignaciones', async () => {
    mostrar();
    expect(await screen.findByRole('link', { name: 'Carrera 1' })).toHaveAttribute('href', '/carreras/21');
    expect(screen.getByRole('link', { name: 'Carrera 5' })).toHaveAttribute('href', '/carreras/25');
    expect(screen.getByText('Mostrando 5 de 7 carreras.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todas mis carreras' })).toHaveAttribute('href', '/carreras');
    expect(screen.queryByText('Nombre sin identificador')).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/carreras/asignadas', params: { page: 0, size: 5, search: undefined },
    }));
  });

  it('muestra la carga dentro de la tarjeta sin ocultar el resto del dashboard', async () => {
    mostrar();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando carreras asignadas');
    expect(screen.getByText('Bandeja de programas')).toBeInTheDocument();
    await screen.findByRole('link', { name: 'Carrera 1' });
  });

  it('sin asignaciones muestra el estado vacío y no ofrece asignaciones adicionales', async () => {
    estado.vacio = true; mostrar();
    expect(await screen.findByText('No tenés carreras asignadas.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver todas mis carreras' })).not.toBeInTheDocument();
  });

  it('si falla la consulta conserva estadísticas y bandeja y permite abrir Mis carreras', async () => {
    estado.error = true; mostrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las carreras asignadas');
    expect(screen.getByRole('link', { name: 'Ver mis carreras' })).toHaveAttribute('href', '/carreras');
    expect(screen.getByText('Bandeja de programas')).toBeInTheDocument();
    expect(screen.getByText('Requieren mi atención')).toBeInTheDocument();
  });
});
