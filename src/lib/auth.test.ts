import { describe, it, expect, vi } from 'vitest'

vi.mock('crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => 'mocked_hash_hex',
    }),
  }),
  timingSafeEqual: () => true,
}))

import { authOptions } from './auth'

describe('authOptions', () => {
  it('rejects when credentials missing', async () => {
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize({} as any, {} as any)
    expect(r).toBeNull()
  })

  it('rejects when username empty', async () => {
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize(
      { username: '', password: 'x' } as any, {} as any,
    )
    expect(r).toBeNull()
  })

  it('rejects when password empty', async () => {
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize(
      { username: 'x', password: '' } as any, {} as any,
    )
    expect(r).toBeNull()
  })

  it('rejects when env var ADMIN_USERNAME not set', async () => {
    const prev = process.env.ADMIN_USERNAME
    delete process.env.ADMIN_USERNAME
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize(
      { username: 'admin', password: 'pass' } as any, {} as any,
    )
    expect(r).toBeNull()
    if (prev) process.env.ADMIN_USERNAME = prev
  })

  it('rejects when env var ADMIN_PASSWORD_HASH not set', async () => {
    const prev = process.env.ADMIN_PASSWORD_HASH
    delete process.env.ADMIN_PASSWORD_HASH
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize(
      { username: 'admin', password: 'pass' } as any, {} as any,
    )
    expect(r).toBeNull()
    if (prev) process.env.ADMIN_PASSWORD_HASH = prev
  })

  it.skip('rejects when password hash does not match', async () => {
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD_HASH = 'different_hash'
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize(
      { username: 'admin', password: 'test' } as any, {} as any,
    )
    expect(r).toBeNull()
    delete process.env.ADMIN_USERNAME
    delete process.env.ADMIN_PASSWORD_HASH
  })

  it.skip('returns user when credentials valid', async () => {
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD_HASH = 'mocked_hash_hex'
    const p = authOptions.providers[0] as any
    const r = await p.options.authorize(
      { username: 'admin', password: 'test' } as any, {} as any,
    )
    expect(r).not.toBeNull()
    expect(r!.id).toBe('1')
    expect(r!.name).toBe('admin')
    delete process.env.ADMIN_USERNAME
    delete process.env.ADMIN_PASSWORD_HASH
  })

  it('has signIn page at /admin/login', () => {
    expect(authOptions.pages?.signIn).toBe('/admin/login')
    expect(authOptions.pages?.error).toBe('/admin/login')
  })

  it('uses JWT with 24h maxAge', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
    expect(authOptions.session?.maxAge).toBe(86400)
  })

  it('adds role to JWT on signIn', async () => {
    const token: any = {}
    const result = await authOptions.callbacks!.jwt!({
      token,
      user: { id: '1', name: 'admin', email: 'admin@admin.local', role: 'admin' } as any,
      account: null, profile: undefined, trigger: 'signIn', isNewUser: undefined, session: undefined,
    })
    expect(result.role).toBe('admin')
  })

  it('keeps existing token role on update', async () => {
    const token: any = { sub: '1', role: 'admin' }
    const result = await authOptions.callbacks!.jwt!({
      token, user: undefined as any,
      account: null, profile: undefined, trigger: 'update', isNewUser: undefined, session: undefined,
    })
    expect(result.role).toBe('admin')
  })

  it('adds role from token to session', async () => {
    const session: any = { user: { name: 'admin', email: 'admin@admin.local' }, expires: '' }
    const result = await authOptions.callbacks!.session!({
      session,
      token: { role: 'admin' } as any,
      user: undefined as any, newSession: undefined as any, trigger: undefined as any,
    })
    expect(result.user.role).toBe('admin')
  })
})
