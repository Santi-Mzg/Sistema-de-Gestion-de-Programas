import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RechazoConCambiosDialog } from '@/components/modals/rechazo-con-cambios-dialog';

vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: 'DOCENTE' }) }));
afterEach(cleanup);

describe('rechazo con elección de cambios', () => {
  it('no ejecuta la elección hasta confirmar destino y justificación', async () => {
    const confirmar = vi.fn();
    const user = userEvent.setup();
    render(<RechazoConCambiosDialog open hayCambios onOpenChange={vi.fn()} onConfirm={confirmar} />);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios y continuar' }));
    expect(confirmar).not.toHaveBeenCalled();
    await user.click(screen.getByRole('radio', { name: 'Secretaría inicial' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled();
    await user.type(screen.getByLabelText('Justificación *'), 'Corregir contenidos mínimos');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(confirmar).toHaveBeenCalledWith('SECRETARIA', 'Corregir contenidos mínimos', true);
  });
  it('cancelar el segundo diálogo no guarda ni descarta', async () => {
    const confirmar = vi.fn(); const cambiar = vi.fn();
    const user = userEvent.setup();
    render(<RechazoConCambiosDialog open hayCambios onOpenChange={cambiar} onConfirm={confirmar} />);
    await user.click(screen.getByRole('button', { name: 'Descartar cambios y continuar' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(confirmar).not.toHaveBeenCalled();
    expect(cambiar).toHaveBeenCalledWith(false);
  });
  it('sin cambios abre directamente destino y justificación, sin guardar al confirmar', async () => {
    const confirmar = vi.fn();
    const user = userEvent.setup();
    render(<RechazoConCambiosDialog open hayCambios={false} onOpenChange={vi.fn()} onConfirm={confirmar} />);
    expect(screen.queryByText('¿Guardar los cambios antes de rechazar?')).not.toBeInTheDocument();
    expect(screen.getByText('¿A quién enviar el rechazo?')).toBeInTheDocument();
    expect(confirmar).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.type(screen.getByLabelText('Justificación *'), 'Corregir los datos iniciales');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(confirmar).toHaveBeenCalledWith('ADMINISTRACION', 'Corregir los datos iniciales', false);
  });
});
