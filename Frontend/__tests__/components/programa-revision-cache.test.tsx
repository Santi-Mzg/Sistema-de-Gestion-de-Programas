import type { ReactNode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SyllabusSecretariaForm } from '@/components/forms/programa-secretaria-form';
import { customInstance } from '@/app/api/custom-instance';
import { getGetProgramaQueryKey, getGetDashboardResumenQueryKey, getListProgramasPendientesQueryKey,
  getListProgramasPendientesCoordinadorQueryKey, useListProgramasPendientes } from '@/app/api/generated/client';
import type { Rol } from '@/app/api/generated/model';

const contexto = vi.hoisted(() => ({ rol: 'COORDINADOR_AREA' as Rol, destino: 'SECRETARIA' as Rol, push: vi.fn(), setHeader: vi.fn(), fallar: false }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: 6 } }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: contexto.setHeader }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: contexto.push, back: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
// Se conserva el formulario y la mutación reales; el diálogo ya tiene su propia suite.
vi.mock('@/components/modals/rechazo-dialog', () => ({ RechazoDialog: ({ open, onConfirm, onOpenChange }: {
  open: boolean; onConfirm: (destino: Rol, justificacion: string) => void; onOpenChange: (open: boolean) => void;
}) => open ? <div role="dialog"><button type="button" onClick={() => onConfirm(contexto.destino, 'Corregir información')}>Confirmar rechazo</button>
  <button type="button" onClick={() => onOpenChange(false)}>Cancelar rechazo</button></div> : null }));

let client: QueryClient;
let enviado: boolean;
const request = vi.mocked(customInstance);
const programa = { id: 12, anio: 2026, materia: { id: 8, nombre: 'Álgebra', codigo: 'ALG', departamento: 'Ciencias', area: 'Matemática' },
  docenteResponsable: { nombre: 'Ana', apellido: 'Pérez', legajo: '100' }, bloqueMultiple: [] };
beforeEach(() => {
  contexto.rol = 'COORDINADOR_AREA'; contexto.destino = 'SECRETARIA'; contexto.fallar = false; enviado = false;
  client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 300_000 }, mutations: { retry: false } } });
  client.setQueryData(getGetProgramaQueryKey(12), programa);
  request.mockImplementation(async config => {
    if (config.method === 'PATCH') {
      if (contexto.fallar) throw new Error('Error simulado');
      enviado = true; return programa as never;
    }
    if (config.url?.endsWith('/pendientes')) return { content: enviado ? [programa] : [], totalElements: enviado ? 1 : 0 } as never;
    return programa as never;
  });
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });
function wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider>; }
function BandejaDestino() {
  const params = { rolActivo: contexto.rol, page: 0, size: 10 };
  const result = useListProgramasPendientes(6, params, { query: {
    queryKey: getListProgramasPendientesQueryKey(6, params), staleTime: 300_000,
  } });
  return <p>{result.data?.content?.length ? 'Programa recibido' : 'Sin pendientes'}</p>;
}

describe('invalidación desde la revisión real de Área y Secretaría final', () => {
  const rechazos = (['COORDINADOR_AREA', 'SECRETARIA'] as Rol[]).flatMap(rol =>
    (['ADMINISTRACION', 'SECRETARIA', 'DOCENTE'] as Rol[]).map(destino => ({ rol, destino })));
  it.each(rechazos)('rechazar como $rol hacia $destino actualiza la bandeja al cambiar de rol', async ({ rol, destino }) => {
    contexto.rol = rol;
    contexto.destino = destino;
    const keys = (['ADMINISTRACION', 'SECRETARIA', 'DOCENTE'] as Rol[]).map(rolActivo => getListProgramasPendientesQueryKey(6, { rolActivo, page: 0, size: 10 }));
    keys.forEach(key => client.setQueryData(key, { content: [] }));
    const user = userEvent.setup();
    render(<SyllabusSecretariaForm id={12} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /Rechazar$/ }));
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));
    await waitFor(() => expect(contexto.push).toHaveBeenCalledWith('/'));
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', params: { rolActivo: rol },
      data: expect.objectContaining({ accion: 'RECHAZAR', destinoRechazo: destino, justificacion: 'Corregir información' }) }));
    cleanup();
    contexto.rol = destino;
    render(<BandejaDestino />, { wrapper });
    expect(await screen.findByText('Programa recibido')).toBeInTheDocument();
  });

  it.each(['COORDINADOR_AREA', 'SECRETARIA'] as Rol[])('aprobar como %s invalida CCC y estadísticas de otros roles', async rol => {
    contexto.rol = rol;
    const keys = [getListProgramasPendientesCoordinadorQueryKey(9), getGetDashboardResumenQueryKey(6, { rolActivo: 'ADMINISTRACION' })];
    keys.forEach(key => client.setQueryData(key, {}));
    render(<SyllabusSecretariaForm id={12} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /Aprobar$/ }));
    await waitFor(() => expect(contexto.push).toHaveBeenCalledWith('/'));
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });

  it('cancelar un rechazo no modifica consultas ni envía una decisión', async () => {
    const key = getListProgramasPendientesQueryKey(6, { rolActivo: 'SECRETARIA' });
    client.setQueryData(key, { content: [] });
    render(<SyllabusSecretariaForm id={12} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /Rechazar$/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar rechazo' }));
    expect(request).not.toHaveBeenCalled();
    expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  });

  it('una decisión fallida no navega ni invalida los pendientes destino', async () => {
    contexto.fallar = true;
    const key = getListProgramasPendientesQueryKey(6, { rolActivo: 'SECRETARIA' });
    client.setQueryData(key, { content: [] });
    render(<SyllabusSecretariaForm id={12} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /Aprobar$/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Aprobar$/ })).toBeEnabled());
    expect(contexto.push).not.toHaveBeenCalled();
    expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  });
});
