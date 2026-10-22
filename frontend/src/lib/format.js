import dayjs from 'dayjs'

export const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : 'Not set')

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
export const formatINR = (n) => inr.format(Number(n) || 0)