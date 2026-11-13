import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgramaResponseDTO } from '@/app/api/generated/model';
import { SyllabusAdministrativoForm } from '@/components/forms/programa-administracion-form';
import { SyllabusSecretariaInicialForm } from '@/components/forms/programa-secretaria-inicial-form';
import { SyllabusCreationForm } from '@/components/forms/programa-creation-form';
import { SyllabusSecretariaForm } from '@/components/forms/programa-secretaria-form';
import { SyllabusDocenteForm } from '@/components/forms/programa-docente-form';
import { SyllabusCoordinadorForm } from '@/components/forms/programa-coordinador-form';
import { customInstance } from '@/app/api/custom-instance';
import { getListMateriasSinProgramaQueryKey } from '@/app/api/generated/client';

const estado = vi.hoisted(() => ({
  rol: 'ADMINISTRACION', programa: undefined as ProgramaResponseDTO | undefined,
  vigente: undefined as ProgramaResponseDTO | undefined, draft: undefined as { payloadJson: string } | undefined,
  programaExistente: undefined as ProgramaResponseDTO | undefined, materiasCargadas: true,
  setHeader: vi.fn(), push: vi.fn(), saveDraft: vi.fn(), deleteDraft: vi.fn(),
}));
const materias = [{ id: 1, nombre: 'Álgebra', codigo: 'ALG', area: 'Matemática', departamento: 'Ciencias' },
  { id: 2, nombre: 'Física', codigo: 'FIS', area: 'Física', departamento: 'Ciencias' },
  { id: 3, nombre: 'Análisis', codigo: 'ANA', area: 'Matemática', departamento: 'Ciencias' }];
