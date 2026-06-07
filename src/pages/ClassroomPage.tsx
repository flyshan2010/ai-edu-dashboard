import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore, type Student } from '../store/useAppStore'

type Tab = 'score' | 'draw' | 'timer' | 'group' | 'duty'
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'score', label: '計分榜', icon: 'crown' },
  { id: 'draw', label: '隨機抽籤', icon: 'sparkles' },
  { id: 'timer', label: '計時器', icon: 'clock' },
  { id: 'group', label: '隨機分組', icon: 'users' },
  { id: 'duty', label: '值日生', icon: 'board' },
]

const pts = (s: Student) => s.points ?? 0

export function ClassroomPage({ onManage }: { onManage: () => void }) {
  const toast = useToast()
  const { classes, students, selectedClassId, setSelectedClassId, updateStudent } = useAppStore()
  const [tab, setTab] = useState<Tab>('score')

  const roster = useMemo(
    () => students.filter((s) => s.classId === selectedClassId).sort((a, b) => a.seatNo - b.seatNo),
    [students, selectedClassId],
  )
  const activeClass = classes.find((c) => c.id === selectedClassId)

  const adjust = (s: Student, d: number) => updateStudent(s.id, { points: Math.max(0, pts(s) + d) })

  return (
    <div className="space-y-5">
      <div className="panel bracket flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-amber/20 text-neon-amber"><Icon name="crown" width={28} height={28} /></span>
          <div><h2 className="text-xl font-bold text-white">AI 班級經營中心</h2><p className="text-sm text-slate-400">代幣積分 · 隨機抽籤 · 計時器 · 分組 · 值日生</p></div>
        </div>
        <select className="rounded-lg border border-cyan-400/20 bg-ink-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400/50" value={selectedClassId ?? ''} onChange={(e) => setSelectedClassId(e.target.value || null)}>
          <option value="">選擇班級</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!activeClass ? (
        <div className="panel rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-400">請先選擇班級，或</p>
          <button onClick={onManage} className="mt-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-1.5 text-xs font-bold text-white shadow-glow">前往學生管理建立班級</button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm transition ${tab === t.id ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-glow' : 'border-cyan-400/15 bg-white/[0.02] text-slate-300 hover:border-cyan-400/30'}`}>
                <Icon name={t.icon} width={16} height={16} />{t.label}
              </button>
            ))}
          </div>

          {tab === 'score' && <ScoreBoard roster={roster} adjust={adjust} />}
          {tab === 'draw' && <DrawTab roster={roster} onReward={(s) => { adjust(s, 1); toast(`${s.name} +1 代幣`) }} />}
          {tab === 'timer' && <TimerTab />}
          {tab === 'group' && <GroupTab roster={roster} />}
          {tab === 'duty' && <DutyTab roster={roster} />}
        </>
      )}
    </div>
  )
}

