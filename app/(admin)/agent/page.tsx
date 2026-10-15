'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'

interface Turn {
  id: string
  channel: string
  message: string
  reply: string | null
  tools: string[]
  latency_ms: number | null
  error: string | null
  input_tokens: number | null
  output_tokens: number | null
  created_at: string
}

export default function AgentPage() {
  const [data, setData] = useState<{ last_7_days: { turns: number; avg_latency_ms: number; errors: number }; turns: Turn[] } | null>(null)
  const [errorsOnly, setErrorsOnly] = useState(false)

  useEffect(() => {
    api.get('/admin/agent/turns', { params: { limit: 100, errors_only: errorsOnly } }).then((res) => setData(res.data))
  }, [errorsOnly])

  return (
    <div>
      <Header
        title="Nira Agent"
        subtitle="Every agent turn on WhatsApp and the web — what the customer said, which tools ran, and what Nira replied"
        action={
          <button
            onClick={() => setErrorsOnly((v) => !v)}
            className="h-9 px-4 rounded-lg text-sm font-medium"
            style={{ background: errorsOnly ? 'var(--coral)' : 'white', color: errorsOnly ? 'white' : 'var(--text-muted)', border: '1.5px solid var(--border)' }}
          >
            {errorsOnly ? 'Showing errors only' : 'Show errors only'}
          </button>
        }
      />
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            ['Turns (7 days)', data.last_7_days.turns.toLocaleString()],
            ['Avg latency', `${(data.last_7_days.avg_latency_ms / 1000).toFixed(1)}s`],
            ['Errors', String(data.last_7_days.errors)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-white p-4" style={{ border: '1px solid var(--border)' }}>
              <div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{l}</div>
              <div className="text-2xl font-medium mt-1">{v}</div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {data?.turns.map((t) => (
          <div key={t.id} className="rounded-xl bg-white p-4" style={{ border: `1px solid ${t.error ? 'var(--coral)' : 'var(--border)'}` }}>
            <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>{t.channel} · {new Date(t.created_at).toLocaleString()}</span>
              <span>{t.latency_ms ? `${(t.latency_ms / 1000).toFixed(1)}s` : ''} · {t.input_tokens ?? 0}/{t.output_tokens ?? 0} tok</span>
            </div>
            <p className="text-sm"><span className="font-medium">Customer:</span> {t.message}</p>
            {t.tools.length > 0 && <p className="text-xs my-1" style={{ color: 'var(--text-muted)' }}>Tools: {t.tools.join(' → ')}</p>}
            <p className="text-sm whitespace-pre-wrap"><span className="font-medium">Nira:</span> {t.reply}</p>
            {t.error && <p className="text-xs mt-1" style={{ color: 'var(--coral)' }}>{t.error}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
