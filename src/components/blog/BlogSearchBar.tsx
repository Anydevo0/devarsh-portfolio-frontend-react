interface BlogSearchBarProps {
  value: string
  onChange: (value: string) => void
}

/** A controlled input only — the parent wraps this (and TagFilter) in one <form>
 * so both filters apply together on submit, not on every keystroke. */
export function BlogSearchBar({ value, onChange }: BlogSearchBarProps) {
  return (
    <div className="flex-1">
      <label htmlFor="blog-search" className="sr-only">
        Search posts
      </label>
      <input
        id="blog-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search posts…"
        className="w-full rounded border border-line px-3 py-2 text-sm focus-visible:border-wire focus-visible:outline-none"
      />
    </div>
  )
}
