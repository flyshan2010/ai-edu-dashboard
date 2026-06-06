import { useState } from 'react'
import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

export function CoursesPage() {
  const toast = useToast()
  const { courses, addCourse, removeCourse, cloudStatus } = useAppStore()
  const [f, setF] = useState({ name: '', grade: '', unit: '', progress: '0' })
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  function add() {
    if (!f.name.trim()) { toast('請輸入課程名稱'); return }
    addCourse({ name: f.name.trim(), grade: f.grade.trim(), unit: f.unit.trim(), progress: Math.max(0, Math.min(100, Number(f.progress) || 0)), createdAt: Date.now() })
    toast('課程已建立')
    setF({ name: '', grade: '', unit: '', progress: '0' })
  }

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-blue/20 text-neon-blue"><Icon name="doc" width={28} height={28} /></span>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">我的課程</h2>
          <p className="text-sm text-slate-400">建立與管理課程、單元與教學進度{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端同步</span>}</p>
        </div>
        <span className="rounded-lg border border-cyan-400/15 px-3 py-1 text-xs text-cyan-glow">{courses.length} 門課程</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">新建課程</h3>
          <label className="mb-1 block text-[11px] text-slate-400">課程名稱</label>
          <input className={input} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="五年級自然" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">年段</label><input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="五年級" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">單元</label><input className={input} value={f.unit} onChange={(e) => set('unit', e.target.value)} placeholder="水域環境" /></div>
          </div>
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">教學進度（%）</label>
          <input className={input} value={f.progress} inputMode="numeric" onChange={(e) => set('progress', e.target.value)} />
          <button onClick={add} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">建立課程 <Icon name="arrow" width={15} height={15} /></button>
        </div>

        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">課程清單</h3>
          {courses.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">尚無課程，從左側建立第一門課。</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <Icon name="doc" width={16} height={16} className="text-neon-blue" />
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <span className="text-[11px] text-slate-400">{c.grade} · {c.unit || '未分單元'}</span>
                    <button onClick={() => { removeCourse(c.id); toast('已刪除課程') }} className="ml-auto text-[11px] text-neon-pink hover:underline">刪除</button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-cyan" style={{ width: `${c.progress}%` }} /></div>
                    <span className="text-[11px] text-slate-400">{c.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
