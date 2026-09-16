const VARIANTS: Record<string, { bg: string; color: string }> = {
  free:        { bg: '#F1F5F9', color: '#64748B' },
  pro:         { bg: '#F0ECFB', color: '#9B8BC8' },
  business:    { bg: '#E4F7F3', color: '#4DB8A0' },
  trialing:    { bg: '#FEF9C3', color: '#854D0E' },
  active:      { bg: '#DCFCE7', color: '#166534' },
  past_due:    { bg: '#FEE2E2', color: '#991B1B' },
  cancelled:   { bg: '#F1F5F9', color: '#64748B' },
  owner:       { bg: '#FFE8E8', color: '#E55555' },
  admin:       { bg: '#F0ECFB', color: '#9B8BC8' },
  staff:       { bg: '#E4F7F3', color: '#4DB8A0' },
  salon_spa:   { bg: '#F0ECFB', color: '#9B8BC8' },
  cosmetic_shop: { bg: '#FFE8E8', color: '#E55555' },
  ok:          { bg: '#DCFCE7', color: '#166534' },
  error:       { bg: '#FEE2E2', color: '#991B1B' },
  missing:     { bg: '#FEF9C3', color: '#854D0E' },
  success:     { bg: '#DCFCE7', color: '#166534' },
  running:     { bg: '#F0ECFB', color: '#9B8BC8' },
  overdue:     { bg: '#FEE2E2', color: '#991B1B' },
}

interface BadgeProps {
  value: string
  label?: string
}

export default function Badge({ value, label }: BadgeProps) {
  const style = VARIANTS[value] || { bg: '#F1F5F9', color: '#64748B' }
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {label || value}
    </span>
  )
}
