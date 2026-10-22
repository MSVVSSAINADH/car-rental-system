import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, ClipboardCheck, Minus, Plus, Search } from 'lucide-react'
import api from '../services/api'
import { useSession } from '../services/session'
import { useAppConfig } from '../services/config'
import CarImage from '../components/CarImage'
import { buttonStyles } from '../lib/buttonStyles'
import { formatINR } from '../lib/format'

const CATEGORY_ORDER = ['Budget', 'Mid-range', 'Family', 'SUV', 'Electric', 'Premium', 'Economy', 'Luxury']

const CATEGORY_NOTES = {
  Budget: 'Lower daily prices, easy to park in the city.',
  'Mid-range': 'A balance of comfort, features and price.',
  Family: 'More seats and luggage space for groups.',
  SUV: 'Higher seating position for long drives and rough roads.',
  Electric: 'Electric cars for city driving.',
  Premium: 'Higher-end cars for business and special occasions.',
  Economy: 'Lower daily prices, easy to park in the city.',
  Luxury: 'Higher-end cars for business and special occasions.',
}

const sectionClass = 'mx-auto max-w-6xl px-4 py-14 sm:px-6'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function SectionHeader({ title, text }) {
  return (
    <div className="mb-8 max-w-2xl">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {text && <p className="mt-2 text-body">{text}</p>}
    </div>
  )
}

