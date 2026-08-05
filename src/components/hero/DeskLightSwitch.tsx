import { setDeskLight } from '@/lib/deskLight/store'
import { useDeskLight } from '@/lib/deskLight/useDeskLight'

/**
 * The keyboard and screen-reader path to the desk lamp.
 *
 * The visible control is the wall switch modelled inside the 3D scene, which is the
 * right place for it — the light then behaves like something in the room rather than
 * a setting. But a WebGL canvas is not focusable and its contents are invisible to
 * assistive technology, so that control alone would make the lamp reachable by mouse
 * only.
 *
 * This is the same toggle, bound to the same store, hidden until focused. Tabbing to
 * it reveals a real switch; everyone else only ever sees the one on the wall.
 */
export function DeskLightSwitch() {
  const isOn = useDeskLight()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => setDeskLight(!isOn)}
      className="glass-soft text-fog focus-visible:text-mist sr-only rounded-full px-4 py-2 font-mono text-xs tracking-wide uppercase focus-visible:not-sr-only focus-visible:relative focus-visible:inline-flex"
    >
      Desk light
    </button>
  )
}
