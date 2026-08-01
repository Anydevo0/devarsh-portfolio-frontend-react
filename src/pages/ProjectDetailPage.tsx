import { Link, useParams } from 'react-router'

import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { TechTagList } from '@/components/projects/TechTagList'
import { useProject } from '@/hooks/useProject'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: project, isPending, isError } = useProject(slug)

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-sm text-fog">Loading…</p>
      </main>
    )
  }

  if (isError || !project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-sm text-fog">
          Couldn&apos;t find that project.{' '}
          <Link to="/" className="text-pulse underline">
            Back to home
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link to="/" className="font-mono text-sm text-fog transition-colors hover:text-pulse">
        ← Back
      </Link>
      <h1 className="mt-5 font-tech text-4xl font-bold text-mist sm:text-5xl">{project.title}</h1>
      <div className="mt-4">
        <TechTagList tags={project.tech_stack} />
      </div>
      {project.image_urls.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.image_urls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`${project.title} screenshot ${index + 1}`}
              className="aspect-video w-full rounded-2xl border border-edge object-cover"
            />
          ))}
        </div>
      )}
      <div className="mt-8">
        <MarkdownRenderer content={project.description} className="prose prose-tech" />
      </div>
      <div className="mt-8 flex gap-4 font-mono text-sm">
        {project.live_demo_url && (
          <a
            href={project.live_demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pulse underline"
          >
            Live demo
          </a>
        )}
        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pulse underline"
          >
            Source
          </a>
        )}
      </div>
    </main>
  )
}
