import { useMemo } from 'react'
import {
  CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Icon } from './Icons'
import { aiRecommend, trendSeries, trendLegend4 } from '../data'
import { useAppStore, avgScore, SUBJECTS, type Subject } from '../store/useAppStore'

const TIERS = [
  { key: '優秀', color: '#34d399', min: 90 },
  { key: '良好', color: '#22d3ee', min: 80 },
  { key: '普通', color: '#a855f7', min: 70 },
  { key: '待加強', color: '#ec4899', min: 0 },
]

function tierOf(score: number): string {
  return (TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1]).key
}

// 學習成效總覽（donut）
function LearningDonut() {
  const { students, selectedClassId } = useAppStore()
  const { data, overall, total } = useMemo(() => {
    const list = selectedClassId ? students.filter((s) => s.classId === selectedClassId) : students
    const counts: Record<string, number> = { 優秀: 0, 良好: 0, 普通: 0, 待加強: 0 }
    let sum = 0
    list.forEach((s) => { const a = avgScore(s); sum += a; counts[tierOf(a)]++ })
    const total = list.length
    const data = TIERS.map((t) => ({ name: t.key, value: counts[t.key], color: t.color, pct: total ? Math.round((counts[t.key] / total) * 100) : 0 }))
    return { data, overall: total ? Math.round((sum / total) * 10) / 10 : 0, total }
  }, [students, selectedClassId])

  return (
    <div className="panel bracket rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">學習成效總覽</h3>
        <span className="rounded-lg border border-cyan-400/15 bg-ink-800 px-2 py-0.5 text-[10px] text-slate-400">本學期</span>
      </div>
      {total === 0 ? (
        <p className="py-8 text-center text-xs text-slate-400">尚無學生資料</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="relative h-32 w-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={42} outerRadius={58} paddingAngle={3} stroke="none">
                  {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="orbitron text-xl font-extrabold text-white">{overall}%</span>
              <span className="text-[9px] text-slate-400">整體學習成效</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}
                </span>
                <span className="font-semibold text-white">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 班級學習熱圖（科目 × 學生）
function heatColor(score: number): string {
  // 0..100 → 深藍 → 紫 → 粉，飽和度隨分數提高
  const t = Math.max(0, Math.min(1, score / 100))
  const r = Math.round(30 + t * 206)
  const g = Math.round(40 + t * 30)
  const b = Math.round(120 + (1 - t) * 80)
  return `rgb(${r},${g},${b})`
}

function ClassHeatmap() {
  const { students, selectedClassId } = useAppStore()
  const list = useMemo(() => {
    const l = (selectedClassId ? students.filter((s) => s.classId === selectedClassId) : students)
      .slice().sort((a, b) => a.seatNo - b.seatNo)
    return l.slice(0, 30)
  }, [students, selectedClassId])

  return (
    <div className="panel bracket rounded-2xl p-4">
      <h3 className="mb-3 text-sm font-bold text-white">班級學習熱圖</h3>
      {list.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">尚無學生資料</p>
      ) : (
        <div className="space-y-1">
          {SUBJECTS.map((sub: Subject) => (
            <div key={sub} className="flex items-center gap-2">
              <span className="w-12 flex-shrink-0 text-right text-[10px] text-slate-400">{sub}</span>
              <div className="flex flex-1 gap-0.5">
                {list.map((s) => (
                  <div
                    key={s.id}
                    title={`${s.name}・${sub}：${s.subjects[sub]}`}
                    className="h-3.5 flex-1 rounded-[2px]"
                    style={{ background: heatColor(s.subjects[sub] ?? 0) }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-end gap-1 pt-1 text-[9px] text-slate-500">
            低 <span className="h-2 w-10 rounded" style={{ background: 'linear-gradient(90deg,rgb(30,40,200),rgb(236,70,40))' }} /> 高
          </div>
        </div>
      )}
    </div>
  )
}

// 學習趨勢分析（4 線）
function TrendChart4() {
  return (
    <div className="panel bracket rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">學習趨勢分析</h3>
        <span className="rounded-lg border border-cyan-400/15 bg-ink-800 px-2 py-0.5 text-[10px] text-slate-400">本月</span>
      </div>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendSeries} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,211,252,0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'rgba(10,20,48,0.95)', border: '1px solid rgba(61,217,255,0.3)', borderRadius: 12, fontSize: 11, color: '#e2e8f0' }} />
            {trendLegend4.map((l) => (
              <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} strokeWidth={2} dot={false} isAnimationActive />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400">
        {trendLegend4.map((l) => (
          <span key={l.key} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: l.color }} />{l.label}</span>
        ))}
      </div>
    </div>
  )
}

function AIRecommendCard({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="panel bracket rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">AI 推薦</h3>
        <span className="text-[10px] text-cyan-glow">更多 ›</span>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-cyan-400/15 bg-white/[0.02] p-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-violet text-white shadow-glow">
          <Icon name="wand" width={20} height={20} />
        </span>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white">{aiRecommend.title}</h4>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{aiRecommend.desc}</p>
          <button onClick={() => onOpen(aiRecommend.target)} className="mt-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-3 py-1 text-[11px] font-bold text-white shadow-glow transition hover:brightness-110">
            {aiRecommend.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RightRail({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <LearningDonut />
      <ClassHeatmap />
      <TrendChart4 />
      <AIRecommendCard onOpen={onOpen} />
    </div>
  )
}
