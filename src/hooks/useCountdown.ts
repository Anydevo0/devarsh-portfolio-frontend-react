import { useEffect, useState } from 'react'

/**
 * Ticks down from `seconds` to 0, one per second — resets whenever `seconds`
 * changes to a new value (e.g. a fresh 429 response). Reused wherever a
 * `Retry-After` needs to surface as a live countdown (contact form, admin login
 * lockout).
 *
 * The reset uses React's documented "adjust state during render" pattern (a
 * conditional setState call in the render body, not inside an effect) — calling
 * setState synchronously inside a `useEffect` body triggers a cascading-render
 * lint error; doing it during render, guarded by comparing against the previous
 * value, is the sanctioned way to reset state when a prop changes.
 */
export function useCountdown(seconds: number | null): number {
  const [prevSeconds, setPrevSeconds] = useState(seconds)
  const [remaining, setRemaining] = useState(seconds ?? 0)

  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds)
    setRemaining(seconds ?? 0)
  }

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((current) => Math.max(0, current - 1)), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  return remaining
}
