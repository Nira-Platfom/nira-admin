interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function StatCard({ label, value, sub, color = 'var(--coral)' }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-4 flex flex-col gap-1"
      style={{
        border: '0.5px solid var(--border)',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}
