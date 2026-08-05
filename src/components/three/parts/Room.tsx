import type { MaterialPalette } from '../lib/materials'
import { Glow, Part, type Vec3 } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

interface RoomProps {
  palette: MaterialPalette
  quality: SceneQuality
}

/** Floor pools that stand in for contact occlusion under the heavy objects. */
const CONTACT_SHADOWS: Array<{ position: Vec3; scale: [number, number] }> = [
  { position: [0, 0.012, 0.78], scale: [1.5, 1.5] },
  { position: [0, 0.008, -0.2], scale: [2.6, 1.4] },
]

/**
 * The room is deliberately almost empty: a floor, a back wall, and light. Everything
 * beyond ~3m falls into the scene fog, so the workstation reads as an island of light
 * rather than a modelled interior — which is both the intended mood and the reason
 * the whole scene stays under a few dozen draw calls.
 */
export function Room({ palette, quality }: RoomProps) {
  return (
    <group>
      <Part material={palette.floor} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
      </Part>

      <Part material={palette.room} position={[0, 2.4, -1.75]}>
        <planeGeometry args={[12, 5.4]} />
      </Part>

      {CONTACT_SHADOWS.map((shadow) => (
        <Part
          key={shadow.position.join()}
          material={palette.contactShadow}
          position={shadow.position}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[shadow.scale[0], shadow.scale[1], 1]}
        >
          <planeGeometry args={[1, 1]} />
        </Part>
      ))}

      {/* Bias lighting: an LED strip on the back of the monitor, washing the wall.
          The single most recognisable cue of a real desk setup, and it does the
          practical job of separating the monitor's silhouette from the wall.

          Mounted just behind the panel rather than back at the wall. Out at z=-1.72
          the parallax between strip and monitor was large enough that one end swung
          clear as the rig rotated and read as a bright line ruled across the scene;
          at 0.2m behind, it stays occluded through the whole rotation range — which
          is also where such a strip is actually fixed. */}
      <Part material={palette.accent} position={[0, 1.16, -0.55]}>
        <boxGeometry args={[1.3, 0.02, 0.018]} />
      </Part>
      <Glow palette={palette} tone="pulse" size={[3.4, 1.9]} opacity={0.5} position={[0, 1.2, -1.6]} />

      {/* Colour on the back wall is left as soft pools rather than modelled LED strips.
          Physical bars read as hard bright lines at this camera distance and drew the
          eye straight off the figure; the glows give the same depth without competing. */}
      <Glow
        palette={palette}
        tone="halo"
        size={[2.6, 3.4]}
        opacity={0.34}
        position={[-2.1, 1.5, -1.66]}
      />
      <Glow
        palette={palette}
        tone="beam"
        size={[2.2, 2.8]}
        opacity={0.26}
        position={[2.4, 1.25, -1.66]}
      />

      {quality === 'high' && (
        <Glow
          palette={palette}
          tone="pulse"
          size={[5, 2.4]}
          opacity={0.16}
          position={[0, 0.06, 0.1]}
        />
      )}
    </group>
  )
}
