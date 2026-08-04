import { Reveal } from '@/components/common/Reveal'

interface TimelineItemProps {
  company: string
  role: string
  dateRange: string
  description: string
  /** Marks the still-running role — drives the live dot, not the ordering. */
  isCurrent?: boolean
  delay?: number
}

/**
 * One role on the rail.
 *
 * A timeline is the one structure on this page where sequence genuinely carries
 * meaning, which is what earns the rail and the markers here when the other sections
 * deliberately avoid ordered decoration.
 */
export function TimelineItem({
  company,
  role,
  dateRange,
  description,
  isCurrent,
  delay = 0,
}: TimelineItemProps) {
  return (
    <li className="relative pl-9 sm:pl-12">
      {/* Sits on the rail drawn by the parent list — `left-0` with a 10px dot centres
          on the rail's 5.5px. Ringed in the page background so the rail reads as
          passing behind the marker rather than butting into it. */}
      <span
        className={`ring-void absolute top-7 left-0 size-2.5 rounded-full ring-4 ${
          isCurrent ? 'bg-live animate-live-pulse' : 'bg-pulse'
        }`}
        aria-hidden="true"
      />

      <Reveal delay={delay}>
        <article className="glass sheen rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-fog font-mono text-xs tracking-wide">{dateRange}</p>
            {isCurrent && (
              <span className="border-live/30 text-live rounded-full border px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                Current
              </span>
            )}
          </div>
          <h3 className="font-tech text-mist mt-2.5 text-xl font-semibold tracking-tight">{role}</h3>
          <p className="text-pulse mt-1 font-mono text-sm">{company}</p>
          <p className="text-fog mt-4 leading-7">{description}</p>
        </article>
      </Reveal>
    </li>
  )
}
