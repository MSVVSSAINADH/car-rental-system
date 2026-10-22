import { cn } from '../lib/utils'

export const inputClass =
  'w-full rounded-control border bg-surface px-3 py-2.5 text-ink placeholder:text-muted hover:border-body'

export default function FormField({ id, label, hint, error, trailing, className, ...inputProps }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, error ? 'border-danger' : 'border-line', trailing && 'pr-11')}
          {...inputProps}
        />
        {trailing}
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-body">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}