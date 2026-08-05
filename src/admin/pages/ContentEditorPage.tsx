import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { TagChipInput } from '@/admin/components/TagChipInput'
import { DEFAULT_SITE_CONTENT } from '@/data/siteContent'
import {
  exportContentJson,
  hasLocalOverrides,
  resetToDefaults,
  setContent,
} from '@/lib/siteContent/store'
import { useSiteContent } from '@/lib/siteContent/useSiteContent'

const ctaSchema = z.object({
  label: z.string().min(1, 'Label is required.').max(60),
  href: z.string().min(1, 'Link is required.').max(300),
})

const highlightSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(80),
  text: z.string().min(1, 'Description is required.').max(400),
  tags: z.array(z.string()),
})

const contentSchema = z.object({
  hero: z.object({
    name: z.string().min(1, 'Name is required.').max(120),
    designation: z.string().min(1, 'Designation is required.').max(120),
    tagline: z.string().max(120),
    headline: z.string().min(1, 'Headline is required.').max(200),
    intro: z.string().min(1, 'Intro paragraph is required.').max(600),
    greeting: z.string().max(120),
    ctaPrimary: ctaSchema,
    ctaSecondary: ctaSchema,
  }),
  focus: z.object({
    eyebrow: z.string().max(120),
    intro: z.string().min(1, 'Intro paragraph is required.').max(600),
    highlights: z.array(highlightSchema).min(1, 'Add at least one highlight.'),
  }),
})

type ContentForm = z.infer<typeof contentSchema>

const inputClass =
  'mt-1 w-full rounded border border-line px-3 py-2 text-sm focus-visible:border-wire focus-visible:outline-none'
const labelClass = 'text-sm font-medium'
const errorClass = 'mt-1 text-sm text-signal'

