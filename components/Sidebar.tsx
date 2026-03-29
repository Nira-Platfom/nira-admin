'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, BarChart2,
  MessageSquare, Server, LogOut, Sparkles,
} from 'lucide-react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/businesses', label: 'Businesses', icon: Building2 },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/chatbot', label: 'Chatbot Logs', icon: MessageSquare },
  { href: '/system', label: 'System', icon: Server },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove('nira_admin_key')
    router.push('/login')
  }

  return (
    <aside
      className="flex flex-col w-64 min-h-screen"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--coral)' }}>
          <Sparkles size={16} color="#fff" />
        </div>
        <div>
          <span className="text-white font-medium text-sm" style={{ fontFamily: 'var(--font-dm-serif)' }}>
            Nira Admin
          </span>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Super Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'rgba(255,107,107,0.15)' : 'transparent',
                color: active ? 'var(--coral)' : 'rgba(255,255,255,0.6)',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
