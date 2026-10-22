import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import api from '../../services/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatusBadge from '../../components/StatusBadge'
import { inputClass } from '../../components/FormField'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'
import { errorMessage } from '../../lib/errors'
import { formatDate, formatINR } from '../../lib/format'
import { BOOKINGS_CHANGED_EVENT } from '../../lib/events'

const FILTERS = [
  ['ALL', 'All'],
  ['PENDING', 'Pending'],
  ['APPROVED', 'Approved'],
  ['REJECTED', 'Rejected'],
]

const statusOf = (b) => String(b.bookingStatus || b.status || 'PENDING').toUpperCase()

// UNVERIFIED: the reject-with-reason endpoint path and body shape. See the notes
// after this file. If the endpoint is missing (404 or 405), fall back to the
// old reason-less call so rejecting still works.
async function rejectBooking(id, reason) {
  try {
    await api.post(
      `/admin/booking/${id}/reject`,
      { reason, rejectionReason: reason },
      { params: { reason } },
    )
    return true
  } catch (error) {
    const status = error.response?.status
    if (status === 404 || status === 405) {
      await api.put(`/admin/car/booking/${id}/Reject`)
      return false
    }
    throw error
  }
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('ALL')

  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    api
      .get('/admin/car/bookings')
      .then((res) => {
        if (active) setBookings(Array.isArray(res.data) ? [...res.data].sort((a, b) => b.id - a.id) : [])
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [attempt])

  const retry = () => {
    setError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  const counts = useMemo(() => {
    const result = { ALL: bookings.length, PENDING: 0, APPROVED: 0, REJECTED: 0 }
    bookings.forEach((b) => {
      const key = statusOf(b)
      if (key in result) result[key] += 1
    })
    return result
  }, [bookings])

  const visible = filter === 'ALL' ? bookings : bookings.filter((b) => statusOf(b) === filter)

  const updateBooking = (id, changes) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...changes } : b)))

  const describe = (b) => `${b.carBrand} ${b.carModel}`
  const customerOf = (b) => b.userName || b.username || 'the customer'

  const confirmApprove = async () => {
    setBusy(true)
    try {
      await api.put(`/admin/car/booking/${approveTarget.id}/Approve`)
      updateBooking(approveTarget.id, { bookingStatus: 'APPROVED' })
      window.dispatchEvent(new Event(BOOKINGS_CHANGED_EVENT))
      toast.success('Booking approved. The customer is notified.')
      setApproveTarget(null)
    } catch (err) {
      toast.error(errorMessage(err, 'Could not approve this booking.'))
    } finally {
      setBusy(false)
    }
  }

  const confirmReject = async () => {
    const trimmed = reason.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const withReason = await rejectBooking(rejectTarget.id, trimmed)
      updateBooking(rejectTarget.id, {
        bookingStatus: 'REJECTED',
        ...(withReason ? { rejectionReason: trimmed } : {}),
      })
      window.dispatchEvent(new Event(BOOKINGS_CHANGED_EVENT))
      if (withReason) toast.success('Booking rejected. The customer is notified.')
      else toast.warning('Booking rejected, but the reason could not be saved. The server has no reason endpoint.')
      setRejectTarget(null)
      setReason('')
    } catch (err) {
      toast.error(errorMessage(err, 'Could not reject this booking.'))
    } finally {
      setBusy(false)
    }
  }

  const closeReject = () => {
    setRejectTarget(null)
    setReason('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Bookings</h1>
      <p className="mt-1 text-body">Review requests. Approving or rejecting cannot be undone.</p>

      {!loading && !error && bookings.length > 0 && (
        <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                'rounded-control border px-3 py-1.5 text-sm font-medium transition-colors',
                filter === value
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-surface text-body hover:border-body hover:text-ink',
              )}
            >
              {label} <span className="font-normal">({counts[value]})</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div role="status" className="h-64 animate-pulse rounded-card bg-line">
            <span className="sr-only">Loading bookings</span>
          </div>
        ) : error ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">Bookings could not be loaded.</p>
            <p className="mt-1 text-sm text-body">Check that the backend is running and try again.</p>
            <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No booking requests yet.</p>
            <p className="mt-1 text-sm text-body">New requests from customers appear here.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No bookings with this status.</p>
            <button type="button" onClick={() => setFilter('ALL')} className={buttonStyles({ className: 'mt-4' })}>
              Show all bookings
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs uppercase tracking-wide text-body">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Booking</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Dates</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Total</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((b) => {
                  const status = statusOf(b)
                  const price = b.totalPrice != null ? b.totalPrice : b.price
                  const email = b.userEmail || b.email
                  return (
                    <tr key={b.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{describe(b)}</p>
                        <p className="text-body">#{String(b.id).slice(-5)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{b.userName || b.username || 'Customer'}</p>
                        {email && <p className="text-body">{email}</p>}
                      </td>
                      <td className="px-4 py-3 text-body">
                        {formatDate(b.fromDate)} to {formatDate(b.toDate)}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{formatINR(price)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                        {status === 'REJECTED' && b.rejectionReason && (
                          <p className="mt-1 max-w-[14rem] text-body">Reason: {b.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setApproveTarget(b)}
                              className={buttonStyles({ size: 'sm' })}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectTarget(b)}
                              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-body">No action</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve this booking?"
        description={
          approveTarget
            ? `Approve the request for ${describe(approveTarget)} from ${customerOf(approveTarget)}. The customer is notified, and this cannot be undone.`
            : ''
        }
        confirmLabel="Approve"
        busy={busy}
        onConfirm={confirmApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject this booking?"
        description={
          rejectTarget
            ? `Reject the request for ${describe(rejectTarget)} from ${customerOf(rejectTarget)}. This cannot be undone.`
            : ''
        }
        confirmLabel="Reject"
        variant="danger"
        busy={busy}
        onConfirm={confirmReject}
        onCancel={closeReject}
      >
        <label htmlFor="reject-reason" className="mb-1 block text-sm font-medium text-ink">
          Reason for the customer
        </label>
        <textarea
          id="reject-reason"
          required
          maxLength={250}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={cn(inputClass, 'border-line')}
        />
        <p className="mt-1 text-sm text-body">The customer sees this on their bookings page.</p>
      </ConfirmDialog>
    </div>
  )
}

export default AdminBookings