import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SyllabusProfesorForm } from '@/components/forms/programa-profesor-form'
import * as clientModule from '@/app/api/generated/client'
import { toast } from '@/hooks/use-toast'

// ── Mocks de módulos ────────────────────────────────────────────────────────

vi.mock('@/context/dept-context', () => ({
  useDept: vi.fn(() => ({
    activeDepartamento: { departamentoId: 1, departamentoNombre: 'Ingeniería' },
    availableDepartamentos: [],
    setActiveDepartamento: vi.fn(),
  })),
}))

vi.mock('@/context/role-context', () => ({
  useRole: vi.fn(() => ({
    activeRole: 'DOCENTE',
    availableRoles: ['DOCENTE'],
    setActiveRole: vi.fn(),
  })),
}))

vi.mock('@/context/header-context', () => ({
  useHeader: vi.fn(() => ({ setHeader: vi.fn() })),
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

vi.mock('@/app/api/generated/client', () => ({
  useGetPrograma: vi.fn(),
  useGetDraft: vi.fn(() => ({ data: null })),
  useSaveDraft: vi.fn(() => ({ mutate: vi.fn() })),
  useDeleteDraft: vi.fn(() => ({ mutate: vi.fn() })),
  useProfesorCarga: vi.fn(),
  useActualizarEstado: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useFormatearAPA: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  getGetProgramaQueryKey: vi.fn(() => ['programa', 1]),
  getGetDraftQueryKey: vi.fn(() => ['draft']),
  getListProgramasQueryKey: vi.fn(() => ['programas']),
}))

// ── Helpers ────────────────────────────────────────────────────────────────

const mockToast = vi.mocked(toast)
const mockUseGetPrograma = vi.mocked(clientModule.useGetPrograma)
const mockUseProfesorCarga = vi.mocked(clientModule.useProfesorCarga)

function buildPrograma(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    anio: 2025,
    materia: {
      id: 2,
      nombre: 'Análisis Matemático',
      codigo: 'MAT101',
      departamento: 'Ingeniería',
      area: 'Matemática',
    },
    profesorResponsable: {
      id: 3,
      nombre: 'Juan',
      apellido: 'Pérez',
      legajo: 'doc001',
    },
    bloqueMultiple: [],
    cargaHorariaTotal: 64,
    cargaHorariaSemanal: 4,
    cantidadSemanas: 16,
    creditos: 4,
    cargaHorariaPractica: 32,
    fundamentacion: 'Texto de fundamentación',
    objetivos: 'Texto de objetivos',
    programaAnalitico: 'Programa analítico detallado',
    metodologia: 'Metodología activa',
    modalidadEvaluacion: 'Parciales y final',
    bibliografia: 'Autor (2024). Título.',
    historialEstados: [],
    estado: 'COMPLETO_POR_ADMINISTRACION',
    ...overrides,
  }
}

function renderForm(programaData: ReturnType<typeof buildPrograma>) {
  const mockMutate = vi.fn()

  mockUseGetPrograma.mockReturnValue({
    data: programaData,
    isLoading: false,
    error: null,
  } as any)

  mockUseProfesorCarga.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as any)

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(SyllabusProfesorForm, { id: 1 }),
    ),
  )

  return { mockMutate }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SyllabusProfesorForm', () => {
  beforeEach(() => {
    mockToast.mockReset()
  })

  it('renderiza el formulario cuando el programa está cargado', async () => {
    renderForm(buildPrograma())

    await waitFor(() => {
      expect(screen.getByLabelText(/fundamentación/i)).toBeInTheDocument()
    })
  })

  it('NO llama a la mutación si "fundamentación" está vacía y muestra error de validación', async () => {
    const user = userEvent.setup()
    const { mockMutate } = renderForm(buildPrograma({ fundamentacion: '' }))

    // Esperar a que el formulario esté disponible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cargar datos/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /cargar datos/i }))

    expect(mockMutate).not.toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error de validación',
        variant: 'destructive',
      }),
    )
  })

  it('con todos los campos completos, llama a la mutación con el payload esperado', async () => {
    const user = userEvent.setup()
    const programaCompleto = buildPrograma()
    const { mockMutate } = renderForm(programaCompleto)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cargar datos/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /cargar datos/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          deptId: 1,
          id: 1,
          data: expect.objectContaining({
            fundamentacion: 'Texto de fundamentación',
            objetivos: 'Texto de objetivos',
            programaAnalitico: 'Programa analítico detallado',
            metodologia: 'Metodología activa',
            modalidadEvaluacion: 'Parciales y final',
            bibliografia: 'Autor (2024). Título.',
            cargaHorariaPractica: 32,
          }),
        }),
      )
    })
  })

  it('muestra spinner de carga cuando programaQuery.isLoading=true', () => {
    mockUseGetPrograma.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    mockUseProfesorCarga.mockReturnValue({ mutate: vi.fn(), isPending: false } as any)

    const client = new QueryClient()
    render(
      React.createElement(
        QueryClientProvider,
        { client },
        React.createElement(SyllabusProfesorForm, { id: 1 }),
      ),
    )

    expect(screen.getByText(/cargando datos del programa/i)).toBeInTheDocument()
  })

  it('NO llama a la mutación si "objetivos" está vacío', async () => {
    const user = userEvent.setup()
    const { mockMutate } = renderForm(buildPrograma({ objetivos: '' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cargar datos/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /cargar datos/i }))

    expect(mockMutate).not.toHaveBeenCalled()
  })
})
