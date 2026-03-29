// Patch recharts types for React 19 compatibility
import type { FC } from 'react'

declare module 'recharts' {
  const AreaChart: FC<any>
  const Area: FC<any>
  const BarChart: FC<any>
  const Bar: FC<any>
  const PieChart: FC<any>
  const Pie: FC<any>
  const Cell: FC<any>
  const XAxis: FC<any>
  const YAxis: FC<any>
  const CartesianGrid: FC<any>
  const Tooltip: FC<any>
  const ResponsiveContainer: FC<any>
  const Legend: FC<any>
}
