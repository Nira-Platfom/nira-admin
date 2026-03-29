'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import Chart from '@/components/Chart'

type Period = '7' | '30' | '90'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30')
  const [messages, setMessages] = useState<{ date: string; count: number }[]>([])
  const [growth, setGrowth] = useState<{ date: string; count: number }[]>([])
  const [plans, setPlans] = useState<{ plan: string; count: number }[]>([])
  const [intents, setIntents] = useState<{ intent: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/admin/analytics/messages-over-time?days=${period}`),
      api.get(`/admin/analytics/businesses-growth?days=${period}`),
      api.get('/admin/analytics/plan-breakdown'),
      api.get('/admin/analytics/intent-breakdown'),
    ]).then(([msg, gr, pl, int]) => {
      setMessages(msg.data)
      setGrowth(gr.data)
      setPlans(pl.data)
      setIntents(int.data)
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

  return (
    <div>
      <Header
        title="Analytics"
        subtitle="Platform-wide usage and growth metrics"
        action={
          <div className="flex gap-2">
            {periodBtn('7', '7d')}
            {periodBtn('30', '30d')}
            {periodBtn('90', '90d')}
          </div>
        }
      />

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Messages Over Time</h3>
              <Chart data={messages} type="area" dataKey="count" xKey="date" color="var(--coral)" />
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Business Growth</h3>
              <Chart data={growth} type="area" dataKey="count" xKey="date" color="var(--lavender)" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Plan Distribution</h3>
              <Chart data={plans} type="pie" dataKey="count" nameKey="plan" />
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Top Intents</h3>
              <Chart data={intents} type="bar" dataKey="count" xKey="intent" color="var(--mint)" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
