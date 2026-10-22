import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../services/api'
import { buttonStyles } from '../../lib/buttonStyles'
import { formatDate, formatINR } from '../../lib/format'

const TYPE_LABELS = { SELF_DRIVE: 'Self drive', WITH_DRIVER: 'With driver' }

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-body">{label}</dt>
      <dd className="text-right font-medium text-ink">{children}</dd>
    </div>
  )
}

const Payment = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const booking = state?.booking

  if (!booking) return <Navigate to="/customer/dashboard" replace />

  const discountAmount = Math.max(0, (booking.originalPrice ?? 0) - (booking.totalPrice ?? 0))

  const submitBooking = async () => {
    setSubmitting(true)
    try {
      await api.post('/customer/car/book', booking)
      toast.success('Request sent. We will notify you once it is reviewed.')
      navigate('/customer/bookings')
    } catch (error) {
      const data = error.response?.data
      const message =
        (typeof data === 'string' && data) ||
        data?.message ||
        'Unable to send this request. Check the dates and try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Review your request</h1>
      <p className="mt-2 text-body">Your request goes to an administrator for approval.</p>

      <div className="mt-6 rounded-card border border-line bg-surface p-6 shadow-card">
        <dl className="divide-y divide-line">
          <Row label="Car">
            {booking.carBrand} {booking.carModel}
          </Row>
          <Row label="From">{formatDate(booking.fromDate)}</Row>
          <Row label="To">{formatDate(booking.toDate)}</Row>
          <Row label="Booking type">{TYPE_LABELS[booking.bookingType] || booking.bookingType}</Row>
          {discountAmount > 0 && (
            <>
              <Row label="Price before discount">{formatINR(booking.originalPrice)}</Row>
              <Row label="New customer discount">
                <span className="text-success">-{formatINR(discountAmount)}</span>
              </Row>
            </>
          )}
          <Row label="Total">
            <span className="text-lg font-bold">{formatINR(booking.totalPrice)}</span>
          </Row>
        </dl>
      </div>

      <p className="mt-4 text-sm text-body">
        The server calculates the final price when the request is sent. Online payment is not configured, so
        sending this request does not charge you.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submitBooking}
          disabled={submitting}
          className={buttonStyles({ size: 'lg' })}
        >
          {submitting ? 'Sending request' : 'Send booking request'}
        </button>
        <Link to={`/customer/book/${booking.carId}`} className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
          Change dates
        </Link>
      </div>
    </div>
  )
}

export default Payment