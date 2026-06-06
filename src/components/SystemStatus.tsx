import { systemStats } from '../data'

export function SystemStatus() {
  return (
    <div className="panel bracket rounded-2xl p-3.5">
      <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-white">
        <span className="h-3 w-1 rounded-full bg-cyan-glow shadow-glow" />
        系統狀態
      </h4>
      <div className="space-y-2.5">
        {systemStats.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                {s.label}
              </span>
              <span className="font-semibold" style={{ color: s.color }}>{s.value}</span>
            </div>
            {s.pct != null && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
