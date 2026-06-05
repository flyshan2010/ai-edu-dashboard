import { useState } from 'react'
import { statCards } from '../data'
import { Icon } from './Icons'

const ranges = ['本日', '本週', '本月'] as const

export function StatsPanel() {
  const [range, setRange] = useState<(typeof ranges)[number]>('本週')

  return (
    <div className="panel bracket rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">班級學習狀況總覽</h3>
        <div className="flex rounded-lg border border-cyan-400/15 bg-ink-800 p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-[11px] transition ${
                range === r ? 'bg-cyan-400/20 text-cyan-glow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div
            key={s.id}
            className="panel-hover group relative overflow-hidden rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ background: `${s.color}22`, color: s.color }}
              >
                <Icon name={s.icon} width={16} height={16} />
              </span>
              <span className="text-[11px] text-slate-400">{s.label}</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="orbitron text-2xl font-extrabold text-white">{s.value}</span>
              <span className="mb-1 text-[11px] text-slate-400">{s.unit}</span>
            </div>
            <div
              className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
                s.trend === 'up' ? 'text-neon-green' : 'text-neon-pink'
              }`}
            >
              <span>{s.trend === 'up' ? '↑' : '↓'}</span>
              {s.delta}
            </div>
            <span
              className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-xl transition-opacity group-hover:opacity-40"
              style={{ background: s.color }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
