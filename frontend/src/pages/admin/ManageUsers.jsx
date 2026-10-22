import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import api from '../../services/api'
import { useSession } from '../../services/session'
import ConfirmDialog from '../../components/ConfirmDialog'
import { inputClass } from '../../components/FormField'
import { buttonStyles } from '../../lib/buttonStyles'
import { cn } from '../../lib/utils'

const ManageUsers = () => {
  const session = useSession()
  const currentUserId = session?.id

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    api
      .get('/admin/users')
      .then((res) => {
        if (active) setUsers(Array.isArray(res.data) ? res.data : [])
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
  }, [attempt])

  const retry = () => {
    setError(false)
    setLoading(true)
    setAttempt((n) => n + 1)
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term),
    )
  }, [users, search])

  const confirmToggle = async () => {
    setBusy(true)
    try {
      await api.put(`/admin/user/${target.id}/block`)
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, blocked: !u.blocked } : u)))
      toast.success(target.blocked ? 'User unblocked.' : 'User blocked.')
      setTarget(null)
    } catch {
      toast.error('Could not update this user. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="mt-1 text-body">Everyone registered on CarRentalX.</p>
        </div>
        {!loading && !error && (
          <p className="text-sm text-body">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </p>
        )}
      </div>

      {!loading && !error && users.length > 0 && (
        <div className="mt-6 max-w-sm">
          <label htmlFor="user-search" className="mb-1 block text-sm font-medium text-ink">
            Search by name or email
          </label>
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, 'border-line')}
          />
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div role="status" className="h-64 animate-pulse rounded-card bg-line">
            <span className="sr-only">Loading users</span>
          </div>
        ) : error ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">Users could not be loaded.</p>
            <p className="mt-1 text-sm text-body">Check that the backend is running and try again.</p>
            <button type="button" onClick={retry} className={buttonStyles({ className: 'mt-4' })}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-8 text-center">
            <p className="font-semibold text-ink">No users found.</p>
            {search && <p className="mt-1 text-sm text-body">Try a different name or email.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs uppercase tracking-wide text-body">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">User</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Access</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((u) => {
                  const locked = u.role === 'ADMIN' || u.id === currentUserId
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-control bg-primary-soft text-sm font-semibold text-primary">
                            {u.profileImage ? (
                              <img src={u.profileImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              u.name?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{u.name}</p>
                            <p className="text-body">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body">{u.role === 'ADMIN' ? 'Administrator' : 'Customer'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-badge px-2 py-0.5 text-xs font-semibold',
                            u.blocked ? 'bg-danger-soft text-red-700' : 'bg-success-soft text-success',
                          )}
                        >
                          {u.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {locked ? (
                          <span className="text-body">{u.id === currentUserId ? 'This is you' : 'Not allowed'}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTarget(u)}
                            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                          >
                            {u.blocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title={target?.blocked ? 'Unblock this user?' : 'Block this user?'}
        description={
          target
            ? target.blocked
              ? `${target.name} will be able to sign in and send booking requests again.`
              : `${target.name} will no longer be able to sign in or send booking requests.`
            : ''
        }
        confirmLabel={target?.blocked ? 'Unblock' : 'Block'}
        variant={target?.blocked ? 'primary' : 'danger'}
        busy={busy}
        onConfirm={confirmToggle}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}

export default ManageUsers