import { useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { radarData } from '../data'

type Series = 'both' | 'classAvg' | 'myClass'

const legend: { key: Exclude<Series, 'both'>; label: string; color: string }[] = [
  { key: 'classAvg', label: '全班平均', color: '#22d3ee' },
  { key: 'myClass', label: '我的班級', color: '#a855f7' },
]

export function RadarPanel() {
  const [series, setSeries] = useState<Series>('both')

  return (
    <div className="panel bracket flex flex-col rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">學生學科能力雷達圖</h3>
        <select
          className="rounded-lg border border-cyan-400/20 bg-ink-800 px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-cyan-400/50"
          defaultValue="all"
          onChange={() => {}}
        >
          <option value="all">選擇班級</option>
          <option value="5a">五年甲班</option>
          <option value="5b">五年乙班</option>
        </select>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid stroke="rgba(125,211,252,0.18)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            {(series === 'both' || series === 'classAvg') && (
              <Radar
                name="全班平均"
                dataKey="classAvg"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.25}
                strokeWidth={2}
                isAnimationActive
              />
            )}
            {(series === 'both' || series === 'myClass') && (
              <Radar
                name="我的班級"
                dataKey="myClass"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.3}
                strokeWidth={2}
                isAnimationActive
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive legend / filter */}
      <div className="mt-1 flex items-center justify-center gap-4">
        {legend.map((l) => {
          const visible = series === 'both' || series === l.key
          return (
            <button
              key={l.key}
              onClick={() => setSeries((cur) => (cur === l.key ? 'both' : l.key))}
              className={`flex items-center gap-1.5 text-xs transition ${
                visible ? 'text-slate-200' : 'text-slate-600'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full transition"
                style={{ background: visible ? l.color : '#334155' }}
              />
              {l.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
