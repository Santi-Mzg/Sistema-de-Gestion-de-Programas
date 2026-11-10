import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { LabelWithTooltip } from '@/components/ui/label-with-tooltip';

afterEach(cleanup);

describe('etiqueta de campo con ayuda independiente', () => {
  it.each([false, true])('asocia un único control y conserva el indicador obligatorio: %s', async required => {
    render(<>
      <LabelWithTooltip htmlFor="contenidos" label="Contenidos mínimos" required={required} tooltip="Ayuda del campo" />
      <textarea id="contenidos" defaultValue="Contenido existente" />
    </>);
    const label = required ? 'Contenidos mínimos *' : 'Contenidos mínimos';
    const field = screen.getByRole('textbox', { name: label });
    expect(screen.getByLabelText(label)).toBe(field);
    expect(field).toHaveValue('Contenido existente');
    const help = screen.getByRole('button', { name: 'Ayuda sobre Contenidos mínimos' });
    expect(help.closest('label')).toBeNull();
    expect(help).toHaveAttribute('type', 'button');
    await userEvent.click(screen.getByText('Contenidos mínimos'));
    expect(field).toHaveFocus();
  });
});
