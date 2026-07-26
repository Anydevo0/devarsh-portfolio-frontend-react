import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      className="rounded-lg border border-line bg-paper p-6 backdrop:bg-ink/40"
    >
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-mute">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-line px-4 py-2 font-mono text-sm hover:bg-line/20"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-signal px-4 py-2 font-mono text-sm text-paper hover:bg-signal/90"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
