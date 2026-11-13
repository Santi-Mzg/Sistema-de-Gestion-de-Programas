import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgramasList } from '@/components/pages/programas-list';
import { customInstance } from '@/app/api/custom-instance';
import { toast } from '@/hooks/use-toast';

const contexto = vi.hoisted(() => ({ rol: 'SECRETARIA', departamentoId: 6 }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: contexto.departamentoId } }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: vi.fn() }) }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

const programa = { id: 12, anio: 2026, materia: { nombre: 'Álgebra' }, estado: 'APROBADO' as const };
const detalle = { ...programa, bloqueMultiple: [
  { carreraNombre: 'Ingeniería', plan: { id: 8, anio: '2024', version: 1 } },
  { carreraNombre: 'Ingeniería', plan: { id: 9, anio: '2024', version: 2 } },
] };
const request = vi.mocked(customInstance);
let client: QueryClient;
let ventana: { location: { href: string }; close: ReturnType<typeof vi.fn> };

function lista(estado = 'APROBADO') {
  return <QueryClientProvider client={client}>
    <ProgramasList programas={[{ ...programa, estado: estado as typeof programa.estado }]}
      page={0} pageSize={10} totalPages={1} totalElements={1} esVistaVersiones={false} onPageChange={vi.fn()} />
  </QueryClientProvider>;
}
const peticionesPdf = () => request.mock.calls.filter(([config]) => config.url?.endsWith('/pdf'));

beforeEach(() => {
  contexto.rol = 'SECRETARIA'; contexto.departamentoId = 6;
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  request.mockImplementation(async config => config.url?.endsWith('/pdf') ? new Blob(['pdf']) : detalle);
  ventana = { location: { href: '' }, close: vi.fn() };
  vi.spyOn(window, 'open').mockReturnValue(ventana as unknown as Window);
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = vi.fn(() => 'blob:pdf-prueba');
    static revokeObjectURL = vi.fn();
  });
});
afterEach(() => { cleanup(); client.clear(); vi.restoreAllMocks(); vi.resetAllMocks(); vi.unstubAllGlobals(); });

async function abrir() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Generar PDF de Álgebra (2026)' }));
  await screen.findByRole('checkbox', { name: 'Todos los planes' });
  return user;
}

describe('PDF desde la lista de programas', () => {
  it('solo consulta el detalle al abrir y cancelar no genera ni abre ventanas', async () => {
    render(lista()); expect(request).not.toHaveBeenCalled();
    const user = await abrir();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/programas/12', method: 'GET' }));
    expect(peticionesPdf()).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(peticionesPdf()).toHaveLength(0);
    expect(window.open).not.toHaveBeenCalled();
  });

  it.each(['SECRETARIA', 'SYSTEM_ADMIN'])('genera el documento completo al confirmar Todos como %s', async rol => {
    contexto.rol = rol; render(lista()); const user = await abrir();
    await user.click(screen.getByRole('button', { name: 'Generar PDF' }));
    await waitFor(() => expect(peticionesPdf()).toHaveLength(1));
    expect(peticionesPdf()[0][0]).toEqual({ url: '/api/programas/12/pdf', responseType: 'blob' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(ventana.location.href).toBe('blob:pdf-prueba');
  });

  it('envía únicamente los planes elegidos, aunque tengan la misma carrera', async () => {
    render(lista()); const user = await abrir();
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-2' }));
    await user.click(screen.getByRole('button', { name: 'Generar PDF' }));
    await waitFor(() => expect(peticionesPdf()).toHaveLength(1));
    expect(peticionesPdf()[0][0]).toEqual({ url: '/api/programas/12/pdf', responseType: 'blob', params: { planIds: '8,9' } });
  });

  it('vuelve a Todos al cerrar y reabrir', async () => {
    render(lista()); const user = await abrir();
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await abrir();
    expect(screen.getByRole('checkbox', { name: 'Todos los planes' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' })).not.toBeChecked();
  });

  it('conserva la selección y cierra la ventana vacía si falla la generación', async () => {
    request.mockImplementation(async config => {
      if (config.url?.endsWith('/pdf')) throw new Error('Error simulado');
      return detalle;
    });
    render(lista()); const user = await abrir();
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-2' }));
    await user.click(screen.getByRole('button', { name: 'Generar PDF' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'No se pudo generar el PDF' })));
    expect(ventana.close).toHaveBeenCalledOnce();
    expect(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-2' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Generar PDF' })).toBeEnabled();
  });

  it('no repite la petición mientras está generando', async () => {
    let resolver!: (blob: Blob) => void;
    request.mockImplementation(config => config.url?.endsWith('/pdf')
      ? new Promise<Blob>(resolve => { resolver = resolve; }) : Promise.resolve(detalle));
    render(lista()); const user = await abrir();
    await user.click(screen.getByRole('button', { name: 'Generar PDF' }));
    expect(screen.getByRole('button', { name: 'Generando...' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Generando...' }));
    expect(peticionesPdf()).toHaveLength(1);
    await act(async () => resolver(new Blob(['pdf'])));
  });

  it.each(['rol', 'departamento'])('cierra el selector al cambiar de %s', async cambio => {
    const vista = render(lista()); await abrir();
    if (cambio === 'rol') contexto.rol = 'SYSTEM_ADMIN'; else contexto.departamentoId = 7;
    vista.rerender(lista());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(peticionesPdf()).toHaveLength(0);
  });

  it.each(['ADMINISTRACION', 'DOCENTE', 'COORDINADOR_AREA', 'COORDINACION_COMISION_CURRICULAR', 'DIRECCION_ADMINISTRATIVA'])
    ('no ofrece PDF para el rol %s', rol => {
      contexto.rol = rol; render(lista());
      expect(screen.queryByRole('button', { name: /Generar PDF/ })).not.toBeInTheDocument();
      expect(request).not.toHaveBeenCalled();
    });

  it('no ofrece PDF para programas pendientes', () => {
    render(lista('PENDIENTE_DE_SECRETARIA_FINAL'));
    expect(screen.queryByRole('button', { name: /Generar PDF/ })).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });
});
