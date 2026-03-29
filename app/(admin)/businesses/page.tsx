'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Header from '@/components/Header'
import Badge from '@/components/Badge'
import { Search } from 'lucide-react'

interface Business {
  id: string
  name: string
  type: string
  city: string
  plan: string
  subscription_status: string
  bot_active: boolean
  whatsapp_connected: boolean
  member_count: number
  customer_count: number
  conversation_count: number
  created_at: string
}

export default function BusinessesPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (filterType) params.set('business_type', filterType)
    if (filterPlan) params.set('plan', filterPlan)
    api.get(`/admin/businesses?${params}`).then((res) => {
      setBusinesses(res.data.businesses)
      setTotal(res.data.total)
    }).finally(() => setLoading(false))
  }, [page, search, filterType, filterPlan])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <Header title="Businesses" subtitle={`${total} total businesses`} />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-9 pl-8 pr-3 rounded-lg border text-sm outline-none"
            style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border text-sm outline-none"
          style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
        >
          <option value="">All types</option>
          <option value="salon_spa">Salon / Spa</option>
          <option value="cosmetic_shop">Cosmetic Shop</option>
        </select>
        <select
          value={filterPlan}
          onChange={(e) => { setFilterPlan(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border text-sm outline-none"
          style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--slate-light)' }}>
                {['Business', 'Type', 'Plan', 'Bot', 'Members', 'Customers', 'Messages', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
                    No businesses found
                  </td>
                </tr>
              ) : businesses.map((biz, i) => (
                <tr
                  key={biz.id}
                  onClick={() => router.push(`/businesses/${biz.id}`)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  style={{ borderBottom: i < businesses.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{biz.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{biz.city}</div>
                  </td>
                  <td className="px-4 py-3"><Badge value={biz.type} /></td>
                  <td className="px-4 py-3">
                    <div><Badge value={biz.plan} /></div>
                    {biz.subscription_status && <Badge value={biz.subscription_status} />}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                      background: biz.bot_active ? 'var(--mint-light)' : 'var(--slate-light)',
                      color: biz.bot_active ? 'var(--mint)' : 'var(--text-muted)',
                    }}>
                      {biz.bot_active ? 'Active' : 'Off'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{biz.member_count}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{biz.customer_count}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{biz.conversation_count}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {biz.created_at ? new Date(biz.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 rounded-lg text-sm disabled:opacity-40"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="h-8 px-3 rounded-lg text-sm disabled:opacity-40"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
