import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CarreraResponseDTO } from '@/app/api/generated/model';
import Carreras from '@/app/(dashboard)/carreras/page';
import { customInstance } from '@/app/api/custom-instance';

const estado = vi.hoisted(() => ({ rol: 'COORDINACION_COMISION_CURRICULAR', listarDepartamento: vi.fn(), sinAsignaciones: false }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: estado.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: 6 } }) }));
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: { id: 42 } }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('@/app/api/generated/client', async importOriginal => ({
  ...await importOriginal<typeof import('@/app/api/generated/client')>(),
  useListCarrerasDepartamento: (...args: unknown[]) => {
    estado.listarDepartamento(...args);
    return { data: { content: [{ id: 99, nombre: 'Carrera ajena' }], totalPages: 1, totalElements: 1 }, isSuccess: true };
  },
}));
vi.mock('@/components/pages/carreras-list', () => ({
  CarrerasList: ({ carreras, totalElements, onPageChange }: { carreras: CarreraResponseDTO[]; totalElements: number; onPageChange: (page: number) => void }) => <>
    <output aria-label="Total">{totalElements}</output>
    <ul>{carreras.map(c => <li key={c.id}>{c.nombre}</li>)}</ul>
    <button onClick={() => onPageChange(1)}>Segunda página</button>
  </>,
}));

const request = vi.mocked(customInstance);
let client: QueryClient;
beforeEach(() => {
  estado.rol = 'COORDINACION_COMISION_CURRICULAR'; estado.sinAsignaciones = false;
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  request.mockImplementation(async config => ({
    content: estado.sinAsignaciones ? [] : [{ id: config.params.page ? 2 : 1, nombre: config.params.page ? 'Otra carrera asignada' : 'Carrera asignada' }],
    totalPages: estado.sinAsignaciones ? 0 : 2, totalElements: estado.sinAsignaciones ? 0 : 11,
  }) as never);
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });
function mostrar() {
  return render(<Carreras />, { wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}

describe('Mis carreras de CCC', () => {
  it('consulta las asignadas al usuario autenticado y no muestra el listado general', async () => {
    mostrar();
    expect(await screen.findByText('Carrera asignada')).toBeInTheDocument();
    expect(screen.queryByText('Carrera ajena')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Total')).toHaveTextContent('11');
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/departamentos/6/carreras/asignadas', params: { page: 0, size: 10, search: undefined } }));
    expect(estado.listarDepartamento).toHaveBeenLastCalledWith(6, expect.anything(), expect.objectContaining({ query: expect.objectContaining({ enabled: false }) }));
    expect(screen.queryByRole('button', { name: 'Crear carrera' })).not.toBeInTheDocument();
  });

  it('aplica búsqueda y paginación a la consulta de asignadas', async () => {
    mostrar();
    await screen.findByText('Carrera asignada');
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: '  sistemas  ' } });
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ params: { page: 0, size: 10, search: 'sistemas' } })), { timeout: 2000 });
    await userEvent.click(screen.getByRole('button', { name: 'Segunda página' }));
    expect(await screen.findByText('Otra carrera asignada')).toBeInTheDocument();
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ params: { page: 1, size: 10, search: 'sistemas' } }));
  });

  it('sin asignaciones muestra una lista vacía, sin recurrir al listado general', async () => {
    estado.sinAsignaciones = true; mostrar();
    await waitFor(() => expect(screen.getByLabelText('Total')).toHaveTextContent('0'));
    expect(screen.queryByText('Carrera ajena')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('Administración conserva el listado departamental', () => {
    estado.rol = 'ADMINISTRACION'; mostrar();
    expect(screen.getByText('Carrera ajena')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear carrera' })).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
    expect(estado.listarDepartamento).toHaveBeenLastCalledWith(6, expect.anything(), expect.objectContaining({ query: expect.objectContaining({ enabled: true }) }));
  });
});
