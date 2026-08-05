import { useSyncExternalStore } from 'react'

import { getSnapshot, subscribe } from './store'

/** Reads the persisted desk-light state. Pairs with `setDeskLight` from the store. */
export function useDeskLight(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
