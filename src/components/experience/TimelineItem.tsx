interface TimelineItemProps {
  company: string
  role: string
  dateRange: string
  description: string
  isLast?: boolean
}

export function TimelineItem({ company, role, dateRange, description, isLast }: TimelineItemProps) {
  return (
    <div className="relative pl-8">
      <span className="absolute top-6 left-0 size-2.5 rounded-full bg-wire ring-4 ring-paper" />
      {!isLast && (
        <span aria-hidden="true" className="absolute top-6 -bottom-8 left-1 w-px bg-line" />
      )}
      <div className="rounded-2xl border border-line/60 bg-paper p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
        <p className="font-mono text-xs text-mute">{dateRange}</p>
        <h3 className="mt-1 font-display text-lg font-bold">
          {role} · {company}
        </h3>
        <p className="mt-2 text-ink/80">{description}</p>
      </div>
    </div>
  )
}
