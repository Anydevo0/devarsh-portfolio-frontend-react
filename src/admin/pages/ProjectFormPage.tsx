import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'

import { ImageGalleryField } from '@/admin/components/ImageGalleryField'
import { TagChipInput } from '@/admin/components/TagChipInput'
import { useAdminProject } from '@/admin/hooks/useAdminProject'
import { useCreateProject, useUpdateProject } from '@/admin/hooks/useProjectMutations'
import { ApiError } from '@/lib/apiClient'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200),
  slug: z
    .string()
    .max(220)
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers, and hyphens only.'),
  short_description: z.string().min(1, 'Short description is required.').max(300),
  description: z.string().min(1, 'Description is required.'),
  tech_stack: z.array(z.string()),
  repo_url: z.string().max(500),
  live_demo_url: z.string().max(500),
  image_urls: z.array(z.string()),
  is_featured: z.boolean(),
  display_order: z.coerce.number().int(),
  is_published: z.boolean(),
})

// react-hook-form's typed useForm needs the pre-coercion ("input") shape for
// TFieldValues and the post-coercion ("output") shape for the handleSubmit
// callback — z.coerce.number() means these two differ for display_order.
type ProjectFormInput = z.input<typeof projectSchema>
type ProjectFormOutput = z.output<typeof projectSchema>

const emptyValues: ProjectFormInput = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  tech_stack: [],
  repo_url: '',
  live_demo_url: '',
  image_urls: [],
  is_featured: false,
  display_order: 0,
  is_published: false,
}

const inputClass =
  'mt-1 w-full rounded border border-line px-3 py-2 text-sm focus-visible:border-wire focus-visible:outline-none'

export function ProjectFormPage() {
  const { id } = useParams()
  const isEditing = id !== undefined
  const navigate = useNavigate()

  const { data: existing, isLoading } = useAdminProject(isEditing ? Number(id) : undefined)
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const mutation = isEditing ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormInput, unknown, ProjectFormOutput>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!existing) return
    reset({
      title: existing.title,
      slug: existing.slug,
      short_description: existing.short_description,
      description: existing.description,
      tech_stack: existing.tech_stack,
      repo_url: existing.repo_url ?? '',
      live_demo_url: existing.live_demo_url ?? '',
      image_urls: existing.image_urls,
      is_featured: existing.is_featured,
      display_order: existing.display_order,
      is_published: existing.is_published,
    })
  }, [existing, reset])

  function onSubmit(values: ProjectFormOutput) {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      repo_url: values.repo_url || null,
      live_demo_url: values.live_demo_url || null,
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: Number(id), payload },
        { onSuccess: () => navigate('/admin/projects') },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/admin/projects') })
    }
  }

  if (isEditing && isLoading) {
    return <p className="font-mono text-sm text-mute">Loading…</p>
  }

  const apiError = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">
        {isEditing ? 'Edit project' : 'New project'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex max-w-2xl flex-col gap-5">
        <div>
          <label htmlFor="project-title" className="text-sm font-medium">
            Title
          </label>
          <input id="project-title" {...register('title')} className={inputClass} />
          {errors.title && <p className="mt-1 text-sm text-signal">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="project-slug" className="text-sm font-medium">
            Slug (leave blank to auto-generate)
          </label>
          <input id="project-slug" {...register('slug')} className={inputClass} />
          {errors.slug && <p className="mt-1 text-sm text-signal">{errors.slug.message}</p>}
        </div>

        <div>
          <label htmlFor="project-short-description" className="text-sm font-medium">
            Short description
          </label>
          <input
            id="project-short-description"
            {...register('short_description')}
            className={inputClass}
          />
          {errors.short_description && (
            <p className="mt-1 text-sm text-signal">{errors.short_description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="project-description" className="text-sm font-medium">
            Description (Markdown)
          </label>
          <textarea
            id="project-description"
            rows={8}
            {...register('description')}
            className={inputClass}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-signal">{errors.description.message}</p>
          )}
        </div>

        <div>
          <span className="text-sm font-medium">Tech stack</span>
          <Controller
            control={control}
            name="tech_stack"
            render={({ field }) => (
              <div className="mt-1">
                <TagChipInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Add a technology…"
                />
              </div>
            )}
          />
        </div>

        <div>
          <label htmlFor="project-repo-url" className="text-sm font-medium">
            Repo URL
          </label>
          <input id="project-repo-url" {...register('repo_url')} className={inputClass} />
        </div>

        <div>
          <label htmlFor="project-demo-url" className="text-sm font-medium">
            Live demo URL
          </label>
          <input id="project-demo-url" {...register('live_demo_url')} className={inputClass} />
        </div>

        <div>
          <span className="text-sm font-medium">Images</span>
          <Controller
            control={control}
            name="image_urls"
            render={({ field }) => (
              <div className="mt-2">
                <ImageGalleryField
                  value={field.value}
                  onChange={field.onChange}
                  folder="projects"
                />
              </div>
            )}
          />
        </div>

        <div>
          <label htmlFor="project-display-order" className="text-sm font-medium">
            Display order
          </label>
          <input
            id="project-display-order"
            type="number"
            {...register('display_order')}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_featured')} />
          Featured
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('is_published')} />
          Published
        </label>

        {apiError && (
          <p role="alert" className="font-mono text-sm text-signal">
            {apiError.message}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="self-start rounded bg-ink px-5 py-2.5 font-mono text-sm text-paper hover:bg-ink/90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
