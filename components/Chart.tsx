// @ts-nocheck — recharts not yet typed for React 19
'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#FF6B6B', '#B8A9E0', '#6BCFB8', '#F59E0B', '#64748B']

interface ChartProps {
  data: Record<string, unknown>[]
  type: 'area' | 'bar' | 'pie'
  dataKey: string
  xKey?: string
  nameKey?: string
  color?: string
  height?: number
}

export default function Chart({
  data, type, dataKey, xKey = 'date', nameKey = 'name',
  color = '#FF6B6B', height = 240,
}: ChartProps) {
  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94A3B8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
