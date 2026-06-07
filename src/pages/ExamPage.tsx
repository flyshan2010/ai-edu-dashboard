import { useState } from 'react'
import { Icon } from '../components/Icons'
import { FileDrop } from '../components/FileDrop'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'
import { runAI, AIError, type AIBlock } from '../ai/client'
import { parseFiles } from '../ai/files'
import { mdToHtmlBody, downloadDocx, downloadHtml, printToPdf } from '../ai/generate'

const MODES = ['定期評量', '補救教學卷', '隨堂小考']
const SIX = ['學生題目卷', '含題答案卷（教師版）', '題目解析與評分尺規', '配分答案卡總表', '雙向細目表', '命題及審題檢核表']

const SYSTEM = `你是台灣國中小「六合一試卷」命題專家（v3.0 素養導向）。依使用者提供的教材出題，全程繁體中文（台灣用語），符合 108 課綱、崑山國小審題標準（選項無規律、無抄襲、Fact-Check、含 Bloom 分層與迷思概念）。
請輸出單一 Markdown，內含「六合一」六大章節，每章以 ## 開頭：
## 一、學生題目卷
## 二、含題答案卷（教師版）
## 三、題目解析與評分尺規（含後設認知引導）
## 四、配分答案卡總表
## 五、雙向細目表（含認知層次與答題時間預估）
## 六、命題及審題檢核表（崑山國小標準）

【重要規則】
1. 必須**完全依據使用者上傳的教材檔案內容**命題（科目、單元、概念、例子都取自該教材）；嚴禁自行更換主題或杜撰教材中沒有的課文。若上傳的是數學教材就出數學題、自然就出自然題。
2. 先在最前面用一行寫出你判讀到的「教材主題」，確認與檔案一致後再出題。
3. 輸出**純 Markdown**，禁止使用 HTML 標籤或實體（如 &emsp;、&nbsp;、<br>）；需要填答空格用底線「____」或全形空白。
4. 若使用者另提供「範本卷」，請對齊其題型結構、配分與版面。`

export function ExamPage() {
  const toast = useToast()
  const { addResource, resources, aiProvider, aiKey, aiModel, cloudStatus } = useAppStore()
  const [matFiles, setMatFiles] = useState<File[]>([])
  const [tplFiles, setTplFiles] = useState<File[]>([])
  const [f, setF] = useState({ subject: '', grade: '', topic: '', mode: '定期評量' })
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState('')
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const examCount = resources.filter((r) => r.type === '試卷').length

  async function run() {
    if (!matFiles.length && !f.topic.trim()) { toast('請上傳教材檔，或至少填寫主題'); return }
    if (!aiKey) { toast('尚未設定 AI 金鑰，請到「系統管理 → AI 設定」'); return }
    setBusy(true); setOut('')
    try {
      const mat = matFiles.length ? await parseFiles(matFiles) : []
      const tpl = tplFiles.length ? await parseFiles(tplFiles) : []
      const blocks: AIBlock[] = [
        { type: 'text', text: `科目：${f.subject || '（依教材判斷）'}；年段：${f.grade || '（依教材判斷）'}；主題：${f.topic || '（依教材）'}；卷別：${f.mode}。請依下列教材命題：` },
        ...mat.map((p) => p.block),
      ]
      if (!mat.length) blocks.push({ type: 'text', text: `（未提供教材檔，請就主題「${f.topic}」自行取材命題。）` })
      if (tpl.length) { blocks.push({ type: 'text', text: '以下為範本卷，請對齊版面與題型：' }); tpl.forEach((t) => blocks.push(t.block)) }
      const md = await runAI(aiProvider, aiKey, aiModel, SYSTEM, blocks, 8192)
      setOut(md)
      const title = `${f.grade}${f.subject}_${f.topic || '試卷'}_${f.mode}`.replace(/^_+/, '')
      addResource({ title: `${title}_六合一`, type: '試卷', subject: f.subject.trim(), grade: f.grade.trim(), createdAt: Date.now(), content: md, format: 'six-in-one' })
      toast('六合一試卷已生成並存資料庫 ✓')
    } catch (e) {
      toast(e instanceof AIError ? e.message : '生成失敗，請稍後再試')
    } finally { setBusy(false) }
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'
  const title = `${f.grade}${f.subject}_${f.topic || '試卷'}_${f.mode}`.replace(/^_+/, '')

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-violet/20 text-neon-violet"><Icon name="exam" width={28} height={28} /></span>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-white">AI 試題工廠</h2><span className="rounded bg-neon-violet/20 px-2 py-0.5 text-[10px] font-bold text-neon-violet">v3.0</span><span className="rounded-lg border border-cyan-400/15 px-2 py-0.5 text-[10px] text-cyan-glow">已產出 {examCount} 份</span></div>
          <p className="text-sm text-slate-400">上傳教材／範本 → 一鍵產出六合一 → 前台預覽 → Word 存資料庫{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端</span>}</p>
        </div>
      </div>

      {!aiKey && <div className="rounded-xl border border-neon-amber/40 bg-neon-amber/10 px-4 py-2 text-xs text-neon-amber">尚未設定 AI 金鑰：請到「系統管理 → AI 設定」貼上 Anthropic 金鑰。</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">上傳與設定</h3>
          <FileDrop files={matFiles} onFiles={setMatFiles} accept="image/*,.pdf,.docx,.txt,.md" label="上傳命題教材" hint="課本／講義／PDF／Word／圖片（可多檔）" />
          <div className="mt-3"><FileDrop files={tplFiles} onFiles={setTplFiles} accept="image/*,.pdf,.docx,.txt,.md" label="（選用）上傳範本卷" hint="提供後將對齊版面與題型" /></div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">科目</label><input className={input} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="自然科學" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">年段</label><input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="五年級" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">主題</label><input className={input} value={f.topic} onChange={(e) => set('topic', e.target.value)} placeholder="水域環境" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">卷別</label><select className={input} value={f.mode} onChange={(e) => set('mode', e.target.value)}>{MODES.map((m) => <option key={m}>{m}</option>)}</select></div>
          </div>
          <button onClick={run} disabled={busy} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">{busy ? 'AI 命題中…' : '一鍵產出六合一'} <Icon name="sparkles" width={15} height={15} /></button>
          <div className="mt-3 flex flex-wrap gap-1">{SIX.map((s) => <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{s}</span>)}</div>
        </div>

        <div className="panel bracket flex flex-col rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">六合一內容</h3>
            {out && (
              <div className="flex gap-1.5">
                <button onClick={() => downloadDocx(title, out)} className="rounded-lg border border-cyan-400/30 px-2.5 py-1 text-[11px] text-cyan-glow hover:bg-cyan-400/10">Word</button>
                <button onClick={() => downloadHtml(title, out)} className="rounded-lg border border-cyan-400/20 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/5">HTML</button>
                <button onClick={() => printToPdf(title, out)} className="rounded-lg border border-cyan-400/20 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/5">PDF</button>
              </div>
            )}
          </div>
          {out ? (
            <div className="max-h-[460px] overflow-y-auto rounded-xl border border-cyan-400/10 bg-white/[0.02] p-4 text-sm text-slate-200" dangerouslySetInnerHTML={{ __html: mdToHtmlBody(out) }} />
          ) : (
            <div className="grid flex-1 place-items-center py-12 text-center text-xs text-slate-400">{busy ? 'AI 正在命題（六份內容較長，請稍候）…' : '上傳教材並按「一鍵產出六合一」，內容會顯示在這裡。'}</div>
          )}
        </div>
      </div>
    </div>
  )
}
