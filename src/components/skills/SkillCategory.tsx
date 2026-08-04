interface SkillCategoryProps {
  title: string
  skills: string[]
  /** Tailwind background class for the accent dot; position in the grid, not a rank. */
  accent: string
}

/**
 * One cell of the skills grid. Cells sit on a 1px grid gap over an edge-coloured
 * background, so the rules between them are the grid's own gaps rather than borders —
 * which gives this section a spec-sheet feel, distinct from the glass cards used
 * everywhere else on the page.
 */
export function SkillCategory({ title, skills, accent }: SkillCategoryProps) {
  return (
    <div className="bg-abyss/80 p-7 backdrop-blur-sm sm:p-8">
      <h3 className="text-fog flex items-center gap-2.5 font-mono text-xs tracking-[0.16em] uppercase">
        <span className={`size-1.5 rounded-full ${accent}`} aria-hidden="true" />
        {title}
      </h3>
      <ul className="mt-5 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="border-edge bg-void/40 text-mist/85 hover:border-pulse/40 hover:text-pulse rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
