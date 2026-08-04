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
        className="border-edge bg-void/50 text-mist placeholder:text-fog/60 focus-visible:border-pulse w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
      />
    </div>
  )
}
