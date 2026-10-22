import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FormField from './FormField'

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <FormField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-control text-body hover:text-ink"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    />
  )
}