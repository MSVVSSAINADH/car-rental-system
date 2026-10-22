import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { saveSession } from '../../services/session'
import AuthLayout from '../../components/AuthLayout'
import FormField from '../../components/FormField'
import PasswordField from '../../components/PasswordField'
import { buttonStyles } from '../../lib/buttonStyles'
import { errorMessage } from '../../lib/errors'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}
    if (!form.email.trim()) errors.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.'
    if (!form.password) errors.password = 'Enter your password.'
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
      const res = await api.post('/auth/login', { email: form.email.trim(), password: form.password })
      saveSession(res.data)
      navigate(res.data.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard')
    } catch (err) {
      setFormError(errorMessage(err, 'Sign in failed. Check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your CarRentalX account to browse cars and track your requests."
      footer={
        <>
          New to CarRentalX?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {formError && (
        <p role="alert" className="mb-5 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />
        <button type="submit" disabled={loading} className={buttonStyles({ size: 'lg', className: 'w-full' })}>
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login