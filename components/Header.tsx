'use client'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
