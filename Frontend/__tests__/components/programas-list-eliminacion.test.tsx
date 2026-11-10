import React from 'react';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgramasList } from '@/components/pages/programas-list';
import { customInstance } from '@/app/api/custom-instance';
import { getGetProgramaQueryKey, getListProgramasQueryKey, getListProgramasMateriaQueryKey, getGetProgramaVigenteQueryKey } from '@/app/api/generated/client';
import type { Rol } from '@/app/api/generated/model';

const contexto = vi.hoisted(() => ({ rol: 'SECRETARIA' as string | null, departamentoId: 6 }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: contexto.departamentoId } }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: vi.fn() }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/nav/page-nav', () => ({ PageNavigation: () => null }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

import { toast } from '@/hooks/use-toast';

let client: QueryClient;
const request = vi.mocked(customInstance);
const cambiarPagina = vi.fn();
const programa = { id: 12, anio: 2026, materia: { id: 8, nombre: 'Álgebra', codigo: 'ALG' }, estado: 'APROBADO' as const };

function lista(page = 0) {
  return <QueryClientProvider client={client}>
    <ProgramasList programas={[programa]} page={page} pageSize={10} totalPages={2} totalElements={11}
      esVistaVersiones={false} onPageChange={cambiarPagina} />
  </QueryClientProvider>;
}

beforeEach(() => {
  contexto.rol = 'SECRETARIA'; contexto.departamentoId = 6;
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  request.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); client.clear(); vi.resetAllMocks(); });

async function abrirConfirmacion() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Más acciones de Álgebra (2026)' }));
  await user.click(screen.getByRole('menuitem', { name: 'Eliminar programa de Álgebra (2026)' }));
  return { user, dialogo: await screen.findByRole('dialog', { name: 'Confirmar eliminación' }) };
}

describe('eliminación desde la lista de programas', () => {
  it.each(['SECRETARIA', 'SYSTEM_ADMIN'])('ofrece la acción para el rol activo %s, incluso en aprobados', async rol => {
    contexto.rol = rol; render(lista());
    expect(screen.queryByRole('button', { name: /Eliminar programa/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Álgebra (2026)' }));
    expect(screen.getByRole('menuitem', { name: 'Eliminar programa de Álgebra (2026)' })).not.toHaveAttribute('data-disabled');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['ADMINISTRACION', 'DOCENTE', 'DIRECCION_ADMINISTRATIVA', 'COORDINACION_COMISION_CURRICULAR', 'COORDINADOR_AREA', null])
    ('oculta la acción con el rol %s', async rol => {
      contexto.rol = rol as Rol | null; render(lista());
      expect(screen.queryByRole('button', { name: /Eliminar programa/ })).not.toBeInTheDocument();
      const masAcciones = screen.queryByRole('button', { name: 'Más acciones de Álgebra (2026)' });
      if (masAcciones) await userEvent.click(masAcciones);
      expect(screen.queryByRole('menuitem', { name: /Eliminar programa/ })).not.toBeInTheDocument();
      expect(request).not.toHaveBeenCalled();
    });

  it('identifica el programa y cancelar no ejecuta la eliminación', async () => {
    render(lista()); const { user, dialogo } = await abrirConfirmacion();
    expect(within(dialogo).getByText('Álgebra')).toBeInTheDocument();
    expect(within(dialogo).getByText('2026')).toBeInTheDocument();
    expect(within(dialogo).getByText(/Los borradores se conservarán/)).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('confirma una única petición y actualiza listas, versiones, vigente y detalle', async () => {
    const listaKey = getListProgramasQueryKey(6, { rolActivo: 'SECRETARIA', page: 0 });
    const versionesKey = getListProgramasMateriaQueryKey(8);
    const vigenteKey = getGetProgramaVigenteQueryKey(8);
    const detalleKey = getGetProgramaQueryKey(12);
    for (const key of [listaKey, versionesKey, vigenteKey, detalleKey]) client.setQueryData(key, {});
    render(lista(1)); const { user, dialogo } = await abrirConfirmacion();
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar programa' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/programas/12', method: 'DELETE' }));
    for (const key of [listaKey, versionesKey, vigenteKey]) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
    expect(client.getQueryData(detalleKey)).toBeUndefined();
    expect(cambiarPagina).toHaveBeenCalledWith(0);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
  });

  it('mantiene la confirmación y los datos si el backend rechaza la operación', async () => {
    request.mockRejectedValue({ isAxiosError: true, response: { status: 403, data: { errors: { Error: 'No tiene permisos' } } } });
    const key = getGetProgramaQueryKey(12); client.setQueryData(key, programa);
    render(lista()); const { user, dialogo } = await abrirConfirmacion();
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar programa' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: 'No tiene permisos', variant: 'destructive' })));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(client.getQueryData(key)).toEqual(programa);
    expect(cambiarPagina).not.toHaveBeenCalled();
  });

  it('bloquea confirmaciones repetidas mientras espera al backend', async () => {
    let resolver!: () => void;
    request.mockImplementation(() => new Promise<void>(resolve => { resolver = resolve; }));
    render(lista()); const { user, dialogo } = await abrirConfirmacion();
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar programa' }));
    expect(within(dialogo).getByRole('button', { name: 'Eliminando...' })).toBeDisabled();
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => resolver());
  });

  it.each(['rol', 'departamento'])('descarta la confirmación al cambiar de %s', async cambio => {
    const vista = render(lista()); await abrirConfirmacion();
    if (cambio === 'rol') contexto.rol = 'DOCENTE'; else contexto.departamentoId = 7;
    vista.rerender(lista());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });
});
