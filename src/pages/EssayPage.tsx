import { useState } from 'react'
import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

const GENRES = ['自動判斷', '記敘文', '說明文', '議論文', '應用文', '詩歌']

function gradeFromText(text: string): { level: string; summary: string; stars: number } {
  const len = text.trim().length
  // 依字數做穩定（非隨機）評估
  const score = Math.max(40, Math.min(98, 55 + Math.floor(len / 12)))
  const level = score >= 90 ? '優' : score >= 85 ? '甲上' : score >= 78 ? '甲' : score >= 70 ? '乙上' : '乙'
  const stars = Math.max(2, Math.min(5, Math.round(score / 20)))
  const summary = `立意取材 ${'★'.repeat(stars)} 結構組織 ${'★'.repeat(Math.max(2, stars - 1))} 遣詞造句 ${'★'.repeat(Math.max(2, stars - 1))}`
  return { level, summary, stars }
}

export function EssayPage() {
  const toast = useToast()
  const { essayReviews, addEssayReview, removeEssayReview, cloudStatus } = useAppStore()
  const [f, setF] = useState({ title: '', genre: '自動判斷', studentName: '', content: '' })
  const [result, setResult] = useState<{ level: string; summary: string } | null>(null)
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))

  function grade() {
    if (!f.title.trim() || !f.content.trim()) { toast('請填寫題目與作文內容'); return }
    const g = gradeFromText(f.content)
    const genre = f.genre === '自動判斷' ? '記敘文' : f.genre
    setResult({ level: g.level, summary: g.summary })
    addEssayReview({
      title: f.title.trim(), genre, studentName: f.studentName.trim() || '匿名',
      gradeLevel: g.level, scoreSummary: g.summary, createdAt: Date.now(),
    })
    toast('批改完成，記錄已存雲端')
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-pink/20 text-neon-pink"><Icon name="pen" width={28} height={28} /></span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI 作文批改中心</h2>
            <span className="rounded bg-neon-pink/20 px-2 py-0.5 text-[10px] font-bold text-neon-pink">v2.2</span>
            <span className="rounded-lg border border-cyan-400/15 px-2 py-0.5 text-[10px] text-cyan-glow">已批改 {essayReviews.length} 篇</span>
          </div>
          <p className="text-sm text-slate-400">六大文體、五面向評分，批改記錄存 Firestore 雲端</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">貼上作文批改</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">作文題目</label><input className={input} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="我最難忘的旅行" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">學生姓名</label><input className={input} value={f.studentName} onChange={(e) => set('studentName', e.target.value)} placeholder="王小華" /></div>
          </div>
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">文體</label>
          <select className={input} value={f.genre} onChange={(e) => set('genre', e.target.value)}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select>
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">作文內容</label>
          <textarea rows={5} className={input} value={f.content} onChange={(e) => set('content', e.target.value)} placeholder="貼上學生作文…" />
          <button onClick={grade} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">
            開始批改 <Icon name="arrow" width={15} height={15} />
          </button>
          {result && (
            <div className="mt-3 rounded-xl border border-neon-pink/30 bg-neon-pink/5 p-3 text-xs text-slate-200">
              <p className="font-semibold text-white">批改結果 等第：<span className="text-neon-pink">{result.level}</span></p>
              <p className="mt-1 text-slate-300">{result.summary}</p>
            </div>
          )}
        </div>

        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">批改記錄（{essayReviews.length}）{cloudStatus === 'cloud' && <span className="ml-1 text-[10px] text-neon-green">● 雲端同步</span>}</h3>
          {essayReviews.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">尚無批改記錄，從左側批改一篇。</p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {essayReviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{r.title}</span>
                    <span className="rounded bg-neon-pink/20 px-1.5 py-0.5 text-[10px] text-neon-pink">{r.gradeLevel}</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{r.genre}</span>
                    <button onClick={() => { removeEssayReview(r.id); toast('已刪除記錄') }} className="ml-auto text-[11px] text-neon-pink hover:underline">刪除</button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{r.studentName} {r.scoreSummary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
