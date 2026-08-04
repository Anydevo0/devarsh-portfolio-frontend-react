import * as THREE from 'three'

import {
  createCodeTexture,
  createGlowTexture,
  createMeshWeaveTexture,
  type SceneQuality,
} from './textures'

/** Additive sprite tints, standing in for a bloom pass. See `createGlowTexture`. */
export type GlowTone = 'screen' | 'pulse' | 'beam' | 'halo' | 'warm'

/**
 * One palette of materials is built per scene and shared by every mesh in it, so a
 * workstation with ~60 parts still only ships a dozen shader programs. Meshes take
 * these via the `material` prop and set `dispose={null}` (see `Part`), which keeps
 * React 19's StrictMode double-mount from disposing textures the remount still needs.
 */
export interface MaterialPalette {
  deskTop: THREE.MeshStandardMaterial
  deskFrame: THREE.MeshStandardMaterial
  chassis: THREE.MeshStandardMaterial
  screen: THREE.MeshBasicMaterial
  keycap: THREE.MeshStandardMaterial
  chairShell: THREE.MeshStandardMaterial
  chairMesh: THREE.MeshStandardMaterial
  metal: THREE.MeshStandardMaterial
  skin: THREE.MeshStandardMaterial
  hair: THREE.MeshStandardMaterial
  top: THREE.MeshStandardMaterial
  denim: THREE.MeshStandardMaterial
  headphone: THREE.MeshStandardMaterial
  accent: THREE.MeshStandardMaterial
  accentBeam: THREE.MeshStandardMaterial
  accentHalo: THREE.MeshStandardMaterial
  mug: THREE.MeshStandardMaterial
  room: THREE.MeshStandardMaterial
  floor: THREE.MeshStandardMaterial
  /** Painted onto the floor to fake contact occlusion — cheaper than a shadow map. */
  contactShadow: THREE.MeshBasicMaterial
  /** Scrolled every frame by `Monitor` — the only per-frame texture mutation. */
  codeTexture: THREE.CanvasTexture
  glow: Record<GlowTone, THREE.SpriteMaterial>
  dispose: () => void
}

const GLOW_TONES: Record<GlowTone, string> = {
  screen: '#9fc4ff',
  pulse: '#5b7fff',
  beam: '#22d3ee',
  halo: '#8b5cf6',
  warm: '#ffb27a',
}

function standard(
  color: string,
  roughness: number,
  metalness: number,
  extra: THREE.MeshStandardMaterialParameters = {},
) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra })
}

/** A self-lit trim colour. `toneMapped: false` keeps it at full chroma so the LED
 *  strips stay saturated instead of being rolled off toward white by the tone curve. */
function emissive(color: string, intensity: number) {
  return standard(color, 0.4, 0, {
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    toneMapped: false,
  })
}

export function createMaterialPalette(quality: SceneQuality): MaterialPalette {
  const codeTexture = createCodeTexture(quality)
  const weave = createMeshWeaveTexture()
  const glowTexture = createGlowTexture()

  const glow = Object.fromEntries(
    Object.entries(GLOW_TONES).map(([tone, color]) => [
      tone,
      new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    ]),
  ) as Record<GlowTone, THREE.SpriteMaterial>

  const palette: Omit<MaterialPalette, 'dispose'> = {
    deskTop: standard('#161b24', 0.62, 0.12),
    deskFrame: standard('#0c1017', 0.45, 0.55),
    chassis: standard('#0e1219', 0.5, 0.35),

    // Unlit on purpose: the screen is the scene's brightest surface and must not dim
    // as the rig rotates it away from the key light.
    screen: new THREE.MeshBasicMaterial({ map: codeTexture, toneMapped: false }),

    keycap: standard('#1c232f', 0.72, 0.05),
    chairShell: standard('#141922', 0.68, 0.18),
    chairMesh: standard('#1a212c', 0.85, 0.05, {
      alphaMap: weave,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    metal: standard('#39414f', 0.32, 0.85),

    skin: standard('#e8b89a', 0.78, 0),
    hair: standard('#171b28', 0.62, 0.06),
    top: standard('#232c3d', 0.86, 0.02),
    denim: standard('#1a2130', 0.9, 0.02),
    headphone: standard('#0f131b', 0.55, 0.25),

    // Emissive, so the RGB trim and the headphone LED read as light sources rather
    // than painted-on colour when the key light swings away.
    accent: emissive('#5b7fff', 2.4),
    accentBeam: emissive('#22d3ee', 2.1),
    accentHalo: emissive('#8b5cf6', 1.9),

    mug: standard('#222b3a', 0.55, 0.08),
    room: standard('#0a0e16', 0.96, 0),
    floor: standard('#070a11', 0.88, 0.04),
    contactShadow: new THREE.MeshBasicMaterial({
      map: glowTexture,
      color: '#000000',
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    }),
    codeTexture,
    glow,
  }

  return {
    ...palette,
    dispose() {
      for (const texture of [codeTexture, weave, glowTexture]) texture.dispose()
      for (const material of Object.values(glow)) material.dispose()
      for (const value of Object.values(palette)) {
        if (value instanceof THREE.Material) value.dispose()
      }
    },
  }
}
