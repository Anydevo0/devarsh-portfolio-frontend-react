import {
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type ReactNode,
} from 'react'

import { uploadImage } from '@/admin/api/uploads'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function MarkdownEditor({ value, onChange, label }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  function applyWrap(before: string, after: string = before) {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart, selectionEnd } = textarea
    const selected = value.slice(selectionStart, selectionEnd)
    const next =
      value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd)
    onChange(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(
        selectionStart + before.length,
        selectionStart + before.length + selected.length,
      )
    })
  }

  function applyLinePrefix(prefix: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart, selectionEnd } = textarea
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const nextNewline = value.indexOf('\n', selectionEnd)
    const lineEnd = nextNewline === -1 ? value.length : nextNewline
    const block = value.slice(lineStart, lineEnd)
    const prefixed = block
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n')
    const next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd)
    onChange(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(lineStart, lineStart + prefixed.length)
    })
  }

  // Handles the toolbar button (one file), drag-and-drop, and clipboard paste
  // (all three can hand it one or more files) with a single sequential upload
  // path — sequential rather than parallel so each insertion's cursor position
  // is based on the previous one, not a stale snapshot from before any of them
  // had finished uploading.
  async function handleImageFiles(files: File[]) {
    if (files.length === 0) return
    setImageError(null)
    const textarea = textareaRef.current
    let cursor = textarea ? textarea.selectionStart : value.length
    let content = value

    for (const file of files) {
      try {
        const url = await uploadImage(file, 'blog')
        const insertion = `![${file.name}](${url})\n`
        content = content.slice(0, cursor) + insertion + content.slice(cursor)
        cursor += insertion.length
        onChange(content)
      } catch {
        setImageError('Image upload failed. Please try again.')
      }
    }

    requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(cursor, cursor)
    })
  }

  function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/'),
    )
    if (files.length === 0) return
    event.preventDefault()
    handleImageFiles(files)
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file) => file !== null)
    if (files.length === 0) return
    event.preventDefault()
    handleImageFiles(files)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t border border-b-0 border-line bg-line/10 p-1">
        <ToolbarButton label="Bold" onClick={() => applyWrap('**')}>
          B
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => applyWrap('_')}>
          I
        </ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => applyLinePrefix('## ')}>
          H
        </ToolbarButton>
        <ToolbarButton label="Bulleted list" onClick={() => applyLinePrefix('- ')}>
          List
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={() => applyWrap('[', '](https://)')}>
          Link
        </ToolbarButton>
        <ToolbarButton label="Inline code" onClick={() => applyWrap('`')}>
          Code
        </ToolbarButton>
        <ToolbarButton label="Code block" onClick={() => applyWrap('```\n', '\n```')}>
          Block
        </ToolbarButton>
        <ToolbarButton label="Blockquote" onClick={() => applyLinePrefix('> ')}>
          Quote
        </ToolbarButton>
        <ToolbarButton label="Insert image" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon />
          Image
        </ToolbarButton>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ''
          if (files.length > 0) handleImageFiles(files)
        }}
      />
      <p className="mt-1 font-mono text-xs text-mute">
        Drag and drop or paste an image to insert it — a screenshot or architecture diagram
        works too.
      </p>
      {imageError && <p className="mt-1 font-mono text-xs text-signal">{imageError}</p>}
      <div className="mt-1 grid grid-cols-1 overflow-hidden rounded-b border border-line lg:grid-cols-2">
        <textarea
          ref={textareaRef}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onPaste={handlePaste}
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={16}
          className="w-full resize-none border-0 px-3 py-2 font-mono text-sm outline-none"
        />
        <div className="overflow-y-auto border-t border-line px-3 py-2 lg:border-t-0 lg:border-l">
          <MarkdownRenderer
            content={value || '*Nothing to preview yet.*'}
            className="prose prose-sm max-w-none"
          />
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center gap-1 rounded px-2 py-1 font-mono text-xs text-mute hover:bg-line/40 hover:text-ink"
    >
      {children}
    </button>
  )
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-3.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-5-5L5 21" />
    </svg>
  )
}
