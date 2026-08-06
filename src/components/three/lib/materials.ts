import * as THREE from 'three'

import {
  createCodeTexture,
  createGlowTexture,
  createLatteTexture,
  createMeshWeaveTexture,
  createSwitchLabelTexture,
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
  /**
   * The monitor's curved bezel. Same look as `chassis`, but rendered inside-out — the
   * panel is a concave slice, so its frame is seen from the inside too. It cannot just
   * be `chassis` with a different `side`, because `chassis` is shared with the
   * keyboard, the lamp and the deskware, and flipping it would turn those inside out.
   */
  screenShell: THREE.MeshStandardMaterial
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
  /** Glazed ceramic — same body as `mug`, but polished so the rim catches a highlight. */
  mugGlaze: THREE.MeshStandardMaterial
  coffee: THREE.MeshStandardMaterial
  /** Emissive interior of the lamp shade; its intensity is animated by `DeskLamp`. */
  lampShade: THREE.MeshStandardMaterial
  /** Owned per-instance rather than shared, because `DeskLamp` animates their opacity. */
  lampBulbGlow: THREE.SpriteMaterial
  lampPoolGlow: THREE.SpriteMaterial
  /* The wall switch. These opt out of fog — see the note in `WallSwitch`. */
  switchPlate: THREE.MeshStandardMaterial
  switchRocker: THREE.MeshStandardMaterial
  switchLed: THREE.MeshStandardMaterial
  /** The LED's own bloom. Owned per-instance — `WallSwitch` animates its opacity. */
  switchLedGlow: THREE.SpriteMaterial
  switchLabel: THREE.MeshBasicMaterial
  switchHalo: THREE.SpriteMaterial
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
  // The panel is drawn from behind (see `Monitor`), which mirrors whatever is mapped
  // onto it. Flipping the sampled range back along u puts the code the right way round
  // without touching the canvas the texture was drawn on. `wrapS` is ClampToEdge and
  // stays valid: u' = 1 − u never leaves 0…1.
  codeTexture.repeat.x = -1
  codeTexture.offset.x = 1
  const weave = createMeshWeaveTexture()
  const glowTexture = createGlowTexture()
  const latte = createLatteTexture()
  const switchLabel = createSwitchLabelTexture()

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
    screenShell: standard('#0e1219', 0.5, 0.35, { side: THREE.BackSide }),

    // Unlit on purpose: the screen is the scene's brightest surface and must not dim
    // as the rig rotates it away from the key light. `BackSide` because the panel is a
    // concave slice presented from inside — see `Monitor`.
    screen: new THREE.MeshBasicMaterial({
      map: codeTexture,
      toneMapped: false,
      side: THREE.BackSide,
    }),

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

    // Ceramic, not the dark plastic everything else on the desk is made of. A pale
    // glazed body is the one light-valued object in the scene, which is what lets the
    // desk lamp visibly land on something when it is switched on.
    mug: standard('#e4dccd', 0.42, 0.02),
    mugGlaze: standard('#f0e9dc', 0.18, 0.04),
    coffee: standard('#2f1b0f', 0.22, 0.05, { map: latte }),

    lampShade: standard('#f0ddc4', 0.5, 0.06, {
      emissive: new THREE.Color('#ffc489'),
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
    lampBulbGlow: new THREE.SpriteMaterial({
      map: glowTexture,
      color: '#ffcf9c',
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    }),
    lampPoolGlow: new THREE.SpriteMaterial({
      map: glowTexture,
      color: '#ffb277',
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    }),

    switchPlate: standard('#cfd6e2', 0.55, 0.05, { fog: false }),
    switchRocker: standard('#eef2f8', 0.4, 0.03, { fog: false }),
    // The indicator reads at ~6m through fog-exempt materials, so it is the one place
    // in the scene where "correct" exposure loses to legibility. Idle sits high enough
    // to be an obviously live piece of hardware rather than a dark speck; `WallSwitch`
    // drives it far past 1 when the lamp is on, where `toneMapped: false` lets the core
    // clip to white and the sprite below supplies the green that the clipping eats.
    switchLed: standard('#3ddc97', 0.4, 0, {
      emissive: new THREE.Color('#3ddc97'),
      emissiveIntensity: 0.95,
      toneMapped: false,
      fog: false,
    }),
    switchLedGlow: new THREE.SpriteMaterial({
      map: glowTexture,
      color: '#3ddc97',
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    }),
    switchLabel: new THREE.MeshBasicMaterial({
      map: switchLabel,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    }),
    switchHalo: new THREE.SpriteMaterial({
      map: glowTexture,
      color: '#5b7fff',
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    }),

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
      for (const texture of [codeTexture, weave, glowTexture, latte, switchLabel]) texture.dispose()
      for (const material of Object.values(glow)) material.dispose()
      for (const value of Object.values(palette)) {
        if (value instanceof THREE.Material) value.dispose()
      }
    },
  }
}
