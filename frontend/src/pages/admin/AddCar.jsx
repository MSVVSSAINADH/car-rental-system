import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api'
import CarForm from '../../components/CarForm'
import { errorMessage } from '../../lib/errors'

const AddCar = () => {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleSubmit = async (payload) => {
    setBusy(true)
    setServerError('')
    try {
      await api.post('/admin/car', payload)
      toast.success('Car added.')
      navigate('/admin/dashboard')
    } catch (err) {
      setServerError(errorMessage(err, 'Could not add the car. Check the details and try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Add a car</h1>
      <p className="mt-1 text-body">New cars appear on the public fleet page.</p>
      <div className="mt-6 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <CarForm onSubmit={handleSubmit} submitLabel="Add car" busy={busy} serverError={serverError} />
      </div>
    </div>
  )
}

export default AddCar