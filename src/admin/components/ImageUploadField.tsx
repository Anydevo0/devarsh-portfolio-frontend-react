import { useId, useState } from 'react'

import { uploadImage } from '@/admin/api/uploads'

interface ImageUploadFieldProps {
  value: string | null
  onChange: (url: string | null) => void
  folder: 'projects' | 'blog'
}

export function ImageUploadField({ value, onChange, folder }: ImageUploadFieldProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const inputId = useId()

  function handleFile(file: File) {
    setStatus('uploading')
    uploadImage(file, folder)
      .then((url) => {
        setStatus('idle')
        onChange(url)
      })
      .catch(() => setStatus('error'))
  }

  if (value) {
    return (
      <div className="mt-1 flex items-center gap-3">
        <img src={value} alt="Cover" className="h-16 w-28 rounded border border-line object-cover" />
        <label
          htmlFor={inputId}
          className="cursor-pointer font-mono text-xs text-wire hover:underline"
        >
          Replace
        </label>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="font-mono text-xs text-signal hover:underline"
        >
          Remove
        </button>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) handleFile(file)
          }}
        />
      </div>
    )
  }

  return (
    <div className="mt-1">
      <label
        htmlFor={inputId}
        className="inline-block cursor-pointer rounded border border-line px-3 py-2 font-mono text-sm text-mute hover:text-wire"
      >
        {status === 'uploading' ? 'Uploading…' : '+ Add cover image'}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) handleFile(file)
        }}
      />
      {status === 'error' && (
        <p className="mt-1 font-mono text-xs text-signal">Upload failed. Please try again.</p>
      )}
    </div>
  )
}
