interface TagFilterProps {
  value: string
  onChange: (value: string) => void
}

// Free-text, not a dropdown — there's no endpoint to enumerate distinct tags.
export function TagFilter({ value, onChange }: TagFilterProps) {
  return (
    <div>
      <label htmlFor="blog-tag-filter" className="sr-only">
        Filter by tag
      </label>
      <input
        id="blog-tag-filter"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Filter by tag…"
        className="border-edge bg-void/50 text-mist placeholder:text-fog/60 focus-visible:border-pulse rounded-xl border px-4 py-2.5 text-sm transition-colors"
      />
    </div>
  )
}
