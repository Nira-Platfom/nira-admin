'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, BarChart2,
  MessageSquare, Server, LogOut, Clock, Star, ScrollText,
} from 'lucide-react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/businesses', label: 'Businesses', icon: Building2 },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/chatbot', label: 'Chatbot Logs', icon: MessageSquare },
  { href: '/reviews', label: 'Reviews', icon: Star },
]

const MAINTENANCE_NAV = [
  { href: '/system', label: 'System Health', icon: Server },
  { href: '/jobs', label: 'Scheduled Jobs', icon: Clock },
  { href: '/audit-log', label: 'Audit Log', icon: ScrollText },
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
        <Image
          src="/logo.png"
          alt="Nira"
          width={72}
          height={28}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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

        <p className="px-3 pt-5 pb-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Maintenance
        </p>
        {MAINTENANCE_NAV.map(({ href, label, icon: Icon }) => {
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
