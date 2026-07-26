import { useProjects } from '@/hooks/useProjects'

import { ProjectCard } from './ProjectCard'

export function ProjectGrid() {
  const { data, isPending, isError } = useProjects()

  if (isPending) {
    return <p className="font-mono text-sm text-mute">Loading projects…</p>
  }

  if (isError) {
    return (
      <p className="font-mono text-sm text-mute">
        Couldn&apos;t load projects right now — please try again shortly.
      </p>
    )
  }

  if (data.items.length === 0) {
    return (
      <p className="font-mono text-sm text-mute">
        // no published projects yet — check back soon.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {data.items.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
