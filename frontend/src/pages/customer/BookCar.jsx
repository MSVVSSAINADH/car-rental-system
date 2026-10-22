import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import api from '../../services/api'
import { useSession } from '../../services/session'
import { useAppConfig } from '../../services/config'
import CarImage from '../../components/CarImage'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'
import { formatINR } from '../../lib/format'

const inputClass =
  'w-full rounded-control border border-line bg-surface px-3 py-2 text-ink hover:border-body'

const BOOKING_TYPES = [
  {
    value: 'self',
    title: 'Self drive',
    text: 'You drive the car yourself. A valid driving licence is required on your profile.',
  },
  {
    value: 'driver',
    title: 'With driver',
    text: 'A driver is provided for the trip.',
  },
]

const BookCar = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useSession()
  const config = useAppConfig()

  const [car, setCar] = useState(null)
  const [carError, setCarError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [bookingType, setBookingType] = useState('self')
  const [checking, setChecking] = useState(false)

  // The quote is tagged with the dates it belongs to, so a stale quote from an
  // earlier date selection is never shown as the current one.
  const quoteKey = `${id}|${fromDate}|${toDate}`
  const [quoteResult, setQuoteResult] = useState({ key: null, quote: null, error: '' })

  useEffect(() => {
    let active = true
    api
      .get(`/customer/car/${id}`)
      .then((response) => {
        if (active) setCar(response.data)
      })
      .catch(() => {
        if (active) setCarError(true)
      })
    return () => {
      active = false
    }
  }, [id, attempt])

  const retryCar = () => {
    setCarError(false)
    setAttempt((n) => n + 1)
  }

  const dateError = useMemo(() => {
    const today = dayjs().startOf('day')
    if (fromDate && dayjs(fromDate).isBefore(today)) return 'The start date cannot be in the past.'
    if (toDate) {
      if (dayjs(toDate).isBefore(today)) return 'The end date cannot be in the past.'
      if (fromDate && !dayjs(toDate).isAfter(dayjs(fromDate))) {
        return 'The end date must be after the start date.'
      }
    }
    return ''
  }, [fromDate, toDate])

  // The server is the only authority on price: it applies the intro discount
  // and checks the dates against existing bookings.
  useEffect(() => {
    if (!car || !fromDate || !toDate || dateError) return undefined
    const controller = new AbortController()
    const requestKey = quoteKey
    api
      .post('/customer/car/quote', { carId: id, fromDate, toDate }, { signal: controller.signal })
      .then(({ data }) => {
        setQuoteResult({ key: requestKey, quote: data, error: '' })
      })
      .catch((error) => {
        if (error.code === 'ERR_CANCELED') return
        setQuoteResult({
          key: requestKey,
          quote: null,
          error:
            typeof error.response?.data === 'string'
              ? error.response.data
              : 'This car could not be priced for those dates.',
        })
      })
    return () => controller.abort()
  }, [car, id, fromDate, toDate, dateError, quoteKey])

  const quoteSettled = quoteResult.key === quoteKey
  const quote = quoteSettled ? quoteResult.quote : null
  const quoteError = quoteSettled ? quoteResult.error : ''
  const quoteLoading = Boolean(car && fromDate && toDate && !dateError && !quoteSettled)
  const discountAmount = quote ? Math.max(0, (quote.basePrice ?? 0) - (quote.totalPrice ?? 0)) : 0

  const today = dayjs().format('YYYY-MM-DD')
  const unavailable = car?.available === false

  const handleBook = async () => {
    if (dateError || !fromDate || !toDate) return
    if (!quote) {
      toast.error(quoteError || 'Wait for the price to load.')
      return
    }
    if (!user?.id) {
      navigate('/login')
      return
    }

    // The stored session goes stale after a licence upload, so ask the server.
    if (bookingType === 'self') {
      setChecking(true)
      let hasLicense = Boolean(user.licenseUrl || user.licenseImage)
      try {
        const profile = await api.get(`/customer/profile/${user.id}`)
        hasLicense = Boolean(profile.data?.licenseImage)
      } catch {
        // Keep the stored snapshot; the backend still rejects self-drive without a licence.
      }
      setChecking(false)
      if (!hasLicense) {
        toast.error('Add your driving licence to your profile to book a self-drive trip.')
        navigate('/customer/profile')
        return
      }
    }

    const newBooking = {
      id: Date.now(),
      carId: id,
      userId: user.id,
      userName: user.name || 'User',
      userEmail: user.email || 'N/A',
      fromDate,
      toDate,
      totalPrice: quote.totalPrice,
      originalPrice: quote.basePrice,
      discountApplied: quote.discountPercent ? `${quote.discountPercent}%` : null,
      status: 'Pending',
      carBrand: car.brand,
      carModel: car.model,
      carImage: car.imageUrl,
      bookingType: bookingType === 'self' ? 'SELF_DRIVE' : 'WITH_DRIVER',
    }

    navigate('/payment', { state: { booking: newBooking } })
  }

  if (carError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-card border border-line bg-surface p-8 text-center">
          <p className="font-semibold text-ink">This car could not be loaded.</p>
          <p className="mt-1 text-sm text-body">It may have been removed, or the connection failed.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button type="button" onClick={retryCar} className={buttonStyles()}>
              Try again
            </button>
            <Link to="/customer/dashboard" className={buttonStyles({ variant: 'secondary' })}>
              Back to cars
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" role="status">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="aspect-[16/10] animate-pulse rounded-card bg-line" />
            <div className="mt-6 h-8 w-1/2 animate-pulse rounded-badge bg-line" />
          </div>
          <div className="h-96 animate-pulse rounded-card bg-line lg:col-span-2" />
        </div>
        <span className="sr-only">Loading car</span>
      </div>
    )
  }

  const specs = [car.year, car.transmission, car.fuelType, car.color, car.seats ? `${car.seats} seats` : null].filter(
    Boolean,
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/customer/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to cars
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] overflow-hidden rounded-card border border-line bg-line">
            <CarImage imageUrl={car.imageUrl} brand={car.brand} model={car.model} />
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-bold">
              {car.brand} {car.model}
            </h1>
            {car.category && (
              <span className="rounded-badge bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                {car.category}
              </span>
            )}
          </div>

          {specs.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {specs.map((spec) => (
                <li key={spec} className="rounded-badge border border-line bg-surface px-2 py-1 text-sm text-body">
                  {spec}
                </li>
              ))}
            </ul>
          )}

          {car.description && <p className="mt-6 max-w-2xl text-body">{car.description}</p>}
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded-card border border-line bg-surface p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">Request this car</h2>
            <p className="mt-1 text-body">
              <span className="text-2xl font-bold text-ink">{formatINR(car.pricePerDay)}</span> per day
            </p>

            {unavailable && (
              <p role="alert" className="mt-4 rounded-control bg-danger-soft px-3 py-2 text-sm text-red-700">
                This car is not available right now.
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="from-date" className="mb-1 block text-sm font-medium text-ink">
                  From date
                </label>
                <input
                  id="from-date"
                  type="date"
                  className={inputClass}
                  value={fromDate}
                  min={today}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="to-date" className="mb-1 block text-sm font-medium text-ink">
                  To date
                </label>
                <input
                  id="to-date"
                  type="date"
                  className={inputClass}
                  value={toDate}
                  min={fromDate || today}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {dateError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {dateError}
              </p>
            )}
            {!dateError && quoteError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {quoteError}
              </p>
            )}

            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium text-ink">Booking type</legend>
              <div className="space-y-3">
                {BOOKING_TYPES.map((type) => (
                  <label key={type.value} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="bookingType"
                      value={type.value}
                      checked={bookingType === type.value}
                      onChange={() => setBookingType(type.value)}
                      className="peer sr-only"
                    />
                    <div
                      className={cn(
                        'rounded-card border border-line bg-surface p-4 transition-colors',
                        'hover:border-body peer-checked:border-primary peer-checked:bg-primary-soft',
                        'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                      )}
                    >
                      <p className="font-semibold text-ink">{type.title}</p>
                      <p className="mt-1 text-sm text-body">{type.text}</p>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <div aria-live="polite" className="mt-6">
              {quoteLoading && <p className="text-sm text-body">Checking availability and price</p>}

              {quote && (
                <dl className="space-y-2 rounded-card border border-line bg-page p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-body">Price before discount</dt>
                    <dd className="font-medium text-ink">{formatINR(quote.basePrice)}</dd>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-body">New customer discount ({quote.discountPercent}%)</dt>
                      <dd className="font-medium text-success">-{formatINR(discountAmount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-line pt-2 text-base">
                    <dt className="font-semibold text-ink">Total</dt>
                    <dd className="font-bold text-ink">{formatINR(quote.totalPrice)}</dd>
                  </div>
                  {quote.eligibleForDiscount && config && (
                    <p className="pt-1 text-body">
                      The offer applies to your first {config.introBookingLimit} bookings.
                    </p>
                  )}
                </dl>
              )}
            </div>

            <button
              type="button"
              onClick={handleBook}
              disabled={!quote || quoteLoading || checking || unavailable}
              className={buttonStyles({ size: 'lg', className: 'mt-6 w-full' })}
            >
              {quote ? `Review request, ${formatINR(quote.totalPrice)}` : 'Review request'}
            </button>
            <p className="mt-3 text-center text-sm text-body">
              Nothing is charged. An administrator reviews every request.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default BookCar