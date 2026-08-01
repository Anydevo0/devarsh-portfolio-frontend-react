import { useSyncExternalStore } from 'react'

import { getSnapshot, subscribe } from './store'
import type { SiteContent } from '@/types/siteContent'

/** Reads the current hero/focus copy, re-rendering whenever the admin content editor
 * (or any other tab of this same store) calls setContent/resetToDefaults. */
export function useSiteContent(): SiteContent {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
