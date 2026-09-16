'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import DataTable from '@/components/DataTable'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface LogRow {
  [key: string]: unknown
  id: string
  action: string
  user_id: string | null
  business_id: string | null
  actor_email: string | null
  actor_ip: string | null
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown>
  created_at: string
}

const PAGE_SIZE = 30

export default function AuditLogPage() {
  const [data, setData] = useState<{ total: number; logs: LogRow[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      api
        .get('/admin/audit-logs', { params: { page, limit: PAGE_SIZE, action: action || undefined } })
        .then((res) => setData(res.data))
        .finally(() => setLoading(false))
    }, action ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, action])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div>
      <Header
        title="Audit Log"
        subtitle="Every security-sensitive action recorded across the platform"
        action={
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1) }}
              placeholder="Filter by action, e.g. login"
              className="h-9 pl-8 pr-3 rounded-lg text-sm outline-none w-56"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
            />
          </div>
        }
      />

      <DataTable<LogRow>
        columns={[
          {
            key: 'action',
            label: 'Action',
            render: (r) => <code className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--slate-light)', color: 'var(--text-primary)' }}>{r.action}</code>,
          },
          {
            key: 'resource_type',
            label: 'Resource',
            render: (r) => r.resource_type ? (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.resource_type}{r.resource_id ? ` · ${r.resource_id.slice(0, 8)}` : ''}</span>
            ) : <span style={{ color: 'var(--text-faint, var(--text-muted))' }}>—</span>,
          },
          {
            key: 'actor_email',
            label: 'Actor',
            render: (r) => <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.actor_email || (r.user_id ? r.user_id.slice(0, 8) : 'system/bot')}</span>,
          },
          { key: 'actor_ip', label: 'IP', render: (r) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.actor_ip || '—'}</span> },
          {
            key: 'created_at',
            label: 'When',
            render: (r) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</span>,
          },
          {
            key: 'details',
            label: '',
            render: (r) => (
              Object.keys(r.details || {}).length > 0 ? (
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="text-xs font-medium"
                  style={{ color: 'var(--coral)' }}
                >
                  {expanded === r.id ? 'Hide' : 'Details'}
                </button>
              ) : null
            ),
          },
        ]}
        rows={loading ? [] : data?.logs ?? []}
        emptyText={loading ? 'Loading...' : 'No matching audit entries.'}
      />

      {expanded && data && (
        <pre
          className="mt-3 text-xs p-3 rounded-lg overflow-x-auto"
          style={{ background: 'var(--slate-light)', color: 'var(--text-primary)' }}
        >
          {JSON.stringify(data.logs.find((l) => l.id === expanded)?.details ?? {}, null, 2)}
        </pre>
      )}

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {data.total} entries · page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-40"
              style={{ border: '1px solid var(--border)', background: 'white' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-40"
              style={{ border: '1px solid var(--border)', background: 'white' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
