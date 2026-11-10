import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { EstadoHistorialFlow } from '@/components/pages/historial-estados-flow';

vi.mock('@/lib/utils', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/utils')>(),
  formatDate: () => '03/11/2026',
}));
afterEach(cleanup);

describe('trazabilidad del circuito', () => {
  it('muestra la omisión de Área sin atribuir una aceptación al coordinador', () => {
    render(<EstadoHistorialFlow historial={[{
      estado: 'PENDIENTE_DE_COMISIONES_CURRICULARES', actorRol: 'DOCENTE',
      observacion: 'Revisión de Área omitida: el área no tiene coordinador. El programa pasa a las comisiones curriculares.',
    }]} />);
    expect(screen.getByText(/Revisión de Área omitida:/)).toBeInTheDocument();
    expect(screen.queryByText('Aceptación de coordinación de área')).not.toBeInTheDocument();
  });

  it('identifica la aceptación del coordinador con su responsable', () => {
    render(<EstadoHistorialFlow historial={[{
      estado: 'PENDIENTE_DE_COMISIONES_CURRICULARES', actorRol: 'COORDINADOR_AREA',
      actor: { nombre: 'Ana', apellido: 'Pérez' },
      observacion: 'Coordinación de Área Matemática aceptó el programa y lo envió a las comisiones curriculares.',
    }]} />);
    expect(screen.getByText('Aceptación de coordinación de área')).toBeInTheDocument();
    expect(screen.getByText(/Coordinación de Área Matemática aceptó/)).toBeInTheDocument();
    expect(screen.getAllByText('Pérez, Ana').length).toBeGreaterThan(0);
  });

  it('conserva la secuencia de estados y la justificación de quien rechazó', async () => {
    const user = userEvent.setup();
    render(<EstadoHistorialFlow historial={[
      { estado: 'PENDIENTE_DE_COMISIONES_CURRICULARES', actorRol: 'DOCENTE' },
      { estado: 'RECHAZADO_A_DOCENTE', actorRol: 'COORDINACION_COMISION_CURRICULAR',
        actor: { nombre: 'Juan', apellido: 'Gómez' }, justificacion: 'Corregir objetivos' },
      { estado: 'PENDIENTE_DE_COMISIONES_CURRICULARES', actorRol: 'DOCENTE' },
    ]} />);
    expect(screen.getAllByText('En revisión (comisiones curriculares)')).toHaveLength(2);
    expect(screen.getByText('Rechazado a docente')).toBeInTheDocument();
    expect(screen.getByText('Gómez, Juan')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ver justificación del rechazo' }));
    expect(screen.getByText('Corregir objetivos')).toBeInTheDocument();
    expect(screen.queryByText('Aceptación de CCC')).not.toBeInTheDocument();
  });
});
