import { useId, useState } from 'react'

import { uploadImage } from '@/admin/api/uploads'

interface PendingUpload {
  id: string
  file: File
  status: 'uploading' | 'error'
  error?: string
}

interface ImageGalleryFieldProps {
  value: string[]
  onChange: (urls: string[]) => void
  folder: 'projects' | 'blog'
}

export function ImageGalleryField({ value, onChange, folder }: ImageGalleryFieldProps) {
  const [pending, setPending] = useState<PendingUpload[]>([])
  const inputId = useId()

  function runUpload(id: string, file: File) {
    uploadImage(file, folder)
      .then((url) => {
        setPending((prev) => prev.filter((item) => item.id !== id))
        onChange([...value, url])
      })
      .catch(() => {
        setPending((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: 'error', error: 'Upload failed.' } : item,
          ),
        )
      })
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`
      setPending((prev) => [...prev, { id, file, status: 'uploading' }])
      runUpload(id, file)
    }
  }

  function retry(item: PendingUpload) {
    setPending((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: 'uploading', error: undefined } : p)),
    )
    runUpload(item.id, item.file)
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((item) => item.id !== id))
  }

  function removeUploaded(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const current = value[index]
    const swapped = value[target]
    if (current === undefined || swapped === undefined) return
    const next = [...value]
    next[index] = swapped
    next[target] = current
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, index) => (
          <div key={url} className="overflow-hidden rounded border border-line">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="aspect-video w-full object-cover"
            />
            <div className="flex items-center justify-between gap-1 px-2 py-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move image earlier"
                  className="text-xs text-mute hover:text-wire disabled:opacity-30"
                >
                  &#8593;
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Move image later"
                  className="text-xs text-mute hover:text-wire disabled:opacity-30"
                >
                  &#8595;
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeUploaded(index)}
                className="font-mono text-xs text-signal hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {pending.map((item) => (
          <div
            key={item.id}
            className="flex aspect-video flex-col items-center justify-center gap-2 rounded border border-dashed border-line px-2 text-center"
          >
            {item.status === 'uploading' ? (
              <p className="font-mono text-xs text-mute">Uploading…</p>
            ) : (
              <>
                <p className="font-mono text-xs text-signal">{item.error}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => retry(item)}
                    className="font-mono text-xs text-wire hover:underline"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => removePending(item.id)}
                    className="font-mono text-xs text-mute hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <label
        htmlFor={inputId}
        className="mt-3 inline-block cursor-pointer rounded border border-line px-3 py-2 font-mono text-sm text-mute hover:text-wire"
      >
        + Add images
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          handleFilesSelected(event.target.files)
          event.target.value = ''
        }}
        className="sr-only"
      />
    </div>
  )
}
