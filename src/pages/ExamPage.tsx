import { useState } from 'react'
import { Icon } from '../components/Icons'
import { FileDrop } from '../components/FileDrop'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'
import { runAI, parseJSON, AIError, type AIBlock } from '../ai/client'
import { parseFiles } from '../ai/files'
import { mdToHtmlBody, downloadDocx, downloadXlsx, printToPdf } from '../ai/generate'

const MODES = ['定期評量', '補救教學卷', '隨堂小考']
const GROUND = '【規則】必須完全依使用者上傳的教材命題，嚴禁更換主題或杜撰教材沒有的內容；全程繁體中文（台灣用語）；輸出純 Markdown（# 標題、## 大題、- 條列），禁止 HTML 標籤或實體（如 &emsp;、&nbsp;、<br>），填答空格用底線「____」。'

interface ExamPack {
  studentPaper: string; teacherPaper: string; analysis: string; checklist: string
  scoreCard: (string | number)[][]; blueprint: (string | number)[][]
}

export function ExamPage() {
  const toast = useToast()
  const { addResource, resources, aiProvider, aiKey, aiModel, cloudStatus } = useAppStore()
  const [matFiles, setMatFiles] = useState<File[]>([])
  const [tplFiles, setTplFiles] = useState<File[]>([])
  const [f, setF] = useState({ subject: '', grade: '', topic: '', mode: '定期評量' })
  const [step, setStep] = useState('')
  const [pack, setPack] = useState<ExamPack | null>(null)
  const [tab, setTab] = useState<'student' | 'teacher' | 'analysis' | 'checklist'>('student')
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const examCount = resources.filter((r) => r.type === '試卷').length
  const busy = step !== ''

  async function run() {
    if (!matFiles.length && !f.topic.trim()) { toast('請上傳教材檔，或至少填寫主題'); return }
    if (!aiKey) { toast('尚未設定 AI 金鑰，請到「系統管理 → AI 設定」'); return }
    setStep('讀取教材'); setPack(null)
    const ai = (sys: string, blocks: AIBlock[], max: number, json = false) => runAI(aiProvider, aiKey, aiModel, sys, blocks, max, json)
    try {
      const mat = matFiles.length ? (await parseFiles(matFiles)).map((p) => p.block) : []
      const tpl = tplFiles.length ? (await parseFiles(tplFiles)).map((p) => p.block) : []
      const head = `科目：${f.subject || '依教材判斷'}；年段：${f.grade || '依教材判斷'}；主題：${f.topic || '依教材'}；卷別：${f.mode}。`
      const matMsg = (instr: string): AIBlock[] => {
        const b: AIBlock[] = [{ type: 'text', text: head + instr + GROUND }, ...mat]
        if (!mat.length) b.push({ type: 'text', text: `（未提供教材檔，請就主題「${f.topic}」自行取材。）` })
        if (tpl.length) { b.push({ type: 'text', text: '以下為「範本卷」，請對齊其大題結構、題型、配分與題數：' }); b.push(...tpl) }
        return b
      }

      setStep('① 學生題目卷')
      const studentPaper = await ai('你是台灣國中小六合一試卷命題專家（108 課綱、崑山國小審題標準、素養導向）。請先在最前面寫一行「教材主題：…」確認與教材一致，再產出「學生題目卷」Markdown：含各大題（一、二、三…）、題目與每大題配分；不含答案。', matMsg('請產出學生題目卷。'), 4096)

      setStep('② 教師答案卷')
      const teacherPaper = await ai('你是命題專家。依下方「學生題目卷」，逐題標出標準答案，輸出教師版 Markdown（保留題目，於每題後標【答案】）。' + GROUND, [{ type: 'text', text: '學生題目卷如下：\n\n' + studentPaper }], 4096)

      setStep('③ 解析與評分尺規')
      const analysis = await ai('你是命題專家。依下方學生題目卷，輸出「逐題解析與評分尺規」Markdown（含解題思路、迷思澄清、問答題評分尺規、後設認知引導）。' + GROUND, [{ type: 'text', text: '學生題目卷如下：\n\n' + studentPaper }], 4096)

      setStep('④ 配分卡與雙向細目表')
      const tablesText = await ai('依下方學生題目卷整理表格，只輸出 JSON：{"scoreCard":[["題號","題型","配分","正解"],...逐題],"blueprint":[["題型","題數","配分","Bloom 層次","預估時間(分)"],...各題型一列]}。', [{ type: 'text', text: studentPaper }], 2048, true)
      const tables = parseJSON<{ scoreCard: (string | number)[][]; blueprint: (string | number)[][] }>(tablesText)

      setStep('⑤ 命題審題檢核表')
      const checklist = await ai('你是命題專家。輸出「命題及審題檢核表」Markdown（依崑山國小審題標準，逐項為可勾選「□ 項目」：課綱對齊、選項無規律、Fact-Check、配分合計、難易分布、繁中用語等）。', matMsg('請產出命題及審題檢核表。'), 1536)

      const result: ExamPack = {
        studentPaper, teacherPaper, analysis, checklist,
        scoreCard: tables?.scoreCard?.length ? tables.scoreCard : [['題號', '題型', '配分', '正解']],
        blueprint: tables?.blueprint?.length ? tables.blueprint : [['題型', '題數', '配分', 'Bloom 層次', '預估時間(分)']],
      }
      setPack(result)
      const base = `${f.grade}${f.subject}_${f.topic || '試卷'}_${f.mode}`.replace(/^_+/, '')
      addResource({ title: `${base}_學生題目卷`, type: '試卷', subject: f.subject, grade: f.grade, createdAt: Date.now(), content: studentPaper, format: 'docx' })
      addResource({ title: `${base}_教師答案卷`, type: '試卷', subject: f.subject, grade: f.grade, createdAt: Date.now(), content: teacherPaper, format: 'docx' })
      addResource({ title: `${base}_解析尺規卷`, type: '試卷', subject: f.subject, grade: f.grade, createdAt: Date.now(), content: analysis, format: 'docx' })
      addResource({ title: `${base}_命題審題檢核表`, type: '試卷', subject: f.subject, grade: f.grade, createdAt: Date.now(), content: checklist, format: 'docx' })
      toast('六合一試卷已生成（6 檔）並存資料庫 ✓')
    } catch (e) {
      toast(e instanceof AIError ? e.message : '生成失敗，請稍後再試')
    } finally { setStep('') }
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'
  const base = `${f.grade}${f.subject}_${f.topic || '試卷'}_${f.mode}`.replace(/^_+/, '')
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
          <p className="text-sm text-slate-400">上傳教材／範本 → 逐檔產出「六個分開檔案」（4 Word＋2 Excel）→ 前台預覽 → 存資料庫{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端</span>}</p>
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
          <button onClick={run} disabled={busy} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">{busy ? `生成中：${step}…` : '一鍵產出六合一（6 檔）'} <Icon name="sparkles" width={15} height={15} /></button>

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
            <div className="grid flex-1 place-items-center py-12 text-center text-xs text-slate-400">{busy ? `AI 正在產出：${step}…（共 5 步）` : '上傳教材並按「一鍵產出六合一」，預覽與下載會出現在這裡。'}</div>
          )}
        </div>
      </div>
    </div>
  )
}
