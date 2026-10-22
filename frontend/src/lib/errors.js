// Turns any API error into a short message that is safe to render.
export function errorMessage(error, fallback) {
  const data = error?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    const values = Object.values(data).filter((v) => typeof v === 'string' && v.trim())
    if (values.length > 0) return values.join(' ')
  }
  return fallback
}