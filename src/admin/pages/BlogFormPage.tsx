import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'

import { ImageUploadField } from '@/admin/components/ImageUploadField'
import { MarkdownEditor } from '@/admin/components/MarkdownEditor'
import { TagChipInput } from '@/admin/components/TagChipInput'
import { useAdminBlogPost } from '@/admin/hooks/useAdminBlogPost'
import { useCreateBlogPost, useUpdateBlogPost } from '@/admin/hooks/useBlogPostMutations'
import { ApiError } from '@/lib/apiClient'

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200),
  slug: z
    .string()
    .max(220)
    .regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers, and hyphens only.'),
  excerpt: z.string().max(300),
  content: z.string().min(1, 'Content is required.'),
  cover_image_url: z.string().nullable(),
  tags: z.array(z.string()),
  is_published: z.boolean(),
})

type BlogPostFormValues = z.infer<typeof blogPostSchema>

const emptyValues: BlogPostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: null,
  tags: [],
  is_published: false,
}

const inputClass =
  'mt-1 w-full rounded border border-line px-3 py-2 text-sm focus-visible:border-wire focus-visible:outline-none'

export function BlogFormPage() {
  const { id } = useParams()
  const isEditing = id !== undefined
  const navigate = useNavigate()

  const { data: existing, isLoading } = useAdminBlogPost(isEditing ? Number(id) : undefined)
  const createMutation = useCreateBlogPost()
  const updateMutation = useUpdateBlogPost()
  const mutation = isEditing ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!existing) return
    reset({
      title: existing.title,
      slug: existing.slug,
      excerpt: existing.excerpt ?? '',
      content: existing.content,
      cover_image_url: existing.cover_image_url,
      tags: existing.tags,
      is_published: existing.is_published,
    })
  }, [existing, reset])

  function onSubmit(values: BlogPostFormValues) {
    const payload = {
      ...values,
      slug: values.slug || undefined,
      excerpt: values.excerpt || null,
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: Number(id), payload },
        { onSuccess: () => navigate('/admin/blog') },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/admin/blog') })
    }
  }

  if (isEditing && isLoading) {
    return <p className="font-mono text-sm text-mute">Loading…</p>
  }

  const apiError = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{isEditing ? 'Edit post' : 'New post'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex max-w-3xl flex-col gap-5">
        <div>
          <label htmlFor="post-title" className="text-sm font-medium">
            Title
          </label>
          <input id="post-title" {...register('title')} className={inputClass} />
          {errors.title && <p className="mt-1 text-sm text-signal">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="post-slug" className="text-sm font-medium">
            Slug (leave blank to auto-generate)
          </label>
          <input id="post-slug" {...register('slug')} className={inputClass} />
          {errors.slug && <p className="mt-1 text-sm text-signal">{errors.slug.message}</p>}
        </div>

        <div>
          <label htmlFor="post-excerpt" className="text-sm font-medium">
            Excerpt
          </label>
          <input id="post-excerpt" {...register('excerpt')} className={inputClass} />
        </div>

        <div>
          <span className="text-sm font-medium">Cover image</span>
          <Controller
            control={control}
            name="cover_image_url"
            render={({ field }) => (
              <ImageUploadField value={field.value} onChange={field.onChange} folder="blog" />
            )}
          />
        </div>

        <div>
          <span className="text-sm font-medium">Tags</span>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <div className="mt-1">
                <TagChipInput value={field.value} onChange={field.onChange} placeholder="Add a tag…" />
              </div>
            )}
          />
        </div>

        <div>
          <span className="text-sm font-medium">Content (Markdown)</span>
          <div className="mt-1">
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  label="Content (Markdown)"
                />
              )}
            />
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-signal">{errors.content.message}</p>
          )}
        </div>

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
