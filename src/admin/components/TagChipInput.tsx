import { type KeyboardEvent, useState } from 'react'

interface TagChipInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagChipInput({ value, onChange, placeholder }: TagChipInputProps) {
  const [draft, setDraft] = useState('')

  function commitDraft() {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-line px-3 py-2 focus-within:border-wire">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded bg-line/40 px-2 py-1 font-mono text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            className="text-mute hover:text-signal"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-[8ch] flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  )
}
