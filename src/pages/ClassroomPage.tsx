import { useMemo, useState } from 'react'
import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

interface Assignment {
  id: number
  title: string
  due: string
}

let aSeq = 0

export function ClassroomPage({ onManage }: { onManage: () => void }) {
  const toast = useToast()
  const { classes, students, selectedClassId, setSelectedClassId } = useAppStore()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  const roster = useMemo(
    () => students.filter((s) => s.classId === selectedClassId).sort((a, b) => a.seatNo - b.seatNo),
    [students, selectedClassId],
  )
  const activeClass = classes.find((c) => c.id === selectedClassId)

  function post() {
    if (!title.trim()) {
      toast('請輸入作業名稱')
      return
    }
    aSeq += 1
    setAssignments((prev) => [{ id: aSeq, title: title.trim(), due: due || '未定' }, ...prev])
    setTitle('')
    setDue('')
    toast(`已布置作業給 ${roster.length} 位學生`)
  }

  const inputCls =
    'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-green/20 text-neon-green">
            <Icon name="board" width={28} height={28} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">課堂管理系統</h2>
            <p className="text-sm text-slate-400">班級點名、作業布置與成績管理</p>
          </div>
        </div>
        <select
          className="rounded-lg border border-cyan-400/20 bg-ink-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
          value={selectedClassId ?? ''}
          onChange={(e) => setSelectedClassId(e.target.value || null)}
        >
          <option value="">選擇班級</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!activeClass ? (
        <div className="panel rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-400">請先選擇班級，或</p>
          <button onClick={onManage} className="mt-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-1.5 text-xs font-bold text-white shadow-glow">前往學生管理建立班級</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
          {/* 作業布置 */}
          <div className="panel bracket rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-white">布置作業</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] text-slate-400">作業名稱</label>
                <input className={inputCls} value={title} placeholder="例：水域環境學習單" onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-400">截止日</label>
                <input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
              <button onClick={post} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">
                布置給 {roster.length} 位學生 <Icon name="arrow" width={15} height={15} />
              </button>
            </div>

            {assignments.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-cyan-400/10 pt-3">
                <p className="text-[11px] text-slate-400">已布置</p>
                {assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-cyan-400/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-200">
                    <span>{a.title}</span>
                    <span className="text-[11px] text-slate-500">截止 {a.due}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 點名 / 名單 */}
          <div className="panel bracket rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-white">班級點名（{roster.length} 人）</h3>
            {roster.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">此班級尚無學生。</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {roster.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg border border-cyan-400/10 bg-white/[0.02] px-3 py-2 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/15 text-[11px] text-cyan-glow">{s.seatNo}</span>
                    <span className="text-slate-200">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
