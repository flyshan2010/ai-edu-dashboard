import { useMemo } from 'react'
import { Icon } from '../components/Icons'
import { useAppStore, avgScore, subjectAverages, SUBJECTS } from '../store/useAppStore'

export function GradesPage({ onManage }: { onManage: () => void }) {
  const { students, classes, selectedClassId, setSelectedClassId } = useAppStore()

  const list = useMemo(
    () => (selectedClassId ? students.filter((s) => s.classId === selectedClassId) : students),
    [students, selectedClassId],
  )
  const subjAvg = useMemo(() => subjectAverages(list), [list])
  const ranking = useMemo(
    () => list.map((s) => ({ s, avg: Math.round(avgScore(s) * 10) / 10 })).sort((a, b) => b.avg - a.avg),
    [list],
  )

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-violet/20 text-neon-violet"><Icon name="pulse" width={28} height={28} /></span>
          <div>
            <h2 className="text-xl font-bold text-white">成績分析</h2>
            <p className="text-sm text-slate-400">各科平均與學生排名（由學生資料即時計算）</p>
          </div>
        </div>
        <select className="rounded-lg border border-cyan-400/20 bg-ink-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/50" value={selectedClassId ?? 'all'} onChange={(e) => setSelectedClassId(e.target.value === 'all' ? null : e.target.value)}>
          <option value="all">全部班級</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="panel rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-400">尚無學生成績資料。</p>
          <button onClick={onManage} className="mt-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-1.5 text-xs font-bold text-white shadow-glow">前往學生管理</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="panel bracket rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-bold text-white">各科平均（{list.length} 人）</h3>
            <div className="space-y-2.5">
              {SUBJECTS.map((sub) => (
                <div key={sub}>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{sub}</span><span className="font-semibold text-cyan-glow">{subjAvg[sub]}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-cyan" style={{ width: `${subjAvg[sub]}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel bracket rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-white">學生排名</h3>
            <div className="max-h-[360px] space-y-1.5 overflow-y-auto">
              {ranking.map((r, i) => (
                <div key={r.s.id} className="flex items-center gap-3 rounded-lg border border-cyan-400/10 bg-white/[0.02] px-3 py-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i < 3 ? 'bg-gradient-to-br from-neon-amber to-neon-pink text-ink-900' : 'bg-white/5 text-slate-400'}`}>{i + 1}</span>
                  <span className="text-sm text-white">{r.s.name}</span>
                  <span className="text-[11px] text-slate-500">座號 {r.s.seatNo}</span>
                  <span className="ml-auto orbitron font-bold text-cyan-glow">{r.avg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
