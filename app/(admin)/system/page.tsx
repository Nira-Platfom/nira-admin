'use client'

import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface SystemHealth {
  api: string
  database: string
  whatsapp_token: string
  claude_api: string
  active_bots: number
  messages_last_hour: number
  checked_at: string
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ok') return <CheckCircle size={18} style={{ color: 'var(--success)' }} />
  if (status === 'missing') return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
  return <XCircle size={18} style={{ color: 'var(--danger)' }} />
}

function StatusRow({ label, status, desc }: { label: string; status: string; desc?: string }) {
  const colors: Record<string, string> = {
    ok: 'var(--success)',
    missing: 'var(--warning)',
    error: 'var(--danger)',
  }
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>}
      </div>
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <span className="text-sm font-medium capitalize" style={{ color: colors[status] || 'var(--text-muted)' }}>
          {status}
        </span>
      </div>
    </div>
  )
}

export default function SystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/system/health').then((res) => setHealth(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 60000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const overallOk = health && health.database === 'ok' && health.whatsapp_token === 'ok' && health.claude_api === 'ok'

  return (
    <div>
      <Header
        title="System Health"
        subtitle="Auto-refreshes every 60 seconds"
        action={
          <button onClick={load} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm" style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      {loading && !health ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : health ? (
        <div className="max-w-2xl space-y-6">
          {/* Overall status banner */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: overallOk ? 'var(--mint-light)' : '#FEF9C3',
              border: `1px solid ${overallOk ? 'var(--mint)' : 'var(--warning)'}`,
            }}
          >
            {overallOk ? <CheckCircle size={20} style={{ color: 'var(--success)' }} /> : <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />}
            <div>
              <div className="text-sm font-medium" style={{ color: overallOk ? 'var(--success)' : '#854D0E' }}>
                {overallOk ? 'All systems operational' : 'One or more systems need attention'}
              </div>
              <div className="text-xs" style={{ color: overallOk ? '#166534' : '#92400E' }}>
                Last checked: {new Date(health.checked_at).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Service checks */}
          <div className="bg-white rounded-2xl px-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <StatusRow label="API Server" status={health.api} desc="FastAPI backend is responding" />
            <StatusRow label="Database" status={health.database} desc="PostgreSQL connection (Neon)" />
            <StatusRow label="WhatsApp Token" status={health.whatsapp_token} desc="Meta Cloud API credentials" />
            <StatusRow label="Claude API" status={health.claude_api} desc="Anthropic API key for AI responses" />
          </div>

          {/* Live metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Active Bots</div>
              <div className="text-3xl font-medium" style={{ color: 'var(--coral)' }}>{health.active_bots}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Businesses with bot enabled</div>
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Messages (1h)</div>
              <div className="text-3xl font-medium" style={{ color: 'var(--lavender)' }}>{health.messages_last_hour}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>WhatsApp messages in last hour</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
