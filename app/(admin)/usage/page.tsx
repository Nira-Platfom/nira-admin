'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import StatCard from '@/components/StatCard'
import Chart from '@/components/Chart'
import DataTable from '@/components/DataTable'
import Badge from '@/components/Badge'

type Period = '7' | '30' | '90'

interface Overview {
  period_days: number
  ai_cost_estimate: number
  whatsapp_cost_estimate: number
  total_cost_estimate: number
  ai_calls: number
  messages_sent: number
  conversations: number
  active_customers: number
  avg_messages_per_customer: number
  avg_ai_requests_per_conversation: number
  bookings_and_orders: number
  booking_order_conversion_rate: number
}

interface TrendPoint extends Record<string, unknown> {
  date: string
  ai_cost: number
  whatsapp_cost: number
  total_cost: number
}

interface ToolRow extends Record<string, unknown> {
  tool: string
  count: number
  cost_estimate: number
}

interface BizUsageRow extends Record<string, unknown> {
  id: string
  name: string
  type: string
  plan: string
  ai_cost_estimate: number
  whatsapp_cost_estimate: number
  total_cost_estimate: number
  messages_sent: number
  ai_calls: number
  over_soft_limit: boolean
}

const fmtUsd = (n: number) => `$${n.toFixed(2)}`

export default function UsagePage() {
  const [period, setPeriod] = useState<Period>('30')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [byTool, setByTool] = useState<ToolRow[]>([])
  const [byBusiness, setByBusiness] = useState<BizUsageRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/admin/usage/overview?days=${period}`),
      api.get(`/admin/usage/trend?days=${period}`),
      api.get(`/admin/usage/by-tool?days=${period}`),
      api.get(`/admin/usage/by-business?days=${period}`),
    ]).then(([ov, tr, tool, biz]) => {
      setOverview(ov.data)
      setTrend(tr.data)
      setByTool(tool.data)
      setByBusiness(biz.data)
    }).finally(() => setLoading(false))
  }, [period])

  const periodBtn = (p: Period, label: string) => (
    <button
      onClick={() => setPeriod(p)}
      className="h-8 px-3 rounded-lg text-sm transition-colors"
      style={{
        background: period === p ? 'var(--coral)' : 'white',
        color: period === p ? 'white' : 'var(--text-muted)',
        border: '1.5px solid ' + (period === p ? 'var(--coral)' : 'var(--border)'),
      }}
    >
      {label}
    </button>
  )

  const cardStyle = { border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

  return (
    <div>
      <Header
        title="AI Usage & Costs"
        subtitle="Estimated WhatsApp + Claude API cost, tracked per business — pilot monitoring only, nothing here blocks a customer's conversation"
        action={
          <div className="flex gap-2">
            {periodBtn('7', '7d')}
            {periodBtn('30', '30d')}
            {periodBtn('90', '90d')}
          </div>
        }
      />

      {loading || !overview ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Est. Cost" value={fmtUsd(overview.total_cost_estimate)} sub={`last ${overview.period_days}d`} color="var(--coral)" />
            <StatCard label="AI (Claude) Cost" value={fmtUsd(overview.ai_cost_estimate)} sub={`${overview.ai_calls} calls`} color="var(--lavender)" />
            <StatCard label="WhatsApp Cost" value={fmtUsd(overview.whatsapp_cost_estimate)} sub={`${overview.messages_sent} messages`} color="var(--mint)" />
            <StatCard label="Active Customers" value={overview.active_customers} sub={`${overview.conversations} conversations`} color="var(--warning)" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Avg Msgs / Customer" value={overview.avg_messages_per_customer} color="var(--lavender)" />
            <StatCard label="Avg AI Requests / Conv." value={overview.avg_ai_requests_per_conversation} color="var(--mint)" />
            <StatCard label="Bookings + Orders" value={overview.bookings_and_orders} color="var(--success)" />
            <StatCard label="Booking/Order Conv. Rate" value={`${overview.booking_order_conversion_rate}%`} sub="per active customer" color="var(--coral)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Estimated Cost Over Time</h3>
              <Chart data={trend} type="area" dataKey="total_cost" xKey="date" color="var(--coral)" />
            </div>
            <div className="bg-white rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Cost by Tool / Call Site</h3>
              <Chart data={byTool} type="bar" dataKey="cost_estimate" xKey="tool" color="var(--lavender)" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Usage by Business
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                flagged for review above the pilot's soft monthly message allowance — never blocked automatically
              </span>
            </h3>
            <DataTable<BizUsageRow>
              rows={byBusiness}
              emptyText="No usage recorded yet for this period"
              columns={[
                { key: 'name', label: 'Business', render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
                    <Badge value={r.type} />
                  </div>
                ) },
                { key: 'plan', label: 'Plan', render: (r) => <Badge value={r.plan} /> },
                { key: 'messages_sent', label: 'Messages Sent' },
                { key: 'ai_calls', label: 'AI Calls' },
                { key: 'ai_cost_estimate', label: 'AI Cost', render: (r) => fmtUsd(r.ai_cost_estimate) },
                { key: 'whatsapp_cost_estimate', label: 'WhatsApp Cost', render: (r) => fmtUsd(r.whatsapp_cost_estimate) },
                { key: 'total_cost_estimate', label: 'Total Cost', render: (r) => (
                  <span className="font-medium" style={{ color: 'var(--coral)' }}>{fmtUsd(r.total_cost_estimate)}</span>
                ) },
                { key: 'over_soft_limit', label: 'Status', render: (r) =>
                  r.over_soft_limit
                    ? <Badge value="overdue" label="Review" />
                    : <Badge value="ok" label="Normal" />
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
