import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Cog, Fuel, Users } from 'lucide-react'
import api from '../services/api'
import { useSession } from '../services/session'
import CarImage from '../components/CarImage'
import { buttonStyles } from '../lib/buttonStyles'
import { cn } from '../lib/utils'
import { formatINR } from '../lib/format'

const CATEGORY_ORDER = ['Budget', 'Mid-range', 'Family', 'SUV', 'Electric', 'Premium', 'Economy', 'Luxury']

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'year-desc', label: 'Newest model year' },
]

const selectClass =
  'w-full rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink hover:border-body'

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-line" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-badge bg-line" />
        <div className="h-4 w-1/2 animate-pulse rounded-badge bg-line" />
        <div className="h-9 w-full animate-pulse rounded-control bg-line" />
      </div>
    </div>
  )
}

function Spec({ icon: Icon, children }) {
  return (
    <li className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
      {children}
    </li>
  )
}

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
    </div>
  )
}

const Cars = () => {
  const user = useSession()
  const isAdmin = user?.role === 'ADMIN'
  const [searchParams, setSearchParams] = useSearchParams()

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const category = searchParams.get('category') || 'All'
  const fuel = searchParams.get('fuel') || ''
  const transmission = searchParams.get('transmission') || ''
  const sort = searchParams.get('sort') || ''

  useEffect(() => {
    let active = true
    api
      .get('/customer/cars')
      .then(({ data }) => {
        if (active) setCars((Array.isArray(data) ? data : []).filter((car) => car.available !== false))
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

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => setSearchParams({}, { replace: true })

  const categories = useMemo(() => {
    const counts = new Map()
    cars.forEach((car) => {
      if (car.category) counts.set(car.category, (counts.get(car.category) || 0) + 1)
    })
    const rank = (name) => {
      const i = CATEGORY_ORDER.indexOf(name)
      return i === -1 ? 99 : i
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
  }, [cars])

  const fuels = useMemo(() => [...new Set(cars.map((c) => c.fuelType).filter(Boolean))].sort(), [cars])
  const transmissions = useMemo(
    () => [...new Set(cars.map((c) => c.transmission).filter(Boolean))].sort(),
    [cars],
  )

  const filtered = useMemo(() => {
    const list = cars.filter(
      (car) =>
        (category === 'All' || car.category === category) &&
        (!fuel || car.fuelType === fuel) &&
        (!transmission || car.transmission === transmission),
    )
    const byPrice = (a, b) => (Number(a.pricePerDay) || 0) - (Number(b.pricePerDay) || 0)
    if (sort === 'price-asc') list.sort(byPrice)
    if (sort === 'price-desc') list.sort((a, b) => byPrice(b, a))
    if (sort === 'year-desc') list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0))
    return list
  }, [cars, category, fuel, transmission, sort])

  const hasFilters = category !== 'All' || fuel || transmission || sort

  const bookAction = (car) => {
    if (isAdmin) return null
    return user ? (
      <Link to={`/customer/book/${car.id}`} className={buttonStyles({ size: 'sm' })}>
        Book this car
      </Link>
    ) : (
      <Link to="/login" className={buttonStyles({ size: 'sm' })}>
        Sign in to book
      </Link>
    )
  }

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Cars</h1>
          <p className="mt-2 max-w-2xl text-body">
            Choose a category, compare the daily price and send a booking request. An administrator reviews every
            request.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">
          Filters
        </h2>

        {!loading && !error && cars.length > 0 && (
          <div className="mb-8 space-y-5">
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {[{ name: 'All', count: cars.length }, ...categories].map(({ name, count }) => {
                const active = category === name
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setParam('category', name)}
                    className={cn(
                      'rounded-control border px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-line bg-surface text-body hover:border-body hover:text-ink',
                    )}
                  >
                    {name} <span className="font-normal">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect id="filter-fuel" label="Fuel" value={fuel} onChange={(v) => setParam('fuel', v)}>
                <option value="">Any fuel</option>
                {fuels.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                id="filter-transmission"
                label="Transmission"
                value={transmission}
                onChange={(v) => setParam('transmission', v)}
              >
                <option value="">Any transmission</option>
                {transmissions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect id="filter-sort" label="Sort by" value={sort} onChange={(v) => setParam('sort', v)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FilterSelect>

              {hasFilters && (
                <div className="flex items-end">
                  <button type="button" onClick={clearFilters} className={buttonStyles({ variant: 'secondary' })}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
            <span className="sr-only">Loading cars</span>
          </div>
        ) : error ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">The fleet could not be loaded.</p>
            <p className="mt-1 text-sm text-body">Check your connection and try again.</p>
            <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
              Try again
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No cars are available right now.</p>
            <p className="mt-1 text-sm text-body">Please check back later.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No cars match these filters.</p>
            <p className="mt-1 text-sm text-body">Remove a filter to see more of the fleet.</p>
            <button type="button" onClick={clearFilters} className={buttonStyles({ className: 'mt-4' })}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-body" aria-live="polite">
              Showing {filtered.length} of {cars.length} {cars.length === 1 ? 'car' : 'cars'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((car) => (
                <article
                  key={car.id}
                  className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-line">
                    <CarImage imageUrl={car.imageUrl} brand={car.brand} model={car.model} />
                    {car.category && (
                      <span className="absolute left-3 top-3 rounded-badge bg-surface px-2 py-0.5 text-xs font-semibold text-ink shadow-card">
                        {car.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">
                        {car.brand} {car.model}
                      </h3>
                      {car.year && <span className="shrink-0 text-sm text-body">{car.year}</span>}
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-body">
                      {car.seats && <Spec icon={Users}>{car.seats} seats</Spec>}
                      {car.transmission && <Spec icon={Cog}>{car.transmission}</Spec>}
                      {car.fuelType && <Spec icon={Fuel}>{car.fuelType}</Spec>}
                    </ul>

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
          </>
        )}
      </section>
    </div>
  )
}

export default Cars