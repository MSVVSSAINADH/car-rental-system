import { useEffect } from 'react'

export default function AuthLayout({ title, subtitle, children, footer }) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | CarRentalX`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-body">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-body">{footer}</p>}
    </div>
  )
}