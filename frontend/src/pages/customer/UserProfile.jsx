import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api'
import { mergeProfileIntoSession, readSession, saveSession } from '../../services/session'
import { buttonStyles } from '../../lib/buttonStyles'

const MAX_BYTES = 500000

const inputClass =
  'w-full rounded-control border border-line bg-surface px-3 py-2 text-ink hover:border-body'

function readImage(file, onLoad) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('Please choose an image file.')
    return
  }
  if (file.size > MAX_BYTES) {
    toast.error('The image is too large. Please choose one under 500 KB.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result)
  reader.readAsDataURL(file)
}

const UserProfile = () => {
  const navigate = useNavigate()
  const avatarInput = useRef(null)
  const licenceInput = useRef(null)

  const [user, setUser] = useState({ name: '', email: '', licenseUrl: '', avatarUrl: '' })
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = readSession()
    if (!stored?.id) {
      navigate('/login')
      return undefined
    }
    let active = true
    api
      .get(`/customer/profile/${stored.id}`)
      .then((response) => {
        if (!active) return
        const profile = response.data
        setUser(profile)
        setPreviewUrl(profile.licenseImage || profile.licenseUrl || '')
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [navigate, attempt])

  const retry = () => {
    setLoadError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  const handleLicenceChange = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    readImage(file, (data) => {
      setPreviewUrl(data)
      setUser((prev) => ({ ...prev, licenseImage: data }))
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    readImage(file, (data) => setUser((prev) => ({ ...prev, profileImage: data })))
  }

  const removeLicence = () => {
    setPreviewUrl('')
    setUser((prev) => ({ ...prev, licenseImage: '' }))
  }

  const handleSave = async () => {
    if (!user.name?.trim()) {
      toast.error('Please enter your name.')
      return
    }
    setSaving(true)
    try {
      await api.put('/customer/profile', user)
      // The profile response has no JWT, so the merge keeps the stored token.
      saveSession(mergeProfileIntoSession(readSession(), user))
      toast.success('Profile updated.')
    } catch {
      toast.error('Could not update your profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6" role="status">
        <div className="h-96 animate-pulse rounded-card bg-line" />
        <span className="sr-only">Loading profile</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-card border border-line bg-surface p-8 text-center">
          <p className="font-semibold text-ink">Your profile could not be loaded.</p>
          <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const avatarSrc = user.profileImage || user.avatarUrl
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">My profile</h1>

      <div className="mt-6 space-y-6">
        <section className="rounded-card border border-line bg-surface p-6 shadow-card" aria-labelledby="details">
          <h2 id="details" className="text-lg font-semibold">
            Your details
          </h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-primary-soft text-2xl font-bold text-primary">
              {avatarSrc ? <img src={avatarSrc} alt="Your profile" className="h-full w-full object-cover" /> : initial}
            </div>
            <div>
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              >
                {avatarSrc ? 'Change photo' : 'Add photo'}
              </button>
              <p className="mt-1 text-sm text-body">Image under 500 KB.</p>
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                className={inputClass}
                value={user.name || ''}
                onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-ink">
                Email address
              </label>
              <input
                id="profile-email"
                type="email"
                className={`${inputClass} bg-page text-body`}
                value={user.email || ''}
                readOnly
              />
            </div>
          </div>
        </section>

        <section className="rounded-card border border-line bg-surface p-6 shadow-card" aria-labelledby="licence">
          <h2 id="licence" className="text-lg font-semibold">
            Driving licence
          </h2>
          <p className="mt-1 text-sm text-body">
            Needed for self-drive bookings. Image under 500 KB. See our{' '}
            <Link to="/privacy" className="font-medium text-primary hover:underline">
              privacy policy
            </Link>{' '}
            for how it is used.
          </p>

          <div className="mt-4">
            {previewUrl ? (
              <div>
                <img
                  src={previewUrl}
                  alt="Your driving licence"
                  className="max-h-56 w-full rounded-card border border-line object-contain"
                />
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => licenceInput.current?.click()}
                    className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                  >
                    Replace
                  </button>
                  <button type="button" onClick={removeLicence} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => licenceInput.current?.click()}
                className="w-full rounded-card border border-dashed border-body p-8 text-center text-body hover:border-primary hover:text-primary"
              >
                Choose a licence image
              </button>
            )}
            <input ref={licenceInput} type="file" accept="image/*" className="hidden" onChange={handleLicenceChange} />
          </div>
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={buttonStyles({ size: 'lg', className: 'w-full' })}
        >
          {saving ? 'Saving' : 'Save profile'}
        </button>
      </div>
    </div>
  )
}

export default UserProfile