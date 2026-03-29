'use client'

import { useEffect, useState, useRef } from 'react'
import api from '@/lib/api'
import Header from '@/components/Header'
import Badge from '@/components/Badge'
import { RefreshCw, X } from 'lucide-react'

interface Conversation {
  id: string
  business_id: string
  business_name: string
  customer_name: string
  customer_phone: string
  direction: 'inbound' | 'outbound'
  message: string
  response: string | null
  intent: string | null
  created_at: string
}

interface ModalThread {
  businessName: string
  customerName: string
  phone: string
  convs: Conversation[]
}

export default function ChatbotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [businessFilter, setBusinessFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalThread | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = () => {
    const params = new URLSearchParams({ limit: '100' })
    if (businessFilter) params.set('business_id', businessFilter)
    api.get(`/admin/chatbot/conversations?${params}`).then((res) => {
      setConversations(res.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessFilter])

  const openThread = (phone: string, businessId: string) => {
    const thread = conversations.filter(
      (c) => c.customer_phone === phone && c.business_id === businessId
    )
    if (thread.length > 0) {
      setModal({
        businessName: thread[0].business_name,
        customerName: thread[0].customer_name,
        phone,
        convs: thread.slice().reverse(),
      })
    }
  }

  // Deduplicate by customer_phone + business_id for the list view
  const seen = new Set<string>()
  const uniqueConvs = conversations.filter((c) => {
    const key = `${c.customer_phone}-${c.business_id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const uniqueBusinesses = Array.from(new Map(conversations.map((c) => [c.business_id, c.business_name])).entries())

  return (
    <div>
      <Header
        title="Chatbot Logs"
        subtitle="Live WhatsApp conversation feed (auto-refreshes every 30s)"
        action={
          <button onClick={load} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm" style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      <div className="flex gap-3 mb-6">
        <select
          value={businessFilter}
          onChange={(e) => setBusinessFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border text-sm outline-none"
          style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
        >
          <option value="">All businesses</option>
          {uniqueBusinesses.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div className="space-y-2">
          {uniqueConvs.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>No conversations yet</div>
          ) : uniqueConvs.map((c) => (
            <div
              key={`${c.customer_phone}-${c.business_id}`}
              onClick={() => openThread(c.customer_phone, c.business_id)}
              className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-4"
              style={{ border: '0.5px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-white font-medium flex-shrink-0"
                style={{ background: 'var(--lavender)' }}
              >
                {c.customer_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.customer_name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {c.business_name}</span>
                  {c.intent && <Badge value={c.intent} label={c.intent} />}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.message}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Conversation modal */}
      {modal && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl overflow-hidden"
            style={{ maxHeight: '70vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{modal.customerName}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{modal.phone} · {modal.businessName}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(70vh - 64px)' }}>
              {modal.convs.map((c) => (
                <div key={c.id}>
                  {/* Customer message */}
                  <div className="flex justify-start mb-2">
                    <div
                      className="max-w-xs px-3 py-2 rounded-xl rounded-bl-sm text-sm"
                      style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      {c.message}
                    </div>
                  </div>
                  {/* Bot response */}
                  {c.response && (
                    <div className="flex justify-end">
                      <div
                        className="max-w-xs px-3 py-2 rounded-xl rounded-br-sm text-sm"
                        style={{ background: 'var(--lavender-light)', color: 'var(--text-primary)' }}
                      >
                        {c.response}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
