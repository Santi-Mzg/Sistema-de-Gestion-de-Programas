import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgramaAcciones } from '@/components/pages/programa-acciones';

afterEach(cleanup);

describe('acciones de las listas de programas', () => {
  it.each([false, true])('la acción principal %s conserva texto y callback propios', async revision => {
    const continuar = vi.fn(); const ver = vi.fn();
    render(<ProgramaAcciones descripcion="Algoritmos (2026)" revision={revision} onContinuar={continuar} onVer={ver} />);
    const accion = revision ? 'Revisar' : 'Completar';
    const boton = screen.getByRole('button', { name: `${accion} programa de Algoritmos (2026)` });
    expect(boton).toHaveTextContent(accion);
    await userEvent.click(boton);
    expect(continuar).toHaveBeenCalledTimes(1);
    expect(ver).not.toHaveBeenCalled();
  });

  it('Ver permanece como icono y PDF mantiene el texto visible', async () => {
    const ver = vi.fn(); const pdf = vi.fn();
    render(<ProgramaAcciones descripcion="Algoritmos (2026)" onVer={ver} onPdf={pdf} />);
    expect(screen.getByRole('button', { name: 'Ver programa de Algoritmos (2026)' }).textContent).toBe('');
    expect(screen.getByRole('button', { name: 'Generar PDF de Algoritmos (2026)' })).toHaveTextContent('PDF');
    await userEvent.click(screen.getByRole('button', { name: 'Ver programa de Algoritmos (2026)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Generar PDF de Algoritmos (2026)' }));
    expect(ver).toHaveBeenCalledTimes(1); expect(pdf).toHaveBeenCalledTimes(1);
  });

  it('Más acciones ofrece historial y otros años con texto y conserva sus callbacks', async () => {
    const historial = vi.fn(); const versiones = vi.fn();
    const user = userEvent.setup();
    render(<ProgramaAcciones descripcion="Algoritmos (2026)" onHistorial={historial} onVersiones={versiones} />);
    expect(screen.queryByRole('button', { name: /Ver historial|Ver programas de otros años/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Más acciones de Algoritmos (2026)' }));
    await user.click(screen.getByRole('menuitem', { name: 'Historial de estados' }));
    expect(historial).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Más acciones de Algoritmos (2026)' }));
    await user.click(screen.getByRole('menuitem', { name: 'Programas de otros años' }));
    expect(versiones).toHaveBeenCalledTimes(1);
  });

  it('Eliminar solo aparece dentro del menú y respeta su estado deshabilitado', async () => {
    const eliminar = vi.fn();
    render(<ProgramaAcciones descripcion="Algoritmos (2026)" onEliminar={eliminar} eliminarDeshabilitado />);
    expect(screen.queryByRole('button', { name: /Eliminar programa/ })).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Más acciones de Algoritmos (2026)' }));
    const opcion = screen.getByRole('menuitem', { name: 'Eliminar programa de Algoritmos (2026)' });
    expect(opcion).toHaveAttribute('data-disabled');
    await user.click(opcion);
    expect(eliminar).not.toHaveBeenCalled();
  });

  it('no inventa acciones ausentes ni ofrece otros años dentro de la vista de versiones', async () => {
    render(<ProgramaAcciones descripcion="Algoritmos (2026)" onVer={vi.fn()} onHistorial={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Completar|Revisar|Generar PDF/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Algoritmos (2026)' }));
    expect(screen.queryByRole('menuitem', { name: 'Programas de otros años' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Eliminar/ })).not.toBeInTheDocument();
  });
});