const carreras = [{ id: 5, nombre: 'Ingeniería', planes: [{ id: 8, anio: '2026', version: 1 }] }];
const docentes = [{ id: 10, nombre: 'Ana', apellido: 'Pérez', legajo: '100' }];
vi.mock('@/context/role-context', () => ({ useRole: () => ({ activeRole: estado.rol }) }));
vi.mock('@/context/dept-context', () => ({ useDept: () => ({ activeDepartamento: { departamentoId: 6, departamentoNombre: 'Ciencias' } }) }));
vi.mock('@/context/header-context', () => ({ useHeader: () => ({ setHeader: estado.setHeader }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: estado.push, back: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/app/api/custom-instance', () => ({ customInstance: vi.fn() }));
vi.mock('@/app/api/generated/client', async importOriginal => ({
  ...await importOriginal<typeof import('@/app/api/generated/client')>(),
  useListMateriasDepartamento: () => ({ data: estado.materiasCargadas ? { content: materias } : undefined, isLoading: !estado.materiasCargadas }),
  useListCarreras: () => ({ data: carreras, isLoading: false }),
  useListDocentesDepartamento: () => ({ data: docentes, isLoading: false }),
  useListMateriasCarreraPlan: () => ({ data: materias, isLoading: false }),
  useGetPrograma: () => ({ data: estado.programa, isLoading: false }),
  useGetProgramaMateriaAnio: (id: number, options: { query: { enabled: boolean } }) => ({ data: id ? estado.programaExistente : undefined, isSuccess: !!id && options.query.enabled, isLoading: false }),
  useGetDraft: (_dept: number, _materia: number, _params: unknown, options: { query: { enabled: boolean } }) => ({ data: estado.draft, isSuccess: options.query.enabled, isLoading: false }),
  useGetProgramaVigente: (id: number, options: { query: { enabled: boolean } }) => ({ data: id ? estado.vigente : undefined, isSuccess: !!id && options.query.enabled, isLoading: false }),
  useSaveDraft: () => ({ mutate: estado.saveDraft }),
  useDeleteDraft: () => ({ mutate: estado.deleteDraft }),
}));
vi.mock('@/components/modals/cargar-programa-dialog', () => ({
  CargarProgramaVigenteDialog: ({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) => open
    ? <div role="dialog" aria-label="Programa vigente"><button onClick={onConfirm}>Cargar vigente</button><button onClick={onCancel}>No cargar vigente</button></div> : null,
}));

let client: QueryClient;
const request = vi.mocked(customInstance);
beforeEach(() => {
  estado.rol = 'ADMINISTRACION'; estado.draft = undefined;
  estado.programaExistente = undefined; estado.materiasCargadas = true;
  estado.programa = {
    id: 12, anio: 2026, materia: materias[0], docenteResponsable: docentes[0],
    cantidadSemanas: 16, cargaHorariaSemanal: 4, cargaHorariaTotal: 64, creditos: 6, cargaHorariaPractica: 2,
    contenidosMinimos: 'Contenidos existentes', fundamentacion: 'Fundamentación existente', objetivos: 'Objetivos existentes',
    programaAnalitico: 'Analítico existente', metodologia: 'Metodología existente', modalidadEvaluacion: 'Evaluación existente', bibliografia: 'Bibliografía existente',
    bloqueMultiple: [{ plan: carreras[0].planes[0], carreraNombre: 'Ingeniería', ubicacionEnPlan: 'Primer año',
      correlativasFuertes: [materias[2]], correlativasDebiles: [], contribucion: 'Contribución de CCC' }],
    historialEstados: [],
  };
  estado.vigente = estado.programa;
  request.mockResolvedValue(estado.programa);
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); client.clear(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

function mostrar(elemento: React.ReactNode) {
  return render(<QueryClientProvider client={client}>{elemento}</QueryClientProvider>);
}
function control(container: HTMLElement, id: string) {
  const nodo = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`);
  expect(nodo).not.toBeNull(); return nodo!;
}
function esperarDatosConsulta(container: HTMLElement) {
  expect(control(container, 'contribucion-0')).toHaveValue('Contribución de CCC');
  expect(control(container, 'contribucion-0')).toBeDisabled();
  expect(control(container, 'fundamentacion')).toHaveValue('Fundamentación existente');
  expect(control(container, 'fundamentacion')).toBeDisabled();
}

const actoresRechazo = [
  { nombre: 'CCC', rol: 'COORDINACION_COMISION_CURRICULAR', destino: 'Docente responsable', formulario: () => <SyllabusCoordinadorForm id={12} carreraId={8} /> },
  { nombre: 'Docente', rol: 'DOCENTE', destino: 'Secretaría inicial', formulario: () => <SyllabusDocenteForm id={12} /> },
  { nombre: 'Secretaría inicial', rol: 'SECRETARIA', destino: 'Administración', formulario: () => <SyllabusSecretariaInicialForm id={12} /> },
  { nombre: 'Área', rol: 'COORDINADOR_AREA', destino: 'Docente responsable', formulario: () => <SyllabusSecretariaForm id={12} /> },
  { nombre: 'Secretaría final', rol: 'SECRETARIA', destino: 'Docente responsable', formulario: () => <SyllabusSecretariaForm id={12} /> },
];

async function completarRechazo(caso: typeof actoresRechazo[number], guardarCambios?: boolean) {
  estado.rol = caso.rol;
  const vista = mostrar(caso.formulario());
  if (guardarCambios !== undefined) {
    const campo = caso.nombre === 'CCC' ? 'contribucion' : caso.nombre === 'Docente' ? 'objetivos' : 'contenidosMinimos';
    fireEvent.change(control(vista.container, campo), { target: { value: 'Edición pendiente de guardar' } });
  }
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ }));
  if (guardarCambios !== undefined) {
    await user.click(screen.getByRole('button', { name: guardarCambios ? 'Guardar cambios y continuar' : 'Descartar cambios y continuar' }));
  }
  await user.click(screen.getByRole('radio', { name: caso.destino }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.type(screen.getByLabelText('Justificación *'), 'Corregir la información indicada');
  return user;
}

describe('ciclo del diálogo de rechazo en todos los actores', () => {
  it.each(actoresRechazo)('$nombre conserva la justificación mientras envía y cierra al confirmar éxito, antes del refetch', async caso => {
    let resolverEnvio!: (programa: ProgramaResponseDTO) => void;
    let resolverRefresco!: () => void;
    request.mockImplementation(() => new Promise<ProgramaResponseDTO>(resolve => { resolverEnvio = resolve; }));
    vi.spyOn(client, 'invalidateQueries').mockImplementation(() => new Promise<void>(resolve => { resolverRefresco = resolve; }));
    const user = await completarRechazo(caso);
    await user.click(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ }));
    expect(screen.getByRole('dialog', { name: 'Justificación del rechazo' })).toBeInTheDocument();
    expect(screen.queryByText('¿A quién enviar el rechazo?')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Justificación *')).toHaveValue('Corregir la información indicada');
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Procesando...' }));
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => resolverEnvio(estado.programa!));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(estado.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ })).toBeDisabled();
    await act(async () => resolverRefresco());
    await waitFor(() => expect(estado.push).toHaveBeenCalledWith('/'));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each(actoresRechazo)('$nombre conserva destino y justificación si falla y permite reintentar', async caso => {
    request.mockRejectedValueOnce(new Error('Error simulado'));
    const user = await completarRechazo(caso);
    await user.click(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Rechazar' })).toBeEnabled());
    expect(screen.getByLabelText('Justificación *')).toHaveValue('Corregir la información indicada');
    expect(screen.getByRole('dialog')).toHaveTextContent(caso.destino);
    expect(estado.push).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(1);
    const primeraDecision = request.mock.calls[0][0];
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    await waitFor(() => expect(estado.push).toHaveBeenCalledWith('/'));
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0]).toEqual(primeraDecision);
  });

  it.each(actoresRechazo.slice(0, 3))('$nombre no recrea el borrador al cerrar tras éxito mientras refresca consultas', async caso => {
    let resolverEnvio!: (programa: ProgramaResponseDTO) => void;
    let resolverRefresco!: () => void;
    request.mockImplementation(() => new Promise<ProgramaResponseDTO>(resolve => { resolverEnvio = resolve; }));
    const refrescar = vi.spyOn(client, 'invalidateQueries').mockImplementation(() => new Promise<void>(resolve => { resolverRefresco = resolve; }));
    const user = await completarRechazo(caso, true);
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ guardarCambios: true }) }));
    vi.useFakeTimers();
    try {
      await act(async () => {
        resolverEnvio(estado.programa!);
        await vi.advanceTimersByTimeAsync(3000);
      });
      expect(refrescar).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(estado.saveDraft).not.toHaveBeenCalled();
      expect(estado.deleteDraft).not.toHaveBeenCalled();
      expect(estado.push).not.toHaveBeenCalled();
      await act(async () => { resolverRefresco(); await vi.advanceTimersByTimeAsync(0); });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('campos y operaciones de cada formulario', () => {
  it.each([false, true])('Docente ofrece el borrador cuando llega con caché inicial %s y respeta cancelarlo', async enCache => {
    estado.rol = 'DOCENTE';
    const borrador = { payloadJson: JSON.stringify({ objetivos: 'Objetivos del borrador' }) };
    estado.draft = enCache ? borrador : undefined;
    const vista = mostrar(<SyllabusDocenteForm id={12} />);
    if (!enCache) {
      expect(screen.queryByRole('dialog', { name: 'Borrador encontrado' })).not.toBeInTheDocument();
      estado.draft = borrador;
      vista.rerender(<QueryClientProvider client={client}><SyllabusDocenteForm id={12} /></QueryClientProvider>);
    }
    const dialogo = screen.getByRole('dialog', { name: 'Borrador encontrado' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    vista.rerender(<QueryClientProvider client={client}><SyllabusDocenteForm id={12} /></QueryClientProvider>);
    expect(screen.queryByRole('dialog', { name: 'Borrador encontrado' })).not.toBeInTheDocument();
  });

  it('CCC conserva su edición y carga la contribución correspondiente al cambiar de plan', () => {
    estado.rol = 'COORDINACION_COMISION_CURRICULAR';
    estado.programa!.bloqueMultiple!.push({
      plan: { id: 9, anio: '2025', version: 1 }, carreraNombre: 'Otra carrera',
      contribucion: 'Contribución del otro plan',
    });
    const vista = mostrar(<SyllabusCoordinadorForm id={12} carreraId={8} />);
    expect(control(vista.container, 'contribucion')).toHaveValue('Contribución de CCC');
    fireEvent.change(control(vista.container, 'contribucion'), { target: { value: 'Contribución editada' } });
    vista.rerender(<QueryClientProvider client={client}><SyllabusCoordinadorForm id={12} carreraId={8} /></QueryClientProvider>);
    expect(control(vista.container, 'contribucion')).toHaveValue('Contribución editada');
    vista.rerender(<QueryClientProvider client={client}><SyllabusCoordinadorForm id={12} carreraId={9} /></QueryClientProvider>);
    expect(control(vista.container, 'contribucion')).toHaveValue('Contribución del otro plan');
  });

  it('Secretaría inicial conserva envío e invalidación al usar el hook generado por Orval', async () => {
    estado.rol = 'SECRETARIA';
    const claveMaterias = [...getListMateriasSinProgramaQueryKey(6, { page: 0, size: 5, search: '' }), { rol: 'SECRETARIA' }];
    client.setQueryData(claveMaterias, { content: [] });
    const { container } = mostrar(<SyllabusSecretariaInicialForm id={12} />);
    await waitFor(() => expect(control(container, 'contenidosMinimos')).toHaveValue('Contenidos existentes'));
    fireEvent.change(control(container, 'contenidosMinimos'), { target: { value: 'Contenidos corregidos con Orval' } });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar al docente' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/programas/12/secretaria-carga', method: 'PATCH',
      data: expect.objectContaining({ contenidosMinimos: 'Contenidos corregidos con Orval' }),
    })));
    await waitFor(() => expect(client.getQueryState(claveMaterias)?.isInvalidated).toBe(true));
    expect(estado.push).toHaveBeenCalledWith('/');
  });
  it('Secretaría inicial sin cambios rechaza directamente y vuelve a omitir la pregunta si restaura sus valores', async () => {
    estado.rol = 'SECRETARIA';
    const { container } = mostrar(<SyllabusSecretariaInicialForm id={12} />);
    await waitFor(() => expect(control(container, 'contenidosMinimos')).toHaveValue('Contenidos existentes'));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Rechazar/ }));
    expect(screen.getByText('¿A quién enviar el rechazo?')).toBeInTheDocument();
    expect(screen.queryByText('¿Guardar los cambios antes de rechazar?')).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    fireEvent.change(control(container, 'contenidosMinimos'), { target: { value: 'Modificados' } });
    await user.click(screen.getByRole('button', { name: /Rechazar/ }));
    expect(screen.getByText('¿Guardar los cambios antes de rechazar?')).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    fireEvent.change(control(container, 'contenidosMinimos'), { target: { value: 'Contenidos existentes' } });
    await user.click(screen.getByRole('button', { name: /Rechazar/ }));
    expect(screen.getByText('¿A quién enviar el rechazo?')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('Secretaría inicial pregunta por los cambios recuperados de un borrador aunque reset limpie isDirty', async () => {
    estado.rol = 'SECRETARIA';
    estado.draft = { payloadJson: JSON.stringify({
      materiaId: 1, docenteResponsableId: 10, cantidadSemanas: 16, cargaHorariaSemanal: 4, creditos: 6,
      contenidosMinimos: 'Trabajo del borrador',
      bloqueMultiple: [{ key: 'draft', carreraPlanId: 8, ubicacionEnPlan: 'Primer año',
        correlativasFuertesIds: [3], correlativasDebilesIds: [], contribucion: 'Contribución de CCC' }],
    }) };
    mostrar(<SyllabusSecretariaInicialForm id={12} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Cargar' }));
    await user.click(screen.getByRole('button', { name: /Rechazar/ }));
    expect(screen.getByText('¿Guardar los cambios antes de rechazar?')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('Administración ve todo, con bloques y contenidos mínimos en consulta', async () => {
    const { container } = mostrar(<SyllabusAdministrativoForm id={12} />);
    await waitFor(() => expect(control(container, 'semanas')).toHaveValue(16));
    esperarDatosConsulta(container);
    expect(screen.getByLabelText('Contenidos mínimos')).toHaveValue('Contenidos existentes');
    expect(screen.getByLabelText('Contenidos mínimos')).toBeDisabled();
    expect(control(container, 'semanas')).toBeEnabled();
    expect(control(container, 'cargaSemanal')).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Agregar carrera' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(?:✕\s*)?Rechazar$/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar a secretaría' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/departamentos/6/programas/12/administrativo-carga', method: 'PATCH' })));
  });

  it('Administración puede cambiar la materia usando el mismo selector de creación', async () => {
    mostrar(<SyllabusAdministrativoForm id={12} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Materia' }));
    await userEvent.click(screen.getByRole('option', { name: /Física/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Enviar a secretaría' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ materiaId: 2 }) })));
  });

  it('Secretaría inicial tiene formulario propio con campos administrativos y bloques editables', async () => {
    estado.rol = 'SECRETARIA';
    const { container } = mostrar(<SyllabusSecretariaInicialForm id={12} />);
    await waitFor(() => expect(control(container, 'semanas')).toHaveValue(16));
    esperarDatosConsulta(container);
    expect(control(container, 'ubicacion-0')).toBeEnabled();
    expect(screen.getByLabelText('Contenidos mínimos *')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Agregar carrera' })).toBeEnabled();
    expect(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Contenidos mínimos *'), { target: { value: 'Contenidos corregidos' } });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar al docente' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/departamentos/6/programas/12/secretaria-carga',
      data: expect.objectContaining({ contenidosMinimos: 'Contenidos corregidos' }) })));
  });

  it('Secretaría inicial no envía si faltan sus contenidos obligatorios', async () => {
    estado.rol = 'SECRETARIA'; mostrar(<SyllabusSecretariaInicialForm id={12} />);
    await waitFor(() => expect(screen.getByLabelText('Contenidos mínimos *')).toHaveValue('Contenidos existentes'));
    fireEvent.change(screen.getByLabelText('Contenidos mínimos *'), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar al docente' }));
    expect(await screen.findByText('Los contenidos mínimos son obligatorios')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['SECRETARIA', 'COORDINADOR_AREA'])('%s consulta todos los campos en el formulario de revisión', rol => {
    estado.rol = rol; const { container } = mostrar(<SyllabusSecretariaForm id={12} />);
    expect(control(container, 'contribucion-0')).toHaveValue('Contribución de CCC');
    expect(control(container, 'contribucion-0')).toBeDisabled();
    expect(screen.getByDisplayValue('Fundamentación existente')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Contenidos mínimos')).toHaveValue('Contenidos existentes');
    expect(screen.getByLabelText('Contenidos mínimos')).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Agregar carrera' })).not.toBeInTheDocument();
  });

  it('Secretaría inicial rechaza solo a Administración y aplica los cambios al confirmar', async () => {
    estado.rol = 'SECRETARIA'; mostrar(<SyllabusSecretariaInicialForm id={12} />);
    await waitFor(() => expect(screen.getByLabelText('Contenidos mínimos *')).toHaveValue('Contenidos existentes'));
    fireEvent.change(screen.getByLabelText('Contenidos mínimos *'), { target: { value: 'Trabajo a conservar' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios y continuar' }));
    expect(screen.getAllByRole('radio')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Administración' })).toBeChecked();
    expect(request).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.type(screen.getByLabelText('Justificación *'), 'Corregir la materia');
    await user.click(screen.getByRole('button', { name: /^(?:✕\s*)?Rechazar$/ }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      accion: 'RECHAZAR', destinoRechazo: 'ADMINISTRACION', justificacion: 'Corregir la materia', guardarCambios: true,
      cambios: expect.objectContaining({ contenidosMinimos: 'Trabajo a conservar' }),
    }) })));
  });

  async function seleccionarMateriaCreacion() {
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: 'Materia' }));
    await user.click(screen.getByRole('option', { name: /Álgebra/ }));
    return user;
  }

  it('creación desde cero muestra los errores y envía una sola vez después de completar los campos', async () => {
    estado.vigente = undefined;
    mostrar(<SyllabusCreationForm />);
    const user = await seleccionarMateriaCreacion();

    await user.click(screen.getByRole('button', { name: 'Enviar a secretaría' }));
    expect(await screen.findByText('Debe seleccionar un docente responsable.')).toBeInTheDocument();
    expect(screen.getByText('La cantidad de semanas es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('La carga horaria semanal es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('Los créditos son obligatorios.')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();

    await user.click(screen.getByText('Seleccionar docente...'));
    await user.click(screen.getByRole('option', { name: /Pérez, Ana/ }));
    await user.type(screen.getByLabelText('Cantidad de semanas *'), '16');
    await user.type(screen.getByLabelText('Carga horaria semanal *'), '4');
    await user.type(screen.getByLabelText('Créditos *'), '6');
    await user.click(screen.getByRole('button', { name: 'Enviar a secretaría' }));

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/departamentos/6/programas', method: 'POST',
      data: expect.objectContaining({ materiaId: 1, docenteResponsableId: 10,
        cantidadSemanas: 16, cargaHorariaSemanal: 4, cargaHorariaTotal: 64,
        creditos: 6, bloqueMultiple: [] }),
    }));
    await waitFor(() => expect(estado.push).toHaveBeenCalledWith('/'));
  });

  it('la materia inicial espera la carga del departamento y permite cambiar la selección después', async () => {
    estado.materiasCargadas = false; estado.vigente = undefined;
    const vista = mostrar(<SyllabusCreationForm materiaIdInicial="1" />);
    expect(screen.getByText('Cargando materias disponibles...')).toBeInTheDocument();
    estado.materiasCargadas = true;
    vista.rerender(<QueryClientProvider client={client}><SyllabusCreationForm materiaIdInicial="1" /></QueryClientProvider>);
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Materia' })).toHaveTextContent('Álgebra'));
    await userEvent.click(screen.getByRole('combobox', { name: 'Materia' }));
    await userEvent.click(screen.getByRole('option', { name: /Física/ }));
    expect(screen.getByRole('combobox', { name: 'Materia' })).toHaveTextContent('Física');
    vista.rerender(<QueryClientProvider client={client}><SyllabusCreationForm materiaIdInicial="1" /></QueryClientProvider>);
    expect(screen.getByRole('combobox', { name: 'Materia' })).toHaveTextContent('Física');
  });

  it.each(['', '0', '-1', 'abc', '1.5', '9007199254740993', '9999'])('una materia inicial inválida o no disponible (%s) no se selecciona y permite elegir otra', async materiaIdInicial => {
    estado.vigente = undefined;
    mostrar(<SyllabusCreationForm materiaIdInicial={materiaIdInicial} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Elegí una materia del departamento activo.');
    expect(screen.getByRole('combobox', { name: 'Materia' })).toHaveTextContent('Seleccionar materia...');
    await seleccionarMateriaCreacion();
    expect(screen.getByRole('combobox', { name: 'Materia' })).toHaveTextContent('Álgebra');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('la selección inicial conserva la comprobación de programa existente en el año', async () => {
    estado.programaExistente = estado.programa;
    mostrar(<SyllabusCreationForm materiaIdInicial="1" />);
    expect(await screen.findByRole('dialog', { name: 'Programa existente' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Programa vigente' })).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('la selección inicial ofrece recuperar el draft antes de consultar el vigente', async () => {
    estado.draft = { payloadJson: JSON.stringify({ materiaId: 1, cantidadSemanas: 16, cargaHorariaSemanal: 4,
      creditos: 6, fundamentacion: 'Trabajo previo del draft' }) };
    const { container } = mostrar(<SyllabusCreationForm materiaIdInicial="1" />);
    const dialogo = await screen.findByRole('dialog', { name: 'Borrador encontrado' });
    expect(screen.queryByRole('dialog', { name: 'Programa vigente' })).not.toBeInTheDocument();
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cargar' }));
    expect(control(container, 'fundamentacion')).toHaveValue('Trabajo previo del draft');
  });

  it('la selección inicial recorre la consulta del vigente como una selección manual', async () => {
    const { container } = mostrar(<SyllabusCreationForm materiaIdInicial="1" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Cargar vigente' }));
    expect(control(container, 'fundamentacion')).toHaveValue('Fundamentación existente');
    expect(control(container, 'contribucion-0')).toHaveValue('Contribución de CCC');
  });

  it('creación muestra el vigente solo cuando el usuario acepta cargarlo, en modo consulta', async () => {
    const { container } = mostrar(<SyllabusCreationForm />); const user = await seleccionarMateriaCreacion();
    await user.click(await screen.findByRole('button', { name: 'Cargar vigente' }));
    await waitFor(() => expect(control(container, 'fundamentacion')).toHaveValue('Fundamentación existente'));
    expect(control(container, 'fundamentacion')).toHaveAttribute('readonly');
    expect(control(container, 'contribucion-0')).toHaveValue('Contribución de CCC');
    expect(control(container, 'contribucion-0')).toBeDisabled();
    expect(control(container, 'contenidosMínimos')).toHaveValue('Contenidos existentes');
    expect(control(container, 'contenidosMínimos')).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Agregar carrera' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Enviar a secretaría' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/departamentos/6/programas', method: 'POST' })));
  });

  it('creación no muestra como cargados los datos del vigente que se descartó', async () => {
    const { container } = mostrar(<SyllabusCreationForm />); const user = await seleccionarMateriaCreacion();
    await user.click(await screen.findByRole('button', { name: 'No cargar vigente' }));
    expect(control(container, 'fundamentacion')).toHaveValue('');
    expect(control(container, 'contenidosMínimos')).toHaveValue('');
    expect(container.querySelector('#contribucion-0')).not.toBeInTheDocument();
  });

  it('creación recupera los datos de consulta del draft aunque no se haya consultado el vigente', async () => {
    estado.vigente = undefined;
    estado.draft = { payloadJson: JSON.stringify({ materiaId: 1, docenteResponsableId: 10, cantidadSemanas: 16,
      cargaHorariaSemanal: 4, creditos: 6, contenidosMinimos: 'Mínimos del draft', fundamentacion: 'Fundamentación del draft',
      bloqueMultiple: [{ carreraPlanId: 8, ubicacionEnPlan: 'Segundo año', correlativasFuertesIds: [3], contribucion: 'Contribución del draft' }] }) };
    const { container } = mostrar(<SyllabusCreationForm />); const user = await seleccionarMateriaCreacion();
    const dialogo = await screen.findByRole('dialog', { name: 'Borrador encontrado' });
    await user.click(within(dialogo).getByRole('button', { name: 'Cargar' }));
    expect(control(container, 'fundamentacion')).toHaveValue('Fundamentación del draft');
    expect(control(container, 'contenidosMínimos')).toHaveValue('Mínimos del draft');
    expect(control(container, 'contribucion-0')).toHaveValue('Contribución del draft');
    expect(control(container, 'ubicacion-0')).toHaveValue('Segundo año');
    expect(screen.getByText('Análisis')).toBeInTheDocument();
  });
});
