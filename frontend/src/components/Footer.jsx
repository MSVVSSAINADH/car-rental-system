import { Link } from 'react-router-dom'
import { useSession } from '../services/session'

const linkClass = 'text-sm text-body transition-colors hover:text-primary'

const Footer = () => {
  const user = useSession()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="font-heading text-xl font-bold tracking-tight text-ink">
            CarRental<span className="text-primary">X</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-body">
            Browse the current fleet, choose your dates and send a rental request for administrator review.
          </p>
        </div>

        <nav aria-label="Browse">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Browse</h2>
          <ul className="mt-4 space-y-2">
            <li><Link to="/cars" className={linkClass}>Cars</Link></li>
            <li><Link to="/#how-it-works" className={linkClass}>How it works</Link></li>
            <li><Link to="/#faq" className={linkClass}>FAQ</Link></li>
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Account</h2>
          <ul className="mt-4 space-y-2">
            {!user && (
              <>
                <li><Link to="/login" className={linkClass}>Sign in</Link></li>
                <li><Link to="/signup" className={linkClass}>Create account</Link></li>
              </>
            )}
            {user && !isAdmin && (
              <>
                <li><Link to="/customer/bookings" className={linkClass}>My bookings</Link></li>
                <li><Link to="/customer/profile" className={linkClass}>My profile</Link></li>
              </>
            )}
            {isAdmin && (
              <li><Link to="/admin/dashboard" className={linkClass}>Admin dashboard</Link></li>
            )}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Good to know</h2>
          <ul className="mt-4 space-y-2 text-sm text-body">
            <li>No online payment. An administrator reviews every request.</li>
            <li>Self-drive bookings need a driving licence on your profile.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line bg-page">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-body sm:px-6">
          <p>&copy; {new Date().getFullYear()} CarRentalX. Prices are in INR per day.</p>
          <ul className="flex gap-4">
            <li><Link to="/privacy" className={linkClass}>Privacy policy</Link></li>
            <li><Link to="/terms" className={linkClass}>Terms and conditions</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer