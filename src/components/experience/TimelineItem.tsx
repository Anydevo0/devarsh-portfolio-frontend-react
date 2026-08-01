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
      <span className="absolute top-6 left-0 size-2.5 rounded-full bg-pulse ring-4 ring-void" />
      {!isLast && (
        <span aria-hidden="true" className="absolute top-6 -bottom-8 left-1 w-px bg-edge" />
      )}
      <div className="rounded-2xl border border-edge bg-panel p-5 transition-colors duration-200 hover:border-pulse/40 sm:p-6">
        <p className="font-mono text-xs text-fog">{dateRange}</p>
        <h3 className="mt-1 font-tech text-lg font-bold text-mist">
          {role} · {company}
        </h3>
        <p className="mt-2 text-mist/75">{description}</p>
      </div>
    </div>
  )
}
