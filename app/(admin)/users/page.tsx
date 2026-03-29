'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import Badge from '@/components/Badge'
import { Search } from 'lucide-react'

interface UserRow {
  id: string
  full_name: string
  email: string
  is_active: boolean
  created_at: string
  businesses: { id: string; name: string; type: string; role: string }[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    api.get(`/admin/users?${params}`).then((res) => {
      setUsers(res.data.users)
      setTotal(res.data.total)
    }).finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <Header title="Users" subtitle={`${total} total users`} />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-9 pl-8 pr-3 rounded-lg border text-sm outline-none"
            style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--slate-light)' }}>
                {['User', 'Email', 'Businesses', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</td>
                </tr>
              ) : users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-medium" style={{ background: 'var(--lavender)' }}>
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.businesses.map((b) => (
                        <span key={b.id} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--slate-light)', color: 'var(--text-muted)' }}>
                          {b.name} · {b.role}
                        </span>
                      ))}
                      {u.businesses.length === 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: u.is_active ? 'var(--mint-light)' : 'var(--slate-light)',
                      color: u.is_active ? 'var(--mint)' : 'var(--text-muted)',
                    }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 rounded-lg text-sm disabled:opacity-40" style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="h-8 px-3 rounded-lg text-sm disabled:opacity-40" style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
