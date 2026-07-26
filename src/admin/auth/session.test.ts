import { afterEach, describe, expect, it } from 'vitest'

import { clearSession, getValidToken, saveSession } from '@/admin/auth/session'

describe('admin session', () => {
  afterEach(() => {
    clearSession()
  })

  it('returns null when nothing has been saved', () => {
    expect(getValidToken()).toBeNull()
  })

  it('returns the token when the session has not expired', () => {
    saveSession('a-token', 60)
    expect(getValidToken()).toBe('a-token')
  })

  it('returns null once the session has expired', () => {
    saveSession('a-token', -1)
    expect(getValidToken()).toBeNull()
  })

  it('returns null after the session is cleared', () => {
    saveSession('a-token', 60)
    clearSession()
    expect(getValidToken()).toBeNull()
  })
})
