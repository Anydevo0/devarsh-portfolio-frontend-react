import { Reveal } from '@/components/common/Reveal'
import { ArrowIcon, SparkIcon } from '@/components/common/icons'

/**
 * A pointer to the chat widget, dropped right before Contact rather than folded into
 * it — the form is for someone who already knows what they want to say, and this is
 * for someone who is still deciding whether to. Answering that earlier, one section
 * up, is what keeps it from reading as a second contact method competing with the
 * first.
 *
 * One line, one icon, no card of its own beyond `glass-soft` — the same treatment the
 * eyebrow pills use elsewhere, chosen so this reads as a note about the page rather
 * than a feature being advertised. The arrow is `ArrowIcon` rotated toward the
 * launcher's actual corner rather than a bespoke glyph, since the site already reuses
 * this one for "there's more this way" (project cards, the primary CTA).
 */
export function AssistantCallout() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <Reveal>
        <div className="glass-soft flex flex-wrap items-center gap-4 rounded-2xl px-5 py-4 sm:flex-nowrap sm:px-6">
          <span className="border-pulse/25 bg-pulse/10 text-pulse flex size-9 shrink-0 items-center justify-center rounded-full border">
            <SparkIcon className="size-[1.1rem]" />
          </span>
          <p className="text-fog text-sm leading-6">
            <span className="text-mist font-mono text-xs font-semibold tracking-[0.14em] uppercase">
              Pro tip
            </span>{' '}
            — Curious about my work or the tools behind it? My assistant in the
            bottom-right corner can answer on the spot.
          </p>
          <ArrowIcon className="text-pulse/60 ml-auto hidden size-5 shrink-0 rotate-45 sm:block" />
        </div>
      </Reveal>
    </div>
  )
}
