import { useEffect, useId, useRef } from 'react'
import { buttonStyles } from '../lib/buttonStyles'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'primary',
  busy = false,
  onConfirm,
  onCancel,
  children,
}) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
      className="m-auto w-[min(28rem,92vw)] rounded-card border border-line bg-surface p-0 shadow-lift backdrop:bg-ink/40"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirm()
        }}
        className="p-6"
      >
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        {description && <p className="mt-2 text-body">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={buttonStyles({ variant: 'secondary' })}
          >
            Cancel
          </button>
          <button type="submit" disabled={busy} className={buttonStyles({ variant })}>
            {busy ? 'Working' : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  )
}