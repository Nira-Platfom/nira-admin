'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import StatCard from '@/components/StatCard'
import Chart from '@/components/Chart'
import Badge from '@/components/Badge'

interface Overview {
  total_businesses: number
  total_users: number
  total_customers: number
  total_conversations: number
  active_bots: number
  connected_whatsapp: number
  new_businesses_30d: number
  new_businesses_7d: number
  messages_today: number
  plan_breakdown: { free: number; pro: number; business: number }
  estimated_mrr_tzs: number
}

interface TopBiz {
  id: string
  name: string
  type: string
  message_count: number
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [growth, setGrowth] = useState<{ date: string; count: number }[]>([])
  const [topBiz, setTopBiz] = useState<TopBiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/analytics/businesses-growth?days=30'),
      api.get('/admin/analytics/top-businesses'),
    ]).then(([ov, gr, top]) => {
      setOverview(ov.data)
      setGrowth(gr.data)
      setTopBiz(top.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
  if (!overview) return null

  const planData = [
    { name: 'Free', count: overview.plan_breakdown.free },
    { name: 'Pro', count: overview.plan_breakdown.pro },
    { name: 'Business', count: overview.plan_breakdown.business },
  ]

  const formatTZS = (n: number) => `TZS ${n.toLocaleString()}`

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Platform overview and key metrics"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Businesses" value={overview.total_businesses} sub={`+${overview.new_businesses_7d} this week`} color="var(--coral)" />
        <StatCard label="Total Users" value={overview.total_users} color="var(--lavender)" />
        <StatCard label="Customers" value={overview.total_customers} color="var(--mint)" />
        <StatCard label="Total Messages" value={overview.total_conversations} sub={`${overview.messages_today} today`} color="var(--warning)" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Bots" value={overview.active_bots} color="var(--success)" />
        <StatCard label="WhatsApp Connected" value={overview.connected_whatsapp} color="var(--mint)" />
        <StatCard label="New (30d)" value={overview.new_businesses_30d} color="var(--lavender)" />
        <StatCard label="Est. MRR" value={formatTZS(overview.estimated_mrr_tzs)} color="var(--coral)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Business Growth (30d)</h3>
          <Chart data={growth} type="area" dataKey="count" xKey="date" color="var(--coral)" />
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Plan Distribution</h3>
          <Chart data={planData} type="pie" dataKey="count" nameKey="name" />
        </div>
      </div>

      {/* Top businesses */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Top Businesses by Messages</h3>
        <div className="space-y-3">
          {topBiz.map((biz, i) => (
            <div key={biz.id} className="flex items-center gap-3">
              <span className="w-5 text-xs text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{biz.name}</span>
                  <Badge value={biz.type} />
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--coral)' }}>{biz.message_count.toLocaleString()}</span>
            </div>
          ))}
          {topBiz.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
