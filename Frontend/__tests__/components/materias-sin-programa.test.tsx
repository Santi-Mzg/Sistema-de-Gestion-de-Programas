import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MateriasSinProgramaCard } from '@/components/pages/materias-sin-programa-card';
import { customInstance } from '@/app/api/custom-instance';
import type { Rol } from '@/app/api/generated/model';

vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
const request = vi.mocked(customInstance);
let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  request.mockResolvedValue({ content: [{ id: 5, nombre: 'Algoritmos', codigo: 'ALG', area: 'Computación' }], totalPages: 2, totalElements: 6 });
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });

function tarjeta(deptId = 6, rol: Rol = 'ADMINISTRACION') {
  return <QueryClientProvider client={client}><MateriasSinProgramaCard key={`${deptId}-${rol}`} deptId={deptId} rol={rol} /></QueryClientProvider>;
}

describe('materias sin programa del año actual', () => {
  it('Administración puede crear el programa con la materia de la fila preseleccionada', async () => {
    render(tarjeta());
    const enlace = await screen.findByRole('link', { name: 'Crear programa de Algoritmos' });
    expect(enlace).toHaveAttribute('href', '/programas/crear?materiaId=5');
  });

  it.each(['SECRETARIA', 'DIRECCION_ADMINISTRATIVA', 'SYSTEM_ADMIN'] as const)('el rol %s solo consulta la materia', async rol => {
    render(tarjeta(6, rol));
    await screen.findByText('Algoritmos');
    expect(screen.queryByRole('link', { name: /Crear programa/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver materia Algoritmos' })).toBeInTheDocument();
  });

  it('consulta la lista paginada del departamento y muestra el enlace a la materia', async () => {
    render(tarjeta());
    expect(await screen.findByText('Algoritmos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver materia Algoritmos' })).toHaveAttribute('href', '/materias/5');
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/materias/sin-programa', params: { page: 0, size: 5, search: '' },
    }));
  });

  it('la búsqueda reinicia la página y conserva el filtro del departamento', async () => {
    render(tarjeta()); await screen.findByText('Algoritmos');
    await userEvent.click(screen.getByTitle('Página siguiente'));
    await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ params: { page: 1, size: 5, search: '' } })));
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar materias sin programa' }), 'alg');
    await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/materias/sin-programa', params: { page: 0, size: 5, search: 'alg' },
    })));
  });

  it('un cambio de departamento no reutiliza los resultados anteriores', async () => {
    const vista = render(tarjeta()); await screen.findByText('Algoritmos');
    request.mockResolvedValue({ content: [{ id: 7, nombre: 'Física', codigo: 'FIS' }], totalPages: 1, totalElements: 1 });
    vista.rerender(tarjeta(7));
    expect(await screen.findByText('Física')).toBeInTheDocument();
    expect(screen.queryByText('Algoritmos')).not.toBeInTheDocument();
    expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ url: '/api/departamentos/7/materias/sin-programa' }));
  });

  it('un cambio de rol tiene su propia consulta', async () => {
    const vista = render(tarjeta()); await screen.findByText('Algoritmos');
    vista.rerender(tarjeta(6, 'SECRETARIA'));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it('muestra un mensaje comprensible y permite reintentar ante un error', async () => {
    request.mockRejectedValueOnce(new Error('Fallo sintético'));
    render(tarjeta());
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las materias sin programa.');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Algoritmos')).toBeInTheDocument();
  });

  it('distingue la lista completa de una búsqueda sin coincidencias', async () => {
    request.mockResolvedValue({ content: [], totalPages: 0, totalElements: 0 });
    render(tarjeta());
    expect(await screen.findByText('Todas las materias del departamento tienen un programa para el año actual.')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar materias sin programa' }), 'sin coincidencias');
    expect(await screen.findByText('No se encontraron materias con esa búsqueda.')).toBeInTheDocument();
  });
});
