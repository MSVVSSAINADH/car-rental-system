import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAppConfig } from '../../services/config'
import { saveSession } from '../../services/session'
import AuthLayout from '../../components/AuthLayout'
import FormField from '../../components/FormField'
import PasswordField from '../../components/PasswordField'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'
import { errorMessage } from '../../lib/errors'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const MIN_PASSWORD = 6

const STRENGTH = [
  { label: 'Weak', bar: 'bg-danger', width: 'w-1/4' },
  { label: 'Fair', bar: 'bg-warning', width: 'w-2/4' },
  { label: 'Good', bar: 'bg-primary', width: 'w-3/4' },
  { label: 'Strong', bar: 'bg-success', width: 'w-full' },
]

function passwordStrength(password) {
  if (!password) return null
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return STRENGTH[0]
  if (score <= 2) return STRENGTH[1]
  if (score <= 3) return STRENGTH[2]
  return STRENGTH[3]
}

const Signup = () => {
  const navigate = useNavigate()
  const config = useAppConfig()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Enter your full name.'
    if (!form.email.trim()) errors.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.'
    if (!form.password) errors.password = 'Choose a password.'
    else if (form.password.length < MIN_PASSWORD) {
      errors.password = `Use at least ${MIN_PASSWORD} characters.`
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const res = await api.post('/auth/signup', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      saveSession(res.data)
      navigate('/customer/dashboard')
    } catch (err) {
      setFormError(errorMessage(err, 'Sign up failed. Check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Browse cars and send booking requests."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {config && (
        <p className="mb-5 rounded-control border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-ink">
          New customers get {config.discountPercent}% off their first {config.introBookingLimit} eligible bookings.
        </p>
      )}

      {formError && (
        <p role="alert" className="mb-5 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          id="signup-name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
        />
        <FormField
          id="signup-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <div>
          <PasswordField
            id="signup-password"
            name="password"
            label="Password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD} characters.`}
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
          />
          {strength && (
            <div className="mt-2" aria-live="polite">
              <div className="h-1.5 w-full overflow-hidden rounded-badge bg-line">
                <div className={cn('h-full rounded-badge', strength.bar, strength.width)} />
              </div>
              <p className="mt-1 text-sm text-body">Password strength: {strength.label}</p>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className={buttonStyles({ size: 'lg', className: 'w-full' })}>
          {loading ? 'Creating account' : 'Create account'}
        </button>

        <p className="text-sm text-body">
          By creating an account you agree to the{' '}
          <Link to="/terms" className="font-medium text-primary hover:underline">
            terms and conditions
          </Link>{' '}
          and the{' '}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  )
}

export default Signup