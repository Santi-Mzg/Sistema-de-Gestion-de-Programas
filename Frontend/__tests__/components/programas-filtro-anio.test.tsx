import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Programas from '@/app/(dashboard)/programas/page';
import { customInstance } from '@/app/api/custom-instance';
import { getListProgramasQueryKey, getListProgramasCoordinacionQueryKey } from '@/app/api/generated/client';
import type { Rol } from '@/app/api/generated/model';
import { invalidarConsultasPrograma } from '@/lib/invalidacion-consultas';

const contexto = vi.hoisted(() => ({ rol: 'ADMINISTRACION' as Rol, departamentoId: 6 }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: {
  departamentoId: contexto.departamentoId, carrerasComoComision: ['Ingeniería'],
} }) }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('@/components/pages/programas-list', () => ({ ProgramasList: ({ anio, page, onPageChange }: {
  anio: number; page: number; onPageChange: (pagina: number) => void;
}) => <><p>Listado general {anio}, página {page}</p><button onClick={() => onPageChange(page + 1)}>Siguiente página</button></> }));
vi.mock('@/components/pages/programas-list-coordinador', () => ({ ProgramasListCoordinador: ({ anio, page, onPageChange }: {
  anio: number; page: number; onPageChange: (pagina: number) => void;
}) => <><p>Listado CCC {anio}, página {page}</p><button onClick={() => onPageChange(page + 1)}>Siguiente página</button></> }));

let client: QueryClient;
const request = vi.mocked(customInstance);
const anioActual = new Date().getFullYear();
let aniosDisponibles: number[];
const roles: Rol[] = ['ADMINISTRACION', 'COORDINACION_COMISION_CURRICULAR'];
function vista() { return <QueryClientProvider client={client}><Programas /></QueryClientProvider>; }
const ultimaPeticion = () => request.mock.calls.filter(([config]) => !config.url?.endsWith('/anios')).at(-1)?.[0];
async function aplicarAnio(anio: number) {
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Año' }), String(anio));
  await waitFor(() => expect(ultimaPeticion()?.params).toEqual(expect.objectContaining({ anio })));
}
beforeEach(() => {
  contexto.rol = 'ADMINISTRACION'; contexto.departamentoId = 6;
  aniosDisponibles = Array.from({ length: 4 }, (_, i) => anioActual - i);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  request.mockReset(); request.mockImplementation(async config => (config.url?.endsWith('/anios')
    ? aniosDisponibles : { content: [], totalPages: 3, totalElements: 25 }) as never);
});
afterEach(() => { cleanup(); client.clear(); vi.useRealTimers(); });

