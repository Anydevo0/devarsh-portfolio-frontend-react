import { Reveal } from '@/components/common/Reveal'

interface TimelineItemProps {
  company: string
  location: string
  role: string
  dateRange: string
  description: string
  /** What was actually done — the substance of the entry, one line each. */
  highlights: string[]
  stack: string[]
  /** Marks the still-running role. Drives the live node, not the ordering. */
  isCurrent?: boolean
  delay?: number
}

/**
 * One role on the rail.
 *
 * The marker is a ringed disc carrying the company's monogram rather than a plain
 * dot: real logos would mean sourcing and hosting third-party trademarks, and a
 * two-letter mark derived from the name gives each entry a distinct anchor with no
 * asset and no licensing question.
 */
export function TimelineItem({
  company,
  location,
  role,
  dateRange,
  description,
  highlights,
  stack,
  isCurrent,
  delay = 0,
}: TimelineItemProps) {
  const monogram = company.slice(0, 2).toUpperCase()

  return (
    <li className="relative pl-12 sm:pl-16">
      {/* Sits on the rail drawn by the parent list. The page-background ring makes the
          rail appear to pass behind the disc instead of butting into it. */}
      <span
        className={`ring-void bg-abyss absolute top-6 left-0 flex size-7 items-center justify-center rounded-full ring-4 ${
          isCurrent ? 'border-live/50 text-live border' : 'border-edge text-fog border'
        }`}
        aria-hidden="true"
      >
        <span className="font-mono text-[0.5625rem] font-semibold tracking-tight">{monogram}</span>
      </span>
      {isCurrent && (
        <span
          className="bg-live/25 animate-live-pulse absolute top-6 left-0 size-7 rounded-full blur-[6px]"
          aria-hidden="true"
        />
      )}

      <Reveal delay={delay}>
        <article className="glass sheen hover:border-pulse/25 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-fog font-mono text-xs tracking-wide">{dateRange}</p>
            {isCurrent && (
              <span className="border-live/30 text-live rounded-full border px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                Current
              </span>
            )}
          </div>

          <h3 className="font-tech text-mist mt-3 text-xl font-semibold tracking-tight">{role}</h3>
          <p className="text-pulse mt-1.5 font-mono text-sm">
            {company}
            <span className="text-fog/70"> · {location}</span>
          </p>

          <p className="text-fog mt-4 leading-7">{description}</p>

          <ul className="mt-5 flex flex-col gap-2.5">
            {highlights.map((highlight) => (
              <li key={highlight} className="text-fog flex gap-3 text-sm leading-6">
                {/* A rule rather than a bullet glyph — it lines up with the timeline's
                    own vocabulary instead of importing a list marker into it. */}
                <span
                  className="bg-pulse/50 mt-[0.6875rem] h-px w-3 shrink-0"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>

          <ul className="border-edge/70 mt-6 flex flex-wrap gap-1.5 border-t pt-5">
            {stack.map((tech) => (
              <li
                key={tech}
                className="border-edge bg-void/50 text-fog/90 rounded-md border px-2 py-1 font-mono text-[0.6875rem]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </article>
      </Reveal>
    </li>
  )
}
