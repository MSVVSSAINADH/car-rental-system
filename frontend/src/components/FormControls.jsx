import { cn } from '../lib/utils'
import { inputClass } from './FormField'

const describedBy = (id, hint, error) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

function Field({ id, label, hint, error, className, children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-body">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectField({ id, label, hint, error, className, children, ...props }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputClass, error ? 'border-danger' : 'border-line')}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}

export function TextAreaField({ id, label, hint, error, className, ...props }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(inputClass, error ? 'border-danger' : 'border-line')}
        {...props}
      />
    </Field>
  )
}