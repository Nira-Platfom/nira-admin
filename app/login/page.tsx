'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Store whatever the user typed — the backend validates it on every API call
    Cookies.set('nira_admin_key', secret, { expires: 1 })
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-8"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--coral)' }}
          >
            <Sparkles size={28} color="#fff" />
          </div>
          <h1
            className="text-2xl font-medium"
            style={{ fontFamily: 'var(--font-dm-serif)', color: 'var(--text-primary)' }}
          >
            Nira Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Super admin access only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Admin Secret
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter admin secret"
                className="w-full h-12 px-4 pr-10 rounded-xl border text-sm outline-none transition-colors"
                style={{
                  border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
                  background: 'var(--slate-light)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full h-12 rounded-xl text-white text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: 'var(--coral)' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Nira Platform · Internal Use Only
        </p>
      </div>
    </div>
  )
}
