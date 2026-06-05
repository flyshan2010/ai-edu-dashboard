import { useMemo, useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { Icon } from './Icons'
import { useAppStore, subjectAverages, SUBJECTS } from '../store/useAppStore'

type Series = 'both' | 'classAvg' | 'myClass'

const legend: { key: Exclude<Series, 'both'>; label: string; color: string }[] = [
  { key: 'classAvg', label: '全校平均', color: '#22d3ee' },
  { key: 'myClass', label: '本班', color: '#a855f7' },
]

export function RadarPanel({ onManage }: { onManage: () => void }) {
  const { students, classes, selectedClassId, setSelectedClassId } = useAppStore()
  const [series, setSeries] = useState<Series>('both')

  const { data, hasData } = useMemo(() => {
    const clsStudents = selectedClassId
      ? students.filter((s) => s.classId === selectedClassId)
      : students
    const all = subjectAverages(students)
    const mine = subjectAverages(clsStudents)
    const data = SUBJECTS.map((sub) => ({ subject: sub, classAvg: all[sub], myClass: mine[sub] }))
    return { data, hasData: clsStudents.length > 0 }
  }, [students, selectedClassId])

  return (
    <div className="panel bracket flex flex-col rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">學生學科能力雷達圖</h3>
        <select
          className="max-w-[140px] rounded-lg border border-cyan-400/20 bg-ink-800 px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-cyan-400/50"
          value={selectedClassId ?? 'all'}
          onChange={(e) => setSelectedClassId(e.target.value === 'all' ? null : e.target.value)}
        >
          <option value="all">全部班級</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!hasData ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-cyan-400/20 text-center">
          <Icon name="chart" width={26} height={26} className="text-slate-500" />
          <p className="text-xs text-slate-400">尚無學生成績資料</p>
          <button onClick={onManage} className="text-xs text-cyan-glow hover:underline">
            前往學生管理輸入成績 →
          </button>
        </div>
      ) : (
        <>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="rgba(125,211,252,0.18)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                {(series === 'both' || series === 'classAvg') && (
                  <Radar name="全校平均" dataKey="classAvg" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} strokeWidth={2} isAnimationActive />
                )}
                {(series === 'both' || series === 'myClass') && (
                  <Radar name="本班" dataKey="myClass" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} strokeWidth={2} isAnimationActive />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-1 flex items-center justify-center gap-4">
            {legend.map((l) => {
              const visible = series === 'both' || series === l.key
              return (
                <button
                  key={l.key}
                  onClick={() => setSeries((cur) => (cur === l.key ? 'both' : l.key))}
                  className={`flex items-center gap-1.5 text-xs transition ${visible ? 'text-slate-200' : 'text-slate-600'}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full transition" style={{ background: visible ? l.color : '#334155' }} />
                  {l.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
