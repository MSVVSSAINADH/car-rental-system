import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Bell, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../services/api'
import { useSession } from '../../services/session'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'

// The server stores messages with a leading symbol. Detect the type from it,
// then drop the symbol from what is shown.
const APPROVED_MARK = '\u2705'
const REJECTED_MARK = '\u274C'
const LEADING_SYMBOLS = /^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u

const cleanMessage = (message = '') => message.replace(LEADING_SYMBOLS, '')

function NotificationIcon({ message }) {
  const base = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-control'
  if (message?.startsWith(APPROVED_MARK)) {
    return (
      <span className={cn(base, 'bg-success-soft text-success')}>
        <Check className="h-5 w-5" aria-hidden="true" />
      </span>
    )
  }
  if (message?.startsWith(REJECTED_MARK)) {
    return (
      <span className={cn(base, 'bg-danger-soft text-red-700')}>
        <X className="h-5 w-5" aria-hidden="true" />
      </span>
    )
  }
  return (
    <span className={cn(base, 'bg-primary-soft text-primary')}>
      <Bell className="h-5 w-5" aria-hidden="true" />
    </span>
  )
}

const Notifications = () => {
  const user = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    api
      .get(`/customer/notifications/${user.id}`)
      .then((res) => {
        if (active) setNotifications(Array.isArray(res.data) ? res.data : [])
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

  const markRead = async (id) => {
    try {
      await api.put(`/customer/notification/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {
      toast.error('Could not mark this notification as read.')
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    try {
      await Promise.all(unread.map((n) => api.put(`/customer/notification/${n.id}/read`)))
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      toast.error('Could not mark all notifications as read.')
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-body">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3" role="status">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-line" />
            ))}
            <span className="sr-only">Loading notifications</span>
          </div>
        ) : error ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">Your notifications could not be loaded.</p>
            <p className="mt-1 text-sm text-body">Check your connection and try again.</p>
            <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No notifications yet.</p>
            <p className="mt-1 text-sm text-body">Updates about your booking requests appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  'flex items-start gap-4 rounded-card border p-4',
                  n.isRead ? 'border-line bg-surface' : 'border-primary bg-primary-soft',
                )}
              >
                <NotificationIcon message={n.message} />
                <div className="min-w-0 flex-1">
                  <p className={cn('text-ink', n.isRead ? 'font-normal' : 'font-semibold')}>
                    {cleanMessage(n.message)}
                  </p>
                  {n.createdAt && (
                    <p className="mt-1 text-sm text-body">{dayjs(n.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                  )}
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'shrink-0' })}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Notifications