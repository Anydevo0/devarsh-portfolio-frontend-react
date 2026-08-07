import { DEFAULT_SITE_CONTENT } from '@/data/siteContent'
import type { SiteContent } from '@/types/siteContent'

const STORAGE_KEY = 'portfolio.siteContent.v1'

type Listener = () => void

const listeners = new Set<Listener>()

function mergeWithDefaults(stored: Partial<SiteContent> | null): SiteContent {
  if (!stored) return DEFAULT_SITE_CONTENT
  return {
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...stored.hero },
    focus: {
      ...DEFAULT_SITE_CONTENT.focus,
      ...stored.focus,
      notes: stored.focus?.notes?.length ? stored.focus.notes : DEFAULT_SITE_CONTENT.focus.notes,
    },
  }
}

function loadInitial(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? mergeWithDefaults(JSON.parse(raw) as Partial<SiteContent>) : DEFAULT_SITE_CONTENT
  } catch {
    return DEFAULT_SITE_CONTENT
  }
}

let cached: SiteContent = loadInitial()

function notify() {
  for (const listener of listeners) listener()
}

/** Subscribes to content changes — pairs with getSnapshot() via useSyncExternalStore
 * in useSiteContent(), so every consumer (Hero, ManifestBand, the admin editor) stays
 * in sync within the same tab without any Context provider to wire through the tree. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): SiteContent {
  return cached
}

/** Replaces the whole content object and persists it to localStorage. Note this only
 * updates the browser that saved it — there's no backend, so real site visitors keep
 * seeing DEFAULT_SITE_CONTENT until you export and commit the change (see
 * exportContentJson below). */
export function setContent(next: SiteContent): void {
  cached = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage unavailable (private browsing quota, disabled storage, etc.) —
    // the edit still applies for the rest of this session, just won't survive reload.
  }
  notify()
}

export function resetToDefaults(): void {
  cached = DEFAULT_SITE_CONTENT
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // see setContent
  }
  notify()
}

export function exportContentJson(): string {
  return JSON.stringify(cached, null, 2)
}

export function hasLocalOverrides(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}
