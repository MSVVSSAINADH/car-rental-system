import { Car } from 'lucide-react'
import { cn } from '../lib/utils'

/**
 * Shows the car photo, or a plain placeholder when the car has no unique photo yet.
 * The placeholder never pretends to show the actual vehicle.
 */
const CarImage = ({ imageUrl, brand = '', model = '', className = '', compact = false }) => {
  const label = `${brand} ${model}`.trim()

  if (imageUrl) {
    return (
      <img
        className={cn('h-full w-full object-cover', className)}
        src={imageUrl}
        alt={label || 'Rental car'}
        loading="lazy"
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${label || 'Rental car'}, photo coming soon`}
      className={cn('flex h-full w-full flex-col items-center justify-center gap-2 bg-line text-body', className)}
    >
      <Car className={compact ? 'h-6 w-6' : 'h-10 w-10'} aria-hidden="true" />
      {!compact && <span className="text-sm font-medium">Photo coming soon</span>}
    </div>
  )
}

export default CarImage