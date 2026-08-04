import { ProjectCard } from './ProjectCard'

import { Reveal } from '@/components/common/Reveal'
import { EmptyState, ErrorState, SkeletonCard } from '@/components/common/States'
import { useProjects } from '@/hooks/useProjects'

export function ProjectGrid() {
  const { data, isPending, isError } = useProjects()

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState>Couldn&apos;t load projects right now — please try again shortly.</ErrorState>
  }

  if (data.items.length === 0) {
    return <EmptyState>No published projects yet. Check back soon.</EmptyState>
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.items.map((project, index) => (
        <li key={project.id} className="h-full">
          <Reveal delay={index * 0.06} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
