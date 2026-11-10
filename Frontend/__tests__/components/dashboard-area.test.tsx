import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoordinadorAreaDashboard } from '@/components/dashboards/coordinador-area-dashboard';
import Areas from '@/app/(dashboard)/areas/page';
import { customInstance } from '@/app/api/custom-instance';
import type { AreaResponseDTO } from '@/app/api/generated/model';

const estado = vi.hoisted(() => ({
  rol: 'COORDINADOR_AREA', usuarioId: 1, deptId: 6, setHeader: vi.fn(), push: vi.fn(),
  resumen: { programasTotales: 12, programasVigentes: 2, pendienteCoordinacionArea: 7, pendienteComisiones: 9,
    pendienteSecretariaInicial: 2, pendienteSecretariaFinal: 1 },
  pendientes: [{ id: 12, anio: 2026 }], totalPendientes: 3, cargando: false, errorResumen: false,
  areas: [{ id: 21, nombre: 'Algoritmos' }, { id: 22, nombre: 'Sistemas' }] as AreaResponseDTO[],
  errorAreas: false, errorGeneral: false, listar: vi.fn(),
}));
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: { id: estado.usuarioId, nombre: 'Persona sintética' } }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: estado.deptId ? { departamentoId: estado.deptId, carrerasComoComision: ['Carrera ajena a este rol'] } : null }) }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: estado.rol }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: estado.setHeader }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: estado.push }) }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('recharts', () => ({ ResponsiveContainer: () => null, PieChart: () => null, Pie: () => null, Cell: () => null }));
vi.mock('@/app/api/generated/client', async importOriginal => ({
  ...await importOriginal<typeof import('@/app/api/generated/client')>(),
  useGetDashboardResumen: () => ({ data: estado.resumen, isLoading: estado.cargando, error: estado.errorResumen }),
  useListProgramasPendientes: () => ({ data: { content: estado.pendientes, totalElements: estado.totalPendientes, totalPages: 1 }, isLoading: false }),
  useListAreasDepartamento: (...args: unknown[]) => {
    estado.listar(...args);
    return { data: { content: [{ id: 99, nombre: 'Área ajena' }], totalElements: 1, totalPages: 1 }, isSuccess: true, error: estado.errorGeneral };
  },
}));
vi.mock('@/components/pages/programas-list-reduced', () => ({
  ProgramasListReduced: ({ programas, onRowClick }: { programas: { id: number }[]; onRowClick: (id: number) => void }) => <>
    {programas.length ? programas.map(p => <button key={p.id} onClick={() => onRowClick(p.id)}>Revisar programa {p.id}</button>) : <p>No hay programas pendientes.</p>}
  </>,
}));
vi.mock('@/components/pages/areas-list', () => ({
  AreasList: ({ areas }: { areas: AreaResponseDTO[] }) => <ul>{areas.map(a => <li key={a.id}>{a.nombre}</li>)}</ul>,
}));

const request = vi.mocked(customInstance);
let client: QueryClient;
beforeEach(() => {
  estado.rol = 'COORDINADOR_AREA'; estado.usuarioId = 1; estado.deptId = 6;
  estado.areas = [{ id: 21, nombre: 'Algoritmos' }, { id: 22, nombre: 'Sistemas' }];
  estado.pendientes = [{ id: 12, anio: 2026 }]; estado.totalPendientes = 3;
  estado.cargando = false; estado.errorResumen = false; estado.errorAreas = false; estado.errorGeneral = false;
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  request.mockImplementation(async () => {
    if (estado.errorAreas) throw new Error('Error simulado');
    return estado.areas as never;
  });
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });
function mostrar(children: ReactNode) {
  return render(<QueryClientProvider client={client}>{children}</QueryClientProvider>);
}

describe('dashboard de coordinación de Área', () => {
  it('muestra áreas asignadas y sus enlaces, las etapas y el total de su bandeja', async () => {
    mostrar(<CoordinadorAreaDashboard />);
    expect(await screen.findByRole('link', { name: 'Algoritmos' })).toHaveAttribute('href', '/areas/21');
    expect(screen.getByRole('link', { name: 'Sistemas' })).toHaveAttribute('href', '/areas/22');
    expect(screen.queryByText('Carrera ajena a este rol')).not.toBeInTheDocument();
    const atencion = screen.getByText('Requieren mi atención').closest('[data-slot="card"]')!;
    expect(within(atencion as HTMLElement).getByText('3')).toBeInTheDocument();
    const inicial = screen.getByText('Secretaría inicial').parentElement!.parentElement!;
    expect(within(inicial).getByText('2')).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/departamentos/6/mis-areas' }));
    await userEvent.click(screen.getByRole('button', { name: 'Revisar programa 12' }));
    expect(estado.push).toHaveBeenCalledWith('/programas/12/revision/area');
  });

  it('sin asignaciones ni pendientes muestra ambos estados vacíos', async () => {
    estado.areas = []; estado.pendientes = []; estado.totalPendientes = 0;
    mostrar(<CoordinadorAreaDashboard />);
    expect(await screen.findByText('No tenés áreas asignadas.')).toBeInTheDocument();
    expect(screen.getByText('No hay programas pendientes.')).toBeInTheDocument();
    expect(screen.getByText('No tienes acciones pendientes')).toBeInTheDocument();
  });

  it('muestra carga y errores de resumen o asignaciones sin mostrar datos incompletos', async () => {
    estado.cargando = true;
    const vista = mostrar(<CoordinadorAreaDashboard />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando');
    estado.cargando = false; estado.errorResumen = true;
    vista.rerender(<QueryClientProvider client={client}><CoordinadorAreaDashboard /></QueryClientProvider>);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar');
    expect(screen.queryByText('Áreas asignadas')).not.toBeInTheDocument();
  });

  it('no solicita asignaciones sin departamento activo', () => {
    estado.deptId = 0; mostrar(<CoordinadorAreaDashboard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('separa la caché de asignaciones entre usuarios', async () => {
    const vista = mostrar(<CoordinadorAreaDashboard />);
    await screen.findByRole('link', { name: 'Algoritmos' });
    estado.usuarioId = 2; estado.areas = [{ id: 30, nombre: 'Otra asignación' }];
    vista.rerender(<QueryClientProvider client={client}><CoordinadorAreaDashboard /></QueryClientProvider>);
    expect(await screen.findByRole('link', { name: 'Otra asignación' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Algoritmos' })).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);
  });
});

describe('Mis áreas', () => {
  it('usa solo las asignadas y busca sobre ellas, sin mostrar el listado general', async () => {
    estado.errorGeneral = true; mostrar(<Areas />);
    expect(await screen.findByText('Algoritmos')).toBeInTheDocument();
    expect(screen.queryByText('Área ajena')).not.toBeInTheDocument();
    expect(screen.queryByText('Error al obtener las áreas')).not.toBeInTheDocument();
    expect(estado.listar).toHaveBeenLastCalledWith(6, expect.anything(), expect.objectContaining({ query: expect.objectContaining({ enabled: false }) }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'sistemas' } });
    await waitFor(() => expect(screen.queryByText('Algoritmos')).not.toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
  });

  it('muestra un error cuando falla la consulta de asignadas', async () => {
    estado.errorAreas = true; mostrar(<Areas />);
    expect(await screen.findByText('Error al obtener las áreas')).toBeInTheDocument();
    expect(screen.queryByText('Área ajena')).not.toBeInTheDocument();
  });
});
