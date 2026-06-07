import { useState } from 'react'
import { Icon } from '../components/Icons'
import { FileDrop } from '../components/FileDrop'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'
import { runAI, parseJSON, AIError, type AIBlock } from '../ai/client'
import { parseFiles } from '../ai/files'
import { mdToHtmlBody, downloadDocx, downloadXlsx, printToPdf } from '../ai/generate'

const MODES = ['定期評量', '補救教學卷', '隨堂小考']

interface ExamPack {
  subject: string; grade: string; topic: string; examName: string
  studentPaper: string; teacherPaper: string; analysis: string; checklist: string
  scoreCard: (string | number)[][]; blueprint: (string | number)[][]
}

const SYSTEM = `你是台灣國中小六合一試卷命題專家（v3.0 素養導向，108 課綱、崑山國小審題標準）。
【最重要】必須**完全依據使用者上傳的教材檔案內容**命題；若上傳的是數學就出數學、自然就出自然，嚴禁更換主題或杜撰教材沒有的課文。若另上傳「範本卷」，題型結構、大題編號、配分與題數要對齊範本。
全程繁體中文（台灣用語）。各份文件用純 Markdown（# 大標、## 大題、- 條列），**禁止 HTML 標籤或實體**（如 &emsp;、&nbsp;、<br>），填答空格用底線「____」。
只輸出一個 JSON 物件（不要任何說明、不要 \`\`\`），結構：
{
 "subject":"科目","grade":"年段","topic":"判讀到的教材主題","examName":"卷名",
 "studentPaper":"完整學生題目卷 Markdown（含各大題、題目、配分；不含答案）",
 "teacherPaper":"教師版 Markdown（同題目，每題標出標準答案）",
 "analysis":"逐題解析與評分尺規 Markdown（含後設認知引導）",
 "checklist":"命題及審題檢核表 Markdown（崑山國小標準，勾選項）",
 "scoreCard":[["題號","題型","配分","正解"],["1","選擇","2","B"]],
 "blueprint":[["題型","題數","配分","Bloom 層次","預估時間(分)"],["選擇","10","20","記憶/理解","10"]]
}`

