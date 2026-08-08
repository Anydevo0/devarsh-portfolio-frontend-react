import { Link } from 'react-router'

import { TechChips } from './TechChips'

import { ArrowIcon, ExternalIcon, GitHubIcon } from '@/components/common/icons'
import type { ProjectRead } from '@/types/api'

interface ProjectCardProps {
  project: ProjectRead
}

/**
 * A project card.
 *
 * The whole card is one click target for the project page, using a stretched
 * pseudo-element on the title link rather than wrapping the card in an anchor. That
 * keeps exactly one link in the tab order for the card itself, while the repo and
 * demo links stay real, separately-focusable anchors layered above it — nesting them
 * inside a card-wide anchor would be invalid and unusable by keyboard.
 *
 * `image_urls` already supports a full gallery — the project page renders every one
 * of them — but the grid only ever needs a single representative shot per card. A
 * "+N more" badge is the whole gallery affordance here; the actual browsing happens
 * on the project page this card links to, which already lays every screenshot out.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const thumbnail = project.image_urls[0]
  const extraShots = project.image_urls.length - 1

  return (
    <article className="glass sheen group relative flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-500 hover:-translate-y-1.5">
      <div className="bg-abyss relative aspect-video w-full shrink-0 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <PlaceholderArt title={project.title} />
        )}
        {/* Grades the image into the card body so the two do not meet on a hard seam. */}
        <div
          className="from-panel/95 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
          aria-hidden="true"
        />
        {project.is_featured && (
          <span className="glass-soft text-beam absolute top-3 left-3 rounded-full px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
            Featured
          </span>
        )}
        {/* The card only ever shows the first screenshot; this is the one hint that
            there's more to see before a visitor commits to opening the project. Only
            appears past one image — a badge that always reads "+0 more" would be
            noise on every card that has nothing further to show. */}
        {extraShots > 0 && (
          <span className="glass-soft text-mist/90 absolute top-3 right-3 rounded-full px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
            +{extraShots} more
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="font-tech text-mist group-hover:text-pulse text-xl font-semibold tracking-tight transition-colors">
          <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>

        {/* `line-clamp` needs `display: -webkit-box`, which `flex-1` on the same
            element overrides — the clamp then silently stops working and cards go
            ragged. The paragraph clamps; a wrapper below takes the free space. */}
        <p className="text-fog line-clamp-3 text-sm leading-7">{project.short_description}</p>

        <div className="mt-auto flex flex-col gap-4">
          <TechChips tags={project.tech_stack} />

          <div className="border-edge/70 relative z-10 flex items-center gap-4 border-t pt-4">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fog hover:text-mist inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
              >
                <GitHubIcon className="size-3.5" />
                Source
              </a>
            )}
            {project.live_demo_url && (
              <a
                href={project.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fog hover:text-beam inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
              >
                <ExternalIcon className="size-3.5" />
                Live demo
              </a>
            )}
            <span
              className="text-fog/60 group-hover:text-pulse ml-auto transition-all duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <ArrowIcon className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Stand-in for a project with no screenshot. Derived from the title so each project
 * gets a stable, distinct tint instead of every image-less card looking identical.
 *
 * The hue is confined to 195°–290° — cyan through blue to violet, the site's own
 * accent band. An unconstrained 0–360 range is what a hash wants to produce, but it
 * puts olives and ambers into a palette that has no warm colours in it anywhere else.
 */
function PlaceholderArt({ title }: { title: string }) {
  const hash = [...title].reduce((total, character) => total + character.charCodeAt(0), 0)
  const hue = 195 + (hash % 95)

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `radial-gradient(120% 120% at 20% 10%, hsl(${hue} 62% 24%), transparent 62%), linear-gradient(140deg, #0b1220, #111827)`,
      }}
      aria-hidden="true"
    >
      <span className="text-mist/25 font-mono text-3xl font-bold">
        {title.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}
