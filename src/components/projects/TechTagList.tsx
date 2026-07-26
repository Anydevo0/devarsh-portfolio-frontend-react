interface TechTagListProps {
  tags: string[]
}

/** The quiet reuse of the manifest device — tech stack as a monospace tag line,
 * rather than generic rounded pill chips. */
export function TechTagList({ tags }: TechTagListProps) {
  if (tags.length === 0) return null
  return (
    <p className="flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-xs text-mute">
      <span>stack:</span>
      {tags.map((tag, index) => (
        <span key={tag} className="text-ink">
          {tag}
          {index < tags.length - 1 ? ' ·' : ''}
        </span>
      ))}
    </p>
  )
}
