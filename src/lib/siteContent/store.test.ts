import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_SITE_CONTENT } from '@/data/siteContent'

import {
  exportContentJson,
  getSnapshot,
  hasLocalOverrides,
  resetToDefaults,
  setContent,
  subscribe,
} from './store'

afterEach(() => {
  resetToDefaults()
  localStorage.clear()
})

describe('siteContent store', () => {
  it('starts from the default content when localStorage is empty', () => {
    expect(getSnapshot()).toEqual(DEFAULT_SITE_CONTENT)
    expect(hasLocalOverrides()).toBe(false)
  })

  it('persists edits to localStorage and reflects them in the snapshot', () => {
    const next = {
      ...DEFAULT_SITE_CONTENT,
      hero: { ...DEFAULT_SITE_CONTENT.hero, name: 'New Name' },
    }
    setContent(next)

    expect(getSnapshot().hero.name).toBe('New Name')
    expect(hasLocalOverrides()).toBe(true)
    expect(JSON.parse(localStorage.getItem('portfolio.siteContent.v1')!).hero.name).toBe('New Name')
  })

  it('notifies subscribers on every change', () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    setContent({ ...DEFAULT_SITE_CONTENT, hero: { ...DEFAULT_SITE_CONTENT.hero, name: 'X' } })
    expect(listener).toHaveBeenCalledTimes(1)

    resetToDefaults()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    setContent(DEFAULT_SITE_CONTENT)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('clears localStorage and restores defaults on reset', () => {
    setContent({ ...DEFAULT_SITE_CONTENT, hero: { ...DEFAULT_SITE_CONTENT.hero, name: 'X' } })
    resetToDefaults()

    expect(getSnapshot()).toEqual(DEFAULT_SITE_CONTENT)
    expect(hasLocalOverrides()).toBe(false)
  })

  it('exports the current content as pretty-printed JSON', () => {
    setContent({ ...DEFAULT_SITE_CONTENT, hero: { ...DEFAULT_SITE_CONTENT.hero, name: 'X' } })
    const json = exportContentJson()

    expect(JSON.parse(json).hero.name).toBe('X')
    expect(json).toContain('\n')
  })
})
