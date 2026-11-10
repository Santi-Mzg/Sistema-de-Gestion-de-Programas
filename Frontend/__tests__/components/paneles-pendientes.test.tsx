import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdministracionDashboard } from '@/components/dashboards/administracion-dashboard';
import { SecretarioDashboard } from '@/components/dashboards/secretario-dashboard';
import { DirAdminDashboard } from '@/components/dashboards/dir-admin-dashboard';
import { rutaAccionPrograma } from '@/lib/circuito-programa';

const estado = vi.hoisted(() => ({
  rol: 'SECRETARIA', push: vi.fn(), setHeader: vi.fn(),
  user: { nombre: 'Persona sintética' }, departamento: { departamentoId: 6 }, materias: vi.fn(),
}));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: estado.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: estado.departamento }) }));
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: estado.user }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: estado.setHeader }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: estado.push }) }));
vi.mock('@/components/ui/cardsStatsAdmin', () => ({ DashboardStats: () => null }));
vi.mock('@/components/ui/cardsStatsSecretaria', () => ({ DashboardStats: () => null }));
vi.mock('@/components/ui/cardsStatsDirAdmin', () => ({ DashboardStats: () => null }));
vi.mock('@/app/api/generated/client', async importOriginal => ({
  ...await importOriginal<typeof import('@/app/api/generated/client')>(),
  useListMateriasSinPrograma: (...args: unknown[]) => estado.materias(...args),
  useGetDashboardResumen: () => ({ data: {}, isLoading: false }),
  useListProgramasPendientes: () => ({ isLoading: false, data: { totalPages: 1, totalElements: 3, content: [
    { id: 11, estado: 'PENDIENTE_DE_SECRETARIA_INICIAL', materia: { nombre: 'Carga inicial' } },
    { id: 12, estado: 'RECHAZADO_A_SECRETARIA', materia: { nombre: 'Corrección inicial' } },
    { id: 13, estado: 'PENDIENTE_DE_SECRETARIA_FINAL', materia: { nombre: 'Revisión final' } },
  ] } }),
}));

beforeEach(() => {
  estado.rol = 'SECRETARIA'; estado.push.mockClear();
  estado.materias.mockReturnValue({ data: { content: [], totalElements: 0, totalPages: 0 }, isLoading: false });
});
afterEach(cleanup);

describe('paneles departamentales', () => {
  it.each([
    ['ADMINISTRACION', AdministracionDashboard],
    ['SECRETARIA', SecretarioDashboard],
    ['DIRECCION_ADMINISTRATIVA', DirAdminDashboard],
  ] as const)('el panel %s muestra la lista de materias sin programa', (rol, Panel) => {
    estado.rol = rol;
    render(<Panel />);
    expect(screen.getByText('Materias sin programa del año actual')).toBeInTheDocument();
    expect(estado.materias).toHaveBeenCalledWith(6, { page: 0, size: 5, search: '' }, expect.objectContaining({
      query: expect.objectContaining({ enabled: true, queryKey: expect.arrayContaining([{ rol }]) }),
    }));
  });

  it.each([
    ['Carga inicial', '/programas/11/carga/secretaria', 'Completar'],
    ['Corrección inicial', '/programas/12/carga/secretaria', 'Completar'],
    ['Revisión final', '/programas/13/revision/secretaria', 'Revisar'],
  ])('el pendiente %s abre su etapa correspondiente', async (materia, ruta, accion) => {
    render(<SecretarioDashboard />);
    const fila = screen.getByText(materia).closest('tr')!;
    await userEvent.click(within(fila).getByRole('button', { name: new RegExp(`^${accion} programa`) }));
    expect(estado.push).toHaveBeenCalledWith(ruta);
  });

  it('la lista general utiliza las mismas rutas de Secretaría', () => {
    expect(rutaAccionPrograma('SECRETARIA', 'PENDIENTE_DE_SECRETARIA_INICIAL', 11)).toBe('/programas/11/carga/secretaria');
    expect(rutaAccionPrograma('SECRETARIA', 'RECHAZADO_A_SECRETARIA', 12)).toBe('/programas/12/carga/secretaria');
    expect(rutaAccionPrograma('SECRETARIA', 'PENDIENTE_DE_SECRETARIA_FINAL', 13)).toBe('/programas/13/revision/secretaria');
  });
});
