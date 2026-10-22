import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api'
import CarForm from '../../components/CarForm'
import { buttonStyles } from '../../lib/buttonStyles'
import { errorMessage } from '../../lib/errors'

const UpdateCar = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    let active = true
    api
      .get(`/admin/car/${id}`)
      .then((res) => {
        if (active) setCar(res.data)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
    return () => {
      active = false
    }
  }, [id, attempt])

  const retry = () => {
    setLoadError(false)
    setAttempt((n) => n + 1)
  }

  const handleSubmit = async (payload) => {
    setBusy(true)
    setServerError('')
    try {
      // Keep the fields the form does not edit (id, availability) from the loaded car.
      await api.put(`/admin/car/${id}`, { ...car, ...payload })
      toast.success('Car updated.')
      navigate('/admin/dashboard')
    } catch (err) {
      setServerError(errorMessage(err, 'Could not update the car. Check the details and try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Edit car</h1>

      {loadError ? (
        <div className="mt-6 rounded-card border border-line bg-surface p-8 text-center">
          <p className="font-semibold text-ink">This car could not be loaded.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button type="button" onClick={retry} className={buttonStyles()}>
              Try again
            </button>
            <Link to="/admin/dashboard" className={buttonStyles({ variant: 'secondary' })}>
              Back to fleet
            </Link>
          </div>
        </div>
      ) : !car ? (
        <div role="status" className="mt-6 h-96 animate-pulse rounded-card bg-line">
          <span className="sr-only">Loading car</span>
        </div>
      ) : (
        <div className="mt-6 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <CarForm
            key={car.id}
            initial={car}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            busy={busy}
            serverError={serverError}
          />
        </div>
      )}
    </div>
  )
}

export default UpdateCar