const Home = () => {
  const user = useSession()
  const config = useAppConfig()
  const { hash } = useLocation()

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [fleetError, setFleetError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    api
      .get('/customer/cars')
      .then(({ data }) => {
        if (active) setCars(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setFleetError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [attempt])

  const retry = () => {
    setFleetError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  // Jump to #how-it-works / #faq after the fleet has loaded, so the page height is settled.
  useEffect(() => {
    if (!hash || loading) return undefined
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    }, 60)
    return () => clearTimeout(timer)
  }, [hash, loading])

  const available = useMemo(() => cars.filter((car) => car.available), [cars])

  const categories = useMemo(() => {
    const counts = new Map()
    available.forEach((car) => {
      if (car.category) counts.set(car.category, (counts.get(car.category) || 0) + 1)
    })
    const rank = (name) => {
      const i = CATEGORY_ORDER.indexOf(name)
      return i === -1 ? 99 : i
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
  }, [available])

  const featured = available.slice(0, 6)
  const isAdmin = user?.role === 'ADMIN'

  const faqs = [
    {
      question: 'How do I request a car booking?',
      answer:
        'Choose a car, select your rental dates and booking type, then submit the request. The booking stays pending until an administrator reviews it.',
    },
    {
      question: 'Does the app take payment online?',
      answer: 'Online payment is not configured. Submitting a booking request does not charge you.',
    },
    {
      question: 'What is the new customer offer?',
      answer: config
        ? `Customers with fewer than ${config.introBookingLimit} existing bookings receive a ${config.discountPercent}% discount. The server calculates the final booking price.`
        : 'The server calculates the final booking price, including any introductory discount.',
    },
    {
      question: 'Do I need a driving licence?',
      answer:
        'A licence image is required for Self Drive bookings. Upload it from your profile. Images must be smaller than 500 KB.',
    },
    {
      question: 'Can I book with a driver?',
      answer: 'Yes. Select With Driver when you choose the booking type.',
    },
  ]

  const steps = [
    {
      icon: Search,
      title: 'Browse cars',
      text: 'Review vehicle details and the price per day.',
    },
    {
      icon: CalendarDays,
      title: 'Submit a request',
      text: config
        ? `Select dates and a booking type. Eligible new customers receive ${config.discountPercent}% off.`
        : 'Select dates and a booking type. The server calculates the price.',
    },
    {
      icon: ClipboardCheck,
      title: 'Wait for review',
      text: 'An administrator reviews the request. The status appears in your bookings.',
    },
  ]

  const bookAction = (car) => {
    if (isAdmin) return null
    if (user) {
      return (
        <Link to={`/customer/book/${car.id}`} className={buttonStyles({ size: 'sm' })}>
          Book
        </Link>
      )
    }
    return (
      <Link to="/login" className={buttonStyles({ size: 'sm' })}>
        Sign in to book
      </Link>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Find a car for your next trip</h1>
            <p className="mt-4 max-w-xl text-lg text-body">
              Browse the current fleet and send a rental request. An administrator reviews every request, and its
              status appears in your bookings.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cars" className={buttonStyles({ size: 'lg' })}>
                Browse cars
              </Link>
              {!user && (
                <Link to="/signup" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
                  Create account
                </Link>
              )}
            </div>
            {!loading && available.length > 0 && (
              <p className="mt-6 text-sm text-body">
                {plural(available.length, 'car')} available in {plural(categories.length, 'category').replace('categorys', 'categories')}
              </p>
            )}
          </div>

          <img
            src="/tata_nexon_ev.png"
            alt="Tata Nexon EV"
            className="aspect-[16/10] w-full rounded-card border border-line object-cover"
          />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className={sectionClass}>
          <SectionHeader title="Browse by category" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ name, count }) => (
              <Link
                key={name}
                to={`/cars?category=${encodeURIComponent(name)}`}
                className="rounded-card border border-line bg-surface p-5 shadow-card transition-shadow hover:border-primary hover:shadow-lift"
              >
                <h3 className="text-lg font-semibold">{name}</h3>
                {CATEGORY_NOTES[name] && <p className="mt-1 text-sm text-body">{CATEGORY_NOTES[name]}</p>}
                <p className="mt-3 text-sm font-medium text-primary">{plural(count, 'car')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Available cars */}
      <section className={sectionClass}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Available cars</h2>
            <p className="mt-2 text-body">Cars you can request right now.</p>
          </div>
          {featured.length > 0 && (
            <Link to="/cars" className={buttonStyles({ variant: 'secondary' })}>
              View all cars
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="aspect-[16/10] animate-pulse bg-line" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded-badge bg-line" />
                  <div className="h-4 w-1/3 animate-pulse rounded-badge bg-line" />
                </div>
              </div>
            ))}
            <span className="sr-only">Loading cars</span>
          </div>
        ) : fleetError ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">The fleet could not be loaded.</p>
            <p className="mt-1 text-sm text-body">Check your connection and try again.</p>
            <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
              Try again
            </button>
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No cars are available right now.</p>
            <p className="mt-1 text-sm text-body">Please check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car) => (
              <article
                key={car.id}
                className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
              >
                <div className="aspect-[16/10] overflow-hidden bg-line">
                  <CarImage
                    imageUrl={car.imageUrl}
                    brand={car.brand}
                    model={car.model}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">
                      {car.brand} {car.model}
                    </h3>
                    {car.category && (
                      <span className="shrink-0 rounded-badge bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                        {car.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <p className="text-xl font-bold text-ink">
                      {formatINR(car.pricePerDay)}
                      <span className="text-sm font-normal text-body"> per day</span>
                    </p>
                    {bookAction(car)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className={sectionClass} id="how-it-works">
        <SectionHeader title="How it works" text="Three steps from browsing to a reviewed booking." />
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="rounded-card border border-line bg-surface p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-body">Step {index + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-body">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* New customer offer: only for visitors who are not signed in */}
      {!user && config && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-accent/40 bg-accent-soft p-6">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold">New customer offer</h2>
              <p className="mt-1 text-body">
                Eligible customers receive {config.discountPercent}% off their first {config.introBookingLimit}{' '}
                bookings. The server calculates the final price when you submit a request.
              </p>
            </div>
            <Link to="/signup" className={buttonStyles({ size: 'lg' })}>
              Create account
            </Link>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className={sectionClass} id="faq">
        <SectionHeader title="Frequently asked questions" />
        <div className="max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-card border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus className="h-4 w-4 shrink-0 group-open:hidden" aria-hidden="true" />
                <Minus className="hidden h-4 w-4 shrink-0 group-open:block" aria-hidden="true" />
              </summary>
              <p className="px-5 pb-5 text-body">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home