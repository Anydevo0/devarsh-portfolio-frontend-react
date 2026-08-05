/**
 * Cheap, honest capability check: if a context cannot be created, three.js would only
 * fail later and louder.
 *
 * Shared by `HeroScene` (which decides whether to mount the canvas at all) and `Hero`
 * (which only offers the desk-light switch when there is a scene to light). Also what
 * keeps the jsdom test environment — which has no WebGL — off the renderer path.
 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}
