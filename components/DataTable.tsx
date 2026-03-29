interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  emptyText?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  emptyText = 'No data',
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '0.5px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--slate-light)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
