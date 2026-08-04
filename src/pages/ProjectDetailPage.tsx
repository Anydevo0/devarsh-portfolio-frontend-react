import { Link, useParams } from 'react-router'

import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { ErrorState, SkeletonRow } from '@/components/common/States'
import { ArrowIcon, ExternalIcon, GitHubIcon } from '@/components/common/icons'
import { TechTagList } from '@/components/projects/TechTagList'
import { useProject } from '@/hooks/useProject'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: project, isPending, isError } = useProject(slug)

  if (isPending) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <SkeletonRow />
      </main>
    )
  }

  if (isError || !project) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20">
        <ErrorState>
          That project doesn&apos;t exist or has been unpublished.{' '}
          <Link to="/#projects" className="text-pulse underline">
            Back to all work
          </Link>
          .
        </ErrorState>
      </main>
    )
  }

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28">
      <div className="aurora aurora--pulse animate-drift-one" aria-hidden="true" />

      <Link
        to="/#projects"
        className="text-fog hover:text-pulse group relative inline-flex items-center gap-2 font-mono text-sm transition-colors"
      >
        <ArrowIcon className="size-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
        All work
      </Link>

      <header className="relative mt-8">
        <h1 className="font-tech text-section text-lit font-bold tracking-[-0.03em] text-balance">
          {project.title}
        </h1>
        <p className="text-fog text-lede mt-5 max-w-2xl">{project.short_description}</p>

        <div className="mt-6">
          <TechTagList tags={project.tech_stack} />
        </div>

        {(project.repo_url ?? project.live_demo_url) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pulse text-void inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-sm transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <ExternalIcon className="size-4" />
                Live demo
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass text-mist hover:text-pulse inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-sm transition-colors"
              >
                <GitHubIcon className="size-4" />
                Source
              </a>
            )}
          </div>
        )}
      </header>

      {project.image_urls.length > 0 && (
        <div className="relative mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.image_urls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`${project.title} screenshot ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              // A single screenshot gets the full width rather than being stranded
              // in a half-empty two-column row.
              className={`border-edge aspect-video w-full rounded-2xl border object-cover ${
                project.image_urls.length === 1 ? 'sm:col-span-2' : ''
              }`}
            />
          ))}
        </div>
      )}

      <hr className="hairline relative mt-12 border-0" />

      <div className="relative mt-10">
        <MarkdownRenderer content={project.description} className="prose prose-tech max-w-none" />
      </div>
    </main>
  )
}
