import { Link } from 'react-router'

import type { ProjectRead } from '@/types/api'

import { TechTagList } from './TechTagList'

interface ProjectCardProps {
  project: ProjectRead
}

export function ProjectCard({ project }: ProjectCardProps) {
  const thumbnail = project.image_urls[0]

  return (
    <article className="group overflow-hidden rounded-2xl border border-edge bg-panel transition-all duration-200 hover:-translate-y-1 hover:border-pulse/40">
      {thumbnail && (
        <div className="overflow-hidden">
          <img
            src={thumbnail}
            alt={project.title}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-6">
        <h3 className="font-tech text-xl font-bold text-mist">
          <Link to={`/projects/${project.slug}`} className="hover:text-pulse">
            {project.title}
          </Link>
        </h3>
        <p className="text-mist/75">{project.short_description}</p>
        <TechTagList tags={project.tech_stack} />
        <div className="mt-1 flex gap-4 font-mono text-sm">
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pulse underline"
            >
              Live
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pulse underline"
            >
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
