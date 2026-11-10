import type { ReactNode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoordinadorDashboard } from '@/components/dashboards/coordinador-dashboard';
import { customInstance } from '@/app/api/custom-instance';

const setHeader = vi.hoisted(() => vi.fn());
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: { id: 42, nombre: 'Persona sintética' } }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: 6, carrerasComoComision: [] } }) }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: 'COORDINACION_COMISION_CURRICULAR' }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader }) }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('recharts', () => ({ ResponsiveContainer: () => null, PieChart: () => null, Pie: () => null, Cell: () => null }));
vi.mock('@/components/pages/programas-list-reduced-coordinador', () => ({ ProgramasListReducedCoord: ({ page, onPageChange }: {
  page: number; onPageChange: (page: number) => void;
}) => <><p>Página {page}</p><button onClick={() => onPageChange(page + 1)}>Siguiente pendiente</button></> }));

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });
describe('paginación de pendientes CCC', () => {
  it('envía página y tamaño y mantiene cachés diferentes para cada página', async () => {
    const request = vi.mocked(customInstance);
    request.mockImplementation(async config => (config.url?.endsWith('/dashboard/resumen') ? {}
      : { content: [], totalElements: 6, totalPages: 3 }) as never);
    render(<CoordinadorDashboard />, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
    await screen.findByText('Página 0');
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/departamentos/6/programas-coordinacion/pendientes',
      params: { rolActivo: 'COORDINACION_COMISION_CURRICULAR', page: 0, size: 2 } }));
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente pendiente' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/programas-coordinacion/pendientes',
      params: { rolActivo: 'COORDINACION_COMISION_CURRICULAR', page: 1, size: 2 },
    })));
    expect(client.getQueryCache().findAll({ predicate: query => query.queryKey[0] === '/api/departamentos/6/programas-coordinacion/pendientes' })).toHaveLength(2);
  });
});
