import { useState } from 'react'
import { Icon } from '../components/Icons'
import { FileDrop } from '../components/FileDrop'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'
import { ask, AIError, type AIBlock } from '../ai/anthropic'
import { parseFiles } from '../ai/files'
import { mdToHtmlBody, downloadDocx, downloadHtml, printToPdf } from '../ai/generate'

const GENRES = ['自動判斷', '記敘文', '說明文', '議論文', '應用文', '詩歌', '看圖作文']

const SYSTEM = `你是台灣國小作文批改專家。請以繁體中文（台灣用語）批改學生作文，輸出 Markdown 報告，結構如下：
# 作文批改報告
- 第一段請列：題目、文體、學生（若未知可標「自動判斷」）、**等第**（優／甲上／甲／乙上／乙）
## 五面向評分
逐項給星等與說明：立意取材、結構組織、遣詞造句、錯字與格式、整體表現
## 優點
## 待改進與修辭建議
## 範例改寫（節錄）
## 給學生的鼓勵
若使用者另提供「批改範本/範文」，請嚴格對齊其評分標準與格式。務必在某一行明確寫出「等第：X」。`

export function EssayPage() {
  const toast = useToast()
  const { essayReviews, addEssayReview, removeEssayReview, addResource, aiKey, aiModel, cloudStatus } = useAppStore()
  const [essayFiles, setEssayFiles] = useState<File[]>([])
  const [tplFiles, setTplFiles] = useState<File[]>([])
  const [meta, setMeta] = useState({ title: '', studentName: '', genre: '自動判斷' })
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState('')

  const set = (k: string, v: string) => setMeta((s) => ({ ...s, [k]: v }))

  async function run() {
    if (!essayFiles.length) { toast('請先上傳作文檔（圖片／PDF／Word／文字）'); return }
    if (!aiKey) { toast('尚未設定 AI 金鑰，請到「系統管理 → AI 設定」'); return }
    setBusy(true); setReport('')
    try {
      const parsed = await parseFiles(essayFiles)
      const tpl = tplFiles.length ? await parseFiles(tplFiles) : []
      const blocks: AIBlock[] = [
        { type: 'text', text: `請批改以下作文。題目：${meta.title || '（請自行判斷）'}；指定文體：${meta.genre}；學生：${meta.studentName || '未提供'}。` },
        ...parsed.map((p) => p.block),
      ]
      if (tpl.length) {
        blocks.push({ type: 'text', text: '以下為批改範本/範文，請依此標準與格式批改：' })
        tpl.forEach((t) => blocks.push(t.block))
      }
      const md = await ask(aiKey, aiModel, SYSTEM, blocks, 4096)
      setReport(md)
      const level = (md.match(/等第[：:]\s*([^\s，。\n]+)/) || [])[1] ?? '—'
      const title = meta.title.trim() || essayFiles[0].name.replace(/\.[^.]+$/, '')
      addEssayReview({ title, genre: meta.genre === '自動判斷' ? '自動判斷' : meta.genre, studentName: meta.studentName.trim() || '匿名', gradeLevel: level, scoreSummary: 'AI 批改（見報告）', createdAt: Date.now() })
      addResource({ title: `${title}_批改報告`, type: '批改報告', subject: '', grade: '', createdAt: Date.now(), content: md, format: 'docx' })
      toast('批改完成，報告已存資料庫 ✓')
    } catch (e) {
      toast(e instanceof AIError ? e.message : '批改失敗，請稍後再試')
    } finally {
      setBusy(false)
    }
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'
  const title = meta.title.trim() || '作文批改報告'

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
          <p className="text-sm text-slate-400">上傳作文（圖／PDF／Word）→ 一鍵 AI 批改 → 前台預覽 → Word 報告存資料庫{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端</span>}</p>
        </div>
      </div>

      {!aiKey && <div className="rounded-xl border border-neon-amber/40 bg-neon-amber/10 px-4 py-2 text-xs text-neon-amber">尚未設定 AI 金鑰：請到「系統管理 → AI 設定」貼上 Anthropic 金鑰才能啟用真實批改。</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">上傳與設定</h3>
          <FileDrop files={essayFiles} onFiles={setEssayFiles} accept="image/*,.pdf,.docx,.txt,.md" label="上傳作文檔" hint="支援 圖片 / PDF / Word / 文字（可多檔）" />
          <div className="mt-3"><FileDrop files={tplFiles} onFiles={setTplFiles} accept="image/*,.pdf,.docx,.txt,.md" label="（選用）上傳批改範本／範文" hint="提供後將依此標準對齊批改" /></div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">題目（選填）</label><input className={input} value={meta.title} onChange={(e) => set('title', e.target.value)} placeholder="自動判斷" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">學生姓名（選填）</label><input className={input} value={meta.studentName} onChange={(e) => set('studentName', e.target.value)} placeholder="王小華" /></div>
          </div>
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">文體</label>
          <select className={input} value={meta.genre} onChange={(e) => set('genre', e.target.value)}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select>
          <button onClick={run} disabled={busy} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">
            {busy ? 'AI 批改中…' : '一鍵 AI 批改'} <Icon name="sparkles" width={15} height={15} />
          </button>
        </div>

        <div className="panel bracket flex flex-col rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">批改報告</h3>
            {report && (
              <div className="flex gap-1.5">
                <button onClick={() => downloadDocx(title, report)} className="rounded-lg border border-cyan-400/30 px-2.5 py-1 text-[11px] text-cyan-glow hover:bg-cyan-400/10">Word</button>
                <button onClick={() => downloadHtml(title, report)} className="rounded-lg border border-cyan-400/20 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/5">HTML</button>
                <button onClick={() => printToPdf(title, report)} className="rounded-lg border border-cyan-400/20 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/5">PDF</button>
              </div>
            )}
          </div>
          {report ? (
            <div className="prose-report max-h-[460px] overflow-y-auto rounded-xl border border-cyan-400/10 bg-white/[0.02] p-4 text-sm text-slate-200" dangerouslySetInnerHTML={{ __html: mdToHtmlBody(report) }} />
          ) : (
            <div className="grid flex-1 place-items-center py-12 text-center text-xs text-slate-400">{busy ? 'AI 正在批改，請稍候…' : '上傳作文並按「一鍵 AI 批改」，報告會顯示在這裡。'}</div>
          )}
        </div>
      </div>

      <div className="panel bracket rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-bold text-white">批改記錄（{essayReviews.length}）</h3>
        {essayReviews.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">尚無批改記錄。</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {essayReviews.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
                <span className="text-sm font-semibold text-white">{r.title}</span>
                <span className="rounded bg-neon-pink/20 px-1.5 py-0.5 text-[10px] text-neon-pink">{r.gradeLevel}</span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{r.genre}</span>
                <span className="text-[11px] text-slate-500">{r.studentName}</span>
                <button onClick={() => { removeEssayReview(r.id); toast('已刪除記錄') }} className="ml-auto text-[11px] text-neon-pink hover:underline">刪除</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
