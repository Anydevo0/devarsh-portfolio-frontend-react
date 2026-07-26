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
        className="rounded border border-line px-3 py-2 text-sm focus-visible:border-wire focus-visible:outline-none"
      />
    </div>
  )
}
