import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api'
import { useSession } from '../../services/session'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'
import { formatDate, formatINR } from '../../lib/format'

const STATUS = {
  APPROVED: { label: 'Approved', className: 'bg-success-soft text-success' },
  PENDING: { label: 'Pending review', className: 'bg-warning-soft text-warning' },
  REJECTED: { label: 'Rejected', className: 'bg-danger-soft text-red-700' },
}

const TYPE_LABELS = { SELF_DRIVE: 'Self drive', WITH_DRIVER: 'With driver' }

function InvoiceDialog({ html, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Invoice"
      className="m-auto w-[min(48rem,92vw)] rounded-card border border-line bg-surface p-0 shadow-lift backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-base font-semibold">Invoice</h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        >
          Close
        </button>
      </div>
      <iframe title="Invoice" sandbox="" srcDoc={html} className="h-[70vh] w-full bg-white" />
    </dialog>
  )
}

const MyBookings = () => {
  const user = useSession()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [invoiceHtml, setInvoiceHtml] = useState(null)
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null)

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    api
      .get(`/customer/car/bookings/${user.id}`)
      .then((res) => {
        if (active) setBookings(Array.isArray(res.data) ? [...res.data].reverse() : [])
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
  }, [user?.id, attempt])

  const retry = () => {
    setError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  const openInvoice = async (booking) => {
    setInvoiceLoadingId(booking.id)
    try {
      const res = await api.get(`/customer/booking/${booking.id}/invoice`, { responseType: 'text' })
      setInvoiceHtml(res.data)
    } catch {
      toast.error('The invoice could not be loaded.')
    } finally {
      setInvoiceLoadingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My bookings</h1>
          <p className="mt-1 text-body">Your requests and their status.</p>
        </div>
        {!loading && !error && (
          <p className="text-sm text-body">
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4" role="status">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-card border border-line bg-surface p-5">
                <div className="h-5 w-1/3 animate-pulse rounded-badge bg-line" />
                <div className="mt-3 h-4 w-2/3 animate-pulse rounded-badge bg-line" />
              </div>
            ))}
            <span className="sr-only">Loading bookings</span>
          </div>
        ) : error ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">Your bookings could not be loaded.</p>
            <p className="mt-1 text-sm text-body">Check your connection and try again.</p>
            <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No bookings yet.</p>
            <p className="mt-1 text-sm text-body">Browse the fleet and send your first request.</p>
            <Link to="/customer/dashboard" className={buttonStyles({ className: 'mt-4' })}>
              Browse cars
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => {
              const status = STATUS[b.bookingStatus] || {
                label: b.bookingStatus || 'Unknown',
                className: 'bg-page text-body',
              }
              const type = TYPE_LABELS[b.bookingType]
              return (
                <li key={b.id} className="rounded-card border border-line bg-surface p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold">
                          {b.carBrand} {b.carModel}
                        </h2>
                        <span
                          className={cn('rounded-badge px-2 py-0.5 text-xs font-semibold', status.className)}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-body">
                        {formatDate(b.fromDate)} to {formatDate(b.toDate)}
                        {b.days ? `, ${b.days} ${b.days === 1 ? 'day' : 'days'}` : ''}
                        {type ? `, ${type}` : ''}
                      </p>
                      {b.bookingStatus === 'PENDING' && (
                        <p className="mt-2 text-sm text-body">Awaiting approval. We will notify you here.</p>
                      )}
                      {b.bookingStatus === 'REJECTED' && b.rejectionReason && (
                        <p className="mt-2 text-sm text-body">Reason: {b.rejectionReason}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-ink">{formatINR(b.price)}</p>
                      <p className="text-xs text-body">Booking #{String(b.id).slice(-5)}</p>
                    </div>
                  </div>

                  {b.bookingStatus === 'APPROVED' && (
                    <div className="mt-4 border-t border-line pt-4">
                      <button
                        type="button"
                        onClick={() => openInvoice(b)}
                        disabled={invoiceLoadingId === b.id}
                        className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                      >
                        {invoiceLoadingId === b.id ? 'Loading invoice' : 'View invoice'}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {invoiceHtml !== null && <InvoiceDialog html={invoiceHtml} onClose={() => setInvoiceHtml(null)} />}
    </div>
  )
}

export default MyBookings