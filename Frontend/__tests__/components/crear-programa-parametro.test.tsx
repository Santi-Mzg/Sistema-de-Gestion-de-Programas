import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CrearPrograma from '@/app/(dashboard)/programas/crear/page';

const contexto = vi.hoisted(() => ({ rol: 'ADMINISTRACION' as string | null, query: 'materiaId=12', deptId: 6 }));
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: contexto.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: contexto.deptId } }) }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(contexto.query) }));
vi.mock('@/components/forms/programa-creation-form', () => ({
  SyllabusCreationForm: ({ materiaIdInicial }: { materiaIdInicial: string | null }) => <p data-testid="materia-inicial">{materiaIdInicial ?? 'Sin selección inicial'}</p>,
}));
beforeEach(() => { contexto.rol = 'ADMINISTRACION'; contexto.query = 'materiaId=12'; contexto.deptId = 6; });
afterEach(cleanup);

describe('parámetro de creación del programa', () => {
  it('la página pasa el materiaId de la URL al formulario', () => {
    render(<CrearPrograma />);
    expect(screen.getByTestId('materia-inicial')).toHaveTextContent('12');
  });
  it('la entrada directa mantiene el formulario sin selección inicial', () => {
    contexto.query = '';
    render(<CrearPrograma />);
    expect(screen.getByTestId('materia-inicial')).toHaveTextContent('Sin selección inicial');
  });
  it('el parámetro no habilita el formulario con otro rol activo', () => {
    contexto.rol = 'SECRETARIA';
    render(<CrearPrograma />);
    expect(screen.getByText('No tienes permisos para cargar programas')).toBeInTheDocument();
    expect(screen.queryByTestId('materia-inicial')).not.toBeInTheDocument();
  });
});
