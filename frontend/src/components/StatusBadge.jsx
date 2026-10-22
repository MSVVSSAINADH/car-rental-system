import { cn } from '../lib/utils'

const STYLES = {
  APPROVED: ['Approved', 'bg-success-soft text-success'],
  PENDING: ['Pending', 'bg-warning-soft text-warning'],
  REJECTED: ['Rejected', 'bg-danger-soft text-red-700'],
}

export default function StatusBadge({ status, className }) {
  const key = String(status || '').toUpperCase()
  const [label, style] = STYLES[key] || [status || 'Unknown', 'bg-page text-body']
  return (
    <span className={cn('inline-block rounded-badge px-2 py-0.5 text-xs font-semibold', style, className)}>
      {label}
    </span>
  )
}