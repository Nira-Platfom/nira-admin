'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import Header from '@/components/Header'
import Badge from '@/components/Badge'
import StatCard from '@/components/StatCard'
import { ArrowLeft, Bot, Wifi, Save } from 'lucide-react'

interface BusinessDetail {
  id: string
  name: string
  type: string
  phone: string
  city: string
  location: string
  whatsapp_phone_id: string
  whatsapp_connected: boolean
  bot_active: boolean
  bot_language: string
  onboarding_completed: boolean
  created_at: string
  subscription: {
    plan: string
    status: string
    trial_ends_at: string
    current_period_end: string
  } | null
  members: {
    id: string
    full_name: string
    email: string
    role: string
    is_active: boolean
    joined_at: string
  }[]
  stats: {
    customers: number
    conversations: number
    bookings: number
    orders: number
  }
  recent_conversations: {
    id: string
    customer_name: string
    direction: string
    message: string
    intent: string
    created_at: string
  }[]
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [biz, setBiz] = useState<BusinessDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editPlan, setEditPlan] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editBot, setEditBot] = useState(false)

  useEffect(() => {
    api.get(`/admin/businesses/${id}`).then((res) => {
      setBiz(res.data)
      setEditPlan(res.data.subscription?.plan || 'free')
      setEditStatus(res.data.subscription?.status || 'trialing')
      setEditBot(res.data.bot_active)
    }).finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/businesses/${id}`, {
        plan: editPlan,
        status: editStatus,
        bot_active: editBot,
      })
      const res = await api.get(`/admin/businesses/${id}`)
      setBiz(res.data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
  if (!biz) return <div className="text-sm" style={{ color: 'var(--danger)' }}>Business not found</div>

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} />
        Back to businesses
      </button>

      <Header
        title={biz.name}
        subtitle={`${biz.city} · Created ${new Date(biz.created_at).toLocaleDateString()}`}
        action={
          <div className="flex gap-2">
            <Badge value={biz.type} />
            {biz.whatsapp_connected && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--mint-light)', color: 'var(--mint)' }}>
                <Wifi size={10} /> WhatsApp
              </span>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Customers" value={biz.stats.customers} color="var(--coral)" />
        <StatCard label="Messages" value={biz.stats.conversations} color="var(--lavender)" />
        <StatCard label="Bookings" value={biz.stats.bookings} color="var(--mint)" />
        <StatCard label="Orders" value={biz.stats.orders} color="var(--warning)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit panel */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Admin Controls</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Plan</label>
              <select
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border text-sm outline-none"
                style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Subscription Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border text-sm outline-none"
                style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
              >
                <option value="trialing">Trialing</option>
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Bot Active</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Enables WhatsApp bot</div>
              </div>
              <button
                onClick={() => setEditBot(!editBot)}
                className="w-10 h-6 rounded-full transition-colors relative"
                style={{ background: editBot ? 'var(--coral)' : 'var(--border)' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: editBot ? 'translateX(20px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-9 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--coral)' }}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Team Members</h3>
          <div className="space-y-3">
            {biz.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium flex-shrink-0"
                  style={{ background: m.role === 'owner' ? 'var(--coral)' : 'var(--lavender)' }}
                >
                  {m.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{m.full_name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.email}</div>
                </div>
                <Badge value={m.role} />
              </div>
            ))}
            {biz.members.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No members</p>
            )}
          </div>
        </div>

        {/* Recent conversations */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Recent Messages</h3>
          <div className="space-y-3">
            {biz.recent_conversations.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.customer_name}</span>
                  {c.intent && <Badge value={c.intent} label={c.intent} />}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.message}</p>
              </div>
            ))}
            {biz.recent_conversations.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
