import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'
import { formatINR } from '../../lib/format'

function Stat({ label, value, to }) {
  const body = (
    <>
      <p className="text-3xl font-bold text-ink">{value ?? 0}</p>
      <p className="mt-1 text-sm text-body">{label}</p>
    </>
  )
  const base = 'rounded-card border border-line bg-surface p-5 shadow-card'
  return to ? (
    <Link to={to} className={cn(base, 'block hover:border-primary')}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  )
}

const AdminDashboard = () => {
  const [cars, setCars] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [carRes, statsRes] = await Promise.all([api.get('/admin/cars'), api.get('/admin/stats')])
      setCars(Array.isArray(carRes.data) ? carRes.data : [])
      setStats(statsRes.data)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const retry = () => {
    setError(false)
    setLoading(true)
    fetchData()
  }

  const toggleAvailability = async (car) => {
    setTogglingId(car.id)
    try {
      await api.put(`/admin/car/${car.id}`, { ...car, available: !car.available })
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, available: !car.available } : c)))
      toast.success(`${car.brand} ${car.model} is now ${car.available ? 'unavailable' : 'available'}.`)
    } catch {
      toast.error('Could not update this car. Try again.')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/car/${deleteTarget.id}`)
      toast.success('Car deleted.')
      setDeleteTarget(null)
      fetchData()
    } catch {
      toast.error('This car could not be deleted. If it has bookings, mark it unavailable instead.')
    } finally {
      setDeleting(false)
    }
  }

  const availableCount = cars.filter((c) => c.available).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fleet</h1>
          <p className="mt-1 text-body">Manage the cars customers can request.</p>
        </div>
        <Link to="/admin/add-car" className={buttonStyles()}>
          Add car
        </Link>
      </div>

      {loading ? (
        <div role="status" className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-card bg-line" />
            ))}
          </div>
          <div className="mt-8 h-64 animate-pulse rounded-card bg-line" />
          <span className="sr-only">Loading fleet</span>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center">
          <p className="font-semibold text-ink">The fleet could not be loaded.</p>
          <p className="mt-1 text-sm text-body">Check that the backend is running and try again.</p>
          <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
            Try again
          </button>
        </div>
      ) : (
        <>
          {stats && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="Cars in fleet" value={stats.totalCars} />
              <Stat label="Available now" value={availableCount} />
              <Stat
                label={stats.pendingBookings > 0 ? 'Pending requests, review now' : 'Pending requests'}
                value={stats.pendingBookings}
                to={stats.pendingBookings > 0 ? '/admin/bookings' : undefined}
              />
              <Stat label="Approved bookings" value={stats.approvedBookings} />
              <Stat label="Total bookings" value={stats.totalBookings} />
              <Stat label="Registered users" value={stats.totalUsers} />
            </div>
          )}

          <div className="mt-8 overflow-x-auto rounded-card border border-line bg-surface shadow-card">
            {cars.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-semibold text-ink">No cars yet.</p>
                <p className="mt-1 text-sm text-body">Add the first car to the fleet.</p>
                <Link to="/admin/add-car" className={buttonStyles({ className: 'mt-4' })}>
                  Add car
                </Link>
              </div>
            ) : (
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-line bg-page text-xs uppercase tracking-wide text-body">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Car</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Price per day</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">
                          {car.brand} {car.model}
                        </p>
                        <p className="text-body">
                          {[car.year, car.transmission, car.fuelType].filter(Boolean).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-body">{car.category || 'Not set'}</td>
                      <td className="px-4 py-3 font-medium text-ink">{formatINR(car.pricePerDay)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-badge px-2 py-0.5 text-xs font-semibold',
                            car.available ? 'bg-success-soft text-success' : 'bg-danger-soft text-red-700',
                          )}
                        >
                          {car.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/admin/car/${car.id}`}
                            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleAvailability(car)}
                            disabled={togglingId === car.id}
                            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                          >
                            {car.available ? 'Make unavailable' : 'Make available'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(car)}
                            className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'text-danger' })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this car?"
        description={
          deleteTarget
            ? `${deleteTarget.brand} ${deleteTarget.model} will be removed from the fleet. If it has bookings, mark it unavailable instead.`
            : ''
        }
        confirmLabel="Delete car"
        variant="danger"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default AdminDashboard