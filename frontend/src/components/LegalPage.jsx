import { useEffect } from 'react'

export function LegalSection({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-body">{children}</div>
    </section>
  )
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function LegalPage({ title, updated, intro, children }) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | CarRentalX`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-body">Last updated: {updated}</p>
      {intro && <p className="mt-6 text-body">{intro}</p>}
      {children}
    </article>
  )
}