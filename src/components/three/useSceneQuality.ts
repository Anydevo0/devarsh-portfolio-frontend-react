import { useEffect, useState } from 'react'

import type { SceneQuality } from './lib/textures'

/**
 * Picks a detail tier from the device rather than from the viewport alone.
 *
 * Width is the strongest signal (a phone is both small and usually thermally
 * limited), but a wide window on a 4-core ultrabook benefits from the same
 * reductions, so core count is weighed too. The tier drives texture resolution,
 * cylinder segment counts, antialiasing, device pixel ratio, and whether the
 * optional details — casters, hair tufts, steam — are built at all.
 */
export function useSceneQuality(): SceneQuality {
  const [quality, setQuality] = useState<SceneQuality>(() => detect())

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setQuality(detect())
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return quality
}

function detect(): SceneQuality {
  if (typeof window === 'undefined') return 'low'
  const cores = navigator.hardwareConcurrency ?? 4
  return window.innerWidth >= 1024 && cores > 4 ? 'high' : 'low'
}
