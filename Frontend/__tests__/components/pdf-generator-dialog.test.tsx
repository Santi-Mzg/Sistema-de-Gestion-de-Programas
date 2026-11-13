import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PDFGeneratorDialog } from '@/components/modals/pdf-generator-dialog';

const bloques = [
  { carreraNombre: 'Ingeniería', plan: { id: 8, anio: '2024', version: 1 } },
  { carreraNombre: 'Ingeniería', plan: { id: 9, anio: '2024', version: 2 } },
  { carreraNombre: 'Licenciatura', plan: { id: 10, anio: '2025', version: 1 } },
];

function mostrar(cambios = {}) {
  const props = { open: true, bloques, cargando: false, error: false, generando: false,
    onOpenChange: vi.fn(), onReintentar: vi.fn(), onGenerar: vi.fn(), ...cambios };
  render(<PDFGeneratorDialog {...props} />);
  return props;
}

afterEach(cleanup);

describe('selección de planes para PDF', () => {
  it('ofrece cada carrera-plan y selecciona Todos los planes por defecto', async () => {
    const props = mostrar();
    expect(screen.getByRole('checkbox', { name: 'Todos los planes' })).toBeChecked();
    for (const nombre of ['Ingeniería - Plan 2024-1', 'Ingeniería - Plan 2024-2', 'Licenciatura - Plan 2025-1']) {
      expect(screen.getByRole('checkbox', { name: nombre })).not.toBeChecked();
    }
    await userEvent.click(screen.getByRole('button', { name: 'Generar PDF' }));
    expect(props.onGenerar).toHaveBeenCalledWith(undefined);
  });

  it('selecciona varios planes independientes y desmarca Todos', async () => {
    const props = mostrar(); const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-2' }));
    expect(screen.getByRole('checkbox', { name: 'Todos los planes' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Licenciatura - Plan 2025-1' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Generar PDF' }));
    expect(props.onGenerar).toHaveBeenCalledWith([8, 9]);
  });

  it('elegir Todos limpia las selecciones individuales', async () => {
    const props = mostrar(); const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' }));
    await user.click(screen.getByRole('checkbox', { name: 'Todos los planes' }));
    expect(screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Todos los planes' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Generar PDF' }));
    expect(props.onGenerar).toHaveBeenCalledWith(undefined);
  });

  it('no genera sin ninguna opción, tampoco después de quitar el último plan', async () => {
    const props = mostrar(); const user = userEvent.setup();
    const generar = screen.getByRole('button', { name: 'Generar PDF' });
    await user.click(screen.getByRole('checkbox', { name: 'Todos los planes' }));
    expect(generar).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Seleccioná al menos una opción');
    const plan = screen.getByRole('checkbox', { name: 'Ingeniería - Plan 2024-1' });
    await user.click(plan); expect(generar).toBeEnabled();
    await user.click(plan); expect(generar).toBeDisabled();
    await user.click(generar);
    expect(props.onGenerar).not.toHaveBeenCalled();
  });

  it('cancelar cierra sin generar', async () => {
    const props = mostrar();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(props.onGenerar).not.toHaveBeenCalled();
  });

  it.each([{ cargando: true }, { error: true }, { bloques: [] }])
    ('no permite generar mientras no dispone de planes: %j', cambios => {
      mostrar(cambios);
      expect(screen.getByRole('button', { name: 'Generar PDF' })).toBeDisabled();
    });

  it('ofrece reintentar si falla la carga', async () => {
    const props = mostrar({ error: true });
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(props.onReintentar).toHaveBeenCalledOnce();
  });

  it('bloquea selección y acciones mientras genera', async () => {
    const props = mostrar({ generando: true });
    expect(screen.getByRole('checkbox', { name: 'Todos los planes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Generando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Generando...' }));
    expect(props.onGenerar).not.toHaveBeenCalled();
  });
});
