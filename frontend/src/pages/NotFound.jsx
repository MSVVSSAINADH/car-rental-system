import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { buttonStyles } from '../lib/buttonStyles'

const NotFound = () => {
  useEffect(() => {
    const previous = document.title
    document.title = 'Page not found | CarRentalX'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-body">The page you are looking for does not exist or has moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className={buttonStyles()}>
          Back to home
        </Link>
        <Link to="/cars" className={buttonStyles({ variant: 'secondary' })}>
          Browse cars
        </Link>
      </div>
    </div>
  )
}

export default NotFound