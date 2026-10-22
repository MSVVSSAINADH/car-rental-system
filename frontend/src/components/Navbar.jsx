import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, X } from 'lucide-react'
import api from '../services/api'
import { clearSession, useSession } from '../services/session'
import { cn } from '../lib/utils'
import { buttonStyles } from '../lib/buttonStyles'
import { BOOKINGS_CHANGED_EVENT } from '../lib/events'

const publicNav = [
  { to: '/cars', label: 'Cars' },
  { to: '/#how-it-works', label: 'How it works', hash: true },
]
const customerNav = [
  { to: '/customer/dashboard', label: 'Browse cars' },
  { to: '/customer/bookings', label: 'My bookings' },
]
const adminNav = [
  { to: '/admin/dashboard', label: 'Fleet' },
  { to: '/admin/bookings', label: 'Bookings', badge: 'pending' },
  { to: '/admin/users', label: 'Users' },
]

const linkBase = 'rounded-control px-3 py-2 text-sm font-medium transition-colors'
const linkIdle = 'text-body hover:bg-page hover:text-ink'
const linkActive = 'bg-primary-soft text-primary'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSession()

  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const menuRef = useRef(null)

  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = Boolean(user) && !isAdmin
  const navItems = !user ? publicNav : isAdmin ? adminNav : customerNav
  const homePath = isAdmin ? '/admin/dashboard' : user ? '/customer/dashboard' : '/'

  // Customers: unread notifications. Admins: pending booking requests.
  // Refreshed on every route change, once a minute, and when bookings change.
  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    const load = () => {
      if (user.role === 'ADMIN') {
        return api
          .get('/admin/stats')
          .then((res) => {
            if (active) setPendingCount(Number(res.data?.pendingBookings) || 0)
          })
          .catch(() => {})
      }
      return api
        .get(`/customer/notifications/${user.id}/unread-count`)
        .then((res) => {
          if (active) setUnreadCount(Number(res.data) || 0)
        })
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, 60000)
    window.addEventListener(BOOKINGS_CHANGED_EVENT, load)
    return () => {
      active = false
      clearInterval(timer)
      window.removeEventListener(BOOKINGS_CHANGED_EVENT, load)
    }
  }, [user?.id, user?.role, location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const closeMenus = () => {
    setMenuOpen(false)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    clearSession()
    closeMenus()
    navigate('/login')
  }

  const renderNav = (extra) =>
    navItems.map((item) => {
      const count = item.badge === 'pending' ? pendingCount : 0
      const ariaLabel = count > 0 ? `${item.label}, ${count} pending` : undefined
      const badge =
        count > 0 ? (
          <span
            aria-hidden="true"
            className="ml-2 rounded-badge bg-danger px-1.5 text-[11px] font-semibold leading-4 text-white"
          >
            {count > 99 ? '99+' : count}
          </span>
        ) : null

      if (item.hash) {
        return (
          <Link key={item.to} to={item.to} onClick={closeMenus} className={cn(linkBase, linkIdle, extra)}>
            {item.label}
          </Link>
        )
      }
      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={closeMenus}
          aria-label={ariaLabel}
          className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkIdle, extra)}
        >
          {item.label}
          {badge}
        </NavLink>
      )
    })

  const initial = user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          to={homePath}
          onClick={closeMenus}
          className="font-heading text-xl font-bold tracking-tight text-ink"
        >
          CarRental<span className="text-primary">X</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {renderNav()}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {!user && (
            <>
              <Link to="/login" className={buttonStyles({ variant: 'ghost' })}>
                Login
              </Link>
              <Link to="/signup" className={buttonStyles()}>
                Create account
              </Link>
            </>
          )}

          {isCustomer && (
            <NavLink
              to="/customer/notifications"
              onClick={closeMenus}
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              className={({ isActive }) =>
                cn('relative rounded-control p-2 transition-colors', isActive ? linkActive : linkIdle)
              }
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-badge bg-danger px-1 text-[11px] font-semibold leading-4 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          )}

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-control border border-line bg-primary-soft text-sm font-semibold text-primary hover:border-primary"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-card border border-line bg-surface p-2 shadow-lift">
                  <div className="border-b border-line px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-body">{user.email}</p>
                    <span className="mt-2 inline-block rounded-badge bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      {isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                  {isCustomer && (
                    <Link
                      to="/customer/profile"
                      onClick={closeMenus}
                      className={cn(linkBase, linkIdle, 'mt-1 block')}
                    >
                      My profile
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(linkBase, 'block w-full text-left text-danger hover:bg-danger-soft')}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="ml-auto rounded-control p-2 text-ink hover:bg-page md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-line bg-surface px-4 pb-4 pt-2 shadow-lift md:hidden"
        >
          <div className="flex flex-col gap-1">
            {renderNav('block')}

            {isCustomer && (
              <>
                <NavLink
                  to="/customer/notifications"
                  onClick={closeMenus}
                  className={({ isActive }) => cn(linkBase, isActive ? linkActive : linkIdle, 'block')}
                >
                  Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}
                </NavLink>
                <Link to="/customer/profile" onClick={closeMenus} className={cn(linkBase, linkIdle, 'block')}>
                  My profile
                </Link>
              </>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className={cn(linkBase, 'block w-full text-left text-danger hover:bg-danger-soft')}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" onClick={closeMenus} className={cn(linkBase, linkIdle, 'block')}>
                  Login
                </Link>
                <Link to="/signup" onClick={closeMenus} className={buttonStyles({ className: 'mt-2' })}>
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar