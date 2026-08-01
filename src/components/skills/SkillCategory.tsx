interface SkillCategoryProps {
  title: string
  skills: string[]
}

export function SkillCategory({ title, skills }: SkillCategoryProps) {
  return (
    <div className="rounded-2xl border border-edge bg-panel p-5 transition-colors duration-200 hover:border-pulse/40 sm:p-6">
      <h3 className="font-mono text-xs tracking-wider text-pulse uppercase">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full border border-edge px-3 py-1 text-sm text-mist/85 transition-colors hover:border-pulse hover:text-pulse"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
