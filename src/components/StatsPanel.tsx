import { useMemo } from 'react'
import { Icon, type IconName } from './Icons'
import { useAppStore, summarize } from '../store/useAppStore'

interface CardDef {
  id: string
  label: string
  value: string
  unit: string
  delta: string | null
  trend: 'up' | 'down'
  icon: IconName
  color: string
}

export function StatsPanel({ onManage }: { onManage: () => void }) {
  const { students, classes, selectedClassId } = useAppStore()

  const { cards, hasData, className } = useMemo(() => {
    const clsStudents = selectedClassId
      ? students.filter((s) => s.classId === selectedClassId)
      : students
    const sel = summarize(clsStudents)
    const global = summarize(students)
    const cls = classes.find((c) => c.id === selectedClassId)

    const perStudent = sel.count ? sel.totalHours / sel.count : 0
    const globalPerStudent = global.count ? global.totalHours / global.count : 0

    const fmtDelta = (a: number, b: number, suffix: string) => {
      if (!b) return null
      const d = a - b
      return `${d >= 0 ? '+' : ''}${Math.round(d * 10) / 10}${suffix}`
    }

    const cards: CardDef[] = [
      {
        id: 'hours', label: '學習總時數', value: sel.totalHours.toLocaleString('en-US'), unit: '小時',
        delta: fmtDelta(perStudent, globalPerStudent, ' /人'),
        trend: perStudent >= globalPerStudent ? 'up' : 'down', icon: 'clock', color: '#22d3ee',
      },
      {
        id: 'completion', label: '完成作業率', value: String(sel.avgCompletion), unit: '%',
        delta: fmtDelta(sel.avgCompletion, global.avgCompletion, '%'),
        trend: sel.avgCompletion >= global.avgCompletion ? 'up' : 'down', icon: 'check', color: '#34d399',
      },
      {
        id: 'score', label: '平均成績', value: String(sel.avgScore), unit: '分',
        delta: fmtDelta(sel.avgScore, global.avgScore, '分'),
        trend: sel.avgScore >= global.avgScore ? 'up' : 'down', icon: 'star', color: '#a855f7',
      },
      {
        id: 'activity', label: '學生活躍度', value: String(sel.avgActivity), unit: '%',
        delta: fmtDelta(sel.avgActivity, global.avgActivity, '%'),
        trend: sel.avgActivity >= global.avgActivity ? 'up' : 'down', icon: 'pulse', color: '#fbbf24',
      },
    ]
    return { cards, hasData: clsStudents.length > 0, className: cls?.name ?? '全部班級' }
  }, [students, classes, selectedClassId])

  return (
    <div className="panel bracket rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">班級學習狀況總覽</h3>
        <span className="rounded-lg border border-cyan-400/15 bg-ink-800 px-2.5 py-1 text-[11px] text-cyan-glow">
          {className}
        </span>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-cyan-400/20 px-4 py-8 text-center">
          <Icon name="users" width={28} height={28} className="text-slate-500" />
          <p className="text-xs text-slate-400">此班級尚無學生資料，無法計算總覽。</p>
          <button
            onClick={onManage}
            className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-1.5 text-xs font-bold text-white shadow-glow transition hover:brightness-110"
          >
            前往學生管理建立名單
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((s) => (
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
              {s.delta && (
                <div
                  className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
                    s.trend === 'up' ? 'text-neon-green' : 'text-neon-pink'
                  }`}
                >
                  <span>{s.trend === 'up' ? '↑' : '↓'}</span>
                  {s.delta}
                  <span className="text-slate-500">對全校</span>
                </div>
              )}
              <span
                className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-xl transition-opacity group-hover:opacity-40"
                style={{ background: s.color }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
