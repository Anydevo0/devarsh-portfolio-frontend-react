import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  tone?: 'wire' | 'signal' | 'outline'
}

const TONE_CLASSES = {
  wire: 'bg-wire/10 text-wire border-wire/30',
  signal: 'bg-signal/10 text-signal border-signal/30',
  outline: 'bg-transparent text-mute border-line',
}

export function Pill({ children, tone = 'outline' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
