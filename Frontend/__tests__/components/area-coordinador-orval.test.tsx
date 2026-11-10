import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AreaPage from '@/app/(dashboard)/areas/[id]/page';
import { customInstance } from '@/app/api/custom-instance';
import { getMisAreasQueryKey } from '@/app/api/generated/client';
import type { UserResponseReducedDTO } from '@/app/api/generated/model';

const contexto = vi.hoisted(() => ({
  rol: 'SECRETARIA', departamento: { departamentoId: 6, departamentoNombre: 'Departamento sintético' },
  coordinador: undefined as UserResponseReducedDTO | undefined, setHeader: vi.fn(),
}));
const candidata = { id: 55, nombre: 'Ana', apellido: 'Pérez', legajo: 'fixture-55' };
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: contexto.departamento }) }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: contexto.setHeader }) }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: '21' }), useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));

let client: QueryClient;
const request = vi.mocked(customInstance);
beforeEach(() => {
  contexto.rol = 'SECRETARIA'; contexto.coordinador = undefined;
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  request.mockImplementation(async config => {
    if (config.method === 'PATCH') contexto.coordinador = config.data.usuarioId ? candidata : undefined;
    if (config.url?.endsWith('/candidatos-coordinacion')) return [candidata] as never;
    return { id: 21, nombre: 'Algoritmos', departamentoId: 6, coordinador: contexto.coordinador } as never;
  });
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });
function mostrar() { return render(<QueryClientProvider client={client}><AreaPage /></QueryClientProvider>); }

describe('asignación de coordinación con hooks generados por Orval', () => {
  it.each(['SECRETARIA', 'DIRECCION_ADMINISTRATIVA', 'SYSTEM_ADMIN'])(
    '%s conserva candidatos, asignación e invalidación de Mis áreas', async rol => {
      contexto.rol = rol;
      const clave = [...getMisAreasQueryKey(6), { usuarioId: 99 }];
      client.setQueryData(clave, []);
      mostrar();
      const user = userEvent.setup();
      await user.click(await screen.findByRole('button', { name: 'Asignar coordinador' }));
      const dialogo = screen.getByRole('dialog');
      await user.click(await within(dialogo).findByRole('button', { name: /Ana Pérez/ }));
      await user.click(within(dialogo).getByRole('button', { name: 'Asignar coordinador' }));
      await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/api/departamentos/6/areas/21/coordinador', method: 'PATCH', data: { usuarioId: 55 }, params: { rolActivo: rol },
      })));
      await waitFor(() => expect(client.getQueryState(clave)?.isInvalidated).toBe(true));
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/api/departamentos/6/areas/candidatos-coordinacion', params: { rolActivo: rol },
      }));
    },
  );

  it('desasigna omitiendo el usuario opcional, sin enviar null', async () => {
    contexto.coordinador = candidata; mostrar();
    await userEvent.click(await screen.findByRole('button', { name: 'Desasignar coordinador' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/areas/21/coordinador', method: 'PATCH', data: {}, params: { rolActivo: 'SECRETARIA' },
    })));
  });

  it('un rol sin permiso no consulta candidatos ni ofrece asignación', async () => {
    contexto.rol = 'DOCENTE'; mostrar();
    await screen.findByDisplayValue('Algoritmos');
    expect(screen.queryByRole('button', { name: /Asignar coordinador/ })).not.toBeInTheDocument();
    expect(request.mock.calls.some(([config]) => config.url?.endsWith('/candidatos-coordinacion'))).toBe(false);
  });
});