export function ExamPage() {
  const toast = useToast()
  const { addResource, resources, aiProvider, aiKey, aiModel, cloudStatus } = useAppStore()
  const [matFiles, setMatFiles] = useState<File[]>([])
  const [tplFiles, setTplFiles] = useState<File[]>([])
  const [f, setF] = useState({ subject: '', grade: '', topic: '', mode: '定期評量' })
  const [busy, setBusy] = useState(false)
  const [pack, setPack] = useState<ExamPack | null>(null)
  const [tab, setTab] = useState<'student' | 'teacher' | 'analysis' | 'checklist'>('student')
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const examCount = resources.filter((r) => r.type === '試卷').length

  async function run() {
    if (!matFiles.length && !f.topic.trim()) { toast('請上傳教材檔，或至少填寫主題'); return }
    if (!aiKey) { toast('尚未設定 AI 金鑰，請到「系統管理 → AI 設定」'); return }
    setBusy(true); setPack(null)
    try {
      const mat = matFiles.length ? await parseFiles(matFiles) : []
      const tpl = tplFiles.length ? await parseFiles(tplFiles) : []
      const blocks: AIBlock[] = [
        { type: 'text', text: `科目：${f.subject || '（依教材判斷）'}；年段：${f.grade || '（依教材判斷）'}；主題：${f.topic || '（依教材）'}；卷別：${f.mode}。請依下列教材命題：` },
        ...mat.map((p) => p.block),
      ]
      if (!mat.length) blocks.push({ type: 'text', text: `（未提供教材檔，請就主題「${f.topic}」自行取材命題。）` })
      if (tpl.length) { blocks.push({ type: 'text', text: '以下為「範本卷」，請對齊其大題結構、題型、配分與題數：' }); tpl.forEach((t) => blocks.push(t.block)) }
      const text = await runAI(aiProvider, aiKey, aiModel, SYSTEM, blocks, 8192, true)
      const json = parseJSON<ExamPack>(text)
      if (!json || !json.studentPaper) { toast('解析失敗，請重試或換模型（gemini-2.5-flash）'); return }
      setPack(json)
      const base = `${json.grade || f.grade}${json.subject || f.subject}_${json.topic || f.topic || '試卷'}_${f.mode}`.replace(/^_+/, '')
      // 六份分開存資料庫
      addResource({ title: `${base}_學生題目卷`, type: '試卷', subject: json.subject, grade: json.grade, createdAt: Date.now(), content: json.studentPaper, format: 'docx' })
      addResource({ title: `${base}_教師答案卷`, type: '試卷', subject: json.subject, grade: json.grade, createdAt: Date.now(), content: json.teacherPaper, format: 'docx' })
      addResource({ title: `${base}_解析尺規卷`, type: '試卷', subject: json.subject, grade: json.grade, createdAt: Date.now(), content: json.analysis, format: 'docx' })
      addResource({ title: `${base}_命題審題檢核表`, type: '試卷', subject: json.subject, grade: json.grade, createdAt: Date.now(), content: json.checklist, format: 'docx' })
      toast('六合一試卷已生成（6 檔）並存資料庫 ✓')
    } catch (e) {
      toast(e instanceof AIError ? e.message : '生成失敗，請稍後再試')
    } finally { setBusy(false) }
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'
  const base = pack ? `${pack.grade}${pack.subject}_${pack.topic || '試卷'}_${f.mode}`.replace(/^_+/, '') : '試卷'

  const files = pack ? [
    { name: '學生題目卷', kind: 'docx' as const, run: () => downloadDocx(`${base}_學生題目卷`, pack.studentPaper) },
    { name: '教師答案卷', kind: 'docx' as const, run: () => downloadDocx(`${base}_教師答案卷`, pack.teacherPaper) },
    { name: '解析尺規卷', kind: 'docx' as const, run: () => downloadDocx(`${base}_解析尺規卷`, pack.analysis) },
    { name: '配分答案卡', kind: 'xlsx' as const, run: () => downloadXlsx(`${base}_配分答案卡`, [{ name: '配分答案卡', aoa: pack.scoreCard }]) },
    { name: '雙向細目表', kind: 'xlsx' as const, run: () => downloadXlsx(`${base}_雙向細目表`, [{ name: '雙向細目表', aoa: pack.blueprint }]) },
    { name: '命題審題檢核表', kind: 'docx' as const, run: () => downloadDocx(`${base}_命題審題檢核表`, pack.checklist) },
  ] : []

  const previewMd = pack ? { student: pack.studentPaper, teacher: pack.teacherPaper, analysis: pack.analysis, checklist: pack.checklist }[tab] : ''

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-violet/20 text-neon-violet"><Icon name="exam" width={28} height={28} /></span>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-white">AI 試題工廠</h2><span className="rounded bg-neon-violet/20 px-2 py-0.5 text-[10px] font-bold text-neon-violet">v3.0</span><span className="rounded-lg border border-cyan-400/15 px-2 py-0.5 text-[10px] text-cyan-glow">資料庫試卷 {examCount} 份</span></div>
          <p className="text-sm text-slate-400">上傳教材／範本 → 一鍵產出「六個分開檔案」（4 Word＋2 Excel）→ 前台預覽 → 存資料庫{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端</span>}</p>
        </div>
      </div>

      {!aiKey && <div className="rounded-xl border border-neon-amber/40 bg-neon-amber/10 px-4 py-2 text-xs text-neon-amber">尚未設定 AI 金鑰：請到「系統管理 → AI 設定」。</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">上傳與設定</h3>
          <FileDrop files={matFiles} onFiles={setMatFiles} accept="image/*,.pdf,.docx,.txt,.md" label="上傳命題教材" hint="課本／講義／PDF／Word／圖片（可多檔）" />
          <div className="mt-3"><FileDrop files={tplFiles} onFiles={setTplFiles} accept="image/*,.pdf,.docx,.txt,.md" label="（選用）上傳範本卷" hint="提供後依其大題結構／題型／配分對齊" /></div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">科目</label><input className={input} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="自然科學" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">年段</label><input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="五年級" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">主題</label><input className={input} value={f.topic} onChange={(e) => set('topic', e.target.value)} placeholder="水域環境" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">卷別</label><select className={input} value={f.mode} onChange={(e) => set('mode', e.target.value)}>{MODES.map((m) => <option key={m}>{m}</option>)}</select></div>
          </div>
          <button onClick={run} disabled={busy} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">{busy ? 'AI 命題中（六份內容較長）…' : '一鍵產出六合一（6 檔）'} <Icon name="sparkles" width={15} height={15} /></button>

          {pack && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-slate-300">下載六個檔案</p>
              <div className="grid grid-cols-2 gap-2">
                {files.map((file) => (
                  <button key={file.name} onClick={file.run} className="flex items-center justify-between rounded-lg border border-cyan-400/20 bg-white/[0.02] px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/5">
                    <span className="flex items-center gap-1.5"><Icon name={file.kind === 'xlsx' ? 'grid' : 'doc'} width={14} height={14} className="text-cyan-glow" />{file.name}</span>
                    <span className="rounded bg-white/5 px-1.5 text-[10px] uppercase text-slate-400">{file.kind}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel bracket flex flex-col rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">預覽</h3>
          {pack ? (
            <>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {([['student', '學生卷'], ['teacher', '教師卷'], ['analysis', '解析卷'], ['checklist', '檢核表']] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setTab(k)} className={`rounded-lg border px-2.5 py-1 text-[11px] ${tab === k ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-glow' : 'border-cyan-400/15 text-slate-400'}`}>{label}</button>
                ))}
              </div>
              <div className="max-h-[420px] overflow-y-auto rounded-xl border border-cyan-400/10 bg-white/[0.02] p-4 text-sm text-slate-200" dangerouslySetInnerHTML={{ __html: mdToHtmlBody(previewMd) }} />
              <button onClick={() => printToPdf(`${base}_${tab}`, previewMd)} className="mt-2 self-end rounded-lg border border-cyan-400/20 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/5">列印此頁 PDF</button>
            </>
          ) : (
            <div className="grid flex-1 place-items-center py-12 text-center text-xs text-slate-400">{busy ? 'AI 正在命題，請稍候…' : '上傳教材並按「一鍵產出六合一」，預覽與下載會出現在這裡。'}</div>
          )}
        </div>
      </div>
    </div>
  )
}
