import { useEffect, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DepartamentoProvider, useDept } from '@/context/dept-context';
import { RoleProvider, useRole } from '@/context/role-context';
import type { UsuarioDepartamentoDTO } from '@/app/api/generated/model';

const navegar = vi.hoisted(() => vi.fn());
const departamentos: UsuarioDepartamentoDTO[] = [
  { departamentoId: 1, departamentoNombre: 'Departamento A', roles: ['ADMINISTRACION', 'DOCENTE'] },
  { departamentoId: 2, departamentoNombre: 'Departamento B', roles: ['DOCENTE'] },
  { departamentoId: 3, departamentoNombre: 'Departamento C', roles: ['ADMINISTRACION'] },
];
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: navegar }) }));
vi.mock('@/context/auth-context', () => ({ useAuth: () => ({ user: { departamentos } }) }));

function Proveedores({ children }: { children: ReactNode }) {
  return <DepartamentoProvider><RoleProvider>{children}</RoleProvider></DepartamentoProvider>;
}

function SelectorContexto() {
  const { activeDepartamento, setActiveDepartamento } = useDept();
  const { activeRole, availableRoles, setActiveRole } = useRole();
  return <>
    <output aria-label="Departamento activo">{activeDepartamento?.departamentoNombre}</output>
    <output aria-label="Rol activo">{activeRole}</output>
    <output aria-label="Roles disponibles">{availableRoles.join(',')}</output>
    <button onClick={() => setActiveRole('DOCENTE')}>Elegir docente</button>
    <button onClick={() => setActiveDepartamento('Departamento B')}>Elegir departamento B</button>
    <button onClick={() => setActiveDepartamento('Departamento C')}>Elegir departamento C</button>
  </>;
}

function ObservarCabeceras({ registrar }: { registrar: (rol: string | null, cabecera: string | null) => void }) {
  const { activeRole } = useRole();
  useEffect(() => { registrar(activeRole, localStorage.getItem('activeRole')); }, [activeRole, registrar]);
  return null;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('activeDept', 'Departamento A');
  localStorage.setItem('activeRole', 'ADMINISTRACION');
  navegar.mockClear();
});
afterEach(() => { cleanup(); localStorage.clear(); });

describe('navegación al cambiar el contexto activo', () => {
  it('restaura el contexto inicial sin sacar al usuario de la página actual', () => {
    render(<SelectorContexto />, { wrapper: Proveedores });
    expect(screen.getByLabelText('Departamento activo')).toHaveTextContent('Departamento A');
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('ADMINISTRACION');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('restaura un departamento y un rol guardados distintos de la primera opción', () => {
    localStorage.setItem('activeDept', 'Departamento B');
    localStorage.setItem('activeRole', 'DOCENTE');
    render(<SelectorContexto />, { wrapper: Proveedores });
    expect(screen.getByLabelText('Departamento activo')).toHaveTextContent('Departamento B');
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('DOCENTE');
    expect(localStorage.getItem('activeDeptId')).toBe('2');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('reemplaza un rol guardado que no pertenece al departamento', () => {
    localStorage.setItem('activeDept', 'Departamento B');
    render(<SelectorContexto />, { wrapper: Proveedores });
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('DOCENTE');
    expect(localStorage.getItem('activeRole')).toBe('DOCENTE');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('conserva la preferencia guardada al hidratar el HTML del servidor', () => {
    localStorage.setItem('activeRole', 'DOCENTE');
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Proveedores><SelectorContexto /></Proveedores>);
    render(<Proveedores><SelectorContexto /></Proveedores>, { container, hydrate: true });
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('DOCENTE');
    expect(localStorage.getItem('activeRole')).toBe('DOCENTE');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('cambiar el rol actualiza el contexto y su persistencia y lleva a inicio', async () => {
    render(<SelectorContexto />, { wrapper: Proveedores });
    await userEvent.click(screen.getByRole('button', { name: 'Elegir docente' }));
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('DOCENTE');
    expect(localStorage.getItem('activeRole')).toBe('DOCENTE');
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('cambiar el departamento lleva a inicio y selecciona un rol disponible allí', async () => {
    render(<SelectorContexto />, { wrapper: Proveedores });
    await userEvent.click(screen.getByRole('button', { name: 'Elegir departamento B' }));
    expect(screen.getByLabelText('Departamento activo')).toHaveTextContent('Departamento B');
    expect(screen.getByLabelText('Roles disponibles')).toHaveTextContent('DOCENTE');
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('DOCENTE');
    expect(localStorage.getItem('activeDept')).toBe('Departamento B');
    expect(localStorage.getItem('activeDeptId')).toBe('2');
    expect(localStorage.getItem('activeRole')).toBe('DOCENTE');
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('sincroniza la cabecera del rol antes de los efectos que pueden iniciar consultas', async () => {
    const registrar = vi.fn();
    render(<><SelectorContexto /><ObservarCabeceras registrar={registrar} /></>, { wrapper: Proveedores });
    await userEvent.click(screen.getByRole('button', { name: 'Elegir departamento B' }));
    expect(registrar).toHaveBeenLastCalledWith('DOCENTE', 'DOCENTE');
    expect(registrar.mock.calls.every(([rol, cabecera]) => rol === cabecera)).toBe(true);
  });

  it('cambiar el departamento también lleva a inicio cuando conserva el mismo rol', async () => {
    render(<SelectorContexto />, { wrapper: Proveedores });
    await userEvent.click(screen.getByRole('button', { name: 'Elegir departamento C' }));
    expect(screen.getByLabelText('Departamento activo')).toHaveTextContent('Departamento C');
    expect(screen.getByLabelText('Rol activo')).toHaveTextContent('ADMINISTRACION');
    expect(navegar).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith('/');
  });
});
