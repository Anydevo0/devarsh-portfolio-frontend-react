import type { ReactNode } from 'react'

import { useInView } from '@/hooks/useInView'

interface RevealProps {
  children: ReactNode
  className?: string
}

/** Wraps a section so it fades and rises into place the first time it scrolls
 * into view, instead of every section just being static on load. */
export function Reveal({ children, className = '' }: RevealProps) {
  const { ref, isVisible } = useInView<HTMLDivElement>()

  return (
    <div ref={ref} className={`reveal ${isVisible ? 'reveal-visible' : ''} ${className}`}>
      {children}
    </div>
  )
}
