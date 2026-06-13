import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLoginFlow } from '@/hooks/use-login'

vi.mock('@/app/api/generated/client', () => ({
  useLogin: vi.fn(() => ({ isPending: false, error: null, mutate: vi.fn() })),
  getMeQueryKey: vi.fn(() => ['me']),
  useMe: vi.fn(() => ({ data: null })),
}))

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
  return { client, wrapper }
}

describe('useLoginFlow', () => {
  beforeEach(() => {
    // Reemplaza window.location con objeto plain para poder espiar href
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { href: '' },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('login exitoso: limpia la caché de queries y redirige a /', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    const { client, wrapper } = createWrapper()
    const clearSpy = vi.spyOn(client, 'clear')

    const { result } = renderHook(() => useLoginFlow(), { wrapper })

    await act(async () => {
      await result.current.login({ legajo: 'doc001', password: 'secret' })
    })

    expect(clearSpy).toHaveBeenCalledOnce()
    expect(window.location.href).toBe('/')
  })

  it('login fallido: lanza error con mensaje "Login inválido"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useLoginFlow(), { wrapper })

    let caught: Error | undefined
    await act(async () => {
      try {
        await result.current.login({ legajo: 'doc001', password: 'wrong' })
      } catch (e) {
        caught = e as Error
      }
    })

    expect(caught).toBeInstanceOf(Error)
    expect(caught?.message).toBe('Login inválido')
  })

  it('expone isLoading y error desde la mutación subyacente', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useLoginFlow(), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
