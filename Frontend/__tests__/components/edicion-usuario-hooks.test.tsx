import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserResponseDTO, UsuarioDepartamentoDTO } from '@/app/api/generated/model';
import MainUserPage from '@/app/(dashboard)/mi-perfil/page';
import EditUserPage from '@/app/(dashboard)/usuarios/[id]/page';

const estado = vi.hoisted(() => ({
  departamento: null as UsuarioDepartamentoDTO | null,
  usuario: undefined as UserResponseDTO | undefined,
  consultar: vi.fn(), guardar: vi.fn(), setHeader: vi.fn(),
}));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: estado.departamento }) }));
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: estado.usuario }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: estado.setHeader }) }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: '7' }), useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/app/api/generated/client', async importOriginal => ({
  ...await importOriginal<typeof import('@/app/api/generated/client')>(),
  useGetUserById: (...args: unknown[]) => {
    estado.consultar(...args);
    return { data: estado.usuario, isLoading: !estado.usuario };
  },
  useUpdateUser: () => ({ mutate: estado.guardar, isPending: false }),
}));

let client: QueryClient;
beforeEach(() => {
  client = new QueryClient();
  estado.departamento = null;
  estado.usuario = {
    id: 7, nombre: 'Ana', apellido: 'Prueba', legajo: 'SINTETICO-7',
    departamentos: [{ departamentoId: 3, email: 'usuario@example.test' }],
  };
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); });

describe.each([
  ['mi perfil', MainUserPage],
  ['edición de usuario', EditUserPage],
] as const)('%s: carga y edición', (_nombre, Pagina) => {
  const vista = () => <QueryClientProvider client={client}><Pagina /></QueryClientProvider>;

  it('espera el departamento, luego permite editar y conserva los cambios al renderizar de nuevo', () => {
    const pagina = render(vista());
    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument();
    expect(estado.consultar).not.toHaveBeenCalled();
    estado.departamento = { departamentoId: 3, email: 'perfil@example.test' };
    pagina.rerender(vista());
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Ana');
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Nombre editado' } });
    pagina.rerender(vista());
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Nombre editado');
    estado.usuario = { ...estado.usuario, nombre: 'Ana actualizada' };
    pagina.rerender(vista());
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Ana actualizada');
    estado.departamento = null;
    pagina.rerender(vista());
    expect(screen.getByText('Cargando departamento...')).toBeInTheDocument();
  });

  it('carga los datos cuando el usuario llega después del departamento', () => {
    estado.departamento = { departamentoId: 3, email: 'perfil@example.test' };
    const usuario = estado.usuario;
    estado.usuario = undefined;
    const pagina = render(vista());
    expect(screen.queryByLabelText('Nombre *')).not.toBeInTheDocument();
    estado.usuario = usuario;
    pagina.rerender(vista());
    expect(screen.getByLabelText('Nombre *')).toHaveValue('Ana');
  });
});
