import { useState } from 'react'
import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

const SIX = [
  '學生題目卷.docx', '含題答案卷_教師版.docx', '題目解析與尺規卷.docx',
  '配分答案卡總表.xlsx', '雙向細目表.xlsx', '命題及審題檢核表.docx',
]
const TYPES = ['選擇題', '填充題', '問答題', '素養題']
const BLOOMS = ['記憶', '理解', '應用', '分析', '評鑑', '創造']

export function ExamPage() {
  const toast = useToast()
  const { examQuestions, addExamQuestion, removeExamQuestion, cloudStatus } = useAppStore()
  const [f, setF] = useState({ subject: '', grade: '', topic: '', type: '選擇題', bloom: '理解', stem: '' })
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))

  function add() {
    if (!f.subject.trim() || !f.stem.trim()) { toast('請填寫科目與題幹'); return }
    addExamQuestion({ ...f, createdAt: Date.now() })
    toast('題目已加入題庫（雲端）')
    setF((s) => ({ ...s, topic: '', stem: '' }))
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-violet/20 text-neon-violet"><Icon name="exam" width={28} height={28} /></span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI 試題工廠</h2>
            <span className="rounded bg-neon-violet/20 px-2 py-0.5 text-[10px] font-bold text-neon-violet">v3.0</span>
            <span className="rounded-lg border border-cyan-400/15 px-2 py-0.5 text-[10px] text-cyan-glow">題庫量 {examQuestions.length} 題</span>
          </div>
          <p className="text-sm text-slate-400">素養導向命題，一鍵產出六合一試卷包（題庫存 Firestore 雲端）</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 命題表單 */}
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">新增題目到題庫</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">科目</label><input className={input} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="自然科學" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">年段</label><input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="五年級" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">主題</label><input className={input} value={f.topic} onChange={(e) => set('topic', e.target.value)} placeholder="水域環境" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">題型</label><select className={input} value={f.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">Bloom 層次</label><select className={input} value={f.bloom} onChange={(e) => set('bloom', e.target.value)}>{BLOOMS.map((b) => <option key={b}>{b}</option>)}</select></div>
          </div>
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">題幹</label>
          <textarea rows={3} className={input} value={f.stem} onChange={(e) => set('stem', e.target.value)} placeholder="輸入題目內容…" />
          <button onClick={add} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">
            加入題庫 <Icon name="arrow" width={15} height={15} />
          </button>
          <div className="mt-4 rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
            <p className="mb-1 text-[11px] font-semibold text-slate-300">六合一試卷包輸出</p>
            <div className="flex flex-wrap gap-1">
              {SIX.map((s) => <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{s}</span>)}
            </div>
          </div>
        </div>

        {/* 題庫列表 */}
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">題庫（{examQuestions.length}）{cloudStatus === 'cloud' && <span className="ml-1 text-[10px] text-neon-green">● 雲端同步</span>}</h3>
          {examQuestions.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">題庫為空，從左側新增第一題。</p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {examQuestions.map((q) => (
                <div key={q.id} className="rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                    <span className="rounded bg-neon-violet/20 px-1.5 py-0.5 text-neon-violet">{q.type}</span>
                    <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-cyan-glow">{q.bloom}</span>
                    <span className="text-slate-500">{q.subject} {q.grade} {q.topic}</span>
                    <button onClick={() => { removeExamQuestion(q.id); toast('已刪除題目') }} className="ml-auto text-neon-pink hover:underline">刪除</button>
                  </div>
                  <p className="text-xs text-slate-200">{q.stem}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
