'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import Badge from '@/components/Badge'
import { RefreshCw, ChevronDown, Clock, AlertTriangle } from 'lucide-react'

interface LastRun {
  started_at: string
  finished_at: string | null
  status: 'running' | 'success' | 'error'
  items_processed: number | null
  error: string | null
}

interface Job {
  job_id: string
  schedule: string
  last_run: LastRun | null
  overdue: boolean
}

interface RunRow {
  id: string
  started_at: string
  finished_at: string | null
  status: string
  items_processed: number | null
  error: string | null
}

const JOB_LABELS: Record<string, string> = {
  booking_reminders: 'Booking Reminders',
  review_requests: 'Review Requests (Bookings)',
  order_review_requests: 'Review Requests (Orders)',
  reengagement: 'Customer Re-engagement',
  scheduled_broadcasts: 'Scheduled Broadcasts',
  keep_alive: 'Keep-Alive Ping',
}

const JOB_DESC: Record<string, string> = {
  booking_reminders: 'Sends a WhatsApp reminder for every booking scheduled today.',
  review_requests: 'Asks for a rating once a booking is marked completed.',
  order_review_requests: 'Asks for a rating once a product order is marked delivered.',
  reengagement: 'Nudges customers who have gone quiet for 60+ days.',
  scheduled_broadcasts: 'Sends any business broadcast whose scheduled time has arrived.',
  keep_alive: 'Pings the backend itself so Render’s free tier does not sleep it.',
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function RunsPanel({ jobId }: { jobId: string }) {
  const [runs, setRuns] = useState<RunRow[] | null>(null)

  useEffect(() => {
    api.get(`/admin/jobs/${jobId}/runs`, { params: { limit: 15 } }).then((res) => setRuns(res.data))
  }, [jobId])

  if (!runs) return <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>Loading history…</p>
  if (runs.length === 0) return <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No runs recorded yet.</p>

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {runs.map((r) => (
          <div key={r.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg" style={{ background: 'var(--slate-light)' }}>
            <div className="flex items-center gap-2">
              <Badge value={r.status} />
              <span style={{ color: 'var(--text-muted)' }}>{new Date(r.started_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {r.items_processed !== null && (
                <span style={{ color: 'var(--text-primary)' }}>{r.items_processed} item(s)</span>
              )}
              {r.error && <span style={{ color: 'var(--danger)' }} title={r.error}>failed</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/jobs').then((res) => setJobs(res.data.jobs)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const overdueCount = jobs?.filter((j) => j.overdue).length ?? 0

  return (
    <div>
      <Header
        title="Scheduled Jobs"
        subtitle="Background tasks that run with no incoming message at all"
        action={
          <button onClick={load} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm" style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      {loading && !jobs ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : jobs ? (
        <div className="max-w-3xl space-y-4">
          {overdueCount > 0 && (
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: '#FEF9C3', border: '1px solid var(--warning)' }}
            >
              <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
              <div className="text-sm font-medium" style={{ color: '#854D0E' }}>
                {overdueCount} job{overdueCount === 1 ? ' is' : 's are'} overdue — check whether the scheduler is running.
              </div>
            </div>
          )}

          {jobs.map((job) => (
            <div key={job.job_id} className="bg-white rounded-2xl" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{JOB_LABELS[job.job_id] || job.job_id}</h3>
                      {job.overdue ? (
                        <Badge value="overdue" />
                      ) : job.last_run ? (
                        <Badge value={job.last_run.status} />
                      ) : (
                        <Badge value="missing" label="never run" />
                      )}
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{JOB_DESC[job.job_id]}</p>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-faint, var(--text-muted))' }}>
                      <Clock size={12} />
                      {job.schedule}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Last run</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {timeAgo(job.last_run?.started_at ?? null)}
                    </div>
                    {job.last_run?.items_processed !== null && job.last_run?.items_processed !== undefined && (
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{job.last_run.items_processed} item(s)</div>
                    )}
                  </div>
                </div>

                {job.last_run?.error && (
                  <div className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                    {job.last_run.error}
                  </div>
                )}

                <button
                  onClick={() => setExpanded(expanded === job.job_id ? null : job.job_id)}
                  className="flex items-center gap-1 text-xs font-medium mt-3"
                  style={{ color: 'var(--coral)' }}
                >
                  <ChevronDown size={13} style={{ transform: expanded === job.job_id ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }} />
                  {expanded === job.job_id ? 'Hide history' : 'View recent runs'}
                </button>

                {expanded === job.job_id && <RunsPanel jobId={job.job_id} />}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
