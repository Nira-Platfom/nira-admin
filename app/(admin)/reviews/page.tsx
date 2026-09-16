'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import Header from '@/components/Header'
import DataTable from '@/components/DataTable'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface ReviewRow {
  [key: string]: unknown
  id: string
  business_id: string
  business_name: string
  customer_name: string
  rating: number
  comment: string | null
  is_verified: boolean
  business_reply: string | null
  created_at: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? '#F59E0B' : 'none'}
          style={{ color: i < rating ? '#F59E0B' : 'var(--border)' }}
        />
      ))}
    </div>
  )
}

const PAGE_SIZE = 20

export default function ReviewsPage() {
  const [data, setData] = useState<{ total: number; reviews: ReviewRow[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lowOnly, setLowOnly] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .get('/admin/reviews', { params: { page, limit: PAGE_SIZE, max_rating: lowOnly ? 2 : undefined } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [page, lowOnly])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div>
      <Header
        title="Reviews"
        subtitle="Every rating left across the platform, newest first"
        action={
          <button
            onClick={() => { setLowOnly((v) => !v); setPage(1) }}
            className="h-9 px-4 rounded-lg text-sm font-medium"
            style={{
              background: lowOnly ? 'var(--coral)' : 'white',
              color: lowOnly ? 'white' : 'var(--text-muted)',
              border: '1.5px solid var(--border)',
            }}
          >
            {lowOnly ? 'Showing 1–2 ★ only' : 'Show 1–2 ★ only'}
          </button>
        }
      />

      <DataTable<ReviewRow>
        columns={[
          {
            key: 'business_name',
            label: 'Business',
            render: (r) => (
              <Link href={`/businesses/${r.business_id}`} className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>
                {r.business_name}
              </Link>
            ),
          },
          { key: 'customer_name', label: 'Customer' },
          { key: 'rating', label: 'Rating', render: (r) => <Stars rating={r.rating} /> },
          {
            key: 'comment',
            label: 'Comment',
            render: (r) => (
              <span className="text-sm" style={{ color: r.comment ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {r.comment || '—'}
              </span>
            ),
          },
          {
            key: 'is_verified',
            label: 'Verified',
            render: (r) => (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={r.is_verified ? { background: '#DCFCE7', color: '#166534' } : { background: 'var(--slate-light)', color: 'var(--text-muted)' }}
              >
                {r.is_verified ? 'Real order/booking' : 'Unverified'}
              </span>
            ),
          },
          {
            key: 'created_at',
            label: 'Date',
            render: (r) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</span>,
          },
        ]}
        rows={loading ? [] : data?.reviews ?? []}
        emptyText={loading ? 'Loading...' : lowOnly ? 'No low ratings — good sign.' : 'No reviews yet.'}
      />

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {data.total} review{data.total === 1 ? '' : 's'} total · page {page} of {totalPages}
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
