interface SkillCategoryProps {
  title: string
  skills: string[]
}

export function SkillCategory({ title, skills }: SkillCategoryProps) {
  return (
    <div className="rounded-2xl border border-line/60 bg-paper p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">

      <h3 className="font-mono text-xs tracking-wider text-mute uppercase">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-line px-3 py-1 text-sm transition-colors hover:border-wire hover:text-wire"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