function ScoreBoard({ roster, adjust }: { roster: Student[]; adjust: (s: Student, d: number) => void }) {
  const ranked = [...roster].sort((a, b) => pts(b) - pts(a))
  if (!roster.length) return <Empty text="此班級尚無學生。" />
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="panel bracket rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold text-white">代幣計分（點按加減）</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {roster.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl border border-cyan-400/10 bg-white/[0.02] p-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/15 text-[11px] text-cyan-glow">{s.seatNo}</span>
              <span className="flex-1 text-sm text-white">{s.name}</span>
              <button onClick={() => adjust(s, -1)} className="grid h-6 w-6 place-items-center rounded-md bg-neon-pink/15 text-neon-pink hover:bg-neon-pink/25">−</button>
              <span className="orbitron w-8 text-center text-sm font-bold text-neon-amber">{pts(s)}</span>
              <button onClick={() => adjust(s, 1)} className="grid h-6 w-6 place-items-center rounded-md bg-neon-green/15 text-neon-green hover:bg-neon-green/25">＋</button>
              <button onClick={() => adjust(s, 5)} className="rounded-md bg-cyan-400/15 px-1.5 text-[11px] text-cyan-glow hover:bg-cyan-400/25">+5</button>
            </div>
          ))}
        </div>
      </div>
      <div className="panel bracket rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold text-white">排行榜</h3>
        <div className="space-y-1.5">
          {ranked.slice(0, 12).map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-cyan-400/10 bg-white/[0.02] px-3 py-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${i < 3 ? 'bg-gradient-to-br from-neon-amber to-neon-pink text-ink-900' : 'bg-white/5 text-slate-400'}`}>{i + 1}</span>
              <span className="flex-1 text-sm text-white">{s.name}</span>
              <span className="orbitron font-bold text-neon-amber">{pts(s)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DrawTab({ roster, onReward }: { roster: Student[]; onReward: (s: Student) => void }) {
  const [picked, setPicked] = useState<Student | null>(null)
  const [rolling, setRolling] = useState(false)
  const [noRepeat, setNoRepeat] = useState(true)
  const [drawn, setDrawn] = useState<Set<string>>(new Set())
  const timer = useRef<number | null>(null)

  function draw() {
    const pool = noRepeat ? roster.filter((s) => !drawn.has(s.id)) : roster
    if (!pool.length) { setPicked(null); return }
    setRolling(true)
    let n = 0
    if (timer.current) clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      setPicked(pool[Math.floor(Math.random() * pool.length)])
      if (++n > 12) {
        if (timer.current) clearInterval(timer.current)
        const final = pool[Math.floor(Math.random() * pool.length)]
        setPicked(final); setRolling(false)
        if (noRepeat) setDrawn((p) => new Set(p).add(final.id))
      }
    }, 70)
  }
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  if (!roster.length) return <Empty text="此班級尚無學生。" />
  return (
    <div className="panel bracket rounded-2xl p-6 text-center">
      <div className="mx-auto mb-4 grid h-40 w-full max-w-md place-items-center rounded-2xl border border-cyan-400/20 bg-ink-800">
        <span className={`orbitron text-4xl font-extrabold ${rolling ? 'text-slate-400' : 'text-cyan-glow neon-text'}`}>{picked ? picked.name : '？'}</span>
        {picked && !rolling && <span className="text-xs text-slate-400">座號 {picked.seatNo}</span>}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button onClick={draw} disabled={rolling} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-6 py-2.5 text-sm font-bold text-white shadow-glow disabled:opacity-50">{rolling ? '抽籤中…' : '抽一位'}</button>
        {picked && !rolling && <button onClick={() => onReward(picked)} className="rounded-lg border border-neon-green/40 px-4 py-2.5 text-sm text-neon-green hover:bg-neon-green/10">給 +1 代幣</button>}
      </div>
      <label className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
        <input type="checkbox" checked={noRepeat} onChange={(e) => setNoRepeat(e.target.checked)} /> 抽過不重複（已抽 {drawn.size}/{roster.length}）
        <button onClick={() => setDrawn(new Set())} className="ml-2 text-cyan-glow hover:underline">重置</button>
      </label>
    </div>
  )
}

function TimerTab() {
  const [secs, setSecs] = useState(300)
  const [left, setLeft] = useState(300)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((l) => { if (l <= 1) { window.clearInterval(id); setRunning(false); return 0 } return l - 1 }), 1000)
    return () => window.clearInterval(id)
  }, [running])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const setPreset = (s: number) => { setSecs(s); setLeft(s); setRunning(false) }
  return (
    <div className="panel bracket rounded-2xl p-6 text-center">
      <div className={`orbitron mb-4 text-7xl font-extrabold ${left === 0 ? 'text-neon-pink' : 'text-cyan-glow neon-text'}`}>{mm}:{ss}</div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {[60, 180, 300, 600].map((s) => <button key={s} onClick={() => setPreset(s)} className="rounded-lg border border-cyan-400/20 px-3 py-1 text-xs text-slate-300 hover:border-cyan-400/40">{s / 60} 分</button>)}
        <input type="number" min={1} className="w-20 rounded-lg border border-cyan-400/15 bg-ink-800 px-2 py-1 text-sm text-slate-100" value={Math.round(secs / 60)} onChange={(e) => setPreset(Math.max(1, Number(e.target.value) || 1) * 60)} />
        <span className="text-xs text-slate-400">分</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setRunning((r) => !r)} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-6 py-2.5 text-sm font-bold text-white shadow-glow">{running ? '暫停' : '開始'}</button>
        <button onClick={() => { setLeft(secs); setRunning(false) }} className="rounded-lg border border-cyan-400/20 px-4 py-2.5 text-sm text-slate-300 hover:border-cyan-400/40">重置</button>
      </div>
    </div>
  )
}

function GroupTab({ roster }: { roster: Student[] }) {
  const [n, setN] = useState(4)
  const [groups, setGroups] = useState<Student[][]>([])
  function make() {
    const shuffled = [...roster].sort(() => Math.random() - 0.5)
    const g: Student[][] = Array.from({ length: n }, () => [])
    shuffled.forEach((s, i) => g[i % n].push(s))
    setGroups(g)
  }
  if (!roster.length) return <Empty text="此班級尚無學生。" />
  return (
    <div className="panel bracket rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-slate-300">分成</span>
        <input type="number" min={2} max={Math.max(2, roster.length)} className="w-16 rounded-lg border border-cyan-400/15 bg-ink-800 px-2 py-1 text-sm text-slate-100" value={n} onChange={(e) => setN(Math.max(2, Number(e.target.value) || 2))} />
        <span className="text-sm text-slate-300">組</span>
        <button onClick={make} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-bold text-white shadow-glow">隨機分組</button>
      </div>
      {groups.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <div key={i} className="rounded-xl border border-cyan-400/15 bg-white/[0.02] p-3">
              <p className="mb-2 text-sm font-bold text-cyan-glow">第 {i + 1} 組（{g.length}）</p>
              <div className="flex flex-wrap gap-1.5">{g.map((s) => <span key={s.id} className="rounded-lg bg-white/5 px-2 py-0.5 text-xs text-slate-200">{s.name}</span>)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DutyTab({ roster }: { roster: Student[] }) {
  const [count, setCount] = useState(3)
  const [duty, setDuty] = useState<Student[]>([])
  function pick() { setDuty([...roster].sort(() => Math.random() - 0.5).slice(0, count)) }
  if (!roster.length) return <Empty text="此班級尚無學生。" />
  return (
    <div className="panel bracket rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-slate-300">指派</span>
        <input type="number" min={1} max={roster.length} className="w-16 rounded-lg border border-cyan-400/15 bg-ink-800 px-2 py-1 text-sm text-slate-100" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} />
        <span className="text-sm text-slate-300">位值日生</span>
        <button onClick={pick} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-bold text-white shadow-glow">隨機指派</button>
      </div>
      {duty.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {duty.map((s) => <span key={s.id} className="flex items-center gap-1.5 rounded-xl border border-neon-amber/40 bg-neon-amber/10 px-3 py-1.5 text-sm text-neon-amber"><Icon name="board" width={14} height={14} />{s.name}</span>)}
        </div>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="panel rounded-2xl p-10 text-center text-xs text-slate-400">{text}</div>
}
