interface PaginationProps {
  total: number
  limit: number
  offset: number
  onPageChange: (newOffset: number) => void
}

export function Pagination({ total, limit, offset, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between gap-4 font-mono text-sm"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={offset === 0}
        className="glass-soft text-mist hover:text-pulse rounded-full px-4 py-2 transition-colors disabled:pointer-events-none disabled:opacity-40"
      >
        ← Previous
      </button>
      <span className="text-fog">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(offset + limit)}
        disabled={currentPage >= totalPages}
        className="glass-soft text-mist hover:text-pulse rounded-full px-4 py-2 transition-colors disabled:pointer-events-none disabled:opacity-40"
      >
        Next →
      </button>
    </nav>
  )
}
