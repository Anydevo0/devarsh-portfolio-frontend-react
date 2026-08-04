interface TechChipsProps {
  tags: string[]
  /** Chips beyond this are collapsed into a "+n" counter so cards stay the same height. */
  max?: number
}

/**
 * Stack tags as chips, for cards.
 *
 * Deliberately a different treatment from `TechTagList`, which sets the same data as
 * a dense monospace run for the project detail page. A card needs its tags scannable
 * at a glance and capped so a project with twelve technologies does not stretch the
 * grid row; a detail page has room to list all of them inline.
 */
export function TechChips({ tags, max = 4 }: TechChipsProps) {
  if (tags.length === 0) return null

  const shown = tags.slice(0, max)
  const overflow = tags.length - shown.length

  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((tag) => (
        <li
          key={tag}
          className="border-edge bg-void/50 text-fog/90 rounded-md border px-2 py-1 font-mono text-[0.6875rem]"
        >
          {tag}
        </li>
      ))}
      {overflow > 0 && (
        <li className="text-fog/70 px-2 py-1 font-mono text-[0.6875rem]">+{overflow}</li>
      )}
    </ul>
  )
}
