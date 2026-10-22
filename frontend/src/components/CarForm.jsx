import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormField from './FormField'
import { SelectField, TextAreaField } from './FormControls'
import { buttonStyles } from '../lib/buttonStyles'

const CATEGORIES = ['Budget', 'Mid-range', 'Family', 'SUV', 'Electric', 'Premium']
const TRANSMISSIONS = ['Automatic', 'Manual']
const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

// Keep a car's current value selectable even if it is not in the standard list
// (for example an older category), so editing never changes it silently.
const withCurrent = (options, value) => (value && !options.includes(value) ? [...options, value] : options)

const toForm = (car) => ({
  brand: car?.brand ?? '',
  model: car?.model ?? '',
  color: car?.color ?? '',
  year: car?.year ?? '',
  transmission: car?.transmission ?? 'Automatic',
  fuelType: car?.fuelType ?? 'Petrol',
  seats: car?.seats ?? '',
  category: car?.category ?? 'Budget',
  pricePerDay: car?.pricePerDay ?? '',
  description: car?.description ?? '',
  imageUrl: car?.imageUrl ?? '',
})

const text = (value) => String(value ?? '').trim()

function validate(values) {
  const errors = {}
  const maxYear = new Date().getFullYear() + 1
  if (!text(values.brand)) errors.brand = 'Enter the brand.'
  if (!text(values.model)) errors.model = 'Enter the model.'
  if (!text(values.color)) errors.color = 'Enter the color.'

  const year = Number(values.year)
  if (!Number.isInteger(year) || year < 1990 || year > maxYear) {
    errors.year = `Enter a year between 1990 and ${maxYear}.`
  }
  const seats = Number(values.seats)
  if (!Number.isInteger(seats) || seats < 1 || seats > 10) errors.seats = 'Enter seats from 1 to 10.'

  const price = Number(values.pricePerDay)
  if (!text(values.pricePerDay) || !Number.isFinite(price) || price <= 0) {
    errors.pricePerDay = 'Enter a price per day above 0.'
  }
  if (text(values.imageUrl) && !/^(https?:\/\/|\/)/.test(text(values.imageUrl))) {
    errors.imageUrl = 'Use a full link starting with https:// or a path starting with /.'
  }
  return errors
}

export default function CarForm({ initial, onSubmit, submitLabel, busy, serverError }) {
  const [values, setValues] = useState(() => toForm(initial))
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit({
      brand: text(values.brand),
      model: text(values.model),
      color: text(values.color),
      year: Number(values.year),
      transmission: values.transmission,
      fuelType: values.fuelType,
      seats: Number(values.seats),
      category: values.category,
      pricePerDay: Number(values.pricePerDay),
      description: text(values.description),
      imageUrl: text(values.imageUrl),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <p
          role="alert"
          className="mb-5 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-red-700"
        >
          {serverError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="car-brand" name="brand" label="Brand" value={values.brand} onChange={handleChange} error={errors.brand} />
        <FormField id="car-model" name="model" label="Model" value={values.model} onChange={handleChange} error={errors.model} />
        <FormField id="car-color" name="color" label="Color" value={values.color} onChange={handleChange} error={errors.color} />
        <FormField id="car-year" name="year" type="number" label="Model year" value={values.year} onChange={handleChange} error={errors.year} />

        <SelectField id="car-transmission" name="transmission" label="Transmission" value={values.transmission} onChange={handleChange}>
          {withCurrent(TRANSMISSIONS, values.transmission).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </SelectField>
        <SelectField id="car-fuel" name="fuelType" label="Fuel type" value={values.fuelType} onChange={handleChange}>
          {withCurrent(FUELS, values.fuelType).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </SelectField>

        <FormField id="car-seats" name="seats" type="number" label="Seats" value={values.seats} onChange={handleChange} error={errors.seats} />
        <SelectField id="car-category" name="category" label="Category" value={values.category} onChange={handleChange}>
          {withCurrent(CATEGORIES, values.category).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </SelectField>

        <FormField
          id="car-price"
          name="pricePerDay"
          type="number"
          label="Price per day (INR)"
          value={values.pricePerDay}
          onChange={handleChange}
          error={errors.pricePerDay}
          className="sm:col-span-2"
        />
        <TextAreaField
          id="car-description"
          name="description"
          label="Description (optional)"
          value={values.description}
          onChange={handleChange}
          className="sm:col-span-2"
        />
        <FormField
          id="car-image"
          name="imageUrl"
          label="Photo link (optional)"
          hint="Leave empty to show a 'Photo coming soon' placeholder. Only use photos you own or have the right to use."
          value={values.imageUrl}
          onChange={handleChange}
          error={errors.imageUrl}
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={buttonStyles({ size: 'lg' })}>
          {busy ? 'Saving' : submitLabel}
        </button>
        <Link to="/admin/dashboard" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
          Cancel
        </Link>
      </div>
    </form>
  )
}