export function ContentEditorPage() {
  const content = useSiteContent()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showExport, setShowExport] = useState(false)
  // A flag, not a timestamp — the value was never rendered, only its truthiness.
  const [isSaved, setIsSaved] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: content,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'focus.highlights' })

  function onSubmit(values: ContentForm) {
    setContent(values)
    reset(values)
    setIsSaved(true)
  }

  function handleResetConfirmed() {
    resetToDefaults()
    reset(DEFAULT_SITE_CONTENT)
    setShowResetConfirm(false)
    setIsSaved(false)
  }

  async function handleCopyExport() {
    try {
      await navigator.clipboard.writeText(exportContentJson())
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      // Clipboard API unavailable/denied — the textarea below still lets them select-all-copy.
    }
  }

  function handleDownloadExport() {
    const blob = new Blob([exportContentJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'siteContent.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Site content</h1>
      <p className="text-mute mt-2 max-w-2xl font-mono text-sm">
        // Edits save to this browser only (no backend). Saving updates the live preview instantly
        on this device; to ship the change to real visitors, use <strong>Export</strong> below and
        commit the result to{' '}
        <code className="bg-line/30 rounded px-1">src/data/siteContent.ts</code>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex max-w-2xl flex-col gap-8">
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-lg font-bold">Hero</h2>

          <div>
            <label htmlFor="hero-name" className={labelClass}>
              Name
            </label>
            <input id="hero-name" {...register('hero.name')} className={inputClass} />
            {errors.hero?.name && <p className={errorClass}>{errors.hero.name.message}</p>}
          </div>

          <div>
            <label htmlFor="hero-designation" className={labelClass}>
              Designation
            </label>
            <input id="hero-designation" {...register('hero.designation')} className={inputClass} />
            {errors.hero?.designation && (
              <p className={errorClass}>{errors.hero.designation.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="hero-tagline" className={labelClass}>
              Skills / tagline
            </label>
            <input id="hero-tagline" {...register('hero.tagline')} className={inputClass} />
          </div>

          <div>
            <label htmlFor="hero-headline" className={labelClass}>
              Main heading
            </label>
            <textarea
              id="hero-headline"
              rows={2}
              {...register('hero.headline')}
              className={inputClass}
            />
            {errors.hero?.headline && <p className={errorClass}>{errors.hero.headline.message}</p>}
          </div>

          <div>
            <label htmlFor="hero-intro" className={labelClass}>
              Intro paragraph
            </label>
            <textarea id="hero-intro" rows={4} {...register('hero.intro')} className={inputClass} />
            {errors.hero?.intro && <p className={errorClass}>{errors.hero.intro.message}</p>}
          </div>

          <div>
            <label htmlFor="hero-greeting" className={labelClass}>
              Greeting
            </label>
            <input
              id="hero-greeting"
              {...register('hero.greeting')}
              className={inputClass}
              placeholder="Leave blank to hide the greeting"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Primary CTA</span>
              <input
                {...register('hero.ctaPrimary.label')}
                placeholder="Label"
                className={inputClass}
              />
              <input
                {...register('hero.ctaPrimary.href')}
                placeholder="Link (e.g. #projects)"
                className={`${inputClass} mt-2`}
              />
            </div>
            <div>
              <span className={labelClass}>Secondary CTA</span>
              <input
                {...register('hero.ctaSecondary.label')}
                placeholder="Label"
                className={inputClass}
              />
              <input
                {...register('hero.ctaSecondary.href')}
                placeholder="Link (e.g. #contact)"
                className={`${inputClass} mt-2`}
              />
            </div>
          </div>
        </section>

        <section className="border-line flex flex-col gap-5 border-t pt-8">
          <h2 className="font-display text-lg font-bold">Professional focus</h2>

          <div>
            <label htmlFor="focus-eyebrow" className={labelClass}>
              Section eyebrow
            </label>
            <input id="focus-eyebrow" {...register('focus.eyebrow')} className={inputClass} />
          </div>

          <div>
            <label htmlFor="focus-intro" className={labelClass}>
              Section intro
            </label>
            <textarea
              id="focus-intro"
              rows={3}
              {...register('focus.intro')}
              className={inputClass}
            />
            {errors.focus?.intro && <p className={errorClass}>{errors.focus.intro.message}</p>}
          </div>

          <div className="flex flex-col gap-5">
            {fields.map((field, index) => (
              <div key={field.id} className="border-line rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-mute font-mono text-xs tracking-wide uppercase">
                    Highlight {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-signal font-mono text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3">
                  <label htmlFor={`highlight-${index}-title`} className={labelClass}>
                    Title
                  </label>
                  <input
                    id={`highlight-${index}-title`}
                    {...register(`focus.highlights.${index}.title` as const)}
                    className={inputClass}
                  />
                  {errors.focus?.highlights?.[index]?.title && (
                    <p className={errorClass}>{errors.focus.highlights[index]?.title?.message}</p>
                  )}
                </div>

                <div className="mt-3">
                  <label htmlFor={`highlight-${index}-text`} className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id={`highlight-${index}-text`}
                    rows={3}
                    {...register(`focus.highlights.${index}.text` as const)}
                    className={inputClass}
                  />
                  {errors.focus?.highlights?.[index]?.text && (
                    <p className={errorClass}>{errors.focus.highlights[index]?.text?.message}</p>
                  )}
                </div>

                <div className="mt-3">
                  <span className={labelClass}>Technologies</span>
                  <Controller
                    control={control}
                    name={`focus.highlights.${index}.tags` as const}
                    render={({ field: tagField }) => (
                      <div className="mt-1">
                        <TagChipInput
                          value={tagField.value}
                          onChange={tagField.onChange}
                          placeholder="Add a technology…"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            ))}
            {errors.focus?.highlights?.message && (
              <p className={errorClass}>{errors.focus.highlights.message}</p>
            )}

            <button
              type="button"
              onClick={() => append({ title: 'New focus area', text: '', tags: [] })}
              className="border-line hover:bg-line/20 self-start rounded border px-4 py-2 font-mono text-sm"
            >
              + Add highlight
            </button>
          </div>
        </section>

        <div className="border-line flex flex-wrap items-center gap-4 border-t pt-6">
          <button
            type="submit"
            className="bg-ink text-paper hover:bg-ink/90 rounded px-5 py-2.5 font-mono text-sm"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="border-line hover:bg-line/20 rounded border px-4 py-2 font-mono text-sm"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={() => setShowExport((prev) => !prev)}
            className="border-line hover:bg-line/20 rounded border px-4 py-2 font-mono text-sm"
          >
            {showExport ? 'Hide export' : 'Export'}
          </button>
          {isSaved && !isDirty && (
            <span className="text-wire font-mono text-xs">
              Saved — {hasLocalOverrides() ? 'preview updated on this device' : 'reset to defaults'}
            </span>
          )}
          <a
            href={import.meta.env.BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mute hover:text-wire font-mono text-xs"
          >
            View live preview →
          </a>
        </div>
      </form>

      {showExport && (
        <div className="border-line bg-line/10 mt-6 max-w-2xl rounded-lg border p-4">
          <p className="text-mute text-sm">
            Paste this into <code className="bg-line/30 rounded px-1">DEFAULT_SITE_CONTENT</code> in{' '}
            <code className="bg-line/30 rounded px-1">src/data/siteContent.ts</code>, then commit
            and redeploy so it becomes the default for every visitor.
          </p>
          <textarea
            readOnly
            rows={12}
            value={exportContentJson()}
            className="border-line bg-paper mt-3 w-full rounded border p-3 font-mono text-xs"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleCopyExport}
              className="border-line hover:bg-line/20 rounded border px-4 py-2 font-mono text-sm"
            >
              {copyStatus === 'copied' ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <button
              type="button"
              onClick={handleDownloadExport}
              className="border-line hover:bg-line/20 rounded border px-4 py-2 font-mono text-sm"
            >
              Download siteContent.json
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all content to defaults?"
        description="This discards every local edit to the hero and professional-focus sections on this device. This can't be undone."
        confirmLabel="Reset"
        onConfirm={handleResetConfirmed}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  )
}
