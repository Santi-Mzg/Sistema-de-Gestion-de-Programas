import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RechazoDialog } from '@/components/modals/rechazo-dialog'
import { useRole } from '@/context/role-context'

vi.mock('@/context/role-context', () => ({
  useRole: vi.fn(),
}))

const mockUseRole = vi.mocked(useRole)

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onConfirm: vi.fn(),
  isLoading: false,
}

describe('RechazoDialog', () => {
  beforeEach(() => {
    mockUseRole.mockReturnValue({
      activeRole: 'SECRETARIA',
      availableRoles: ['SECRETARIA'],
      setActiveRole: vi.fn(),
    })
    defaultProps.onOpenChange.mockReset()
    defaultProps.onConfirm.mockReset()
  })

  it('muestra el paso "destino" por defecto', () => {
    render(<RechazoDialog {...defaultProps} />)
    expect(screen.getByText('¿A quién enviar el rechazo?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
  })

  it('avanza al paso "justificacion" al hacer click en Siguiente', async () => {
    const user = userEvent.setup()
    render(<RechazoDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByText('Justificación del Rechazo')).toBeInTheDocument()
  })

  it('el botón Rechazar está deshabilitado cuando la justificación está vacía', async () => {
    const user = userEvent.setup()
    render(<RechazoDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByRole('button', { name: /^rechazar$/i })).toBeDisabled()
  })

  it('el botón Rechazar se habilita al ingresar justificación y llama a onConfirm con los datos correctos', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<RechazoDialog {...defaultProps} onConfirm={onConfirm} />)

    // Paso 1: ADMINISTRACION seleccionado por defecto, avanzar
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    // Paso 2: ingresar justificación
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Falta bibliografía actualizada posterior a 2020')

    const confirmBtn = screen.getByRole('button', { name: /^rechazar$/i })
    expect(confirmBtn).not.toBeDisabled()

    await user.click(confirmBtn)

    expect(onConfirm).toHaveBeenCalledWith(
      'ADMINISTRACION',
      'Falta bibliografía actualizada posterior a 2020',
    )
  })

  it('con activeRole=DOCENTE, solo se muestra la opción Administración', () => {
    mockUseRole.mockReturnValue({
      activeRole: 'DOCENTE',
      availableRoles: ['DOCENTE'],
      setActiveRole: vi.fn(),
    })

    render(<RechazoDialog {...defaultProps} />)

    expect(screen.getByText('Administración')).toBeInTheDocument()
    expect(screen.queryByText('Docente Responsable')).not.toBeInTheDocument()
  })

  it('con activeRole=SECRETARIA, se muestran ambas opciones de destino', () => {
    render(<RechazoDialog {...defaultProps} />)

    expect(screen.getByText('Administración')).toBeInTheDocument()
    expect(screen.getByText('Docente Responsable')).toBeInTheDocument()
  })

  it('Cancelar cierra el diálogo y resetea el estado', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(<RechazoDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('el botón Rechazar muestra "Procesando..." cuando isLoading=true', async () => {
    const user = userEvent.setup()
    render(<RechazoDialog {...defaultProps} isLoading={true} />)

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByRole('button', { name: /procesando/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /procesando/i })).toBeDisabled()
  })
})
