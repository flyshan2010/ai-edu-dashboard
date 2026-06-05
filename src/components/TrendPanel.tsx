import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { trendData30, trendData7, trendData90, type TrendPoint } from '../data'

const ranges: { id: string; label: string; data: TrendPoint[] }[] = [
  { id: '7', label: '近 7 天', data: trendData7 },
  { id: '30', label: '近 30 天', data: trendData30 },
  { id: '90', label: '近 90 天', data: trendData90 },
]

export function TrendPanel() {
  const [range, setRange] = useState('30')
  const data = ranges.find((r) => r.id === range)!.data

  return (
    <div className="panel bracket rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">學習趨勢分析</h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-lg border border-cyan-400/20 bg-ink-800 px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-cyan-400/50"
        >
          {ranges.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,211,252,0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,20,48,0.95)',
                border: '1px solid rgba(61,217,255,0.3)',
                borderRadius: 12,
                fontSize: 12,
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#7dd3fc' }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              name="學習時數"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#gHours)"
              isAnimationActive
            />
            <Area
              type="monotone"
              dataKey="completion"
              name="完成作業數"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#gComp)"
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neon-cyan" />學習時數
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neon-violet" />完成作業數
        </span>
      </div>
    </div>
  )
}
