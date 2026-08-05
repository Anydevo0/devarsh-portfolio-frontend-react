const STORAGE_KEY = 'portfolio.deskLight.v1'

type Listener = () => void

const listeners = new Set<Listener>()

function loadInitial(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // On by default — a visitor's first impression should be the lit scene.
    return raw === null ? true : raw === 'on'
  } catch {
    return true
  }
}

let isOn = loadInitial()

/**
 * Whether the workstation's desk lamp is lit.
 *
 * A module-level external store rather than component state, following the same
 * pattern as `siteContent/store.ts`: the switch lives in the hero but the value is
 * read inside the R3F tree, and persisting it means the choice survives navigating
 * to /blog and back — which is what "remember the state" has to mean on a site where
 * the hero unmounts on every route change.
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): boolean {
  return isOn
}

/**
 * Whether the visitor has ever used the switch. The wall switch pulses to attract
 * attention until they have, and then stops — a hint that keeps pulsing after it has
 * been understood is just noise.
 */
export function hasStoredPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export function setDeskLight(next: boolean): void {
  if (next === isOn) return
  isOn = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {
    // Storage unavailable (private browsing quota, disabled storage) — the choice
    // still applies for the rest of this session, it just won't survive a reload.
  }
  for (const listener of listeners) listener()
}
