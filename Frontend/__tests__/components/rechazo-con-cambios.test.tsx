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

  it('mantiene la justificación al confirmar y bloquea acciones y cierres mientras procesa', async () => {
    const props = { open: true, hayCambios: false, onOpenChange: vi.fn(), onConfirm: vi.fn() };
    const vista = render(<RechazoConCambiosDialog {...props} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Secretaría inicial' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.type(screen.getByLabelText('Justificación *'), 'Conservar esta justificación');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(screen.getByRole('dialog', { name: 'Justificación del rechazo' })).toBeInTheDocument();
    expect(screen.queryByText('¿A quién enviar el rechazo?')).not.toBeInTheDocument();

    vista.rerender(<RechazoConCambiosDialog {...props} isLoading />);
    expect(screen.getByLabelText('Justificación *')).toBeDisabled();
    for (const nombre of ['Atrás', 'Cancelar', 'Procesando...']) {
      expect(screen.getByRole('button', { name: nombre })).toBeDisabled();
      await user.click(screen.getByRole('button', { name: nombre }));
    }
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.keyboard('{Escape}');
    expect(props.onOpenChange).not.toHaveBeenCalled();
    expect(props.onConfirm).toHaveBeenCalledTimes(1);

    vista.rerender(<RechazoConCambiosDialog {...props} isLoading={false} />);
    expect(screen.getByLabelText('Justificación *')).toHaveValue('Conservar esta justificación');
    expect(screen.getByRole('dialog')).toHaveTextContent('Secretaría inicial');
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeEnabled();
  });

  it.each([true, false])('conserva la elección guardar=%s y el texto al reintentar tras un error', async guardar => {
    const props = { open: true, hayCambios: true, onOpenChange: vi.fn(), onConfirm: vi.fn() };
    const vista = render(<RechazoConCambiosDialog {...props} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: guardar ? 'Guardar cambios y continuar' : 'Descartar cambios y continuar' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.type(screen.getByLabelText('Justificación *'), 'Justificación para reintentar');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    vista.rerender(<RechazoConCambiosDialog {...props} isLoading />);
    vista.rerender(<RechazoConCambiosDialog {...props} isLoading={false} />);
    expect(screen.getByLabelText('Justificación *')).toHaveValue('Justificación para reintentar');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(props.onConfirm).toHaveBeenCalledTimes(2);
    expect(props.onConfirm).toHaveBeenLastCalledWith('ADMINISTRACION', 'Justificación para reintentar', guardar);
  });

  it('un cierre externo reinicia ambos diálogos antes de una nueva apertura', async () => {
    const props = { open: true, hayCambios: true, onOpenChange: vi.fn(), onConfirm: vi.fn() };
    const vista = render(<RechazoConCambiosDialog {...props} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Guardar cambios y continuar' }));
    await user.click(screen.getByRole('radio', { name: 'Secretaría inicial' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.type(screen.getByLabelText('Justificación *'), 'Intento anterior');
    vista.rerender(<RechazoConCambiosDialog {...props} open={false} />);
    vista.rerender(<RechazoConCambiosDialog {...props} />);
    expect(screen.getByText('¿Guardar los cambios antes de rechazar?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Descartar cambios y continuar' }));
    expect(screen.getByRole('radio', { name: 'Administración' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByLabelText('Justificación *')).toHaveValue('');
    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});
