import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProgramasVersiones from '@/app/(dashboard)/programas/materia/[id]/versiones/page';
import { ProgramasList } from '@/components/pages/programas-list';
import { HeaderProvider, useHeader } from '@/context/header-context';
import { customInstance } from '@/app/api/custom-instance';
import { getListProgramasMateriaQueryKey } from '@/app/api/generated/client';
import type { ProgramaResponseReducedDTO, Rol } from '@/app/api/generated/model';

const contexto = vi.hoisted(() => ({
  rol: 'ADMINISTRACION' as Rol | null,
  departamentoId: 6 as number | null,
  materiaId: '8',
  push: vi.fn(),
}));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({
  activeDepartamento: contexto.departamentoId ? { departamentoId: contexto.departamentoId } : null,
}) }));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: contexto.materiaId }),
  useRouter: () => ({ push: contexto.push }),
}));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

let client: QueryClient;
const request = vi.mocked(customInstance);
function programa(anio: number, estado: ProgramaResponseReducedDTO['estado'] = 'APROBADO'): ProgramaResponseReducedDTO {
  return { id: anio, anio, estado, materia: { id: 8, nombre: 'Álgebra', codigo: 'ALG', departamento: 'Computación' },
    docenteResponsable: { nombre: 'Ana', apellido: 'Pérez', legajo: 'DOC-PRUEBA' } };
}
function Encabezado() {
  const { title } = useHeader();
  return <h1>{title}</h1>;
}
function vista(contenido = <ProgramasVersiones />) {
  return <QueryClientProvider client={client}><HeaderProvider><Encabezado />{contenido}</HeaderProvider></QueryClientProvider>;
}
function aniosVisibles() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1)
    .map(fila => Number(within(fila).getAllByRole('cell')[0].textContent));
}
beforeEach(() => {
  contexto.rol = 'ADMINISTRACION'; contexto.departamentoId = 6; contexto.materiaId = '8';
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  request.mockReset(); contexto.push.mockClear();
});
afterEach(() => { cleanup(); client.clear(); });

describe('programas de una materia por año', () => {
  it('muestra más de diez años y distintos estados, ordena por año y no modifica la caché', async () => {
    const datos = Array.from({ length: 15 }, (_, i) => programa(2010 + i, i % 2 ? 'RECHAZADO_A_DOCENTE' : 'APROBADO'));
    Object.freeze(datos);
    request.mockResolvedValue(datos);
    render(vista());
    expect(await screen.findByText('15 programas de esta materia')).toBeInTheDocument();
    expect(aniosVisibles()).toEqual(Array.from({ length: 15 }, (_, i) => 2024 - i));
    expect(screen.queryByTitle('Página siguiente')).not.toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Versiones del programa de Álgebra');
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/materias/8/programas', method: 'GET' }));
    await userEvent.click(screen.getByRole('button', { name: 'Año' }));
    expect(aniosVisibles()).toEqual(datos.map(p => p.anio));
    const clave = [...getListProgramasMateriaQueryKey(8), { rolActivo: 'ADMINISTRACION', departamentoId: 6 }];
    expect(client.getQueryData(clave)).toEqual(datos);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('mantiene el orden por estado y la paginación del listado general', () => {
    const datos = [programa(2025, 'RECHAZADO_A_DOCENTE'), programa(2024, 'APROBADO')];
    Object.freeze(datos);
    const cambiarPagina = vi.fn();
    render(vista(<ProgramasList programas={datos} esVistaVersiones={false} page={1} pageSize={2}
      totalPages={3} totalElements={6} onPageChange={cambiarPagina} />));
    expect(aniosVisibles()).toEqual([2024, 2025]);
    expect(screen.getAllByText(/Mostrando/).length).toBeGreaterThan(0);
    expect(screen.getByTitle('Página siguiente')).toBeEnabled();
    expect(datos.map(p => p.anio)).toEqual([2025, 2024]);
  });

  it('actualiza el encabezado del listado general con el año seleccionado', () => {
    const pagina = render(vista(<ProgramasList programas={[programa(2024)]} esVistaVersiones={false} anio={2024}
      page={0} pageSize={10} totalPages={1} totalElements={1} onPageChange={vi.fn()} />));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Programas - 2024');
    pagina.rerender(vista(<ProgramasList programas={[programa(2023)]} esVistaVersiones={false} anio={2023}
      page={0} pageSize={10} totalPages={1} totalElements={1} onPageChange={vi.fn()} />));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Programas - 2023');
  });

  it('separa la caché por rol y departamento sin mostrar datos del contexto anterior', async () => {
    let resolver!: (datos: ProgramaResponseReducedDTO[]) => void;
    request.mockResolvedValueOnce([programa(2024), programa(2025)])
      .mockImplementationOnce(() => new Promise(resolve => { resolver = resolve; }))
      .mockResolvedValueOnce([]);
    const pagina = render(vista());
    await screen.findByText('2 programas de esta materia');
    contexto.rol = 'DOCENTE'; pagina.rerender(vista());
    expect(screen.getByRole('status')).toHaveTextContent('Cargando programas');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await act(async () => resolver([programa(2025)]));
    await screen.findByText('1 programa de esta materia');
    expect(aniosVisibles()).toEqual([2025]);
    contexto.departamentoId = 7; pagina.rerender(vista());
    await screen.findByText('0 programas de esta materia');
    expect(screen.queryByText('2025')).not.toBeInTheDocument();
    expect(client.getQueriesData({ queryKey: getListProgramasMateriaQueryKey(8) })).toHaveLength(3);
    contexto.rol = 'ADMINISTRACION'; contexto.departamentoId = 6; pagina.rerender(vista());
    await screen.findByText('2 programas de esta materia');
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('muestra un error comprensible y permite reintentar la consulta', async () => {
    request.mockRejectedValueOnce(new Error('detalle interno que no debe presentarse')).mockResolvedValueOnce([programa(2025)]);
    render(vista());
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los programas de esta materia.');
    expect(screen.queryByText(/detalle interno/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await screen.findByText('1 programa de esta materia');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('distingue un resultado vacío y conserva el encabezado de versiones', async () => {
    request.mockResolvedValue([]);
    render(vista());
    await screen.findByText('0 programas de esta materia');
    expect(screen.getByText('Esta materia no tiene programas disponibles para el rol y departamento activos.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Versiones del programa por materia');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo programa/ })).not.toBeInTheDocument();
  });

  it.each(['abc', '0', '-1', '1.5'])('rechaza el identificador inválido %s sin consultar el backend', id => {
    contexto.materiaId = id;
    render(vista());
    expect(screen.getByRole('alert')).toHaveTextContent('La materia indicada no es válida.');
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['rol', 'departamento'])('espera a disponer del %s activo antes de consultar', campo => {
    if (campo === 'rol') contexto.rol = null; else contexto.departamentoId = null;
    render(vista());
    expect(screen.getByText('Seleccioná un departamento y un rol para consultar las versiones.')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('actualiza el encabezado al navegar entre materias, incluso cuando no hay programas', async () => {
    request.mockResolvedValueOnce([programa(2025)]).mockResolvedValueOnce([
      { ...programa(2024), materia: { id: 9, nombre: 'Bases de datos' } },
    ]).mockResolvedValueOnce([]);
    const pagina = render(vista());
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Versiones del programa de Álgebra'));
    contexto.materiaId = '9'; pagina.rerender(vista());
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Versiones del programa de Bases de datos'));
    contexto.materiaId = '10'; pagina.rerender(vista());
    await screen.findByText('0 programas de esta materia');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Versiones del programa por materia');
    expect(request).toHaveBeenCalledTimes(3);
  });
});
