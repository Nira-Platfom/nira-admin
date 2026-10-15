'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'

interface BusinessTotal {
  business_id: string
  business: string
  transactions: number
  gross: number
  owed: number
  paid: number
  disputed: number
}
interface Entry {
  id: string
  business_id: string
  business: string
  kind: string
  nira_ref: string | null
  gross_amount: number
  rate: number
  commission_amount: number
  status: string
  dispute_reason: string | null
  resolution_note: string | null
  created_at: string
}

const tzs = (n: number) => `TZS ${Math.round(n).toLocaleString('en-US')}`
const thisMonth = () => new Date().toISOString().slice(0, 7)

export default function CommissionsPage() {
  const [month, setMonth] = useState(thisMonth())
  const [status, setStatus] = useState('')
  const [data, setData] = useState<{ businesses: BusinessTotal[]; entries: Entry[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [rateFor, setRateFor] = useState<BusinessTotal | null>(null)
  const [rates, setRates] = useState({ booking: '', order: '' })

  const load = () => {
    setLoading(true)
    api
      .get('/admin/commissions', { params: { month, status: status || undefined } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [month, status])

  const resolve = async (e: Entry, uphold: boolean) => {
    const note = window.prompt(uphold ? 'Note for the business (why the charge stands):' : 'Note for the business (why it is waived):') ?? ''
    await api.post(`/admin/commissions/${e.id}/resolve`, { uphold, note: note || null })
    load()
  }

  const markPaid = async (b: BusinessTotal) => {
    if (!window.confirm(`Mark ${tzs(b.owed)} from ${b.business} as paid for ${month}?`)) return
    await api.post('/admin/commissions/mark-paid', { business_id: b.business_id, month })
    load()
  }

  const saveRates = async () => {
    if (!rateFor) return
    const body: Record<string, number | boolean> = {}
    if (rates.booking !== '') body.commission_rate_booking = Number(rates.booking) / 100
    if (rates.order !== '') body.commission_rate_order = Number(rates.order) / 100
    await api.put(`/admin/businesses/${rateFor.business_id}/commission`, body)
    setRateFor(null)
    setRates({ booking: '', order: '' })
  }

  const inputStyle = { border: '1.5px solid var(--border)', background: 'white' }

  return (
    <div>
      <Header
        title="Commissions"
        subtitle="Completed Nira-attributed bookings and orders, what each business owes, and disputes to review"
        action={
          <div className="flex gap-2">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 px-3 rounded-lg text-sm" style={inputStyle} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 px-3 rounded-lg text-sm" style={inputStyle}>
              <option value="">All statuses</option>
              {['accrued', 'disputed', 'waived', 'paid', 'void'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />

      {loading || !data ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <>
          <div className="rounded-xl bg-white overflow-x-auto mb-6" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                  <th className="p-3">Business</th><th className="p-3">Txns</th><th className="p-3">Gross</th>
                  <th className="p-3">Owed</th><th className="p-3">Paid</th><th className="p-3">Disputes</th><th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {data.businesses.length === 0 && (
                  <tr><td className="p-3" colSpan={7} style={{ color: 'var(--text-muted)' }}>No commission activity this month.</td></tr>
                )}
                {data.businesses.map((b) => (
                  <tr key={b.business_id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="p-3 font-medium">{b.business}</td>
                    <td className="p-3">{b.transactions}</td>
                    <td className="p-3">{tzs(b.gross)}</td>
                    <td className="p-3 font-medium">{tzs(b.owed)}</td>
                    <td className="p-3">{tzs(b.paid)}</td>
                    <td className="p-3">{b.disputed || '—'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button onClick={() => setRateFor(b)} className="text-xs mr-3" style={{ color: 'var(--text-muted)' }}>Set rates</button>
                      {b.owed > 0 && (
                        <button onClick={() => markPaid(b)} className="h-8 px-3 rounded-lg text-xs font-medium text-white" style={{ background: 'var(--coral)' }}>
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-sm font-medium mb-2">Line items</h2>
          <div className="rounded-xl bg-white overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                  <th className="p-3">Ref</th><th className="p-3">Business</th><th className="p-3">Type</th><th className="p-3">Gross</th>
                  <th className="p-3">Commission</th><th className="p-3">Status</th><th className="p-3">Dispute</th><th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e) => (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="p-3 font-medium">{e.nira_ref ?? '—'}</td>
                    <td className="p-3">{e.business}</td>
                    <td className="p-3 capitalize">{e.kind}</td>
                    <td className="p-3">{tzs(e.gross_amount)}</td>
                    <td className="p-3">{tzs(e.commission_amount)} ({(e.rate * 100).toFixed(1)}%)</td>
                    <td className="p-3 capitalize">{e.status}</td>
                    <td className="p-3 max-w-[260px]" style={{ color: 'var(--text-muted)' }}>{e.dispute_reason ?? ''}{e.resolution_note ? ` → ${e.resolution_note}` : ''}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {e.status === 'disputed' && (
                        <>
                          <button onClick={() => resolve(e, false)} className="text-xs mr-3 font-medium" style={{ color: 'var(--coral)' }}>Waive</button>
                          <button onClick={() => resolve(e, true)} className="text-xs font-medium">Uphold</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {rateFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.4)' }}>
          <div className="bg-white rounded-xl p-6 w-[360px]">
            <h3 className="font-medium mb-1">Commission rates — {rateFor.business}</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Percent. Leave blank to keep the current value. Applies to future completions only.</p>
            <label className="text-xs">Bookings %</label>
            <input type="number" min={0} max={50} step={0.5} value={rates.booking} onChange={(e) => setRates({ ...rates, booking: e.target.value })}
              className="w-full h-9 px-3 rounded-lg text-sm mb-3" style={inputStyle} />
            <label className="text-xs">Orders %</label>
            <input type="number" min={0} max={50} step={0.5} value={rates.order} onChange={(e) => setRates({ ...rates, order: e.target.value })}
              className="w-full h-9 px-3 rounded-lg text-sm mb-4" style={inputStyle} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRateFor(null)} className="h-9 px-4 text-sm">Cancel</button>
              <button onClick={saveRates} className="h-9 px-4 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--coral)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
