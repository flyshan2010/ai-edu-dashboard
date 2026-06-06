import { useMemo, useState } from 'react'
import { Icon, type IconName } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

const TYPES = ['簡報', '資訊圖卡', '影片', 'Podcast', '試卷', '批改報告']
const TYPE_ICON: Record<string, IconName> = {
  簡報: 'ppt', 資訊圖卡: 'grid', 影片: 'video', Podcast: 'mic', 試卷: 'exam', 批改報告: 'pen',
}

export function LibraryPage() {
  const toast = useToast()
  const { resources, addResource, removeResource, cloudStatus } = useAppStore()
  const [f, setF] = useState({ title: '', type: '簡報', subject: '', grade: '' })
  const [kw, setKw] = useState('')
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  const filtered = useMemo(() => {
    const q = kw.trim()
    return resources.filter((r) => !q || `${r.title}${r.subject}${r.grade}${r.type}`.includes(q))
  }, [resources, kw])

  function add() {
    if (!f.title.trim()) { toast('請輸入資源標題'); return }
    addResource({ title: f.title.trim(), type: f.type, subject: f.subject.trim(), grade: f.grade.trim(), createdAt: Date.now() })
    toast('資源已加入資源庫')
    setF((s) => ({ ...s, title: '' }))
  }

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-cyan/20 text-neon-cyan"><Icon name="book" width={28} height={28} /></span>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">教學資源庫</h2>
          <p className="text-sm text-slate-400">集中管理簡報、影片、試卷與批改報告{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端同步</span>}</p>
        </div>
        <span className="rounded-lg border border-cyan-400/15 px-3 py-1 text-xs text-cyan-glow">{resources.length} 筆資源</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.5fr]">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">新增資源</h3>
          <label className="mb-1 block text-[11px] text-slate-400">標題</label>
          <input className={input} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="水域環境教學簡報" />
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">類型</label>
          <select className={input} value={f.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">科目</label><input className={input} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="自然科學" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">年段</label><input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="五年級" /></div>
          </div>
          <button onClick={add} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">加入資源庫 <Icon name="arrow" width={15} height={15} /></button>
        </div>

        <div className="panel bracket rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">資源清單（{filtered.length}）</h3>
            <div className="relative">
              <Icon name="search" width={14} height={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜尋…" className="w-40 rounded-lg border border-cyan-400/15 bg-ink-800 py-1.5 pl-8 pr-2 text-xs text-slate-200 outline-none focus:border-cyan-400/50" />
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">{resources.length === 0 ? '資源庫為空。可在「教學套件生成」生成或於左側新增。' : '查無符合的資源'}</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filtered.map((r) => (
                <div key={r.id} className="flex items-start gap-2 rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-glow"><Icon name={TYPE_ICON[r.type] ?? 'doc'} width={16} height={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{r.title}</p>
                    <p className="text-[11px] text-slate-400">{r.type} · {r.subject || '—'} {r.grade}</p>
                  </div>
                  <button onClick={() => { removeResource(r.id); toast('已刪除資源') }} className="text-[11px] text-neon-pink hover:underline">刪除</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
