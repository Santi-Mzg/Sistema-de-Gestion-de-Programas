import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/auth/login/route'

const { setCookie } = vi.hoisted(() => ({ setCookie: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: async () => ({ set: setCookie }) }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function request() {
  return new Request('http://localhost:3001/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ legajo: 'sintetico', password: 'dato-sintetico' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('cookie del login', () => {
  it.each([
    ['development', 'true', false, 'lax'],
    ['development', '', true, 'none'],
    ['production', 'true', true, 'none'],
  ])('NODE_ENV=%s y modo local=%s', async (nodeEnv, local, secure, sameSite) => {
    vi.stubEnv('NODE_ENV', nodeEnv)
    vi.stubEnv('SILABUS_DEV_LOCAL', local)
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://127.0.0.1:8081')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'token-sintetico' }) })
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8081/api/auth/login', expect.any(Object))
    expect(setCookie).toHaveBeenCalledWith('jwt', 'token-sintetico', {
      httpOnly: true, secure, sameSite, path: '/', maxAge: 86400,
    })
  })

  it('un rechazo del backend no crea una cookie', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const response = await POST(request())
    expect(response.status).toBe(401)
    expect(setCookie).not.toHaveBeenCalled()
  })
})
