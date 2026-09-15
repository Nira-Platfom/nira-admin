'use client'

import { useRef, useState } from 'react'
import api from '@/lib/api'
import { X, FileUp, Image as ImageIcon, Loader2, Trash2, Plus, CheckCircle2 } from 'lucide-react'

type Kind = 'products' | 'services'

type FieldConfig = {
  key: string
  label: string
  required?: boolean
  numeric?: boolean
  boolean?: boolean
  wide?: boolean
}

const PRODUCT_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Name', required: true, wide: true },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price (TZS)', required: true, numeric: true },
  { key: 'brand', label: 'Brand' },
  { key: 'skin_type', label: 'Skin type' },
  { key: 'is_african_made', label: 'African-made', boolean: true },
  { key: 'description', label: 'Description', wide: true },
]

const SERVICE_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Name', required: true, wide: true },
  { key: 'price', label: 'Price (TZS)', required: true, numeric: true },
  { key: 'duration_minutes', label: 'Duration (min)', required: true, numeric: true },
  { key: 'description', label: 'Description', wide: true },
]

// Alternate header spellings a real spreadsheet export or a staff member's
// own CSV is likely to use — matched case-insensitively against these.
const ALIASES: Record<string, string[]> = {
  price: ['price', 'price (tzs)', 'cost'],
  duration_minutes: ['duration_minutes', 'duration', 'duration (min)', 'minutes'],
  is_african_made: ['is_african_made', 'african made', 'african-made', 'local'],
  skin_type: ['skin_type', 'skin type'],
}

type DraftRow = Record<string, string>