describe.each(roles)('filtro anual de programas para %s', rol => {
  beforeEach(() => { contexto.rol = rol; });

  it('consulta el año actual por defecto en el endpoint correspondiente', async () => {
    render(vista());
    await screen.findByRole('button', { name: 'Siguiente página' });
    expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue(String(anioActual));
    const recurso = rol === 'COORDINACION_COMISION_CURRICULAR' ? 'programas-coordinacion' : 'programas';
    expect(ultimaPeticion()).toEqual(expect.objectContaining({ url: `/api/departamentos/6/${recurso}`,
      params: expect.objectContaining({ anio: anioActual, page: 0, size: 10, rolActivo: rol }) }));
  });

  it('cambia de año, conserva los demás filtros y vuelve a la primera página', async () => {
    const user = userEvent.setup(); render(vista());
    await screen.findByRole('button', { name: 'Siguiente página' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Estado' }), 'APROBADO');
    await user.type(screen.getByRole('textbox', { name: 'Buscar programas' }), 'Redes');
    await waitFor(() => expect(ultimaPeticion()?.params.search).toBe('Redes'), { timeout: 2500 });
    if (rol === 'COORDINACION_COMISION_CURRICULAR') {
      await user.selectOptions(screen.getByRole('combobox', { name: 'Carrera' }), 'Ingeniería');
      await waitFor(() => expect(ultimaPeticion()?.params.carrera).toBe('Ingeniería'));
    }
    await user.click(screen.getByRole('button', { name: 'Siguiente página' }));
    await waitFor(() => expect(ultimaPeticion()?.params.page).toBe(1));
    await screen.findByRole('button', { name: 'Siguiente página' });
    await aplicarAnio(anioActual - 1);
    expect(ultimaPeticion()?.params).toEqual(expect.objectContaining({
      anio: anioActual - 1, page: 0, estado: 'APROBADO', search: 'Redes',
      ...(rol === 'COORDINACION_COMISION_CURRICULAR' ? { carrera: 'Ingeniería' } : {}),
    }));
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveValue('APROBADO');
    expect(screen.getByRole('textbox', { name: 'Buscar programas' })).toHaveValue('Redes');
  });

  it('mantiene cachés independientes por año y permite volver al actual', async () => {
    render(vista()); await screen.findByRole('button', { name: 'Siguiente página' });
    await aplicarAnio(anioActual - 1);
    await screen.findByRole('button', { name: 'Siguiente página' });
    const getClave = rol === 'COORDINACION_COMISION_CURRICULAR' ? getListProgramasCoordinacionQueryKey : getListProgramasQueryKey;
    const consultas = client.getQueryCache().findAll({ queryKey: [getClave(6)[0]] });
    expect(consultas.map(q => (q.queryKey[1] as { anio: number }).anio)).toEqual(expect.arrayContaining([anioActual, anioActual - 1]));
    const cantidad = request.mock.calls.length;
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Año' }), String(anioActual));
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue(String(anioActual)));
    expect(request).toHaveBeenCalledTimes(cantidad);
  });

  it('ofrece los años recibidos sin hardcodear ni duplicar el año actual', async () => {
    render(vista()); await screen.findByRole('button', { name: 'Siguiente página' });
    const opciones = within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole('option') as HTMLOptionElement[];
    expect(opciones.map(opcion => opcion.value)).toEqual(aniosDisponibles.map(String));
    expect(opciones.filter(opcion => opcion.value === String(anioActual))).toHaveLength(1);
    expect(opciones.some(opcion => opcion.value === 'todos')).toBe(false);
  });

  it('ofrece únicamente el año actual cuando no hay programas anteriores', async () => {
    aniosDisponibles = [anioActual];
    render(vista()); await screen.findByRole('button', { name: 'Siguiente página' });
    expect(within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue(String(anioActual));
  });

  it('actualiza el rango y vuelve al año actual si se elimina el último programa del año seleccionado', async () => {
    render(vista()); await screen.findByRole('button', { name: 'Siguiente página' });
    await aplicarAnio(anioActual - 3);
    aniosDisponibles = [anioActual];
    await act(async () => { await invalidarConsultasPrograma(client, { departamentoId: 6, programaId: 12 }); });
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue(String(anioActual)));
    expect(within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole('option')).toHaveLength(1);
  });
});

it('incorpora el nuevo año al volver a abrir la página, sin una lista fija de años', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2031-01-02T12:00:00Z'));
  aniosDisponibles = [2031, 2030, 2029];
  render(vista());
  await screen.findByRole('button', { name: 'Siguiente página' });
  expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue('2031');
  expect(ultimaPeticion()?.params.anio).toBe(2031);
  expect(within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole('option').map(opcion => opcion.textContent))
    .toEqual(['2031', '2030', '2029']);
});

it('distingue los años disponibles por rol y departamento', async () => {
  request.mockImplementation(async config => (config.url?.endsWith('/anios')
    ? config.url.includes('/7/') ? [anioActual] : config.params.rolActivo === 'DOCENTE' ? [anioActual, anioActual - 1] : aniosDisponibles
    : { content: [], totalPages: 1, totalElements: 0 }) as never);
  const pagina = render(vista());
  await screen.findByRole('button', { name: 'Siguiente página' });
  await aplicarAnio(anioActual - 3);
  contexto.rol = 'DOCENTE'; pagina.rerender(vista());
  await waitFor(() => expect(within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole('option')).toHaveLength(2));
  expect(screen.getByRole('combobox', { name: 'Año' })).toHaveValue(String(anioActual));
  contexto.departamentoId = 7; pagina.rerender(vista());
  await waitFor(() => expect(within(screen.getByRole('combobox', { name: 'Año' })).getAllByRole('option')).toHaveLength(1));
});

it('permite reintentar la consulta de años cuando falla', async () => {
  let falla = true;
  request.mockImplementation(async config => {
    if (config.url?.endsWith('/anios')) {
      if (falla) throw new Error('Error interno simulado');
      return aniosDisponibles as never;
    }
    return { content: [], totalPages: 1, totalElements: 0 } as never;
  });
  render(vista());
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los años disponibles.');
  expect(screen.getByRole('combobox', { name: 'Año' })).toBeDisabled();
  falla = false;
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar años' }));
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Año' })).toBeEnabled());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