function emptyRow(fields: FieldConfig[]): DraftRow {
  const row: DraftRow = {}
  for (const f of fields) row[f.key] = f.boolean ? 'false' : ''
  return row
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

function csvToDraftRows(text: string, fields: FieldConfig[]): DraftRow[] {
  const table = parseCSV(text)
  if (table.length < 2) return []
  const header = table[0].map((h) => h.trim().toLowerCase())
  const colForField: Record<string, number> = {}
  for (const f of fields) {
    const names = ALIASES[f.key] || [f.key]
    const idx = header.findIndex((h) => names.includes(h))
    if (idx !== -1) colForField[f.key] = idx
  }
  return table.slice(1).map((cells) => {
    const row = emptyRow(fields)
    for (const f of fields) {
      const idx = colForField[f.key]
      if (idx === undefined || cells[idx] === undefined) continue
      const raw = cells[idx].trim()
      row[f.key] = f.boolean ? String(['true', 'yes', '1', 'y'].includes(raw.toLowerCase())) : raw
    }
    return row
  })
}

export default function BulkImportModal({
  businessId,
  kind,
  onClose,
  onImported,
}: {
  businessId: string
  kind: Kind
  onClose: () => void
  onImported: (count: number) => void
}) {
  const fields = kind === 'products' ? PRODUCT_FIELDS : SERVICE_FIELDS
  const label = kind === 'products' ? 'products' : 'services'
  const [rows, setRows] = useState<DraftRow[]>([])
  const [mode, setMode] = useState<'csv' | 'photo'>('csv')
  const [pasteText, setPasteText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ row: number; name: string | null; message: string }[]>([])
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const csvFileRef = useRef<HTMLInputElement>(null)
  const photoFileRef = useRef<HTMLInputElement>(null)

  const applyCSV = (text: string) => {
    const parsed = csvToDraftRows(text, fields)
    setRows(parsed)
    setErrors([])
    setImportedCount(null)
  }

  const handleCsvFile = async (file: File) => {
    const text = await file.text()
    setPasteText(text)
    applyCSV(text)
  }

  const handlePhotoFile = async (file: File) => {
    setExtracting(true)
    setErrors([])
    setImportedCount(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post(`/admin/businesses/${businessId}/menu-photo-extract`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const extracted: DraftRow[] = (data.items || []).map((item: Record<string, unknown>) => {
        const row = emptyRow(fields)
        for (const f of fields) {
          const v = item[f.key]
          if (v === undefined || v === null) continue
          row[f.key] = f.boolean ? String(Boolean(v)) : String(v)
        }
        return row
      })
      setRows(extracted)
      if (extracted.length === 0) {
        setErrors([{ row: 0, name: null, message: "Couldn't read any items from that photo — try a clearer photo or use CSV import instead." }])
      }
    } catch (e: any) {
      setErrors([{ row: 0, name: null, message: e?.response?.data?.detail || "Couldn't read that photo" }])
    } finally {
      setExtracting(false)
    }
  }

  const updateCell = (i: number, key: string, value: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  }

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(fields)])
  }

  const submit = async () => {
    if (rows.length === 0) return
    setSubmitting(true)
    setErrors([])
    setImportedCount(null)
    try {
      const items = rows.map((r) => {
        const item: Record<string, unknown> = {}
        for (const f of fields) {
          if (f.numeric) item[f.key] = parseFloat(r[f.key]) || 0
          else if (f.boolean) item[f.key] = r[f.key] === 'true'
          else item[f.key] = r[f.key] || undefined
        }
        return item
      })
      const { data } = await api.post(`/admin/businesses/${businessId}/${kind}/bulk-import`, { items })
      setImportedCount(data.created)
      setErrors(data.errors || [])
      if (data.created > 0) onImported(data.created)
      // Keep only the rows that failed, so staff can fix and resubmit
      // without re-entering everything that already succeeded.
      if (data.errors?.length) {
        const failedIdx = new Set<number>(data.errors.map((e: { row: number }) => e.row - 1))
        setRows((prev) => prev.filter((_, idx) => failedIdx.has(idx)))
      } else {
        setRows([])
      }
    } catch (e: any) {
      setErrors([{ row: 0, name: null, message: e?.response?.data?.detail || 'Import failed' }])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 15, 20, 0.5)' }}>
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ border: '0.5px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Bulk import {label}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Paste a spreadsheet export, upload a CSV, or upload a photo of a printed menu.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4">
          <button
            onClick={() => setMode('csv')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{ background: mode === 'csv' ? 'var(--coral)' : 'var(--slate-light)', color: mode === 'csv' ? 'white' : 'var(--text-secondary)' }}
          >
            <FileUp size={13} /> CSV / paste
          </button>
          <button
            onClick={() => setMode('photo')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            style={{ background: mode === 'photo' ? 'var(--coral)' : 'var(--slate-light)', color: mode === 'photo' ? 'white' : 'var(--text-secondary)' }}
          >
            <ImageIcon size={13} /> Photo of menu
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          {mode === 'csv' && (
            <div className="space-y-3 mb-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Columns expected: {fields.map((f) => f.key).join(', ')} — extra columns are ignored, missing
                optional ones are left blank.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => csvFileRef.current?.click()}
                  className="h-9 px-3 rounded-lg text-xs font-medium border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  Upload .csv file
                </button>
                <input
                  ref={csvFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or paste below</span>
              </div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                onBlur={() => pasteText.trim() && applyCSV(pasteText)}
                rows={5}
                placeholder={`name,price${kind === 'products' ? ',category,brand' : ',duration_minutes'}\nGel Manicure,15000${kind === 'products' ? ',Nails,' : ',45'}`}
                className="w-full rounded-lg border p-3 text-xs font-mono outline-none focus:border-coral"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => applyCSV(pasteText)}
                disabled={!pasteText.trim()}
                className="h-8 px-3 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                style={{ background: 'var(--coral)' }}
              >
                Parse
              </button>
            </div>
          )}

          {mode === 'photo' && (
            <div className="space-y-3 mb-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Upload a clear photo of the business's printed price list or menu — Nira will read the items and
                prices automatically. Review everything below before importing; nothing is saved yet.
              </p>
              <button
                onClick={() => photoFileRef.current?.click()}
                disabled={extracting}
                className="h-9 px-3 rounded-lg text-xs font-medium border flex items-center gap-2 disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                {extracting ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                {extracting ? 'Reading photo…' : 'Upload photo'}
              </button>
              <input
                ref={photoFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhotoFile(e.target.files[0])}
              />
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--slate-light)', borderBottom: '1px solid var(--border)' }}>
                    {fields.map((f) => (
                      <th key={f.key} className="text-left px-3 py-2 text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        {f.label}{f.required && ' *'}
                      </th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {fields.map((f) => (
                        <td key={f.key} className="px-2 py-1.5">
                          {f.boolean ? (
                            <input
                              type="checkbox"
                              checked={row[f.key] === 'true'}
                              onChange={(e) => updateCell(i, f.key, String(e.target.checked))}
                            />
                          ) : (
                            <input
                              value={row[f.key] || ''}
                              onChange={(e) => updateCell(i, f.key, e.target.value)}
                              className={`h-7 px-2 rounded border text-xs outline-none focus:border-coral ${f.wide ? 'w-40' : 'w-24'}`}
                              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                          )}
                        </td>
                      ))}
                      <td>
                        <button onClick={() => removeRow(i)} className="p-1 text-slate-300 hover:text-coral">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={addRow}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium hover:text-coral"
            style={{ color: 'var(--text-muted)' }}
          >
            <Plus size={13} /> Add row
          </button>

          {errors.length > 0 && (
            <div className="mt-4 rounded-lg p-3 text-xs space-y-1" style={{ background: 'var(--coral-light, #FFE8E8)', color: '#B23A3A' }}>
              {errors.map((e, i) => (
                <p key={i}>{e.name ? `${e.name}: ` : e.row ? `Row ${e.row}: ` : ''}{e.message}</p>
              ))}
            </div>
          )}

          {importedCount !== null && importedCount > 0 && (
            <div className="mt-4 rounded-lg p-3 text-xs flex items-center gap-2" style={{ background: 'var(--mint-light, #E4F7F3)', color: 'var(--mint-dark, #0B3B30)' }}>
              <CheckCircle2 size={14} />
              {importedCount} {label} imported.{errors.length > 0 ? ` ${errors.length} row(s) need fixing above.` : ' Done — you can close this.'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Close
          </button>
          <button
            onClick={submit}
            disabled={rows.length === 0 || submitting}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-40 flex items-center gap-2"
            style={{ background: 'var(--coral)' }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Import {rows.length > 0 ? rows.length : ''} {label}
          </button>
        </div>
      </div>
    </div>
  )
}
